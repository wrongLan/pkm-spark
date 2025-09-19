import { ExternalLink } from 'lucide-react';
import { SearchResult } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

interface ResultItemProps {
  result: SearchResult;
  onClick: () => void;
  className?: string;
  isSelected: boolean;
  onToggleSelect: () => void;
}

export function ResultItem({ result, onClick, className, isSelected, onToggleSelect }: ResultItemProps) {
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelect();
  };

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (result.url) {
      window.open(result.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className={cn(
        "p-4 border border-border rounded-lg transition-colors",
        "hover:bg-result-hover hover:border-primary/20",
        isSelected && "bg-primary/5 border-primary/30",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="pt-1" onClick={handleCheckboxClick}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelect}
            aria-label={`Select ${result.title}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 
            className={cn(
              "font-medium truncate mb-1 cursor-pointer transition-colors",
              result.url ? "text-primary hover:text-primary/80" : "text-foreground"
            )}
            onClick={result.url ? handleTitleClick : onClick}
            title={result.title}
          >
            {result.title}
          </h3>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-1 bg-muted rounded-full text-xs text-muted-foreground">
              {result.source}
            </span>
            {result.score && (
              <span className="inline-flex items-center px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
                {(result.score * 100).toFixed(1)}%
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {result.url && (
            <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )}
          <button
            onClick={onClick}
            className="text-xs text-primary hover:text-primary/80 transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}