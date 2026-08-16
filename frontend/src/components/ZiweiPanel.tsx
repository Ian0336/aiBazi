"use client";

import { useAtom } from 'jotai';
import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import ZiweiChart from './ZiweiChart';
import ZiweiHoroscopeNav from './ZiweiHoroscopeNav';
import { calculateZiwei } from '@/lib/ziwei';
import { ApiError } from '@/lib/api';
import { ziweiChartAtom } from '@/store/jotai';
import type { BaziInput } from '@/types/bazi';
import type { ZiweiInput } from '@/types/ziwei';

interface ZiweiPanelProps {
  /** The same birth data that produced the 八字 chart. */
  input: BaziInput;
}

/** Local YYYY-MM-DD — toISOString() would roll back a day for UTC+8 evenings. */
function todayLocal(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const ZiweiPanel: React.FC<ZiweiPanelProps> = ({ input }) => {
  const [cached, setCached] = useAtom(ziweiChartAtom);
  const [horoscopeDate, setHoroscopeDate] = useState<string>(todayLocal);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // One request per (birth data, 運限 date) pair. Cached in the shared store so
  // flipping back from the 八字 tab does not refetch.
  const cacheKey = JSON.stringify({ input, horoscopeDate });

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payload: ZiweiInput = {
        year: input.year,
        month: input.month,
        day: input.day,
        hour: input.hour,
        gender: input.gender,
        is_lunar: input.is_lunar,
        is_leap_month: input.is_leap_month,
        language: 'zh-TW',
        horoscope_date: horoscopeDate || undefined,
      };
      const chart = await calculateZiwei(payload);
      setCached({ key: cacheKey, chart });
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.status === 400 || e.status === 422
            ? '輸入資料有誤，請確認出生時間'
            : `排盤失敗 (${e.status})`
          : '無法連線至伺服器';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [input, horoscopeDate, cacheKey, setCached]);

  useEffect(() => {
    if (cached?.key === cacheKey) return;
    void load();
  }, [cacheKey, cached?.key, load]);

  const chart = cached?.key === cacheKey ? cached.chart : null;

  return (
    <div className="space-y-4">
      {/* Needs a loaded chart for the 大限 ranges, so it only appears once one exists. */}
      {chart && (
        <ZiweiHoroscopeNav
          chart={chart}
          value={horoscopeDate}
          onChange={setHoroscopeDate}
        />
      )}

      {isLoading && !chart && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="chinese-card mx-auto max-w-6xl p-12 text-center"
        >
          <p className="chinese-text text-gray-500">排盤中…</p>
        </motion.div>
      )}

      {error && !chart && (
        <div className="chinese-card mx-auto max-w-2xl p-8 text-center">
          <p className="chinese-text mb-4 text-gray-700">{error}</p>
          <button type="button" onClick={() => void load()} className="btn-chinese-outline">
            重新排盤
          </button>
        </div>
      )}

      {chart && (
        <div className={isLoading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          <ZiweiChart chart={chart} />
        </div>
      )}
    </div>
  );
};

export default ZiweiPanel;
