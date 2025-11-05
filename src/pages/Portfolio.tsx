import { useLanguage } from '@/contexts/LanguageContext';
import { ProjectCard } from '@/components/ProjectCard';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export default function Portfolio() {
  const { t, language } = useLanguage();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="relative py-32 overflow-hidden" style={{ background: 'linear-gradient(135deg, #877350 0%, #6d5d42 100%)' }}>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 animate-fade-in text-white">
            {t('nav.portfolio')}
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto animate-slide-up text-white/90 leading-relaxed">
            {t('hero.portfolio')}
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects?.map((project, index) => (
                <div
                  key={project.id}
                  className="group animate-scale-in hover:-translate-y-2 transition-all duration-500"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ProjectCard
                    id={project.id}
                    title={(project as any)[`title_${language}`] || project.title_pt}
                    location={`${project.location}, ${project.region}`}
                    image={project.main_image || ''}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
