import { useLanguage } from '@/contexts/LanguageContext';

export default function Privacy() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pt-20">
      <section className="py-16 sm:py-20 3xl:py-28 4xl:py-36">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12 4xl:px-16 max-w-4xl 3xl:max-w-5xl">
          <h1 className="text-4xl sm:text-5xl 3xl:text-6xl 4xl:text-7xl font-serif font-bold mb-6 sm:mb-8 3xl:mb-10 animate-fade-in">
            {t('footer.privacy')}
          </h1>
          
          <div className="prose prose-lg 3xl:prose-xl max-w-none space-y-6 sm:space-y-8 3xl:space-y-10">
            <section className="space-y-3 sm:space-y-4 3xl:space-y-5">
              <h2 className="text-2xl sm:text-3xl 3xl:text-4xl 4xl:text-5xl font-serif font-semibold mb-3 sm:mb-4 3xl:mb-6">1. Collecte des données</h2>
              <p className="text-base sm:text-lg 3xl:text-xl 4xl:text-2xl leading-relaxed">
                Nous collectons uniquement les données personnelles que vous nous fournissez volontairement via nos formulaires de contact.
              </p>
            </section>

            <section className="space-y-3 sm:space-y-4 3xl:space-y-5">
              <h2 className="text-2xl sm:text-3xl 3xl:text-4xl 4xl:text-5xl font-serif font-semibold mb-3 sm:mb-4 3xl:mb-6">2. Utilisation des données</h2>
              <p className="text-base sm:text-lg 3xl:text-xl 4xl:text-2xl leading-relaxed">
                Vos données personnelles sont utilisées uniquement pour répondre à vos demandes et vous fournir des informations sur nos services.
              </p>
            </section>

            <section className="space-y-3 sm:space-y-4 3xl:space-y-5">
              <h2 className="text-2xl sm:text-3xl 3xl:text-4xl 4xl:text-5xl font-serif font-semibold mb-3 sm:mb-4 3xl:mb-6">3. Protection des données</h2>
              <p className="text-base sm:text-lg 3xl:text-xl 4xl:text-2xl leading-relaxed">
                Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données personnelles contre tout accès non autorisé.
              </p>
            </section>

            <section className="space-y-3 sm:space-y-4 3xl:space-y-5">
              <h2 className="text-2xl sm:text-3xl 3xl:text-4xl 4xl:text-5xl font-serif font-semibold mb-3 sm:mb-4 3xl:mb-6">4. Vos droits</h2>
              <p className="text-base sm:text-lg 3xl:text-xl 4xl:text-2xl leading-relaxed">
                Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Pour exercer ces droits, contactez-nous à info@genuinoinvestments.ch.
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
