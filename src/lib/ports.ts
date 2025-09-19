const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Future feature stubs - returning placeholder responses for now

export async function embed(text: string) {
  // TODO: Implement embedding functionality
  // POST ${API_BASE_URL}/embed/v1/create
  return { embedding: [], dimensions: 0 };
}

export async function tag(itemId: string, tags: string[]) {
  // TODO: Implement tagging functionality
  // POST ${API_BASE_URL}/tags/v1/apply
  return { success: true, tags };
}

export async function exportItems(format: 'json' | 'csv' = 'json') {
  // TODO: Implement export functionality
  // GET ${API_BASE_URL}/export/v1/${format}
  return { url: '', count: 0 };
}

export async function deleteItem(itemId: string) {
  // TODO: Implement delete functionality
  // DELETE ${API_BASE_URL}/items/v1/${itemId}
  return { success: true };
}