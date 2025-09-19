import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { SearchBox } from '@/components/SearchBox';
import { ResultsList } from '@/components/ResultsList';
import { ResultDrawer } from '@/components/ResultDrawer';
import { Toolbar } from '@/components/Toolbar';
import { FiltersPanel } from '@/components/FiltersPanel';
import { SearchResult, TagOption, TagFilterMode } from '@/lib/types';
import { search, deleteItem, exportItems, fetchTags, applyTags } from '@/lib/api';
import { Button } from '@/components/ui/button';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Filter state
  const [availableTags, setAvailableTags] = useState<TagOption[]>([]);
  const [tagsFromResults, setTagsFromResults] = useState<TagOption[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [serverTagsAvailable, setServerTagsAvailable] = useState(true);

  // Get state from URL parameters
  const query = searchParams.get('q') || '';
  const selectedTags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
  const filterMode = (searchParams.get('mode') as TagFilterMode) || 'any';

  // Load tags when component mounts
  useEffect(() => {
    loadAvailableTags();
  }, []);

  // Update filtered results when results or filters change
  useEffect(() => {
    applyClientSideFiltering();
  }, [results, selectedTags, filterMode]);

  // Search when query changes
  useEffect(() => {
    if (query) {
      handleSearch(query);
    } else {
      setResults([]);
    }
  }, [query]);

  const loadAvailableTags = async () => {
    setIsLoadingTags(true);
    try {
      const tags = await fetchTags();
      setAvailableTags(tags);
      setServerTagsAvailable(true);
    } catch (error: any) {
      if (error.message === 'NOT_AVAILABLE') {
        setServerTagsAvailable(false);
        setAvailableTags(tagsFromResults);
      } else {
        console.error('Failed to load tags:', error);
      }
    } finally {
      setIsLoadingTags(false);
    }
  };

  const extractTagsFromResults = (searchResults: SearchResult[]) => {
    const tagCounts = new Map<string, number>();
    
    searchResults.forEach(result => {
      if (result.tags) {
        result.tags.forEach(tag => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      }
    });

    const tags: TagOption[] = Array.from(tagCounts.entries()).map(([name, count]) => ({
      name,
      count
    }));

    setTagsFromResults(tags);
    
    if (!serverTagsAvailable) {
      setAvailableTags(tags);
    }
  };

  const applyClientSideFiltering = () => {
    let filtered = results;

    if (selectedTags.length > 0) {
      filtered = results.filter(result => {
        if (!result.tags || result.tags.length === 0) return false;
        
        if (filterMode === 'all') {
          return selectedTags.every(tag => result.tags?.includes(tag));
        } else {
          return selectedTags.some(tag => result.tags?.includes(tag));
        }
      });
    }

    setFilteredResults(filtered);
  };

  const updateURLParams = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    setSearchParams(newParams);
  };

  const handleSearch = useCallback(async (searchQuery: string) => {
    updateURLParams({ q: searchQuery });
    setError(null);
    setSelectedIds(new Set()); // Clear selections on new search

    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // Try server-side filtering first
      const tagsAny = filterMode === 'any' ? selectedTags : undefined;
      const tagsAll = filterMode === 'all' ? selectedTags : undefined;
      
      const response = await search(searchQuery, 20, tagsAny, tagsAll);
      setResults(response.results);
      extractTagsFromResults(response.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [selectedTags, filterMode]);

  const handleTagsChange = (tags: string[]) => {
    updateURLParams({ 
      tags: tags.length > 0 ? tags.join(',') : null 
    });
    
    // Re-search if we have a query to apply server-side filtering
    if (query) {
      handleSearch(query);
    }
  };

  const handleFilterModeChange = (mode: TagFilterMode) => {
    updateURLParams({ mode });
    
    // Re-search if we have a query to apply server-side filtering
    if (query) {
      handleSearch(query);
    }
  };

  const handleClearFilters = () => {
    updateURLParams({ 
      tags: null, 
      mode: null 
    });
    
    // Re-search if we have a query
    if (query) {
      handleSearch(query);
    }
  };

  const handleTagsUpdate = async (itemId: string, newTags: string[]) => {
    try {
      const item = results.find(r => r.id === itemId);
      if (!item) return;

      const currentTags = item.tags || [];
      const added = newTags.filter(tag => !currentTags.includes(tag));
      const removed = currentTags.filter(tag => !newTags.includes(tag));

      await applyTags(itemId, added, removed);
      
      // Update the item in results
      setResults(prev => prev.map(r => 
        r.id === itemId ? { ...r, tags: newTags } : r
      ));
      
      // Update selected result if it's the same item
      if (selectedResult?.id === itemId) {
        setSelectedResult(prev => prev ? { ...prev, tags: newTags } : null);
      }

      console.log('Tags updated successfully');
    } catch (error: any) {
      if (error.message === 'NOT_AVAILABLE') {
        // Keep changes in memory for session
        setResults(prev => prev.map(r => 
          r.id === itemId ? { ...r, tags: newTags } : r
        ));
        
        if (selectedResult?.id === itemId) {
          setSelectedResult(prev => prev ? { ...prev, tags: newTags } : null);
        }

        console.log('Server tagging not enabled—changes are temporary');
      } else {
        console.error('Failed to update tags:', error);
        throw error;
      }
    }
  };

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
      setSelectedIds(new Set(filteredResults.map(r => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  }, [filteredResults]);

  const handleExportSelected = useCallback(async () => {
    const selectedIdsArray = Array.from(selectedIds);
    if (selectedIdsArray.length === 0) return;

    setIsExporting(true);
    try {
      // Try to use the API endpoint
      const items = await exportItems(selectedIdsArray);
      downloadJSON(items, 'pkm-export.json');
      console.log("Export successful", `Exported ${items.length} items`);
    } catch (err) {
      if (err instanceof Error && err.message === 'NOT_AVAILABLE') {
        // Fallback to client-side export
        const selectedResults = filteredResults.filter(r => selectedIds.has(r.id));
        downloadJSON(selectedResults, 'pkm-export.json');
        console.log("Export completed (fallback)", `Exported ${selectedResults.length} items using fallback method`);
      } else {
        console.error("Export failed", err instanceof Error ? err.message : 'Export failed');
      }
    } finally {
      setIsExporting(false);
    }
  }, [selectedIds, filteredResults]);

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
      console.log("Item deleted", "The item has been removed from your library");
    } catch (err) {
      if (err instanceof Error && err.message === 'NOT_AVAILABLE') {
        console.log("Delete not available yet", "This feature is not yet available on the backend");
      } else {
        console.error("Delete failed", err instanceof Error ? err.message : 'Delete failed');
      }
    } finally {
      setIsDeleting(false);
    }
  }, []);

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
          <div className="flex items-center justify-between mb-8">
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">PKM Search</h1>
              <p className="text-muted-foreground">
                Search through your personal knowledge management system
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="flex items-center gap-2"
            >
              <Link to="/settings/categories">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </Button>
          </div>

          <div className="flex justify-center mb-8">
            <SearchBox onSearch={handleSearch} initialValue={query} />
          </div>

          {/* Filters Panel */}
          <FiltersPanel
            availableTags={availableTags}
            selectedTags={selectedTags}
            filterMode={filterMode}
            onTagsChange={handleTagsChange}
            onModeChange={handleFilterModeChange}
            onClear={handleClearFilters}
            className="mb-6"
          />

          {filteredResults.length > 0 && (
            <Toolbar 
              selectedCount={selectedIds.size}
              onExportSelected={handleExportSelected}
              isExporting={isExporting}
            />
          )}

          <ResultsList
            results={filteredResults}
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
            onTagsUpdate={handleTagsUpdate}
            availableTags={availableTags}
            isDeleting={isDeleting}
          />
        </div>
      </div>
    </div>
  );
}
