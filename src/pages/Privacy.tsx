import { useLanguage } from '@/contexts/LanguageContext';

export default function Privacy() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pt-20">
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-5xl font-serif font-bold mb-8 animate-fade-in">
            {t('footer.privacy')}
          </h1>
          
          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-3xl font-serif font-semibold mb-4">1. Collecte des données</h2>
              <p>
                Nous collectons uniquement les données personnelles que vous nous fournissez volontairement via nos formulaires de contact.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-serif font-semibold mb-4">2. Utilisation des données</h2>
              <p>
                Vos données personnelles sont utilisées uniquement pour répondre à vos demandes et vous fournir des informations sur nos services.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-serif font-semibold mb-4">3. Protection des données</h2>
              <p>
                Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données personnelles contre tout accès non autorisé.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-serif font-semibold mb-4">4. Vos droits</h2>
              <p>
                Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Pour exercer ces droits, contactez-nous à info@genuinoinvestments.ch.
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
