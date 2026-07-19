type SupportedLanguage = 'pt' | 'fr' | 'en' | 'de';

interface LanguageDetectionResult {
  language: SupportedLanguage;
  confidence: 'high' | 'medium' | 'low';
  source: 'localStorage' | 'navigator' | 'default';
}

// Mapa de códigos de idioma ISO para nossos idiomas suportados
const languageMap: Record<string, SupportedLanguage> = {
  'pt': 'pt', 'pt-PT': 'pt', 'pt-BR': 'pt',
  'fr': 'fr', 'fr-FR': 'fr', 'fr-CH': 'fr', 'fr-BE': 'fr',
  'en': 'en', 'en-US': 'en', 'en-GB': 'en', 'en-CA': 'en',
  'de': 'de', 'de-DE': 'de', 'de-CH': 'de', 'de-AT': 'de',
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
    
    // 2. Idioma do navegador. Não pedir geolocalização no carregamento:
    // melhora PageSpeed/Best Practices e evita pedidos externos antes do LCP.
    const navigatorLang = this.getNavigatorLanguage();
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
