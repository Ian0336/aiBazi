export interface BaziInput {
  year: number;
  month: number;
  day: number;
  hour: number;
}

export interface BaziPillar {
  cang_gan: string;
  gan: string;
  gan_wuxing: string;
  ganzhi: string;
  shi_shen: string;
  zhi: string;
  zhi_wuxing: string;
}

export interface BaziChart {
  year_pillar: BaziPillar;
  month_pillar: BaziPillar;
  day_pillar: BaziPillar;
  hour_pillar: BaziPillar;
  dayun: string;
  lunar_date: string;
}

export interface AnalysisResponse {
  analysis: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
} 