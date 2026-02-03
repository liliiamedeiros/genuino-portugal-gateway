import { useState, useCallback, useRef, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  className?: string;
  containerClassName?: string;
  placeholder?: 'blur' | 'skeleton';
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  sizes,
  className,
  containerClassName,
  placeholder = 'skeleton',
  aspectRatio,
  objectFit = 'cover',
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Check if image is already cached/loaded
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current?.naturalHeight !== 0) {
      setIsLoaded(true);
    }
  }, [src]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true);
    onError?.();
  }, [onError]);

  // Determine aspect ratio style
  const aspectStyle = aspectRatio 
    ? { aspectRatio } 
    : width && height 
      ? { aspectRatio: `${width}/${height}` } 
      : undefined;

  // Object fit classes
  const objectFitClass = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
  }[objectFit];

  return (
    <div 
      className={cn(
        "relative overflow-hidden bg-muted",
        containerClassName
      )}
      style={aspectStyle}
    >
      {/* Skeleton placeholder */}
      {!isLoaded && placeholder === 'skeleton' && (
        <Skeleton 
          className="absolute inset-0 w-full h-full" 
        />
      )}

      {/* Blur placeholder (simple gradient) */}
      {!isLoaded && placeholder === 'blur' && (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-muted to-muted-foreground/10 animate-pulse" />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
          <span className="text-sm">Erro ao carregar</span>
        </div>
      )}

      {/* Actual image */}
      {!hasError && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full transition-opacity duration-300",
            objectFitClass,
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
        />
      )}
    </div>
  );
}
