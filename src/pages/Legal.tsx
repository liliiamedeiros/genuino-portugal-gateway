import { useLanguage } from '@/contexts/LanguageContext';
import { RouteSeo } from '@/components/RouteSeo';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';

const CONTENT: Record<string, { h1: string; intro: string; sections: { h2: string; body: string }[] }> = {
  pt: {
    h1: 'Avisos Legais',
    intro: 'Informações legais relativas ao site genuinoinvestments.ch e aos serviços prestados pela Genuíno Investments em Portugal e na Suíça.',
    sections: [
      { h2: '1. Identificação da empresa', body: 'Genuíno Investments — Sede Suíça: Quai du Cheval Blanc 2, 1227 Carouge/Genève. Escritório Portugal: Rua António Stromp 12 A, 1600-411 Lumiar, Lisboa. Email: info@genuinoinvestments.ch. Telefones: +41 76 487 60 00 (CH), +351 21 758 06 73 (PT).' },
      { h2: '2. Propriedade intelectual', body: 'Todos os conteúdos do site (textos, imagens, vídeos, logótipos, design) são propriedade exclusiva da Genuíno Investments ou utilizados com licença. Qualquer reprodução total ou parcial sem autorização escrita prévia é proibida.' },
      { h2: '3. Marcas e logotipos', body: 'A marca "Genuíno Investments" e os respectivos logotipos são protegidos. A sua utilização não autorizada constitui contrafacção sancionável nos termos da lei.' },
      { h2: '4. Hiperligações', body: 'O site pode conter ligações a sites externos. A Genuíno Investments não controla e não pode ser responsabilizada pelo conteúdo desses sites.' },
      { h2: '5. Limitação de responsabilidade', body: 'As informações sobre imóveis (preços, áreas, características) são meramente indicativas e podem ser alteradas sem aviso prévio. Os contratos finais prevalecem sobre as informações publicadas online.' },
      { h2: '6. Estatuto regulamentar', body: 'A Genuíno Investments atua como promotora imobiliária e mediadora autorizada nos mercados português e suíço. As entidades de supervisão competentes são o IMPIC (PT) e a SRO (CH).' },
      { h2: '7. Lei aplicável e jurisdição', body: 'Os presentes termos regem-se pela lei suíça, com foro nos tribunais de Genebra, sem prejuízo das normas de proteção do consumidor aplicáveis ao seu país de residência.' },
    ],
  },
  en: {
    h1: 'Legal Notice',
    intro: 'Legal information regarding the genuinoinvestments.ch website and services provided by Genuíno Investments in Portugal and Switzerland.',
    sections: [
      { h2: '1. Company identification', body: 'Genuíno Investments — Swiss HQ: Quai du Cheval Blanc 2, 1227 Carouge/Geneva. Portugal Office: Rua António Stromp 12 A, 1600-411 Lumiar, Lisbon. Email: info@genuinoinvestments.ch. Phones: +41 76 487 60 00 (CH), +351 21 758 06 73 (PT).' },
      { h2: '2. Intellectual property', body: 'All website content (texts, images, videos, logos, design) is the exclusive property of Genuíno Investments or used under license. Any total or partial reproduction without prior written authorization is prohibited.' },
      { h2: '3. Trademarks and logos', body: 'The "Genuíno Investments" brand and associated logos are protected. Unauthorized use constitutes infringement punishable under law.' },
      { h2: '4. Hyperlinks', body: 'The site may contain links to external websites. Genuíno Investments does not control and cannot be held responsible for the content of those sites.' },
      { h2: '5. Limitation of liability', body: 'Property information (prices, surfaces, features) is indicative and may change without notice. Final contracts prevail over information published online.' },
      { h2: '6. Regulatory status', body: 'Genuíno Investments operates as an authorized real estate developer and broker in the Portuguese and Swiss markets. Supervisory bodies: IMPIC (PT) and SRO (CH).' },
      { h2: '7. Governing law and jurisdiction', body: 'These terms are governed by Swiss law, with venue in the courts of Geneva, without prejudice to consumer protection rules applicable in your country of residence.' },
    ],
  },
  fr: {
    h1: 'Mentions Légales',
    intro: 'Informations légales relatives au site genuinoinvestments.ch et aux services fournis par Genuíno Investments au Portugal et en Suisse.',
    sections: [
      { h2: '1. Identification de la société', body: 'Genuíno Investments — Siège suisse : Quai du Cheval Blanc 2, 1227 Carouge/Genève. Bureau Portugal : Rua António Stromp 12 A, 1600-411 Lumiar, Lisbonne. Email : info@genuinoinvestments.ch. Téléphones : +41 76 487 60 00 (CH), +351 21 758 06 73 (PT).' },
      { h2: '2. Propriété intellectuelle', body: 'Tous les contenus du site (textes, images, vidéos, logos, design) sont la propriété exclusive de Genuíno Investments ou utilisés sous licence. Toute reproduction totale ou partielle sans autorisation écrite préalable est interdite.' },
      { h2: '3. Marques et logos', body: 'La marque « Genuíno Investments » et ses logos associés sont protégés. Toute utilisation non autorisée constitue une contrefaçon sanctionnée par la loi.' },
      { h2: '4. Liens hypertextes', body: 'Le site peut contenir des liens vers des sites externes. Genuíno Investments ne contrôle pas et ne saurait être tenue responsable du contenu de ces sites.' },
      { h2: '5. Limitation de responsabilité', body: 'Les informations sur les biens (prix, surfaces, caractéristiques) sont indicatives et peuvent être modifiées sans préavis. Les contrats définitifs prévalent sur les informations publiées en ligne.' },
      { h2: '6. Statut réglementaire', body: 'Genuíno Investments agit en tant que promoteur immobilier et courtier agréé sur les marchés portugais et suisse. Autorités de supervision : IMPIC (PT) et SRO (CH).' },
      { h2: '7. Droit applicable et juridiction', body: 'Les présentes mentions sont régies par le droit suisse, avec for à Genève, sans préjudice des règles de protection des consommateurs applicables dans votre pays de résidence.' },
    ],
  },
  de: {
    h1: 'Rechtliche Hinweise',
    intro: 'Rechtliche Informationen zur Website genuinoinvestments.ch und zu den von Genuíno Investments in Portugal und der Schweiz erbrachten Leistungen.',
    sections: [
      { h2: '1. Unternehmensangaben', body: 'Genuíno Investments — Schweizer Sitz: Quai du Cheval Blanc 2, 1227 Carouge/Genf. Büro Portugal: Rua António Stromp 12 A, 1600-411 Lumiar, Lissabon. E-Mail: info@genuinoinvestments.ch. Telefon: +41 76 487 60 00 (CH), +351 21 758 06 73 (PT).' },
      { h2: '2. Geistiges Eigentum', body: 'Sämtliche Inhalte der Website (Texte, Bilder, Videos, Logos, Design) sind ausschließliches Eigentum von Genuíno Investments oder werden unter Lizenz verwendet. Jede vollständige oder teilweise Vervielfältigung ohne vorherige schriftliche Genehmigung ist untersagt.' },
      { h2: '3. Marken und Logos', body: 'Die Marke „Genuíno Investments" und die zugehörigen Logos sind geschützt. Eine unbefugte Nutzung stellt eine gesetzlich strafbare Verletzung dar.' },
      { h2: '4. Hyperlinks', body: 'Die Website kann Links zu externen Websites enthalten. Genuíno Investments hat keinen Einfluss auf deren Inhalte und übernimmt dafür keine Haftung.' },
      { h2: '5. Haftungsbeschränkung', body: 'Angaben zu Immobilien (Preise, Flächen, Ausstattung) sind unverbindlich und können sich ohne Vorankündigung ändern. Endgültige Verträge gehen den online veröffentlichten Informationen vor.' },
      { h2: '6. Regulatorischer Status', body: 'Genuíno Investments ist als zugelassener Immobilienentwickler und -makler in Portugal und der Schweiz tätig. Aufsichtsbehörden: IMPIC (PT) und SRO (CH).' },
      { h2: '7. Anwendbares Recht und Gerichtsstand', body: 'Diese Bedingungen unterliegen Schweizer Recht; Gerichtsstand ist Genf, unbeschadet der in Ihrem Wohnsitzland geltenden Verbraucherschutzbestimmungen.' },
    ],
  },
};

export default function Legal() {
  const { language } = useLanguage();
  const c = CONTENT[language] || CONTENT.pt;
  return (
    <>
      <RouteSeo route="/legal" />
      <BreadcrumbJsonLd current={c.h1} />
      <div className="min-h-screen pt-20">
        <section className="py-16 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-6 animate-fade-in">{c.h1}</h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">{c.intro}</p>
            <div className="prose prose-lg max-w-none space-y-8">
              {c.sections.map((s, i) => (
                <section key={i} className="space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-serif font-semibold">{s.h2}</h2>
                  <p className="text-base sm:text-lg leading-relaxed">{s.body}</p>
                </section>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
