import React, { useState, useEffect } from 'react';
import { X, Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { TagOption, TagFilterMode } from '@/lib/types';
import { cn } from '@/lib/utils';

interface FiltersPanelProps {
  availableTags: TagOption[];
  selectedTags: string[];
  filterMode: TagFilterMode;
  onTagsChange: (tags: string[]) => void;
  onModeChange: (mode: TagFilterMode) => void;
  onClear: () => void;
  className?: string;
}

export function FiltersPanel({
  availableTags,
  selectedTags,
  filterMode,
  onTagsChange,
  onModeChange,
  onClear,
  className
}: FiltersPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasActiveFilters = selectedTags.length > 0;

  const toggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onTagsChange(selectedTags.filter(t => t !== tagName));
    } else {
      onTagsChange([...selectedTags, tagName]);
    }
  };

  const removeTag = (tagName: string) => {
    onTagsChange(selectedTags.filter(t => t !== tagName));
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {selectedTags.map(tag => (
            <Badge 
              key={tag} 
              variant="default" 
              className="flex items-center gap-1"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                aria-label={`Remove ${tag} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear all
          </Button>
        </div>
      )}

      {/* Filters collapsible */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filter by tags
            <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-3 space-y-3">
          {/* Filter mode */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Match:</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="filterMode"
                value="any"
                checked={filterMode === 'any'}
                onChange={() => onModeChange('any')}
                className="text-primary"
              />
              <span className="text-sm">ANY selected tag</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="filterMode"
                value="all"
                checked={filterMode === 'all'}
                onChange={() => onModeChange('all')}
                className="text-primary"
              />
              <span className="text-sm">ALL selected tags</span>
            </label>
          </div>

          {/* Tag selection */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Select tags:</span>
            <div className="max-h-48 overflow-y-auto space-y-1 border rounded p-2">
              {availableTags.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  No tags available. Tags will appear as you search.
                </p>
              ) : (
                availableTags.map(tag => (
                  <label 
                    key={tag.name}
                    className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
                  >
                    <Checkbox
                      checked={selectedTags.includes(tag.name)}
                      onCheckedChange={() => toggleTag(tag.name)}
                    />
                    <span className="text-sm flex-1">{tag.name}</span>
                    {tag.count && (
                      <span className="text-xs text-muted-foreground">
                        ({tag.count})
                      </span>
                    )}
                  </label>
                ))
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}