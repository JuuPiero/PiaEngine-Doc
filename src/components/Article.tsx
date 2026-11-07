import { useLayoutEffect, type MouseEvent } from 'react';
import { neighbours, sectionOf, type PageData } from '../content';
import { EDIT_BASE_URL, t } from '../config';
import { href } from '../router';

interface Props {
  page: PageData;
  anchor: string;
}

function scrollToAnchor(anchor: string) {
  const el = anchor ? document.getElementById(anchor) : null;
  if (el) el.scrollIntoView({ block: 'start' });
  else window.scrollTo(0, 0);
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // http:// or file:// without clipboard permission
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

export function Article({ page, anchor }: Props) {
  const { prev, next } = neighbours(page.slug);
  const section = sectionOf(page.slug);

  useLayoutEffect(() => {
    scrollToAnchor(anchor);
  }, [page.slug, anchor]);

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const btn = target.closest<HTMLButtonElement>('.copy-btn');
    if (btn) {
      const code = btn.closest('.code-block')?.querySelector('code')?.textContent ?? '';
      void copyText(code).then((ok) => {
        if (!ok) return;
        btn.textContent = t.copied;
        btn.classList.add('copied');
        window.setTimeout(() => {
          btn.textContent = t.copy;
          btn.classList.remove('copied');
        }, 1500);
      });
      return;
    }
    // clicking a link to the anchor we are already on: hashchange won't fire, scroll manually
    const link = target.closest<HTMLAnchorElement>('a[href^="#/"]');
    if (link && link.getAttribute('href') === window.location.hash) {
      e.preventDefault();
      scrollToAnchor(decodeURIComponent(link.hash.split('#')[2] ?? ''));
    }
  };

  return (
    <article className="article">
      {section && <p className="breadcrumb">{section}</p>}
      <div className="markdown" onClick={onClick} dangerouslySetInnerHTML={{ __html: page.html }} />
      {EDIT_BASE_URL && (
        <p className="edit-link">
          <a href={EDIT_BASE_URL + page.file} target="_blank" rel="noopener noreferrer">
            {t.editPage}
          </a>
        </p>
      )}
      <nav className="pager" aria-label="Pager">
        {prev ? (
          <a className="pager-link prev" href={href(prev.slug)}>
            <span className="pager-label">← {t.previous}</span>
            <span className="pager-title">{prev.label}</span>
          </a>
        ) : (
          <span />
        )}
        {next ? (
          <a className="pager-link next" href={href(next.slug)}>
            <span className="pager-label">{t.next} →</span>
            <span className="pager-title">{next.label}</span>
          </a>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
