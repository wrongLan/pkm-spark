import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TagChipsProps {
  tags?: string[];
  maxVisible?: number;
  className?: string;
}

export function TagChips({ tags = [], maxVisible = 3, className }: TagChipsProps) {
  if (!tags.length) return null;

  const visibleTags = tags.slice(0, maxVisible);
  const overflowCount = tags.length - maxVisible;

  return (
    <div className={cn("flex items-center gap-1 flex-wrap", className)}>
      {visibleTags.map((tag) => (
        <Badge key={tag} variant="secondary" className="text-xs">
          {tag}
        </Badge>
      ))}
      {overflowCount > 0 && (
        <Badge 
          variant="outline" 
          className="text-xs" 
          title={`Additional tags: ${tags.slice(maxVisible).join(', ')}`}
        >
          +{overflowCount}
        </Badge>
      )}
    </div>
  );
}