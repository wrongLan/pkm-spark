import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Citation {
  id: string;
  title: string;
  url?: string | null;
}

interface CitationsProps {
  citations: Citation[];
}

export function Citations({ citations }: CitationsProps) {
  if (!citations.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      <span className="text-sm text-muted-foreground">Sources:</span>
      <TooltipProvider>
        {citations.map((citation) => (
          <Tooltip key={citation.id}>
            <TooltipTrigger asChild>
              {citation.url ? (
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:bg-accent flex items-center gap-1 max-w-48"
                  onClick={() => window.open(citation.url!, '_blank')}
                >
                  <span className="truncate">{citation.title}</span>
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </Badge>
              ) : (
                <Badge variant="outline" className="max-w-48">
                  <span className="truncate">{citation.title}</span>
                </Badge>
              )}
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{citation.title}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
}