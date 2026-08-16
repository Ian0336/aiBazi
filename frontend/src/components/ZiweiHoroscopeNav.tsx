"use client";

import React from 'react';

import type { ZiweiChart } from '@/types/ziwei';

interface ZiweiHoroscopeNavProps {
  chart: ZiweiChart;
  /** Current 運限 date, 'YYYY-MM-DD'. */
  value: string;
  onChange: (next: string) => void;
}

/** Replace the year, clamping the day so 2/29 → 2/28 in a common year. */
function withYear(iso: string, year: number): string {
  const [, month, day] = iso.split('-');
  const monthNum = Number(month);
  const lastDay = new Date(year, monthNum, 0).getDate();
  const clamped = Math.min(Number(day), lastDay);
  return `${year}-${month}-${String(clamped).padStart(2, '0')}`;
}

function todayLocal(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Browse 運限 by 大限 and 流年 rather than by raw date.
 *
 * 虛歲 counts the birth year as 1, so 虛歲 N falls in calendar year
 * birthYear + N - 1. That is what turns a 大限 age range into a run of years.
 * Around 農曆新年 the true 虛歲 can differ by one; the authoritative value from
 * the backend is shown alongside, and the chips only drive which date is sent.
 */
const ZiweiHoroscopeNav: React.FC<ZiweiHoroscopeNavProps> = ({ chart, value, onChange }) => {
  const birthYear = Number(chart.solar_date.slice(0, 4));

  const decades = React.useMemo(
    () =>
      chart.palaces
        .filter((p) => p.decadal?.range?.length === 2)
        .map((p) => ({
          start: p.decadal!.range[0],
          end: p.decadal!.range[1],
          palaceIndex: p.index,
        }))
        .sort((a, b) => a.start - b.start),
    [chart.palaces],
  );

  const currentYear = Number(value.slice(0, 4));
  const chipAge = currentYear - birthYear + 1;
  const activeDecade = decades.find((d) => chipAge >= d.start && chipAge <= d.end);

  const yearsOfDecade = React.useMemo(() => {
    if (!activeDecade) return [];
    const out: { year: number; age: number }[] = [];
    for (let age = activeDecade.start; age <= activeDecade.end; age += 1) {
      out.push({ year: birthYear + age - 1, age });
    }
    return out;
  }, [activeDecade, birthYear]);

  const shiftYear = (delta: number) => onChange(withYear(value, currentYear + delta));

  const chipClass = (active: boolean) =>
    `rounded-sm border px-2 py-0.5 text-[11px] leading-tight transition-colors ${
      active
        ? 'border-orange-500 bg-orange-500 text-white'
        : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
    }`;

  return (
    <div className="chinese-card mx-auto w-full max-w-6xl space-y-2 p-3">
      {/* Date + current age */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <label className="chinese-text flex items-center gap-2 text-sm text-gray-600">
          運限日期
          <input
            type="date"
            value={value}
            onChange={(e) => e.target.value && onChange(e.target.value)}
            className="input-chinese px-2 py-1 text-sm"
          />
        </label>
        {chart.horoscope?.nominal_age != null && (
          <span className="chinese-text text-sm text-gray-500">
            虛歲 {chart.horoscope.nominal_age}
          </span>
        )}
        {value !== todayLocal() && (
          <button
            type="button"
            onClick={() => onChange(todayLocal())}
            className="text-xs text-gray-500 underline underline-offset-2 hover:text-gray-700"
          >
            回到今日
          </button>
        )}
      </div>

      {/* 大限 — one chip per decade */}
      {decades.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          <span className="mr-1 w-8 shrink-0 text-[11px] text-gray-400">大限</span>
          {decades.map((d) => (
            <button
              key={d.start}
              type="button"
              onClick={() => onChange(withYear(value, birthYear + d.start - 1))}
              title={`${birthYear + d.start - 1}–${birthYear + d.end - 1} 年`}
              className={chipClass(activeDecade?.start === d.start)}
            >
              {d.start}–{d.end}
            </button>
          ))}
        </div>
      )}

      {/* 流年 — the ten years inside the active 大限 */}
      {yearsOfDecade.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          <span className="mr-1 w-8 shrink-0 text-[11px] text-gray-400">流年</span>
          <button
            type="button"
            onClick={() => shiftYear(-1)}
            className="rounded-sm border border-gray-300 px-1.5 py-0.5 text-[11px] text-gray-600 hover:border-gray-400"
            aria-label="前一年"
          >
            ◀
          </button>
          {yearsOfDecade.map(({ year, age }) => (
            <button
              key={year}
              type="button"
              onClick={() => onChange(withYear(value, year))}
              className={chipClass(year === currentYear)}
            >
              {year}
              <span className={year === currentYear ? 'ml-1 opacity-80' : 'ml-1 text-gray-400'}>
                {age}
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => shiftYear(1)}
            className="rounded-sm border border-gray-300 px-1.5 py-0.5 text-[11px] text-gray-600 hover:border-gray-400"
            aria-label="後一年"
          >
            ▶
          </button>
        </div>
      )}

      {!activeDecade && (
        <p className="text-[11px] text-gray-400">
          此日期不在任何大限範圍內（大限自 {decades[0]?.start} 歲起算），流年列表暫不顯示。
        </p>
      )}
    </div>
  );
};

export default ZiweiHoroscopeNav;
