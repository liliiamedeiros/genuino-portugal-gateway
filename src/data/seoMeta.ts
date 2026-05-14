// Centralized per-route × per-language SEO metadata.
// Source of truth for: <title>, <meta description>, <h1>, JSON-LD page-name.
// Used by SEOHead + RouteSeo + the "Canonical & hreflang report" admin page.

export type Lang = 'pt' | 'en' | 'fr' | 'de';
export const LANGS: Lang[] = ['pt', 'en', 'fr', 'de'];
export const BASE_URL = 'https://genuinoinvestments.ch';

export interface RouteMeta {
  title: Record<Lang, string>;
  description: Record<Lang, string>;
  h1: Record<Lang, string>;
  /** Schema.org @type used by the page-level JSON-LD */
  schemaType?: 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage' | 'Service';
}

export const ROUTE_META: Record<string, RouteMeta> = {
  '/': {
    title: {
      pt: 'Imobiliário Portugal & Suíça',
      en: 'Real Estate Portugal & Switzerland',
      fr: 'Immobilier Portugal & Suisse',
      de: 'Immobilien Portugal & Schweiz',
    },
    description: {
      pt: 'Investimentos imobiliários de luxo em Portugal e Suíça. Propriedades exclusivas para férias, praia e campo. Escritórios em Lisboa e Genebra.',
      en: 'Swiss-managed luxury real estate in Portugal. Exclusive beach, city and countryside properties for international investors from Europe, China and the Middle East. Offices in Geneva and Lisbon.',
      fr: 'Investissements immobiliers de luxe au Portugal et en Suisse. Propriétés exclusives pour vacances, plage et campagne. Bureaux à Lisbonne et Genève.',
      de: 'Luxusimmobilieninvestitionen in Portugal und der Schweiz. Exklusive Ferien-, Strand- und Landimmobilien. Büros in Lissabon und Genf.',
    },
    h1: {
      pt: 'GenuinoInvestments Switzerland — Imobiliária de Luxo Portugal & Suíça',
      en: 'GenuinoInvestments Switzerland — Luxury Real Estate Portugal & Switzerland',
      fr: 'GenuinoInvestments Switzerland — Immobilier de Luxe Portugal & Suisse',
      de: 'GenuinoInvestments Switzerland — Luxusimmobilien Portugal & Schweiz',
    },
    schemaType: 'WebPage',
  },
  '/about': {
    title: {
      pt: 'Sobre Nós — Quem Somos',
      en: 'About Us — Who We Are',
      fr: 'À propos — Qui sommes-nous',
      de: 'Über uns — Wer wir sind',
    },
    description: {
      pt: 'Conheça a Genuíno Investments: empresa suíça com mais de 10 anos a desenvolver projectos imobiliários de excelência em Portugal.',
      en: 'Meet Genuíno Investments: Swiss company with over 10 years developing premium real estate projects in Portugal.',
      fr: 'Découvrez Genuíno Investments : entreprise suisse avec plus de 10 ans de développement de projets immobiliers premium au Portugal.',
      de: 'Lernen Sie Genuíno Investments kennen: Schweizer Unternehmen mit über 10 Jahren Erfahrung in Premium-Immobilienprojekten in Portugal.',
    },
    h1: {
      pt: 'Sobre a Genuíno Investments',
      en: 'About Genuíno Investments',
      fr: 'À propos de Genuíno Investments',
      de: 'Über Genuíno Investments',
    },
    schemaType: 'AboutPage',
  },
  '/services': {
    title: {
      pt: 'Serviços de Investimento Imobiliário',
      en: 'Real Estate Investment Services',
      fr: 'Services d\'Investissement Immobilier',
      de: 'Immobilien-Investmentdienstleistungen',
    },
    description: {
      pt: 'Serviços completos: desenvolvimento, gestão, comercialização e consultoria para investidores em Portugal e Suíça.',
      en: 'Complete services: development, management, sales and consulting for investors in Portugal and Switzerland.',
      fr: 'Services complets : développement, gestion, commercialisation et conseil pour investisseurs au Portugal et en Suisse.',
      de: 'Komplette Dienstleistungen: Entwicklung, Verwaltung, Vertrieb und Beratung für Investoren in Portugal und der Schweiz.',
    },
    h1: {
      pt: 'Os Nossos Serviços',
      en: 'Our Services',
      fr: 'Nos Services',
      de: 'Unsere Dienstleistungen',
    },
    schemaType: 'Service',
  },
  '/portfolio': {
    title: {
      pt: 'Portfólio de Projectos Concluídos',
      en: 'Portfolio of Completed Projects',
      fr: 'Portfolio des Projets Réalisés',
      de: 'Portfolio abgeschlossener Projekte',
    },
    description: {
      pt: 'Veja os projetos imobiliários desenvolvidos pela Genuíno Investments em Lisboa, Algarve e outras regiões de Portugal.',
      en: 'Explore real estate projects developed by Genuíno Investments in Lisbon, Algarve and other regions of Portugal.',
      fr: 'Découvrez les projets immobiliers développés par Genuíno Investments à Lisbonne, en Algarve et dans d\'autres régions du Portugal.',
      de: 'Entdecken Sie die von Genuíno Investments entwickelten Immobilienprojekte in Lissabon, Algarve und anderen Regionen Portugals.',
    },
    h1: {
      pt: 'Portfólio',
      en: 'Portfolio',
      fr: 'Portfolio',
      de: 'Portfolio',
    },
    schemaType: 'CollectionPage',
  },
  '/properties': {
    title: {
      pt: 'Imóveis à Venda em Portugal',
      en: 'Properties for Sale in Portugal',
      fr: 'Biens Immobiliers à Vendre au Portugal',
      de: 'Immobilien zum Verkauf in Portugal',
    },
    description: {
      pt: 'Imóveis exclusivos à venda em Portugal: apartamentos, vivendas e investimentos premium em locais privilegiados.',
      en: 'Exclusive properties for sale in Portugal: apartments, villas and premium investments in prime locations.',
      fr: 'Biens exclusifs à vendre au Portugal : appartements, villas et investissements premium dans des emplacements privilégiés.',
      de: 'Exklusive Immobilien zum Verkauf in Portugal: Wohnungen, Villen und Premium-Investments in erstklassigen Lagen.',
    },
    h1: {
      pt: 'Imóveis Disponíveis',
      en: 'Available Properties',
      fr: 'Biens Disponibles',
      de: 'Verfügbare Immobilien',
    },
    schemaType: 'CollectionPage',
  },
  '/vision': {
    title: {
      pt: 'A Nossa Visão',
      en: 'Our Vision',
      fr: 'Notre Vision',
      de: 'Unsere Vision',
    },
    description: {
      pt: 'A visão da Genuíno Investments: criar valor sustentável através de projectos imobiliários inovadores e atemporais.',
      en: 'Genuíno Investments\' vision: creating sustainable value through innovative and timeless real estate projects.',
      fr: 'La vision de Genuíno Investments : créer de la valeur durable grâce à des projets immobiliers innovants et intemporels.',
      de: 'Die Vision von Genuíno Investments: nachhaltigen Wert durch innovative und zeitlose Immobilienprojekte schaffen.',
    },
    h1: {
      pt: 'A Nossa Visão',
      en: 'Our Vision',
      fr: 'Notre Vision',
      de: 'Unsere Vision',
    },
    schemaType: 'WebPage',
  },
  '/investors': {
    title: {
      pt: 'Para Investidores',
      en: 'For Investors',
      fr: 'Pour les Investisseurs',
      de: 'Für Investoren',
    },
    description: {
      pt: 'Oportunidades de investimento imobiliário em Portugal com rentabilidades superiores e gestão profissional suíça.',
      en: 'Real estate investment opportunities in Portugal with superior returns and professional Swiss management.',
      fr: 'Opportunités d\'investissement immobilier au Portugal avec des rendements supérieurs et une gestion professionnelle suisse.',
      de: 'Immobilien-Investmentmöglichkeiten in Portugal mit überlegenen Renditen und professionellem Schweizer Management.',
    },
    h1: {
      pt: 'Investidores',
      en: 'Investors',
      fr: 'Investisseurs',
      de: 'Investoren',
    },
    schemaType: 'WebPage',
  },
  '/contact': {
    title: {
      pt: 'Contacto — Lisboa & Genebra',
      en: 'Contact — Lisbon & Geneva',
      fr: 'Contact — Lisbonne & Genève',
      de: 'Kontakt — Lissabon & Genf',
    },
    description: {
      pt: 'Contacte-nos: Sede Suíça em Carouge/Genebra (+41 76 487 60 00) — Escritório em Lumiar/Lisboa (+351 21 758 06 73).',
      en: 'Contact us: Swiss HQ in Carouge/Geneva (+41 76 487 60 00) — Office in Lumiar/Lisbon (+351 21 758 06 73).',
      fr: 'Contactez-nous : Siège suisse à Carouge/Genève (+41 76 487 60 00) — Bureau à Lumiar/Lisbonne (+351 21 758 06 73).',
      de: 'Kontaktieren Sie uns: Schweizer Sitz in Carouge/Genf (+41 76 487 60 00) — Büro in Lumiar/Lissabon (+351 21 758 06 73).',
    },
    h1: {
      pt: 'Fale Connosco',
      en: 'Get in Touch',
      fr: 'Contactez-nous',
      de: 'Kontaktieren Sie uns',
    },
    schemaType: 'ContactPage',
  },
  '/legal': {
    title: { pt: 'Avisos Legais', en: 'Legal Notice', fr: 'Mentions Légales', de: 'Rechtliche Hinweise' },
    description: {
      pt: 'Avisos legais e termos de utilização do site Genuíno Investments.',
      en: 'Legal notice and terms of use of the Genuíno Investments website.',
      fr: 'Mentions légales et conditions d\'utilisation du site Genuíno Investments.',
      de: 'Rechtliche Hinweise und Nutzungsbedingungen der Genuíno Investments Website.',
    },
    h1: { pt: 'Avisos Legais', en: 'Legal Notice', fr: 'Mentions Légales', de: 'Rechtliche Hinweise' },
    schemaType: 'WebPage',
  },
  '/privacy': {
    title: { pt: 'Política de Privacidade', en: 'Privacy Policy', fr: 'Politique de Confidentialité', de: 'Datenschutzrichtlinie' },
    description: {
      pt: 'Política de privacidade e proteção de dados pessoais da Genuíno Investments.',
      en: 'Privacy policy and personal data protection of Genuíno Investments.',
      fr: 'Politique de confidentialité et protection des données personnelles de Genuíno Investments.',
      de: 'Datenschutzrichtlinie und Schutz personenbezogener Daten von Genuíno Investments.',
    },
    h1: { pt: 'Privacidade', en: 'Privacy', fr: 'Confidentialité', de: 'Datenschutz' },
    schemaType: 'WebPage',
  },
  '/disputes': {
    title: { pt: 'Resolução de Disputas', en: 'Dispute Resolution', fr: 'Résolution des Litiges', de: 'Streitbeilegung' },
    description: {
      pt: 'Procedimentos para resolução alternativa de litígios e disputas com a Genuíno Investments.',
      en: 'Procedures for alternative dispute resolution with Genuíno Investments.',
      fr: 'Procédures de résolution alternative des litiges avec Genuíno Investments.',
      de: 'Verfahren zur alternativen Streitbeilegung mit Genuíno Investments.',
    },
    h1: { pt: 'Disputas', en: 'Disputes', fr: 'Litiges', de: 'Streitigkeiten' },
    schemaType: 'WebPage',
  },
};

export const ALL_ROUTES = Object.keys(ROUTE_META);
