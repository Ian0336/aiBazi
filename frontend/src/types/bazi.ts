export interface BaziInput {
  year: number;
  month: number;
  day: number;
  hour: number;
}

export interface HiddenStem {
  gan: string;
  wuxing: string;
  ten_deity: string;
}

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
  day_master: string;
  day_master_wuxing: string;
  wuxing_count: Record<string, number>;
  day_master_strength: number;
  is_strong: boolean;
  gender: string;
  summary: string;
}

export interface BaziChart {
  year_ganzhi: string;
  month_ganzhi: string;
  day_ganzhi: string;
  hour_ganzhi: string;
  year_pillar: BaziPillar;
  month_pillar: BaziPillar;
  day_pillar: BaziPillar;
  hour_pillar: BaziPillar;
  lunar_date: string;
  solar_date: string;
  nayin: Record<string, string>;
  empty_positions: EmptyPositions;
  analysis: Analysis;
}

export interface AnalysisResponse {
  analysis: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
} 