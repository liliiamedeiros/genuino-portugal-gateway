import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Shield, Award, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';

export default function Investors() {
  const { t } = useLanguage();

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Rendement Attractif',
      description: 'Des projets soigneusement sélectionnés offrant des rendements compétitifs.',
    },
    {
      icon: Shield,
      title: 'Sécurité & Transparence',
      description: 'Une gestion transparente et des garanties solides pour votre investissement.',
    },
    {
      icon: Award,
      title: 'Expertise Reconnue',
      description: 'Plus de 10 ans d\'expérience dans le développement immobilier.',
    },
    {
      icon: Target,
      title: 'Projets Stratégiques',
      description: 'Des emplacements premium au Portugal avec fort potentiel de valorisation.',
    },
  ];

  return (
    <>
      <SEOHead 
        title="Para Investidores"
        description="Oportunidades de investimento imobiliário de alto retorno em Portugal. Projetos estratégicos com transparência e expertise reconhecida."
        keywords="investimento imobiliário Portugal, oportunidades investimento, rendimento imobiliário"
        url="/investors"
      />
      <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="relative py-24 sm:py-28 lg:py-32 3xl:py-40 4xl:py-48 overflow-hidden" style={{ background: 'linear-gradient(135deg, #877350 0%, #6d5d42 100%)' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12 4xl:px-16 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl 3xl:text-7xl 4xl:text-8xl font-serif font-bold mb-4 sm:mb-6 3xl:mb-8 animate-fade-in text-white">
            {t('investors.title')}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl 3xl:text-3xl 4xl:text-4xl max-w-3xl 3xl:max-w-4xl mx-auto animate-slide-up text-white/90 leading-relaxed">
            {t('hero.investors')}
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-20 3xl:py-28 4xl:py-36">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12 4xl:px-16">
          <h2 className="text-3xl sm:text-4xl 3xl:text-5xl 4xl:text-6xl font-serif font-bold text-center mb-8 sm:mb-12 3xl:mb-16">
            Pourquoi investir avec nous ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 3xl:gap-10 4xl:gap-12">
            {benefits.map((benefit, index) => (
              <Card key={index} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6 sm:p-8 3xl:p-10 4xl:p-12 text-center">
                  <benefit.icon className="h-10 w-10 sm:h-12 sm:w-12 3xl:h-14 3xl:w-14 4xl:h-16 4xl:w-16 text-primary mx-auto mb-4 sm:mb-6 3xl:mb-8" />
                  <h3 className="text-lg sm:text-xl 3xl:text-2xl 4xl:text-3xl font-serif font-semibold mb-2 sm:mb-3 3xl:mb-4">{benefit.title}</h3>
                  <p className="text-sm sm:text-base 3xl:text-lg 4xl:text-xl text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Process */}
      <section className="py-16 sm:py-20 3xl:py-28 4xl:py-36 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12 4xl:px-16">
          <h2 className="text-3xl sm:text-4xl 3xl:text-5xl 4xl:text-6xl font-serif font-bold text-center mb-8 sm:mb-12 3xl:mb-16">
            Notre Processus d'Investissement
          </h2>
          <div className="max-w-4xl 3xl:max-w-5xl mx-auto space-y-6 sm:space-y-8 3xl:space-y-10">
            <div className="flex gap-4 sm:gap-6 3xl:gap-8 animate-fade-in">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 3xl:w-14 3xl:h-14 4xl:w-16 4xl:h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg sm:text-xl 3xl:text-2xl">
                1
              </div>
              <div>
                <h3 className="text-lg sm:text-xl 3xl:text-2xl 4xl:text-3xl font-serif font-semibold mb-1 sm:mb-2 3xl:mb-3">Consultation Initiale</h3>
                <p className="text-sm sm:text-base 3xl:text-lg 4xl:text-xl text-muted-foreground">
                  Nous discutons de vos objectifs d'investissement et vous présentons nos opportunités actuelles.
                </p>
              </div>
            </div>

            <div className="flex gap-4 sm:gap-6 3xl:gap-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 3xl:w-14 3xl:h-14 4xl:w-16 4xl:h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg sm:text-xl 3xl:text-2xl">
                2
              </div>
              <div>
                <h3 className="text-lg sm:text-xl 3xl:text-2xl 4xl:text-3xl font-serif font-semibold mb-1 sm:mb-2 3xl:mb-3">Due Diligence</h3>
                <p className="text-sm sm:text-base 3xl:text-lg 4xl:text-xl text-muted-foreground">
                  Accès complet à la documentation du projet, analyses financières et projections.
                </p>
              </div>
            </div>

            <div className="flex gap-4 sm:gap-6 3xl:gap-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 3xl:w-14 3xl:h-14 4xl:w-16 4xl:h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg sm:text-xl 3xl:text-2xl">
                3
              </div>
              <div>
                <h3 className="text-lg sm:text-xl 3xl:text-2xl 4xl:text-3xl font-serif font-semibold mb-1 sm:mb-2 3xl:mb-3">Structuration</h3>
                <p className="text-sm sm:text-base 3xl:text-lg 4xl:text-xl text-muted-foreground">
                  Mise en place d'une structure d'investissement adaptée à votre profil.
                </p>
              </div>
            </div>

            <div className="flex gap-4 sm:gap-6 3xl:gap-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 3xl:w-14 3xl:h-14 4xl:w-16 4xl:h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg sm:text-xl 3xl:text-2xl">
                4
              </div>
              <div>
                <h3 className="text-lg sm:text-xl 3xl:text-2xl 4xl:text-3xl font-serif font-semibold mb-1 sm:mb-2 3xl:mb-3">Suivi & Reporting</h3>
                <p className="text-sm sm:text-base 3xl:text-lg 4xl:text-xl text-muted-foreground">
                  Rapports réguliers sur l'avancement du projet et la performance de votre investissement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 3xl:py-28 4xl:py-36">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12 4xl:px-16 text-center">
          <h2 className="text-3xl sm:text-4xl 3xl:text-5xl 4xl:text-6xl font-serif font-bold mb-4 sm:mb-6 3xl:mb-8">{t('investors.cta')}</h2>
          <p className="text-lg sm:text-xl 3xl:text-2xl 4xl:text-3xl text-muted-foreground mb-6 sm:mb-8 3xl:mb-10 max-w-2xl 3xl:max-w-3xl mx-auto">
            {t('investors.text')}
          </p>
          <Link to="/contact">
            <Button size="lg" className="min-h-touch 3xl:min-h-touch-lg bg-primary hover:bg-accent text-base sm:text-lg 3xl:text-xl px-6 sm:px-8 3xl:px-10 py-4 sm:py-6 3xl:py-8">
              Nous contacter
            </Button>
          </Link>
        </div>
      </section>
      </div>
    </>
  );
}
