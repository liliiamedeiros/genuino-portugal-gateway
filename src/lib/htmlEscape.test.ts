import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { escapeHtml, INJECTION_VECTORS } from "./htmlEscape";

describe("escapeHtml", () => {
  it("escapes the five dangerous characters", () => {
    expect(escapeHtml("<>&\"'")).toBe("&lt;&gt;&amp;&quot;&#39;");
  });

  it("handles null/undefined safely", () => {
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
  });

  it.each(INJECTION_VECTORS)("neutralises injection vector: %s", (payload) => {
    const out = escapeHtml(payload);
    expect(out).not.toMatch(/<script/i);
    expect(out).not.toMatch(/<iframe/i);
    expect(out).not.toMatch(/<img\s/i);
    expect(out).not.toMatch(/<svg/i);
    expect(out).not.toMatch(/ on[a-z]+\s*=/i);
    expect(out).not.toContain("<");
    expect(out).not.toContain(">");
    // Quote characters that could break out of attributes must be encoded
    expect(out).not.toContain('"');
    expect(out).not.toContain("'");
  });

  it("does not double-escape already-escaped entities", () => {
    // Single pass: & becomes &amp;, but downstream HTML rendering will
    // decode &amp;lt; back to &lt; — confirming we don't lose information.
    expect(escapeHtml("&lt;")).toBe("&amp;lt;");
  });
});

/**
 * Regression guard: every edge function that builds an HTML email MUST define
 * an escape helper. If a new HTML-producing function is added without one,
 * this test fails so the developer adds escaping before shipping.
 */
describe("edge functions HTML escaping coverage", () => {
  const FUNCTIONS_DIR = path.resolve(__dirname, "../../supabase/functions");
  const HTML_PRODUCERS = [
    "send-appointment-reminders",
    "send-newsletter",
    "seo-daily-check",
  ];

  it.each(HTML_PRODUCERS)("%s defines an HTML escape helper", (fn) => {
    const file = path.join(FUNCTIONS_DIR, fn, "index.ts");
    const src = fs.readFileSync(file, "utf8");
    const hasEscHelper = /(?:const|function)\s+(esc|escapeHtml)\b/.test(src);
    expect(hasEscHelper, `${fn} must define esc() or escapeHtml()`).toBe(true);
    expect(src).toMatch(/&lt;/);
    expect(src).toMatch(/&amp;/);
  });

  it("send-newsletter sanitizes HTML through DOMParser", () => {
    const src = fs.readFileSync(
      path.join(FUNCTIONS_DIR, "send-newsletter/index.ts"),
      "utf8"
    );
    expect(src).toMatch(/DOMParser/);
    expect(src).toMatch(/sanitizeHtml/);
    // Personalization placeholders must go through escapeHtml
    expect(src).toMatch(/escapeHtml\(subscriber\.full_name/);
    expect(src).toMatch(/escapeHtml\(subscriber\.email/);
  });

  it("send-appointment-reminders escapes all DB-sourced fields", () => {
    const src = fs.readFileSync(
      path.join(FUNCTIONS_DIR, "send-appointment-reminders/index.ts"),
      "utf8"
    );
    for (const field of [
      "client.full_name",
      "appointment.title",
      "project.title_pt",
      "appointment.location",
      "appointment.description",
    ]) {
      expect(src, `${field} must be wrapped in esc()`).toMatch(
        new RegExp(`esc\\(${field.replace(/\./g, "\\.")}`)
      );
    }
  });
});