# PKM Search App

A minimal React-based Personal Knowledge Management (PKM) search interface.

## Features

- **Search Interface**: Clean, debounced search with real-time results
- **Result Details**: Expandable drawer showing detailed result information  
- **API Integration**: Connects to your backend search service
- **Responsive Design**: Works on desktop and mobile devices
- **TypeScript Support**: Full type safety throughout the application

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- pnpm (or npm/yarn)

### Installation

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Edit `.env.local` and set your API base URL:
```bash
VITE_API_BASE_URL=http://localhost:3000
```

5. Start the development server:
```bash
pnpm dev
```

The app will be available at `http://localhost:8080`

## API Integration

The app expects your backend to provide a search endpoint:

**Endpoint**: `POST ${VITE_API_BASE_URL}/search/v1/query`

**Request Body**:
```json
{
  "q": "search query",
  "limit": 20
}
```

**Response**:
```json
{
  "results": [
    {
      "id": "unique-id",
      "source": "source-name",
      "title": "Result Title",
      "url": "https://optional-link.com",
      "score": 0.95
    }
  ],
  "total": 1
}
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── SearchBox.tsx   # Search input with debouncing
│   ├── ResultsList.tsx # Results display with states
│   ├── ResultItem.tsx  # Individual result item
│   └── ResultDrawer.tsx # Result detail drawer
├── lib/
│   ├── api.ts          # API client functions
│   ├── types.ts        # TypeScript interfaces
│   └── ports.ts        # Future feature stubs
└── pages/
    ├── Index.tsx       # Redirects to /search
    └── Search.tsx      # Main search page
```

## Future Features

The following features are stubbed in `lib/ports.ts` and ready for implementation:

- `embed()` - Text embedding functionality
- `tag()` - Item tagging system  
- `exportItems()` - Data export capabilities
- `deleteItem()` - Item deletion

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **Radix UI** - Accessible component primitives
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching

## Development

- Run `pnpm dev` to start the development server
- Run `pnpm build` to create a production build
- Run `pnpm preview` to preview the production build locally

## Deployment

Deploy using any static hosting service (Vercel, Netlify, etc.) or serve the `dist` folder after running `pnpm build`.

Remember to set the `VITE_API_BASE_URL` environment variable in your deployment environment.