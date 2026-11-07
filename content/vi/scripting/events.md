---
title: Sự kiện (PiaEvent)
description: PiaEvent tương đương UnityEvent — gọi hàm cấu hình trong Inspector và listener từ code.
---

# Sự kiện (PiaEvent)

`PiaEvent` là bản tương đương **UnityEvent**: danh sách hàm được cấu hình trong Inspector (persistent call) cộng với listener thêm bằng code. Ví dụ quen thuộc nhất: `Button.onClick`.

## Khai báo trong component

```ts
import { MonoBehaviour, PiaEvent } from '@pia/core';

export class Door extends MonoBehaviour {
  onOpened = new PiaEvent();                     // tự hiện trong Inspector
  onDamaged = new PiaEvent<[number]>();          // có tham số

  open() {
    // ...
    this.onOpened.invoke();
    this.onDamaged.invoke(10);
  }
}
```

## Cấu hình trong Inspector

Mỗi dòng của event chọn:

1. **Target**: kéo một GameObject vào.
2. **Method**: dropdown liệt kê `GameObject.setActive` và các method public của các component trên object đó.
3. **Argument** (tuỳ chọn): một giá trị dạng chuỗi; `true` / `false` và số được tự chuyển kiểu.

Ví dụ Demo3D: nút **Reset** có `On Click ()` gọi `GoalCounter.resetCount`:

```ts Assets/Scripts/GoalCounter.ts
/** Called by the Reset button (Button → On Click). */
resetCount() {
  this._count = 0;
  this.refresh();
}
```

## Listener từ code

```ts
const button = this.getComponent(Button);
const onClick = () => Debug.log('Clicked');
button?.onClick.addListener(onClick);
button?.onClick.removeListener(onClick);
button?.onClick.removeAllListeners();          // chỉ xoá listener code, không xoá call trong Inspector
```

## SendMessage

Gọi hàm theo tên trên các component của object (giống Unity):

```ts
other.gameObject.sendMessage('takeDamage', 10);
this.gameObject.broadcastMessage('reset');       // cả cây con
this.gameObject.sendMessageUpwards('onHit');     // object và các cha
```

Animation event (cửa sổ Animation) cũng gọi hàm qua `sendMessage` trên object được animate.
