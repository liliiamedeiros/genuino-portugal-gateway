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

export const SEOHead = ({ title, description, keywords, image, url, type = 'website' }: SEOHeadProps) => {
  const { language } = useLanguage();
  
  const baseUrl = 'https://genuinoinvestments.ch';
  const defaultImage = `${baseUrl}/og-image.jpg`;
  
  const fullTitle = title 
    ? `${title} | Genuíno Investments` 
    : 'Genuíno Investments | Imobiliária Internacional Portugal & Suíça';
  
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  
  return (
    <Helmet>
      <html lang={language} />
      <title>{fullTitle}</title>
      <meta name="description" content={description || 'Investimentos imobiliários de luxo em Portugal e Suíça. Propriedades exclusivas para férias, praia e campo.'} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || 'Investimentos imobiliários de luxo em Portugal e Suíça'} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image || defaultImage} />
      
      {/* Twitter */}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || 'Investimentos imobiliários de luxo em Portugal e Suíça'} />
      <meta name="twitter:image" content={image || defaultImage} />
    </Helmet>
  );
};
