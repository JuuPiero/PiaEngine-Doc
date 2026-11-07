import { useState } from 'react';
import { nav } from '../content';
import { t } from '../config';
import { href } from '../router';
import { ChevronIcon } from './Icons';

interface Props {
  current: string;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ current, open, onClose }: Props) {
  // sections are expanded by default; the user can collapse them
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <>
      <div className={`sidebar-backdrop${open ? ' show' : ''}`} onClick={onClose} aria-hidden />
      <aside className={`sidebar${open ? ' open' : ''}`} aria-label="Sidebar">
        <nav>
          {nav.map((section) => {
            const containsCurrent = section.items.some((i) => i.slug === current);
            const isCollapsed = collapsed[section.title] && !containsCurrent;
            return (
              <div className="nav-section" key={section.title}>
                <button
                  type="button"
                  className={`nav-section-title${isCollapsed ? ' collapsed' : ''}`}
                  onClick={() => setCollapsed((c) => ({ ...c, [section.title]: !isCollapsed }))}
                  aria-expanded={!isCollapsed}
                >
                  <span>{section.title}</span>
                  <ChevronIcon width={14} height={14} />
                </button>
                {!isCollapsed && (
                  <ul>
                    {section.items.map((item) => (
                      <li key={item.slug}>
                        <a
                          href={href(item.slug)}
                          className={item.slug === current ? 'active' : undefined}
                          aria-current={item.slug === current ? 'page' : undefined}
                          onClick={onClose}
                        >
                          <span>{item.label}</span>
                          {item.status === 'wip' && <span className="badge-wip">{t.wip}</span>}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
