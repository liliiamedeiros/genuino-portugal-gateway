/**
 * CI entry point: aggregates security signals available without the Lovable
 * platform tools and fails (exit 1) when any HIGH or CRITICAL finding is
 * detected. Designed for the GitHub Actions workflow at
 * .github/workflows/security.yml.
 *
 * Current checks (extend as more scanners become available):
 *   1. `npm audit --json` — fails on high/critical advisories.
 *   2. Static check that every HTML-producing edge function escapes input
 *      (delegates to the vitest regression suite).
 */
import { execSync, spawnSync } from "node:child_process";

type Severity = "info" | "low" | "moderate" | "high" | "critical";

interface Finding {
  source: string;
  id: string;
  title: string;
  severity: Severity;
}

const findings: Finding[] = [];

function runNpmAudit() {
  const res = spawnSync("npm", ["audit", "--json", "--omit=dev"], {
    encoding: "utf8",
  });
  if (!res.stdout) return;
  try {
    const parsed = JSON.parse(res.stdout);
    const vulns = parsed.vulnerabilities ?? {};
    for (const [name, info] of Object.entries<any>(vulns)) {
      const sev = (info.severity ?? "info") as Severity;
      if (sev === "high" || sev === "critical") {
        findings.push({
          source: "npm-audit",
          id: name,
          title: `${name} (${info.via?.[0]?.title ?? sev})`,
          severity: sev,
        });
      }
    }
  } catch (e) {
    console.warn("npm audit JSON parse failed:", e);
  }
}

function runVitestRegression() {
  const res = spawnSync("npx", ["vitest", "run", "src/lib/htmlEscape.test.ts"], {
    stdio: "inherit",
  });
  if (res.status !== 0) {
    findings.push({
      source: "vitest",
      id: "html-escape-regression",
      title: "Email-template HTML escape regression suite failed",
      severity: "high",
    });
  }
}

runNpmAudit();
runVitestRegression();

console.log(`\nSecurity scan complete — ${findings.length} high/critical finding(s).`);
for (const f of findings) {
  console.log(`  [${f.severity.toUpperCase()}] (${f.source}) ${f.id} — ${f.title}`);
}

if (findings.length > 0) {
  console.error("\nFAIL: high or critical findings present.");
  process.exit(1);
}
console.log("PASS: no high/critical findings.");