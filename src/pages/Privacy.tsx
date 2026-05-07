import { useLanguage } from '@/contexts/LanguageContext';
import { RouteSeo } from '@/components/RouteSeo';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';

const CONTENT: Record<string, { h1: string; intro: string; sections: { h2: string; body: string }[] }> = {
  pt: {
    h1: 'Política de Privacidade',
    intro: 'A Genuíno Investments respeita a sua privacidade e está empenhada em proteger os seus dados pessoais ao abrigo do RGPD (UE 2016/679) e da Lei Suíça de Proteção de Dados (nLPD).',
    sections: [
      { h2: '1. Responsável pelo tratamento', body: 'Genuíno Investments — Quai du Cheval Blanc 2, 1227 Carouge/Genève, Suíça. Contacto: info@genuinoinvestments.ch.' },
      { h2: '2. Dados recolhidos', body: 'Recolhemos apenas os dados que nos fornece voluntariamente nos formulários de contacto, agendamento de visitas, subscrição da newsletter e candidaturas a investimentos: nome, email, telefone, mensagem e preferências de imóveis.' },
      { h2: '3. Finalidades do tratamento', body: 'Os seus dados são usados para: (a) responder a pedidos de informação, (b) agendar visitas a imóveis em Portugal e na Suíça, (c) enviar newsletters comerciais quando consente, (d) cumprir obrigações legais e contabilísticas.' },
      { h2: '4. Base legal', body: 'O tratamento assenta no seu consentimento (Art. 6.º/1/a RGPD), na execução de medidas pré-contratuais (Art. 6.º/1/b) e no nosso interesse legítimo de prestar serviços de promoção imobiliária (Art. 6.º/1/f).' },
      { h2: '5. Conservação', body: 'Conservamos os dados durante o período necessário às finalidades acima ou pelo prazo legal aplicável (geralmente 5 anos para registos comerciais e 10 anos para registos fiscais).' },
      { h2: '6. Partilha com terceiros', body: 'Não vendemos os seus dados. Podemos partilhá-los com prestadores de serviços (alojamento, email, CRM) sob acordos de confidencialidade e com autoridades quando exigido por lei.' },
      { h2: '7. Os seus direitos', body: 'Tem direito de acesso, retificação, eliminação, limitação, portabilidade e oposição. Pode retirar o consentimento a qualquer momento e apresentar reclamação à CNPD (Portugal) ou ao FDPIC (Suíça). Contacte info@genuinoinvestments.ch.' },
      { h2: '8. Cookies', body: 'Usamos cookies essenciais ao funcionamento do site e cookies analíticos (Google Analytics, IPs anonimizados) para medir o tráfego.' },
      { h2: '9. Segurança', body: 'Aplicamos medidas técnicas e organizativas adequadas: encriptação TLS, controlo de acessos, RLS (Row-Level Security) na base de dados e logs de auditoria.' },
      { h2: '10. Transferências internacionais', body: 'Como empresa com sede na Suíça e operações em Portugal, alguns dados podem ser transferidos entre os dois países. Garantimos um nível de proteção equivalente, suportado por Cláusulas Contratuais Tipo (CCT) da UE e pelo reconhecimento mútuo de adequação entre Suíça e UE.' },
      { h2: '11. Decisões automatizadas', body: 'Não tomamos decisões totalmente automatizadas com efeitos jurídicos sobre si. A análise de adequação de imóveis é sempre validada por um consultor humano da Genuíno Investments.' },
      { h2: '12. Menores', body: 'O nosso site não se destina a menores de 16 anos. Não recolhemos conscientemente dados de menores. Caso identifique uma situação dessas, contacte-nos para eliminação imediata.' },
      { h2: '13. Encarregado de Proteção de Dados', body: 'Pode contactar o nosso DPO (Data Protection Officer) através de dpo@genuinoinvestments.ch para qualquer questão relativa ao tratamento dos seus dados pessoais.' },
      { h2: '14. Atualizações desta política', body: 'Esta política pode ser atualizada para refletir alterações legais ou operacionais. A versão em vigor está sempre disponível nesta página com a data da última revisão.' },
      { h2: '15. Última revisão', body: 'Última atualização: 7 de maio de 2026. Para o histórico de versões anteriores, contacte info@genuinoinvestments.ch.' },
    ],
  },
  en: {
    h1: 'Privacy Policy',
    intro: 'Genuíno Investments respects your privacy and is committed to protecting your personal data under the GDPR (EU 2016/679) and the Swiss Data Protection Act (nFADP).',
    sections: [
      { h2: '1. Data controller', body: 'Genuíno Investments — Quai du Cheval Blanc 2, 1227 Carouge/Geneva, Switzerland. Contact: info@genuinoinvestments.ch.' },
      { h2: '2. Data we collect', body: 'We only collect data you voluntarily provide via contact forms, viewing requests, newsletter subscriptions and investment enquiries: name, email, phone, message and property preferences.' },
      { h2: '3. Purposes', body: 'Your data is used to (a) respond to enquiries, (b) schedule property viewings in Portugal and Switzerland, (c) send commercial newsletters when you consent, (d) comply with legal and accounting obligations.' },
      { h2: '4. Legal basis', body: 'Processing is based on your consent (Art. 6(1)(a) GDPR), performance of pre-contractual measures (Art. 6(1)(b)) and our legitimate interest in providing real estate services (Art. 6(1)(f)).' },
      { h2: '5. Retention', body: 'We retain data for as long as required for the purposes above or under applicable law (typically 5 years for commercial records and 10 years for tax records).' },
      { h2: '6. Sharing with third parties', body: 'We never sell your data. We may share it with service providers (hosting, email, CRM) under confidentiality agreements and with authorities when legally required.' },
      { h2: '7. Your rights', body: 'You have the right of access, rectification, erasure, restriction, portability and objection. You may withdraw consent at any time and lodge a complaint with the CNPD (Portugal) or FDPIC (Switzerland). Contact info@genuinoinvestments.ch.' },
      { h2: '8. Cookies', body: 'We use essential cookies for site functionality and analytics cookies (Google Analytics, anonymized IPs) to measure traffic.' },
      { h2: '9. Security', body: 'We implement appropriate technical and organizational measures: TLS encryption, access controls, database Row-Level Security and audit logs.' },
      { h2: '10. International transfers', body: 'As a Swiss-headquartered company operating in Portugal, some data may be transferred between the two countries. We ensure an equivalent level of protection through EU Standard Contractual Clauses (SCCs) and mutual adequacy recognition between Switzerland and the EU.' },
      { h2: '11. Automated decisions', body: 'We do not make fully automated decisions with legal effects concerning you. Property suitability analysis is always validated by a human Genuíno Investments consultant.' },
      { h2: '12. Minors', body: 'Our website is not intended for users under 16. We do not knowingly collect data from minors. If you identify such a case, please contact us for immediate deletion.' },
      { h2: '13. Data Protection Officer', body: 'You can reach our DPO at dpo@genuinoinvestments.ch for any matter related to the processing of your personal data.' },
      { h2: '14. Policy updates', body: 'This policy may be updated to reflect legal or operational changes. The current version is always available on this page with the date of the last revision.' },
      { h2: '15. Last revision', body: 'Last updated: 7 May 2026. For previous versions, please contact info@genuinoinvestments.ch.' },
    ],
  },
  fr: {
    h1: 'Politique de Confidentialité',
    intro: 'Genuíno Investments respecte votre vie privée et s\'engage à protéger vos données personnelles conformément au RGPD (UE 2016/679) et à la Loi suisse sur la protection des données (nLPD).',
    sections: [
      { h2: '1. Responsable du traitement', body: 'Genuíno Investments — Quai du Cheval Blanc 2, 1227 Carouge/Genève, Suisse. Contact : info@genuinoinvestments.ch.' },
      { h2: '2. Données collectées', body: 'Nous ne collectons que les données fournies volontairement via les formulaires de contact, les demandes de visite, l\'abonnement à la newsletter et les demandes d\'investissement : nom, email, téléphone, message et préférences immobilières.' },
      { h2: '3. Finalités', body: 'Vos données servent à (a) répondre aux demandes, (b) organiser des visites de biens au Portugal et en Suisse, (c) envoyer des newsletters commerciales avec votre consentement, (d) respecter les obligations légales et comptables.' },
      { h2: '4. Base légale', body: 'Le traitement repose sur votre consentement (Art. 6(1)(a) RGPD), l\'exécution de mesures précontractuelles (Art. 6(1)(b)) et notre intérêt légitime à fournir des services immobiliers (Art. 6(1)(f)).' },
      { h2: '5. Conservation', body: 'Nous conservons les données pendant la durée nécessaire aux finalités ci-dessus ou selon la loi applicable (généralement 5 ans pour les registres commerciaux et 10 ans pour les registres fiscaux).' },
      { h2: '6. Partage avec des tiers', body: 'Nous ne vendons jamais vos données. Nous pouvons les partager avec des prestataires (hébergement, email, CRM) sous accord de confidentialité et avec les autorités lorsque la loi l\'exige.' },
      { h2: '7. Vos droits', body: 'Vous disposez d\'un droit d\'accès, de rectification, d\'effacement, de limitation, de portabilité et d\'opposition. Vous pouvez retirer votre consentement à tout moment et déposer une plainte auprès de la CNPD (Portugal) ou du PFPDT (Suisse). Contact : info@genuinoinvestments.ch.' },
      { h2: '8. Cookies', body: 'Nous utilisons des cookies essentiels au fonctionnement du site et des cookies analytiques (Google Analytics, IP anonymisées) pour mesurer le trafic.' },
      { h2: '9. Sécurité', body: 'Nous appliquons des mesures techniques et organisationnelles appropriées : chiffrement TLS, contrôles d\'accès, Row-Level Security sur la base de données et journaux d\'audit.' },
      { h2: '10. Transferts internationaux', body: 'En tant que société dont le siège est en Suisse et qui opère au Portugal, certaines données peuvent être transférées entre les deux pays. Nous garantissons un niveau de protection équivalent grâce aux Clauses Contractuelles Types (CCT) de l\'UE et à la reconnaissance mutuelle d\'adéquation entre la Suisse et l\'UE.' },
      { h2: '11. Décisions automatisées', body: 'Nous ne prenons aucune décision entièrement automatisée produisant des effets juridiques à votre égard. L\'analyse d\'adéquation des biens est toujours validée par un consultant humain de Genuíno Investments.' },
      { h2: '12. Mineurs', body: 'Notre site n\'est pas destiné aux personnes de moins de 16 ans. Nous ne collectons pas sciemment de données de mineurs. Si vous identifiez un tel cas, contactez-nous pour suppression immédiate.' },
      { h2: '13. Délégué à la protection des données', body: 'Vous pouvez contacter notre DPO à dpo@genuinoinvestments.ch pour toute question relative au traitement de vos données personnelles.' },
      { h2: '14. Mises à jour', body: 'Cette politique peut être mise à jour pour refléter des changements légaux ou opérationnels. La version en vigueur est toujours disponible sur cette page avec la date de la dernière révision.' },
      { h2: '15. Dernière révision', body: 'Dernière mise à jour : 7 mai 2026. Pour les versions précédentes, contactez info@genuinoinvestments.ch.' },
    ],
  },
  de: {
    h1: 'Datenschutzrichtlinie',
    intro: 'Genuíno Investments respektiert Ihre Privatsphäre und schützt Ihre personenbezogenen Daten gemäß der DSGVO (EU 2016/679) und dem Schweizer Datenschutzgesetz (revDSG).',
    sections: [
      { h2: '1. Verantwortlicher', body: 'Genuíno Investments — Quai du Cheval Blanc 2, 1227 Carouge/Genf, Schweiz. Kontakt: info@genuinoinvestments.ch.' },
      { h2: '2. Erhobene Daten', body: 'Wir erheben nur Daten, die Sie über Kontaktformulare, Besichtigungsanfragen, Newsletter-Anmeldungen und Investmentanfragen freiwillig angeben: Name, E-Mail, Telefon, Nachricht und Immobilienpräferenzen.' },
      { h2: '3. Zwecke', body: 'Ihre Daten werden verwendet, um (a) Anfragen zu beantworten, (b) Besichtigungen in Portugal und der Schweiz zu organisieren, (c) Newsletter mit Ihrer Einwilligung zu versenden, (d) gesetzliche und buchhalterische Pflichten zu erfüllen.' },
      { h2: '4. Rechtsgrundlage', body: 'Die Verarbeitung erfolgt auf Basis Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), zur Erfüllung vorvertraglicher Maßnahmen (Art. 6 Abs. 1 lit. b) und unserem berechtigten Interesse an der Erbringung von Immobiliendienstleistungen (Art. 6 Abs. 1 lit. f).' },
      { h2: '5. Aufbewahrung', body: 'Wir bewahren Daten so lange auf, wie es für die genannten Zwecke oder nach geltendem Recht erforderlich ist (in der Regel 5 Jahre für Geschäfts- und 10 Jahre für Steuerunterlagen).' },
      { h2: '6. Weitergabe an Dritte', body: 'Wir verkaufen Ihre Daten nicht. Wir geben sie unter Geheimhaltungsverpflichtung an Dienstleister (Hosting, E-Mail, CRM) und an Behörden weiter, wenn dies gesetzlich vorgeschrieben ist.' },
      { h2: '7. Ihre Rechte', body: 'Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung, Übertragbarkeit und Widerspruch. Sie können die Einwilligung jederzeit widerrufen und sich bei der CNPD (Portugal) oder dem EDÖB (Schweiz) beschweren. Kontakt: info@genuinoinvestments.ch.' },
      { h2: '8. Cookies', body: 'Wir verwenden essenzielle Cookies und Analytics-Cookies (Google Analytics mit anonymisierten IPs) zur Messung des Datenverkehrs.' },
      { h2: '9. Sicherheit', body: 'Wir setzen geeignete technische und organisatorische Maßnahmen ein: TLS-Verschlüsselung, Zugriffskontrollen, Row-Level-Security in der Datenbank und Audit-Protokolle.' },
      { h2: '10. Internationale Übermittlungen', body: 'Als Unternehmen mit Sitz in der Schweiz und Geschäftstätigkeit in Portugal können einige Daten zwischen den beiden Ländern übermittelt werden. Wir gewährleisten ein gleichwertiges Schutzniveau durch EU-Standardvertragsklauseln (SCC) und die gegenseitige Anerkennung der Angemessenheit zwischen der Schweiz und der EU.' },
      { h2: '11. Automatisierte Entscheidungen', body: 'Wir treffen keine vollautomatisierten Entscheidungen mit Rechtswirkung Ihnen gegenüber. Die Eignungsanalyse von Immobilien wird stets von einem menschlichen Berater von Genuíno Investments validiert.' },
      { h2: '12. Minderjährige', body: 'Unsere Website richtet sich nicht an Personen unter 16 Jahren. Wir erheben wissentlich keine Daten von Minderjährigen. Falls Sie einen solchen Fall feststellen, kontaktieren Sie uns für die sofortige Löschung.' },
      { h2: '13. Datenschutzbeauftragter', body: 'Sie erreichen unseren DPO unter dpo@genuinoinvestments.ch für alle Fragen zur Verarbeitung Ihrer personenbezogenen Daten.' },
      { h2: '14. Aktualisierungen', body: 'Diese Richtlinie kann aktualisiert werden, um rechtliche oder operative Änderungen widerzuspiegeln. Die aktuelle Version ist stets auf dieser Seite mit dem Datum der letzten Überarbeitung verfügbar.' },
      { h2: '15. Letzte Überarbeitung', body: 'Letzte Aktualisierung: 7. Mai 2026. Für frühere Versionen wenden Sie sich an info@genuinoinvestments.ch.' },
    ],
  },
};

export default function Privacy() {
  const { language } = useLanguage();
  const c = CONTENT[language] || CONTENT.pt;
  return (
    <>
      <RouteSeo route="/privacy" />
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
