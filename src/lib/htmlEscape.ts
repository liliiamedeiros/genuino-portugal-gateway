/**
 * Mirrors the `esc()` / `escapeHtml()` helpers used inside Supabase Edge Functions
 * (send-appointment-reminders, send-newsletter, seo-daily-check) so that the
 * escaping logic can be unit-tested as a regression guard against HTML injection
 * via DB-sourced values interpolated into outgoing email templates.
 *
 * The edge functions cannot be imported from a Node/Vite test environment
 * (they import Deno-only / npm: specifiers), so we keep the behaviour identical
 * here and pin it with assertions.
 */
export function escapeHtml(s: unknown): string {
  return String(s ?? "").replace(/[<>&"']/g, (c) =>
    ({
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]!)
  );
}

export const INJECTION_VECTORS: ReadonlyArray<string> = [
  "<script>alert(1)</script>",
  "\" onerror=alert(1) x=\"",
  "' onmouseover='alert(1)",
  "<img src=x onerror=alert(1)>",
  "</style><script>alert(1)</script>",
  "<iframe src=javascript:alert(1)></iframe>",
  "javascript:alert(1)",
  "<svg/onload=alert(1)>",
];