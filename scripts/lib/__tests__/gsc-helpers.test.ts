import { describe, it, expect } from "vitest";
import {
  backoffMs,
  isRetryableStatus,
  parseGscCsv,
  issueMarkerFor,
  buildIssueBody,
  buildIssueTitle,
  diffStringSets,
  extractSitemapLocs,
  extractHreflangMappings,
} from "../gsc-helpers";

describe("backoffMs", () => {
  it("honors numeric Retry-After header (seconds → ms), clamped to max", () => {
    expect(backoffMs(0, "2", { baseMs: 1000, maxMs: 30_000 })).toBe(2000);
    expect(backoffMs(0, "9999", { baseMs: 1000, maxMs: 30_000 })).toBe(30_000);
  });

  it("ignores empty/invalid Retry-After and falls back to exponential", () => {
    // With random() = 0, jitter factor is exactly 0.5.
    const wait = backoffMs(2, null, { baseMs: 1000, maxMs: 30_000, random: () => 0 });
    // 1000 * 2^2 = 4000; * 0.5 => 2000
    expect(wait).toBe(2000);
    expect(backoffMs(0, "", { baseMs: 1000, maxMs: 30_000, random: () => 0 })).toBe(500);
    expect(backoffMs(0, "not-a-number", { baseMs: 1000, maxMs: 30_000, random: () => 0 })).toBe(500);
  });

  it("caps exponential growth at maxMs regardless of attempt", () => {
    const wait = backoffMs(20, null, { baseMs: 1000, maxMs: 30_000, random: () => 0.999999 });
    expect(wait).toBeLessThanOrEqual(30_000);
    expect(wait).toBeGreaterThanOrEqual(15_000);
  });

  it("treats negative attempts as attempt=0 (no crash / no negative wait)", () => {
    const wait = backoffMs(-5, null, { baseMs: 1000, maxMs: 30_000, random: () => 0 });
    expect(wait).toBe(500);
  });
});

describe("isRetryableStatus", () => {
  it("retries 429 and any 5xx, not 2xx/3xx/4xx", () => {
    expect(isRetryableStatus(429)).toBe(true);
    expect(isRetryableStatus(500)).toBe(true);
    expect(isRetryableStatus(503)).toBe(true);
    expect(isRetryableStatus(599)).toBe(true);
    expect(isRetryableStatus(200)).toBe(false);
    expect(isRetryableStatus(301)).toBe(false);
    expect(isRetryableStatus(400)).toBe(false);
    expect(isRetryableStatus(404)).toBe(false);
    expect(isRetryableStatus(600)).toBe(false);
  });
});

describe("parseGscCsv", () => {
  it("parses quoted fields and honors is_na=true/false", () => {
    const raw = [
      "url,coverage_state,is_na",
      'https://example.com/,"Submitted and indexed",false',
      'https://example.com/x?a=1,"URL is unknown to Google",true',
      '"https://example.com/with,comma","Excluded",true',
    ].join("\n");
    const rows = parseGscCsv(raw);
    expect(rows).toEqual([
      { url: "https://example.com/", coverage: "Submitted and indexed", isNa: false },
      { url: "https://example.com/x?a=1", coverage: "URL is unknown to Google", isNa: true },
      { url: "https://example.com/with,comma", coverage: "Excluded", isNa: true },
    ]);
  });

  it("returns [] for empty or headerless input, and skips URL-less rows", () => {
    expect(parseGscCsv("")).toEqual([]);
    expect(parseGscCsv("url,coverage_state,is_na")).toEqual([]);
    const rows = parseGscCsv(["url,coverage_state,is_na", ",foo,true"].join("\n"));
    expect(rows).toEqual([]);
  });
});

describe("issue upsert helpers", () => {
  it("marker is stable per URL and embedded in the body", () => {
    const url = "https://example.com/page";
    const marker = issueMarkerFor(url);
    expect(marker).toBe("<!-- gsc-na-url: https://example.com/page -->");
    const body = buildIssueBody({
      url,
      firstSeenNa: "2026-07-01",
      lastSeenNa: "2026-07-15",
      daysStuck: 14,
      staleDays: 14,
    });
    expect(body.startsWith(marker)).toBe(true);
    expect(body).toContain("First seen N/A: `2026-07-01`");
    expect(body).toContain("Last confirmed N/A: `2026-07-15`");
  });

  it("title includes threshold and URL", () => {
    expect(buildIssueTitle("https://example.com/", 14)).toBe(
      "[SEO] GSC N/A > 14d: https://example.com/",
    );
  });
});

describe("diffStringSets", () => {
  it("reports added/removed and counts unchanged", () => {
    const res = diffStringSets(["a", "b", "c"], ["b", "c", "d"]);
    expect(res.added).toEqual(["d"]);
    expect(res.removed).toEqual(["a"]);
    expect(res.unchanged).toBe(2);
  });

  it("returns empty diffs for identical inputs", () => {
    const res = diffStringSets(["a", "b"], ["b", "a"]);
    expect(res.added).toEqual([]);
    expect(res.removed).toEqual([]);
    expect(res.unchanged).toBe(2);
  });
});

describe("sitemap + hreflang extraction", () => {
  const xml = `<?xml version="1.0"?>
<urlset xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://example.com/</loc>
    <xhtml:link rel="alternate" hreflang="pt" href="https://example.com/?lang=pt"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://example.com/?lang=en"/>
  </url>
  <url>
    <loc>https://example.com/about</loc>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/about"/>
  </url>
</urlset>`;

  it("extracts every <loc>", () => {
    expect(extractSitemapLocs(xml)).toEqual([
      "https://example.com/",
      "https://example.com/about",
    ]);
  });

  it("extracts every hreflang mapping as tab-separated tuples", () => {
    expect(extractHreflangMappings(xml)).toEqual([
      "https://example.com/\tpt\thttps://example.com/?lang=pt",
      "https://example.com/\ten\thttps://example.com/?lang=en",
      "https://example.com/about\tx-default\thttps://example.com/about",
    ]);
  });
});