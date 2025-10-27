import { useLanguage } from '@/contexts/LanguageContext';
import { ProjectCard } from '@/components/ProjectCard';
import { projects } from '@/data/projects';

export default function Portfolio() {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-serif font-bold text-center mb-6 animate-fade-in">
            {t('nav.portfolio')}
          </h1>
          <p className="text-xl text-center text-muted-foreground max-w-3xl mx-auto">
            Découvrez nos projets immobiliers au Portugal
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className="group animate-scale-in hover:-translate-y-2 transition-all duration-500"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProjectCard
                  id={project.id}
                  title={project.title[language]}
                  location={`${project.location}, ${project.region}`}
                  image={project.mainImage}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
