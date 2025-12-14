import { useLanguage } from '@/contexts/LanguageContext';

export default function Legal() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pt-20">
      <section className="py-16 sm:py-20 3xl:py-28 4xl:py-36">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12 4xl:px-16 max-w-4xl 3xl:max-w-5xl">
          <h1 className="text-4xl sm:text-5xl 3xl:text-6xl 4xl:text-7xl font-serif font-bold mb-6 sm:mb-8 3xl:mb-10 animate-fade-in">
            {t('footer.legal')}
          </h1>
          
          <div className="prose prose-lg 3xl:prose-xl max-w-none space-y-6 sm:space-y-8 3xl:space-y-10">
            <section className="space-y-3 sm:space-y-4 3xl:space-y-5">
              <h2 className="text-2xl sm:text-3xl 3xl:text-4xl 4xl:text-5xl font-serif font-semibold mb-3 sm:mb-4 3xl:mb-6">1. Informations légales</h2>
              <p className="text-base sm:text-lg 3xl:text-xl 4xl:text-2xl leading-relaxed">
                <strong>Raison sociale :</strong> Genuíno Investments<br />
                <strong>Adresse :</strong> Geneva, Switzerland<br />
                <strong>Email :</strong> info@genuinoinvestments.ch<br />
                <strong>Téléphone :</strong> +41 78 487 60 00
              </p>
            </section>

            <section className="space-y-3 sm:space-y-4 3xl:space-y-5">
              <h2 className="text-2xl sm:text-3xl 3xl:text-4xl 4xl:text-5xl font-serif font-semibold mb-3 sm:mb-4 3xl:mb-6">2. Propriété intellectuelle</h2>
              <p className="text-base sm:text-lg 3xl:text-xl 4xl:text-2xl leading-relaxed">
                L'ensemble des contenus présents sur ce site (textes, images, logos) sont la propriété de Genuíno Investments et sont protégés par les lois en vigueur sur la propriété intellectuelle.
              </p>
            </section>

            <section className="space-y-3 sm:space-y-4 3xl:space-y-5">
              <h2 className="text-2xl sm:text-3xl 3xl:text-4xl 4xl:text-5xl font-serif font-semibold mb-3 sm:mb-4 3xl:mb-6">3. Responsabilité</h2>
              <p className="text-base sm:text-lg 3xl:text-xl 4xl:text-2xl leading-relaxed">
                Les informations contenues sur ce site sont fournies à titre indicatif et peuvent être modifiées sans préavis. Genuíno Investments ne saurait être tenu responsable des erreurs ou omissions.
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
