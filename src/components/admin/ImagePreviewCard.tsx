import { X, FileImage, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ImageAnalysis } from '@/utils/imageUtils';

interface ImagePreviewCardProps {
  preview: string;
  analysis: ImageAnalysis;
  onRemove: () => void;
}

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export function ImagePreviewCard({ preview, analysis, onRemove }: ImagePreviewCardProps) {
  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="relative aspect-square bg-muted">
          <img
            src={preview}
            alt={analysis.name}
            className="w-full h-full object-cover"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {analysis.estimatedSavings > 0 && (
            <Badge 
              variant="secondary" 
              className="absolute bottom-2 right-2 bg-green-500/90 text-white"
            >
              <TrendingDown className="h-3 w-3 mr-1" />
              -{analysis.estimatedSavings}%
            </Badge>
          )}
        </div>

        <div className="p-3 space-y-2">
          <div className="flex items-start gap-2">
            <FileImage className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-sm font-medium truncate flex-1" title={analysis.name}>
              {analysis.name}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>
              <p className="font-medium">Formato</p>
              <p>{analysis.format}</p>
            </div>
            <div>
              <p className="font-medium">Dimensões</p>
              <p>{analysis.dimensions.width}x{analysis.dimensions.height}</p>
            </div>
            <div>
              <p className="font-medium">Tamanho Atual</p>
              <p className="font-mono">{analysis.sizeFormatted}</p>
            </div>
            <div>
              <p className="font-medium">Após WebP</p>
              <p className="font-mono text-green-600">
                {formatBytes(analysis.estimatedWebPSize)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
