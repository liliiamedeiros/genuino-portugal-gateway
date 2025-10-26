import { useLanguage } from '@/contexts/LanguageContext';

export default function Legal() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pt-20">
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-5xl font-serif font-bold mb-8 animate-fade-in">
            {t('footer.legal')}
          </h1>
          
          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-3xl font-serif font-semibold mb-4">1. Informations légales</h2>
              <p>
                <strong>Raison sociale :</strong> Genuíno Investments<br />
                <strong>Adresse :</strong> Geneva, Switzerland<br />
                <strong>Email :</strong> info@genuinoinvestments.ch<br />
                <strong>Téléphone :</strong> +41 78 487 60 00
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-serif font-semibold mb-4">2. Propriété intellectuelle</h2>
              <p>
                L'ensemble des contenus présents sur ce site (textes, images, logos) sont la propriété de Genuíno Investments et sont protégés par les lois en vigueur sur la propriété intellectuelle.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-serif font-semibold mb-4">3. Responsabilité</h2>
              <p>
                Les informations contenues sur ce site sont fournies à titre indicatif et peuvent être modifiées sans préavis. Genuíno Investments ne saurait être tenu responsable des erreurs ou omissions.
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
