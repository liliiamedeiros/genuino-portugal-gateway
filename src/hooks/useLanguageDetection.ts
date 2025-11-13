import { useEffect, useState } from 'react';
import { LanguageDetector } from '@/utils/languageDetection';

export const useLanguageDetection = () => {
  const [detectionResult, setDetectionResult] = useState<{
    language: string;
    confidence: string;
    source: string;
  } | null>(null);
  
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    const detect = async () => {
      const result = await LanguageDetector.detectLanguage();
      setDetectionResult(result);
      setIsDetecting(false);
    };
    
    detect();
  }, []);

  return { detectionResult, isDetecting };
};
