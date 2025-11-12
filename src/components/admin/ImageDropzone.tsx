import { useCallback, useState } from 'react';
import { Upload, FileImage } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string;
  disabled?: boolean;
}

export function ImageDropzone({
  onFilesSelected,
  maxFiles = 50,
  maxSizeMB = 20,
  accept = 'image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp,image/tiff',
  disabled = false
}: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

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

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );

    if (files.length > maxFiles) {
      alert(`Máximo de ${maxFiles} imagens permitidas`);
      return;
    }

    onFilesSelected(files.slice(0, maxFiles));
  }, [disabled, maxFiles, onFilesSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length > maxFiles) {
      alert(`Máximo de ${maxFiles} imagens permitidas`);
      return;
    }

    onFilesSelected(files.slice(0, maxFiles));
    e.target.value = ''; // Reset input
  }, [maxFiles, onFilesSelected]);

  return (
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
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <input
        type="file"
        multiple
        accept={accept}
        onChange={handleFileInput}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        id="file-upload"
      />
      
      <div className="flex flex-col items-center justify-center gap-4 pointer-events-none">
        <div className={cn(
          'rounded-full p-6 transition-colors',
          isDragging ? 'bg-primary/10' : 'bg-accent'
        )}>
          {isDragging ? (
            <FileImage className="w-12 h-12 text-primary animate-pulse" />
          ) : (
            <Upload className="w-12 h-12 text-muted-foreground" />
          )}
        </div>
        
        <div className="text-center">
          <p className="text-lg font-medium mb-1">
            {isDragging ? 'Solte as imagens aqui' : 'Arraste imagens para cá'}
          </p>
          <p className="text-sm text-muted-foreground">
            ou clique para selecionar arquivos
          </p>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>Máximo: {maxFiles} imagens</p>
          <p>Tamanho máximo: {maxSizeMB}MB por imagem</p>
          <p>Formatos aceitos: JPG, PNG, GIF, WebP, BMP, TIFF</p>
        </div>
      </div>
    </div>
  );
}
