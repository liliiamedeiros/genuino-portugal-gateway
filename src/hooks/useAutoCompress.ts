import { useState, useCallback, useRef } from 'react';
import { 
  compressImage, 
  compressImages, 
  CompressResult, 
  AutoCompressOptions,
  formatBytes 
} from '@/utils/autoCompressUtils';

export interface CompressionProgress {
  current: number;
  total: number;
  fileName: string;
  percentage: number;
}

export interface CompressionStats {
  totalOriginalSize: number;
  totalNewSize: number;
  totalSavings: number;
  filesProcessed: number;
}

export interface UseAutoCompressReturn {
  compress: (file: File, options?: AutoCompressOptions) => Promise<CompressResult>;
  compressMultiple: (files: File[], options?: AutoCompressOptions) => Promise<CompressResult[]>;
  isCompressing: boolean;
  progress: CompressionProgress | null;
  stats: CompressionStats | null;
  cancel: () => void;
  reset: () => void;
}

export function useAutoCompress(): UseAutoCompressReturn {
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState<CompressionProgress | null>(null);
  const [stats, setStats] = useState<CompressionStats | null>(null);
  const cancelledRef = useRef(false);

  const reset = useCallback(() => {
    setProgress(null);
    setStats(null);
    cancelledRef.current = false;
  }, []);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
  }, []);

  const compress = useCallback(async (
    file: File,
    options?: AutoCompressOptions
  ): Promise<CompressResult> => {
    setIsCompressing(true);
    cancelledRef.current = false;
    
    setProgress({
      current: 1,
      total: 1,
      fileName: file.name,
      percentage: 0,
    });

    try {
      const result = await compressImage(file, options);
      
      setStats({
        totalOriginalSize: result.originalSize,
        totalNewSize: result.newSize,
        totalSavings: result.savings,
        filesProcessed: 1,
      });

      setProgress({
        current: 1,
        total: 1,
        fileName: file.name,
        percentage: 100,
      });

      return result;
    } finally {
      setIsCompressing(false);
    }
  }, []);

  const compressMultiple = useCallback(async (
    files: File[],
    options?: AutoCompressOptions
  ): Promise<CompressResult[]> => {
    setIsCompressing(true);
    cancelledRef.current = false;
    
    const results: CompressResult[] = [];
    let totalOriginalSize = 0;
    let totalNewSize = 0;

    for (let i = 0; i < files.length; i++) {
      if (cancelledRef.current) {
        break;
      }

      const file = files[i];
      
      setProgress({
        current: i + 1,
        total: files.length,
        fileName: file.name,
        percentage: Math.round(((i + 1) / files.length) * 100),
      });

      try {
        const result = await compressImage(file, options);
        results.push(result);
        totalOriginalSize += result.originalSize;
        totalNewSize += result.newSize;
      } catch (error) {
        console.error(`Erro ao comprimir ${file.name}:`, error);
        // Add original file as fallback
        results.push({
          blob: file,
          originalSize: file.size,
          newSize: file.size,
          savings: 0,
          width: 0,
          height: 0,
        });
        totalOriginalSize += file.size;
        totalNewSize += file.size;
      }
    }

    const totalSavings = totalOriginalSize > 0
      ? Math.round(((totalOriginalSize - totalNewSize) / totalOriginalSize) * 100)
      : 0;

    setStats({
      totalOriginalSize,
      totalNewSize,
      totalSavings,
      filesProcessed: results.length,
    });

    setIsCompressing(false);
    return results;
  }, []);

  return {
    compress,
    compressMultiple,
    isCompressing,
    progress,
    stats,
    cancel,
    reset,
  };
}

export { formatBytes };
