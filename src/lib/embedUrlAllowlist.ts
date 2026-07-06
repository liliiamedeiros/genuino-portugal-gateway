// Allowlist of domains that may be embedded in <iframe> on public pages.
// Any URL whose hostname does not match one of these suffixes is rejected
// both by admin form validation and at render time on the public site.

const VIDEO_HOSTS = [
  "youtube.com",
  "youtu.be",
  "youtube-nocookie.com",
  "vimeo.com",
  "player.vimeo.com",
];

const TOUR_HOSTS = [
  "matterport.com",
  "my.matterport.com",
  "kuula.co",
  "momento360.com",
  "roundme.com",
  "youtube.com",
  "youtube-nocookie.com",
];

const MAP_HOSTS = [
  "google.com",
  "www.google.com",
  "maps.google.com",
  "google.pt",
  "www.google.pt",
  "openstreetmap.org",
  "www.openstreetmap.org",
];

function hostMatches(host: string, allowed: string[]): boolean {
  const h = host.toLowerCase();
  return allowed.some((d) => h === d || h.endsWith(`.${d}`));
}

function parseHttps(url: string): URL | null {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return null;
    return u;
  } catch {
    return null;
  }
}

export type EmbedKind = "video" | "tour" | "map";

export function isAllowedEmbedUrl(url: string | null | undefined, kind: EmbedKind): boolean {
  if (!url) return false;
  const u = parseHttps(url);
  if (!u) return false;
  const hosts = kind === "video" ? VIDEO_HOSTS : kind === "tour" ? TOUR_HOSTS : MAP_HOSTS;
  return hostMatches(u.hostname, hosts);
}

/** Returns the URL if allowed, else null. Safe to pass directly into iframe src. */
export function safeEmbedUrl(url: string | null | undefined, kind: EmbedKind): string | null {
  return isAllowedEmbedUrl(url, kind) ? (url as string) : null;
}

export const ALLOWED_HOSTS_HINT: Record<EmbedKind, string> = {
  video: "YouTube, Vimeo",
  tour: "Matterport, Kuula, Momento360, Roundme, YouTube",
  map: "Google Maps, OpenStreetMap",
};
