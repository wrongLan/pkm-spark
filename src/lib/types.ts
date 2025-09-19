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