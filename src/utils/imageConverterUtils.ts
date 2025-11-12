import { convertToWebP, analyzeImage, ImageAnalysis } from './imageUtils';
import type { WatermarkConfig } from './watermarkUtils';

export interface ConversionResult {
  fileName: string;
  status: 'success' | 'error';
  oldSize: number;
  newSize: number;
  savings: number;
  error?: string;
  blob?: Blob;
}

export interface ConversionProgress {
  current: number;
  total: number;
  currentFileName: string;
  percentage: number;
}

export interface BatchConversionOptions {
  quality?: number;
  targetWidth?: number;
  targetHeight?: number;
  watermarkConfig?: Partial<WatermarkConfig>;
  onProgress?: (progress: ConversionProgress) => void;
  onFileComplete?: (result: ConversionResult) => void;
}

export const convertToWebPWithQuality = async (
  file: File,
  quality: number = 85,
  targetWidth: number = 800,
  targetHeight: number = 600,
  watermarkConfig?: Partial<WatermarkConfig>
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        const x = (targetWidth - scaledWidth) / 2;
        const y = (targetHeight - scaledHeight) / 2;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        
        canvas.toBlob(
          async (blob) => {
            if (blob) {
              if (watermarkConfig?.enabled) {
                try {
                  const { applyWatermark } = await import('./watermarkUtils');
                  const watermarkedBlob = await applyWatermark(blob, watermarkConfig);
                  resolve(watermarkedBlob);
                } catch (error) {
                  console.error('Failed to apply watermark:', error);
                  resolve(blob);
                }
              } else {
                resolve(blob);
              }
            } else {
              reject(new Error('Failed to convert image to WebP'));
            }
          },
          'image/webp',
          quality / 100
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export const batchConvertImages = async (
  files: File[],
  options: BatchConversionOptions = {}
): Promise<ConversionResult[]> => {
  const {
    quality = 85,
    targetWidth = 800,
    targetHeight = 600,
    watermarkConfig,
    onProgress,
    onFileComplete
  } = options;

  const results: ConversionResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: files.length,
        currentFileName: file.name,
        percentage: Math.round(((i + 1) / files.length) * 100)
      });
    }

    try {
      const blob = await convertToWebPWithQuality(
        file,
        quality,
        targetWidth,
        targetHeight,
        watermarkConfig
      );

      const result: ConversionResult = {
        fileName: file.name.replace(/\.[^/.]+$/, '.webp'),
        status: 'success',
        oldSize: file.size,
        newSize: blob.size,
        savings: Math.round(((file.size - blob.size) / file.size) * 100),
        blob
      };

      results.push(result);
      
      if (onFileComplete) {
        onFileComplete(result);
      }
    } catch (error: any) {
      const result: ConversionResult = {
        fileName: file.name,
        status: 'error',
        oldSize: file.size,
        newSize: 0,
        savings: 0,
        error: error.message || 'Erro desconhecido'
      };

      results.push(result);
      
      if (onFileComplete) {
        onFileComplete(result);
      }
    }
  }

  return results;
};

export const createConversionLog = (result: ConversionResult): string => {
  const timestamp = new Date().toLocaleTimeString('pt-BR');
  
  if (result.status === 'success') {
    return `[${timestamp}] ✓ ${result.fileName} - ${formatBytes(result.oldSize)} → ${formatBytes(result.newSize)} (${result.savings}% economia)`;
  } else {
    return `[${timestamp}] ✗ ${result.fileName} - Erro: ${result.error}`;
  }
};

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};
