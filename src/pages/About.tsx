import { useLanguage } from '@/contexts/LanguageContext';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import gardensBuilding2 from '@/assets/gardens-building-2.jpeg';
import sesmariasGarden from '@/assets/sesmarias-garden.jpg';
import { SEOHead } from '@/components/SEOHead';

export default function About() {
  const { t } = useLanguage();

  return (
    <>
      <SEOHead 
        title="Sobre Nós"
        description="Genuíno Investments se distingue no setor imobiliário com mais de 10 anos de experiência. Investimentos de qualidade em Portugal e Suíça."
        keywords="sobre genuino investments, empresa imobiliária, investimentos Portugal"
        url="/about"
      />
      <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="relative py-24 sm:py-28 lg:py-32 3xl:py-40 4xl:py-48 overflow-hidden" style={{ background: 'linear-gradient(135deg, #877350 0%, #6d5d42 100%)' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12 4xl:px-16 text-center relative z-10">
        <h1 className="text-4xl sm:text-5xl md:text-6xl 3xl:text-7xl 4xl:text-8xl font-serif font-bold mb-4 sm:mb-6 3xl:mb-8 animate-fade-in text-white uppercase">
          {t('nav.about')}
        </h1>
          <p className="text-lg sm:text-xl md:text-2xl 3xl:text-3xl 4xl:text-4xl max-w-3xl 3xl:max-w-4xl mx-auto animate-slide-up text-white/90 leading-relaxed">
            {t('hero.about')}
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 sm:py-20 3xl:py-28 4xl:py-36">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12 4xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 3xl:gap-16 4xl:gap-20 items-center">
            <div className="animate-slide-in-left">
              <h2 className="text-3xl sm:text-4xl 3xl:text-5xl 4xl:text-6xl font-serif font-bold mb-4 sm:mb-6 3xl:mb-8 uppercase">Notre Mission</h2>
              <p className="text-base sm:text-lg 3xl:text-xl 4xl:text-2xl text-muted-foreground leading-relaxed mb-4 sm:mb-6 3xl:mb-8">
                Genuíno Investments se distingue dans le secteur par sa vision et sa capacité à identifier des opportunités d'investissement uniques avec des rendements supérieurs à la moyenne.
              </p>
              <p className="text-base sm:text-lg 3xl:text-xl 4xl:text-2xl text-muted-foreground leading-relaxed mb-4 sm:mb-6 3xl:mb-8">
                Nous disposons d'une capacité d'investissement robuste atteinte grâce aux relations solides entre nos parties prenantes, partenaires et institutions financières.
              </p>
              <p className="text-base sm:text-lg 3xl:text-xl 4xl:text-2xl text-muted-foreground leading-relaxed">
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
      <section className="py-16 sm:py-20 3xl:py-28 4xl:py-36 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12 4xl:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12 3xl:gap-16 4xl:gap-20 text-center">
            <div className="animate-bounce-in">
              <p className="text-4xl sm:text-5xl 3xl:text-6xl 4xl:text-7xl font-serif font-bold mb-2 3xl:mb-4">
                <AnimatedCounter end={10} />+
              </p>
              <p className="text-lg sm:text-xl 3xl:text-2xl 4xl:text-3xl uppercase tracking-wider">Années d'Activité</p>
            </div>
            <div className="animate-bounce-in" style={{ animationDelay: '0.2s' }}>
              <p className="text-4xl sm:text-5xl 3xl:text-6xl 4xl:text-7xl font-serif font-bold mb-2 3xl:mb-4">
                <AnimatedCounter end={12} />+
              </p>
              <p className="text-lg sm:text-xl 3xl:text-2xl 4xl:text-3xl uppercase tracking-wider">Projets Conclus</p>
            </div>
            <div className="animate-bounce-in" style={{ animationDelay: '0.4s' }}>
              <p className="text-4xl sm:text-5xl 3xl:text-6xl 4xl:text-7xl font-serif font-bold mb-2 3xl:mb-4">
                €<AnimatedCounter end={30} />M
              </p>
              <p className="text-lg sm:text-xl 3xl:text-2xl 4xl:text-3xl uppercase tracking-wider">Volume de Ventes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Approach */}
      <section className="py-16 sm:py-20 3xl:py-28 4xl:py-36">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12 4xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 3xl:gap-16 4xl:gap-20 items-center">
            <div className="animate-slide-in-left order-2 lg:order-1">
              <img
                src={sesmariasGarden}
                alt="Notre approche"
                className="w-full rounded-lg shadow-2xl hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="animate-slide-in-right order-1 lg:order-2">
              <h2 className="text-3xl sm:text-4xl 3xl:text-5xl 4xl:text-6xl font-serif font-bold mb-4 sm:mb-6 3xl:mb-8 uppercase">Notre Approche</h2>
              <p className="text-base sm:text-lg 3xl:text-xl 4xl:text-2xl text-muted-foreground leading-relaxed mb-4 sm:mb-6 3xl:mb-8">
                Nous collaborons avec des architectes, des designers d'intérieur, des constructeurs et des professionnels du marketing pour obtenir un produit final d'excellence.
              </p>
              <p className="text-base sm:text-lg 3xl:text-xl 4xl:text-2xl text-muted-foreground leading-relaxed">
                Chaque projet reflète notre engagement envers la qualité, la précision architecturale et l'innovation durable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 sm:py-20 3xl:py-28 4xl:py-36 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12 4xl:px-16">
          <h2 className="text-3xl sm:text-4xl 3xl:text-5xl 4xl:text-6xl font-serif font-bold text-center mb-8 sm:mb-12 3xl:mb-16 uppercase">Nos Valeurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 3xl:gap-10 4xl:gap-12">
            <div className="text-center p-6 sm:p-8 3xl:p-10 4xl:p-12 bg-background rounded-lg shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-slide-up">
              <div className="w-16 h-16 sm:w-20 sm:h-20 3xl:w-24 3xl:h-24 4xl:w-28 4xl:h-28 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 3xl:mb-8 text-2xl sm:text-3xl 3xl:text-4xl 4xl:text-5xl font-bold">
                1
              </div>
              <h3 className="text-xl sm:text-2xl 3xl:text-3xl 4xl:text-4xl font-serif font-semibold mb-3 sm:mb-4 3xl:mb-6 uppercase">Excellence</h3>
              <p className="text-sm sm:text-base 3xl:text-lg 4xl:text-xl text-muted-foreground leading-relaxed">
                Nous recherchons l'excellence dans chaque détail de nos projets, de la conception à la réalisation.
              </p>
            </div>
            <div className="text-center p-6 sm:p-8 3xl:p-10 4xl:p-12 bg-background rounded-lg shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 3xl:w-24 3xl:h-24 4xl:w-28 4xl:h-28 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 3xl:mb-8 text-2xl sm:text-3xl 3xl:text-4xl 4xl:text-5xl font-bold">
                2
              </div>
              <h3 className="text-xl sm:text-2xl 3xl:text-3xl 4xl:text-4xl font-serif font-semibold mb-3 sm:mb-4 3xl:mb-6 uppercase">Innovation</h3>
              <p className="text-sm sm:text-base 3xl:text-lg 4xl:text-xl text-muted-foreground leading-relaxed">
                Nous combinons design contemporain, technologies durables et solutions architecturales innovantes.
              </p>
            </div>
            <div className="text-center p-6 sm:p-8 3xl:p-10 4xl:p-12 bg-background rounded-lg shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 3xl:w-24 3xl:h-24 4xl:w-28 4xl:h-28 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 3xl:mb-8 text-2xl sm:text-3xl 3xl:text-4xl 4xl:text-5xl font-bold">
                3
              </div>
              <h3 className="text-xl sm:text-2xl 3xl:text-3xl 4xl:text-4xl font-serif font-semibold mb-3 sm:mb-4 3xl:mb-6 uppercase">Transparence</h3>
              <p className="text-sm sm:text-base 3xl:text-lg 4xl:text-xl text-muted-foreground leading-relaxed">
                Nous cultivons la confiance avec nos clients et partenaires à travers une communication claire et honnête.
              </p>
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}