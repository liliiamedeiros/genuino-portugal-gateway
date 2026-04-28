import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const BASE = "https://genuinoinvestments.ch";

const LABELS: Record<string, Record<string, string>> = {
  pt: { about: "Sobre", services: "Serviços", portfolio: "Portfólio", properties: "Imóveis", project: "Imóvel", vision: "Visão", investors: "Investidores", contact: "Contacto", legal: "Legal", privacy: "Privacidade", disputes: "Disputas", install: "Instalar" },
  en: { about: "About", services: "Services", portfolio: "Portfolio", properties: "Properties", project: "Property", vision: "Vision", investors: "Investors", contact: "Contact", legal: "Legal", privacy: "Privacy", disputes: "Disputes", install: "Install" },
  fr: { about: "À propos", services: "Services", portfolio: "Portfolio", properties: "Immobilier", project: "Bien", vision: "Vision", investors: "Investisseurs", contact: "Contact", legal: "Mentions légales", privacy: "Confidentialité", disputes: "Litiges", install: "Installer" },
  de: { about: "Über uns", services: "Dienste", portfolio: "Portfolio", properties: "Immobilien", project: "Immobilie", vision: "Vision", investors: "Investoren", contact: "Kontakt", legal: "Rechtliches", privacy: "Datenschutz", disputes: "Streitigkeiten", install: "Installieren" },
};

interface Props {
  /** Optional last crumb override (e.g. property title) */
  current?: string;
}

export const BreadcrumbJsonLd = ({ current }: Props) => {
  const { language } = useLanguage();
  const { pathname } = useLocation();
  const labels = LABELS[language] || LABELS.pt;
  const home = { pt: "Início", en: "Home", fr: "Accueil", de: "Startseite" }[language] || "Home";

  const segments = pathname.split("/").filter(Boolean);
  const items: Array<{ name: string; url: string }> = [{ name: home, url: BASE + "/" }];
  let acc = "";
  segments.forEach((seg, i) => {
    acc += "/" + seg;
    const isLast = i === segments.length - 1;
    const isId = /^[0-9a-f-]{8,}$/i.test(seg);
    let name = labels[seg] || seg;
    if (isId && current) name = current;
    else if (isId) return;
    items.push({ name, url: BASE + acc });
  });

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: it.name,
      item: it.url,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};
