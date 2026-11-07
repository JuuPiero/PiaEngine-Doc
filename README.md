# PiaEngine Docs

Trang tài liệu (tiếng Việt) cho PiaEngine. React 19 + Vite + TypeScript, nội dung viết bằng Markdown.

```bash
npm install
npm run dev        # http://localhost:5173 — sửa file .md là trang tự cập nhật
npm run build      # → dist/ (trang tĩnh, chạy được ở sub-path bất kỳ)
npm run preview    # xem thử bản build
```

## Cấu trúc

```text
content/
  vi/                      nội dung tiếng Việt (mỗi ngôn ngữ một thư mục)
    sidebar.json           thứ tự sidebar + trang trước / trang sau
    index.md               trang chủ  (#/)
    scripting/fields.md    → #/scripting/fields
    official/*.md          package chính thức (Spine, Spline, Cinemachine, UI Toolkit)
plugins/markdown.ts        Vite plugin: Markdown → HTML lúc build (markdown-it + highlight.js), mục lục, dữ liệu tìm kiếm, kiểm tra link
plugins/shaderlab.ts       highlight cho file .shader (header kiểu ShaderLab + GLSL)
public/images/             ảnh dùng trong trang: ![mô tả](/images/ten.png)
src/                       giao diện (sidebar, mục lục, tìm kiếm, theme, router)
  config.ts                ngôn ngữ, tên site, link "Sửa trang này" (EDIT_BASE_URL)
  i18n.ts                  chữ trên giao diện theo ngôn ngữ
```

## Thêm một trang

1. Tạo file, ví dụ `content/vi/scripting/save-game.md`:

   ```md
   ---
   title: Lưu game
   description: Một câu mô tả ngắn.
   ---

   # Lưu game

   Nội dung…
   ```

2. Thêm slug `"scripting/save-game"` vào `content/vi/sidebar.json` (đúng chỗ muốn hiện). Mục có thể là chuỗi slug, hoặc `{ "slug": "...", "label": "Tên khác" }`.

Trang không có trong sidebar vẫn mở được, nhưng `npm run dev` sẽ cảnh báo trong console trình duyệt.

## Cú pháp hỗ trợ

- Markdown chuẩn + bảng GitHub, HTML thô.
- Code block có highlight + nút Copy; thêm tên file sau ngôn ngữ: ```` ```ts Assets/Scripts/Rotator.ts ````. Ngôn ngữ hay dùng: `ts`, `json`, `bash`, `powershell`, `shaderlab` (file `.shader`), `glsl`, `text`.
- Callout:

  ```md
  ::: note|tip|warning|danger|wip [Tiêu đề tuỳ chọn]
  Nội dung
  :::
  ```

- Link tới trang khác bằng đường dẫn file tương đối: `[Prefab](../assets/prefabs.md)`, `[Snap](../editor/scene-view.md#snap)`. Id của heading = tiêu đề bỏ dấu, chữ thường, nối bằng `-` (`## Ép đưa vào build` → `#ep-dua-vao-build`).
- Frontmatter `status: wip` hiện nhãn **WIP** trong sidebar (dùng cho trang về tính năng đang phát triển, kèm callout `::: wip`).

`npm run build` kiểm tra mọi link nội bộ và anchor, in cảnh báo nếu link hỏng.

## Deploy

`dist/` là trang tĩnh, dùng **hash route** (`#/scripting/fields#doi-ten-field`) và đường dẫn tương đối (`base: './'`), nên chạy được ở root hoặc sub-path (GitHub Pages `https://user.github.io/repo/`, S3, Netlify…) mà không cần cấu hình rewrite. Chỉ cần chép `dist/` lên host.

## Thêm ngôn ngữ

Tạo `content/<mã>/` (cùng cấu trúc + `sidebar.json`), thêm chuỗi giao diện vào `src/i18n.ts`, đổi `LOCALE` trong `src/config.ts`.
