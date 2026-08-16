"use client";

import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import type {
  ZiweiChart as ZiweiChartType,
  ZiweiHoroscopeScope,
  ZiweiPalace,
  ZiweiStar,
} from '@/types/ziwei';
import ZiweiSurroundedPanel, { type SurroundedEntry } from './ZiweiSurroundedPanel';

interface ZiweiChartProps {
  chart: ZiweiChartType;
}

/**
 * 三方四正 of a palace: itself, the palace opposite it, and the two that form
 * the 三合 triangle with it. Verified against iztro's own surrounded_palaces()
 * across all twelve palaces, including its 官祿位 / 財帛位 naming.
 */
function surroundedRoles(index: number): { index: number; role: string }[] {
  return [
    { index, role: '本宮' },
    { index: (index + 4) % 12, role: '官祿位' },
    { index: (index + 6) % 12, role: '對宮' },
    { index: (index + 8) % 12, role: '財帛位' },
  ];
}

/**
 * The 十二宮 sit on a fixed 4×4 board, addressed by earthly branch, with the
 * centre 2×2 reserved for 中宮:
 *
 *   巳 午 未 申
 *   辰 ┌──────┐ 酉
 *   卯 └──────┘ 戌
 *   寅 丑 子 亥
 *
 * Palace index 0-11 runs 寅卯辰巳午未申酉戌亥子丑, so this maps index → cell.
 * Class strings are spelled out in full so Tailwind's scanner keeps them.
 */
const GRID_POSITION: Record<number, string> = {
  3: 'col-start-1 row-start-1', // 巳
  4: 'col-start-2 row-start-1', // 午
  5: 'col-start-3 row-start-1', // 未
  6: 'col-start-4 row-start-1', // 申
  2: 'col-start-1 row-start-2', // 辰
  7: 'col-start-4 row-start-2', // 酉
  1: 'col-start-1 row-start-3', // 卯
  8: 'col-start-4 row-start-3', // 戌
  0: 'col-start-1 row-start-4', // 寅
  11: 'col-start-2 row-start-4', // 丑
  10: 'col-start-3 row-start-4', // 子
  9: 'col-start-4 row-start-4', // 亥
};

/** iztro reports each scope's 四化 stars positionally, in this order. */
const MUTAGEN_ORDER = ['祿', '權', '科', '忌'] as const;

type HoroscopeLayerKey = 'natal' | 'decadal' | 'yearly' | 'age_scope' | 'monthly' | 'daily' | 'hourly';

/** The 運限 layers the board can be re-anchored to. `prefix` labels palaces, e.g. 大財帛. */
const HOROSCOPE_LAYERS: {
  key: HoroscopeLayerKey;
  label: string;
  prefix: string;
  field: 'decadal' | 'yearly' | 'age_scope' | 'monthly' | 'daily' | 'hourly';
}[] = [
  { key: 'natal', label: '本命', prefix: '', field: 'decadal' },
  { key: 'decadal', label: '大限', prefix: '大', field: 'decadal' },
  { key: 'yearly', label: '流年', prefix: '年', field: 'yearly' },
  { key: 'age_scope', label: '小限', prefix: '小', field: 'age_scope' },
  { key: 'monthly', label: '流月', prefix: '月', field: 'monthly' },
  { key: 'daily', label: '流日', prefix: '日', field: 'daily' },
  { key: 'hourly', label: '流時', prefix: '時', field: 'hourly' },
];

/** Both scripts, since the chart language is configurable. */
const MUTAGEN_STYLE: Record<string, string> = {
  祿: 'bg-emerald-50 text-emerald-700 border-emerald-300',
  禄: 'bg-emerald-50 text-emerald-700 border-emerald-300',
  權: 'bg-sky-50 text-sky-700 border-sky-300',
  权: 'bg-sky-50 text-sky-700 border-sky-300',
  科: 'bg-violet-50 text-violet-700 border-violet-300',
  忌: 'bg-red-50 text-red-700 border-red-300',
};

const Mutagen: React.FC<{ value: string }> = ({ value }) => (
  <span
    className={`ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-sm border text-[10px] leading-none ${
      MUTAGEN_STYLE[value] ?? 'bg-gray-50 text-gray-600 border-gray-300'
    }`}
  >
    {value}
  </span>
);

const StarName: React.FC<{
  star: ZiweiStar;
  tone: 'major' | 'minor' | 'adjective';
  /** 運限四化, e.g. 大祿 — shown alongside the natal 四化. */
  layerBadge?: string;
}> = ({ star, tone, layerBadge }) => {
  const toneClass = {
    major: 'text-[13px] font-semibold text-gray-900',
    minor: 'text-[12px] text-gray-700',
    adjective: 'text-[11px] text-gray-400',
  }[tone];

  return (
    <span className={`inline-flex items-baseline whitespace-nowrap ${toneClass}`}>
      {star.name}
      {star.brightness && (
        <span className="ml-px text-[9px] font-normal text-gray-400">{star.brightness}</span>
      )}
      {star.mutagen && <Mutagen value={star.mutagen} />}
      {layerBadge && (
        <span className="ml-0.5 rounded-sm border border-orange-400 bg-orange-50 px-0.5 text-[9px] font-normal leading-tight text-orange-700">
          {layerBadge}
        </span>
      )}
    </span>
  );
};

const ROLE_BORDER: Record<string, string> = {
  本宮: 'border-amber-500 bg-amber-50/70 ring-1 ring-amber-400',
  對宮: 'border-indigo-400 bg-indigo-50/50',
  官祿位: 'border-teal-400 bg-teal-50/50',
  財帛位: 'border-teal-400 bg-teal-50/50',
};

const PalaceCell: React.FC<{
  palace: ZiweiPalace;
  isSoulPalace: boolean;
  /** The 運限 layer the board is currently anchored to, if any. */
  activeScope?: ZiweiHoroscopeScope | null;
  /** One-character prefix for that layer, e.g. 大 / 年 / 小. */
  scopePrefix?: string;
  /** starName → 祿/權/科/忌 for the active layer. */
  layerMutagen?: Map<string, string>;
  /** Role within the current 三方四正 selection, if any. */
  role?: string;
  /** True when some other palace is selected, so this one steps back. */
  dimmed?: boolean;
  onSelect: () => void;
}> = ({
  palace,
  isSoulPalace,
  activeScope,
  scopePrefix,
  layerMutagen,
  role,
  dimmed,
  onSelect,
}) => {
  const isScopeSoul = activeScope != null && activeScope.index === palace.index;

  // Name this palace takes on inside the active layer, e.g. 命宮 becomes 大財帛.
  const scopeName = activeScope?.palace_names?.[palace.index];

  const badgeFor = (name: string) => {
    const m = layerMutagen?.get(name);
    return m ? `${scopePrefix ?? ''}${m}` : undefined;
  };

  // A live 三方四正 selection overrides the resting colouring, otherwise the
  // two highlight systems fight for the same borders.
  const border = role
    ? ROLE_BORDER[role]
    : isScopeSoul
      ? 'border-orange-400 bg-orange-50/50'
      : isSoulPalace
        ? 'border-amber-400 bg-amber-50/40'
        : 'border-gray-200 bg-white/60';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-pressed={role === '本宮'}
      className={`flex min-h-[132px] cursor-pointer flex-col justify-between border p-1.5 transition-all hover:brightness-95 ${border} ${
        dimmed ? 'opacity-45' : ''
      }`}
    >
      {role && (
        <span className="mb-0.5 self-start rounded-sm bg-gray-800 px-1 text-[10px] leading-tight text-white">
          {role}
        </span>
      )}
      {/* 主星 / 輔星 */}
      <div className="space-y-0.5">
        <div className="flex flex-wrap gap-x-1.5 gap-y-0.5">
          {palace.major_stars.map((s) => (
            <StarName key={s.name} star={s} tone="major" layerBadge={badgeFor(s.name)} />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-1.5 gap-y-0.5">
          {palace.minor_stars.map((s) => (
            <StarName key={s.name} star={s} tone="minor" layerBadge={badgeFor(s.name)} />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-1 gap-y-0.5 leading-tight">
          {palace.adjective_stars.map((s) => (
            <StarName key={s.name} star={s} tone="adjective" />
          ))}
        </div>
      </div>

      {/* 十二神 + 大限 + 宮位標示 */}
      <div className="mt-1 space-y-0.5">
        <div className="flex flex-wrap gap-x-1.5 text-[10px] text-gray-400">
          <span>{palace.changsheng12}</span>
          <span>{palace.boshi12}</span>
          <span>{palace.jiangqian12}</span>
          <span>{palace.suiqian12}</span>
        </div>

        <div className="flex items-end justify-between gap-1">
          <div className="text-[10px] leading-tight text-gray-500">
            {palace.decadal?.range?.length === 2 && (
              <div>
                {palace.decadal.range[0]}–{palace.decadal.range[1]}
              </div>
            )}
            {scopeName && (
              <div className="text-orange-600">
                {scopePrefix}
                {scopeName}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 whitespace-nowrap">
            {palace.is_body_palace && (
              <span className="rounded-sm border border-amber-400 bg-amber-100 px-1 text-[10px] text-amber-800">
                身
              </span>
            )}
            {isScopeSoul && (
              <span className="rounded-sm border border-orange-400 bg-orange-100 px-1 text-[10px] text-orange-700">
                {activeScope?.name}
              </span>
            )}
            <span className="chinese-text text-[13px] font-bold text-gray-800">{palace.name}</span>
            <span className="text-[11px] text-gray-500">
              {palace.heavenly_stem}
              {palace.earthly_branch}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) =>
  value ? (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[11px] text-gray-500">{label}</span>
      <span className="chinese-text text-[13px] text-gray-800">{value}</span>
    </div>
  ) : null;

const ZiweiChart: React.FC<ZiweiChartProps> = ({ chart }) => {
  const byIndex = React.useMemo(
    () => [...chart.palaces].sort((a, b) => a.index - b.index),
    [chart.palaces],
  );
  const horoscope = chart.horoscope;

  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
  const [layerKey, setLayerKey] = React.useState<HoroscopeLayerKey>('natal');

  // Only offer layers the backend actually returned for this date.
  const layers = React.useMemo(
    () =>
      HOROSCOPE_LAYERS.filter(
        (l) => l.key === 'natal' || (horoscope && horoscope[l.field] != null),
      ),
    [horoscope],
  );

  const activeLayer = layers.find((l) => l.key === layerKey) ?? layers[0];
  const activeScope =
    activeLayer && activeLayer.key !== 'natal' && horoscope
      ? horoscope[activeLayer.field]
      : null;

  // iztro lists a scope's 四化 stars positionally, in 祿權科忌 order.
  const layerMutagen = React.useMemo(() => {
    const map = new Map<string, string>();
    activeScope?.mutagen?.forEach((star, i) => {
      if (star && MUTAGEN_ORDER[i]) map.set(star, MUTAGEN_ORDER[i]);
    });
    return map;
  }, [activeScope]);

  const roleByIndex = React.useMemo(() => {
    if (selectedIndex === null) return null;
    const map = new Map<number, string>();
    surroundedRoles(selectedIndex).forEach(({ index, role }) => map.set(index, role));
    return map;
  }, [selectedIndex]);

  const surroundedEntries: SurroundedEntry[] = React.useMemo(() => {
    if (selectedIndex === null) return [];
    return surroundedRoles(selectedIndex)
      .map(({ index, role }): SurroundedEntry | null => {
        const palace = byIndex.find((p) => p.index === index);
        if (!palace) return null;
        // 空宮借對宮：本宮無主星時，主星取自對宮（借星安宮）。
        const lender =
          palace.major_stars.length === 0
            ? byIndex.find((p) => p.index === (index + 6) % 12)
            : undefined;
        return {
          role,
          palace,
          borrowedMajor: lender?.major_stars ?? [],
          borrowedFrom: lender?.name,
        };
      })
      .filter((e): e is SurroundedEntry => e !== null);
  }, [selectedIndex, byIndex]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mx-auto w-full max-w-6xl"
    >
      <div className="chinese-card p-3 md:p-6">
        <div className="mb-4 text-center">
          <h2 className="chinese-title text-2xl md:text-3xl">紫微斗數命盤</h2>
          <p className="chinese-text mt-1 text-sm text-gray-500">
            {chart.solar_date} · {chart.time} · {chart.five_elements_class}
          </p>
        </div>

        {/* The board is dense; let it scroll rather than squeezing the cells. */}
        <div className="overflow-x-auto">
          <div className="grid min-w-[760px] grid-cols-4 grid-rows-4 gap-px bg-gray-200">
            {byIndex.map((palace) => (
              <div key={palace.index} className={GRID_POSITION[palace.index]}>
                <PalaceCell
                  palace={palace}
                  isSoulPalace={palace.earthly_branch === chart.soul_palace_branch}
                  activeScope={activeScope}
                  scopePrefix={activeLayer?.prefix}
                  layerMutagen={layerMutagen}
                  role={roleByIndex?.get(palace.index)}
                  dimmed={roleByIndex != null && !roleByIndex.has(palace.index)}
                  onSelect={() =>
                    setSelectedIndex((prev) => (prev === palace.index ? null : palace.index))
                  }
                />
              </div>
            ))}

            {/* 中宮 */}
            <div className="col-start-2 row-start-2 col-span-2 row-span-2 bg-white/70 p-3">
              <div className="grid h-full grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
                <div className="space-y-1">
                  <InfoRow label="陽曆" value={chart.solar_date} />
                  <InfoRow label="農曆" value={chart.lunar_date} />
                  <InfoRow label="四柱" value={chart.chinese_date} />
                  <InfoRow label="時辰" value={`${chart.time} ${chart.time_range}`} />
                  <InfoRow label="性別" value={chart.gender} />
                </div>
                <div className="space-y-1">
                  <InfoRow label="五行局" value={chart.five_elements_class} />
                  <InfoRow label="命主" value={chart.soul} />
                  <InfoRow label="身主" value={chart.body} />
                  <InfoRow label="生肖" value={chart.zodiac} />
                  <InfoRow label="星座" value={chart.sign} />
                </div>

                {horoscope && (
                  <div className="col-span-full mt-2 border-t border-gray-200 pt-2">
                    <div className="mb-1 flex items-baseline gap-2">
                      <span className="chinese-text text-[13px] font-semibold text-gray-700">
                        運限
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {horoscope.solar_date}
                        {horoscope.nominal_age != null && ` · 虛歲 ${horoscope.nominal_age}`}
                      </span>
                    </div>
                    {/* Pick which layer the whole board is anchored to. */}
                    <div className="mb-2 flex flex-wrap gap-1">
                      {layers.map((l) => {
                        const scope = l.key === 'natal' ? null : horoscope[l.field];
                        const active = l.key === activeLayer?.key;
                        return (
                          <button
                            key={l.key}
                            type="button"
                            onClick={() => setLayerKey(l.key)}
                            className={`rounded-sm border px-2 py-0.5 text-[11px] leading-tight transition-colors ${
                              active
                                ? 'border-orange-500 bg-orange-500 text-white'
                                : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                            }`}
                          >
                            {l.label}
                            {scope && (
                              <span className={`ml-1 ${active ? 'opacity-80' : 'text-gray-400'}`}>
                                {scope.heavenly_stem}
                                {scope.earthly_branch}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {activeScope ? (
                      <div className="text-[11px] leading-relaxed text-gray-600">
                        <span className="text-gray-400">{activeScope.name}四化　</span>
                        {activeScope.mutagen.map((star, i) => (
                          <span key={star} className="mr-2 whitespace-nowrap">
                            {star}
                            <span className="text-orange-600">
                              {activeLayer?.prefix}
                              {MUTAGEN_ORDER[i]}
                            </span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-gray-400">
                        本命盤。點上方任一運限，十二宮會換成該限宮名並標出該限四化。
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-gray-500">
          {selectedIndex === null ? (
            <>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-sm border border-amber-400 bg-amber-50" />
                命宮
              </span>
              {activeScope && (
                <span className="flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded-sm border border-orange-400 bg-orange-50" />
                  {activeScope.name}命宮
                </span>
              )}
              <span>本命四化 祿 權 科 忌</span>
              {activeLayer && activeLayer.key !== 'natal' && (
                <span className="text-orange-600">
                  橘色為{activeLayer.label}四化
                </span>
              )}
              <span className="text-gray-400">· 點擊任一宮位看三方四正</span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-sm border border-amber-500 bg-amber-50" />
                本宮
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-sm border border-indigo-400 bg-indigo-50" />
                對宮
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-sm border border-teal-400 bg-teal-50" />
                三合（官祿位・財帛位）
              </span>
              <button
                type="button"
                onClick={() => setSelectedIndex(null)}
                className="underline underline-offset-2 hover:text-gray-800"
              >
                取消選取
              </button>
            </>
          )}
        </div>

        {chart.year_divide === 'normal' && (
          <p className="mt-3 text-center text-[11px] leading-relaxed text-gray-400">
            年干支以農曆正月初一分界（紫微慣例），與八字盤的立春分界不同，
            出生日落在兩者之間者四柱與四化會有差異。
          </p>
        )}
      </div>

      <AnimatePresence mode="wait">
        {surroundedEntries.length > 0 && (
          <ZiweiSurroundedPanel
            key={selectedIndex}
            entries={surroundedEntries}
            onClose={() => setSelectedIndex(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ZiweiChart;
