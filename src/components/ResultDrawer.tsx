import { ExternalLink, X } from 'lucide-react';
import { SearchResult } from '@/lib/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface ResultDrawerProps {
  result: SearchResult | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResultDrawer({ result, open, onOpenChange }: ResultDrawerProps) {
  if (!result) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <SheetTitle className="text-left pr-6 leading-tight">
              {result.title}
            </SheetTitle>
          </div>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Source</p>
            <p className="text-sm">{result.source}</p>
          </div>

          {result.score && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Relevance Score</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${result.score * 100}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">
                  {(result.score * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          )}

          {result.url && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Link</p>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full justify-start"
              >
                <a 
                  href={result.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open link
                </a>
              </Button>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">ID</p>
            <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
              {result.id}
            </code>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}