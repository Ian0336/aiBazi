/** AI analysis API helpers — quota status + SSE streaming. */

import { apiFetch, apiStream } from './api';
import type { QuotaStatus } from '@/types/auth';
import type { AnalysisEvent } from '@/types/ai';

export const getQuota = () => apiFetch<QuotaStatus>('/ai/quota');

/**
 * Open an SSE analysis stream. Consume with `for await`.
 *
 *   for await (const event of analyseProfile(profileId)) {
 *     ...
 *   }
 *
 * Throws if the request fails before the stream begins (e.g. 401, 404, 429).
 */
export async function* analyseProfile(
  profileId: string,
  signal?: AbortSignal,
): AsyncGenerator<AnalysisEvent, void, void> {
  const response = await apiStream('/ai/analyze', {
    method: 'POST',
    body: JSON.stringify({ profile_id: profileId }),
    signal,
  });

  if (!response.ok || !response.body) {
    let detail: unknown = null;
    try {
      detail = await response.json();
    } catch {
      detail = await response.text().catch(() => null);
    }
    const err: Error & { status?: number; body?: unknown } = new Error(
      `analysis request failed: ${response.status}`,
    );
    err.status = response.status;
    err.body = detail;
    throw err;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE: events are separated by a blank line. Each line within an event
      // is one of `event: <name>` / `data: <payload>` / `id:` / `retry:`.
      let sep = buffer.indexOf('\n\n');
      while (sep !== -1) {
        const block = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);
        const parsed = parseSseBlock(block);
        if (parsed) yield parsed;
        sep = buffer.indexOf('\n\n');
      }
    }
  } finally {
    reader.releaseLock();
  }
}

function parseSseBlock(block: string): AnalysisEvent | null {
  let event = 'message';
  const dataLines: string[] = [];
  for (const rawLine of block.split('\n')) {
    const line = rawLine.replace(/\r$/, '');
    if (!line || line.startsWith(':')) continue;
    if (line.startsWith('event:')) {
      event = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).replace(/^\s/, ''));
    }
  }
  if (dataLines.length === 0) return null;
  const dataStr = dataLines.join('\n');
  let payload: Record<string, unknown> = {};
  try {
    payload = JSON.parse(dataStr) as Record<string, unknown>;
  } catch {
    return null;
  }
  switch (event) {
    case 'ttft':
      return {
        type: 'ttft',
        latency_ms: Number(payload.latency_ms ?? 0),
        kind: payload.kind as 'reasoning' | undefined,
      };
    case 'content':
      return { type: 'content', text: String(payload.text ?? '') };
    case 'reasoning':
      return { type: 'reasoning', text: String(payload.text ?? '') };
    case 'done':
      return {
        type: 'done',
        finish_reason: (payload.finish_reason as string | null) ?? null,
        prompt_tokens: (payload.prompt_tokens as number | null) ?? null,
        completion_tokens: (payload.completion_tokens as number | null) ?? null,
        latency_ms: Number(payload.latency_ms ?? 0),
      };
    case 'error':
      return { type: 'error', message: String(payload.message ?? 'unknown error') };
    default:
      return null;
  }
}
