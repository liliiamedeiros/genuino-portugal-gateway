import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SUPPORTED_LANGUAGES = ['pt', 'en', 'fr', 'de'] as const;

const LOCALE_MAP: Record<string, string> = {
  pt: 'pt_PT',
  en: 'en_US',
  fr: 'fr_FR',
  de: 'de_CH',
};

export const SEOHead = ({ title, description, keywords, image, url, type = 'website' }: SEOHeadProps) => {
  const { language } = useLanguage();
  
  const baseUrl = 'https://genuinoinvestments.ch';
  const defaultImage = `${baseUrl}/og-image.jpg`;
  
  const fullTitle = title 
    ? `${title} | GenuinoInvestments Switzerland` 
    : 'GenuinoInvestments Switzerland | Investissements Immobiliers Portugal & Suisse';
  
  const pagePath = url || '';
  const fullUrl = `${baseUrl}${pagePath}`;
  
  // Build hreflang URL with lang param
  const buildLangUrl = (lang: string) => {
    const separator = pagePath.includes('?') ? '&' : '?';
    return `${baseUrl}${pagePath}${separator}lang=${lang}`;
  };
  
  return (
    <Helmet>
      <html lang={language} />
      <title>{fullTitle}</title>
      <meta name="description" content={description || 'Investimentos imobiliários de luxo em Portugal e Suíça. Propriedades exclusivas para férias, praia e campo.'} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta httpEquiv="content-language" content={language} />
      <link rel="canonical" href={fullUrl} />
      
      {/* Hreflang per-page for multilingual SEO */}
      {SUPPORTED_LANGUAGES.map(lang => (
        <link key={lang} rel="alternate" hrefLang={lang} href={buildLangUrl(lang)} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={fullUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || 'Investimentos imobiliários de luxo em Portugal e Suíça'} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:locale" content={LOCALE_MAP[language] || 'pt_PT'} />
      {SUPPORTED_LANGUAGES.filter(l => l !== language).map(lang => (
        <meta key={lang} property="og:locale:alternate" content={LOCALE_MAP[lang]} />
      ))}
      
      {/* Twitter */}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || 'Investimentos imobiliários de luxo em Portugal e Suíça'} />
      <meta name="twitter:image" content={image || defaultImage} />
    </Helmet>
  );
};
