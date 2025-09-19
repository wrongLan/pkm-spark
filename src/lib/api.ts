import { SearchResponse, Item } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export async function search(query: string, limit = 20): Promise<SearchResponse> {
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

export async function deleteItem(id: string): Promise<{ deleted: number }> {
  const response = await fetch(`${API_BASE_URL}/items/v1/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    if (response.status === 404 || response.status === 501) {
      throw new Error('NOT_AVAILABLE');
    }
    throw new Error(`Delete failed: ${response.statusText}`);
  }

  return response.json();
}

export async function exportItems(ids: string[]): Promise<Item[]> {
  const response = await fetch(`${API_BASE_URL}/export/v1?ids=${ids.join(',')}`, {
    method: 'GET',
  });

  if (!response.ok) {
    if (response.status === 404 || response.status === 501) {
      throw new Error('NOT_AVAILABLE');
    }
    throw new Error(`Export failed: ${response.statusText}`);
  }

  return response.json();
}