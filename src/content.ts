/**
 * Content loading. Every `content/<locale>/**\/*.md` file is a page; `content/<locale>/sidebar.json`
 * decides the order of the sidebar and of the previous/next links.
 * The markdown is compiled at build time by plugins/markdown.ts.
 */
import { LOCALE } from './config';

export interface TocItem { id: string; text: string; level: number }
export interface PageMeta {
  slug: string;
  /** source file relative to content/, e.g. 'vi/scripting/lifecycle.md' */
  file: string;
  title: string;
  description: string;
  /** frontmatter `status: wip` marks a page as work in progress */
  status: string;
}
export interface PageData extends PageMeta { html: string; toc: TocItem[] }
export interface SearchSection { id: string; heading: string; text: string }
export interface SearchDoc { slug: string; title: string; sections: SearchSection[] }

export type SidebarItemConfig = string | { slug: string; label?: string };
export interface SidebarSectionConfig { title: string; items: SidebarItemConfig[] }
export interface SidebarConfig { sections: SidebarSectionConfig[] }

export interface NavItem { slug: string; label: string; status: string }
export interface NavSection { title: string; items: NavItem[] }

const pageLoaders = import.meta.glob<PageData>('../content/*/**/*.md', { import: 'default' });
const metaModules = import.meta.glob<PageMeta>('../content/*/**/*.md', { query: '?meta', import: 'default', eager: true });
const searchLoaders = import.meta.glob<SearchDoc>('../content/*/**/*.md', { query: '?search', import: 'default' });
const sidebars = import.meta.glob<SidebarConfig>('../content/*/sidebar.json', { import: 'default', eager: true });

/** '../content/vi/scripting/index.md' -> 'scripting' (same rule as the build plugin) */
function keyToSlug(key: string): { locale: string; slug: string } {
  const rel = key.replace(/^\.\.\/content\//, '').replace(/\.md$/, '');
  const [locale, ...rest] = rel.split('/');
  let slug = rest.join('/');
  if (slug === 'index') slug = '';
  else if (slug.endsWith('/index')) slug = slug.slice(0, -'/index'.length);
  return { locale, slug };
}

function byLocale<T>(modules: Record<string, T>): Map<string, T> {
  const out = new Map<string, T>();
  for (const [key, value] of Object.entries(modules)) {
    const { locale, slug } = keyToSlug(key);
    if (locale === LOCALE) out.set(slug, value);
  }
  return out;
}

const loaders = byLocale(pageLoaders);
const metas = byLocale(metaModules);
const searchByslug = byLocale(searchLoaders);

export function hasPage(slug: string): boolean {
  return loaders.has(slug);
}

export function getMeta(slug: string): PageMeta | undefined {
  return metas.get(slug);
}

export async function loadPage(slug: string): Promise<PageData | null> {
  const load = loaders.get(slug);
  return load ? load() : null;
}

let searchDocs: Promise<SearchDoc[]> | null = null;
/** Loads the search data of every page (once, on first use). */
export function loadSearchDocs(): Promise<SearchDoc[]> {
  searchDocs ??= Promise.all([...searchByslug.values()].map((load) => load()));
  return searchDocs;
}

function buildNav(): NavSection[] {
  const config = Object.entries(sidebars).find(([key]) => key.includes(`/content/${LOCALE}/`))?.[1];
  const sections: NavSection[] = (config?.sections ?? []).map((section) => ({
    title: section.title,
    items: section.items
      .map((item) => (typeof item === 'string' ? { slug: item } : item))
      .map((item) => {
        const meta = metas.get(item.slug);
        if (!meta && import.meta.env.DEV) console.warn(`[docs] sidebar.json: no page for "${item.slug}"`);
        return { slug: item.slug, label: (item as { label?: string }).label ?? meta?.title ?? item.slug, status: meta?.status ?? '' };
      }),
  }));
  if (import.meta.env.DEV) {
    const listed = new Set(sections.flatMap((s) => s.items.map((i) => i.slug)));
    for (const slug of metas.keys()) if (!listed.has(slug)) console.warn(`[docs] page "${slug}" is not in sidebar.json`);
  }
  return sections;
}

export const nav: NavSection[] = buildNav();
export const navFlat: NavItem[] = nav.flatMap((s) => s.items);

export function neighbours(slug: string): { prev?: NavItem; next?: NavItem } {
  const i = navFlat.findIndex((item) => item.slug === slug);
  if (i < 0) return {};
  return { prev: navFlat[i - 1], next: navFlat[i + 1] };
}

export function sectionOf(slug: string): string | undefined {
  return nav.find((s) => s.items.some((i) => i.slug === slug))?.title;
}

// dev server: editing a .md file or sidebar.json reloads the page (the #/route and anchor are kept)
if (import.meta.hot) import.meta.hot.accept(() => window.location.reload());
