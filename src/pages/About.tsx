import { useLanguage } from '@/contexts/LanguageContext';
import gardensBuilding2 from '@/assets/gardens-building-2.jpeg';

export default function About() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-serif font-bold text-center mb-6 animate-fade-in">
            {t('about.title')}
          </h1>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <h2 className="text-4xl font-serif font-bold mb-6">{t('about.mission.title')}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                {t('about.mission.text')}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('home.about.text')}
              </p>
            </div>
            <div className="animate-fade-in">
              <img
                src={gardensBuilding2}
                alt="À propos de Genuíno Investments"
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-serif font-bold text-center mb-12">Nos Valeurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 animate-slide-up">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-serif font-semibold mb-4">Excellence</h3>
              <p className="text-muted-foreground">
                Nous recherchons l'excellence dans chaque détail de nos projets.
              </p>
            </div>
            <div className="text-center p-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-serif font-semibold mb-4">Innovation</h3>
              <p className="text-muted-foreground">
                Nous combinons design contemporain et technologies durables.
              </p>
            </div>
            <div className="text-center p-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-serif font-semibold mb-4">Transparence</h3>
              <p className="text-muted-foreground">
                Nous cultivons la confiance avec nos clients et partenaires.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
