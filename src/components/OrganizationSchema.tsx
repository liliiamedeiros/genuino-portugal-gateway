import { Helmet } from 'react-helmet-async';

export const OrganizationSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Genuíno Investments",
    "url": "https://genuinoinvestments.ch",
    "logo": "https://genuinoinvestments.ch/logo.png",
    "description": "Imobiliária internacional especializada em investimentos de luxo em Portugal e Suíça",
    "telephone": "+41 78 487 60 00",
    "email": "info@genuinoinvestments.ch",
    "sameAs": [
      "https://www.linkedin.com/company/genuinoinvestments",
      "https://www.instagram.com/genuinoinvestments",
      "https://www.facebook.com/genuinoinvestments"
    ],
    "address": [
      {
        "@type": "PostalAddress",
        "streetAddress": "Geneva",
        "addressLocality": "Geneva",
        "addressCountry": "CH",
        "name": "Escritório Genebra"
      },
      {
        "@type": "PostalAddress",
        "streetAddress": "Avenida da Liberdade",
        "addressLocality": "Lisboa",
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
