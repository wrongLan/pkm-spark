import { ExternalLink } from 'lucide-react';
import { SearchResult } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ResultItemProps {
  result: SearchResult;
  onClick: () => void;
  className?: string;
}

export function ResultItem({ result, onClick, className }: ResultItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 border border-border rounded-lg cursor-pointer transition-colors",
        "hover:bg-result-hover hover:border-primary/20",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate mb-1">
            {result.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {result.source}
          </p>
          {result.score && (
            <div className="mt-2">
              <div className="inline-flex items-center px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
                Score: {(result.score * 100).toFixed(1)}%
              </div>
            </div>
          )}
        </div>
        {result.url && (
          <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
      </div>
    </div>
  );
}