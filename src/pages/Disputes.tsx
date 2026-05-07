import { useLanguage } from '@/contexts/LanguageContext';
import { RouteSeo } from '@/components/RouteSeo';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';

const CONTENT: Record<string, { h1: string; intro: string; sections: { h2: string; body: string }[] }> = {
  pt: {
    h1: 'Resolução de Disputas',
    intro: 'A Genuíno Investments privilegia a resolução amigável de qualquer divergência relacionada com transações imobiliárias, contratos ou prestação de serviços em Portugal e na Suíça.',
    sections: [
      { h2: '1. Resolução amigável', body: 'Em caso de litígio, comprometemo-nos a procurar uma solução amigável no prazo de 30 dias após receção da reclamação por escrito (info@genuinoinvestments.ch).' },
      { h2: '2. Mediação', body: 'Se a resolução amigável não for possível, as partes podem recorrer a um mediador profissional credenciado, partilhando os respetivos custos. Em Portugal recomendamos o Sistema de Mediação Imobiliária; na Suíça, a Chambre Genevoise Immobilière.' },
      { h2: '3. Plataforma ODR', body: 'Para consumidores residentes na UE, está disponível a plataforma europeia de Resolução de Litígios em Linha em https://ec.europa.eu/consumers/odr.' },
      { h2: '4. Arbitragem', body: 'As partes podem optar pela arbitragem segundo o Regulamento da Câmara de Comércio Internacional (CCI), com sede em Genebra e processo conduzido em francês ou inglês.' },
      { h2: '5. Foro competente', body: 'Em caso de litígio judicial não resolvido pelos meios anteriores, são competentes os tribunais de Genebra (Suíça), salvo disposição imperativa em contrário do direito do consumidor do país de residência.' },
      { h2: '6. Lei aplicável', body: 'Aplica-se o direito suíço aos contratos celebrados a partir da Suíça, e o direito português aos contratos celebrados em Portugal e relativos a imóveis localizados em território português.' },
      { h2: '7. Contacto reclamações', body: 'Departamento Jurídico — info@genuinoinvestments.ch — Telefone Suíça: +41 76 487 60 00 — Telefone Portugal: +351 21 758 06 73.' },
      { h2: '8. Prazos de resposta', body: 'Acusamos a receção da reclamação em 5 dias úteis e prestamos resposta fundamentada em 30 dias. Em casos de elevada complexidade, este prazo pode ser prorrogado por 30 dias adicionais com aviso prévio.' },
      { h2: '9. Documentação a apresentar', body: 'Para análise rápida, junte: identificação completa, contrato/proposta de referência, descrição cronológica dos factos, documentos comprovativos e pretensão concreta.' },
      { h2: '10. Provedor do cliente / Ombudsman', body: 'Para clientes residentes na Suíça, está disponível o Ombudsman des banques suisses para temas financeiros conexos. Em Portugal, pode recorrer ao Centro de Arbitragem de Conflitos de Consumo de Lisboa (CACCL).' },
      { h2: '11. Custos', body: 'A reclamação interna é gratuita. Os custos de mediação, arbitragem e tribunal seguem as tabelas oficiais das respetivas instituições.' },
      { h2: '12. Última revisão', body: 'Última atualização: 7 de maio de 2026.' },
    ],
  },
  en: {
    h1: 'Dispute Resolution',
    intro: 'Genuíno Investments favours the amicable resolution of any disagreement related to real estate transactions, contracts or services provided in Portugal and Switzerland.',
    sections: [
      { h2: '1. Amicable resolution', body: 'In case of dispute, we commit to seeking an amicable solution within 30 days of receiving the written complaint (info@genuinoinvestments.ch).' },
      { h2: '2. Mediation', body: 'If amicable resolution is not possible, parties may resort to an accredited professional mediator and share the costs. In Portugal we recommend the Real Estate Mediation System; in Switzerland, the Chambre Genevoise Immobilière.' },
      { h2: '3. ODR Platform', body: 'EU-resident consumers can use the European Online Dispute Resolution platform at https://ec.europa.eu/consumers/odr.' },
      { h2: '4. Arbitration', body: 'Parties may opt for arbitration under the ICC Rules, with seat in Geneva and proceedings in French or English.' },
      { h2: '5. Jurisdiction', body: 'For judicial disputes not resolved by the above means, the courts of Geneva (Switzerland) have jurisdiction, except for mandatory consumer protection rules in the country of residence.' },
      { h2: '6. Governing law', body: 'Swiss law applies to contracts concluded from Switzerland; Portuguese law applies to contracts concluded in Portugal and to properties located on Portuguese territory.' },
      { h2: '7. Complaints contact', body: 'Legal Department — info@genuinoinvestments.ch — Phone Switzerland: +41 76 487 60 00 — Phone Portugal: +351 21 758 06 73.' },
      { h2: '8. Response deadlines', body: 'We acknowledge the complaint within 5 business days and provide a reasoned reply within 30 days. For highly complex cases this period can be extended by 30 additional days with prior notice.' },
      { h2: '9. Documentation', body: 'For fast review, please attach: full identification, reference contract/proposal, chronological description of facts, supporting documents and a clear request.' },
      { h2: '10. Ombudsman', body: 'Clients resident in Switzerland may use the Ombudsman des banques suisses for connected financial matters. In Portugal, you can resort to the Lisbon Consumer Arbitration Centre (CACCL).' },
      { h2: '11. Costs', body: 'Internal complaints are free. Mediation, arbitration and court costs follow the official fee schedules of each institution.' },
      { h2: '12. Last revision', body: 'Last updated: 7 May 2026.' },
    ],
  },
  fr: {
    h1: 'Résolution des Litiges',
    intro: 'Genuíno Investments privilégie la résolution amiable de tout désaccord lié à des transactions immobilières, contrats ou prestations de services au Portugal et en Suisse.',
    sections: [
      { h2: '1. Résolution amiable', body: 'En cas de litige, nous nous engageons à rechercher une solution amiable dans un délai de 30 jours suivant la réception de la réclamation écrite (info@genuinoinvestments.ch).' },
      { h2: '2. Médiation', body: 'Si la résolution amiable n\'est pas possible, les parties peuvent recourir à un médiateur professionnel agréé et partager les frais. Au Portugal, nous recommandons le Système de Médiation Immobilière ; en Suisse, la Chambre Genevoise Immobilière.' },
      { h2: '3. Plateforme RLL', body: 'Les consommateurs résidant dans l\'UE disposent de la plateforme européenne de Règlement en Ligne des Litiges sur https://ec.europa.eu/consumers/odr.' },
      { h2: '4. Arbitrage', body: 'Les parties peuvent opter pour un arbitrage selon le Règlement de la Chambre de Commerce Internationale (CCI), siège à Genève, en français ou en anglais.' },
      { h2: '5. Juridiction', body: 'Pour les litiges judiciaires non résolus par les moyens ci-dessus, les tribunaux de Genève (Suisse) sont compétents, sous réserve des règles impératives de protection des consommateurs du pays de résidence.' },
      { h2: '6. Droit applicable', body: 'Le droit suisse s\'applique aux contrats conclus depuis la Suisse ; le droit portugais s\'applique aux contrats conclus au Portugal et aux biens situés sur le territoire portugais.' },
      { h2: '7. Contact réclamations', body: 'Département Juridique — info@genuinoinvestments.ch — Téléphone Suisse : +41 76 487 60 00 — Téléphone Portugal : +351 21 758 06 73.' },
      { h2: '8. Délais de réponse', body: 'Nous accusons réception de la réclamation sous 5 jours ouvrés et fournissons une réponse motivée sous 30 jours. Pour les cas très complexes, ce délai peut être prolongé de 30 jours supplémentaires avec préavis.' },
      { h2: '9. Documents à fournir', body: 'Pour un traitement rapide, joignez : identification complète, contrat/proposition de référence, description chronologique des faits, justificatifs et demande précise.' },
      { h2: '10. Médiateur / Ombudsman', body: 'Les clients résidant en Suisse peuvent recourir à l\'Ombudsman des banques suisses pour les questions financières connexes. Au Portugal, vous pouvez saisir le Centre d\'Arbitrage des Conflits de Consommation de Lisbonne (CACCL).' },
      { h2: '11. Coûts', body: 'La réclamation interne est gratuite. Les frais de médiation, d\'arbitrage et de tribunal suivent les barèmes officiels de chaque institution.' },
      { h2: '12. Dernière révision', body: 'Dernière mise à jour : 7 mai 2026.' },
    ],
  },
  de: {
    h1: 'Streitbeilegung',
    intro: 'Genuíno Investments bevorzugt die einvernehmliche Beilegung jeglicher Meinungsverschiedenheiten im Zusammenhang mit Immobilientransaktionen, Verträgen oder Dienstleistungen in Portugal und der Schweiz.',
    sections: [
      { h2: '1. Einvernehmliche Lösung', body: 'Im Streitfall verpflichten wir uns, innerhalb von 30 Tagen nach Eingang der schriftlichen Beschwerde (info@genuinoinvestments.ch) eine einvernehmliche Lösung zu suchen.' },
      { h2: '2. Mediation', body: 'Ist eine einvernehmliche Lösung nicht möglich, können die Parteien einen anerkannten professionellen Mediator hinzuziehen und die Kosten teilen. In Portugal empfehlen wir das System der Immobilienmediation; in der Schweiz die Chambre Genevoise Immobilière.' },
      { h2: '3. OS-Plattform', body: 'Verbraucher mit Wohnsitz in der EU können die europäische Plattform zur Online-Streitbeilegung unter https://ec.europa.eu/consumers/odr nutzen.' },
      { h2: '4. Schiedsverfahren', body: 'Die Parteien können sich für ein Schiedsverfahren nach den Regeln der Internationalen Handelskammer (ICC) mit Sitz in Genf entscheiden, in französischer oder englischer Sprache.' },
      { h2: '5. Gerichtsstand', body: 'Für gerichtliche Streitigkeiten, die nicht durch die oben genannten Mittel beigelegt werden können, sind die Gerichte in Genf (Schweiz) zuständig, vorbehaltlich zwingender Verbraucherschutzbestimmungen im Wohnsitzland.' },
      { h2: '6. Anwendbares Recht', body: 'Schweizer Recht gilt für in der Schweiz geschlossene Verträge; portugiesisches Recht gilt für in Portugal geschlossene Verträge und für auf portugiesischem Hoheitsgebiet gelegene Immobilien.' },
      { h2: '7. Beschwerdekontakt', body: 'Rechtsabteilung — info@genuinoinvestments.ch — Telefon Schweiz: +41 76 487 60 00 — Telefon Portugal: +351 21 758 06 73.' },
      { h2: '8. Antwortfristen', body: 'Wir bestätigen den Eingang der Beschwerde innerhalb von 5 Werktagen und liefern eine begründete Antwort innerhalb von 30 Tagen. Bei besonders komplexen Fällen kann diese Frist mit Vorankündigung um weitere 30 Tage verlängert werden.' },
      { h2: '9. Erforderliche Unterlagen', body: 'Für eine schnelle Bearbeitung legen Sie bitte bei: vollständige Identifikation, Referenzvertrag/-angebot, chronologische Sachverhaltsdarstellung, Belege und konkretes Anliegen.' },
      { h2: '10. Ombudsstelle', body: 'In der Schweiz ansässige Kunden können den Ombudsman der Schweizer Banken für zusammenhängende Finanzfragen anrufen. In Portugal steht das Schiedszentrum für Verbraucherkonflikte Lissabon (CACCL) zur Verfügung.' },
      { h2: '11. Kosten', body: 'Die interne Beschwerde ist kostenlos. Mediations-, Schieds- und Gerichtskosten richten sich nach den offiziellen Gebührenordnungen der jeweiligen Institutionen.' },
      { h2: '12. Letzte Überarbeitung', body: 'Letzte Aktualisierung: 7. Mai 2026.' },
    ],
  },
};

export default function Disputes() {
  const { language } = useLanguage();
  const c = CONTENT[language] || CONTENT.pt;
  return (
    <>
      <RouteSeo route="/disputes" />
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
