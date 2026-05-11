import { useLanguage } from '@/contexts/LanguageContext';
import santaMarinha from '@/assets/santa-marinha.jpg';
import { RouteSeo } from '@/components/RouteSeo';

export default function Vision() {
  const { t } = useLanguage();

  return (
    <>
      <RouteSeo route="/vision" />
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
                <h3 className="text-xl sm:text-2xl 3xl:text-3xl 4xl:text-4xl font-serif font-bold mb-3 sm:mb-4 3xl:mb-6">{t('vision.timeless.title')}</h3>
                <p className="text-sm sm:text-base 3xl:text-lg 4xl:text-xl text-muted-foreground leading-relaxed">
                  {t('vision.timeless.text')}
                </p>
              </div>

              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <h3 className="text-xl sm:text-2xl 3xl:text-3xl 4xl:text-4xl font-serif font-bold mb-3 sm:mb-4 3xl:mb-6">{t('vision.sustainability.title')}</h3>
                <p className="text-sm sm:text-base 3xl:text-lg 4xl:text-xl text-muted-foreground leading-relaxed">
                  {t('vision.sustainability.text')}
                </p>
              </div>

              <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <h3 className="text-xl sm:text-2xl 3xl:text-3xl 4xl:text-4xl font-serif font-bold mb-3 sm:mb-4 3xl:mb-6">{t('vision.innovation.title')}</h3>
                <p className="text-sm sm:text-base 3xl:text-lg 4xl:text-xl text-muted-foreground leading-relaxed">
                  {t('vision.innovation.text')}
                </p>
              </div>

              <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <h3 className="text-xl sm:text-2xl 3xl:text-3xl 4xl:text-4xl font-serif font-bold mb-3 sm:mb-4 3xl:mb-6">{t('vision.legacy.title')}</h3>
                <p className="text-sm sm:text-base 3xl:text-lg 4xl:text-xl text-muted-foreground leading-relaxed">
                  {t('vision.legacy.text')}
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
