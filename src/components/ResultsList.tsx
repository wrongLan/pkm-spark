import React from 'react';
import { SearchResult } from '@/lib/types';
import { ResultItem } from './ResultItem';
import { Loader2, Search, AlertCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface ResultsListProps {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  query: string;
  onResultClick: (result: SearchResult) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
}

export function ResultsList({ results, loading, error, query, onResultClick, selectedIds, onToggleSelect, onSelectAll }: ResultsListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Searching...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!query.trim()) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Search className="h-4 w-4" />
          <span>Enter a search query to get started</span>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground mb-1">No results found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search terms</p>
        </div>
      </div>
    );
  }

  const allSelected = results.length > 0 && results.every(result => selectedIds.has(result.id));
  const someSelected = results.some(result => selectedIds.has(result.id));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
        </p>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={allSelected}
            onCheckedChange={(checked) => onSelectAll(!!checked)}
            aria-label="Select all results"
            ref={(el) => {
              if (el && el.querySelector('input')) {
                const input = el.querySelector('input') as HTMLInputElement;
                input.indeterminate = someSelected && !allSelected;
              }
            }}
          />
          <label className="text-sm text-muted-foreground">Select all</label>
        </div>
      </div>
      {results.map((result) => (
        <ResultItem
          key={result.id}
          result={result}
          onClick={() => onResultClick(result)}
          isSelected={selectedIds.has(result.id)}
          onToggleSelect={() => onToggleSelect(result.id)}
        />
      ))}
    </div>
  );
}