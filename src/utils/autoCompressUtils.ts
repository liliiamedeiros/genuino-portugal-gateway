/**
 * Automatic Image Compression Utilities
 * Provides adaptive compression based on file size with WebP conversion
 */

export interface AutoCompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: 'auto' | number;
  format?: 'webp' | 'jpeg';
  preserveAspectRatio?: boolean;
}

export interface CompressResult {
  blob: Blob;
  originalSize: number;
  newSize: number;
  savings: number; // percentage
  width: number;
  height: number;
}

/**
 * Get adaptive quality based on file size
 * - Files < 100KB: No compression needed (quality 95%)
 * - Files 100KB-500KB: Light compression (quality 90%)
 * - Files 500KB-2MB: Medium compression (quality 85%)
 * - Files > 2MB: Aggressive compression (quality 75%)
 */
const getAdaptiveQuality = (fileSizeBytes: number): number => {
  const sizeKB = fileSizeBytes / 1024;
  
  if (sizeKB < 100) return 95;
  if (sizeKB < 500) return 90;
  if (sizeKB < 2048) return 85;
  return 75;
};

/**
 * Load image from File
 */
const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Falha ao carregar imagem'));
    };
    
    img.src = url;
  });
};

/**
 * Calculate new dimensions maintaining aspect ratio
 */
const calculateDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  let width = originalWidth;
  let height = originalHeight;
  
  // Only resize if larger than max dimensions
  if (width > maxWidth || height > maxHeight) {
    const widthRatio = maxWidth / width;
    const heightRatio = maxHeight / height;
    const ratio = Math.min(widthRatio, heightRatio);
    
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }
  
  return { width, height };
};

/**
 * Compress image with adaptive quality
 */
export const compressImage = async (
  file: File,
  options: AutoCompressOptions = {}
): Promise<CompressResult> => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 'auto',
    format = 'webp',
    preserveAspectRatio = true,
  } = options;

  const originalSize = file.size;
  
  // Load image
  const img = await loadImage(file);
  
  // Calculate dimensions
  const { width, height } = preserveAspectRatio
    ? calculateDimensions(img.width, img.height, maxWidth, maxHeight)
    : { width: maxWidth, height: maxHeight };
  
  // Determine quality
  const finalQuality = quality === 'auto' 
    ? getAdaptiveQuality(originalSize) 
    : quality;
  
  // Create canvas and draw
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Não foi possível criar contexto do canvas');
  }
  
  // Fill with white background (for transparent images)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  
  // Draw image maintaining aspect ratio
  if (preserveAspectRatio) {
    ctx.drawImage(img, 0, 0, width, height);
  } else {
    // Cover mode - crop to fill
    const scale = Math.max(width / img.width, height / img.height);
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    const x = (width - scaledWidth) / 2;
    const y = (height - scaledHeight) / 2;
    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
  }
  
  // Convert to blob
  const mimeType = format === 'webp' ? 'image/webp' : 'image/jpeg';
  
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const newSize = blob.size;
          const savings = Math.round(((originalSize - newSize) / originalSize) * 100);
          
          resolve({
            blob,
            originalSize,
            newSize,
            savings: Math.max(0, savings), // Ensure non-negative
            width,
            height,
          });
        } else {
          reject(new Error('Falha ao comprimir imagem'));
        }
      },
      mimeType,
      finalQuality / 100
    );
  });
};

/**
 * Compress multiple images with progress callback
 */
export const compressImages = async (
  files: File[],
  options: AutoCompressOptions = {},
  onProgress?: (current: number, total: number, fileName: string) => void
): Promise<CompressResult[]> => {
  const results: CompressResult[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    if (onProgress) {
      onProgress(i + 1, files.length, file.name);
    }
    
    try {
      const result = await compressImage(file, options);
      results.push(result);
    } catch (error) {
      console.error(`Erro ao comprimir ${file.name}:`, error);
      // Return original file as fallback
      results.push({
        blob: file,
        originalSize: file.size,
        newSize: file.size,
        savings: 0,
        width: 0,
        height: 0,
      });
    }
  }
  
  return results;
};

/**
 * Format bytes to human readable string
 */
export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

/**
 * Check if file needs compression based on size
 */
export const needsCompression = (file: File): boolean => {
  // Compress if larger than 100KB
  return file.size > 100 * 1024;
};
