import { Helmet } from 'react-helmet-async';

export const OrganizationSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "GenuinoInvestments Switzerland",
    "url": "https://genuinoinvestments.ch",
    "logo": "https://genuinoinvestments.ch/logo.png",
    "image": "https://genuinoinvestments.ch/logo.png",
    "description": "Entreprise suisse spécialisée dans la promotion et le développement de projets immobiliers au Portugal. Innovation, fonctionnalité et design intemporel.",
    "priceRange": "€€€",
    "currenciesAccepted": "EUR, CHF",
    "telephone": "+41 76 487 60 00",
    "email": "info@genuinoinvestments.ch",
    "sameAs": [
      "https://www.linkedin.com/company/genuinoinvestments",
      "https://www.instagram.com/genuinoinvestments",
      "https://www.facebook.com/genuinoinvestments"
    ],
    "address": [
      {
        "@type": "PostalAddress",
        "streetAddress": "Quai du Cheval Blanc, 2",
        "addressLocality": "Carouge/Genève",
        "postalCode": "1227",
        "addressRegion": "Genève",
        "addressCountry": "CH",
        "name": "Siège Suisse"
      },
      {
        "@type": "PostalAddress",
        "streetAddress": "Rua António Stromp 12 A",
        "addressLocality": "Lisboa",
        "postalCode": "1600-411",
        "addressRegion": "Lumiar",
        "addressCountry": "PT",
        "name": "Escritório Lisboa"
      }
    ],
    "areaServed": [
      {
        "@type": "Country",
        "name": "Portugal"
      },
      {
        "@type": "Country",
        "name": "Switzerland"
      }
    ],
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+41 76 487 60 00",
        "contactType": "customer service",
        "areaServed": "CH",
        "availableLanguage": ["French", "English", "Portuguese", "German"]
      },
      {
        "@type": "ContactPoint",
        "telephone": "+351 21 7 580673",
        "contactType": "customer service",
        "areaServed": "PT",
        "availableLanguage": ["Portuguese", "English", "French"]
      }
    ]
  };
  
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};
