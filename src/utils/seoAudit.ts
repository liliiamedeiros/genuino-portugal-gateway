/**
 * Console-visible SEO audit. Runs in dev (and when ?seoAudit=1).
 * Checks titles, meta tags, canonical, hreflang, and broken internal links.
 * Auto-fixes what can be safely auto-fixed (missing canonical, missing description).
 */
const BRAND = "GenuinoInvestments Switzerland";
const ORIGIN = typeof window !== "undefined" ? window.location.origin : "";

interface AuditResult {
  errors: string[];
  warnings: string[];
  fixed: string[];
}

function getOrCreateMeta(selector: string, attrs: Record<string, string>): HTMLMetaElement {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
    document.head.appendChild(el);
  }
  return el;
}

export function runSeoAudit(): AuditResult {
  const result: AuditResult = { errors: [], warnings: [], fixed: [] };
  if (typeof document === "undefined") return result;

  // Title
  const title = document.title?.trim();
  if (!title) result.errors.push("Missing <title>");
  else if (title.length < 10) result.warnings.push(`Title too short (${title.length} chars)`);
  else if (title.length > 70) result.warnings.push(`Title too long (${title.length} chars)`);

  // Description
  const desc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (!desc || !desc.content?.trim()) {
    const el = getOrCreateMeta('meta[name="description"]', { name: "description" });
    el.content = `${BRAND} - Real estate investments in Portugal & Switzerland.`;
    result.fixed.push("Auto-added missing meta description");
  } else if (desc.content.length > 165) {
    result.warnings.push(`Description too long (${desc.content.length} chars)`);
  }

  // Canonical
  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    canonical.href = ORIGIN + window.location.pathname;
    document.head.appendChild(canonical);
    result.fixed.push("Auto-added canonical tag");
  } else {
    try {
      const u = new URL(canonical.href);
      if (u.search) result.warnings.push(`Canonical contains query string: ${canonical.href}`);
    } catch {
      result.errors.push(`Invalid canonical URL: ${canonical.href}`);
    }
  }

  // Hreflang
  const hreflangs = document.querySelectorAll('link[rel="alternate"][hreflang]');
  if (hreflangs.length < 4) {
    result.warnings.push(`Only ${hreflangs.length} hreflang links (expected ≥4: pt, en, fr, de)`);
  }

  // Open Graph essentials
  ["og:title", "og:description", "og:url", "og:image"].forEach((p) => {
    if (!document.querySelector(`meta[property="${p}"]`)) {
      result.warnings.push(`Missing OG tag: ${p}`);
    }
  });

  // H1
  const h1s = document.querySelectorAll("h1");
  if (h1s.length === 0) result.warnings.push("No <h1> on page");
  else if (h1s.length > 1) result.warnings.push(`Multiple <h1> tags (${h1s.length})`);

  // Images without alt
  const imgsNoAlt = Array.from(document.querySelectorAll("img")).filter(
    (img) => !img.alt?.trim()
  );
  if (imgsNoAlt.length > 0) {
    result.warnings.push(`${imgsNoAlt.length} <img> tag(s) missing alt`);
  }

  // Internal broken-link sample (only same-origin <a> tags). Verifies they don't point to clearly invalid hrefs.
  const internalLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]")).filter(
    (a) => {
      const href = a.getAttribute("href") || "";
      return href.startsWith("/") || href.startsWith(ORIGIN);
    }
  );
  internalLinks.forEach((a) => {
    const href = a.getAttribute("href")!;
    if (href === "#" || href === "javascript:void(0)") {
      result.warnings.push(`Anchor with placeholder href: "${href}" -> ${a.textContent?.slice(0, 40)}`);
    }
    if (href.includes("undefined") || href.includes("null")) {
      result.errors.push(`Broken internal link contains undefined/null: ${href}`);
    }
  });

  // Print report (collapsed group)
  const tag = "%c[SEO Audit]";
  const style = "background:#877350;color:#fff;padding:2px 6px;border-radius:3px;font-weight:bold";
  console.groupCollapsed(tag + " " + window.location.pathname, style);
  if (result.errors.length === 0 && result.warnings.length === 0 && result.fixed.length === 0) {
    console.log("%c✓ All checks passed", "color:#0a0;font-weight:bold");
  }
  result.errors.forEach((e) => console.error("✗ " + e));
  result.warnings.forEach((w) => console.warn("⚠ " + w));
  result.fixed.forEach((f) => console.log("%c✓ " + f, "color:#0a0"));
  console.groupEnd();

  return result;
}

/** Run audit on each route change (debounced). */
export function installSeoAuditWatcher() {
  if (typeof window === "undefined") return;
  const isEnabled =
    import.meta.env.DEV || new URLSearchParams(window.location.search).has("seoAudit");
  if (!isEnabled) return;

  let t: ReturnType<typeof setTimeout> | null = null;
  const trigger = () => {
    if (t) clearTimeout(t);
    t = setTimeout(() => runSeoAudit(), 800); // wait for Helmet to flush
  };

  trigger();
  const _push = history.pushState;
  const _replace = history.replaceState;
  history.pushState = function (...args) {
    _push.apply(this, args as never);
    trigger();
  };
  history.replaceState = function (...args) {
    _replace.apply(this, args as never);
    trigger();
  };
  window.addEventListener("popstate", trigger);
}
