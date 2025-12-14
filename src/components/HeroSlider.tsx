import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
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
  const { t, language } = useLanguage();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [currentSlide, setCurrentSlide] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentSlide(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;
    const timer = setInterval(() => {
      emblaApi.scrollNext();
    }, 3000);
    return () => clearInterval(timer);
  }, [emblaApi]);

  return (
    <section className="relative h-[100svh] overflow-hidden">
      <div className="embla h-full" ref={emblaRef}>
        <div className="embla__container h-full flex">
          {slides.map((slide, index) => (
            <div key={index} className="embla__slide relative min-w-0 flex-[0_0_100%]">
              <img src={slide.image} alt={slide.caption[language]} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12 4xl:px-16 text-center">
          <h1 className="font-serif font-bold mb-4 md:mb-6 3xl:mb-8 4xl:mb-10 animate-fade-in uppercase tracking-wide text-2xl sm:text-3xl md:text-4xl lg:text-5xl 3xl:text-6xl 4xl:text-7xl text-gray-50 px-2">
            {t('home.hero.title')}
          </h1>
          <p className="text-sm sm:text-base md:text-xl lg:text-2xl 3xl:text-3xl 4xl:text-4xl mb-6 md:mb-8 3xl:mb-10 4xl:mb-12 max-w-3xl 3xl:max-w-4xl 4xl:max-w-5xl mx-auto animate-slide-up text-gray-50 uppercase font-semibold tracking-wide px-4">
            {t('home.hero.subtitle')}
          </p>
          <Link to="/portfolio">
            <Button 
              size="lg" 
              variant="outline" 
              className="animate-slide-up bg-transparent border-2 border-primary hover:bg-primary text-base sm:text-lg 3xl:text-xl 4xl:text-2xl px-6 sm:px-8 3xl:px-12 4xl:px-16 py-4 sm:py-6 3xl:py-8 4xl:py-10 uppercase tracking-wider transition-all duration-300 rounded-none text-gray-50 min-h-touch 3xl:min-h-touch-lg"
            >
              {t('home.hero.cta')}
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 3xl:h-6 3xl:w-6 4xl:h-8 4xl:w-8" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Navigation Arrows - Hidden on mobile, larger on TV */}
      <button 
        onClick={scrollPrev} 
        className="hidden md:flex absolute left-4 3xl:left-8 4xl:left-12 top-1/2 -translate-y-1/2 z-20 bg-primary/20 hover:bg-primary/40 backdrop-blur-sm text-white p-3 3xl:p-4 4xl:p-6 rounded-full transition-all items-center justify-center min-h-touch 3xl:min-h-touch-lg"
        aria-label="Slide anterior"
      >
        <ChevronLeft className="h-6 w-6 3xl:h-8 3xl:w-8 4xl:h-10 4xl:w-10" />
      </button>
      <button 
        onClick={scrollNext} 
        className="hidden md:flex absolute right-4 3xl:right-8 4xl:right-12 top-1/2 -translate-y-1/2 z-20 bg-primary/20 hover:bg-primary/40 backdrop-blur-sm text-white p-3 3xl:p-4 4xl:p-6 rounded-full transition-all items-center justify-center min-h-touch 3xl:min-h-touch-lg"
        aria-label="Próximo slide"
      >
        <ChevronRight className="h-6 w-6 3xl:h-8 3xl:w-8 4xl:h-10 4xl:w-10" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 sm:bottom-8 3xl:bottom-12 4xl:bottom-16 left-1/2 -translate-x-1/2 z-20 flex gap-2 3xl:gap-3 4xl:gap-4">
        {slides.map((_, index) => (
          <button 
            key={index} 
            onClick={() => emblaApi?.scrollTo(index)} 
            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 3xl:w-4 3xl:h-4 4xl:w-5 4xl:h-5 rounded-full transition-all duration-300 min-h-touch min-w-0 ${
              index === currentSlide ? 'bg-primary w-6 sm:w-8 3xl:w-10 4xl:w-12' : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
