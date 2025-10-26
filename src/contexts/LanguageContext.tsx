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
    'nav.portfolio': 'Portfolio',
    'nav.vision': 'Vision',
    'nav.investors': 'Investisseurs',
    'nav.contact': 'Contact',
    
    // Home
    'home.hero.title': 'Immobilier au Portugal',
    'home.hero.subtitle': 'Nous développons et promouvons des projets immobiliers au Portugal avec passion, créativité et rigueur.',
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
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.portfolio': 'Portfolio',
    'nav.vision': 'Vision',
    'nav.investors': 'Investors',
    'nav.contact': 'Contact',
    
    // Home
    'home.hero.title': 'Real Estate in Portugal',
    'home.hero.subtitle': 'We develop and promote real estate projects in Portugal with passion, creativity and rigor.',
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
  },
  de: {
    // Navigation
    'nav.home': 'Startseite',
    'nav.about': 'Über uns',
    'nav.portfolio': 'Portfolio',
    'nav.vision': 'Vision',
    'nav.investors': 'Investoren',
    'nav.contact': 'Kontakt',
    
    // Home
    'home.hero.title': 'Immobilien in Portugal',
    'home.hero.subtitle': 'Wir entwickeln und fördern Immobilienprojekte in Portugal mit Leidenschaft, Kreativität und Präzision.',
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
  },
  pt: {
    // Navigation
    'nav.home': 'Início',
    'nav.about': 'Sobre',
    'nav.portfolio': 'Portfolio',
    'nav.vision': 'Visão',
    'nav.investors': 'Investidores',
    'nav.contact': 'Contacto',
    
    // Home
    'home.hero.title': 'Imobiliário em Portugal',
    'home.hero.subtitle': 'Desenvolvemos e promovemos projetos imobiliários em Portugal com paixão, criatividade e rigor.',
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
