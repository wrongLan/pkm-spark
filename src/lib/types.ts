export interface SearchResult {
  id: string;
  source: string;
  title: string;
  url?: string;
  score?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
}

export interface Item {
  id: string;
  source: string;
  title: string;
  url?: string;
  score?: number;
  created_at?: string;
  content_text?: string;
  metadata?: Record<string, any>;
}