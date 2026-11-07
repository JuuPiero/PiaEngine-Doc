import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...p,
});

export const MenuIcon = (p: P) => (
  <svg {...base(p)}><path d="M4 6h16M4 12h16M4 18h16" /></svg>
);
export const CloseIcon = (p: P) => (
  <svg {...base(p)}><path d="M18 6 6 18M6 6l12 12" /></svg>
);
export const SearchIcon = (p: P) => (
  <svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const SunIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);
export const MoonIcon = (p: P) => (
  <svg {...base(p)}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
);
export const ChevronIcon = (p: P) => (
  <svg {...base(p)}><path d="m9 18 6-6-6-6" /></svg>
);
export const FileIcon = (p: P) => (
  <svg {...base(p)}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6" /></svg>
);
export const HashIcon = (p: P) => (
  <svg {...base(p)}><path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" /></svg>
);

export const Logo = (p: P) => (
  <svg width={26} height={26} viewBox="0 0 32 32" aria-hidden {...p}>
    <defs>
      <linearGradient id="pia-logo-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#38bdf8" />
        <stop offset="1" stopColor="#6366f1" />
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="30" height="30" rx="8" fill="url(#pia-logo-g)" />
    <path d="M11 24V8h6.2a5 5 0 0 1 0 10H11" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="22.5" cy="23.5" r="2" fill="#fff" />
  </svg>
);
