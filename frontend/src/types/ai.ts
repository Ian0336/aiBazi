export type AnalysisEvent =
  | { type: 'ttft'; latency_ms: number; kind?: 'reasoning' }
  | { type: 'content'; text: string }
  | { type: 'reasoning'; text: string }
  | {
      type: 'done';
      finish_reason: string | null;
      prompt_tokens: number | null;
      completion_tokens: number | null;
      latency_ms: number;
    }
  | { type: 'error'; message: string };
