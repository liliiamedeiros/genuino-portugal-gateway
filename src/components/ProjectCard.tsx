import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowRight, Bed, Maximize } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Feature icons mapping
const FEATURE_ICONS: Record<string, string> = {
  piscina: '🏊',
  ar_condicionado: '❄️',
  jardim: '🌿',
  varanda: '🏖️',
  terraco: '☀️',
  lugar_garagem: '🚗',
  arrecadacao: '📦',
  casa_adaptada: '♿',
  multimedia: '📺',
};

interface ProjectCardProps {
  id: string;
  title: string;
  location: string;
  image: string;
  features?: Record<string, boolean>;
  price?: number;
  bedrooms?: number;
  area_sqm?: number;
  linkPrefix?: string; // Optional: defaults to '/project'
}

export const ProjectCard = ({
  id,
  title,
  location,
  image,
  features,
  price,
  bedrooms,
  area_sqm,
  linkPrefix = '/project',
}: ProjectCardProps) => {
  const { language } = useLanguage();

  // Get active features (max 4 for display)
  const activeFeatures = features 
    ? Object.entries(features)
        .filter(([_, value]) => value === true)
        .map(([key]) => key)
        .slice(0, 4)
    : [];

  // Format price
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="block group overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-500 bg-card relative">
      {/* Feature Badges - Top Left */}
      {activeFeatures.length > 0 && (
        <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-1 max-w-[60%]">
          {activeFeatures.map((feat) => (
            <span 
              key={feat}
              className="bg-background/90 backdrop-blur-sm rounded-md px-2 py-1 text-xs shadow-sm"
              title={feat.replace('_', ' ')}
            >
              {FEATURE_ICONS[feat] || '✓'}
            </span>
          ))}
        </div>
      )}

      <Link to={`${linkPrefix}/${id}`}>
        <div className="relative overflow-hidden h-[200px] sm:h-[220px] md:h-[240px] lg:h-[280px] 3xl:h-[320px] 4xl:h-[360px] w-full">
          <img 
            src={image} 
            alt={`${title} – Luxury real estate project in ${location} – Premium Portuguese property investment opportunity`} 
            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
            <Button variant="outline" className="w-full border-0 hover:bg-primary hover:text-primary-foreground uppercase tracking-wider text-primary bg-background/90 text-xs sm:text-sm">
              {language === 'pt' && 'Ver Projeto'}
              {language === 'fr' && 'Voir le Projet'}
              {language === 'en' && 'View Project'}
              {language === 'de' && 'Projekt Ansehen'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="p-4 sm:p-5 lg:p-6">
          <h3 className="text-lg sm:text-xl lg:text-2xl 3xl:text-3xl font-serif font-bold mb-2 group-hover:text-primary transition-colors uppercase line-clamp-2">
            {title}
          </h3>
          <p className="text-muted-foreground flex items-center gap-2 text-sm sm:text-base mb-3">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{location}</span>
          </p>
          
          {/* Property Info Row */}
          {(price || bedrooms || area_sqm) && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground pt-3 border-t border-border/50">
              {price && (
                <span className="font-semibold text-primary text-sm sm:text-base">
                  {formatPrice(price)}
                </span>
              )}
              {bedrooms && (
                <span className="flex items-center gap-1">
                  <Bed className="h-3.5 w-3.5" />
                  {bedrooms}
                </span>
              )}
              {area_sqm && (
                <span className="flex items-center gap-1">
                  <Maximize className="h-3.5 w-3.5" />
                  {area_sqm}m²
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};