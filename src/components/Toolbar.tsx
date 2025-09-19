import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ToolbarProps {
  selectedCount: number;
  onExportSelected: () => void;
  isExporting?: boolean;
}

export function Toolbar({ selectedCount, onExportSelected, isExporting = false }: ToolbarProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
        </span>
      </div>
      <Button
        onClick={onExportSelected}
        disabled={selectedCount === 0 || isExporting}
        size="sm"
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        {isExporting ? 'Exporting...' : 'Export Selected'}
      </Button>
    </div>
  );
}