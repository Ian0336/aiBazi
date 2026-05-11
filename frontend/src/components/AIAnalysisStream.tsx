"use client";

import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { analyseProfile } from '@/lib/ai';
import type { AnalysisEvent } from '@/types/ai';

interface Props {
  profileId: string;
  /** Auto-start when the component mounts. */
  autoStart?: boolean;
  onComplete?: () => void;
}

interface Stats {
  ttft_ms: number | null;
  total_ms: number | null;
  finish_reason: string | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
}

export default function AIAnalysisStream({ profileId, autoStart = false, onComplete }: Props) {
  const [content, setContent] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    ttft_ms: null,
    total_ms: null,
    finish_reason: null,
    prompt_tokens: null,
    completion_tokens: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const start = async () => {
    if (streaming) return;
    setContent('');
    setReasoning('');
    setError(null);
    setStats({
      ttft_ms: null,
      total_ms: null,
      finish_reason: null,
      prompt_tokens: null,
      completion_tokens: null,
    });
    setStreaming(true);

    abortRef.current = new AbortController();
    try {
      for await (const ev of analyseProfile(profileId, abortRef.current.signal)) {
        applyEvent(ev);
        if (ev.type === 'done' || ev.type === 'error') break;
      }
    } catch (err: any) {
      if (err?.status === 429) {
        const detail = err.body?.detail ?? err.body;
        const msg =
          (detail && typeof detail === 'object' && 'message' in detail
            ? (detail as { message: string }).message
            : null) ?? '今日 AI 分析次數已用完，明天 00:00 重置。';
        setError(msg);
      } else if (err?.status === 401) {
        setError('需要登入才能使用 AI 分析');
      } else if (err?.status === 404) {
        setError('找不到此命盤');
      } else {
        setError(err?.message ?? '分析失敗');
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
      onComplete?.();
    }
  };

  const applyEvent = (ev: AnalysisEvent) => {
    switch (ev.type) {
      case 'ttft':
        if (ev.kind !== 'reasoning') {
          setStats((s) => ({ ...s, ttft_ms: ev.latency_ms }));
        }
        break;
      case 'content':
        setContent((c) => c + ev.text);
        break;
      case 'reasoning':
        setReasoning((c) => c + ev.text);
        break;
      case 'done':
        setStats({
          ttft_ms: 0, // overwritten by ttft event already
          total_ms: ev.latency_ms,
          finish_reason: ev.finish_reason,
          prompt_tokens: ev.prompt_tokens,
          completion_tokens: ev.completion_tokens,
        });
        break;
      case 'error':
        setError(ev.message);
        break;
    }
  };

  useEffect(() => {
    if (autoStart) start();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, profileId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 chinese-text">
        <button
          onClick={start}
          disabled={streaming}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm"
        >
          {streaming ? '分析中…' : content || reasoning ? '重新分析' : '開始分析'}
        </button>
        {streaming && abortRef.current && (
          <button
            onClick={() => abortRef.current?.abort()}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            取消
          </button>
        )}
        {stats.ttft_ms !== null && stats.ttft_ms > 0 && (
          <span className="text-xs text-gray-500">
            首字 {stats.ttft_ms} ms
            {stats.total_ms ? ` · 總計 ${(stats.total_ms / 1000).toFixed(1)} s` : ''}
          </span>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm chinese-text">
          {error}
        </div>
      )}

      {reasoning && (
        <details className="border border-gray-200 rounded-md">
          <summary className="cursor-pointer px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 chinese-text">
            模型思考過程（{reasoning.length} 字）
          </summary>
          <div className="px-4 py-3 text-sm text-gray-500 whitespace-pre-wrap chinese-text">
            {reasoning}
          </div>
        </details>
      )}

      {content && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="prose prose-sm md:prose-base max-w-none chinese-text"
        >
          <ReactMarkdown>{content}</ReactMarkdown>
        </motion.div>
      )}

      {stats.finish_reason === 'length' && (
        <div className="text-xs text-amber-700 chinese-text">
          ⚠️ 回答因 token 上限被截斷，請聯絡管理員調整設定。
        </div>
      )}
    </div>
  );
}
