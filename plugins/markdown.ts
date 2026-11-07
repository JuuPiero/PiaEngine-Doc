/**
 * Vite plugin: turns `content/<locale>/**\/*.md` into JS modules at build time.
 *
 *   page.md          -> { slug, title, description, status, html, toc }     (the page)
 *   page.md?meta     -> { slug, title, description, status }                (sidebar, prev/next)
 *   page.md?search   -> { slug, title, sections: [{ id, heading, text }] }  (client-side search)
 *
 * Markdown features: GitHub tables, fenced code with highlight.js + copy button,
 * `::: note|tip|warning|danger|wip [title]` callouts, heading anchors, links to other
 * `.md` files rewritten to hash routes (`#/slug#anchor`).
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import MarkdownIt from 'markdown-it';
import type { Token } from 'markdown-it';
import container from 'markdown-it-container';
import hljs from 'highlight.js';
import { shaderlab } from './shaderlab.ts';

hljs.registerLanguage('shaderlab', shaderlab);

export interface MarkdownPluginOptions {
  /** Absolute path of the content root (contains one folder per locale). */
  contentDir: string;
}

interface TocItem { id: string; text: string; level: number }
interface SearchSection { id: string; heading: string; text: string }

const CALLOUT_TITLES: Record<string, Record<string, string>> = {
  vi: { note: 'Ghi chú', tip: 'Mẹo', warning: 'Lưu ý', danger: 'Cảnh báo', wip: 'Đang phát triển' },
  en: { note: 'Note', tip: 'Tip', warning: 'Warning', danger: 'Danger', wip: 'Work in progress' },
};
const CALLOUT_TYPES = ['note', 'tip', 'warning', 'danger', 'wip'] as const;

const LANG_LABELS: Record<string, string> = {
  ts: 'TypeScript', typescript: 'TypeScript', tsx: 'TSX', js: 'JavaScript', javascript: 'JavaScript',
  json: 'JSON', bash: 'Bash', sh: 'Shell', shell: 'Shell', powershell: 'PowerShell', ps1: 'PowerShell',
  glsl: 'GLSL', shaderlab: 'Shader', shader: 'Shader', html: 'HTML', xml: 'XML', css: 'CSS', text: 'Text', txt: 'Text',
};

/** Same rule as the client (src/slug.ts): lowercase ASCII, Vietnamese diacritics removed. */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/[\s-]+/g, '-');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Minimal frontmatter: `key: value` lines between `---` fences. */
function parseFrontmatter(src: string): { data: Record<string, string>; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(src);
  if (!m) return { data: {}, body: src };
  const data: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(line);
    if (kv) data[kv[1]] = kv[2].trim().replace(/^(['"])(.*)\1$/, '$2');
  }
  return { data, body: src.slice(m[0].length) };
}

/** content/vi/scripting/lifecycle.md -> { locale: 'vi', slug: 'scripting/lifecycle' } */
function fileInfo(contentDir: string, file: string) {
  const rel = path.relative(contentDir, file).split(path.sep).join('/');
  const [locale, ...rest] = rel.split('/');
  let slug = rest.join('/').replace(/\.md$/, '');
  if (slug === 'index') slug = '';
  else if (slug.endsWith('/index')) slug = slug.slice(0, -'/index'.length);
  return { locale, slug, rel };
}

function inlineText(tokens: Token[] | null): string {
  if (!tokens) return '';
  return tokens
    .map((t) => (t.type === 'text' || t.type === 'code_inline' ? t.content : t.children ? inlineText(t.children) : ''))
    .join('');
}

function highlight(code: string, lang: string): string {
  const l = lang.toLowerCase();
  if (l && hljs.getLanguage(l)) {
    try {
      return hljs.highlight(code, { language: l, ignoreIllegals: true }).value;
    } catch {
      /* fall through */
    }
  }
  return escapeHtml(code);
}

function createRenderer(locale: string) {
  const md = new MarkdownIt({ html: true, linkify: false, typographer: false });

  // ::: note|tip|warning|danger|wip [optional title]
  for (const type of CALLOUT_TYPES) {
    md.use(container, type, {
      render(tokens: Token[], idx: number) {
        const tok = tokens[idx];
        if (tok.nesting === 1) {
          const custom = tok.info.trim().slice(type.length).trim();
          const title = custom || CALLOUT_TITLES[locale]?.[type] || CALLOUT_TITLES.en[type];
          return `<div class="callout callout-${type}"><p class="callout-title">${md.renderInline(title)}</p>\n`;
        }
        return '</div>\n';
      },
    });
  }

  // fenced code: ```ts Assets/Scripts/Rotator.ts
  md.renderer.rules.fence = (tokens, idx) => {
    const tok = tokens[idx];
    const info = tok.info.trim();
    const [rawLang = '', ...titleParts] = info.split(/\s+/);
    const lang = rawLang.toLowerCase();
    const title = titleParts.join(' ').replace(/^title=/, '').replace(/^(['"])(.*)\1$/, '$2');
    const label = LANG_LABELS[lang] ?? (lang || 'Text');
    const code = tok.content.replace(/\n$/, '');
    return (
      `<div class="code-block">` +
      `<div class="code-head"><span class="code-lang">${escapeHtml(label)}</span>` +
      (title ? `<span class="code-title">${escapeHtml(title)}</span>` : '') +
      `<button type="button" class="copy-btn" aria-label="Copy">Copy</button></div>` +
      `<pre><code class="hljs language-${escapeHtml(lang || 'text')}">${highlight(code, lang)}</code></pre></div>\n`
    );
  };

  md.renderer.rules.table_open = () => '<div class="table-wrap"><table>\n';
  md.renderer.rules.table_close = () => '</table></div>\n';

  const defaultImage = md.renderer.rules.image!;
  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const tok = tokens[idx];
    const src = String(tok.attrGet('src') ?? '');
    // site is served from a sub-path: make root-relative image urls relative to index.html
    if (src.startsWith('/')) tok.attrSet('src', src.slice(1));
    tok.attrSet('loading', 'lazy');
    return defaultImage(tokens, idx, options, env, self);
  };

  return md;
}

type RenderEnv = {
  file: string;
  slug: string;
  contentDir: string;
  locale: string;
}

/** Rewrites links + assigns heading ids; returns toc and search sections. */
function processTokens(tokens: Token[], env: RenderEnv) {
  const toc: TocItem[] = [];
  const sections: SearchSection[] = [{ id: '', heading: '', text: '' }];
  const used = new Map<string, number>();
  const links: { slug: string; anchor: string; href: string }[] = [];
  let h1 = '';

  const resolveLink = (href: string): string => {
    if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//')) return href; // external
    if (href.startsWith('#/')) {
      const [p, frag = ''] = href.slice(2).split('#');
      links.push({ slug: decodeURIComponent(p), anchor: decodeURIComponent(frag), href });
      return href;
    }
    if (href.startsWith('#')) {
      links.push({ slug: env.slug, anchor: decodeURIComponent(href.slice(1)), href });
      return `#/${env.slug}${href}`;
    }
    const [p, frag] = href.split('#');
    if (!p.endsWith('.md')) return href;
    const target = path.resolve(path.dirname(env.file), p);
    const { slug, locale } = fileInfo(env.contentDir, target);
    if (locale !== env.locale) return href;
    if (!fs.existsSync(target)) console.warn(`[pia-docs] broken link in ${env.file}: ${href}`);
    links.push({ slug, anchor: frag ? decodeURIComponent(frag) : '', href });
    return `#/${slug}${frag ? `#${frag}` : ''}`;
  };

  const walkInline = (children: Token[] | null) => {
    if (!children) return;
    for (const c of children) {
      if (c.type === 'link_open') {
        const href = String(c.attrGet('href') ?? '');
        const resolved = resolveLink(href);
        c.attrSet('href', resolved);
        if (/^https?:/.test(resolved)) {
          c.attrSet('target', '_blank');
          c.attrSet('rel', 'noopener noreferrer');
        }
      }
    }
  };

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type === 'heading_open') {
      const inline = tokens[i + 1];
      const text = inlineText(inline.children).trim();
      const level = Number(t.tag.slice(1));
      if (level === 1) {
        if (!h1) h1 = text;
        continue;
      }
      let id = String(t.attrGet('id') ?? slugify(text));
      if (!id) id = 'section';
      const n = used.get(id) ?? 0;
      used.set(id, n + 1);
      if (n > 0) id = `${id}-${n}`;
      t.attrSet('id', id);
      if (level <= 3) toc.push({ id, text, level });
      sections.push({ id, heading: text, text: '' });
      // anchor link appended inside the heading
      const anchor = new (t.constructor as new (type: string, tag: string, nesting: number) => Token)('html_inline', '', 0);
      anchor.content = ` <a class="anchor" href="#/${env.slug}#${id}" aria-label="Link">#</a>`;
      inline.children?.push(anchor);
      continue;
    }
    if (t.type === 'inline') {
      walkInline(t.children);
      const prev = tokens[i - 1];
      if (prev?.type !== 'heading_open') sections[sections.length - 1].text += inlineText(t.children) + ' ';
    } else if (t.type === 'fence' || t.type === 'code_block') {
      sections[sections.length - 1].text += t.content + ' ';
    } else if (t.type === 'html_block') {
      sections[sections.length - 1].text += t.content.replace(/<[^>]+>/g, ' ') + ' ';
    }
  }

  // raw HTML blocks (e.g. the home page cards) may link with href="#/slug#anchor" too
  for (const t of tokens) {
    if (t.type !== 'html_block') continue;
    for (const m of t.content.matchAll(/href="(#\/[^"]*)"/g)) resolveLink(m[1]);
  }

  for (const s of sections) s.text = s.text.replace(/\s+/g, ' ').trim();
  const ids = new Set(sections.map((s) => s.id).filter(Boolean));
  return { toc, sections: sections.filter((s) => s.heading || s.text), h1, links, ids };
}

export function piaMarkdown(options: MarkdownPluginOptions): Plugin {
  const renderers = new Map<string, ReturnType<typeof createRenderer>>();
  const getRenderer = (locale: string) => {
    let r = renderers.get(locale);
    if (!r) renderers.set(locale, (r = createRenderer(locale)));
    return r;
  };

  // per locale+slug: heading ids and outgoing links, to report broken anchors at the end of a build
  const pages = new Map<string, { file: string; locale: string; ids: Set<string>; links: { slug: string; anchor: string; href: string }[] }>();
  let isBuild = false;

  return {
    name: 'pia-docs-markdown',
    enforce: 'pre',
    configResolved(config) {
      isBuild = config.command === 'build';
    },
    buildEnd() {
      if (!isBuild) return;
      let broken = 0;
      for (const page of pages.values()) {
        for (const link of page.links) {
          const target = pages.get(`${page.locale}:${link.slug}`);
          if (!target) {
            this.warn(`broken link in ${page.file}: ${link.href} (no page "${link.slug}")`);
            broken++;
          } else if (link.anchor && !target.ids.has(link.anchor)) {
            this.warn(`broken anchor in ${page.file}: ${link.href} (no heading "#${link.anchor}" in ${target.file})`);
            broken++;
          }
        }
      }
      if (!broken) console.log(`[pia-docs] ${pages.size} pages, all internal links OK`);
    },
    transform(code, id) {
      const [file, query = ''] = id.split('?');
      if (!file.endsWith('.md')) return null;
      const abs = path.resolve(file);
      if (!abs.startsWith(path.resolve(options.contentDir))) return null;

      const { locale, slug, rel } = fileInfo(options.contentDir, abs);
      const { data, body } = parseFrontmatter(code.replace(/^﻿/, ''));
      const md = getRenderer(locale);
      const env: RenderEnv = { file: abs, slug, contentDir: options.contentDir, locale };
      const tokens = md.parse(body, env);
      const { toc, sections, h1, links, ids } = processTokens(tokens, env);
      if (!query) pages.set(`${locale}:${slug}`, { file: rel, locale, ids, links });
      const title = data.title || h1 || slug;
      const meta = { slug, file: rel, title, description: data.description ?? '', status: data.status ?? '' };

      let out: unknown;
      if (query.includes('meta')) out = meta;
      else if (query.includes('search')) out = { slug, title, sections };
      else out = { ...meta, html: md.renderer.render(tokens, md.options, env), toc };
      return { code: `export default ${JSON.stringify(out)};`, map: null };
    },
  };
}
