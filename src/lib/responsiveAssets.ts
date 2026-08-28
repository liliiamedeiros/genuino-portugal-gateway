/**
 * Build-time responsive variants for local images in `src/assets`.
 *
 * vite-imagetools generates 480w / 768w / 1024w / 1440w WebP copies of every bundled
 * image. At runtime we map the resolved (hashed) URL of the original asset to
 * its variants so `<img>` can ship a proper `srcset` and browsers download a
 * size that matches the layout box instead of the full-resolution file.
 */

type UrlMap = Record<string, string>;

const originals = import.meta.glob('/src/assets/*.{webp,png,jpg,jpeg}', {
  eager: true,
  import: 'default',
  query: { url: '' },
}) as UrlMap;

const variantWidths = [480, 640, 768, 1024, 1440] as const;

const variantMaps: Record<number, UrlMap> = {
  480: import.meta.glob('/src/assets/*.{webp,png,jpg,jpeg}', {
    eager: true,
    import: 'default',
    query: { w: 480, format: 'webp', quality: 46 },
  }) as UrlMap,
  640: import.meta.glob('/src/assets/*.{webp,png,jpg,jpeg}', {
    eager: true,
    import: 'default',
    query: { w: 640, format: 'webp', quality: 46 },
  }) as UrlMap,
  768: import.meta.glob('/src/assets/*.{webp,png,jpg,jpeg}', {
    eager: true,
    import: 'default',
    query: { w: 768, format: 'webp', quality: 46 },
  }) as UrlMap,
  1024: import.meta.glob('/src/assets/*.{webp,png,jpg,jpeg}', {
    eager: true,
    import: 'default',
    query: { w: 1024, format: 'webp', quality: 46 },
  }) as UrlMap,
  1440: import.meta.glob('/src/assets/*.{webp,png,jpg,jpeg}', {
    eager: true,
    import: 'default',
    query: { w: 1440, format: 'webp', quality: 46 },
  }) as UrlMap,
};

// Reverse index: resolved original URL -> source path
const byUrl: Record<string, string> = {};
for (const [srcPath, url] of Object.entries(originals)) {
  if (typeof url === 'string') byUrl[url] = srcPath;
}

const cache = new Map<string, string | undefined>();

/**
 * Returns a `srcset` string for a bundled asset URL, or undefined when the URL
 * is remote (e.g. Supabase storage) or has no generated variants.
 */
export function getResponsiveSrcSet(src: string): string | undefined {
  if (!src || /^(https?:|data:|blob:)/.test(src)) return undefined;
  if (cache.has(src)) return cache.get(src);

  const srcPath = byUrl[src];
  let result: string | undefined;

  if (srcPath) {
    const entries: string[] = [];
    for (const w of variantWidths) {
      const url = variantMaps[w]?.[srcPath];
      if (typeof url === 'string') entries.push(`${url} ${w}w`);
    }
    if (entries.length) result = entries.join(', ');
  }

  cache.set(src, result);
  return result;
}
