import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { LanguageDetector } from '@/utils/languageDetection';
import { format } from 'date-fns';
import { ptBR, enUS, fr, de } from 'date-fns/locale';

type Language = 'fr' | 'en' | 'de' | 'pt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  formatDate: (date: Date, formatStr: string) => string;
  formatNumber: (num: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number, currency?: string) => string;
}

// Mapa de locales do date-fns
const dateLocales = {
  pt: ptBR,
  en: enUS,
  fr: fr,
  de: de,
};

const translations: Record<Language, Record<string, string>> = {
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.about': 'À propos',
    'nav.services': 'Services',
    'nav.portfolio': 'Portfolio',
    'nav.properties': 'Immobilier',
    'nav.vision': 'Vision',
    'nav.investors': 'Investisseurs',
    'nav.contact': 'Contact',
    
    // Services
    'services.subtitle': 'Des solutions complètes pour vos projets immobiliers',
    'services.economic.title': 'Étude Économique',
    'services.economic.desc': 'Nous disposons de consultants spécialisés dans la réalisation de l\'étude de faisabilité économique et financière nécessaire lors de la phase d\'avant-projet.',
    'services.project.title': 'Projet',
    'services.project.desc': 'Notre département de projet fournit les services d\'architecture, d\'ingénierie et d\'obtention des licences obligatoires.',
    'services.construction.title': 'Construction',
    'services.construction.desc': 'Le groupe Genuíno Investments possède plusieurs entreprises qui garantissent les moyens nécessaires à la construction de projets immobiliers en mode clé en main.',
    'services.marketing.title': 'Marketing',
    'services.marketing.desc': 'Notre équipe de consultants en marketing est spécialisée dans la communication de projets immobiliers, de la création de l\'identité visuelle du projet au développement d\'images 3D.',
    'services.legal.title': 'Support Juridique',
    'services.legal.desc': 'La sécurité et la protection de votre investissement sont fondamentales pour Genuíno Investments et, pour cette raison, nous garantissons à nos investisseurs un support juridique à toutes les phases de l\'investissement.',
    'services.financing.title': 'Financement',
    'services.financing.desc': 'Nous vous accompagnons dans la négociation de financement avec les institutions financières.',
    
    // Home
    'home.hero.title': 'Immobilier au Portugal',
    'home.hero.subtitle': 'La qualité suisse pour réaliser votre rêve immobilier au Portugal',
    'home.hero.cta': 'Découvrir nos projets',
    'home.about.title': 'À propos',
    'home.about.text': 'Nous sommes une entreprise spécialisée dans la promotion et le développement de projets immobiliers, alliant innovation, fonctionnalité et design intemporel.',
    'home.projects.title': 'Nos Projets',
    'home.stats.years': '+10 ans d\'activité',
    'home.stats.projects': '12 projets réalisés',
    'home.stats.area': '+20 000 m² construits',
    'home.testimonials.title': 'Témoignages',
    'home.investor.title': 'Êtes-vous investisseur ?',
    'home.investor.text': 'Nous avons des solutions et des conditions spéciales pour vous.',
    'home.investor.cta': 'En savoir plus',
    'home.vision.text': 'Nous souhaitons laisser une empreinte positive à travers des projets synonymes de rigueur, d\'exigence et de détail.',
    
    // About
    'about.title': 'À propos',
    'about.mission.title': 'Notre Mission',
    'about.mission.text': 'Nous travaillons avec passion pour créer des espaces durables et esthétiques. Chaque projet reflète notre engagement envers la qualité et la précision architecturale.',
    
    // Vision
    'vision.title': 'Notre Vision',
    'vision.text': 'Notre vision est de créer des bâtiments intemporels qui marquent positivement le paysage portugais. Nous allions architecture, innovation et durabilité pour garantir la valeur à long terme de chaque projet.',
    
    // Investors
    'investors.title': 'Investisseurs',
    'investors.subtitle': 'Opportunités d\'investissement',
    'investors.text': 'Nous offrons des opportunités d\'investissement attractives avec des partenariats solides et des projets à fort potentiel.',
    'investors.cta': 'Devenir investisseur',
    
    // Contact
    'contact.title': 'Contact',
    'contact.name': 'Nom',
    'contact.email': 'Email',
    'contact.message': 'Message',
    'contact.send': 'Envoyer',
    'contact.info': 'Nos coordonnées',
    
    // Footer
    'footer.rights': '© 2025 Genuíno Investments. Tous droits réservés.',
    'footer.legal': 'Mentions légales',
    'footer.privacy': 'Politique de confidentialité',
    'footer.disputes': 'Résolution des litiges',
    
    // Projects
    'project.location': 'Localisation',
    'project.gallery': 'Galerie',
    
    // Stats
    'stats.temperature': 'Température moyenne',
    'stats.sunnyDays': 'Jours ensoleillés par an',
    'stats.clients': 'Clients satisfaits',
    'stats.beaches': 'km de Plages Naturelles',
    
    // Hero Subtitles
    'hero.services': 'Découvrez nos solutions sur mesure, adaptées à chaque besoin unique de nos clients.',
    'hero.portfolio': 'Une vitrine de nos projets les plus inspirants et de nos réalisations créatives.',
    'hero.vision': 'Guidés par l\'innovation et l\'excellence, nous façonnons un avenir plus durable et lumineux.',
    'hero.investors': 'Transparence, performance et croissance durable — notre engagement envers vous.',
    'hero.contact': 'Contactez-nous — ensemble, donnons vie à vos rêves immobiliers.',
    'hero.about': 'Les plus beaux projets portugais, signés avec la précision suisse',
    
    // Filters
    'filters.region': 'Région',
    'filters.propertyType': 'Type de propriété',
    'filters.price': 'Prix',
    'filters.priceRange': 'Gamme de prix',
    'filters.all': 'Toutes',
    'filters.allTypes': 'Tous les types',
    'filters.clearFilters': 'Effacer les filtres',
    'filters.resultsCount': '{{count}} propriétés trouvées',
    'filters.noResults': 'Aucune propriété ne correspond à vos critères',
    'filters.apartment': 'Appartement',
    'filters.house': 'Maison',
    'filters.villa': 'Villa',
    'filters.land': 'Terrain',
    'filters.commercial': 'Commercial',
    'filters.advancedFilters': 'Filtres Avancés',
    'filters.bedrooms': 'Nombre de Chambres',
    'filters.bedroomsAll': 'Toutes',
    'filters.area': 'Superficie (m²)',
    'filters.areaMin': 'Minimum',
    'filters.areaMax': 'Maximum',
    'filters.priceMin': 'Minimum',
    'filters.priceMax': 'Maximum',
    'filters.clearAdvanced': 'Effacer Filtres Avancés',
    'filters.tags': 'Tags',
    'filters.tagsPlaceholder': 'Sélectionnez des tags',
    'filters.activeFilters': 'Filtres actifs',
    
    // Compare
    'compare.title': 'Comparer les Propriétés',
    'compare.addToCompare': 'Ajouter à la comparaison',
    'compare.removeFromCompare': 'Retirer de la comparaison',
    'compare.clearAll': 'Effacer la comparaison',
    'compare.compareNow': 'Comparer maintenant',
    'compare.maxReached': 'Maximum de 3 propriétés atteint',
    'compare.selectMore': 'Sélectionnez plus de propriétés à comparer',
    'compare.comparing': 'Comparaison de {count} sur 3 propriétés',
    
    // Search
    'search.placeholder': 'Rechercher par titre, description ou localisation...',
    'search.searching': 'Recherche...',
    'search.searchFor': 'Recherche pour',
    'search.noResults': 'Aucun résultat pour "{{query}}"',
    
    // Chatbot
    'chat.title': 'Assistant Immobilier',
    'chat.placeholder': 'Écrivez votre question...',
    'chat.send': 'Envoyer',
    'chat.greeting': 'Bonjour! Comment puis-je vous aider à trouver votre propriété idéale?',
    'chat.thinking': 'Réflexion...',
    'chat.error': 'Désolé, une erreur s\'est produite. Veuillez réessayer.',
    'chat.suggestions.pool': 'Propriétés avec piscine',
    'chat.suggestions.price': 'Prix en Algarve',
    'chat.suggestions.rooms': 'Appartements T3',
    'chat.fallback': 'Merci pour votre message! Pour plus d\'informations, veuillez nous contacter via le formulaire.',

    // About page
    'about.imageAlt': 'À propos de Genuíno Investments',
    'about.mission.p1': 'Genuíno Investments se distingue dans le secteur par sa vision et sa capacité à identifier des opportunités d\'investissement uniques avec des rendements supérieurs à la moyenne.',
    'about.mission.p2': 'Nous disposons d\'une capacité d\'investissement robuste atteinte grâce aux relations solides entre nos parties prenantes, partenaires et institutions financières.',
    'about.mission.p3': 'Notre portefeuille d\'investissement est diversifié, couvrant plusieurs emplacements au Portugal, comprenant le développement global de projets et l\'acquisition et le repositionnement de projets antérieurs, à travers différents cycles économiques.',
    'about.stats.years': 'Années d\'Activité',
    'about.stats.projects': 'Projets Conclus',
    'about.stats.volume': 'Volume de Ventes',
    'about.approach.title': 'Notre Approche',
    'about.approach.imageAlt': 'Notre approche',
    'about.approach.p1': 'Nous collaborons avec des architectes, des designers d\'intérieur, des constructeurs et des professionnels du marketing pour obtenir un produit final d\'excellence.',
    'about.approach.p2': 'Chaque projet reflète notre engagement envers la qualité, la précision architecturale et l\'innovation durable.',
    'about.values.title': 'Nos Valeurs',
    'about.values.excellence.title': 'Excellence',
    'about.values.excellence.text': 'Nous recherchons l\'excellence dans chaque détail de nos projets, de la conception à la réalisation.',
    'about.values.innovation.title': 'Innovation',
    'about.values.innovation.text': 'Nous combinons design contemporain, technologies durables et solutions architecturales innovantes.',
    'about.values.transparency.title': 'Transparence',
    'about.values.transparency.text': 'Nous cultivons la confiance avec nos clients et partenaires à travers une communication claire et honnête.',

    // Vision page
    'vision.timeless.title': 'Architecture Intemporelle',
    'vision.timeless.text': 'Nous créons des espaces qui transcendent les tendances passagères, en nous concentrant sur des designs qui restent pertinents et beaux au fil des décennies.',
    'vision.sustainability.title': 'Durabilité',
    'vision.sustainability.text': 'Nous intégrons des pratiques durables dans chaque projet, minimisant notre impact environnemental tout en maximisant la valeur à long terme.',
    'vision.innovation.title': 'Innovation',
    'vision.innovation.text': 'Nous embrassons les nouvelles technologies et méthodologies pour offrir des solutions innovantes qui améliorent la qualité de vie.',
    'vision.legacy.title': 'Héritage Positif',
    'vision.legacy.text': 'Chaque projet est conçu pour enrichir son environnement et sa communauté, laissant une empreinte positive pour les générations futures.',

    // Investors page
    'investors.whyTitle': 'Pourquoi investir avec nous ?',
    'investors.benefits.return.title': 'Rendement Attractif',
    'investors.benefits.return.text': 'Des projets soigneusement sélectionnés offrant des rendements compétitifs.',
    'investors.benefits.security.title': 'Sécurité & Transparence',
    'investors.benefits.security.text': 'Une gestion transparente et des garanties solides pour votre investissement.',
    'investors.benefits.expertise.title': 'Expertise Reconnue',
    'investors.benefits.expertise.text': 'Plus de 10 ans d\'expérience dans le développement immobilier.',
    'investors.benefits.strategic.title': 'Projets Stratégiques',
    'investors.benefits.strategic.text': 'Des emplacements premium au Portugal avec fort potentiel de valorisation.',
    'investors.processTitle': 'Notre Processus d\'Investissement',
    'investors.process.step1.title': 'Consultation Initiale',
    'investors.process.step1.text': 'Nous discutons de vos objectifs d\'investissement et vous présentons nos opportunités actuelles.',
    'investors.process.step2.title': 'Due Diligence',
    'investors.process.step2.text': 'Accès complet à la documentation du projet, analyses financières et projections.',
    'investors.process.step3.title': 'Structuration',
    'investors.process.step3.text': 'Mise en place d\'une structure d\'investissement adaptée à votre profil.',
    'investors.process.step4.title': 'Suivi & Reporting',
    'investors.process.step4.text': 'Rapports réguliers sur l\'avancement du projet et la performance de votre investissement.',
    'investors.contactBtn': 'Nous contacter',

    // Contact page
    'contact.formTitle': 'Envoyez-nous un message',
    'contact.firstName': 'Prénom',
    'contact.lastName': 'Nom',
    'contact.phone': 'Téléphone',
    'contact.fillAll': 'Veuillez remplir tous les champs',
    'contact.success': 'Message envoyé avec succès !',
    'contact.swissOffice': 'Siège Suisse',
    'contact.portugalOffice': 'Bureau Portugal',

    // Portfolio page
    'portfolio.title': 'Portfolio',
    'portfolio.noProjects': 'Aucun projet trouvé',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.portfolio': 'Portfolio',
    'nav.properties': 'Properties',
    'nav.vision': 'Vision',
    'nav.investors': 'Investors',
    'nav.contact': 'Contact',
    
    // Services
    'services.subtitle': 'Comprehensive solutions for your real estate projects',
    'services.economic.title': 'Economic Study',
    'services.economic.desc': 'We have consultants specialized in conducting the economic and financial feasibility study necessary during the pre-project phase.',
    'services.project.title': 'Project',
    'services.project.desc': 'Our project department provides architecture, engineering and mandatory licensing services.',
    'services.construction.title': 'Construction',
    'services.construction.desc': 'The Genuíno Investments group owns several companies that guarantee the necessary means for turnkey real estate project construction.',
    'services.marketing.title': 'Marketing',
    'services.marketing.desc': 'Our team of marketing consultants specializes in real estate project communication, from creating the project\'s visual identity to developing 3D images.',
    'services.legal.title': 'Legal Support',
    'services.legal.desc': 'The security and protection of your investment are fundamental to Genuíno Investments and, for this reason, we guarantee our investors legal support at all investment phases.',
    'services.financing.title': 'Financing',
    'services.financing.desc': 'We accompany you in financing negotiations with financial institutions.',
    
    // Home
    'home.hero.title': 'Real Estate in Portugal',
    'home.hero.subtitle': 'Swiss quality to bring your real estate dream to life in Portugal',
    'home.hero.cta': 'Discover our projects',
    'home.about.title': 'About',
    'home.about.text': 'We are a company specializing in the promotion and development of real estate projects, combining innovation, functionality and timeless design.',
    'home.projects.title': 'Our Projects',
    'home.stats.years': '+10 years of activity',
    'home.stats.projects': '12 completed projects',
    'home.stats.area': '+20,000 m² built',
    'home.testimonials.title': 'Testimonials',
    'home.investor.title': 'Are you an investor?',
    'home.investor.text': 'We have solutions and special conditions for you.',
    'home.investor.cta': 'Learn more',
    'home.vision.text': 'We wish to leave a positive mark through projects synonymous with rigor, excellence and detail.',
    
    // About
    'about.title': 'About Us',
    'about.mission.title': 'Our Mission',
    'about.mission.text': 'We work with passion to create sustainable and aesthetic spaces. Each project reflects our commitment to quality and architectural precision.',
    
    // Vision
    'vision.title': 'Our Vision',
    'vision.text': 'Our vision is to create timeless buildings that positively mark the Portuguese landscape. We combine architecture, innovation and sustainability to guarantee the long-term value of each project.',
    
    // Investors
    'investors.title': 'Investors',
    'investors.subtitle': 'Investment Opportunities',
    'investors.text': 'We offer attractive investment opportunities with strong partnerships and high-potential projects.',
    'investors.cta': 'Become an investor',
    
    // Contact
    'contact.title': 'Contact',
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.message': 'Message',
    'contact.send': 'Send',
    'contact.info': 'Contact Information',
    
    // Footer
    'footer.rights': '© 2025 Genuíno Investments. All rights reserved.',
    'footer.legal': 'Legal Notice',
    'footer.privacy': 'Privacy Policy',
    'footer.disputes': 'Dispute Resolution',
    
    // Projects
    'project.location': 'Location',
    'project.gallery': 'Gallery',
    
    // Stats
    'stats.temperature': 'Average temperature',
    'stats.sunnyDays': 'Sunny days per year',
    'stats.clients': 'Happy clients',
    'stats.beaches': 'km of Natural Beaches',
    
    // Hero Subtitles
    'hero.services': 'Discover our tailor-made solutions, adapted to each unique need of our clients.',
    'hero.portfolio': 'A showcase of our most inspiring projects and creative achievements.',
    'hero.vision': 'Guided by innovation and excellence, we shape a more sustainable and brighter future.',
    'hero.investors': 'Transparency, performance and sustainable growth — our commitment to you.',
    'hero.contact': 'Contact us — together, let\'s bring your real estate dreams to life.',
    'hero.about': 'The finest Portuguese projects, crafted with Swiss precision',
    
    // Filters
    'filters.region': 'Region',
    'filters.propertyType': 'Property Type',
    'filters.price': 'Price',
    'filters.priceRange': 'Price Range',
    'filters.all': 'All',
    'filters.allTypes': 'All Types',
    'filters.clearFilters': 'Clear Filters',
    'filters.resultsCount': '{{count}} properties found',
    'filters.noResults': 'No properties match your criteria',
    'filters.apartment': 'Apartment',
    'filters.house': 'House',
    'filters.villa': 'Villa',
    'filters.land': 'Land',
    'filters.commercial': 'Commercial',
    'filters.advancedFilters': 'Advanced Filters',
    'filters.bedrooms': 'Number of Bedrooms',
    'filters.bedroomsAll': 'All',
    'filters.area': 'Area (m²)',
    'filters.areaMin': 'Minimum',
    'filters.areaMax': 'Maximum',
    'filters.priceMin': 'Minimum',
    'filters.priceMax': 'Maximum',
    'filters.clearAdvanced': 'Clear Advanced Filters',
    'filters.tags': 'Tags',
    'filters.tagsPlaceholder': 'Select tags',
    'filters.activeFilters': 'Active filters',
    
    // Compare
    'compare.title': 'Compare Properties',
    'compare.addToCompare': 'Add to comparison',
    'compare.removeFromCompare': 'Remove from comparison',
    'compare.clearAll': 'Clear comparison',
    'compare.compareNow': 'Compare now',
    'compare.maxReached': 'Maximum of 3 properties reached',
    'compare.selectMore': 'Select more properties to compare',
    'compare.comparing': 'Comparing {count} of 3 properties',
    
    // Property Media
    'property.videoUrl': 'Video URL',
    'property.videoUrlPlaceholder': 'https://youtube.com/watch?v=...',
    'property.virtualTourUrl': 'Virtual Tour 360° URL',
    'property.virtualTourUrlPlaceholder': 'https://matterport.com/...',
    'property.viewVideo': 'View Video',
    'property.viewVirtualTour': 'Virtual Tour 360°',
    
    // Search
    'search.placeholder': 'Search by title, description or location...',
    'search.searching': 'Searching...',
    'search.searchFor': 'Search for',
    'search.noResults': 'No results for "{{query}}"',
    
    // Chatbot
    'chat.title': 'Real Estate Assistant',
    'chat.placeholder': 'Write your question...',
    'chat.send': 'Send',
    'chat.greeting': 'Hello! How can I help you find your ideal property?',
    'chat.thinking': 'Thinking...',
    'chat.error': 'Sorry, an error occurred. Please try again.',
    'chat.suggestions.pool': 'Properties with pool',
    'chat.suggestions.price': 'Prices in Algarve',
    'chat.suggestions.rooms': 'T3 Apartments',
    'chat.fallback': 'Thank you for your message! For more information, please contact us through the form.',
    // Pagination
    'pagination.previous': 'Previous',
    'pagination.next': 'Next',
    'pagination.showing': 'Showing',
    'pagination.of': 'of',
    'pagination.properties': 'properties',
    // Sorting
    'sorting.label': 'Sort by',
    'sorting.dateDesc': 'Most Recent',
    'sorting.dateAsc': 'Oldest',
    'sorting.nameAsc': 'Name (A-Z)',
    'sorting.nameDesc': 'Name (Z-A)',
    'sorting.priceAsc': 'Price (Low)',
    'sorting.priceDesc': 'Price (High)',

    // About page
    'about.imageAlt': 'About Genuíno Investments',
    'about.mission.p1': 'Genuíno Investments stands out in the sector for its vision and ability to identify unique investment opportunities with above-average returns.',
    'about.mission.p2': 'We have robust investment capacity built through strong relationships among our stakeholders, partners and financial institutions.',
    'about.mission.p3': 'Our investment portfolio is diversified across multiple locations in Portugal, including full project development and the acquisition and repositioning of legacy projects, across different economic cycles.',
    'about.stats.years': 'Years of Activity',
    'about.stats.projects': 'Completed Projects',
    'about.stats.volume': 'Sales Volume',
    'about.approach.title': 'Our Approach',
    'about.approach.imageAlt': 'Our approach',
    'about.approach.p1': 'We collaborate with architects, interior designers, builders and marketing professionals to deliver a final product of excellence.',
    'about.approach.p2': 'Every project reflects our commitment to quality, architectural precision and sustainable innovation.',
    'about.values.title': 'Our Values',
    'about.values.excellence.title': 'Excellence',
    'about.values.excellence.text': 'We pursue excellence in every detail of our projects, from concept to delivery.',
    'about.values.innovation.title': 'Innovation',
    'about.values.innovation.text': 'We combine contemporary design, sustainable technologies and innovative architectural solutions.',
    'about.values.transparency.title': 'Transparency',
    'about.values.transparency.text': 'We build trust with our clients and partners through clear and honest communication.',

    // Vision page
    'vision.timeless.title': 'Timeless Architecture',
    'vision.timeless.text': 'We create spaces that transcend passing trends, focusing on designs that remain relevant and beautiful for decades.',
    'vision.sustainability.title': 'Sustainability',
    'vision.sustainability.text': 'We integrate sustainable practices into every project, minimising environmental impact while maximising long-term value.',
    'vision.innovation.title': 'Innovation',
    'vision.innovation.text': 'We embrace new technologies and methodologies to deliver innovative solutions that improve quality of life.',
    'vision.legacy.title': 'Positive Legacy',
    'vision.legacy.text': 'Each project is designed to enrich its environment and community, leaving a positive imprint for future generations.',

    // Investors page
    'investors.whyTitle': 'Why invest with us?',
    'investors.benefits.return.title': 'Attractive Returns',
    'investors.benefits.return.text': 'Carefully selected projects delivering competitive returns.',
    'investors.benefits.security.title': 'Security & Transparency',
    'investors.benefits.security.text': 'Transparent management and solid guarantees for your investment.',
    'investors.benefits.expertise.title': 'Recognised Expertise',
    'investors.benefits.expertise.text': 'More than 10 years of experience in real-estate development.',
    'investors.benefits.strategic.title': 'Strategic Projects',
    'investors.benefits.strategic.text': 'Premium locations in Portugal with strong appreciation potential.',
    'investors.processTitle': 'Our Investment Process',
    'investors.process.step1.title': 'Initial Consultation',
    'investors.process.step1.text': 'We discuss your investment goals and present our current opportunities.',
    'investors.process.step2.title': 'Due Diligence',
    'investors.process.step2.text': 'Full access to project documentation, financial analysis and projections.',
    'investors.process.step3.title': 'Structuring',
    'investors.process.step3.text': 'We design an investment structure tailored to your profile.',
    'investors.process.step4.title': 'Tracking & Reporting',
    'investors.process.step4.text': 'Regular reports on project progress and the performance of your investment.',
    'investors.contactBtn': 'Contact us',

    // Contact page
    'contact.formTitle': 'Send us a message',
    'contact.firstName': 'First name',
    'contact.lastName': 'Last name',
    'contact.phone': 'Phone',
    'contact.fillAll': 'Please fill in all fields',
    'contact.success': 'Message sent successfully!',
    'contact.swissOffice': 'Swiss Headquarters',
    'contact.portugalOffice': 'Portugal Office',

    // Portfolio page
    'portfolio.title': 'Portfolio',
    'portfolio.noProjects': 'No projects found',
  },
  de: {
    // Navigation
    'nav.home': 'Startseite',
    'nav.about': 'Über uns',
    'nav.services': 'Dienstleistungen',
    'nav.portfolio': 'Portfolio',
    'nav.properties': 'Immobilien',
    'nav.vision': 'Vision',
    'nav.investors': 'Investoren',
    'nav.contact': 'Kontakt',
    
    // Services
    'services.subtitle': 'Umfassende Lösungen für Ihre Immobilienprojekte',
    'services.economic.title': 'Wirtschaftsstudie',
    'services.economic.desc': 'Wir verfügen über spezialisierte Berater für die Durchführung der wirtschaftlichen und finanziellen Machbarkeitsstudie, die während der Vorprojektphase erforderlich ist.',
    'services.project.title': 'Projekt',
    'services.project.desc': 'Unsere Projektabteilung bietet Architektur-, Ingenieur- und obligatorische Lizenzierungsdienstleistungen.',
    'services.construction.title': 'Bau',
    'services.construction.desc': 'Die Genuíno Investments-Gruppe besitzt mehrere Unternehmen, die die notwendigen Mittel für den schlüsselfertigen Bau von Immobilienprojekten garantieren.',
    'services.marketing.title': 'Marketing',
    'services.marketing.desc': 'Unser Team von Marketingberatern ist auf die Kommunikation von Immobilienprojekten spezialisiert, von der Erstellung der visuellen Identität des Projekts bis zur Entwicklung von 3D-Bildern.',
    'services.legal.title': 'Rechtsunterstützung',
    'services.legal.desc': 'Die Sicherheit und der Schutz Ihrer Investition sind für Genuíno Investments von grundlegender Bedeutung, und aus diesem Grund garantieren wir unseren Investoren rechtliche Unterstützung in allen Investitionsphasen.',
    'services.financing.title': 'Finanzierung',
    'services.financing.desc': 'Wir begleiten Sie bei Finanzierungsverhandlungen mit Finanzinstituten.',
    
    // Home
    'home.hero.title': 'Immobilien in Portugal',
    'home.hero.subtitle': 'Schweizer Qualität für Ihren Immobilientraum in Portugal',
    'home.hero.cta': 'Unsere Projekte entdecken',
    'home.about.title': 'Über uns',
    'home.about.text': 'Wir sind ein auf die Förderung und Entwicklung von Immobilienprojekten spezialisiertes Unternehmen, das Innovation, Funktionalität und zeitloses Design vereint.',
    'home.projects.title': 'Unsere Projekte',
    'home.stats.years': '+10 Jahre Tätigkeit',
    'home.stats.projects': '12 abgeschlossene Projekte',
    'home.stats.area': '+20.000 m² gebaut',
    'home.testimonials.title': 'Referenzen',
    'home.investor.title': 'Sind Sie Investor?',
    'home.investor.text': 'Wir haben Lösungen und besondere Konditionen für Sie.',
    'home.investor.cta': 'Mehr erfahren',
    'home.vision.text': 'Wir möchten durch Projekte, die für Präzision, Exzellenz und Detail stehen, einen positiven Abdruck hinterlassen.',
    
    // About
    'about.title': 'Über uns',
    'about.mission.title': 'Unsere Mission',
    'about.mission.text': 'Wir arbeiten mit Leidenschaft daran, nachhaltige und ästhetische Räume zu schaffen. Jedes Projekt spiegelt unser Engagement für Qualität und architektonische Präzision wider.',
    
    // Vision
    'vision.title': 'Unsere Vision',
    'vision.text': 'Unsere Vision ist es, zeitlose Gebäude zu schaffen, die die portugiesische Landschaft positiv prägen. Wir verbinden Architektur, Innovation und Nachhaltigkeit, um den langfristigen Wert jedes Projekts zu gewährleisten.',
    
    // Investors
    'investors.title': 'Investoren',
    'investors.subtitle': 'Investitionsmöglichkeiten',
    'investors.text': 'Wir bieten attraktive Investitionsmöglichkeiten mit starken Partnerschaften und Projekten mit hohem Potenzial.',
    'investors.cta': 'Investor werden',
    
    // Contact
    'contact.title': 'Kontakt',
    'contact.name': 'Name',
    'contact.email': 'E-Mail',
    'contact.message': 'Nachricht',
    'contact.send': 'Senden',
    'contact.info': 'Kontaktinformationen',
    
    // Footer
    'footer.rights': '© 2025 Genuíno Investments. Alle Rechte vorbehalten.',
    'footer.legal': 'Impressum',
    'footer.privacy': 'Datenschutz',
    'footer.disputes': 'Streitbeilegung',
    
    // Projects
    'project.location': 'Standort',
    'project.gallery': 'Galerie',
    
    // Stats
    'stats.temperature': 'Durchschnittstemperatur',
    'stats.sunnyDays': 'Sonnentage pro Jahr',
    'stats.clients': 'Zufriedene Kunden',
    'stats.beaches': 'km Naturstrände',
    
    // Hero Subtitles
    'hero.services': 'Entdecken Sie unsere maßgeschneiderten Lösungen, angepasst an jeden einzigartigen Bedarf unserer Kunden.',
    'hero.portfolio': 'Eine Auswahl unserer inspirierendsten Projekte und kreativen Leistungen.',
    'hero.vision': 'Geleitet von Innovation und Exzellenz gestalten wir eine nachhaltigere und hellere Zukunft.',
    'hero.investors': 'Transparenz, Leistung und nachhaltiges Wachstum — unser Engagement für Sie.',
    'hero.contact': 'Kontaktieren Sie uns — gemeinsam erwecken wir Ihre Immobilienträume zum Leben.',
    'hero.about': 'Die schönsten portugiesischen Projekte, mit Schweizer Präzision gefertigt',
    
    // Filters
    'filters.region': 'Region',
    'filters.propertyType': 'Immobilientyp',
    'filters.price': 'Preis',
    'filters.priceRange': 'Preisspanne',
    'filters.all': 'Alle',
    'filters.allTypes': 'Alle Typen',
    'filters.clearFilters': 'Filter löschen',
    'filters.resultsCount': '{{count}} Immobilien gefunden',
    'filters.noResults': 'Keine Immobilien entsprechen Ihren Kriterien',
    'filters.apartment': 'Wohnung',
    'filters.house': 'Haus',
    'filters.villa': 'Villa',
    'filters.land': 'Grundstück',
    'filters.commercial': 'Gewerbe',
    'filters.advancedFilters': 'Erweiterte Filter',
    'filters.bedrooms': 'Anzahl der Schlafzimmer',
    'filters.bedroomsAll': 'Alle',
    'filters.area': 'Fläche (m²)',
    'filters.areaMin': 'Minimum',
    'filters.areaMax': 'Maximum',
    'filters.priceMin': 'Minimum',
    'filters.priceMax': 'Maximum',
    'filters.clearAdvanced': 'Erweiterte Filter löschen',
    'filters.tags': 'Tags',
    'filters.tagsPlaceholder': 'Tags auswählen',
    'filters.activeFilters': 'Aktive Filter',
    
    // Compare
    'compare.title': 'Immobilien Vergleichen',
    'compare.addToCompare': 'Zum Vergleich hinzufügen',
    'compare.removeFromCompare': 'Aus Vergleich entfernen',
    'compare.clearAll': 'Vergleich löschen',
    'compare.compareNow': 'Jetzt vergleichen',
    'compare.maxReached': 'Maximum von 3 Immobilien erreicht',
    'compare.selectMore': 'Weitere Immobilien zum Vergleich auswählen',
    'compare.comparing': 'Vergleich von {count} von 3 Immobilien',
    
    // Property Media
    'property.videoUrl': 'Video-URL',
    'property.videoUrlPlaceholder': 'https://youtube.com/watch?v=...',
    'property.virtualTourUrl': 'URL der virtuellen Tour 360°',
    'property.virtualTourUrlPlaceholder': 'https://matterport.com/...',
    'property.viewVideo': 'Video ansehen',
    'property.viewVirtualTour': 'Virtuelle Tour 360°',
    
    // Search
    'search.placeholder': 'Nach Titel, Beschreibung oder Standort suchen...',
    'search.searching': 'Suche...',
    'search.searchFor': 'Suchen nach',
    'search.noResults': 'Keine Ergebnisse für "{{query}}"',
    
    // Chatbot
    'chat.title': 'Immobilien-Assistent',
    'chat.placeholder': 'Schreiben Sie Ihre Frage...',
    'chat.send': 'Senden',
    'chat.greeting': 'Hallo! Wie kann ich Ihnen helfen, Ihre ideale Immobilie zu finden?',
    'chat.thinking': 'Nachdenken...',
    'chat.error': 'Entschuldigung, ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
    'chat.suggestions.pool': 'Immobilien mit Pool',
    'chat.suggestions.price': 'Preise in der Algarve',
    'chat.suggestions.rooms': 'T3 Wohnungen',
    'chat.fallback': 'Vielen Dank für Ihre Nachricht! Für weitere Informationen kontaktieren Sie uns bitte über das Formular.',

    // About page
    'about.imageAlt': 'Über Genuíno Investments',
    'about.mission.p1': 'Genuíno Investments zeichnet sich in der Branche durch seine Vision und seine Fähigkeit aus, einzigartige Investitionsmöglichkeiten mit überdurchschnittlichen Renditen zu identifizieren.',
    'about.mission.p2': 'Wir verfügen über eine robuste Investitionskapazität, die durch starke Beziehungen zwischen unseren Stakeholdern, Partnern und Finanzinstituten aufgebaut wurde.',
    'about.mission.p3': 'Unser Investitionsportfolio ist diversifiziert und umfasst mehrere Standorte in Portugal, einschließlich der Gesamtentwicklung von Projekten sowie der Akquisition und Neupositionierung früherer Projekte über verschiedene Konjunkturzyklen hinweg.',
    'about.stats.years': 'Jahre Tätigkeit',
    'about.stats.projects': 'Abgeschlossene Projekte',
    'about.stats.volume': 'Verkaufsvolumen',
    'about.approach.title': 'Unser Ansatz',
    'about.approach.imageAlt': 'Unser Ansatz',
    'about.approach.p1': 'Wir arbeiten mit Architekten, Innenarchitekten, Bauunternehmen und Marketingfachleuten zusammen, um ein Endprodukt von Exzellenz zu liefern.',
    'about.approach.p2': 'Jedes Projekt spiegelt unser Engagement für Qualität, architektonische Präzision und nachhaltige Innovation wider.',
    'about.values.title': 'Unsere Werte',
    'about.values.excellence.title': 'Exzellenz',
    'about.values.excellence.text': 'Wir streben nach Exzellenz in jedem Detail unserer Projekte, vom Konzept bis zur Umsetzung.',
    'about.values.innovation.title': 'Innovation',
    'about.values.innovation.text': 'Wir verbinden zeitgenössisches Design, nachhaltige Technologien und innovative architektonische Lösungen.',
    'about.values.transparency.title': 'Transparenz',
    'about.values.transparency.text': 'Wir schaffen Vertrauen bei unseren Kunden und Partnern durch klare und ehrliche Kommunikation.',

    // Vision page
    'vision.timeless.title': 'Zeitlose Architektur',
    'vision.timeless.text': 'Wir schaffen Räume, die vorübergehende Trends überdauern, mit Fokus auf Designs, die über Jahrzehnte relevant und schön bleiben.',
    'vision.sustainability.title': 'Nachhaltigkeit',
    'vision.sustainability.text': 'Wir integrieren nachhaltige Praktiken in jedes Projekt und minimieren die Umweltauswirkungen, während wir den langfristigen Wert maximieren.',
    'vision.innovation.title': 'Innovation',
    'vision.innovation.text': 'Wir nutzen neue Technologien und Methoden, um innovative Lösungen anzubieten, die die Lebensqualität verbessern.',
    'vision.legacy.title': 'Positives Erbe',
    'vision.legacy.text': 'Jedes Projekt ist darauf ausgelegt, sein Umfeld und seine Gemeinschaft zu bereichern und einen positiven Eindruck für künftige Generationen zu hinterlassen.',

    // Investors page
    'investors.whyTitle': 'Warum bei uns investieren?',
    'investors.benefits.return.title': 'Attraktive Renditen',
    'investors.benefits.return.text': 'Sorgfältig ausgewählte Projekte mit wettbewerbsfähigen Renditen.',
    'investors.benefits.security.title': 'Sicherheit & Transparenz',
    'investors.benefits.security.text': 'Transparentes Management und solide Garantien für Ihre Investition.',
    'investors.benefits.expertise.title': 'Anerkannte Expertise',
    'investors.benefits.expertise.text': 'Mehr als 10 Jahre Erfahrung in der Immobilienentwicklung.',
    'investors.benefits.strategic.title': 'Strategische Projekte',
    'investors.benefits.strategic.text': 'Premium-Standorte in Portugal mit hohem Wertsteigerungspotenzial.',
    'investors.processTitle': 'Unser Investitionsprozess',
    'investors.process.step1.title': 'Erstberatung',
    'investors.process.step1.text': 'Wir besprechen Ihre Investitionsziele und stellen Ihnen unsere aktuellen Möglichkeiten vor.',
    'investors.process.step2.title': 'Due Diligence',
    'investors.process.step2.text': 'Voller Zugriff auf Projektdokumentation, Finanzanalysen und Prognosen.',
    'investors.process.step3.title': 'Strukturierung',
    'investors.process.step3.text': 'Wir gestalten eine Investitionsstruktur, die zu Ihrem Profil passt.',
    'investors.process.step4.title': 'Begleitung & Reporting',
    'investors.process.step4.text': 'Regelmäßige Berichte zum Projektfortschritt und zur Performance Ihrer Investition.',
    'investors.contactBtn': 'Kontaktieren Sie uns',

    // Contact page
    'contact.formTitle': 'Senden Sie uns eine Nachricht',
    'contact.firstName': 'Vorname',
    'contact.lastName': 'Nachname',
    'contact.phone': 'Telefon',
    'contact.fillAll': 'Bitte füllen Sie alle Felder aus',
    'contact.success': 'Nachricht erfolgreich gesendet!',
    'contact.swissOffice': 'Hauptsitz Schweiz',
    'contact.portugalOffice': 'Büro Portugal',

    // Portfolio page
    'portfolio.title': 'Portfolio',
    'portfolio.noProjects': 'Keine Projekte gefunden',
  },
  pt: {
    // Navigation
    'nav.home': 'Início',
    'nav.about': 'Sobre',
    'nav.services': 'Serviços',
    'nav.portfolio': 'Portfolio',
    'nav.properties': 'Imóveis',
    'nav.vision': 'Visão',
    'nav.investors': 'Investidores',
    'nav.contact': 'Contacto',
    
    // Services
    'services.subtitle': 'Soluções completas para os seus projetos imobiliários',
    'services.economic.title': 'Estudo Económico',
    'services.economic.desc': 'Dispomos de consultores especializados na realização do estudo de viabilidade económica e financeira necessário durante a fase de pré-projeto.',
    'services.project.title': 'Projeto',
    'services.project.desc': 'O nosso departamento de projeto fornece serviços de arquitetura, engenharia e obtenção de licenças obrigatórias.',
    'services.construction.title': 'Construção',
    'services.construction.desc': 'O grupo Genuíno Investments possui várias empresas que garantem os meios necessários para a construção de projetos imobiliários em modo chave na mão.',
    'services.marketing.title': 'Marketing',
    'services.marketing.desc': 'A nossa equipa de consultores de marketing é especializada na comunicação de projetos imobiliários, desde a criação da identidade visual do projeto até ao desenvolvimento de imagens 3D.',
    'services.legal.title': 'Apoio Jurídico',
    'services.legal.desc': 'A segurança e a proteção do seu investimento são fundamentais para a Genuíno Investments e, por essa razão, garantimos aos nossos investidores apoio jurídico em todas as fases do investimento.',
    'services.financing.title': 'Financiamento',
    'services.financing.desc': 'Acompanhamos você na negociação de financiamento com as instituições financeiras.',
    
    // Home
    'home.hero.title': 'Imobiliário em Portugal',
    'home.hero.subtitle': 'Qualidade suíça para realizar o seu sonho imobiliário em Portugal',
    'home.hero.cta': 'Descobrir os nossos projetos',
    'home.about.title': 'Sobre',
    'home.about.text': 'Somos uma empresa especializada na promoção e desenvolvimento de projetos imobiliários, aliando inovação, funcionalidade e design intemporal.',
    'home.projects.title': 'Os Nossos Projetos',
    'home.stats.years': '+10 anos de atividade',
    'home.stats.projects': '12 projetos realizados',
    'home.stats.area': '+20.000 m² construídos',
    'home.testimonials.title': 'Testemunhos',
    'home.investor.title': 'É investidor?',
    'home.investor.text': 'Temos soluções e condições especiais para si.',
    'home.investor.cta': 'Saiba mais',
    'home.vision.text': 'Desejamos deixar uma marca positiva através de projetos sinónimos de rigor, exigência e detalhe.',
    
    // About
    'about.title': 'Sobre Nós',
    'about.mission.title': 'A Nossa Missão',
    'about.mission.text': 'Trabalhamos com paixão para criar espaços sustentáveis e estéticos. Cada projeto reflete o nosso compromisso com a qualidade e a precisão arquitetónica.',
    
    // Vision
    'vision.title': 'A Nossa Visão',
    'vision.text': 'A nossa visão é criar edifícios intemporais que marquem positivamente a paisagem portuguesa. Aliamos arquitetura, inovação e sustentabilidade para garantir o valor a longo prazo de cada projeto.',
    
    // Investors
    'investors.title': 'Investidores',
    'investors.subtitle': 'Oportunidades de Investimento',
    'investors.text': 'Oferecemos oportunidades de investimento atrativas com parcerias sólidas e projetos de alto potencial.',
    'investors.cta': 'Tornar-se investidor',
    
    // Contact
    'contact.title': 'Contacto',
    'contact.name': 'Nome',
    'contact.email': 'Email',
    'contact.message': 'Mensagem',
    'contact.send': 'Enviar',
    'contact.info': 'Informações de Contacto',
    
    // Footer
    'footer.rights': '© 2025 Genuíno Investments. Todos os direitos reservados.',
    'footer.legal': 'Aviso Legal',
    'footer.privacy': 'Política de Privacidade',
    'footer.disputes': 'Resolução de Litígios',
    
    // Projects
    'project.location': 'Localização',
    'project.gallery': 'Galeria',
    
    // Stats
    'stats.temperature': 'Temperatura média',
    'stats.sunnyDays': 'Dias de sol por ano',
    'stats.clients': 'Clientes felizes',
    'stats.beaches': 'km de Praias Naturais',
    
    // Hero Subtitles
    'hero.services': 'Descubra as nossas soluções à medida, adaptadas a cada necessidade única dos nossos clientes.',
    'hero.portfolio': 'Uma montra dos nossos projetos mais inspiradores e realizações criativas.',
    'hero.vision': 'Guiados pela inovação e excelência, moldamos um futuro mais sustentável e luminoso.',
    'hero.investors': 'Transparência, desempenho e crescimento sustentável — o nosso compromisso consigo.',
    'hero.contact': 'Contacte-nos — juntos, damos vida aos seus sonhos imobiliários.',
    'hero.about': 'Os mais belos projetos portugueses, assinados com precisão suíça',
    
    // Filters
    'filters.region': 'Região',
    'filters.propertyType': 'Tipo de Imóvel',
    'filters.price': 'Preço',
    'filters.priceRange': 'Intervalo de Preço',
    'filters.all': 'Todas',
    'filters.allTypes': 'Todos os Tipos',
    'filters.clearFilters': 'Limpar Filtros',
    'filters.resultsCount': '{{count}} propriedades encontradas',
    'filters.noResults': 'Nenhuma propriedade corresponde aos seus critérios',
    'filters.apartment': 'Apartamento',
    'filters.house': 'Moradia',
    'filters.villa': 'Villa',
    'filters.land': 'Terreno',
    'filters.commercial': 'Comercial',
    'filters.advancedFilters': 'Filtros Avançados',
    'filters.bedrooms': 'Número de Quartos',
    'filters.bedroomsAll': 'Todos',
    'filters.area': 'Área (m²)',
    'filters.areaMin': 'Mínimo',
    'filters.areaMax': 'Máximo',
    'filters.priceMin': 'Mínimo',
    'filters.priceMax': 'Máximo',
    'filters.clearAdvanced': 'Limpar Filtros Avançados',
    'filters.tags': 'Tags',
    'filters.tagsPlaceholder': 'Selecione tags',
    'filters.activeFilters': 'Filtros ativos',
    
    // Compare
    'compare.title': 'Comparar Imóveis',
    'compare.addToCompare': 'Adicionar à comparação',
    'compare.removeFromCompare': 'Remover da comparação',
    'compare.clearAll': 'Limpar comparação',
    'compare.compareNow': 'Comparar agora',
    'compare.maxReached': 'Máximo de 3 imóveis atingido',
    'compare.selectMore': 'Selecione mais imóveis para comparar',
    'compare.comparing': 'Comparando {count} de 3 imóveis',
    
    // Property Media
    'property.videoUrl': 'URL do Vídeo',
    'property.videoUrlPlaceholder': 'https://youtube.com/watch?v=...',
    'property.virtualTourUrl': 'URL do Tour Virtual 360°',
    'property.virtualTourUrlPlaceholder': 'https://matterport.com/...',
    'property.viewVideo': 'Ver Vídeo',
    'property.viewVirtualTour': 'Tour Virtual 360°',
    
    // Search
    'search.placeholder': 'Pesquisar por título, descrição ou localização...',
    'search.searching': 'A pesquisar...',
    'search.searchFor': 'Pesquisar por',
    'search.noResults': 'Nenhum resultado para "{{query}}"',
    
    // Chatbot
    'chat.title': 'Assistente Imobiliário',
    'chat.placeholder': 'Escreva a sua pergunta...',
    'chat.send': 'Enviar',
    'chat.greeting': 'Olá! Como posso ajudar a encontrar o seu imóvel ideal?',
    'chat.thinking': 'A pensar...',
    'chat.error': 'Desculpe, ocorreu um erro. Por favor, tente novamente.',
    'chat.suggestions.pool': 'Imóveis com piscina',
    'chat.suggestions.price': 'Preços no Algarve',
    'chat.suggestions.rooms': 'Apartamentos T3',
    'chat.fallback': 'Obrigado pela sua mensagem! Para mais informações, contacte-nos através do formulário.',

    // About page
    'about.imageAlt': 'Sobre a Genuíno Investments',
    'about.mission.p1': 'A Genuíno Investments distingue-se no setor pela sua visão e capacidade de identificar oportunidades de investimento únicas, com rentabilidades acima da média.',
    'about.mission.p2': 'Dispomos de uma robusta capacidade de investimento alcançada através das relações sólidas entre os nossos stakeholders, parceiros e instituições financeiras.',
    'about.mission.p3': 'O nosso portefólio de investimento é diversificado, abrangendo várias localizações em Portugal, incluindo o desenvolvimento integral de projetos e a aquisição e reposicionamento de projetos anteriores, ao longo de diferentes ciclos económicos.',
    'about.stats.years': 'Anos de Atividade',
    'about.stats.projects': 'Projetos Concluídos',
    'about.stats.volume': 'Volume de Vendas',
    'about.approach.title': 'A Nossa Abordagem',
    'about.approach.imageAlt': 'A nossa abordagem',
    'about.approach.p1': 'Colaboramos com arquitetos, designers de interiores, construtores e profissionais de marketing para entregar um produto final de excelência.',
    'about.approach.p2': 'Cada projeto reflete o nosso compromisso com a qualidade, a precisão arquitetónica e a inovação sustentável.',
    'about.values.title': 'Os Nossos Valores',
    'about.values.excellence.title': 'Excelência',
    'about.values.excellence.text': 'Procuramos a excelência em cada detalhe dos nossos projetos, da conceção à concretização.',
    'about.values.innovation.title': 'Inovação',
    'about.values.innovation.text': 'Combinamos design contemporâneo, tecnologias sustentáveis e soluções arquitetónicas inovadoras.',
    'about.values.transparency.title': 'Transparência',
    'about.values.transparency.text': 'Cultivamos a confiança com clientes e parceiros através de uma comunicação clara e honesta.',

    // Vision page
    'vision.timeless.title': 'Arquitetura Intemporal',
    'vision.timeless.text': 'Criamos espaços que transcendem tendências passageiras, focados em designs que se mantêm relevantes e belos ao longo de décadas.',
    'vision.sustainability.title': 'Sustentabilidade',
    'vision.sustainability.text': 'Integramos práticas sustentáveis em cada projeto, minimizando o impacto ambiental e maximizando o valor a longo prazo.',
    'vision.innovation.title': 'Inovação',
    'vision.innovation.text': 'Adotamos novas tecnologias e metodologias para entregar soluções inovadoras que melhoram a qualidade de vida.',
    'vision.legacy.title': 'Legado Positivo',
    'vision.legacy.text': 'Cada projeto é concebido para enriquecer o seu ambiente e a sua comunidade, deixando uma marca positiva para as gerações futuras.',

    // Investors page
    'investors.whyTitle': 'Porquê investir connosco?',
    'investors.benefits.return.title': 'Rentabilidade Atrativa',
    'investors.benefits.return.text': 'Projetos cuidadosamente selecionados que oferecem retornos competitivos.',
    'investors.benefits.security.title': 'Segurança & Transparência',
    'investors.benefits.security.text': 'Gestão transparente e garantias sólidas para o seu investimento.',
    'investors.benefits.expertise.title': 'Experiência Reconhecida',
    'investors.benefits.expertise.text': 'Mais de 10 anos de experiência no desenvolvimento imobiliário.',
    'investors.benefits.strategic.title': 'Projetos Estratégicos',
    'investors.benefits.strategic.text': 'Localizações premium em Portugal com elevado potencial de valorização.',
    'investors.processTitle': 'O Nosso Processo de Investimento',
    'investors.process.step1.title': 'Consulta Inicial',
    'investors.process.step1.text': 'Discutimos os seus objetivos de investimento e apresentamos as nossas oportunidades atuais.',
    'investors.process.step2.title': 'Due Diligence',
    'investors.process.step2.text': 'Acesso completo à documentação do projeto, análises financeiras e projeções.',
    'investors.process.step3.title': 'Estruturação',
    'investors.process.step3.text': 'Desenhamos uma estrutura de investimento adaptada ao seu perfil.',
    'investors.process.step4.title': 'Acompanhamento & Reporting',
    'investors.process.step4.text': 'Relatórios regulares sobre o progresso do projeto e o desempenho do seu investimento.',
    'investors.contactBtn': 'Contacte-nos',

    // Contact page
    'contact.formTitle': 'Envie-nos uma mensagem',
    'contact.firstName': 'Nome',
    'contact.lastName': 'Apelido',
    'contact.phone': 'Telefone',
    'contact.fillAll': 'Por favor preencha todos os campos',
    'contact.success': 'Mensagem enviada com sucesso!',
    'contact.swissOffice': 'Sede Suíça',
    'contact.portugalOffice': 'Escritório Portugal',

    // Portfolio page
    'portfolio.title': 'Portefólio',
    'portfolio.noProjects': 'Nenhum projeto encontrado',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('pt');
  const [isInitialized, setIsInitialized] = useState(false);

  // Detecção automática na inicialização
  useEffect(() => {
    const initLanguage = async () => {
      const result = await LanguageDetector.detectLanguage();
      setLanguageState(result.language);
      setIsInitialized(true);
      
      console.log(`🌍 Language detected: ${result.language} (${result.source}, ${result.confidence} confidence)`);
    };
    
    initLanguage();
  }, []);

  // Função melhorada de tradução com interpolação
  const t = (key: string, vars?: Record<string, string | number>): string => {
    let translation = translations[language][key] || key;
    
    // Interpolação de variáveis {{varName}}
    if (vars) {
      Object.entries(vars).forEach(([varKey, varValue]) => {
        translation = translation.replace(
          new RegExp(`{{${varKey}}}`, 'g'),
          String(varValue)
        );
      });
    }
    
    return translation;
  };

  // Setter que salva no localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    LanguageDetector.saveLanguagePreference(lang);
  };

  // Formatação de datas
  const formatDate = (date: Date, formatStr: string): string => {
    return format(date, formatStr, { locale: dateLocales[language] });
  };

  // Formatação de números
  const formatNumber = (num: number, options?: Intl.NumberFormatOptions): string => {
    const localeMap = {
      pt: 'pt-PT',
      fr: 'fr-FR',
      en: 'en-US',
      de: 'de-DE',
    };
    return new Intl.NumberFormat(localeMap[language], options).format(num);
  };

  // Formatação de moeda
  const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
    return formatNumber(amount, {
      style: 'currency',
      currency: currency,
    });
  };

  // Não renderizar até a detecção ser concluída
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t,
      formatDate,
      formatNumber,
      formatCurrency
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
