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
      <section className="relative py-32 overflow-hidden" style={{ background: 'linear-gradient(135deg, #877350 0%, #6d5d42 100%)' }}>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 animate-fade-in text-white">
            {t('vision.title')}
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto animate-slide-up text-white/90 leading-relaxed">
            {t('hero.vision')}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-2xl leading-relaxed text-center mb-12 animate-slide-up">
              {t('vision.text')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
              <div className="animate-fade-in">
                <h3 className="text-2xl font-serif font-bold mb-4">Architecture Intemporelle</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Nous créons des espaces qui transcendent les tendances passagères, en nous concentrant sur des designs qui restent pertinents et beaux au fil des décennies.
                </p>
              </div>

              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <h3 className="text-2xl font-serif font-bold mb-4">Durabilité</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Nous intégrons des pratiques durables dans chaque projet, minimisant notre impact environnemental tout en maximisant la valeur à long terme.
                </p>
              </div>

              <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <h3 className="text-2xl font-serif font-bold mb-4">Innovation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Nous embrassons les nouvelles technologies et méthodologies pour offrir des solutions innovantes qui améliorent la qualité de vie.
                </p>
              </div>

              <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <h3 className="text-2xl font-serif font-bold mb-4">Héritage Positif</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Chaque projet est conçu pour enrichir son environnement et sa communauté, laissant une empreinte positive pour les générations futures.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <blockquote className="text-3xl font-serif italic text-center max-w-4xl mx-auto">
            &ldquo;{t('home.vision.text')}&rdquo;
          </blockquote>
        </div>
      </section>
      </div>
    </>
  );
}
