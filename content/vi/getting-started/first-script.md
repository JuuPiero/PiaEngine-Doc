---
title: Script đầu tiên
description: Tạo một MonoBehaviour, gắn vào GameObject và chạy thử trong Play Mode.
---

# Script đầu tiên

## 1. Tạo script

Có hai cách:

- **Project → Create → TypeScript Script** (chuột phải trong cửa sổ Project), đặt tên `Rotator`.
- Hoặc chọn một GameObject, trong Inspector bấm **Add Component → New script…**: script được tạo và gắn luôn vào object.

File mới có dạng:

```ts Assets/Scripts/Rotator.ts
import { MonoBehaviour, Time } from '@pia/core';

export class Rotator extends MonoBehaviour {
  // Public fields appear in the Inspector.
  speed = 1;

  // start is called before the first frame update
  start() {
  }

  // update is called once per frame
  update() {
  }
}
```

::: note Tên class
Mọi class **được export** kế thừa `MonoBehaviour` trong `Assets/` tự đăng ký thành component (tên component = tên export). Một file có thể export nhiều component.
:::

## 2. Viết code

Double-click script trong Project (hoặc ô Script trong Inspector) để mở bằng code editor. Ví dụ xoay object:

```ts Assets/Scripts/Rotator.ts
import { MonoBehaviour, Time, Vector3 } from '@pia/core';

/** Spins the object. Public fields show up in the Inspector automatically. */
export class Rotator extends MonoBehaviour {
  /** Degrees per second around each local axis. */
  speed = new Vector3(0, 90, 0);

  update() {
    this.transform.rotate(this.speed.mul(Time.deltaTime));
  }
}
```

Lưu file → editor tự biên dịch lại và **domain reload** scene: giá trị đã chỉnh trong Inspector được giữ. Lỗi biên dịch hiện trong **Console**.

## 3. Gắn vào object

- Kéo file script từ Project thả lên object trong Hierarchy / Inspector, hoặc
- Inspector → **Add Component** → tìm `Rotator`.

Field `speed` hiện trong Inspector như một Vector3. Xem thêm [Field & Inspector](../scripting/fields.md).

## 4. Chạy

Bấm **Play** (<kbd>Ctrl</kbd>+<kbd>P</kbd>). Object xoay trong Game view và cả Scene view. Bấm Play lần nữa để dừng — mọi thay đổi trong Play Mode bị huỷ.

## Nhận input

```ts Assets/Scripts/Mover.ts
import { Input, MonoBehaviour, Time, Vector3, field } from '@pia/core';

export class Mover extends MonoBehaviour {
  @field({ range: [0, 20] })
  moveSpeed = 5;

  update() {
    const move = new Vector3(Input.getAxis('Horizontal'), 0, -Input.getAxis('Vertical'));
    this.transform.position = this.transform.position.add(move.mul(this.moveSpeed * Time.deltaTime));
    if (Input.getKeyDown('Space')) this.print('Jump!');
  }
}
```

::: warning Vector là bản sao
`transform.position` trả về **bản sao** (giống struct của C#). Sửa trực tiếp `this.transform.position.x = 1` không có tác dụng; hãy gán lại: `const p = t.position; p.x += 1; t.position = p;`.
:::

## Tiếp theo

- [Vòng đời MonoBehaviour](../scripting/monobehaviour.md)
- [Build game đầu tiên](first-build.md)
