---
title: Cài đặt
description: Cài PiaEngine, mở editor và chạy project mẫu.
---

# Cài đặt

## Yêu cầu

- **Node.js** (kèm npm) — editor, script và build đều chạy qua Node.
- Trình duyệt **Chrome / Edge / Firefox** bản mới (editor chạy trong trình duyệt, cần WebGL2).
- Một code editor cho TypeScript, khuyên dùng **VS Code**.

## Cài engine

Clone repo PiaEngine rồi cài dependency **một lần** ở thư mục gốc repo:

```bash
npm install
```

## Mở editor

```bash
npm run editor                    # Project Hub: chọn / tạo project rồi mở editor (http://localhost:5170)
npm run editor:3d                 # mở thẳng examples/Demo3D
npm run editor:2d                 # mở thẳng examples/Demo2D
npm run editor -- path/to/MyGame  # mở thẳng một project bất kỳ
```

Editor là một trang web chạy ở `http://localhost:5170`, lệnh trên tự mở trình duyệt. Muốn đổi cổng hoặc không tự mở trình duyệt, dùng biến môi trường (xem [CLI](../reference/cli.md)):

```powershell
$env:PIA_PORT = '5180'; $env:PIA_NO_OPEN = '1'; npm run editor
```

## Thử project mẫu

1. Chạy `npm run editor:2d`.
2. Trong **Project**, mở `Assets/Scenes/Platformer.scene.json` (double-click).
3. Bấm **Play** (hoặc <kbd>Ctrl</kbd>+<kbd>P</kbd>). Click vào Game view rồi dùng A/D để chạy, Space để nhảy.
4. Bấm Play lần nữa để dừng: mọi thay đổi trong lúc chơi bị huỷ, như Unity.

::: note
Game view chỉ nhận phím khi đang được focus (click vào nó trước). Đây cũng là hành vi của Unity.
:::

## Bước tiếp theo

- [Project Hub](project-hub.md) — tạo project mới.
- [Script đầu tiên](first-script.md).
