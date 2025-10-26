import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/ProjectCard';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { projects } from '@/data/projects';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Users, TrendingUp } from 'lucide-react';
import vistaMar1 from '@/assets/vista-mar-1.png';

export default function Home() {
  const { t, language } = useLanguage();

  const featuredProjects = projects.slice(0, 3);

  const testimonials = [
    {
      name: 'Antoine Silva',
      role: 'Client & Investisseur',
      text: {
        fr: 'Une expérience exceptionnelle du début à la fin. La qualité de construction et l\'attention aux détails sont remarquables.',
        en: 'An exceptional experience from start to finish. The build quality and attention to detail are remarkable.',
        de: 'Eine außergewöhnliche Erfahrung von Anfang bis Ende. Die Bauqualität und Liebe zum Detail sind bemerkenswert.',
        pt: 'Uma experiência excecional do início ao fim. A qualidade de construção e atenção aos detalhes são notáveis.',
      },
    },
    {
      name: 'Álvaro Vieira',
      role: 'Client & Investisseur',
      text: {
        fr: 'Un investissement solide avec une équipe professionnelle et transparente. Je recommande vivement.',
        en: 'A solid investment with a professional and transparent team. Highly recommended.',
        de: 'Eine solide Investition mit einem professionellen und transparenten Team. Sehr zu empfehlen.',
        pt: 'Um investimento sólido com uma equipa profissional e transparente. Recomendo vivamente.',
      },
    },
    {
      name: 'José Pereira',
      role: 'Client & Investisseur',
      text: {
        fr: 'Des projets d\'excellence qui valorisent notre patrimoine. Une vision à long terme impressionnante.',
        en: 'Excellence projects that enhance our heritage. An impressive long-term vision.',
        de: 'Exzellente Projekte, die unser Erbe aufwerten. Eine beeindruckende langfristige Vision.',
        pt: 'Projetos de excelência que valorizam o nosso património. Uma visão a longo prazo impressionante.',
      },
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={vistaMar1}
            alt="Développement immobilier au Portugal"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/40" />
        </div>

        <div className="container mx-auto px-4 z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 animate-fade-in">
            {t('home.hero.title')}
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto animate-slide-up text-foreground/90">
            {t('home.hero.subtitle')}
          </p>
          <Link to="/portfolio">
            <Button size="lg" className="animate-slide-up bg-primary hover:bg-accent text-lg px-8 py-6">
              {t('home.hero.cta')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-serif font-bold mb-6 animate-slide-up">{t('home.about.title')}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed animate-fade-in">
              {t('home.about.text')}
            </p>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-serif font-bold mb-12 text-center animate-slide-up">
            {t('home.projects.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title[language]}
                location={`${project.location}, ${project.region}`}
                image={project.mainImage}
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
            <div className="animate-bounce-in">
              <Building2 className="h-12 w-12 mx-auto mb-4" />
              <p className="text-4xl font-serif font-bold mb-2">
                +<AnimatedCounter end={10} /> ANS D'ACTIVITÉ
              </p>
            </div>
            <div className="animate-bounce-in" style={{ animationDelay: '0.2s' }}>
              <TrendingUp className="h-12 w-12 mx-auto mb-4" />
              <p className="text-4xl font-serif font-bold mb-2">
                <AnimatedCounter end={12} /> PROJETS RÉALISÉS
              </p>
            </div>
            <div className="animate-bounce-in" style={{ animationDelay: '0.4s' }}>
              <Users className="h-12 w-12 mx-auto mb-4" />
              <p className="text-4xl font-serif font-bold mb-2">
                +<AnimatedCounter end={20000} /> M² CONSTRUITS
              </p>
            </div>
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
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-secondary p-8 rounded-lg animate-slide-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <p className="text-lg mb-6 italic">&ldquo;{testimonial.text[language]}&rdquo;</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investor CTA */}
      <section className="py-20 bg-accent text-accent-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-serif font-bold mb-6 animate-scale-in">{t('home.investor.title')}</h2>
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
    </div>
  );
}
