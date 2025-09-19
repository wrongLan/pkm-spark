import React, { useState } from 'react';
import { ExternalLink, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { SearchResult, TagOption } from '@/lib/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { TagEditor } from './TagEditor';

interface ResultDrawerProps {
  result: SearchResult | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => void;
  onTagsUpdate?: (id: string, tags: string[]) => void;
  availableTags?: TagOption[];
  isDeleting?: boolean;
}

export function ResultDrawer({ 
  result, 
  open, 
  onOpenChange, 
  onDelete, 
  onTagsUpdate, 
  availableTags = [], 
  isDeleting = false 
}: ResultDrawerProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [isUpdatingTags, setIsUpdatingTags] = useState(false);

  if (!result) return null;

  const handleTagsUpdate = async (add: string[], remove: string[]) => {
    if (!result || !onTagsUpdate) return;
    
    setIsUpdatingTags(true);
    try {
      // Calculate new tags
      const currentTags = result.tags || [];
      const newTags = currentTags
        .filter(tag => !remove.includes(tag))
        .concat(add);
      
      await onTagsUpdate(result.id, newTags);
    } catch (error) {
      console.error('Failed to update tags:', error);
    } finally {
      setIsUpdatingTags(false);
    }
  };

  const handleDelete = () => {
    onDelete(result.id);
    setShowDeleteDialog(false);
    onOpenChange(false);
  };

  return (
    <>
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

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Content</p>
              <div className="text-sm text-foreground bg-muted/30 p-3 rounded border">
                No content available
              </div>
            </div>

            {/* Tag Editor */}
            <TagEditor
              result={result}
              availableTags={availableTags}
              onSave={handleTagsUpdate}
              isLoading={isUpdatingTags}
            />

            <Collapsible open={showMetadata} onOpenChange={setShowMetadata}>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {showMetadata ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                Metadata (JSON)
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <pre className="text-xs bg-muted p-3 rounded font-mono overflow-auto max-h-32">
                  {JSON.stringify({ id: result.id, source: result.source, title: result.title, url: result.url, score: result.score }, null, 2)}
                </pre>
              </CollapsibleContent>
            </Collapsible>

            <div className="flex gap-2 pt-4">
              {result.url && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="flex-1"
                >
                  <a 
                    href={result.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Link
                  </a>
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">ID</p>
              <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                {result.id}
              </code>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this item from your library?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The item "{result.title}" will be permanently removed from your knowledge base.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}