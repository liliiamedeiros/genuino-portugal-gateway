type SupportedLanguage = 'pt' | 'fr' | 'en' | 'de';

interface LanguageDetectionResult {
  language: SupportedLanguage;
  confidence: 'high' | 'medium' | 'low';
  source: 'localStorage' | 'navigator' | 'geolocation' | 'ip' | 'default';
}

// Mapa de códigos de idioma ISO para nossos idiomas suportados
const languageMap: Record<string, SupportedLanguage> = {
  'pt': 'pt', 'pt-PT': 'pt', 'pt-BR': 'pt',
  'fr': 'fr', 'fr-FR': 'fr', 'fr-CH': 'fr', 'fr-BE': 'fr',
  'en': 'en', 'en-US': 'en', 'en-GB': 'en', 'en-CA': 'en',
  'de': 'de', 'de-DE': 'de', 'de-CH': 'de', 'de-AT': 'de',
};

// Mapa de países para idiomas padrão
const countryLanguageMap: Record<string, SupportedLanguage> = {
  'PT': 'pt', 'BR': 'pt', 'AO': 'pt', 'MZ': 'pt',
  'FR': 'fr', 'CH': 'fr', 'BE': 'fr', 'LU': 'fr',
  'GB': 'en', 'US': 'en', 'CA': 'en', 'AU': 'en', 'IE': 'en',
  'DE': 'de', 'AT': 'de', 'LI': 'de',
};

export class LanguageDetector {
  private static STORAGE_KEY = 'genuino_preferred_language';
  
  // 1. Verificar localStorage (maior prioridade)
  static getStoredLanguage(): SupportedLanguage | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored && this.isValidLanguage(stored)) {
        return stored as SupportedLanguage;
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
    return null;
  }
  
  // 2. Detectar idioma do navegador
  static getNavigatorLanguage(): SupportedLanguage {
    const navigatorLang = navigator.language || (navigator.languages && navigator.languages[0]) || 'en';
    const languageCode = navigatorLang.split('-')[0].toLowerCase();
    
    // Tentar match exato primeiro
    if (languageMap[navigatorLang]) {
      return languageMap[navigatorLang];
    }
    
    // Fallback para código base
    return languageMap[languageCode] || 'en';
  }
  
  // 3. Detectar idioma por geolocalização (assíncrono)
  static async getLanguageByGeolocation(): Promise<SupportedLanguage | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Usar API gratuita de geocoding reverso
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
            );
            const data = await response.json();
            const countryCode = data.countryCode;
            
            if (countryCode && countryLanguageMap[countryCode]) {
              resolve(countryLanguageMap[countryCode]);
            } else {
              resolve(null);
            }
          } catch {
            resolve(null);
          }
        },
        () => resolve(null),
        { timeout: 5000 }
      );
    });
  }
  
  // 4. Detectar idioma por IP (fallback)
  static async getLanguageByIP(): Promise<SupportedLanguage | null> {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      const countryCode = data.country_code;
      
      if (countryCode && countryLanguageMap[countryCode]) {
        return countryLanguageMap[countryCode];
      }
    } catch {
      return null;
    }
    return null;
  }
  
  // Método principal de detecção
  static async detectLanguage(): Promise<LanguageDetectionResult> {
    // 1. Preferência armazenada (maior prioridade)
    const stored = this.getStoredLanguage();
    if (stored) {
      return {
        language: stored,
        confidence: 'high',
        source: 'localStorage'
      };
    }
    
    // 2. Idioma do navegador
    const navigatorLang = this.getNavigatorLanguage();
    
    // 3. Tentar geolocalização (assíncrono)
    const geoLang = await this.getLanguageByGeolocation();
    if (geoLang) {
      return {
        language: geoLang,
        confidence: 'high',
        source: 'geolocation'
      };
    }
    
    // 4. Tentar detecção por IP
    const ipLang = await this.getLanguageByIP();
    if (ipLang) {
      return {
        language: ipLang,
        confidence: 'medium',
        source: 'ip'
      };
    }
    
    // 5. Fallback para idioma do navegador
    return {
      language: navigatorLang,
      confidence: 'medium',
      source: 'navigator'
    };
  }
  
  // Salvar preferência
  static saveLanguagePreference(language: SupportedLanguage): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, language);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }
  
  // Validar idioma
  private static isValidLanguage(lang: string): boolean {
    return ['pt', 'fr', 'en', 'de'].includes(lang);
  }
}
