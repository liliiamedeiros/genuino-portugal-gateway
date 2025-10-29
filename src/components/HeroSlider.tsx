import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import slider1 from '@/assets/slider-1.png';
import slider2 from '@/assets/slider-2.png';
import slider3 from '@/assets/slider-3.png';
import slider4 from '@/assets/slider-4.png';

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
  image: slider1,
  caption: {
    fr: "Acheter maison avec piscine au Portugal - Villa de luxe avec piscine privée et vue panoramique",
    en: "Buy house with pool in Portugal - Luxury villa with private pool and panoramic views",
    de: "Haus mit Pool in Portugal kaufen - Luxusvilla mit privatem Pool und Panoramablick",
    pt: "Comprar casa com piscina em Portugal - Moradia de luxo com piscina privada e vista panorâmica"
  }
}, {
  image: slider2,
  caption: {
    fr: "Acheter maison plage Portugal - Propriété de luxe en bord de mer Algarve",
    en: "Buy beachfront house Portugal - Luxury beachfront property in Algarve",
    de: "Strandhaus Portugal kaufen - Luxusimmobilie am Strand in der Algarve",
    pt: "Comprar casa praia Portugal - Propriedade de luxo à beira-mar no Algarve"
  }
}, {
  image: slider3,
  caption: {
    fr: "Acheter maison au Portugal - Villa moderne avec jardin et architecture contemporaine",
    en: "Buy house in Portugal - Modern villa with garden and contemporary architecture",
    de: "Haus in Portugal kaufen - Moderne Villa mit Garten und zeitgenössischer Architektur",
    pt: "Comprar casa em Portugal - Moradia moderna com jardim e arquitetura contemporânea"
  }
}, {
  image: slider4,
  caption: {
    fr: "Acheter maison Porto Portugal - Immobilier de prestige avec vue mer à Vila Nova de Gaia",
    en: "Buy house Porto Portugal - Prestige real estate with sea view in Vila Nova de Gaia",
    de: "Haus Porto Portugal kaufen - Prestigeimmobilien mit Meerblick in Vila Nova de Gaia",
    pt: "Comprar casa Porto Portugal - Imobiliário de prestígio com vista mar em Vila Nova de Gaia"
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
    }, 3000);
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
        
        <h1 className="font-serif font-bold mb-4 md:mb-6 animate-fade-in uppercase tracking-wide text-3xl md:text-4xl lg:text-5xl text-gray-50 px-2">
          {t('home.hero.title')}
        </h1>
        <p className="text-base md:text-xl lg:text-2xl mb-6 md:mb-8 max-w-3xl mx-auto animate-slide-up text-gray-50 uppercase font-semibold tracking-wide px-4">
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