import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/ProjectCard';
import { HeroSlider } from '@/components/HeroSlider';
import { StatsSection } from '@/components/StatsSection';
import { projects } from '@/data/projects';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Users, TrendingUp } from 'lucide-react';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { SEOHead } from '@/components/SEOHead';

export default function Home() {
  const { t, language } = useLanguage();
  const featuredProjects = projects.slice(0, 3);
  
  const testimonials = [{
    name: 'Antoine Silva',
    role: 'Client & Investisseur',
    text: {
      fr: 'Une expérience exceptionnelle du début à la fin. La qualité de construction et l\'attention aux détails sont remarquables.',
      en: 'An exceptional experience from start to finish. The build quality and attention to detail are remarkable.',
      de: 'Eine außergewöhnliche Erfahrung von Anfang bis Ende. Die Bauqualität und Liebe zum Detail sind bemerkenswert.',
      pt: 'Uma experiência excecional do início ao fim. A qualidade de construção e atenção aos detalhes são notáveis.'
    }
  }, {
    name: 'Álvaro Vieira',
    role: 'Client & Investisseur',
    text: {
      fr: 'Un investissement solide avec une équipe professionnelle et transparente. Je recommande vivement.',
      en: 'A solid investment with a professional and transparent team. Highly recommended.',
      de: 'Eine solide Investition mit einem professionellen und transparenten Team. Sehr zu empfehlen.',
      pt: 'Um investimento sólido com uma equipa profissional e transparente. Recomendo vivamente.'
    }
  }, {
    name: 'José Pereira',
    role: 'Client & Investisseur',
    text: {
      fr: 'Des projets d\'excellence qui valorisent notre patrimoine. Une vision à long terme impressionnante.',
      en: 'Excellence projects that enhance our heritage. An impressive long-term vision.',
      de: 'Exzellente Projekte, die unser Erbe aufwerten. Eine beeindruckende langfristige Vision.',
      pt: 'Projetos de excelência que valorizam o nosso património. Uma visão a longo prazo impressionante.'
    }
  }];

  return (
    <>
      <SEOHead 
        title="Imobiliária Internacional Portugal & Suíça"
        description="Investimentos imobiliários de luxo em Portugal e Suíça. Propriedades exclusivas para férias, praia e campo. Escritórios em Lisboa e Genebra."
        keywords="investimentos imobiliários, imóveis luxo Portugal, casas praia Portugal, propriedades Suíça, investimento imobiliário"
        url="/"
      />
      <div className="min-h-screen">
        {/* Hero Slider */}
        <HeroSlider />

        {/* Stats Section */}
        <StatsSection />

        {/* Featured Projects */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 3xl:py-32 4xl:py-40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12 4xl:px-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl 3xl:text-5xl 4xl:text-6xl font-serif font-bold mb-8 sm:mb-10 md:mb-12 3xl:mb-16 text-center animate-slide-up">
              {t('home.projects.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 3xl:gap-10 4xl:gap-12">
              {featuredProjects.map(project => (
                <ProjectCard 
                  key={project.id} 
                  id={project.id} 
                  title={project.title[language]} 
                  location={`${project.location}, ${project.region}`} 
                  image={project.mainImage} 
                />
              ))}
            </div>
            <div className="text-center mt-8 sm:mt-10 md:mt-12 3xl:mt-16">
              <Link to="/portfolio">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="min-h-touch 3xl:min-h-touch-lg 3xl:text-lg 4xl:text-xl 3xl:px-8 4xl:px-10"
                >
                  Voir tous les projets
                  <ArrowRight className="ml-2 h-5 w-5 3xl:h-6 3xl:w-6" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 3xl:py-32 4xl:py-40 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12 4xl:px-16">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 md:gap-12 3xl:gap-16 text-center">
              <div className="animate-bounce-in">
                <Building2 className="h-10 w-10 sm:h-12 sm:w-12 3xl:h-16 3xl:w-16 4xl:h-20 4xl:w-20 mx-auto mb-3 sm:mb-4 3xl:mb-6" />
                <p className="text-2xl sm:text-3xl md:text-4xl 3xl:text-5xl 4xl:text-6xl font-serif font-bold mb-2">
                  +<AnimatedCounter end={10} /> ANS D'ACTIVITÉ
                </p>
              </div>
              <div className="animate-bounce-in" style={{ animationDelay: '0.2s' }}>
                <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 3xl:h-16 3xl:w-16 4xl:h-20 4xl:w-20 mx-auto mb-3 sm:mb-4 3xl:mb-6" />
                <p className="text-2xl sm:text-3xl md:text-4xl 3xl:text-5xl 4xl:text-6xl font-serif font-bold mb-2">
                  <AnimatedCounter end={12} /> PROJETS RÉALISÉS
                </p>
              </div>
              <div className="animate-bounce-in" style={{ animationDelay: '0.4s' }}>
                <Users className="h-10 w-10 sm:h-12 sm:w-12 3xl:h-16 3xl:w-16 4xl:h-20 4xl:w-20 mx-auto mb-3 sm:mb-4 3xl:mb-6" />
                <p className="text-2xl sm:text-3xl md:text-4xl 3xl:text-5xl 4xl:text-6xl font-serif font-bold mb-2">
                  +<AnimatedCounter end={20000} /> M² CONSTRUITS
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 3xl:py-32 4xl:py-40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12 4xl:px-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl 3xl:text-5xl 4xl:text-6xl font-serif font-bold mb-8 sm:mb-10 md:mb-12 3xl:mb-16 text-center animate-slide-up">
              {t('home.testimonials.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 3xl:gap-10 4xl:gap-12">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index} 
                  className="bg-secondary p-6 sm:p-8 3xl:p-10 4xl:p-12 rounded-lg animate-slide-up" 
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <p className="text-base sm:text-lg 3xl:text-xl 4xl:text-2xl mb-4 sm:mb-6 italic leading-relaxed">
                    &ldquo;{testimonial.text[language]}&rdquo;
                  </p>
                  <div>
                    <p className="font-semibold text-base 3xl:text-lg 4xl:text-xl">{testimonial.name}</p>
                    <p className="text-sm 3xl:text-base 4xl:text-lg text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Investor CTA */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 3xl:py-32 4xl:py-40 text-white" style={{ backgroundColor: '#877350' }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12 4xl:px-16 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl 3xl:text-5xl 4xl:text-6xl font-serif font-bold mb-4 sm:mb-6 3xl:mb-8 animate-scale-in text-slate-50">
              {t('home.investor.title')}
            </h2>
            <p className="text-base sm:text-lg md:text-xl 3xl:text-2xl 4xl:text-3xl mb-6 sm:mb-8 3xl:mb-10 max-w-2xl 3xl:max-w-3xl mx-auto animate-fade-in leading-relaxed">
              {t('home.investor.text')}
            </p>
            <Link to="/investors">
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-background text-foreground hover:bg-background/90 min-h-touch 3xl:min-h-touch-lg 3xl:text-lg 4xl:text-xl 3xl:px-8 4xl:px-10"
              >
                {t('home.investor.cta')}
                <ArrowRight className="ml-2 h-5 w-5 3xl:h-6 3xl:w-6" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Vision Section */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 3xl:py-32 4xl:py-40 bg-secondary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12 4xl:px-16">
            <div className="max-w-4xl 3xl:max-w-5xl 4xl:max-w-6xl mx-auto text-center">
              <p className="text-base sm:text-lg md:text-xl 3xl:text-2xl 4xl:text-3xl leading-relaxed italic text-muted-foreground">
                &ldquo;{t('home.vision.text')}&rdquo;
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
