/** Types for the 紫微斗數 chart returned by POST /api/ziwei. */

export type ZiweiLanguage = 'zh-TW' | 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR' | 'vi-VN';

export interface ZiweiInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  gender: string;
  is_lunar: boolean;
  is_leap_month: boolean;
  language?: ZiweiLanguage;
  fix_leap?: boolean;
  /** Solar date 'YYYY-MM-DD'. Omit to skip 運限. */
  horoscope_date?: string;
}

export interface ZiweiStar {
  name: string;
  type?: string | null;
  scope?: string | null;
  /** 廟旺利陷 — 主星/輔星 only. */
  brightness?: string | null;
  /** 四化: 祿/權/科/忌 */
  mutagen?: string | null;
}

export interface ZiweiDecadal {
  /** [start, end] age range this palace governs. */
  range: number[];
  heavenly_stem?: string | null;
  earthly_branch?: string | null;
}

export interface ZiweiPalace {
  /** 0-11, fixed to the earthly-branch order 寅卯辰巳午未申酉戌亥子丑. */
  index: number;
  name: string;
  is_body_palace: boolean;
  is_original_palace: boolean;
  heavenly_stem: string;
  earthly_branch: string;
  major_stars: ZiweiStar[];
  minor_stars: ZiweiStar[];
  adjective_stars: ZiweiStar[];
  changsheng12: string;
  boshi12: string;
  jiangqian12: string;
  suiqian12: string;
  decadal?: ZiweiDecadal | null;
  ages: number[];
}

/** One layer of 運限 — 大限, 流年, 流月, 流日, 流時 or 小限. */
export interface ZiweiHoroscopeScope {
  /** Palace index this layer's 命宮 lands on. */
  index?: number | null;
  name?: string | null;
  heavenly_stem?: string | null;
  earthly_branch?: string | null;
  /** Palace names re-anchored to this layer, indexed by palace index. */
  palace_names: string[];
  /** 四化 stars of this layer, in 祿權科忌 order. */
  mutagen: string[];
  stars?: unknown;
}

export interface ZiweiHoroscope {
  solar_date: string;
  lunar_date: string;
  nominal_age?: number | null;
  decadal?: ZiweiHoroscopeScope | null;
  yearly?: ZiweiHoroscopeScope | null;
  monthly?: ZiweiHoroscopeScope | null;
  daily?: ZiweiHoroscopeScope | null;
  hourly?: ZiweiHoroscopeScope | null;
  /** 小限 — iztro calls this `age`. */
  age_scope?: ZiweiHoroscopeScope | null;
}

export interface ZiweiChart {
  solar_date: string;
  lunar_date: string;
  /** 四柱. See `year_divide` for which boundary convention produced it. */
  chinese_date: string;
  /**
   * 'normal' = 年干支以農曆正月初一分界 (iztro 預設), which differs from the
   * 八字 endpoint's 立春 boundary for roughly 7 days a year.
   */
  year_divide: string;
  time: string;
  time_range: string;
  time_index: number;
  gender: string;
  zodiac: string;
  sign: string;
  five_elements_class: string;
  soul: string;
  body: string;
  soul_palace_branch: string;
  body_palace_branch: string;
  language: string;
  palaces: ZiweiPalace[];
  horoscope?: ZiweiHoroscope | null;
}
