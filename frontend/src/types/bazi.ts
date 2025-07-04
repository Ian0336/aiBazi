export interface BaziInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  gender: string;
  is_lunar: boolean;
  is_leap_month: boolean;
}

export interface HiddenStem {
  gan: string;
  wuxing?: string;
  ten_deity: string;
  strength?: number;
}

export interface Pillar {
  ganzhi: string;
  gan: string;
  zhi: string;
  gan_wuxing: string;
  zhi_wuxing: string;
  ten_deity: string;
  zhi_ten_deity: string;
  hidden_stems: HiddenStem[];
  nayin: string;
  harmony: string;
  is_treasury: boolean;
}

export interface LiunianEntry {
  year: number;
  age: number;
  ganzhi: string;
  gan: string;
  zhi: string;
  gan_ten_deity: string;
  zhi_ten_deity: string;
  hidden_stems: HiddenStem[];
  zhi_relationships: string[];
  is_empty: boolean;
  is_repeated: boolean;
  nayin: string;
  special_combinations: string[];
  special_patterns: string[];
}

export interface DayunEntry {
  start_age: number;
  ganzhi: string;
  gan: string;
  zhi: string;
  gan_ten_deity: string;
  zhi_ten_deity: string;
  gan_yinyang: string;
  zhi_yinyang: string;
  hidden_stems: HiddenStem[];
  zhi_relationships: string[];
  is_empty: boolean;
  is_repeated: boolean;
  nayin: string;
  special_combinations: string[];
  liunian: LiunianEntry[];
}

// Legacy interfaces for backward compatibility
export interface BaziPillar {
  ganzhi: string;
  gan: string;
  zhi: string;
  gan_wuxing: string;
  zhi_wuxing: string;
  ten_deity: string;
  hidden_stems: HiddenStem[];
}

export interface EmptyPositions {
  empty_pair: string[];
  empty_in_chart: string[];
  count: number;
}

export interface Analysis {
  wuxing_analysis: {
    wuxing_scores: Record<string, number>;
    gan_scores: Record<string, number>;
    strongest_element: string;
    weakest_element: string;
    total_score: number;
  };
  root_analysis: string;
  day_master_strength: {
    is_strong: boolean;
    description: string;
  };
  combinations: {
    gong_combinations: any[];
    repeated_gans: Record<string, number>;
    repeated_zhis: Record<string, number>;
  };
  deity_distribution: {
    gan_deities: string[];
    zhi_deities: string[];
    deity_counts: Record<string, number>;
  };
  day_master_nature: {
    gan: string;
    is_yang: boolean;
    element: string;
  };
  special_stars: Record<string, any>;
  gender: string;
  recommendations: {
    lacking_element: string;
    strong_element: string;
    advice: string;
  };
}

export interface BaziChart {
  // New detailed structure from backend
  year_pillar: Pillar;
  month_pillar: Pillar;
  day_pillar: Pillar;
  hour_pillar: Pillar;
  dayun: DayunEntry[];
  lunar_date: string;
  solar_date: string;
  nayin: Record<string, string>;
  empty_positions: Record<string, any>;
  analysis: Record<string, any>;
  
  // Legacy fields for backward compatibility
  year_ganzhi?: string;
  month_ganzhi?: string;
  day_ganzhi?: string;
  hour_ganzhi?: string;
}

export interface AnalysisResponse {
  analysis: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
} 