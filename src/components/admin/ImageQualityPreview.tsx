import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ImageComparisonSlider } from './ImageComparisonSlider';
import { ArrowLeft, Download, Loader2, Star, Image as ImageIcon } from 'lucide-react';

interface ImageQualityPreviewProps {
  originalUrl: string;
  originalSize?: number;
  quality: number;
  targetWidth: number;
  targetHeight: number;
  onQualityChange?: (quality: number) => void;
  onConvert?: () => void;
  onBack?: () => void;
  isConverting?: boolean;
}

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

const estimateWebPSize = (originalSize: number, quality: number): number => {
  // WebP typically reduces 50-85% depending on quality
  const baseReduction = 0.70; // 70% base reduction
  const qualityFactor = (quality - 50) / 50; // 0-1 scale
  const reduction = baseReduction - (qualityFactor * 0.35); // Higher quality = less reduction
  return Math.round(originalSize * (1 - reduction));
};

const getQualityRating = (quality: number): { stars: number; label: string; color: string } => {
  if (quality >= 90) return { stars: 5, label: 'Excelente', color: 'text-green-500' };
  if (quality >= 80) return { stars: 4, label: 'Muito Boa', color: 'text-emerald-500' };
  if (quality >= 70) return { stars: 3, label: 'Boa', color: 'text-yellow-500' };
  if (quality >= 60) return { stars: 2, label: 'Aceitável', color: 'text-orange-500' };
  return { stars: 1, label: 'Baixa', color: 'text-red-500' };
};

export function ImageQualityPreview({
  originalUrl,
  originalSize = 0,
  quality,
  targetWidth,
  targetHeight,
  onQualityChange,
  onConvert,
  onBack,
  isConverting = false
}: ImageQualityPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [actualOriginalSize, setActualOriginalSize] = useState(originalSize);
  const [previewSize, setPreviewSize] = useState(0);

  const generatePreview = useCallback(async () => {
    setIsGenerating(true);
    
    try {
      // Load original image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = originalUrl;
      });

      // Create canvas with target dimensions
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Canvas context not available');

      // Calculate scaling to cover
      const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const x = (targetWidth - scaledWidth) / 2;
      const y = (targetHeight - scaledHeight) / 2;

      // Fill with white and draw image
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

      // Generate WebP preview
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/webp', quality / 100);
      });

      if (blob) {
        setPreviewSize(blob.size);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      }
    } catch (error) {
      console.error('Failed to generate preview:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [originalUrl, quality, targetWidth, targetHeight]);

  // Fetch original size if not provided
  useEffect(() => {
    if (!originalSize && originalUrl) {
      fetch(originalUrl)
        .then(res => {
          const contentLength = res.headers.get('content-length');
          if (contentLength) {
            setActualOriginalSize(parseInt(contentLength, 10));
          }
        })
        .catch(console.error);
    }
  }, [originalUrl, originalSize]);

  // Generate preview on mount and quality change
  useEffect(() => {
    generatePreview();
    
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [generatePreview]);

  const estimatedSize = actualOriginalSize 
    ? estimateWebPSize(actualOriginalSize, quality) 
    : previewSize;
  
  const savingsPercent = actualOriginalSize 
    ? Math.round(((actualOriginalSize - estimatedSize) / actualOriginalSize) * 100)
    : 0;

  const qualityRating = getQualityRating(quality);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Badge variant="outline" className="text-sm">
          <ImageIcon className="h-3 w-3 mr-1" />
          Preview em Tempo Real
        </Badge>
      </div>

      {/* Comparison Slider */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            👁️ Comparação Visual
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isGenerating ? (
            <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : previewUrl ? (
            <ImageComparisonSlider
              originalUrl={originalUrl}
              convertedUrl={previewUrl}
              originalLabel="Original"
              convertedLabel={`WEBP ${quality}%`}
              className="rounded-lg overflow-hidden"
            />
          ) : (
            <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
              <p className="text-muted-foreground">Erro ao gerar preview</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quality Slider */}
      {onQualityChange && (
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Qualidade</span>
                <span className="text-lg font-bold">{quality}%</span>
              </div>
              <Slider
                value={[quality]}
                onValueChange={([val]) => onQualityChange(val)}
                min={50}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Menor tamanho</span>
                <span>Maior qualidade</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estimates */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            📊 Estimativas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Tamanho Original</p>
              <p className="text-lg font-semibold">
                {actualOriginalSize ? formatBytes(actualOriginalSize) : 'N/A'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Tamanho Estimado</p>
              <p className="text-lg font-semibold text-green-600">
                ~{formatBytes(estimatedSize)}
                {savingsPercent > 0 && (
                  <span className="text-xs ml-1">(-{savingsPercent}%)</span>
                )}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Dimensões Finais</p>
              <p className="text-lg font-semibold">{targetWidth} × {targetHeight} px</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Qualidade Visual</p>
              <div className={`flex items-center gap-1 ${qualityRating.color}`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4"
                    fill={i < qualityRating.stars ? 'currentColor' : 'none'}
                  />
                ))}
                <span className="text-sm ml-1">{qualityRating.label}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {onConvert && (
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onBack}>
            Cancelar
          </Button>
          <Button onClick={onConvert} disabled={isConverting}>
            {isConverting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Convertendo...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Converter Esta Imagem
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
