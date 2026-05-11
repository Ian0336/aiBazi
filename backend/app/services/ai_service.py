"""AI analysis service.

Pipeline:
  Profile (DB row)
    → BaziCalculator.calculate_bazi(...)            # produces full chart dict
    → format_profile_to_prompt(profile, chart)      # → SAMPLE_PROMPT-style text
    → POST NV NIM /v1/chat/completions stream=true
    → re-emit normalised SSE to our frontend
    → write ai_analyses row at end (status='completed' | 'failed')

SSE protocol emitted to the frontend:

  event: ttft         data: {"latency_ms": 1585}
  event: content      data: {"text": "..."}
  event: reasoning    data: {"text": "..."}
  event: done         data: {"finish_reason": "stop", "prompt_tokens": ..., "completion_tokens": ..., "latency_ms": ...}
  event: error        data: {"message": "..."}

The system prompt is copied verbatim from scripts/test_nim.py so this matches
the prompt the user has already validated against multiple models.
"""

from __future__ import annotations

import json
import time
from collections.abc import AsyncGenerator
from datetime import datetime, timezone
from typing import Any
from uuid import UUID

import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.ai_analysis import AIAnalysis
from app.models.profile import Profile

SYSTEM_PROMPT = """你是一位精通子平命學的命理大師，分析時以下列三大古籍為理論依據：
- 《子平真詮釋義》（沈孝瞻）— 格局論、用神配置之根本
- 《窮通寶鑑》（余春台）— 月令調候、寒暖燥濕之需
- 《滴天髓》（任鐵樵注）— 五行氣勢、清濁旺衰、體用源流

使用者會給你一組命盤資料，請進行專業而有洞察力的分析，須依下列面向逐一展開。

## 一、正格判定（依《子平真詮》）
- 依月令本氣或所透藏干，判定八正格之一（食神／傷官／正偏財／正官／七殺／正偏印）。
- 說明成格／破格、有無救應。
- **明確指出以下三者**：
  - **格局用神**（月令所透或本氣，是格局的核心）
  - **相神**（輔助格局用神、護衛格局的關鍵字）
  - **忌神**（破壞格局的字）
- 此處所論「用神」專指《子平真詮》之格局用神，與後續調候、體用不同。

## 二、世局氣勢（依《滴天髓》＋《窮通寶鑑》）
本項分兩部分論述，各自獨立：

### （一）依《窮通寶鑑》論調候用神
- 說明該日主生於該月所需的調候條件（例如：二月戊土「先用丙火，次用癸水」）。
- 指出命盤中調候用神是否到位、由何字擔當；若不夠，缺什麼、有何補救或隱憂。

### （二）依《滴天髓》論體用、清濁、寒暖
- **體用**：以日主為體，論全局最重要的「體用」為何字（即全局氣勢所繫，可能與格局用神或調候用神不同）。
- **清濁**：命局氣勢是否清純？有無官殺混、食傷擾、財印戰等濁氣？
- **寒暖**：整體氣候是否中和？過寒過暖如何影響性情與運勢？
- 本項不受第一項「格局用神」定義限制，可獨立判斷。

## 三、神煞
- 擇要列出重要神煞（如貴人、桃花、華蓋、羊刃、空亡、將星、學堂等）。
- 結合格局與十神判斷實際作用力道，不流於吉凶名詞的羅列。
- 說明神煞是加強還是減弱該柱十神的力量，以及對性格、事件的具體影響。

## 四、性格、事業、財運
- 基於日主與十神配置，論天賦傾向、處事風格。
- 事業適性：適合的產業、職位類型、工作模式（穩定受僱／專業技術／創業等）。
- 財運大方向：正財為主或偏財可圖？財星與官、印、食傷的互動關係。

## 五、此命格值得注意之處
- 特殊組合、罕見格局、潛藏隱憂、刑沖會合、空亡夾拱。
- 大運流年中即將出現的關鍵轉折節點（如換大運、某五行得勢或受制）。
- 特別提醒任何容易忽略的暗藏結構（如地支暗合、七殺攻身無制、梟神奪食等）。

## 六、近 5 年大運流年提醒
- 結合上述所有判斷，給出具體年份（西元）的吉凶傾向與應對方向。
- 每年說明：主要事件傾向（學業／事業／財運／感情／健康）、宜與忌。
- 若流年與大運、原局形成特殊組合（如三合、六沖、天剋地沖），須明確指出。

## 寫作要求
- 全文使用繁體中文。
- 條理清晰、深入而不堆砌術語；必要時引用古籍，用《》書名號標明，並簡述該書相關義理。
- 避免空泛吉祥話、避免使用「您」這種商業客套。
- 若命盤資料不足以判斷某一項時，明說「資訊不足」，不要硬掰。
- 每一項之間宜有簡短銜接，避免跳躍過大。"""


# ────────────────────────────── prompt formatter ──────────────────────────────


def _hidden_stems_str(items: list[dict[str, Any]] | None) -> str:
    """Format a list of hidden stems into 'X(十神), Y(十神), ...' style."""
    if not items:
        return "-"
    parts: list[str] = []
    for it in items:
        gan = it.get("gan", "?")
        ten = it.get("ten_deity", "?")
        parts.append(f"{gan}({ten})")
    return ", ".join(parts)


def _list_str(items: list[str] | None) -> str:
    if not items:
        return "-"
    return ", ".join(items)


def _pillar_line(label: str, p: dict[str, Any]) -> str:
    return (
        f"- {label} | 干支={p['ganzhi']} | 天干={p['gan']} | 地支={p['zhi']} | "
        f"天干十神={p.get('ten_deity', '-')} | 地支十神={p.get('zhi_ten_deity', '-')} | "
        f"藏干={_hidden_stems_str(p.get('hidden_stems'))} | "
        f"納音={p.get('nayin', '-')} | 神煞={_list_str(p.get('shensha'))}"
    )


def _dayun_pillar_line(p: dict[str, Any]) -> str:
    return (
        f"- 目前大運 | 干支={p['ganzhi']} | 天干={p['gan']} | 地支={p['zhi']} | "
        f"天干十神={p.get('gan_ten_deity', '-')} | 地支十神={p.get('zhi_ten_deity', '-')} | "
        f"藏干={_hidden_stems_str(p.get('hidden_stems'))} | "
        f"納音={p.get('nayin', '-')} | 神煞={_list_str(p.get('shensha'))}"
    )


def _liunian_pillar_line(p: dict[str, Any]) -> str:
    return (
        f"- 目前流年 | 年份={p.get('year')} | 歲數={p.get('age')} | "
        f"干支={p['ganzhi']} | 天干={p['gan']} | 地支={p['zhi']} | "
        f"天干十神={p.get('gan_ten_deity', '-')} | 地支十神={p.get('zhi_ten_deity', '-')} | "
        f"藏干={_hidden_stems_str(p.get('hidden_stems'))} | "
        f"納音={p.get('nayin', '-')} | 神煞={_list_str(p.get('shensha'))}"
    )


def _dayun_entry_line(idx: int, e: dict[str, Any]) -> str:
    start = e.get("start_age", 0)
    end_age = start + 9
    return (
        f"- 大運_{idx} | 起始歲數={start} | 年份區間=- | "
        f"干支={e['ganzhi']} | 天干={e['gan']} | 地支={e['zhi']} | "
        f"天干十神={e.get('gan_ten_deity', '-')} | 地支十神={e.get('zhi_ten_deity', '-')} | "
        f"藏干={_hidden_stems_str(e.get('hidden_stems'))} | "
        f"地支關係={_list_str(e.get('zhi_relationships'))} | "
        f"納音={e.get('nayin', '-')} | "
        f"特殊組合={_list_str(e.get('special_combinations'))} | "
        f"是否空亡={'true' if e.get('is_empty') else 'false'} | "
        f"是否重複={'true' if e.get('is_repeated') else 'false'}"
    )


def _liunian_entry_line(idx: int, e: dict[str, Any]) -> str:
    return (
        f"- 流年_{idx} | 年份={e.get('year')} | 歲數={e.get('age')} | "
        f"干支={e['ganzhi']} | 天干={e['gan']} | 地支={e['zhi']} | "
        f"天干十神={e.get('gan_ten_deity', '-')} | 地支十神={e.get('zhi_ten_deity', '-')} | "
        f"藏干={_hidden_stems_str(e.get('hidden_stems'))} | "
        f"地支關係={_list_str(e.get('zhi_relationships'))} | "
        f"納音={e.get('nayin', '-')} | "
        f"特殊組合={_list_str(e.get('special_combinations'))} | "
        f"特殊格局={_list_str(e.get('special_patterns'))} | "
        f"是否空亡={'true' if e.get('is_empty') else 'false'} | "
        f"是否重複={'true' if e.get('is_repeated') else 'false'}"
    )


def format_profile_to_prompt(profile: Profile, chart: dict[str, Any]) -> str:
    """Turn a Profile + BaziCalculator result into the structured prompt text."""
    lines: list[str] = []
    lines.append("# 八字命盤資料")
    lines.append("")
    lines.append("## 基本資料")
    lines.append(
        f"- 國曆={chart.get('solar_date') or f'{profile.birth_year}年{profile.birth_month}月{profile.birth_day}日'}"
    )
    if chart.get("lunar_date"):
        lines.append(f"- 農曆={chart['lunar_date']}")
    lines.append(f"- 性別={'男' if profile.gender == 'male' else '女'}")
    lines.append(f"- 出生時辰={profile.birth_hour:02d}:00")
    if profile.location:
        lines.append(f"- 出生地={profile.location}")

    lines.append("")
    lines.append("## 四柱")
    lines.append(_pillar_line("時柱", chart["hour_pillar"]))
    lines.append(_pillar_line("日柱", chart["day_pillar"]))
    lines.append(_pillar_line("月柱", chart["month_pillar"]))
    lines.append(_pillar_line("年柱", chart["year_pillar"]))

    lines.append("")
    lines.append("## 目前運勢")
    if chart.get("dayun_pillar"):
        lines.append(_dayun_pillar_line(chart["dayun_pillar"]))
    if chart.get("liunian_pillar"):
        lines.append(_liunian_pillar_line(chart["liunian_pillar"]))

    if chart.get("dayun"):
        lines.append("")
        lines.append("## 大運列表")
        for i, du in enumerate(chart["dayun"], start=1):
            lines.append(_dayun_entry_line(i, du))

        # liunian list of the *current* dayun
        current_dayun = next(
            (
                du
                for du in chart["dayun"]
                if chart.get("dayun_pillar") and du.get("ganzhi") == chart["dayun_pillar"]["ganzhi"]
            ),
            None,
        )
        if current_dayun and current_dayun.get("liunian"):
            lines.append("")
            lines.append("## 目前大運的流年列表")
            for i, ly in enumerate(current_dayun["liunian"], start=1):
                lines.append(_liunian_entry_line(i, ly))

    if profile.notes:
        lines.append("")
        lines.append("## 備註")
        lines.append(profile.notes)

    return "\n".join(lines)


# ────────────────────────────── streaming ──────────────────────────────


def _sse(event: str, data: dict[str, Any]) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


async def stream_analysis(
    db: Session,
    user_id: UUID,
    profile: Profile,
    chart: dict[str, Any],
) -> AsyncGenerator[str, None]:
    """Open NV NIM stream, normalise into SSE events, persist final ai_analyses row."""
    if not settings.NVIDIA_API_KEY:
        yield _sse("error", {"message": "NVIDIA_API_KEY not configured"})
        return

    user_prompt = format_profile_to_prompt(profile, chart)
    payload = {
        "model": settings.NV_AI_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.6,
        "top_p": 0.95,
        "max_tokens": settings.AI_MAX_TOKENS,
        "stream": True,
    }
    headers = {
        "Authorization": f"Bearer {settings.NVIDIA_API_KEY}",
        "Accept": "text/event-stream",
        "Content-Type": "application/json",
    }

    # Insert a row early so we can update it at end. Quota query ignores
    # status='streaming'/'failed', so this row only counts when we set 'completed'.
    record = AIAnalysis(
        user_id=user_id,
        profile_id=profile.id,
        model=settings.NV_AI_MODEL,
        request_prompt=user_prompt,
        status="streaming",
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    response_text_parts: list[str] = []
    reasoning_text_parts: list[str] = []
    finish_reason: str | None = None
    prompt_tokens: int | None = None
    completion_tokens: int | None = None
    first_token_at: float | None = None
    error_message: str | None = None

    t0 = time.perf_counter()
    try:
        async with httpx.AsyncClient(timeout=settings.AI_TIMEOUT_SECONDS) as client:
            async with client.stream(
                "POST",
                f"{settings.NV_AI_BASE_URL}/chat/completions",
                json=payload,
                headers=headers,
            ) as resp:
                if resp.status_code != 200:
                    body = (await resp.aread()).decode("utf-8", errors="replace")
                    error_message = f"NV NIM HTTP {resp.status_code}: {body[:500]}"
                    yield _sse("error", {"message": error_message})
                    return

                async for line in resp.aiter_lines():
                    if not line or not line.startswith("data:"):
                        continue
                    data = line[5:].lstrip()
                    if data == "[DONE]":
                        break
                    try:
                        chunk = json.loads(data)
                    except json.JSONDecodeError:
                        continue
                    choices = chunk.get("choices") or []
                    if choices and choices[0].get("finish_reason"):
                        finish_reason = choices[0]["finish_reason"]
                    if not choices:
                        # final usage chunk
                        usage = chunk.get("usage") or {}
                        if usage:
                            prompt_tokens = usage.get("prompt_tokens") or prompt_tokens
                            completion_tokens = usage.get("completion_tokens") or completion_tokens
                        continue
                    delta = choices[0].get("delta") or {}

                    content = delta.get("content")
                    if content:
                        if first_token_at is None:
                            first_token_at = time.perf_counter()
                            yield _sse(
                                "ttft", {"latency_ms": int((first_token_at - t0) * 1000)}
                            )
                        response_text_parts.append(content)
                        yield _sse("content", {"text": content})

                    reasoning = delta.get("reasoning_content")
                    if reasoning:
                        if first_token_at is None:
                            first_token_at = time.perf_counter()
                            yield _sse(
                                "ttft",
                                {"latency_ms": int((first_token_at - t0) * 1000), "kind": "reasoning"},
                            )
                        reasoning_text_parts.append(reasoning)
                        yield _sse("reasoning", {"text": reasoning})

    except httpx.HTTPError as e:
        error_message = f"network error: {e}"
        yield _sse("error", {"message": error_message})
    except Exception as e:  # noqa: BLE001 — catch-all so we always finalise the row
        error_message = f"unexpected error: {e}"
        yield _sse("error", {"message": error_message})

    total_ms = int((time.perf_counter() - t0) * 1000)
    record.response_text = "".join(response_text_parts) or None
    record.reasoning_text = "".join(reasoning_text_parts) or None
    record.prompt_tokens = prompt_tokens
    record.completion_tokens = completion_tokens
    record.latency_ms = total_ms
    record.finish_reason = finish_reason

    if error_message is None and (response_text_parts or reasoning_text_parts):
        record.status = "completed"
    else:
        record.status = "failed"
        record.error_message = error_message or "no content received"

    db.commit()

    if record.status == "completed":
        yield _sse(
            "done",
            {
                "finish_reason": finish_reason,
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
                "latency_ms": total_ms,
            },
        )


def utc_now() -> datetime:
    return datetime.now(timezone.utc)
