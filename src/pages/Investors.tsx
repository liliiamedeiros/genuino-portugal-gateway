import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Shield, Award, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="relative py-32 overflow-hidden" style={{ background: 'linear-gradient(135deg, #877350 0%, #6d5d42 100%)' }}>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 animate-fade-in text-white">
            {t('investors.title')}
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto animate-slide-up text-white/90 leading-relaxed">
            {t('hero.investors')}
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-serif font-bold text-center mb-12">
            Pourquoi investir avec nous ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6 text-center">
                  <benefit.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-serif font-semibold mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Process */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-serif font-bold text-center mb-12">
            Notre Processus d'Investissement
          </h2>
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex gap-6 animate-fade-in">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-serif font-semibold mb-2">Consultation Initiale</h3>
                <p className="text-muted-foreground">
                  Nous discutons de vos objectifs d'investissement et vous présentons nos opportunités actuelles.
                </p>
              </div>
            </div>

            <div className="flex gap-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-serif font-semibold mb-2">Due Diligence</h3>
                <p className="text-muted-foreground">
                  Accès complet à la documentation du projet, analyses financières et projections.
                </p>
              </div>
            </div>

            <div className="flex gap-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-serif font-semibold mb-2">Structuration</h3>
                <p className="text-muted-foreground">
                  Mise en place d'une structure d'investissement adaptée à votre profil.
                </p>
              </div>
            </div>

            <div className="flex gap-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl">
                4
              </div>
              <div>
                <h3 className="text-xl font-serif font-semibold mb-2">Suivi & Reporting</h3>
                <p className="text-muted-foreground">
                  Rapports réguliers sur l'avancement du projet et la performance de votre investissement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-serif font-bold mb-6">{t('investors.cta')}</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('investors.text')}
          </p>
          <Link to="/contact">
            <Button size="lg" className="bg-primary hover:bg-accent text-lg px-8 py-6">
              Nous contacter
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
