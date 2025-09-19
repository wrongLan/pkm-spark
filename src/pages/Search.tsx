import { useState, useCallback } from 'react';
import { SearchBox } from '@/components/SearchBox';
import { ResultsList } from '@/components/ResultsList';
import { ResultDrawer } from '@/components/ResultDrawer';
import { Toolbar } from '@/components/Toolbar';
import { SearchResult } from '@/lib/types';
import { search, deleteItem, exportItems } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function Search() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleSearch = useCallback(async (searchQuery: string) => {
    setQuery(searchQuery);
    setError(null);
    setSelectedIds(new Set()); // Clear selections on new search

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

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(results.map(r => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  }, [results]);

  const handleExportSelected = useCallback(async () => {
    const selectedIdsArray = Array.from(selectedIds);
    if (selectedIdsArray.length === 0) return;

    setIsExporting(true);
    try {
      // Try to use the API endpoint
      const items = await exportItems(selectedIdsArray);
      downloadJSON(items, 'pkm-export.json');
      toast({
        title: "Export successful",
        description: `Exported ${items.length} items`,
      });
    } catch (err) {
      if (err instanceof Error && err.message === 'NOT_AVAILABLE') {
        // Fallback to client-side export
        const selectedResults = results.filter(r => selectedIds.has(r.id));
        downloadJSON(selectedResults, 'pkm-export.json');
        toast({
          title: "Export completed (fallback)",
          description: `Exported ${selectedResults.length} items using fallback method`,
        });
      } else {
        toast({
          title: "Export failed",
          description: err instanceof Error ? err.message : 'Export failed',
          variant: "destructive",
        });
      }
    } finally {
      setIsExporting(false);
    }
  }, [selectedIds, results, toast]);

  const handleDelete = useCallback(async (id: string) => {
    setIsDeleting(true);
    try {
      await deleteItem(id);
      // Remove from results and selections
      setResults(prev => prev.filter(r => r.id !== id));
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      toast({
        title: "Item deleted",
        description: "The item has been removed from your library",
      });
    } catch (err) {
      if (err instanceof Error && err.message === 'NOT_AVAILABLE') {
        toast({
          title: "Delete not available yet",
          description: "This feature is not yet available on the backend",
        });
      } else {
        toast({
          title: "Delete failed", 
          description: err instanceof Error ? err.message : 'Delete failed',
          variant: "destructive",
        });
      }
    } finally {
      setIsDeleting(false);
    }
  }, [toast]);

  const downloadJSON = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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

          {results.length > 0 && (
            <Toolbar 
              selectedCount={selectedIds.size}
              onExportSelected={handleExportSelected}
              isExporting={isExporting}
            />
          )}

          <ResultsList
            results={results}
            loading={loading}
            error={error}
            query={query}
            onResultClick={handleResultClick}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
          />

          <ResultDrawer
            result={selectedResult}
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
        </div>
      </div>
    </div>
  );
}