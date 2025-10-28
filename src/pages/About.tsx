import { useLanguage } from '@/contexts/LanguageContext';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import gardensBuilding2 from '@/assets/gardens-building-2.jpeg';
import sesmariasGarden from '@/assets/sesmarias-garden.jpg';

export default function About() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="relative py-32 overflow-hidden" style={{ background: 'linear-gradient(135deg, #877350 0%, #6d5d42 100%)' }}>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 animate-fade-in text-white">
            {t('about.title')}
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto animate-slide-up text-white/90 leading-relaxed">
            {t('hero.about')}
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in-left">
              <h2 className="text-4xl font-serif font-bold mb-6 uppercase">Notre Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Genuíno Investments se distingue dans le secteur par sa vision et sa capacité à identifier des opportunités d'investissement uniques avec des rendements supérieurs à la moyenne.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Nous disposons d'une capacité d'investissement robuste atteinte grâce aux relations solides entre nos parties prenantes, partenaires et institutions financières.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Notre portefeuille d'investissement est diversifié, couvrant plusieurs emplacements au Portugal, comprenant le développement global de projets et l'acquisition et le repositionnement de projets antérieurs, à travers différents cycles économiques.
              </p>
            </div>
            <div className="animate-slide-in-right">
              <img
                src={gardensBuilding2}
                alt="À propos de Genuíno Investments"
                className="w-full rounded-lg shadow-2xl hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="animate-bounce-in">
              <p className="text-5xl font-serif font-bold mb-2">
                <AnimatedCounter end={10} />+
              </p>
              <p className="text-xl uppercase tracking-wider">Années d'Activité</p>
            </div>
            <div className="animate-bounce-in" style={{ animationDelay: '0.2s' }}>
              <p className="text-5xl font-serif font-bold mb-2">
                <AnimatedCounter end={12} />+
              </p>
              <p className="text-xl uppercase tracking-wider">Projets Conclus</p>
            </div>
            <div className="animate-bounce-in" style={{ animationDelay: '0.4s' }}>
              <p className="text-5xl font-serif font-bold mb-2">
                €<AnimatedCounter end={30} />M
              </p>
              <p className="text-xl uppercase tracking-wider">Volume de Ventes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Approach */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in-left order-2 lg:order-1">
              <img
                src={sesmariasGarden}
                alt="Notre approche"
                className="w-full rounded-lg shadow-2xl hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="animate-slide-in-right order-1 lg:order-2">
              <h2 className="text-4xl font-serif font-bold mb-6 uppercase">Notre Approche</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Nous collaborons avec des architectes, des designers d'intérieur, des constructeurs et des professionnels du marketing pour obtenir un produit final d'excellence.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Chaque projet reflète notre engagement envers la qualité, la précision architecturale et l'innovation durable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-serif font-bold text-center mb-12 uppercase">Nos Valeurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-background rounded-lg shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-slide-up">
              <div className="w-20 h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold">
                1
              </div>
              <h3 className="text-2xl font-serif font-semibold mb-4 uppercase">Excellence</h3>
              <p className="text-muted-foreground leading-relaxed">
                Nous recherchons l'excellence dans chaque détail de nos projets, de la conception à la réalisation.
              </p>
            </div>
            <div className="text-center p-8 bg-background rounded-lg shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-20 h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold">
                2
              </div>
              <h3 className="text-2xl font-serif font-semibold mb-4 uppercase">Innovation</h3>
              <p className="text-muted-foreground leading-relaxed">
                Nous combinons design contemporain, technologies durables et solutions architecturales innovantes.
              </p>
            </div>
            <div className="text-center p-8 bg-background rounded-lg shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="w-20 h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold">
                3
              </div>
              <h3 className="text-2xl font-serif font-semibold mb-4 uppercase">Transparence</h3>
              <p className="text-muted-foreground leading-relaxed">
                Nous cultivons la confiance avec nos clients et partenaires à travers une communication claire et honnête.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
