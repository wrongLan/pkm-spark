import { SearchResponse, Item, TagOption } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export async function search(
  query: string, 
  limit = 20,
  tagsAny?: string[],
  tagsAll?: string[]
): Promise<SearchResponse> {
  const body: any = { q: query, limit };
  if (tagsAny?.length) body.tagsAny = tagsAny;
  if (tagsAll?.length) body.tagsAll = tagsAll;

  const response = await fetch(`${API_BASE_URL}/search/v1/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
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

export async function fetchTags(): Promise<TagOption[]> {
  const response = await fetch(`${API_BASE_URL}/tags/v1`);
  
  if (!response.ok) {
    if (response.status === 404 || response.status === 501) {
      throw new Error('NOT_AVAILABLE');
    }
    throw new Error(`Fetch tags failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.tags;
}

export async function applyTags(
  itemId: string, 
  add: string[] = [], 
  remove: string[] = []
): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/items/v1/${itemId}/tags`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ add, remove }),
  });

  if (!response.ok) {
    if (response.status === 404 || response.status === 501) {
      throw new Error('NOT_AVAILABLE');
    }
    throw new Error(`Apply tags failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.tags;
}

export async function fetchCategories(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/categories/v1`);
  
  if (!response.ok) {
    if (response.status === 404 || response.status === 501) {
      throw new Error('NOT_AVAILABLE');
    }
    throw new Error(`Fetch categories failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.categories;
}

export async function saveCategories(categories: string[]): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/categories/v1`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ categories }),
  });

  if (!response.ok) {
    if (response.status === 404 || response.status === 501) {
      throw new Error('NOT_AVAILABLE');
    }
    throw new Error(`Save categories failed: ${response.statusText}`);
  }
}

export async function proposeCategories(sample = 200): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/categories/v1/propose?sample=${sample}`, {
    method: 'POST',
  });

  if (!response.ok) {
    if (response.status === 404 || response.status === 501) {
      throw new Error('NOT_AVAILABLE');
    }
    throw new Error(`Propose categories failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.proposal;
}