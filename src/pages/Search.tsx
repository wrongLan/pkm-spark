import { useState, useCallback } from 'react';
import { SearchBox } from '@/components/SearchBox';
import { ResultsList } from '@/components/ResultsList';
import { ResultDrawer } from '@/components/ResultDrawer';
import { SearchResult } from '@/lib/types';
import { search } from '@/lib/api';

export default function Search() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSearch = useCallback(async (searchQuery: string) => {
    setQuery(searchQuery);
    setError(null);

    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await search(searchQuery);
      setResults(response.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleResultClick = useCallback((result: SearchResult) => {
    setSelectedResult(result);
    setDrawerOpen(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">PKM Search</h1>
            <p className="text-muted-foreground">
              Search through your personal knowledge management system
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <SearchBox onSearch={handleSearch} />
          </div>

          <ResultsList
            results={results}
            loading={loading}
            error={error}
            query={query}
            onResultClick={handleResultClick}
          />

          <ResultDrawer
            result={selectedResult}
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
          />
        </div>
      </div>
    </div>
  );
}