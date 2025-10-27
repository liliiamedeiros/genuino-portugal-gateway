import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowRight } from 'lucide-react';

interface ProjectCardProps {
  id: string;
  title: string;
  location: string;
  image: string;
}

export const ProjectCard = ({ id, title, location, image }: ProjectCardProps) => {
  return (
    <Link 
      to={`/project/${id}`} 
      className="block group overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-500 bg-card"
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
          <Button 
            variant="outline" 
            className="w-full border-white text-white hover:bg-white hover:text-primary uppercase tracking-wider"
          >
            Voir le projet
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-serif font-bold mb-2 group-hover:text-primary transition-colors uppercase">
          {title}
        </h3>
        <p className="text-muted-foreground flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {location}
        </p>
      </div>
    </Link>
  );
};
