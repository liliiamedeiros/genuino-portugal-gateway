import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ImageComparisonSliderProps {
  originalUrl: string;
  convertedUrl: string;
  originalLabel?: string;
  convertedLabel?: string;
  className?: string;
}

export function ImageComparisonSlider({
  originalUrl,
  convertedUrl,
  originalLabel = 'Original',
  convertedLabel = 'WebP',
  className
}: ImageComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full aspect-video overflow-hidden rounded-lg cursor-ew-resize select-none',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
    >
      {/* Converted image (background) */}
      <div className="absolute inset-0">
        <img
          src={convertedUrl}
          alt={convertedLabel}
          className="w-full h-full object-cover"
          draggable={false}
        />
        <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded font-medium">
          {convertedLabel}
        </span>
      </div>

      {/* Original image (foreground with clip) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={originalUrl}
          alt={originalLabel}
          className="w-full h-full object-cover"
          draggable={false}
        />
        <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded font-medium">
          {originalLabel}
        </span>
      </div>

      {/* Slider handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
          <div className="flex gap-0.5">
            <div className="w-0.5 h-4 bg-muted-foreground rounded" />
            <div className="w-0.5 h-4 bg-muted-foreground rounded" />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
        Arraste para comparar
      </div>
    </div>
  );
}
