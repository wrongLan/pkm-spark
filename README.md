# PKM Search

A minimal personal knowledge management search interface built with React, Vite, and Tailwind CSS.

## Features

- **Search Interface**: Clean, debounced search with real-time results
- **Results Display**: Shows title, source, and relevance scores with checkboxes
- **Selection & Export**: Select multiple items and export as JSON
- **Item Management**: View detailed information and delete items
- **Result Details**: Click any result to view detailed information in a slide-out drawer
- **Loading States**: Proper loading, empty, and error state handling
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm (or npm/yarn)
- A backend API that implements the search endpoint

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   
4. Edit `.env.local` and set your API base URL (defaults to http://127.0.0.1:8000):
   ```
   VITE_API_BASE_URL=http://your-backend-url:port
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:5173](http://localhost:5173) in your browser

## API Requirements

Your backend must implement:

### Search Endpoint (Required)
```
POST {API_BASE_URL}/search/v1/query
Content-Type: application/json

Body: { "q": "search query", "limit": 20 }
Response: { "results": SearchResult[], "total": number }
```

### Delete Endpoint (Optional - Phase 2)
```
DELETE {API_BASE_URL}/items/v1/{id}
Response: { "deleted": 1 }
```

### Export Endpoint (Optional - Phase 2)
```
GET {API_BASE_URL}/export/v1?ids=comma,separated,ids
Response: Item[]
```

Where `SearchResult` has the shape:
```typescript
{
  id: string;
  source: string;
  title: string;
  url?: string;
  score?: number;
}
```

And `Item` extends `SearchResult` with:
```typescript
{
  created_at?: string;
  content_text?: string;
  metadata?: Record<string, any>;
}
```

## Testing Checklist

1. **Backend Setup**: Start your backend and confirm `GET /health` works
2. **Frontend**: Run `pnpm dev` and open http://localhost:5173
3. **Search**: Search for a known term → see results with checkboxes
4. **Selection**: Click checkboxes to select items, use "Select all"
5. **Export**: 
   - Select items → click "Export Selected"
   - If backend export exists: downloads full JSON from API
   - If not: downloads fallback JSON of selected rows as `pkm-export.json`
6. **Item Details**: Click "View Details" → drawer opens with metadata
7. **External Links**: Click item titles (if URL present) → opens in new tab
8. **Delete**: 
   - In item drawer → click Delete → confirm dialog
   - If backend delete exists: item disappears from list
   - If not: shows toast "Delete not available yet"

## Error Handling

- **Missing Endpoints**: Graceful fallbacks with user-friendly messages
- **CORS Issues**: Check backend allows `http://localhost:5173`
- **Network Errors**: Toast notifications with helpful error messages
- **Empty States**: Clear messaging for no results or empty searches

## Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── SearchBox.tsx    # Search input with debouncing
│   ├── ResultsList.tsx  # Results list with checkboxes
│   ├── ResultItem.tsx   # Individual result item
│   ├── ResultDrawer.tsx # Details panel with delete
│   └── Toolbar.tsx      # Export selected button
├── lib/
│   ├── api.ts          # API client functions
│   ├── types.ts        # TypeScript interfaces
│   ├── ports.ts        # Future API stubs
│   └── utils.ts        # Utility functions
└── pages/
    ├── Index.tsx       # Redirects to search
    └── Search.tsx      # Main search page with state management
```

## Contributing

This implementation includes search, selection, export, and delete functionality with proper error handling and fallbacks.