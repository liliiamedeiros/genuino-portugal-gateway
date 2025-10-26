import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface ProjectCardProps {
  id: string;
  title: string;
  location: string;
  image: string;
}

export const ProjectCard = ({ id, title, location, image }: ProjectCardProps) => {
  return (
    <Link to={`/project/${id}`}>
      <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={image}
            alt={`Projet ${title} – Développement immobilier au Portugal`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        <CardContent className="p-6">
          <h3 className="text-xl font-serif font-semibold mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            {location}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
