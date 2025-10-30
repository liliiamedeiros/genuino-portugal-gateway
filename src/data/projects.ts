import villasAlvor1 from '@/assets/villas-alvor-1.jpeg';
import villasAlvor2 from '@/assets/villas-alvor-2.jpeg';
import villasAlvor3 from '@/assets/villas-alvor-3.jpeg';
import villasAlvor4 from '@/assets/villas-alvor-4.jpeg';
import sesmariasVillas1 from '@/assets/sesmarias-villas-1.jpeg';
import sesmariasVillas2 from '@/assets/sesmarias-villas-2.jpeg';
import sesmariasVillas3 from '@/assets/sesmarias-villas-3.jpeg';
import sesmariasVillas4 from '@/assets/sesmarias-villas-4.jpeg';
import vistaMar1 from '@/assets/vista-mar-1.png';
import vistaMar2 from '@/assets/vista-mar-2.jpeg';
import vistaMar3 from '@/assets/vista-mar-3.jpeg';
import vistaMar4 from '@/assets/vista-mar-4.jpeg';
import tavira1 from '@/assets/tavira-1.jpeg';
import tavira2 from '@/assets/tavira-2.jpeg';
import tavira3 from '@/assets/tavira-3.jpeg';
import tavira4 from '@/assets/tavira-4.jpeg';
import beachWalk1 from '@/assets/beach-walk-1.jpeg';
import beachWalk2 from '@/assets/beach-walk-2.jpeg';
import beachWalk3 from '@/assets/beach-walk-3.jpeg';
import beachWalk4 from '@/assets/beach-walk-4.jpeg';
import amorosa1 from '@/assets/amorosa-1.jpeg';
import amorosa2 from '@/assets/amorosa-2.jpeg';
import amorosa3 from '@/assets/amorosa-3.jpeg';
import cercaColegio1 from '@/assets/cerca-colegio-1.jpeg';
import cercaColegio2 from '@/assets/cerca-colegio-2.jpeg';
import cercaColegio3 from '@/assets/cerca-colegio-3.jpeg';
import cercaColegio4 from '@/assets/cerca-colegio-4.jpeg';
import santaMarinha1 from '@/assets/santa-marinha-1.jpeg';
import santaMarinha2 from '@/assets/santa-marinha-2.jpeg';
import santaMarinha3 from '@/assets/santa-marinha-3.jpeg';
import santaMarinha4 from '@/assets/santa-marinha-4.jpeg';

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
  {
    id: 'vista-mar',
    title: {
      fr: 'Genuíno Vista Mar',
      en: 'Genuíno Vista Mar',
      de: 'Genuíno Vista Mar',
      pt: 'Genuíno Vista Mar',
    },
    location: 'Rua do Morangal',
    region: 'Porto, Vila Nova de Gaia',
    description: {
      fr: 'Découvrez des appartements exclusifs T2 et T3, chacun avec un design visuel unique, dans un développement de luxe. Situé sur la Rua do Morangal, avec 4 entrées et 3 étages par entrée, il offre une expérience de vie inoubliable. À quelques mètres de la plage avec des vues privilégiées sur la mer, le Genuíno Vista Mar comprend 36 appartements T2 et T3 avec des surfaces privées comprises entre 152 et 201 mètres carrés. Achèvement prévu pour début 2025.',
      en: 'Discover exclusive T2 and T3 apartments, each with a unique visual design, in a luxury development. Located on Rua do Morangal, with 4 entrances and 3 floors per entrance, it offers an unforgettable living experience. Just meters from the beach with privileged sea views, Genuíno Vista Mar comprises 36 T2 and T3 apartments with private areas ranging from 152 to 201 square meters. Completion scheduled for early 2025.',
      de: 'Entdecken Sie exklusive T2- und T3-Apartments, jedes mit einzigartigem visuellem Design, in einer Luxusanlage. An der Rua do Morangal gelegen, mit 4 Eingängen und 3 Etagen pro Eingang, bietet es ein unvergessliches Wohnerlebnis. Nur wenige Meter vom Strand entfernt mit privilegiertem Meerblick, umfasst Genuíno Vista Mar 36 T2- und T3-Apartments mit Privatflächen zwischen 152 und 201 Quadratmetern. Fertigstellung für Anfang 2025 geplant.',
      pt: 'Descubra apartamentos exclusivos T2 e T3, cada um com um design visual único, em um empreendimento de luxo. Localizado na Rua do Morangal, com 4 entradas e 3 pisos por entrada, oferece uma experiência de vida inesquecível. A poucos metros da praia e com vistas privilegiadas para o mar, o Genuíno Vista Mar contempla 36 apartamentos T2 e T3 com áreas privadas compreendidas entre os 152 e 201 metros quadrados. Conclusão prevista para início de 2025.',
    },
    mainImage: vistaMar1,
    gallery: [vistaMar1, vistaMar2, vistaMar3, vistaMar4],
  },
  {
    id: 'tavira',
    title: {
      fr: 'Genuíno Tavira',
      en: 'Genuíno Tavira',
      de: 'Genuíno Tavira',
      pt: 'Genuíno Tavira',
    },
    location: 'Tavira',
    region: 'Faro, Algarve',
    description: {
      fr: 'Avec un emplacement exceptionnel, ce nouveau développement de luxe à Tavira compte 24 appartements de type T3. Avec piscine individuelle et/ou jacuzzi, toutes les chambres sont des suites. Un projet qui combine confort moderne et élégance intemporelle dans l\'une des villes les plus charmantes de l\'Algarve.',
      en: 'With an exceptional location, this new luxury development in Tavira features 24 T3 apartments. With individual pool and/or jacuzzi, all rooms are suites. A project that combines modern comfort and timeless elegance in one of the Algarve\'s most charming towns.',
      de: 'Mit außergewöhnlicher Lage verfügt diese neue Luxusanlage in Tavira über 24 T3-Apartments. Mit individuellem Pool und/oder Whirlpool sind alle Zimmer Suiten. Ein Projekt, das modernen Komfort und zeitlose Eleganz in einer der charmantesten Städte der Algarve vereint.',
      pt: 'Com uma ótima localização, este novo empreendimento de luxo em Tavira conta com 24 apartamentos de tipologia T3. Com piscina individual e/ou Jacuzzi, todos os quartos são suites. Um projeto que combina conforto moderno e elegância intemporal numa das cidades mais encantadoras do Algarve.',
    },
    mainImage: tavira1,
    gallery: [tavira1, tavira2, tavira3, tavira4],
  },
  {
    id: 'beach-walk',
    title: {
      fr: 'Genuíno Beach Walk',
      en: 'Genuíno Beach Walk',
      de: 'Genuíno Beach Walk',
      pt: 'Genuíno Beach Walk',
    },
    location: 'Praia da Rocha',
    region: 'Faro, Portimão',
    description: {
      fr: 'Le développement Genuíno Resort est un condominium fermé qui se distingue par son architecture moderne au design audacieux et qui est situé au cœur de Praia da Rocha, à moins de 150 mètres de la mer, un emplacement luxueux entre la Marina de Portimão et le village d\'Alvor. Un espace unique pour vivre, passer des vacances et profiter de la tranquillité qui transformera votre maison en un foyer spécial.',
      en: 'The Genuíno Resort development is a gated condominium that stands out for its modern architecture with bold design and is located in the heart of Praia da Rocha, less than 150 meters from the sea, a luxurious location between Portimão Marina and Alvor village. A unique space to live, vacation and enjoy the tranquility that will transform your house into a special home.',
      de: 'Die Genuíno Resort-Anlage ist eine geschlossene Wohnanlage, die sich durch ihre moderne Architektur mit kühnem Design auszeichnet und im Herzen von Praia da Rocha liegt, weniger als 150 Meter vom Meer entfernt, eine luxuriöse Lage zwischen dem Hafen von Portimão und dem Dorf Alvor. Ein einzigartiger Raum zum Leben, Urlaub machen und die Ruhe genießen, die Ihr Haus in ein besonderes Zuhause verwandeln wird.',
      pt: 'O Empreendimento Genuíno Resort é um condomínio fechado que se demarca pela arquitetura moderna de design arrojado e que está localizado no coração da Praia da Rocha, a menos de 150 metros do mar, uma luxuosa localização entre Marina de Portimão e vila de Alvor. Um espaço único para viver, passar férias e usufruir da tranquilidade que vai transformar a Sua casa num lar especial.',
    },
    mainImage: beachWalk1,
    gallery: [beachWalk1, beachWalk2, beachWalk3, beachWalk4],
  },
  {
    id: 'praia-amorosa',
    title: {
      fr: 'Genuíno Praia da Amorosa',
      en: 'Genuíno Praia da Amorosa',
      de: 'Genuíno Praia da Amorosa',
      pt: 'Genuíno Praia da Amorosa',
    },
    location: 'Amorosa',
    region: 'Viana do Castelo',
    description: {
      fr: 'Développement résidentiel exclusif à Viana do Castelo, offrant un cadre de vie unique dans le nord du Portugal. Projet en cours de développement avec des informations détaillées à venir bientôt. Une opportunité d\'investissement dans une région côtière prisée.',
      en: 'Exclusive residential development in Viana do Castelo, offering a unique living environment in northern Portugal. Project under development with detailed information coming soon. An investment opportunity in a sought-after coastal region.',
      de: 'Exklusive Wohnanlage in Viana do Castelo, die ein einzigartiges Wohnumfeld im Norden Portugals bietet. Projekt in der Entwicklung, detaillierte Informationen folgen in Kürze. Eine Investitionsmöglichkeit in einer begehrten Küstenregion.',
      pt: 'Empreendimento residencial exclusivo em Viana do Castelo, oferecendo um ambiente de vida único no norte de Portugal. Projeto em desenvolvimento com informações detalhadas em breve. Uma oportunidade de investimento numa região costeira procurada.',
    },
    mainImage: amorosa1,
    gallery: [amorosa1, amorosa2, amorosa3, amorosa1],
  },
  {
    id: 'cerca-colegio',
    title: {
      fr: 'Genuíno Cerca do Colégio',
      en: 'Genuíno Cerca do Colégio',
      de: 'Genuíno Cerca do Colégio',
      pt: 'Genuíno Cerca do Colégio',
    },
    location: 'Centro de Portimão',
    region: 'Faro, Portimão',
    description: {
      fr: 'Magnifiques appartements de types T2, T3 et T4, situés au centre-ville de Portimão, avec place de parking et barbecue intégrés dans un condominium de luxe. Un emplacement privilégié offrant proximité de tous les services et commodités, idéal pour ceux qui recherchent le confort urbain avec une touche de luxe.',
      en: 'Magnificent T2, T3 and T4 apartments, located in the center of Portimão, with parking space and barbecue integrated into a luxury condominium. A privileged location offering proximity to all services and amenities, ideal for those seeking urban comfort with a touch of luxury.',
      de: 'Herrliche T2-, T3- und T4-Apartments im Zentrum von Portimão, mit Parkplatz und Grill in einer Luxuswohnanlage. Eine privilegierte Lage mit Nähe zu allen Dienstleistungen und Annehmlichkeiten, ideal für diejenigen, die urbanen Komfort mit einem Hauch von Luxus suchen.',
      pt: 'Magníficos apartamentos de tipologias T2, T3 e T4, localizados no centro da cidade de Portimão, com lugar de garagem e barbecue inseridos num condomínio de luxo. Uma localização privilegiada oferecendo proximidade a todos os serviços e comodidades, ideal para quem procura conforto urbano com um toque de luxo.',
    },
    mainImage: cercaColegio1,
    gallery: [cercaColegio1, cercaColegio2, cercaColegio3, cercaColegio4],
  },
  {
    id: 'santa-marinha',
    title: {
      fr: 'Genuíno Santa Marinha',
      en: 'Genuíno Santa Marinha',
      de: 'Genuíno Santa Marinha',
      pt: 'Genuíno Santa Marinha',
    },
    location: 'Rua das Matas',
    region: 'Porto, Vila Nova de Gaia',
    description: {
      fr: 'Vivez en toute tranquillité près de la mer dans des appartements T1, T2 et T3, tous avec jusqu\'à 3 WC et balcons spacieux. Situé sur la Rua das Matas, offre un accès facile aux services et commerces. Idéal pour les familles recherchant confort et commodité. Cet immeuble aux lignes modernes comprend 36 appartements de types T1, T2 et T3 conçus pour profiter au maximum de votre maison de rêve. Les surfaces et balcons généreux se complètent d\'une place de parking ou box pour deux véhicules. Achèvement prévu pour début 2025.',
      en: 'Live peacefully near the sea in T1, T2 and T3 apartments, all with up to 3 bathrooms and spacious balconies. Located on Rua das Matas, offers easy access to services and shops. Ideal for families seeking comfort and convenience. This building with modern lines includes 36 apartments of types T1, T2 and T3 designed to make the most of your dream home. The generous areas and balconies are complemented by a parking space or box for two vehicles. Completion scheduled for early 2025.',
      de: 'Leben Sie in Ruhe in der Nähe des Meeres in T1-, T2- und T3-Apartments, alle mit bis zu 3 Badezimmern und geräumigen Balkonen. An der Rua das Matas gelegen, bietet einfachen Zugang zu Dienstleistungen und Geschäften. Ideal für Familien, die Komfort und Bequemlichkeit suchen. Dieses Gebäude mit modernen Linien umfasst 36 Apartments der Typen T1, T2 und T3, die entworfen wurden, um Ihr Traumhaus maximal zu nutzen. Die großzügigen Flächen und Balkone werden durch einen Parkplatz oder eine Box für zwei Fahrzeuge ergänzt. Fertigstellung für Anfang 2025 geplant.',
      pt: 'Viva com tranquilidade perto do mar em apartamentos T1, T2 e T3, todos com até 3 WCs e varandas espaçosas. Situado na Rua das Matas, oferece fácil acesso a serviços e comércios. Ideal para famílias que buscam conforto e conveniência. Este edifício de linhas modernas contempla 36 apartamentos de tipologias T1, T2 e T3 que foram pensados para desfrutar ao máximo da sua casa de sonho. As áreas e varandas generosas complementam-se com um lugar de garagem ou box para duas viaturas. Conclusão prevista para início de 2025.',
    },
    mainImage: santaMarinha1,
    gallery: [santaMarinha1, santaMarinha2, santaMarinha3, santaMarinha4],
  },
];
