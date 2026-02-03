export interface FeedbackEntry {
  source: string;
  content: string;
  raw_data?: string;
}

export interface ThemeAnalysis {
  name: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  summary: string;
  count: number;
}

export interface AnalysisResult {
  themes: ThemeAnalysis[];
}

export interface Env {
  DB: D1Database;
  AI: any;
}
