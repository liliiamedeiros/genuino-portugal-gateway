import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';

type LangMap = Partial<Record<'pt' | 'en' | 'fr' | 'de', string>>;

interface SEOHeadProps {
  title?: string | LangMap;
  description?: string | LangMap;
  keywords?: string | LangMap;
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

  const pickLang = (val?: string | LangMap): string | undefined => {
    if (!val) return undefined;
    if (typeof val === 'string') return val;
    return val[language] || val.pt || val.en || val.fr || val.de;
  };

  const resolvedTitle = pickLang(title);
  const resolvedDescription = pickLang(description);
  const resolvedKeywords = pickLang(keywords);

  const defaultDescriptions: Record<string, string> = {
    pt: 'Investimentos imobiliários de luxo em Portugal e Suíça. Propriedades exclusivas para férias, praia e campo.',
    en: 'Luxury real estate investments in Portugal and Switzerland. Exclusive holiday, beach and countryside properties.',
    fr: 'Investissements immobiliers de luxe au Portugal et en Suisse. Propriétés exclusives pour vacances, plage et campagne.',
    de: 'Luxuriöse Immobilieninvestitionen in Portugal und der Schweiz. Exklusive Ferien-, Strand- und Landimmobilien.',
  };

  // Keep total title under 60 chars for SEO. Suffix is short brand only.
  const BRAND_SUFFIX = 'Genuíno Investments';
  const fullTitle = resolvedTitle
    ? `${resolvedTitle} | ${BRAND_SUFFIX}`
    : 'Genuíno Investments — Imobiliário Portugal & Suíça';

  const finalDescription = resolvedDescription || defaultDescriptions[language] || defaultDescriptions.pt;
  
  const pagePath = url || '';
  const fullUrl = `${baseUrl}${pagePath}`;
  
  // Build hreflang URL with lang param
  const buildLangUrl = (lang: string) => {
    const separator = pagePath.includes('?') ? '&' : '?';
    return `${baseUrl}${pagePath}${separator}lang=${lang}`;
  };

  // x-default must point to the canonical fallback (PT) per Google guidelines
  const xDefaultUrl = buildLangUrl('pt');
  
  return (
    <Helmet>
      <html lang={language} />
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      {resolvedKeywords && <meta name="keywords" content={resolvedKeywords} />}
      <meta httpEquiv="content-language" content={language} />
      <link rel="canonical" href={fullUrl} />
      
      {/* Hreflang per-page for multilingual SEO */}
      {SUPPORTED_LANGUAGES.map(lang => (
        <link key={lang} rel="alternate" hrefLang={lang} href={buildLangUrl(lang)} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={xDefaultUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:locale" content={LOCALE_MAP[language] || 'pt_PT'} />
      {SUPPORTED_LANGUAGES.filter(l => l !== language).map(lang => (
        <meta key={lang} property="og:locale:alternate" content={LOCALE_MAP[lang]} />
      ))}
      
      {/* Twitter */}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={image || defaultImage} />
    </Helmet>
  );
};
