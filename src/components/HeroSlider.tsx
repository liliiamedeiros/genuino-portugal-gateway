import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import vistaMar1 from '@/assets/vista-mar-1.png';
import vistaMar2 from '@/assets/vista-mar-2.png';
import gardensBuilding1 from '@/assets/gardens-building-1.jpeg';
import santaMarinha from '@/assets/santamarinha.jpg';
import sesmariasGarden from '@/assets/sesmarias-garden.jpg';

interface Slide {
  image: string;
  caption: {
    fr: string;
    en: string;
    de: string;
    pt: string;
  };
}

const slides: Slide[] = [
  {
    image: vistaMar1,
    caption: {
      fr: "Vue panoramique sur l'océan",
      en: "Panoramic ocean view",
      de: "Panoramablick auf den Ozean",
      pt: "Vista panorâmica sobre o oceano"
    }
  },
  {
    image: vistaMar2,
    caption: {
      fr: "Architecture moderne et intemporelle",
      en: "Modern and timeless architecture",
      de: "Moderne und zeitlose Architektur",
      pt: "Arquitetura moderna e intemporal"
    }
  },
  {
    image: gardensBuilding1,
    caption: {
      fr: "Investir dans l'immobilier au Portugal",
      en: "Invest in Portuguese real estate",
      de: "In portugiesische Immobilien investieren",
      pt: "Investir no imobiliário em Portugal"
    }
  },
  {
    image: santaMarinha,
    caption: {
      fr: "Excellence et raffinement",
      en: "Excellence and refinement",
      de: "Exzellenz und Verfeinerung",
      pt: "Excelência e requinte"
    }
  },
  {
    image: sesmariasGarden,
    caption: {
      fr: "Espaces de vie luxueux",
      en: "Luxurious living spaces",
      de: "Luxuriöse Wohnräume",
      pt: "Espaços de vida luxuosos"
    }
  }
];

export const HeroSlider = () => {
  const { t, language } = useLanguage();
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
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsTransitioning(false), 1000);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsTransitioning(false), 1000);
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ${
            index === currentSlide
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-105'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.caption[language]}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="container mx-auto px-4 z-10 text-center relative">
        <p 
          className={`text-xl md:text-2xl mb-4 text-muted-foreground italic transition-all duration-1000 ${
            isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          {slides[currentSlide].caption[language]}
        </p>
        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 animate-fade-in uppercase tracking-wide">
          {t('home.hero.title')}
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto animate-slide-up text-foreground/90">
          {t('home.hero.subtitle')}
        </p>
        <Link to="/portfolio">
          <Button 
            size="lg" 
            variant="outline"
            className="animate-slide-up bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground text-lg px-8 py-6 uppercase tracking-wider transition-all duration-300"
          >
            {t('home.hero.cta')}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        disabled={isTransitioning}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-primary/20 hover:bg-primary/40 backdrop-blur-sm text-white p-3 rounded-full transition-all disabled:opacity-50"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        disabled={isTransitioning}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-primary/20 hover:bg-primary/40 backdrop-blur-sm text-white p-3 rounded-full transition-all disabled:opacity-50"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (!isTransitioning) {
                setIsTransitioning(true);
                setCurrentSlide(index);
                setTimeout(() => setIsTransitioning(false), 1000);
              }
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-primary w-8'
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </section>
  );
};
