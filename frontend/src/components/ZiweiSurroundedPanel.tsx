"use client";

import { motion } from 'framer-motion';
import React from 'react';

import { getStarInfo, ZIWEI_STAR_CATEGORY_LABEL } from '@/data/ziweiStars';
import type { ZiweiStarInfo } from '@/data/ziweiStars';
import type { ZiweiPalace, ZiweiStar } from '@/types/ziwei';

/** A palace within the 三方四正, tagged with its role relative to the selected one. */
export interface SurroundedEntry {
  role: string;
  palace: ZiweiPalace;
  /** 主星 borrowed from the opposite palace when this one is 空宮. */
  borrowedMajor: ZiweiStar[];
  /** Name of the palace lent from, when borrowing happened. */
  borrowedFrom?: string;
}

interface ZiweiSurroundedPanelProps {
  entries: SurroundedEntry[];
  onClose: () => void;
}

const ROLE_STYLE: Record<string, string> = {
  本宮: 'border-amber-400 bg-amber-50/50',
  對宮: 'border-indigo-300 bg-indigo-50/40',
  官祿位: 'border-teal-300 bg-teal-50/40',
  財帛位: 'border-teal-300 bg-teal-50/40',
};

const CATEGORY_STYLE: Record<ZiweiStarInfo['category'], string> = {
  major: 'border-gray-800 bg-gray-800 text-white',
  lucky: 'border-emerald-300 bg-emerald-50 text-emerald-800',
  malefic: 'border-red-300 bg-red-50 text-red-800',
  fortune: 'border-amber-300 bg-amber-50 text-amber-800',
};

/** A star as it should be read in this palace, after borrowing and filtering. */
interface ResolvedStar {
  star: ZiweiStar;
  /** True when the star was borrowed from the opposite palace. */
  borrowed: boolean;
}

/**
 * Which stars of a palace actually get read when interpreting the selected one.
 *
 *   本宮 — everything it holds; if it is 空宮 the 對宮's 主星 are borrowed in whole.
 *   三方 — only 主星 carrying a 四化 are brought across, but every 輔星 is.
 *
 * Borrowed 主星 go through the same 四化 filter as native ones, so an empty
 * 三方 palace only contributes when the borrowed star is actually transformed.
 */
function resolvePalaceStars(entry: SurroundedEntry): {
  major: ResolvedStar[];
  minor: ResolvedStar[];
  /** 主星 that exist but were filtered out for lacking 四化. */
  filteredOutMajor: ResolvedStar[];
} {
  const isTarget = entry.role === '本宮';
  const borrowed = entry.palace.major_stars.length === 0;
  const sourceMajor: ResolvedStar[] = (
    borrowed ? entry.borrowedMajor : entry.palace.major_stars
  ).map((star) => ({ star, borrowed }));
  const minor: ResolvedStar[] = entry.palace.minor_stars.map((star) => ({
    star,
    borrowed: false,
  }));

  if (isTarget) {
    return { major: sourceMajor, minor, filteredOutMajor: [] };
  }
  return {
    major: sourceMajor.filter((s) => s.star.mutagen),
    minor,
    filteredOutMajor: sourceMajor.filter((s) => !s.star.mutagen),
  };
}

const StarChip: React.FC<{
  resolved: ResolvedStar;
  onSelect: (name: string) => void;
  active: boolean;
  muted?: boolean;
}> = ({ resolved, onSelect, active, muted }) => {
  const { star, borrowed } = resolved;
  const info = getStarInfo(star.name);
  const base = muted
    ? 'border-gray-200 bg-gray-50 text-gray-400'
    : info
      ? CATEGORY_STYLE[info.category]
      : 'border-gray-200 bg-white text-gray-500';

  return (
    <button
      type="button"
      onClick={() => onSelect(star.name)}
      disabled={!info}
      title={info ? `${info.transform}｜${info.governs}` : '雜曜，暫無釋義'}
      className={`rounded-sm border px-1.5 py-0.5 text-[12px] leading-tight transition ${base} ${
        info ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
      } ${active ? 'ring-2 ring-offset-1 ring-gray-400' : ''} ${
        borrowed ? 'border-dashed' : ''
      }`}
    >
      {borrowed && <span className="mr-0.5 text-[9px] opacity-70">借</span>}
      {star.name}
      {star.brightness && <span className="ml-px text-[9px] opacity-70">{star.brightness}</span>}
      {star.mutagen && <span className="ml-0.5 text-[10px] font-bold">{star.mutagen}</span>}
    </button>
  );
};

const ZiweiSurroundedPanel: React.FC<ZiweiSurroundedPanelProps> = ({ entries, onClose }) => {
  const [selectedStar, setSelectedStar] = React.useState<string | null>(null);

  const resolved = React.useMemo(
    () => entries.map((entry) => ({ entry, ...resolvePalaceStars(entry) })),
    [entries],
  );

  // Every 主星/輔星 that actually counts, after borrowing and 四化 filtering.
  const starsInView = React.useMemo(() => {
    const seen = new Map<string, ZiweiStarInfo>();
    resolved.forEach(({ major, minor }) => {
      [...major, ...minor].forEach(({ star }) => {
        const info = getStarInfo(star.name);
        if (info && !seen.has(star.name)) seen.set(star.name, info);
      });
    });
    return [...seen.values()];
  }, [resolved]);

  const detail = selectedStar ? getStarInfo(selectedStar) : null;
  const target = entries.find((e) => e.role === '本宮')?.palace;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="chinese-card mx-auto mt-4 w-full max-w-6xl p-4 md:p-5"
    >
      <div className="mb-1 flex items-center justify-between gap-3">
        <h3 className="chinese-title text-lg">
          {target ? `${target.name} · 三方四正` : '三方四正'}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-gray-500 underline underline-offset-2 hover:text-gray-800"
        >
          關閉
        </button>
      </div>
      <p className="mb-3 text-[11px] leading-relaxed text-gray-400">
        本宮全看；三方僅取帶四化的主星，輔星全取。空宮之主星借自對宮，以虛線與「借」標示。
      </p>

      {/* The four palaces */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {resolved.map(({ entry, major, minor, filteredOutMajor }) => (
          <div
            key={entry.palace.index}
            className={`rounded-sm border p-2.5 ${
              ROLE_STYLE[entry.role] ?? 'border-gray-200 bg-white/60'
            }`}
          >
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              <span className="chinese-text text-sm font-bold text-gray-800">
                {entry.palace.name}
              </span>
              <span className="text-[11px] text-gray-500">
                {entry.role} · {entry.palace.heavenly_stem}
                {entry.palace.earthly_branch}
              </span>
            </div>

            {entry.borrowedFrom && (
              <div className="mb-1 text-[10px] text-gray-500">
                空宮，主星借自{entry.borrowedFrom}
              </div>
            )}

            <div className="flex flex-wrap gap-1">
              {[...major, ...minor].map((r) => (
                <StarChip
                  key={`${r.star.name}-${r.borrowed}`}
                  resolved={r}
                  active={selectedStar === r.star.name}
                  onSelect={setSelectedStar}
                />
              ))}
              {major.length === 0 && minor.length === 0 && (
                <span className="text-[11px] text-gray-400">無星可取</span>
              )}
            </div>

            {filteredOutMajor.length > 0 && (
              <div className="mt-1.5 text-[10px] leading-tight text-gray-400">
                主星未帶四化，不計入：
                {filteredOutMajor.map((r) => r.star.name).join('、')}
              </div>
            )}

            {entry.palace.adjective_stars.length > 0 && (
              <div className="mt-1.5 text-[10px] leading-tight text-gray-400">
                {entry.palace.adjective_stars.map((s) => s.name).join('、')}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected star detail */}
      {detail && (
        <motion.div
          key={detail.name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 rounded-sm border border-gray-200 bg-white/70 p-3"
        >
          <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="chinese-title text-xl">{detail.name}</span>
            <span className="rounded-sm border border-gray-300 px-1 text-[11px] text-gray-600">
              {ZIWEI_STAR_CATEGORY_LABEL[detail.category]}
            </span>
            <span className="text-[12px] text-gray-500">
              {detail.group}｜{detail.element}｜化氣「{detail.transform}」
            </span>
          </div>
          <p className="chinese-text mb-2 text-sm leading-relaxed text-gray-700">
            {detail.summary}
          </p>
          <div className="mb-2 text-[12px] text-gray-600">
            <span className="text-gray-400">司職　</span>
            {detail.governs}
          </div>
          <div className="flex flex-wrap gap-1">
            {detail.traits.map((t) => (
              <span
                key={t}
                className="rounded-sm bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-600"
              >
                {t}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Everything that counts, at a glance */}
      <div className="mt-4">
        <div className="mb-1.5 text-[12px] text-gray-500">
          納入論斷的主星與輔星（{starsInView.length}）— 點擊看完整釋義
        </div>
        <div className="space-y-1">
          {starsInView.map((s) => (
            <button
              key={s.name}
              type="button"
              onClick={() => setSelectedStar(s.name)}
              className="flex w-full items-baseline gap-2 rounded-sm px-1 py-0.5 text-left hover:bg-gray-50"
            >
              <span className="chinese-text w-12 shrink-0 text-[13px] font-semibold text-gray-800">
                {s.name}
              </span>
              <span className="w-14 shrink-0 text-[11px] text-gray-400">化{s.transform}</span>
              <span className="text-[12px] leading-snug text-gray-600">{s.summary}</span>
            </button>
          ))}
          {starsInView.length === 0 && (
            <p className="text-[12px] text-gray-400">此三方四正無可納入的主星與輔星。</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ZiweiSurroundedPanel;
