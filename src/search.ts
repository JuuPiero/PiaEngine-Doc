import type { SearchDoc } from './content';

/** Lowercase + strip Vietnamese diacritics, keeping a map back to the original string. */
export function fold(text: string): { s: string; map: number[] } {
  let s = '';
  const map: number[] = [];
  let i = 0;
  for (const ch of text) {
    const f = ch
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[đĐ]/g, 'd')
      .toLowerCase();
    for (let k = 0; k < f.length; k++) {
      s += f[k];
      map.push(i);
    }
    i += ch.length;
  }
  map.push(i);
  return { s, map };
}

const foldStr = (text: string) => fold(text).s;

export interface SearchResult {
  slug: string;
  anchor: string;
  pageTitle: string;
  heading: string;
  /** title / heading split into [text, isMatch] parts */
  pageTitleParts: [string, boolean][];
  headingParts: [string, boolean][];
  /** snippet split into [text, isMatch] parts */
  snippet: [string, boolean][];
  score: number;
}

interface IndexedSection {
  slug: string;
  anchor: string;
  pageTitle: string;
  heading: string;
  text: string;
  fTitle: string;
  fHeading: string;
  fText: string;
}

export function buildIndex(docs: SearchDoc[]): IndexedSection[] {
  const out: IndexedSection[] = [];
  for (const doc of docs) {
    for (const s of doc.sections) {
      out.push({
        slug: doc.slug,
        anchor: s.id,
        pageTitle: doc.title,
        heading: s.heading,
        text: s.text,
        fTitle: foldStr(doc.title),
        fHeading: foldStr(s.heading),
        fText: foldStr(s.text),
      });
    }
    if (doc.sections.length === 0) {
      out.push({ slug: doc.slug, anchor: '', pageTitle: doc.title, heading: '', text: '', fTitle: foldStr(doc.title), fHeading: '', fText: '' });
    }
  }
  return out;
}

function makeSnippet(text: string, terms: string[]): [string, boolean][] {
  if (!text) return [];
  const { s, map } = fold(text);
  // first occurrence of any term
  let first = -1;
  for (const term of terms) {
    const i = s.indexOf(term);
    if (i >= 0 && (first < 0 || i < first)) first = i;
  }
  const radius = 70;
  const startF = Math.max(0, first < 0 ? 0 : first - radius / 2);
  const endF = Math.min(s.length, startF + radius * 2);
  // collect match ranges inside window (folded coordinates)
  const ranges: [number, number][] = [];
  for (const term of terms) {
    let i = s.indexOf(term, startF);
    while (i >= 0 && i < endF) {
      ranges.push([i, Math.min(i + term.length, endF)]);
      i = s.indexOf(term, i + term.length);
    }
  }
  ranges.sort((a, b) => a[0] - b[0]);
  const parts: [string, boolean][] = [];
  let pos = startF;
  const orig = (a: number, b: number) => text.slice(map[a], map[b]);
  if (startF > 0) parts.push(['…', false]);
  for (const [a, b] of ranges) {
    if (a < pos) continue;
    if (a > pos) parts.push([orig(pos, a), false]);
    parts.push([orig(a, b), true]);
    pos = b;
  }
  if (pos < endF) parts.push([orig(pos, endF), false]);
  if (endF < s.length) parts.push(['…', false]);
  return parts;
}

/** Whole string split into [text, isMatch] parts. */
function markAll(text: string, terms: string[]): [string, boolean][] {
  if (!text) return [];
  const { s, map } = fold(text);
  const ranges: [number, number][] = [];
  for (const term of terms) {
    for (let i = s.indexOf(term); i >= 0; i = s.indexOf(term, i + term.length)) ranges.push([i, i + term.length]);
  }
  ranges.sort((a, b) => a[0] - b[0]);
  const parts: [string, boolean][] = [];
  let pos = 0;
  for (const [a, b] of ranges) {
    if (a < pos) continue;
    if (a > pos) parts.push([text.slice(map[pos], map[a]), false]);
    parts.push([text.slice(map[a], map[b]), true]);
    pos = b;
  }
  if (pos < s.length) parts.push([text.slice(map[pos]), false]);
  return parts;
}

export function search(index: IndexedSection[], query: string, limit = 30): SearchResult[] {
  const terms = foldStr(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  const results: SearchResult[] = [];
  for (const item of index) {
    let score = 0;
    let ok = true;
    for (const term of terms) {
      const inTitle = item.fTitle.includes(term);
      const inHeading = item.fHeading.includes(term);
      const inText = item.fText.includes(term);
      if (!inTitle && !inHeading && !inText) {
        ok = false;
        break;
      }
      if (inTitle) score += item.anchor ? 4 : 12;
      if (inHeading) score += 8;
      if (inText) score += 1 + Math.min(3, item.fText.split(term).length - 1) * 0.3;
      if (item.fHeading === term || item.fTitle === term) score += 6;
    }
    if (!ok) continue;
    const textHasTerm = terms.some((t) => item.fText.includes(t));
    results.push({
      slug: item.slug,
      anchor: item.anchor,
      pageTitle: item.pageTitle,
      heading: item.heading,
      pageTitleParts: markAll(item.pageTitle, terms),
      headingParts: markAll(item.heading, terms),
      snippet: textHasTerm ? makeSnippet(item.text, terms) : makeSnippet(item.text.slice(0, 160), []),
      score,
    });
  }
  results.sort((a, b) => b.score - a.score);
  // keep at most 4 sections per page so one long page does not fill the list
  const perPage = new Map<string, number>();
  const out: SearchResult[] = [];
  for (const r of results) {
    const n = perPage.get(r.slug) ?? 0;
    if (n >= 4) continue;
    perPage.set(r.slug, n + 1);
    out.push(r);
    if (out.length >= limit) break;
  }
  return out;
}
