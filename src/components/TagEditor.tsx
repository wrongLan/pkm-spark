import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SearchResult, TagOption } from '@/lib/types';

interface TagEditorProps {
  result: SearchResult;
  availableTags: TagOption[];
  onSave: (add: string[], remove: string[]) => Promise<void>;
  isLoading?: boolean;
}

export function TagEditor({ result, availableTags, onSave, isLoading = false }: TagEditorProps) {
  const [currentTags, setCurrentTags] = useState<string[]>(result.tags || []);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const originalTags = result.tags || [];

  useEffect(() => {
    setCurrentTags(result.tags || []);
  }, [result.tags]);

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = availableTags
        .filter(tag => 
          tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
          !currentTags.includes(tag.name)
        )
        .map(tag => tag.name)
        .slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [inputValue, currentTags, availableTags]);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !currentTags.some(t => t.toLowerCase() === trimmedTag)) {
      setCurrentTags([...currentTags, trimmedTag]);
      setInputValue('');
      setSuggestions([]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCurrentTags(currentTags.filter(tag => tag !== tagToRemove));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Escape') {
      setInputValue('');
      setSuggestions([]);
      inputRef.current?.blur();
    }
  };

  const handleSave = async () => {
    const added = currentTags.filter(tag => !originalTags.includes(tag));
    const removed = originalTags.filter(tag => !currentTags.includes(tag));
    
    if (added.length > 0 || removed.length > 0) {
      await onSave(added, removed);
    }
  };

  const handleCancel = () => {
    setCurrentTags(originalTags);
    setInputValue('');
    setSuggestions([]);
  };

  const hasChanges = JSON.stringify(currentTags.sort()) !== JSON.stringify(originalTags.sort());

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-2">Tags</p>
        
        {/* Current tags */}
        <div className="flex flex-wrap gap-1 mb-3 min-h-[32px]">
          {currentTags.length === 0 ? (
            <span className="text-sm text-muted-foreground italic">No tags</span>
          ) : (
            currentTags.map(tag => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                  aria-label={`Remove ${tag}`}
                  disabled={isLoading}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          )}
        </div>

        {/* Add tag input */}
        <div className="relative">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Add a tag..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => addTag(inputValue)}
              disabled={!inputValue.trim() || isLoading}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-10">
              {suggestions.map(tag => (
                <button
                  key={tag}
                  onClick={() => addTag(tag)}
                  className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {hasChanges && (
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}