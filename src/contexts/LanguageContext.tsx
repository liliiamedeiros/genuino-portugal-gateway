import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'fr' | 'en' | 'de' | 'pt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

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
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
