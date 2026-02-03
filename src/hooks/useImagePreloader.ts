import { useState, useCallback, useRef, useEffect } from 'react';

interface UseImagePreloaderOptions {
  maxConcurrent?: number;
}

interface UseImagePreloaderReturn {
  loaded: Set<string>;
  loading: Set<string>;
  preload: (url: string) => void;
  preloadMultiple: (urls: string[]) => void;
  isLoaded: (url: string) => boolean;
  isLoading: (url: string) => boolean;
}

export function useImagePreloader(
  options: UseImagePreloaderOptions = {}
): UseImagePreloaderReturn {
  const { maxConcurrent = 3 } = options;
  
  const [loaded, setLoaded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<Set<string>>(new Set());
  
  const queue = useRef<string[]>([]);
  const activeCount = useRef(0);

  const processQueue = useCallback(() => {
    while (queue.current.length > 0 && activeCount.current < maxConcurrent) {
      const url = queue.current.shift();
      if (!url) continue;
      
      // Skip if already loaded or loading
      if (loaded.has(url) || loading.has(url)) continue;
      
      activeCount.current++;
      setLoading(prev => new Set(prev).add(url));
      
      const img = new Image();
      
      img.onload = () => {
        activeCount.current--;
        setLoading(prev => {
          const next = new Set(prev);
          next.delete(url);
          return next;
        });
        setLoaded(prev => new Set(prev).add(url));
        processQueue();
      };
      
      img.onerror = () => {
        activeCount.current--;
        setLoading(prev => {
          const next = new Set(prev);
          next.delete(url);
          return next;
        });
        processQueue();
      };
      
      img.src = url;
    }
  }, [loaded, loading, maxConcurrent]);

  const preload = useCallback((url: string) => {
    if (!url || loaded.has(url) || loading.has(url) || queue.current.includes(url)) {
      return;
    }
    queue.current.push(url);
    processQueue();
  }, [loaded, loading, processQueue]);

  const preloadMultiple = useCallback((urls: string[]) => {
    urls.forEach(url => {
      if (url && !loaded.has(url) && !loading.has(url) && !queue.current.includes(url)) {
        queue.current.push(url);
      }
    });
    processQueue();
  }, [loaded, loading, processQueue]);

  const isLoaded = useCallback((url: string) => loaded.has(url), [loaded]);
  const isLoading = useCallback((url: string) => loading.has(url), [loading]);

  return {
    loaded,
    loading,
    preload,
    preloadMultiple,
    isLoaded,
    isLoading,
  };
}

// Hook for viewport-based preloading using IntersectionObserver
export function useViewportPreloader(
  images: string[],
  options: { rootMargin?: string } = {}
) {
  const { rootMargin = '200px' } = options;
  const { preloadMultiple, isLoaded } = useImagePreloader();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementsRef = useRef<Map<Element, string>>(new Map());

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const toPreload: string[] = [];
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const url = elementsRef.current.get(entry.target);
            if (url && !isLoaded(url)) {
              toPreload.push(url);
            }
          }
        });
        if (toPreload.length > 0) {
          preloadMultiple(toPreload);
        }
      },
      { rootMargin }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, [rootMargin, preloadMultiple, isLoaded]);

  const observe = useCallback((element: Element | null, imageUrl: string) => {
    if (!element || !observerRef.current) return;
    elementsRef.current.set(element, imageUrl);
    observerRef.current.observe(element);
  }, []);

  const unobserve = useCallback((element: Element | null) => {
    if (!element || !observerRef.current) return;
    elementsRef.current.delete(element);
    observerRef.current.unobserve(element);
  }, []);

  return { observe, unobserve, isLoaded };
}
