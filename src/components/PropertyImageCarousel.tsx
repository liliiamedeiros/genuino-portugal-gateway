import { useState, useEffect, useCallback } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OptimizedImage } from '@/components/OptimizedImage';
import { useImagePreloader } from '@/hooks/useImagePreloader';

interface PropertyImageCarouselProps {
  images: string[];
  alt: string;
  onImageClick?: (index: number) => void;
  className?: string;
}

export function PropertyImageCarousel({ 
  images, 
  alt, 
  onImageClick,
  className 
}: PropertyImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [api, setApi] = useState<any>();
  const { preloadMultiple, isLoaded } = useImagePreloader({ maxConcurrent: 3 });

  // Preload first few images on mount
  useEffect(() => {
    if (images.length > 0) {
      preloadMultiple(images.slice(0, 3));
    }
  }, [images, preloadMultiple]);

  useEffect(() => {
    if (!api) return;

    api.on('select', () => {
      const index = api.selectedScrollSnap();
      setCurrentIndex(index);
      
      // Preload adjacent images
      const toPreload: string[] = [];
      if (index > 0 && images[index - 1]) toPreload.push(images[index - 1]);
      if (images[index]) toPreload.push(images[index]);
      if (index < images.length - 1 && images[index + 1]) toPreload.push(images[index + 1]);
      preloadMultiple(toPreload);
    });
  }, [api, images, preloadMultiple]);

  const handleThumbnailClick = useCallback((index: number) => {
    api?.scrollTo(index);
  }, [api]);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Main Carousel */}
      <Carousel 
        setApi={setApi}
        className="w-full"
        opts={{
          align: 'start',
          loop: true,
        }}
      >
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <div 
                className="relative aspect-video md:aspect-[16/9] lg:aspect-[16/8] overflow-hidden rounded-lg cursor-pointer group"
                onClick={() => onImageClick?.(index)}
              >
                <OptimizedImage
                  src={image}
                  alt={`${alt} - Foto ${index + 1}`}
                  className="transition-transform duration-300 group-hover:scale-105"
                  containerClassName="w-full h-full"
                  priority={index === 0}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 60vw"
                  aspectRatio="16/9"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <ZoomIn className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {images.length > 1 && (
          <>
            <CarouselPrevious className="left-4 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background" />
            <CarouselNext className="right-4 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background" />
          </>
        )}
      </Carousel>

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="text-center text-sm text-muted-foreground">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={cn(
                "relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all duration-200",
                currentIndex === index 
                  ? "border-primary shadow-lg scale-105" 
                  : "border-transparent hover:border-primary/50 opacity-60 hover:opacity-100"
              )}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
