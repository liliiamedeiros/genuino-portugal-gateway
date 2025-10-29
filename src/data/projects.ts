import villasAlvor1 from '@/assets/villas-alvor-1.jpeg';
import villasAlvor2 from '@/assets/villas-alvor-2.jpeg';
import villasAlvor3 from '@/assets/villas-alvor-3.jpeg';
import villasAlvor4 from '@/assets/villas-alvor-4.jpeg';
import sesmariasVillas1 from '@/assets/sesmarias-villas-1.jpeg';
import sesmariasVillas2 from '@/assets/sesmarias-villas-2.jpeg';
import sesmariasVillas3 from '@/assets/sesmarias-villas-3.jpeg';
import sesmariasVillas4 from '@/assets/sesmarias-villas-4.jpeg';

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
    id: 'villas-alvor',
    title: {
      fr: 'Genuíno Villas Alvor',
      en: 'Genuíno Villas Alvor',
      de: 'Genuíno Villas Alvor',
      pt: 'Genuíno Villas Alvor',
    },
    location: 'Alto das Sesmarias',
    region: 'Portimão, Algarve',
    description: {
      fr: 'Situé à Alto das Sesmarias - Portimão, Genuíno Villas Alvor est un développement de prestige dont l\'achèvement est prévu pour début 2025. Ce condominium exclusif comprend 4 luxueuses villas T3, chacune offrant 4 salles de bains, toutes en suite, plus un WC de service, offrant intimité et confort exceptionnel. Les villas se distinguent par leur architecture contemporaine et leurs équipements de haute qualité, notamment un garage fermé, une piscine privée, un jacuzzi et un espace barbecue, idéal pour les moments de loisirs et de convivialité.',
      en: 'Located in Alto das Sesmarias - Portimão, Genuíno Villas Alvor is a prestigious development with completion scheduled for early 2025. This exclusive condominium comprises 4 luxurious T3 villas, each offering 4 bathrooms, all en-suite, plus a service WC, providing exceptional privacy and comfort. The villas stand out for their contemporary architecture and high-quality amenities, including a closed garage, private pool, jacuzzi and barbecue area, ideal for leisure and socializing moments.',
      de: 'Das Genuíno Villas Alvor in Alto das Sesmarias - Portimão ist eine prestigeträchtige Anlage, deren Fertigstellung für Anfang 2025 geplant ist. Diese exklusive Wohnanlage besteht aus 4 luxuriösen T3-Villen, jede mit 4 Badezimmern, alle en-suite, plus einem Service-WC, die außergewöhnliche Privatsphäre und Komfort bieten. Die Villen zeichnen sich durch ihre zeitgenössische Architektur und hochwertige Ausstattung aus, darunter eine geschlossene Garage, ein privater Pool, ein Whirlpool und ein Grillbereich, ideal für Freizeit und gesellige Momente.',
      pt: 'Localizado em Alto das Sesmarias - Portimão, o Genuíno Villas Alvor é um empreendimento de prestígio com finalização prevista para início de 2025. Este exclusivo condomínio é composto por 4 luxuosas moradias T3, cada uma oferecendo 4 casas de banho, todas suítes, mais um wc de serviço, proporcionando privacidade e conforto excepcional. As moradias destacam-se pela sua arquitetura contemporânea e comodidades de alta qualidade, incluindo garagem fechada, piscina privativa, jacuzzi e área de barbecue, ideal para momentos de lazer e convívio.',
    },
    mainImage: villasAlvor1,
    gallery: [villasAlvor1, villasAlvor2, villasAlvor3, villasAlvor4],
  },
  {
    id: 'sesmarias-villas-alvor',
    title: {
      fr: 'Genuíno Sesmarias Villas Alvor',
      en: 'Genuíno Sesmarias Villas Alvor',
      de: 'Genuíno Sesmarias Villas Alvor',
      pt: 'Genuíno Sesmarias Villas Alvor',
    },
    location: 'Portimão',
    region: 'Algarve',
    description: {
      fr: 'Développement résidentiel exclusif à Portimão, dans la région prisée de l\'Algarve. Ce projet offre des villas modernes avec des finitions de haute qualité et des espaces généreux, parfait pour ceux qui recherchent un style de vie luxueux dans l\'une des destinations les plus recherchées du Portugal. Proche des plages magnifiques et de toutes les commodités.',
      en: 'Exclusive residential development in Portimão, in the sought-after Algarve region. This project offers modern villas with high-quality finishes and generous spaces, perfect for those seeking a luxurious lifestyle in one of Portugal\'s most desirable destinations. Close to stunning beaches and all amenities.',
      de: 'Exklusive Wohnanlage in Portimão, in der begehrten Algarve-Region. Dieses Projekt bietet moderne Villen mit hochwertigen Oberflächen und großzügigen Räumen, perfekt für diejenigen, die einen luxuriösen Lebensstil in einem der begehrtesten Reiseziele Portugals suchen. In der Nähe von atemberaubenden Stränden und allen Annehmlichkeiten.',
      pt: 'Empreendimento residencial exclusivo em Portimão, na procurada região do Algarve. Este projeto oferece moradias modernas com acabamentos de alta qualidade e espaços generosos, perfeito para quem procura um estilo de vida luxuoso num dos destinos mais desejados de Portugal. Perto de praias deslumbrantes e de todas as comodidades.',
    },
    mainImage: sesmariasVillas1,
    gallery: [sesmariasVillas1, sesmariasVillas2, sesmariasVillas3, sesmariasVillas4],
  },
];
