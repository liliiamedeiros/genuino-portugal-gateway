import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import acheterMaisonAvecPiscine from '@/assets/acheter-maison-avec-piscine-portugal.png';
import acheterMaisonPlage from '@/assets/acheter-maison-plage-portugal.png';
import acheterMaisonPortugal from '@/assets/acheter-maison-portugal.png';
import acheterMaisonPorto from '@/assets/acheter-maison-porto-portugal.png';
import villaPiscinePortugal from '@/assets/villa-piscine-portugal.png';
import plagePortugal from '@/assets/plage-portugal.png';
import immobilierPortugal from '@/assets/immobilier-portugal.png';

interface Slide {
  image: string;
  caption: {
    fr: string;
    en: string;
    de: string;
    pt: string;
  };
}

const slides: Slide[] = [{
  image: acheterMaisonAvecPiscine,
  caption: {
    fr: "Acheter maison avec piscine au Portugal - Villa de luxe moderne",
    en: "Buy house with pool in Portugal - Modern luxury villa",
    de: "Haus mit Pool in Portugal kaufen - Moderne Luxusvilla",
    pt: "Comprar casa com piscina em Portugal - Moradia de luxo moderna"
  }
}, {
  image: acheterMaisonPlage,
  caption: {
    fr: "Acheter maison plage Portugal - Propriété en bord de mer",
    en: "Buy beachfront house Portugal - Oceanfront property",
    de: "Strandhaus Portugal kaufen - Immobilie am Meer",
    pt: "Comprar casa praia Portugal - Propriedade à beira-mar"
  }
}, {
  image: acheterMaisonPortugal,
  caption: {
    fr: "Acheter maison au Portugal - Résidence contemporaine avec jardin",
    en: "Buy house in Portugal - Contemporary residence with garden",
    de: "Haus in Portugal kaufen - Zeitgenössische Residenz mit Garten",
    pt: "Comprar casa em Portugal - Residência contemporânea com jardim"
  }
}, {
  image: acheterMaisonPorto,
  caption: {
    fr: "Acheter maison Porto Portugal - Immobilier de prestige",
    en: "Buy house Porto Portugal - Prestige real estate",
    de: "Haus Porto Portugal kaufen - Prestigeimmobilien",
    pt: "Comprar casa Porto Portugal - Imobiliário de prestígio"
  }
}, {
  image: villaPiscinePortugal,
  caption: {
    fr: "Villa avec piscine Portugal - Architecture moderne d'exception",
    en: "Villa with pool Portugal - Exceptional modern architecture",
    de: "Villa mit Pool Portugal - Außergewöhnliche moderne Architektur",
    pt: "Moradia com piscina Portugal - Arquitetura moderna excecional"
  }
}, {
  image: plagePortugal,
  caption: {
    fr: "Plages du Portugal - Investissement immobilier en bord de mer",
    en: "Portugal beaches - Beachfront real estate investment",
    de: "Strände Portugal - Immobilieninvestition am Meer",
    pt: "Praias de Portugal - Investimento imobiliário à beira-mar"
  }
}, {
  image: immobilierPortugal,
  caption: {
    fr: "Immobilier Portugal - Villas de luxe et appartements haut de gamme",
    en: "Portugal real estate - Luxury villas and high-end apartments",
    de: "Immobilien Portugal - Luxusvillen und hochwertige Wohnungen",
    pt: "Imobiliário Portugal - Moradias de luxo e apartamentos premium"
  }
}];
export const HeroSlider = () => {
  const {
    t,
    language
  } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide]);
  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(prev => (prev + 1) % slides.length);
    setTimeout(() => setIsTransitioning(false), 1000);
  };
  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsTransitioning(false), 1000);
  };
  return <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => <div key={index} className={`absolute inset-0 transition-all duration-1000 ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}>
          <img src={slide.image} alt={slide.caption[language]} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </div>)}

      {/* Content */}
      <div className="container mx-auto px-4 z-10 text-center relative">
        
        <h1 className="font-serif font-bold mb-6 animate-fade-in uppercase tracking-wide md:text-5xl text-5xl text-gray-50">
          {t('home.hero.title')}
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto animate-slide-up text-gray-50">
          {t('home.hero.subtitle')}
        </p>
        <Link to="/portfolio">
          <Button size="lg" variant="outline" className="animate-slide-up bg-transparent border-2 border-primary hover:bg-primary text-lg px-8 py-6 uppercase tracking-wider transition-all duration-300 rounded-none text-gray-50">
            {t('home.hero.cta')}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* Navigation Arrows */}
      <button onClick={prevSlide} disabled={isTransitioning} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-primary/20 hover:bg-primary/40 backdrop-blur-sm text-white p-3 rounded-full transition-all disabled:opacity-50">
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button onClick={nextSlide} disabled={isTransitioning} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-primary/20 hover:bg-primary/40 backdrop-blur-sm text-white p-3 rounded-full transition-all disabled:opacity-50">
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => <button key={index} onClick={() => {
        if (!isTransitioning) {
          setIsTransitioning(true);
          setCurrentSlide(index);
          setTimeout(() => setIsTransitioning(false), 1000);
        }
      }} className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-primary w-8' : 'bg-white/50 hover:bg-white/75'}`} />)}
      </div>
    </section>;
};