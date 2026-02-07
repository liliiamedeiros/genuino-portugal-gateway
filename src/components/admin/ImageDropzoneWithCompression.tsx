import { useCallback, useState } from 'react';
import { Upload, FileImage, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAutoCompress, formatBytes } from '@/hooks/useAutoCompress';
import { CompressResult } from '@/utils/autoCompressUtils';

export interface CompressedFile {
  file: File;
  compressed: CompressResult;
  preview: string;
}

interface ImageDropzoneWithCompressionProps {
  onFilesCompressed: (files: CompressedFile[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string;
  disabled?: boolean;
  autoCompress?: boolean;
  showStats?: boolean;
  maxWidth?: number;
  maxHeight?: number;
}

export function ImageDropzoneWithCompression({
  onFilesCompressed,
  maxFiles = 50,
  maxSizeMB = 20,
  accept = 'image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp,image/tiff',
  disabled = false,
  autoCompress = true,
  showStats = true,
  maxWidth = 1920,
  maxHeight = 1080,
}: ImageDropzoneWithCompressionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { compress, compressMultiple, isCompressing, progress, stats, reset } = useAutoCompress();

  const processFiles = useCallback(async (files: File[]) => {
    if (disabled || files.length === 0) return;

    const validFiles = files.filter(file => file.type.startsWith('image/')).slice(0, maxFiles);
    
    if (validFiles.length === 0) {
      return;
    }

    if (!autoCompress) {
      // Return files without compression
      const result: CompressedFile[] = validFiles.map(file => ({
        file,
        compressed: {
          blob: file,
          originalSize: file.size,
          newSize: file.size,
          savings: 0,
          width: 0,
          height: 0,
        },
        preview: URL.createObjectURL(file),
      }));
      onFilesCompressed(result);
      return;
    }

    try {
      const compressedResults = await compressMultiple(validFiles, {
        maxWidth,
        maxHeight,
        quality: 'auto',
        format: 'webp',
      });

      const result: CompressedFile[] = compressedResults.map((compressed, index) => ({
        file: validFiles[index],
        compressed,
        preview: URL.createObjectURL(compressed.blob),
      }));

      onFilesCompressed(result);
    } catch (error) {
      console.error('Erro ao comprimir imagens:', error);
    }
  }, [disabled, maxFiles, autoCompress, compressMultiple, onFilesCompressed, maxWidth, maxHeight]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isCompressing) {
      setIsDragging(true);
    }
  }, [disabled, isCompressing]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isCompressing) return;

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, [disabled, isCompressing, processFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
    e.target.value = ''; // Reset input
  }, [processFiles]);

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-12 transition-all duration-200',
          isDragging 
            ? 'border-primary bg-primary/5 scale-[1.02]' 
            : 'border-border hover:border-primary/50 hover:bg-accent/50',
          (disabled || isCompressing) && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          type="file"
          multiple
          accept={accept}
          onChange={handleFileInput}
          disabled={disabled || isCompressing}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          id="file-upload-compress"
        />
        
        <div className="flex flex-col items-center justify-center gap-4 pointer-events-none">
          <div className={cn(
            'rounded-full p-6 transition-colors',
            isDragging ? 'bg-primary/10' : 'bg-accent'
          )}>
            {isCompressing ? (
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            ) : isDragging ? (
              <FileImage className="w-12 h-12 text-primary animate-pulse" />
            ) : (
              <Upload className="w-12 h-12 text-muted-foreground" />
            )}
          </div>
          
          <div className="text-center">
            {isCompressing ? (
              <>
                <p className="text-lg font-medium mb-1">
                  A comprimir imagens...
                </p>
                {progress && (
                  <p className="text-sm text-muted-foreground">
                    {progress.current} de {progress.total}: {progress.fileName}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-lg font-medium mb-1">
                  {isDragging ? 'Solte as imagens aqui' : 'Arraste imagens para cá'}
                </p>
                <p className="text-sm text-muted-foreground">
                  ou clique para selecionar arquivos
                </p>
              </>
            )}
          </div>

          {isCompressing && progress && (
            <div className="w-full max-w-xs">
              <Progress value={progress.percentage} className="h-2" />
            </div>
          )}

          {!isCompressing && (
            <div className="text-xs text-muted-foreground space-y-1 text-center">
              <p>Máximo: {maxFiles} imagens</p>
              <p>Tamanho máximo: {maxSizeMB}MB por imagem</p>
              <p>Formatos aceitos: JPG, PNG, GIF, WebP, BMP, TIFF</p>
              {autoCompress && (
                <Badge variant="secondary" className="mt-2">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Compressão automática WebP
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Compression Stats */}
      {showStats && stats && !isCompressing && (
        <div className="bg-accent/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="font-medium">
                {stats.filesProcessed} {stats.filesProcessed === 1 ? 'imagem comprimida' : 'imagens comprimidas'}
              </span>
            </div>
            <Badge variant={stats.totalSavings > 50 ? 'default' : 'secondary'}>
              {stats.totalSavings}% economia
            </Badge>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            <span>{formatBytes(stats.totalOriginalSize)}</span>
            <span className="mx-2">→</span>
            <span className="text-foreground font-medium">{formatBytes(stats.totalNewSize)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
