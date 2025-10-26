import { useLanguage } from '@/contexts/LanguageContext';

export default function Disputes() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pt-20">
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-5xl font-serif font-bold mb-8 animate-fade-in">
            {t('footer.disputes')}
          </h1>
          
          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-3xl font-serif font-semibold mb-4">1. Résolution amiable</h2>
              <p>
                En cas de litige, nous privilégions une résolution amiable. N'hésitez pas à nous contacter directement pour discuter de toute préoccupation.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-serif font-semibold mb-4">2. Médiation</h2>
              <p>
                Si une solution amiable ne peut être trouvée, vous pouvez faire appel à un médiateur pour résoudre le différend.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-serif font-semibold mb-4">3. Juridiction compétente</h2>
              <p>
                En cas d'échec de la médiation, les tribunaux suisses seront compétents pour régler tout litige découlant de l'utilisation de ce site ou de nos services.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-serif font-semibold mb-4">4. Contact</h2>
              <p>
                Pour toute question concernant la résolution des litiges :<br />
                <strong>Email :</strong> info@genuinoinvestments.ch<br />
                <strong>Téléphone :</strong> +41 78 487 60 00
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
