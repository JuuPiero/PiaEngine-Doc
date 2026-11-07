/** UI strings of the docs site (the content itself lives in content/<locale>/). */
export interface UiStrings {
  search: string;
  searchPlaceholder: string;
  searchLoading: string;
  searchEmpty: string;
  searchHint: string;
  keySelect: string;
  keyOpen: string;
  keyClose: string;
  onThisPage: string;
  previous: string;
  next: string;
  notFoundTitle: string;
  notFoundText: string;
  backHome: string;
  copy: string;
  copied: string;
  menu: string;
  themeLight: string;
  themeDark: string;
  editPage: string;
  wip: string;
  loading: string;
}

export const strings: Record<string, UiStrings> = {
  vi: {
    search: 'Tìm kiếm',
    searchPlaceholder: 'Tìm trong tài liệu…',
    searchLoading: 'Đang nạp chỉ mục…',
    searchEmpty: 'Không tìm thấy kết quả cho',
    searchHint: 'Gõ tên API, component hoặc chủ đề (không dấu cũng được).',
    keySelect: 'chọn',
    keyOpen: 'mở',
    keyClose: 'đóng',
    onThisPage: 'Trên trang này',
    previous: 'Trang trước',
    next: 'Trang sau',
    notFoundTitle: 'Không tìm thấy trang',
    notFoundText: 'Trang này không tồn tại hoặc đã được đổi tên.',
    backHome: 'Về trang chủ',
    copy: 'Copy',
    copied: 'Đã copy',
    menu: 'Menu',
    themeLight: 'Chế độ sáng',
    themeDark: 'Chế độ tối',
    editPage: 'Sửa trang này',
    wip: 'WIP',
    loading: 'Đang tải…',
  },
  en: {
    search: 'Search',
    searchPlaceholder: 'Search the docs…',
    searchLoading: 'Loading index…',
    searchEmpty: 'No results for',
    searchHint: 'Type an API, component or topic.',
    keySelect: 'select',
    keyOpen: 'open',
    keyClose: 'close',
    onThisPage: 'On this page',
    previous: 'Previous',
    next: 'Next',
    notFoundTitle: 'Page not found',
    notFoundText: 'This page does not exist or was renamed.',
    backHome: 'Back to home',
    copy: 'Copy',
    copied: 'Copied',
    menu: 'Menu',
    themeLight: 'Light mode',
    themeDark: 'Dark mode',
    editPage: 'Edit this page',
    wip: 'WIP',
    loading: 'Loading…',
  },
};
