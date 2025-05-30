export interface BaziInput {
  year: number;
  month: number;
  day: number;
  hour: number;
}

export interface BaziChart {
  year_ganzhi: string;
  month_ganzhi: string;
  day_ganzhi: string;
  hour_ganzhi: string;
}

export interface AnalysisResponse {
  analysis: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
} 