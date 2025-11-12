import { MapPin, Euro } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

interface PropertyInterestCardProps {
  property: {
    id: string;
    title_pt: string;
    location: string;
    price?: number;
    main_image?: string;
  };
  interactionStatus?: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  viewing: { label: 'Visita Agendada', color: 'bg-blue-500' },
  visited: { label: 'Visitado', color: 'bg-green-500' },
  interested: { label: 'Interessado', color: 'bg-yellow-500' },
  meeting: { label: 'Reunião Agendada', color: 'bg-purple-500' },
};

export const PropertyInterestCard = ({ property, interactionStatus }: PropertyInterestCardProps) => {
  const status = interactionStatus ? statusLabels[interactionStatus] : null;

  return (
    <Link to={`/project/${property.id}`}>
      <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden group">
        <div className="aspect-video relative overflow-hidden bg-muted">
          {property.main_image ? (
            <img
              src={property.main_image}
              alt={property.title_pt}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              Sem imagem
            </div>
          )}
          {status && (
            <Badge className={`absolute top-2 right-2 ${status.color} text-white`}>
              {status.label}
            </Badge>
          )}
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {property.title_pt}
          </h3>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <MapPin className="h-3 w-3" />
            <span className="line-clamp-1">{property.location}</span>
          </div>

          {property.price && (
            <div className="flex items-center gap-1 text-sm font-semibold text-primary">
              <Euro className="h-4 w-4" />
              <span>{property.price.toLocaleString('pt-PT')}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};
