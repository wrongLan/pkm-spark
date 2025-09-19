import { SearchResponse } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.warn('VITE_API_BASE_URL not configured. API calls will fail.');
}

export async function search(query: string, limit = 20): Promise<SearchResponse> {
  if (!API_BASE_URL) {
    throw new Error('API base URL not configured');
  }

  const response = await fetch(`${API_BASE_URL}/search/v1/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: query, limit }),
  });

  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }

  return response.json();
}