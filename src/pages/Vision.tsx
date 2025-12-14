import { useLanguage } from '@/contexts/LanguageContext';
import santaMarinha from '@/assets/santa-marinha.jpg';
import { SEOHead } from '@/components/SEOHead';

export default function Vision() {
  const { t } = useLanguage();

  return (
    <>
      <SEOHead 
        title="Nossa Visão"
        description="Nossa visão é criar espaços que transcendem o tempo, integrando sustentabilidade, inovação e design atemporal em cada projeto."
        keywords="visão genuino investments, arquitetura intemporal, sustentabilidade"
        url="/vision"
      />
      <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="relative py-24 sm:py-28 lg:py-32 3xl:py-40 4xl:py-48 overflow-hidden" style={{ background: 'linear-gradient(135deg, #877350 0%, #6d5d42 100%)' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12 4xl:px-16 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl 3xl:text-7xl 4xl:text-8xl font-serif font-bold mb-4 sm:mb-6 3xl:mb-8 animate-fade-in text-white">
            {t('vision.title')}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl 3xl:text-3xl 4xl:text-4xl max-w-3xl 3xl:max-w-4xl mx-auto animate-slide-up text-white/90 leading-relaxed">
            {t('hero.vision')}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 sm:py-20 3xl:py-28 4xl:py-36">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12 4xl:px-16">
          <div className="max-w-4xl 3xl:max-w-5xl mx-auto">
            <p className="text-xl sm:text-2xl 3xl:text-3xl 4xl:text-4xl leading-relaxed text-center mb-8 sm:mb-12 3xl:mb-16 animate-slide-up">
              {t('vision.text')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 3xl:gap-16 4xl:gap-20 mt-12 sm:mt-16 3xl:mt-20">
              <div className="animate-fade-in">
                <h3 className="text-xl sm:text-2xl 3xl:text-3xl 4xl:text-4xl font-serif font-bold mb-3 sm:mb-4 3xl:mb-6">Architecture Intemporelle</h3>
                <p className="text-sm sm:text-base 3xl:text-lg 4xl:text-xl text-muted-foreground leading-relaxed">
                  Nous créons des espaces qui transcendent les tendances passagères, en nous concentrant sur des designs qui restent pertinents et beaux au fil des décennies.
                </p>
              </div>

              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <h3 className="text-xl sm:text-2xl 3xl:text-3xl 4xl:text-4xl font-serif font-bold mb-3 sm:mb-4 3xl:mb-6">Durabilité</h3>
                <p className="text-sm sm:text-base 3xl:text-lg 4xl:text-xl text-muted-foreground leading-relaxed">
                  Nous intégrons des pratiques durables dans chaque projet, minimisant notre impact environnemental tout en maximisant la valeur à long terme.
                </p>
              </div>

              <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <h3 className="text-xl sm:text-2xl 3xl:text-3xl 4xl:text-4xl font-serif font-bold mb-3 sm:mb-4 3xl:mb-6">Innovation</h3>
                <p className="text-sm sm:text-base 3xl:text-lg 4xl:text-xl text-muted-foreground leading-relaxed">
                  Nous embrassons les nouvelles technologies et méthodologies pour offrir des solutions innovantes qui améliorent la qualité de vie.
                </p>
              </div>

              <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <h3 className="text-xl sm:text-2xl 3xl:text-3xl 4xl:text-4xl font-serif font-bold mb-3 sm:mb-4 3xl:mb-6">Héritage Positif</h3>
                <p className="text-sm sm:text-base 3xl:text-lg 4xl:text-xl text-muted-foreground leading-relaxed">
                  Chaque projet est conçu pour enrichir son environnement et sa communauté, laissant une empreinte positive pour les générations futures.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-16 sm:py-20 3xl:py-28 4xl:py-36 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12 4xl:px-16">
          <blockquote className="text-2xl sm:text-3xl 3xl:text-4xl 4xl:text-5xl font-serif italic text-center max-w-4xl 3xl:max-w-5xl mx-auto">
            &ldquo;{t('home.vision.text')}&rdquo;
          </blockquote>
        </div>
      </section>
      </div>
    </>
  );
}
