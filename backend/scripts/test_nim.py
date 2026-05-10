#!/usr/bin/env python3
"""NV NIM 煙霧測試 — 跑一次真實的八字分析 prompt，量延遲與品質。

用法:
    export NVIDIA_API_KEY=nvapi-xxxxxxxxxxxx
    python backend/scripts/test_nim.py                              # 預設 deepseek-v3.2 + streaming
    python backend/scripts/test_nim.py --model deepseek-ai/deepseek-v4-pro
    python backend/scripts/test_nim.py --model deepseek-ai/deepseek-r1 --reasoning
    python backend/scripts/test_nim.py --no-stream                  # 拿到 token usage 統計
    python backend/scripts/test_nim.py --list                       # 列出帳號可用模型

候選模型（NV NIM 上的命盤分析候選，截至 2026-05）:
    deepseek-ai/deepseek-v4-pro              V4 旗艦，1.6T MoE / 49B active  <-- 預設
    deepseek-ai/deepseek-v4-flash            V4 速度版，284B / 13B active
    deepseek-ai/deepseek-v3.1-terminus       V3 末代穩定版，作為 fallback
    deepseek-ai/deepseek-r1                  reasoning 王者，慢但深
    qwen/qwen2.5-72b-instruct                結構化輸出工整
    nvidia/llama-3.3-nemotron-super-49b-v1   NV 自家調過

注意：deepseek-ai/deepseek-v3.2 已於 2026-05-04 EOL，不能再用。
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time

import httpx

BASE_URL = "https://integrate.api.nvidia.com/v1"
DEFAULT_MODEL = "deepseek-ai/deepseek-v4-pro"

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

SAMPLE_PROMPT = """# 八字命盤資料

## 基本資料
- 國曆=2003年3月6日
- 農曆=民國92年2月4日

## 四柱
- 時柱 | 干支=戊午 | 天干=戊 | 地支=午 | 天干十神=比肩 | 地支十神=帝旺 | 藏干=丁(正印), 己(劫財) | 納音=天上火 | 神煞=將星, 學士, 羊刃
- 日柱 | 干支=戊寅 | 天干=戊 | 地支=寅 | 天干十神=日主 | 地支十神=長生 | 藏干=甲(七殺), 丙(梟神), 戊(比肩) | 納音=城頭土 | 神煞=天醫, 學堂, 天赦
- 月柱 | 干支=乙卯 | 天干=乙 | 地支=卯 | 天干十神=正官 | 地支十神=沐浴 | 藏干=乙(正官) | 納音=大溪水 | 神煞=將星, 桃花, 天乙貴人
- 年柱 | 干支=癸未 | 天干=癸 | 地支=未 | 天干十神=正財 | 地支十神=衰 | 藏干=己(劫財), 丁(正印), 乙(正官) | 納音=楊柳木 | 神煞=華蓋, 天乙貴人, 金輿

## 目前運勢
- 目前大運 | 干支=壬子 | 天干=壬 | 地支=子 | 天干十神=偏財 | 地支十神=正財 | 藏干=癸(正財) | 納音=桑柘木 | 神煞=桃花, 飛刃
- 目前流年 | 年份=2026 | 歲數=24 | 干支=丙午 | 天干=丙 | 地支=午 | 天干十神=梟神 | 地支十神=正印 | 藏干=丁(正印), 己(劫財) | 納音=天河水 | 神煞=將星, 學士, 羊刃

## 大運列表
- 大運_1 | 起始歲數=1 | 年份區間=2003-2012 | 干支=甲寅 | 天干=甲 | 地支=寅 | 天干十神=七殺 | 地支十神=七殺 | 藏干=甲(七殺), 丙(梟神), 戊(比肩) | 地支關係=- | 納音=大溪水 | 特殊組合=- | 是否空亡=false | 是否重複=false
- 大運_2 | 起始歲數=11 | 年份區間=2013-2022 | 干支=癸丑 | 天干=癸 | 地支=丑 | 天干十神=正財 | 地支十神=劫財 | 藏干=己(劫財), 癸(正財), 辛(傷官) | 地支關係=- | 納音=桑柘木 | 特殊組合=- | 是否空亡=false | 是否重複=false
- 大運_3 | 起始歲數=21 | 年份區間=2023-2032 | 干支=壬子 | 天干=壬 | 地支=子 | 天干十神=偏財 | 地支十神=正財 | 藏干=癸(正財) | 地支關係=- | 納音=桑柘木 | 特殊組合=- | 是否空亡=false | 是否重複=false
- 大運_4 | 起始歲數=31 | 年份區間=2033-2042 | 干支=辛亥 | 天干=辛 | 地支=亥 | 天干十神=傷官 | 地支十神=偏財 | 藏干=壬(偏財), 甲(七殺) | 地支關係=- | 納音=釵釧金 | 特殊組合=- | 是否空亡=false | 是否重複=false
- 大運_5 | 起始歲數=41 | 年份區間=2043-2052 | 干支=庚戌 | 天干=庚 | 地支=戌 | 天干十神=食神 | 地支十神=比肩 | 藏干=戊(比肩), 辛(傷官), 丁(正印) | 地支關係=- | 納音=釵釧金 | 特殊組合=- | 是否空亡=false | 是否重複=false
- 大運_6 | 起始歲數=51 | 年份區間=2053-2062 | 干支=己酉 | 天干=己 | 地支=酉 | 天干十神=劫財 | 地支十神=傷官 | 藏干=辛(傷官) | 地支關係=- | 納音=大驛土 | 特殊組合=- | 是否空亡=true | 是否重複=false
- 大運_7 | 起始歲數=61 | 年份區間=2063-2072 | 干支=戊申 | 天干=戊 | 地支=申 | 天干十神=比肩 | 地支十神=食神 | 藏干=庚(食神), 壬(偏財), 戊(比肩) | 地支關係=- | 納音=大驛土 | 特殊組合=夾:未 | 是否空亡=true | 是否重複=false
- 大運_8 | 起始歲數=71 | 年份區間=2073-2082 | 干支=丁未 | 天干=丁 | 地支=未 | 天干十神=正印 | 地支十神=劫財 | 藏干=己(劫財), 丁(正印), 乙(正官) | 地支關係=- | 納音=天河水 | 特殊組合=- | 是否空亡=false | 是否重複=false
- 大運_9 | 起始歲數=81 | 年份區間=2083-2092 | 干支=丙午 | 天干=丙 | 地支=午 | 天干十神=梟神 | 地支十神=正印 | 藏干=丁(正印), 己(劫財) | 地支關係=- | 納音=天河水 | 特殊組合=- | 是否空亡=false | 是否重複=false

## 目前大運的流年列表
- 流年_1 | 年份=2023 | 歲數=21 | 干支=癸卯 | 天干=癸 | 地支=卯 | 天干十神=正財 | 地支十神=正官 | 藏干=乙(正官) | 地支關係=- | 納音=金泊金 | 特殊組合=- | 特殊格局=- | 是否空亡=false | 是否重複=false
- 流年_2 | 年份=2024 | 歲數=22 | 干支=甲辰 | 天干=甲 | 地支=辰 | 天干十神=七殺 | 地支十神=比肩 | 藏干=戊(比肩), 乙(正官), 癸(正財) | 地支關係=- | 納音=覆燈火 | 特殊組合=- | 特殊格局=- | 是否空亡=false | 是否重複=false
- 流年_3 | 年份=2025 | 歲數=23 | 干支=乙巳 | 天干=乙 | 地支=巳 | 天干十神=正官 | 地支十神=梟神 | 藏干=丙(梟神), 戊(比肩), 庚(食神) | 地支關係=- | 納音=覆燈火 | 特殊組合=夾:辰 | 特殊格局=- | 是否空亡=false | 是否重複=false
- 流年_4 | 年份=2026 | 歲數=24 | 干支=丙午 | 天干=丙 | 地支=午 | 天干十神=梟神 | 地支十神=正印 | 藏干=丁(正印), 己(劫財) | 地支關係=- | 納音=天河水 | 特殊組合=- | 特殊格局=- | 是否空亡=false | 是否重複=false
- 流年_5 | 年份=2027 | 歲數=25 | 干支=丁未 | 天干=丁 | 地支=未 | 天干十神=正印 | 地支十神=劫財 | 藏干=己(劫財), 丁(正印), 乙(正官) | 地支關係=- | 納音=天河水 | 特殊組合=- | 特殊格局=- | 是否空亡=false | 是否重複=false
- 流年_6 | 年份=2028 | 歲數=26 | 干支=戊申 | 天干=戊 | 地支=申 | 天干十神=比肩 | 地支十神=食神 | 藏干=庚(食神), 壬(偏財), 戊(比肩) | 地支關係=- | 納音=大驛土 | 特殊組合=夾:未 | 特殊格局=- | 是否空亡=true | 是否重複=false
- 流年_7 | 年份=2029 | 歲數=27 | 干支=己酉 | 天干=己 | 地支=酉 | 天干十神=劫財 | 地支十神=傷官 | 藏干=辛(傷官) | 地支關係=- | 納音=大驛土 | 特殊組合=- | 特殊格局=四敗:子午卯酉 | 是否空亡=true | 是否重複=false
- 流年_8 | 年份=2030 | 歲數=28 | 干支=庚戌 | 天干=庚 | 地支=戌 | 天干十神=食神 | 地支十神=比肩 | 藏干=戊(比肩), 辛(傷官), 丁(正印) | 地支關係=- | 納音=釵釧金 | 特殊組合=- | 特殊格局=- | 是否空亡=false | 是否重複=false
- 流年_9 | 年份=2031 | 歲數=29 | 干支=辛亥 | 天干=辛 | 地支=亥 | 天干十神=傷官 | 地支十神=偏財 | 藏干=壬(偏財), 甲(七殺) | 地支關係=- | 納音=釵釧金 | 特殊組合=- | 特殊格局=- | 是否空亡=false | 是否重複=false
- 流年_10 | 年份=2032 | 歲數=30 | 干支=壬子 | 天干=壬 | 地支=子 | 天干十神=偏財 | 地支十神=正財 | 藏干=癸(正財) | 地支關係=- | 納音=桑柘木 | 特殊組合=- | 特殊格局=- | 是否空亡=false | 是否重複=false
"""


def list_models(api_key: str) -> None:
    r = httpx.get(
        f"{BASE_URL}/models",
        headers={"Authorization": f"Bearer {api_key}"},
        timeout=30,
    )
    r.raise_for_status()
    data = r.json().get("data", [])
    print(f"available models: {len(data)}")
    for m in data:
        print(f"  {m.get('id')}")


def build_payload(model: str, stream: bool, reasoning: bool) -> dict:
    payload: dict = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": SAMPLE_PROMPT},
        ],
        "temperature": 0.6,
        "top_p": 0.95,
        "max_tokens": 2048,
        "stream": stream,
    }
    if reasoning:
        # DeepSeek V4 reasoning 模型在 NV NIM 上要求顯式打開 thinking
        payload["chat_template_kwargs"] = {"enable_thinking": True, "thinking": True}
    return payload


def run_stream(model: str, payload: dict, api_key: str) -> None:
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "text/event-stream",
    }
    t0 = time.perf_counter()
    first_token_at: float | None = None
    text_chars = 0
    reasoning_chars = 0

    print(f"\n=== model={model} stream=True ===\n")
    with httpx.stream("POST", f"{BASE_URL}/chat/completions",
                      json=payload, headers=headers, timeout=180.0) as r:
        if r.status_code != 200:
            body = b"".join(r.iter_bytes()).decode("utf-8", errors="replace")
            print(f"HTTP {r.status_code}\n{body}")
            print_rate_limit_headers(r.headers)
            sys.exit(1)

        for line in r.iter_lines():
            if not line or not line.startswith("data:"):
                continue
            data = line[5:].lstrip()
            if data == "[DONE]":
                break
            try:
                chunk = json.loads(data)
            except json.JSONDecodeError:
                continue
            delta = chunk.get("choices", [{}])[0].get("delta", {})
            # 一般 content
            content = delta.get("content")
            if content:
                if first_token_at is None:
                    first_token_at = time.perf_counter()
                    print(f"[ttft] {(first_token_at - t0)*1000:.0f} ms")
                    print("--- response ---")
                print(content, end="", flush=True)
                text_chars += len(content)
            # reasoning tokens（V4 / R1）
            reasoning = delta.get("reasoning_content")
            if reasoning:
                if first_token_at is None:
                    first_token_at = time.perf_counter()
                    print(f"[ttft-reasoning] {(first_token_at - t0)*1000:.0f} ms")
                    print("--- thinking ---")
                print(f"\033[2m{reasoning}\033[0m", end="", flush=True)
                reasoning_chars += len(reasoning)

        total = time.perf_counter() - t0

    print("\n--- end ---")
    print(f"[total]   {total:.2f} s")
    if first_token_at:
        print(f"[ttft]    {(first_token_at - t0)*1000:.0f} ms")
        print(f"[stream]  {(total - (first_token_at - t0)):.2f} s after first token")
    print(f"[chars]   answer={text_chars}  reasoning={reasoning_chars}")
    print_rate_limit_headers(r.headers)


def run_blocking(model: str, payload: dict, api_key: str) -> None:
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    t0 = time.perf_counter()
    print(f"\n=== model={model} stream=False ===\n")
    with httpx.Client(timeout=180.0) as client:
        r = client.post(f"{BASE_URL}/chat/completions", json=payload, headers=headers)
        total = time.perf_counter() - t0
        if r.status_code != 200:
            print(f"HTTP {r.status_code}\n{r.text}")
            print_rate_limit_headers(r.headers)
            sys.exit(1)
        data = r.json()

    msg = data["choices"][0]["message"]
    print("--- response ---")
    print(msg.get("content") or "(empty content)")
    if msg.get("reasoning_content"):
        print("\n--- reasoning ---")
        print(f"\033[2m{msg['reasoning_content']}\033[0m")
    print("\n--- end ---")
    print(f"[total] {total:.2f} s")
    usage = data.get("usage") or {}
    if usage:
        print(f"[tokens] prompt={usage.get('prompt_tokens')} "
              f"completion={usage.get('completion_tokens')} "
              f"total={usage.get('total_tokens')}")
    print_rate_limit_headers(r.headers)


def print_rate_limit_headers(headers) -> None:
    keys = [k for k in headers.keys() if "ratelimit" in k.lower() or k.lower().startswith("x-")]
    if not keys:
        return
    print("[headers]")
    for k in keys:
        print(f"  {k}: {headers[k]}")


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--model", default=DEFAULT_MODEL, help=f"model id (default: {DEFAULT_MODEL})")
    p.add_argument("--no-stream", action="store_true", help="disable SSE streaming")
    p.add_argument("--reasoning", action="store_true",
                   help="enable thinking for V4 reasoning models")
    p.add_argument("--list", action="store_true", help="list available models then exit")
    args = p.parse_args()

    api_key = os.environ.get("NVIDIA_API_KEY")
    if not api_key:
        sys.exit("error: NVIDIA_API_KEY not set. export NVIDIA_API_KEY=nvapi-xxxx")

    if args.list:
        list_models(api_key)
        return

    payload = build_payload(model=args.model, stream=not args.no_stream, reasoning=args.reasoning)
    if args.no_stream:
        run_blocking(args.model, payload, api_key)
    else:
        run_stream(args.model, payload, api_key)


if __name__ == "__main__":
    main()
