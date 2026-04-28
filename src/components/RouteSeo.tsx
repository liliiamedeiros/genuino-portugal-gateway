import { Helmet } from 'react-helmet-async';
import { SEOHead } from './SEOHead';
import { useLanguage } from '@/contexts/LanguageContext';
import { ROUTE_META, BASE_URL } from '@/data/seoMeta';

interface RouteSeoProps {
  /** Route path key as defined in ROUTE_META, e.g. "/", "/about" */
  route: string;
  /** Optional dynamic title override (used for property/portfolio detail pages) */
  titleOverride?: string;
  /** Optional dynamic description override */
  descriptionOverride?: string;
  /** Optional image URL for OG */
  image?: string;
}

/**
 * Single source of truth for per-page SEO:
 *   - emits localized <title>, <meta description>, canonical and hreflang via SEOHead
 *   - emits page-level JSON-LD (WebPage / AboutPage / ContactPage / CollectionPage)
 *     using the entity bound to GenuinoInvestments Switzerland
 *   - localized to the active language
 */
export const RouteSeo = ({ route, titleOverride, descriptionOverride, image }: RouteSeoProps) => {
  const { language } = useLanguage();
  const meta = ROUTE_META[route];
  if (!meta) {
    return <SEOHead url={route} title={titleOverride} description={descriptionOverride} image={image} />;
  }

  const localizedTitle = titleOverride || meta.title[language] || meta.title.pt;
  const localizedDesc = descriptionOverride || meta.description[language] || meta.description.pt;

  // Build localized page-level JSON-LD bound to the brand
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': meta.schemaType || 'WebPage',
    name: localizedTitle,
    description: localizedDesc,
    url: `${BASE_URL}${route}?lang=${language}`,
    inLanguage: language,
    isPartOf: {
      '@type': 'WebSite',
      name: 'GenuinoInvestments Switzerland',
      url: BASE_URL,
    },
    about: {
      '@type': 'RealEstateAgent',
      name: 'GenuinoInvestments Switzerland',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'GenuinoInvestments Switzerland',
      url: BASE_URL,
    },
  };

  return (
    <>
      <SEOHead
        title={meta.title}
        description={meta.description}
        url={route}
        image={image}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(pageSchema)}</script>
      </Helmet>
    </>
  );
};
