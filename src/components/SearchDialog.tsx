import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { loadSearchDocs } from '../content';
import { t } from '../config';
import { href } from '../router';
import { buildIndex, search, type SearchResult } from '../search';
import { FileIcon, HashIcon, SearchIcon } from './Icons';

type Index = ReturnType<typeof buildIndex>;
let indexPromise: Promise<Index> | null = null;
const getIndex = () => (indexPromise ??= loadSearchDocs().then(buildIndex));

interface Props {
  open: boolean;
  onClose: () => void;
}

function Marked({ parts }: { parts: [string, boolean][] }) {
  return <>{parts.map(([text, match], k) => (match ? <mark key={k}>{text}</mark> : <span key={k}>{text}</span>))}</>;
}

export function SearchDialog({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState<Index | null>(null);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    inputRef.current?.select();
    let alive = true;
    void getIndex().then((i) => alive && setIndex(i));
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      alive = false;
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const results: SearchResult[] = index && query.trim() ? search(index, query) : [];

  useEffect(() => {
    listRef.current?.querySelector('.selected')?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  if (!open) return null;

  const go = (r: SearchResult) => {
    const target = href(r.slug, r.anchor);
    if (window.location.hash === target) {
      // already there: hashchange won't fire, just scroll
      if (r.anchor) document.getElementById(r.anchor)?.scrollIntoView({ block: 'start' });
      else window.scrollTo(0, 0);
    } else {
      window.location.assign(target);
    }
    onClose();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter' && results[selected]) {
      e.preventDefault();
      go(results[selected]);
    }
  };

  return (
    <div className="search-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="search-dialog" role="dialog" aria-modal="true" aria-label={t.search} onKeyDown={onKeyDown}>
        <div className="search-input-row">
          <SearchIcon />
          <input
            ref={inputRef}
            type="search"
            value={query}
            placeholder={t.searchPlaceholder}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            aria-label={t.search}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="esc" onClick={onClose}>Esc</kbd>
        </div>
        <div className="search-body">
          {!index && <p className="search-msg">{t.searchLoading}</p>}
          {index && !query.trim() && <p className="search-msg">{t.searchHint}</p>}
          {index && query.trim() && results.length === 0 && (
            <p className="search-msg">
              {t.searchEmpty} “{query}”
            </p>
          )}
          {results.length > 0 && (
            <ul className="search-results" ref={listRef}>
              {results.map((r, i) => (
                <li key={`${r.slug}#${r.anchor}`}>
                  <a
                    href={href(r.slug, r.anchor)}
                    className={i === selected ? 'selected' : undefined}
                    onMouseMove={() => setSelected(i)}
                    onClick={(e) => {
                      e.preventDefault();
                      go(r);
                    }}
                  >
                    <span className="sr-icon">{r.anchor ? <HashIcon width={16} height={16} /> : <FileIcon width={16} height={16} />}</span>
                    <span className="sr-main">
                      <span className="sr-title">
                        {r.heading ? (
                          <>
                            <span className="sr-page">{r.pageTitle} ›</span> <Marked parts={r.headingParts} />
                          </>
                        ) : (
                          <Marked parts={r.pageTitleParts} />
                        )}
                      </span>
                      {r.snippet.length > 0 && (
                        <span className="sr-snippet">
                          <Marked parts={r.snippet} />
                        </span>
                      )}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="search-foot">
          <span><kbd>↑</kbd><kbd>↓</kbd> {t.keySelect}</span>
          <span><kbd>Enter</kbd> {t.keyOpen}</span>
          <span><kbd>Esc</kbd> {t.keyClose}</span>
        </div>
      </div>
    </div>
  );
}
