/**
 * Emits a concise Markdown diff summary of sitemap URLs and hreflang mappings
 * that changed between two git refs. Written to reports/seo-diff.md and
 * consumed by .github/workflows/pr-seo-validate.yml when commenting on PRs.
 *
 * Env:
 *   PR_BASE_SHA — base commit SHA (defaults to origin/main)
 *   PR_HEAD_SHA — head commit SHA (defaults to HEAD)
 *
 * Never throws — always writes a report file so the workflow can post it
 * unconditionally. Falls back to "no changes" when refs are unavailable.
 */
import { execSync } from 'child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import {
  diffStringSets,
  extractSitemapLocs,
  extractHreflangMappings,
} from './lib/gsc-helpers';

const BASE = process.env.PR_BASE_SHA || 'origin/main';
const HEAD = process.env.PR_HEAD_SHA || 'HEAD';
const SITEMAPS = ['public/sitemap-pt.xml', 'public/sitemap-en.xml', 'public/sitemap-fr.xml', 'public/sitemap-de.xml'];
const OUT = resolve('reports/seo-diff.md');

function readAt(ref: string, path: string): string {
  try {
    return execSync(`git show ${ref}:${path}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
  } catch {
    return '';
  }
}
function readHead(path: string): string {
  if (HEAD === 'HEAD' && existsSync(path)) return readFileSync(path, 'utf8');
  return readAt(HEAD, path);
}

function block(title: string, added: string[], removed: string[]): string {
  if (added.length === 0 && removed.length === 0) return `**${title}:** no changes`;
  const cap = (arr: string[]) => (arr.length > 25 ? [...arr.slice(0, 25), `… (+${arr.length - 25} more)`] : arr);
  const lines = [`**${title}:** +${added.length} / -${removed.length}`];
  if (added.length) lines.push('', '_Added_', '```', ...cap(added), '```');
  if (removed.length) lines.push('', '_Removed_', '```', ...cap(removed), '```');
  return lines.join('\n');
}

function main() {
  mkdirSync(resolve('reports'), { recursive: true });
  const sections: string[] = ['## Sitemap & hreflang diff', ''];
  let anyChange = false;

  for (const file of SITEMAPS) {
    const before = readAt(BASE, file);
    const after = readHead(file);
    if (!before && !after) continue;

    const locDiff = diffStringSets(extractSitemapLocs(before), extractSitemapLocs(after));
    const hlDiff = diffStringSets(extractHreflangMappings(before), extractHreflangMappings(after));
    if (locDiff.added.length + locDiff.removed.length + hlDiff.added.length + hlDiff.removed.length === 0) continue;
    anyChange = true;

    sections.push(`### \`${file}\``, '');
    sections.push(block('URLs (<loc>)', locDiff.added, locDiff.removed));
    sections.push('');
    sections.push(block('hreflang mappings', hlDiff.added.map((s) => s.replace(/\t/g, ' | ')), hlDiff.removed.map((s) => s.replace(/\t/g, ' | '))));
    sections.push('');
  }

  if (!anyChange) sections.push('_No sitemap URL or hreflang mapping changes detected._');
  writeFileSync(OUT, sections.join('\n'), 'utf8');
  console.log(`Wrote ${OUT}`);
}

try { main(); } catch (e) {
  mkdirSync(resolve('reports'), { recursive: true });
  writeFileSync(OUT, `## Sitemap & hreflang diff\n\n_Diff computation failed: ${String(e)}_\n`, 'utf8');
}