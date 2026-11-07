import { useEffect, useRef, useState } from 'react';
import type { TocItem } from '../content';
import { t } from '../config';
import { href } from '../router';

interface Props {
  slug: string;
  toc: TocItem[];
  /** heading the route points to (#/page#anchor) */
  anchor: string;
}

/** Per-page table of contents with scroll-spy. */
export function Toc({ slug, toc, anchor }: Props) {
  const [active, setActive] = useState('');
  // scrollY right after navigating to `anchor`: until the user scrolls away, the anchor stays
  // highlighted even when the page is too short to bring that heading to the top
  const navScrollY = useRef<number | null>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      if (anchor && navScrollY.current !== null && Math.abs(window.scrollY - navScrollY.current) < 2) {
        const el = document.getElementById(anchor);
        const top = el?.getBoundingClientRect().top ?? -1;
        if (el && top >= 0 && top < window.innerHeight) {
          setActive(anchor);
          return;
        }
      }
      let current = '';
      for (const item of toc) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top < 110) current = item.id;
        else if (el) break;
      }
      // at the very bottom, highlight the last heading
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4 && toc.length) {
        current = toc[toc.length - 1].id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    navScrollY.current = null;
    // the article scrolls to the anchor in a layout effect; read the position on the next frame
    const start = requestAnimationFrame(() => {
      navScrollY.current = window.scrollY;
      update();
    });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(start);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [toc, anchor]);

  if (toc.length === 0) return <aside className="toc" />;
  return (
    <aside className="toc" aria-label={t.onThisPage}>
      <div className="toc-inner">
        <p className="toc-title">{t.onThisPage}</p>
        <ul>
          {toc.map((item) => (
            <li key={item.id} className={`lvl-${item.level}${item.id === active ? ' active' : ''}`}>
              <a
                href={href(slug, item.id)}
                onClick={(e) => {
                  // same hash again: no hashchange event, scroll ourselves
                  if (e.currentTarget.getAttribute('href') === window.location.hash) {
                    e.preventDefault();
                    document.getElementById(item.id)?.scrollIntoView({ block: 'start' });
                  }
                }}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
