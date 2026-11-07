import { strings, type UiStrings } from './i18n';

/** Content language: pages are read from content/<LOCALE>/. */
export const LOCALE = 'vi';

export const SITE_TITLE = 'PiaEngine';
export const SITE_SUBTITLE = 'Docs';

/**
 * Optional: base URL used for the "Sửa trang này" link, e.g.
 * 'https://github.com/me/pia-engine-doc/edit/main/content/'. Empty = no link.
 */
export const EDIT_BASE_URL = '';

export const t: UiStrings = strings[LOCALE] ?? strings.en;
