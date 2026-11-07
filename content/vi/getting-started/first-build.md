---
title: Build game đầu tiên
description: Chọn scene trong Build Settings, build ra web tĩnh và chạy thử.
---

# Build game đầu tiên

## 1. Chọn scene

**File → Build Settings** (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd>):

- Kéo scene từ Project vào danh sách, hoặc bấm **Add Open Scenes**.
- Kéo để sắp thứ tự: **scene 0 chạy đầu tiên**.
- Platform mặc định là **Web**. Package có thể thêm platform khác (ví dụ [Playable Ads](../build/playable-ads.md)).

## 2. Build

- **Build**: xuất ra `Build/web` của project.
- **Build And Run** (<kbd>Ctrl</kbd>+<kbd>B</kbd>): build rồi mở game trong tab mới.

Dòng lệnh (từ thư mục gốc repo engine):

```bash
npm run build:game -- ../MyGame   # → ../MyGame/Build/web
```

## 3. Chạy / deploy

`Build/web` là trang tĩnh (`index.html`, JS, asset, `pia.assets.json`). Mở bằng static server bất kỳ:

```bash
npx vite preview --outDir Build/web
```

hoặc deploy lên Netlify / Vercel / GitHub Pages… Thêm `?scene=Tên` hoặc `?scene=1` vào URL để mở thẳng một scene khi test.

::: tip Bản build chỉ chứa thứ thực sự dùng
Engine lần theo tham chiếu từ các scene trong Build Settings và chỉ đóng gói asset, script, package, module engine (three.js / PixiJS, Rapier…) được dùng. Asset chỉ nạp bằng tên lúc chạy phải nằm trong `Resources/`. Chi tiết: [Build web](../build/build-web.md).
:::
