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
