export interface WatermarkConfig {
  enabled: boolean;
  text?: string;
  logoUrl?: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
  fontSize?: number;
}

const DEFAULT_CONFIG: WatermarkConfig = {
  enabled: true,
  text: '© Genuíno Investments',
  position: 'bottom-right',
  opacity: 0.7,
  fontSize: 24
};

export const applyWatermark = async (
  imageBlob: Blob,
  config: Partial<WatermarkConfig> = {}
): Promise<Blob> => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  if (!finalConfig.enabled) {
    return imageBlob;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(imageBlob);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Calculate watermark position
      const padding = 20;
      const fontSize = finalConfig.fontSize || 24;
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillStyle = `rgba(255, 255, 255, ${finalConfig.opacity})`;
      ctx.strokeStyle = `rgba(0, 0, 0, ${finalConfig.opacity * 0.5})`;
      ctx.lineWidth = 2;
      
      if (finalConfig.text) {
        const textMetrics = ctx.measureText(finalConfig.text);
        let x = 0;
        let y = 0;
        
        switch (finalConfig.position) {
          case 'top-left':
            x = padding;
            y = padding + fontSize;
            break;
          case 'top-right':
            x = canvas.width - textMetrics.width - padding;
            y = padding + fontSize;
            break;
          case 'bottom-left':
            x = padding;
            y = canvas.height - padding;
            break;
          case 'bottom-right':
            x = canvas.width - textMetrics.width - padding;
            y = canvas.height - padding;
            break;
          case 'center':
            x = (canvas.width - textMetrics.width) / 2;
            y = canvas.height / 2;
            break;
        }
        
        // Draw text with stroke for better visibility
        ctx.strokeText(finalConfig.text, x, y);
        ctx.fillText(finalConfig.text, x, y);
      }
      
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to apply watermark'));
          }
        },
        'image/webp',
        0.85
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};
