---
title: Input
description: Bàn phím, chuột, axis và button theo kiểu Input Manager cũ của Unity.
---

# Input

`Input` mô phỏng **Input Manager (legacy)** của Unity.

## Bàn phím

```ts
import { Input, KeyCode } from '@pia/core';

Input.getKey('W');               // đang giữ
Input.getKeyDown('Space');       // vừa nhấn trong frame này
Input.getKeyUp(KeyCode.Escape);  // vừa nhả
Input.anyKey; Input.anyKeyDown;
```

Tên phím không phân biệt hoa thường, nhận tên Unity (`'W'`, `'Space'`, `'LeftArrow'`, `'Alpha1'`, `'LeftShift'`, `'Return'`, `'F1'`…) hoặc mã DOM (`'KeyW'`, `'ArrowLeft'`, `'Digit1'`). `KeyCode` chứa các tên này.

## Chuột / chạm

```ts
Input.getMouseButton(0);         // 0 = trái, 1 = phải, 2 = giữa
Input.getMouseButtonDown(0);
Input.getMouseButtonUp(0);
Input.mousePosition;             // Vector3 pixel, gốc ở góc dưới-trái Game view
Input.mouseScrollDelta;          // Vector2
```

Chạm trên màn hình cảm ứng được nhận như chuột trái (pointer events).

Đổi vị trí chuột sang toạ độ thế giới:

```ts
const cam = Camera.main!;
const p = Input.mousePosition;
const world = cam.screenToWorldPoint(new Vector3(p.x, p.y, 10)); // z = khoảng cách tới camera
```

## Axis & button

| Tên | Phím | Ghi chú |
|---|---|---|
| `Horizontal` | A / D, ← / → | Mượt, về 0 khi nhả |
| `Vertical` | S / W, ↓ / ↑ | |
| `Jump` | Space | |
| `Fire1` | Left Ctrl, chuột trái | |
| `Fire2` | Left Alt, chuột phải | |
| `Mouse X`, `Mouse Y` | Di chuyển chuột | |
| `Mouse ScrollWheel` | Lăn chuột | |

```ts
Input.getAxis('Horizontal');     // -1..1, có làm mượt
Input.getAxisRaw('Horizontal');  // -1, 0 hoặc 1
Input.getButton('Jump');
Input.getButtonDown('Jump');
Input.getButtonUp('Fire1');
```

Ví dụ platformer (Demo2D):

```ts Assets/Scripts/PlatformerPlayer.ts
const h = Input.getAxisRaw('Horizontal');
rb.velocity = new Vector2(h * (stats?.moveSpeed ?? 6), rb.velocity.y);
if (h !== 0 && this._sprite) this._sprite.flipX = h < 0;
if (Input.getButtonDown('Jump') && (grounded || this._airJumpsLeft > 0)) {
  // ...
}
```

::: note
- Trong editor, Game view chỉ nhận input khi được focus.
- Bảng axis hiện cố định (chưa có trang cấu hình Input Manager). Chưa có Input System mới, gamepad.
- Khi click vào UI (Image / Button / Text có Raycast Target), dùng `EventSystem.isPointerOverGameObject()` để bỏ qua input của game. Xem [UI](../components/ui.md).
:::
