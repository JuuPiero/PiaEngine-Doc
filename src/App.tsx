import { useEffect, useState } from 'react';
import { getMeta, hasPage, loadPage, type PageData } from './content';
import { SITE_SUBTITLE, SITE_TITLE, t } from './config';
import { href, useRoute } from './router';
import { useTheme } from './theme';
import { Article } from './components/Article';
import { Sidebar } from './components/Sidebar';
import { Toc } from './components/Toc';
import { SearchDialog } from './components/SearchDialog';
import { Logo, MenuIcon, MoonIcon, SearchIcon, SunIcon } from './components/Icons';

type Loaded = { slug: string; data: PageData | null };

export default function App() {
  const route = useRoute();
  const [theme, toggleTheme] = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  // load the page module for the current route (keep showing the old page meanwhile)
  useEffect(() => {
    let alive = true;
    void loadPage(route.slug).then((data) => {
      if (alive) setLoaded({ slug: route.slug, data });
    });
    return () => {
      alive = false;
    };
  }, [route.slug]);

  useEffect(() => {
    const meta = getMeta(route.slug);
    document.title = meta && route.slug ? `${meta.title} · ${SITE_TITLE} ${SITE_SUBTITLE}` : `${SITE_TITLE} ${SITE_SUBTITLE}`;
  }, [route.slug]);

  // Ctrl/Cmd+K or "/" opens search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
      if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === '/' && !typing) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const page = loaded?.data ?? null;
  const notFound = loaded !== null && loaded.slug === route.slug && !page && !hasPage(route.slug);

  return (
    <div className="app">
      <header className="header">
        <button type="button" className="icon-btn menu-btn" onClick={() => setMenuOpen((o) => !o)} aria-label={t.menu}>
          <MenuIcon />
        </button>
        <a className="brand" href={href('')}>
          <Logo />
          <span className="brand-name">{SITE_TITLE}</span>
          <span className="brand-sub">{SITE_SUBTITLE}</span>
        </a>
        <div className="header-spacer" />
        <button type="button" className="search-btn" onClick={() => setSearchOpen(true)} aria-label={t.search}>
          <SearchIcon width={16} height={16} />
          <span className="search-btn-label">{t.search}</span>
          <kbd>Ctrl K</kbd>
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? t.themeLight : t.themeDark}
          title={theme === 'dark' ? t.themeLight : t.themeDark}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>

      <div className="layout">
        <Sidebar current={route.slug} open={menuOpen} onClose={() => setMenuOpen(false)} />
        <main className="main">
          {notFound ? (
            <article className="article not-found">
              <h1>{t.notFoundTitle}</h1>
              <p>{t.notFoundText}</p>
              <p>
                <a href={href('')}>{t.backHome}</a>
              </p>
            </article>
          ) : page ? (
            <Article page={page} anchor={loaded?.slug === route.slug ? route.anchor : ''} />
          ) : (
            <p className="loading">{t.loading}</p>
          )}
        </main>
        <Toc slug={page?.slug ?? ''} toc={page?.toc ?? []} anchor={loaded?.slug === route.slug ? route.anchor : ''} />
      </div>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
