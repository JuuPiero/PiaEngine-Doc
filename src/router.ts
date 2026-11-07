import { useSyncExternalStore } from 'react';

/**
 * Hash routing so the static build works on any host / sub-path:
 *   #/                        home (content/<locale>/index.md)
 *   #/scripting/lifecycle     page
 *   #/scripting/lifecycle#awake   page + heading anchor
 */
export interface Route { slug: string; anchor: string }

function subscribe(cb: () => void) {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
}

const getHash = () => window.location.hash;

export function parseHash(hash: string): Route {
  let h = hash.replace(/^#/, '');
  if (!h.startsWith('/')) return { slug: '', anchor: h ? decodeURIComponent(h) : '' };
  h = h.slice(1);
  const i = h.indexOf('#');
  const path = i >= 0 ? h.slice(0, i) : h;
  const anchor = i >= 0 ? h.slice(i + 1) : '';
  return { slug: decodeURIComponent(path).replace(/\/+$/, ''), anchor: decodeURIComponent(anchor) };
}

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, getHash, () => '');
  return parseHash(hash);
}

export function href(slug: string, anchor?: string): string {
  return `#/${slug}${anchor ? `#${anchor}` : ''}`;
}
