export interface SearchResult {
  id: string;
  source: string;
  title: string;
  url?: string;
  score?: number;
  tags?: string[];
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
  tags?: string[];
  created_at?: string;
  content_text?: string;
  metadata?: Record<string, any>;
}

export interface TagOption {
  name: string;
  count?: number;
}

export type TagFilterMode = 'any' | 'all';