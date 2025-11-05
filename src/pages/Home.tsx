import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/ProjectCard';
import { HeroSlider } from '@/components/HeroSlider';
import { StatsSection } from '@/components/StatsSection';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import * as LucideIcons from 'lucide-react';

export default function Home() {
  const { t, language } = useLanguage();

  const { data: featuredProjects } = useQuery({
    queryKey: ['featured-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .eq('featured', true)
        .limit(3);
      
      if (error) throw error;
      return data;
    },
  });
  const { data: statistics } = useQuery({
    queryKey: ['statistics', 'home'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('statistics')
        .select('*')
        .eq('is_active', true)
        .in('key', ['years_home', 'projects_home', 'sqm_home'])
        .order('order_index');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: testimonials } = useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('order_index')
        .limit(3);
      
      if (error) throw error;
      return data;
    },
  });
  return <div className="min-h-screen">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Stats Section */}
      <StatsSection />

      {/* Featured Projects */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-serif font-bold mb-12 text-center animate-slide-up">
            {t('home.projects.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects?.map(project => (
              <ProjectCard 
                key={project.id} 
                id={project.id} 
                title={(project as any)[`title_${language}`] || project.title_pt} 
                location={`${project.location}, ${project.region}`} 
                image={project.main_image || ''} 
              />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/portfolio">
              <Button variant="outline" size="lg">
                Voir tous les projets
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {statistics?.map((stat, index) => {
              const Icon = (LucideIcons as any)[stat.icon_name] || LucideIcons.TrendingUp;
              const label = (stat.label as any)[language] || (stat.label as any).pt;
              
              return (
                <div key={stat.id} className="animate-bounce-in" style={{ animationDelay: `${index * 0.2}s` }}>
                  <Icon className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-4xl font-serif font-bold mb-2">
                    <AnimatedCounter end={stat.value} /> {label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-serif font-bold mb-12 text-center animate-slide-up">
            {t('home.testimonials.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials?.map((testimonial, index) => {
              const text = (testimonial.text as any)[language] || (testimonial.text as any).pt;
              
              return (
                <div key={testimonial.id} className="bg-secondary p-8 rounded-lg animate-slide-up" style={{
                  animationDelay: `${index * 0.2}s`
                }}>
                  <p className="text-lg mb-6 italic">&ldquo;{text}&rdquo;</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Investor CTA */}
      <section className="py-20 text-white" style={{
      backgroundColor: '#877350'
    }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-serif font-bold mb-6 animate-scale-in text-slate-50">{t('home.investor.title')}</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto animate-fade-in">{t('home.investor.text')}</p>
          <Link to="/investors">
            <Button size="lg" variant="outline" className="bg-background text-foreground hover:bg-background/90">
              {t('home.investor.cta')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xl leading-relaxed italic text-muted-foreground">
              &ldquo;{t('home.vision.text')}&rdquo;
            </p>
          </div>
        </div>
      </section>
    </div>;
}