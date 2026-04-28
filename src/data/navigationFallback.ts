/**
 * Static fallback navigation data.
 * Used when the Supabase query for navigation_menus fails (e.g. 401, RLS error,
 * network outage). Keeps the public site usable even if the backend is down.
 *
 * Mirror of the rows currently in the public.navigation_menus table.
 * Update this file whenever the canonical menu structure changes.
 */
export interface FallbackMenuLabel {
  pt: string;
  en: string;
  fr: string;
  de: string;
}

export interface FallbackMenuItem {
  path: string;
  label: FallbackMenuLabel;
  order: number;
}

export const FALLBACK_MAIN_MENU: FallbackMenuItem[] = [
  { path: '/about',      order: 1, label: { pt: 'Sobre Nós',     en: 'About',      fr: 'À Propos',       de: 'Über Uns' } },
  { path: '/services',   order: 2, label: { pt: 'Serviços',      en: 'Services',   fr: 'Services',       de: 'Dienstleistungen' } },
  { path: '/portfolio',  order: 3, label: { pt: 'Portfolio',     en: 'Portfolio',  fr: 'Portfolio',      de: 'Portfolio' } },
  { path: '/properties', order: 4, label: { pt: 'Imóveis',       en: 'Properties', fr: 'Propriétés',     de: 'Immobilien' } },
  { path: '/vision',     order: 5, label: { pt: 'Visão',         en: 'Vision',     fr: 'Vision',         de: 'Vision' } },
  { path: '/investors',  order: 6, label: { pt: 'Investidores',  en: 'Investors',  fr: 'Investisseurs',  de: 'Investoren' } },
  { path: '/contact',    order: 7, label: { pt: 'Contacto',      en: 'Contact',    fr: 'Contact',        de: 'Kontakt' } },
];

/** Resolve an item to a single language with PT fallback. */
export function resolveLabel(item: FallbackMenuItem, language: string): string {
  return (item.label as Record<string, string>)[language] || item.label.pt;
}