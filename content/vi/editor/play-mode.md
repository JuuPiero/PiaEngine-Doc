---
title: Play Mode & Undo
description: Chạy game trong editor, tạm dừng, chạy từng frame, và hệ thống Undo.
---

# Play Mode & Undo

## Play Mode

| Lệnh | Phím |
|---|---|
| Play / Stop | <kbd>Ctrl</kbd>+<kbd>P</kbd> |
| Pause | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> |
| Step (một frame) | <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>P</kbd> |

Như Unity:

- Editor chơi một **bản sao** của scene. Khi Stop, scene quay về trạng thái trước khi Play: **mọi thay đổi trong Play Mode bị huỷ**. Giao diện đổi màu khi đang Play để nhắc điều này.
- Scene view hiện scene đang chạy: chọn và xem object lúc chơi được.
- Game view nhận input bàn phím / chuột khi được focus.
- Scene dùng vật lý thì engine nạp Rapier trước khi bắt đầu (lần đầu có thể mất một chút).

::: warning ScriptableObject
Script đổi giá trị của **asset** ScriptableObject khi đang chơi thì khi Stop giá trị quay về bản đã lưu (khác Unity, nơi thay đổi bị giữ lại). Sửa asset trong **Inspector** lúc đang chơi thì được lưu.
:::

## Stats (draw call)

Nút **Stats** trên thanh của Game view (như cửa sổ Stats của Unity) hiện số liệu của frame vừa vẽ:

| Dòng | Ý nghĩa |
|---|---|
| Graphics | FPS và thời gian mỗi frame |
| **Batches** | Số draw call (lệnh vẽ gửi cho GPU). Sprite cùng texture / material được PixiJS gộp chung một batch; mesh 3D mỗi material một draw call. Kèm số draw call dùng instancing nếu có |
| SetPass calls | Số lần đổi shader giữa các draw call |
| Tris / Verts | Số tam giác / đỉnh đã vẽ (tính cả instance) |
| Screen, Objects | Kích thước Game view, số GameObject |

Số liệu được đếm ở tầng WebGL nên tính mọi lượt vẽ của Game view: shadow map, sprite batch, LineRenderer, particle… UI Canvas (DOM) không tính vào draw call.

Script đọc được cùng số liệu qua `RenderStats`:

```ts
import { Debug, RenderStats } from '@pia/core';

Debug.log(RenderStats.toString());   // "Batches 12 · SetPass 4 · Tris 3.2k · Verts 9.6k"
if (RenderStats.drawCalls > 100) Debug.warn('Nhiều draw call quá');
```

Trong editor `RenderStats` luôn được cập nhật. Trong bản build, đặt `RenderStats.enabled = true` trước khi đọc, hoặc mở game với `?stats` trên URL (ví dụ `index.html?stats`) để hiện bảng FPS + draw call ở góc màn hình — tiện để đo playable ads trên máy thật.

## Sửa script khi đang mở editor

Lưu file `.ts` → editor tự biên dịch lại và "domain reload": scene được dựng lại, giá trị trong Inspector được giữ. Lỗi biên dịch hiện trong Console. Shader (`.shader`), material, texture cũng được nạp lại ngay khi file đổi.

## Undo / Redo

- <kbd>Ctrl</kbd>+<kbd>Z</kbd> / <kbd>Ctrl</kbd>+<kbd>Y</kbd> (hoặc <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd>).
- Menu **Edit** hiện tên bước sẽ undo, ví dụ `Undo Move`.
- Một lần kéo gizmo = một bước undo; sửa nhiều object cùng lúc = một bước.
- Sửa material / ScriptableObject trong Inspector cũng undo được.

## Lưu scene

<kbd>Ctrl</kbd>+<kbd>S</kbd> lưu scene, <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>S</kbd> lưu thành file mới. Tên scene có dấu `*` khi chưa lưu. Editor hỏi lưu khi mở scene khác hoặc quay về Project Hub.
