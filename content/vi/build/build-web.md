---
title: Build web
description: Build game ra trang web tĩnh, build stripping, báo cáo build và deploy.
---

# Build web

## Build

**File → Build Settings** (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd>): chọn scene và thứ tự (**scene 0 chạy đầu tiên**), platform **Web**, bấm **Build** hoặc **Build And Run** (<kbd>Ctrl</kbd>+<kbd>B</kbd> — build rồi mở game trong tab mới).

Dòng lệnh, từ thư mục gốc repo engine:

```bash
npm run build:game -- ../MyGame              # platform đang chọn trong Build Settings (mặc định web)
npm run build:game -- ../MyGame --target web
```

Kết quả ở `Build/web`: `index.html`, JS, asset và `pia.assets.json`.

## Chạy và deploy

Mở bằng static server bất kỳ:

```bash
npx vite preview --outDir Build/web
```

hoặc deploy thư mục `Build/web` lên Netlify / Vercel / GitHub Pages / S3… Tham số URL khi test:

- `?scene=Tên` hoặc `?scene=1`: mở thẳng một scene.
- `?stats`: hiện FPS, draw call (Batches), SetPass, số tam giác / đỉnh ở góc màn hình (xem [Stats](../editor/play-mode.md#stats-draw-call)). Ghép được: `?scene=2&stats`.

::: warning Không mở bằng file://
Game nạp asset bằng `fetch`, nên cần chạy qua HTTP (static server), không double-click `index.html`. Muốn một file HTML chạy offline, dùng [Playable Ads](playable-ads.md) (Preview.html).
:::

## Bản build chỉ chứa thứ thực sự dùng

Bắt đầu từ các scene trong Build Settings, engine lần theo mọi tham chiếu:

| Phần | Được đưa vào khi |
|---|---|
| Asset | Được scene / prefab / clip tham chiếu (GUID hoặc path), kể cả gián tiếp (buffer + texture của glTF, `.mtl` + texture của OBJ, texture của FBX); hoặc được script ghi bằng chuỗi `'Assets/...'` / GUID; hoặc nằm trong thư mục `Resources/` |
| Script | Có component được dùng trong scene / prefab, hoặc được script khác dùng (`addComponent(Foo)`, `getComponent('Foo')`, import) |
| Package | Có component được dùng hoặc được script import |
| Render pipeline | three.js / PixiJS theo pipeline của các scene |
| Vật lý | Rapier 3D / 2D chỉ khi có `Rigidbody` / collider tương ứng (trong scene, prefab hoặc code) |
| Model loader | glTF / FBX / OBJ theo định dạng model được dùng (instance của model, mesh / material / clip `"guid#…"` của model đều tính) |

Script trong `Editor/` và phần Editor của package **không bao giờ** vào build.

Ví dụ: Demo2D không kèm three.js và Rapier 3D; một game 3D không dùng vật lý không kèm Rapier (~4 MB).

Ảnh có thể được thu nhỏ / nén lại riêng cho bản build (Max Size, Format PNG / JPG / WebP, Quality) trong Import Settings — xem [Nén khi build](../assets/textures-sprites.md#nen-khi-build-web-playable-ads).

## Báo cáo build

Sau mỗi lần build, báo cáo (module engine, script / package / asset bị loại, texture đã nén, dung lượng từng chunk) hiện trong **Console** của editor và ghi ở `Build/build-report.json`. Xem báo cáo khi thấy thiếu asset lúc chạy hoặc bản build quá nặng.

## Ép đưa vào build

- Asset chỉ được nạp bằng tên lúc chạy: đặt vào thư mục `Resources/`.
- Script có tác dụng phụ ở cấp module mà không ai tham chiếu: thêm comment `// @pia-keep`.
- Hoặc khai báo trong `pia.project.json`:

```json pia.project.json
"build": {
  "include": ["Assets/Data/", "Assets/Levels/*.json", "com.mycompany.analytics"],
  "stripUnused": true
}
```

`stripUnused: false` = đưa mọi thứ vào build như cũ (dùng khi debug).

## Platform khác

Package có thể thêm platform vào Build Settings — ví dụ [Playable Ads](playable-ads.md). Viết platform riêng: [Build target từ package](../packages/build-targets.md).

::: note Chưa hỗ trợ
Build cho mobile / desktop (native). Game web chạy được trên trình duyệt di động.
:::
