import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { projects } from '@/data/projects';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowLeft } from 'lucide-react';

export default function ProjectDetail() {
  const { id } = useParams();
  const { language, t } = useLanguage();
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-serif font-bold mb-4">Projet non trouvé</h1>
          <Link to="/portfolio">
            <Button>Retour au portfolio</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="relative h-[60vh] overflow-hidden">
        <img
          src={project.mainImage}
          alt={`${project.title[language]} – Luxurious real estate development in ${project.location}, ${project.region}, Portugal – Investment opportunity in Portuguese property`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Link to="/portfolio">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au portfolio
            </Button>
          </Link>

          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-serif font-bold mb-4 animate-fade-in">
              {project.title[language]}
            </h1>
            <div className="flex items-center text-lg text-muted-foreground mb-8">
              <MapPin className="h-5 w-5 mr-2" />
              {project.location}, {project.region}
            </div>

            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-lg leading-relaxed">{project.description[language]}</p>
            </div>

            {/* Gallery */}
            <div>
              <h2 className="text-3xl font-serif font-bold mb-6">{t('project.gallery')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {project.gallery.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${project.title[language]} – Luxury villa in ${project.location}, Algarve, Portugal – High-end Portuguese real estate investment property with modern architecture and premium amenities – Photo ${index + 1}`}
                    className="w-full rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
