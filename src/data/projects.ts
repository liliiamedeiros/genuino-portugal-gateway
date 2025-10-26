import vistaMar1 from '@/assets/vista-mar-1.png';
import vistaMar2 from '@/assets/vista-mar-2.png';
import gardensBuilding1 from '@/assets/gardens-building-1.jpeg';
import gardensBuilding2 from '@/assets/gardens-building-2.jpeg';
import santaMarinha from '@/assets/santa-marinha.jpg';
import sesmariasGarden from '@/assets/sesmarias-garden.jpg';

export interface Project {
  id: string;
  title: {
    fr: string;
    en: string;
    de: string;
    pt: string;
  };
  location: string;
  region: string;
  description: {
    fr: string;
    en: string;
    de: string;
    pt: string;
  };
  mainImage: string;
  gallery: string[];
}

export const projects: Project[] = [
  {
    id: 'vista-mar',
    title: {
      fr: 'Genuíno Vista Mar',
      en: 'Genuíno Vista Mar',
      de: 'Genuíno Vista Mar',
      pt: 'Genuíno Vista Mar',
    },
    location: 'Vila Nova de Gaia',
    region: 'Porto',
    description: {
      fr: 'Un développement résidentiel moderne avec vue sur la mer, offrant des appartements de luxe dans un emplacement privilégié.',
      en: 'A modern residential development with sea views, offering luxury apartments in a prime location.',
      de: 'Eine moderne Wohnanlage mit Meerblick, die luxuriöse Apartments in erstklassiger Lage bietet.',
      pt: 'Um empreendimento residencial moderno com vista mar, oferecendo apartamentos de luxo numa localização privilegiada.',
    },
    mainImage: vistaMar1,
    gallery: [vistaMar1, vistaMar2],
  },
  {
    id: 'gardens-building',
    title: {
      fr: 'Genuíno Gardens Building',
      en: 'Genuíno Gardens Building',
      de: 'Genuíno Gardens Building',
      pt: 'Genuíno Gardens Building',
    },
    location: 'Cascais',
    region: 'Lisbonne',
    description: {
      fr: 'Un immeuble élégant entouré de jardins luxuriants, combinant architecture contemporaine et espaces verts.',
      en: 'An elegant building surrounded by lush gardens, combining contemporary architecture and green spaces.',
      de: 'Ein elegantes Gebäude, umgeben von üppigen Gärten, das zeitgenössische Architektur und Grünflächen vereint.',
      pt: 'Um edifício elegante rodeado por jardins exuberantes, combinando arquitetura contemporânea e espaços verdes.',
    },
    mainImage: gardensBuilding1,
    gallery: [gardensBuilding1, gardensBuilding2],
  },
  {
    id: 'santa-marinha',
    title: {
      fr: 'Genuíno Santa Marinha',
      en: 'Genuíno Santa Marinha',
      de: 'Genuíno Santa Marinha',
      pt: 'Genuíno Santa Marinha',
    },
    location: 'Vila Nova de Gaia',
    region: 'Porto',
    description: {
      fr: 'Résidences premium dans un quartier historique, alliant charme traditionnel et confort moderne.',
      en: 'Premium residences in a historic neighborhood, combining traditional charm with modern comfort.',
      de: 'Premium-Residenzen in einem historischen Viertel, die traditionellen Charme mit modernem Komfort verbinden.',
      pt: 'Residências premium num bairro histórico, aliando charme tradicional e conforto moderno.',
    },
    mainImage: santaMarinha,
    gallery: [santaMarinha],
  },
  {
    id: 'sesmarias-garden',
    title: {
      fr: 'Genuíno Sesmarias Garden',
      en: 'Genuíno Sesmarias Garden',
      de: 'Genuíno Sesmarias Garden',
      pt: 'Genuíno Sesmarias Garden',
    },
    location: 'Portimão',
    region: 'Faro',
    description: {
      fr: 'Villas contemporaines avec jardins privés dans l\'Algarve, offrant un style de vie exclusif.',
      en: 'Contemporary villas with private gardens in the Algarve, offering an exclusive lifestyle.',
      de: 'Zeitgenössische Villen mit privaten Gärten an der Algarve, die einen exklusiven Lebensstil bieten.',
      pt: 'Moradias contemporâneas com jardins privados no Algarve, oferecendo um estilo de vida exclusivo.',
    },
    mainImage: sesmariasGarden,
    gallery: [sesmariasGarden],
  },
  {
    id: 'praia-rocha',
    title: {
      fr: 'Genuíno Praia da Rocha',
      en: 'Genuíno Praia da Rocha',
      de: 'Genuíno Praia da Rocha',
      pt: 'Genuíno Praia da Rocha',
    },
    location: 'Portimão',
    region: 'Faro',
    description: {
      fr: 'Développement côtier de luxe avec accès direct à la plage.',
      en: 'Luxury coastal development with direct beach access.',
      de: 'Luxuriöse Küstenentwicklung mit direktem Strandzugang.',
      pt: 'Empreendimento costeiro de luxo com acesso direto à praia.',
    },
    mainImage: vistaMar1,
    gallery: [vistaMar1],
  },
  {
    id: 'praia-amorosa',
    title: {
      fr: 'Genuíno Praia da Amorosa',
      en: 'Genuíno Praia da Amorosa',
      de: 'Genuíno Praia da Amorosa',
      pt: 'Genuíno Praia da Amorosa',
    },
    location: 'Viana do Castelo',
    region: 'Viana do Castelo',
    description: {
      fr: 'Résidences côtières dans le nord du Portugal avec vues spectaculaires.',
      en: 'Coastal residences in northern Portugal with spectacular views.',
      de: 'Küstenresidenzen in Nordportugal mit spektakulären Aussichten.',
      pt: 'Residências costeiras no norte de Portugal com vistas espetaculares.',
    },
    mainImage: gardensBuilding1,
    gallery: [gardensBuilding1],
  },
];
