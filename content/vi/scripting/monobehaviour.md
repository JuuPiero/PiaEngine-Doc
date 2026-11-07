---
title: MonoBehaviour & vòng đời
description: Class MonoBehaviour, các hàm vòng đời và thứ tự gọi trong một frame.
---

# MonoBehaviour & vòng đời

Mọi script gameplay là một class **export** kế thừa `MonoBehaviour` (từ `@pia/core`). Class được tự đăng ký thành component, có trong **Add Component**.

```ts Assets/Scripts/Bobber.ts
import { MonoBehaviour, Time } from '@pia/core';

/** Moves the object up and down with a sine wave. */
export class Bobber extends MonoBehaviour {
  amplitude = 0.5;
  frequency = 0.5;

  private _baseY = 0;

  start() {
    this._baseY = this.transform.localPosition.y;
  }

  update() {
    const p = this.transform.localPosition;
    p.y = this._baseY + Math.sin(Time.time * Math.PI * 2 * this.frequency) * this.amplitude;
    this.transform.localPosition = p;
  }
}
```

## Hàm vòng đời

Chỉ cần khai báo hàm bạn dùng. Tên và thứ tự giống Unity, viết camelCase:

| Hàm | Khi nào |
|---|---|
| `awake()` | Một lần, lần đầu GameObject active (kể cả khi script bị tắt), trước mọi `start`. |
| `onEnable()` | Mỗi lần component được bật và object active. |
| `start()` | Một lần, trước `update` / `fixedUpdate` đầu tiên của component. |
| `fixedUpdate()` | Theo bước cố định `Time.fixedDeltaTime` (mặc định 0.02 s), trước khi vật lý chạy bước đó. |
| `update()` | Mỗi frame. |
| `lateUpdate()` | Mỗi frame, sau mọi `update` và coroutine (hợp cho camera bám theo). |
| `onDisable()` | Khi component bị tắt hoặc object inactive. |
| `onDestroy()` | Khi component / object bị huỷ (chỉ nếu đã `awake`). |
| `onValidate()` | Chỉ trong editor: sau khi sửa giá trị trong Inspector. |
| `reset()` | Chỉ trong editor: khi thêm component hoặc bấm Reset trong Inspector. |

Callback vật lý: `onCollisionEnter/Stay/Exit(collision)`, `onTriggerEnter/Stay/Exit(other)` và bản 2D `...2D`. Xem [Vật lý 3D](../components/physics-3d.md) và [Vật lý 2D](../components/physics-2d.md).

## Thứ tự trong một frame

1. Các bước `fixedUpdate` (0 hoặc nhiều lần, tối đa 8 bước mỗi frame) → bước vật lý → callback va chạm.
2. `start` của component mới bật.
3. `update` của mọi component.
4. Coroutine.
5. `lateUpdate`.
6. Huỷ các object đã gọi `destroy` trong frame.

Lỗi (exception) trong một hàm vòng đời được ghi vào Console kèm component, không làm dừng các script khác.

::: note Chỉ chạy trong Play Mode
Hàm vòng đời chỉ chạy trong Play Mode và trong bản build. Trong Edit Mode chỉ có `onValidate` và `reset` được gọi. PiaEngine chưa có tương đương `[ExecuteInEditMode]`.
:::

## Bật / tắt

```ts
this.enabled = false;              // tắt component (onDisable)
this.gameObject.setActive(false);  // tắt cả object và con
this.isActiveAndEnabled;           // đang bật và object active trong hierarchy
```

## Thuộc tính và hàm có sẵn

| Thành viên | Ý nghĩa |
|---|---|
| `gameObject`, `transform`, `name`, `tag` | Object chứa component |
| `enabled`, `isActiveAndEnabled` | Trạng thái bật |
| `getComponent(T)`, `getComponents`, `getComponentInChildren`, `getComponentsInChildren`, `getComponentInParent`, `addComponent(T)` | Tìm / thêm component (nhận class hoặc tên chuỗi `'Rigidbody'`) |
| `compareTag('Player')` | So tag |
| `instantiate(...)`, `destroy(obj, t?)` | Xem [Instantiate & Destroy](instantiate-destroy.md) |
| `startCoroutine`, `stopCoroutine`, `stopAllCoroutines`, `invoke`, `invokeRepeating` | Xem [Coroutine & Time](coroutines-time.md) |
| `print(...)` | Như `Debug.log` |

## Tuỳ biến cách hiện trong editor

Decorator `@component` (không bắt buộc) đặt đường dẫn menu Add Component, tên đăng ký, chặn gắn nhiều lần:

```ts
import { MonoBehaviour, component } from '@pia/core';

@component({ menu: 'Gameplay/Health', disallowMultiple: true })
export class Health extends MonoBehaviour {
  hp = 100;
}
```
