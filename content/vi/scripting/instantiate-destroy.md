---
title: Instantiate & Destroy
description: Nhân bản object và prefab, huỷ object, component, ScriptableObject.
---

# Instantiate & Destroy

## Instantiate

`this.instantiate(...)` (trong MonoBehaviour) nhân bản GameObject cùng con và component, như `Object.Instantiate` của Unity. Tham chiếu giữa các object **bên trong** bản sao được trỏ lại vào bản sao.

```ts
// bản sao ở cùng chỗ, không cha
const a = this.instantiate(this.prefab!);

// làm con của một Transform
const b = this.instantiate(this.prefab!, this.transform);

// ở vị trí + hướng cho trước (tuỳ chọn cha)
const c = this.instantiate(this.prefab!, new Vector3(0, 2, 0), Quaternion.identity);

// nhân bản theo component: trả về component tương ứng trên bản sao
const rb = this.instantiate(someRigidbody);
```

Bản sao có tên thêm `(Clone)`. Field kiểu `@field(GameObject)` nhận cả **prefab** từ Project nên dùng được như Unity:

```ts Assets/Scripts/Spawner.ts
import { GameObject, MonoBehaviour, Quaternion, Vector3, WaitForSeconds, field } from '@pia/core';

/** Periodically clones a template object (like instantiating a prefab) and destroys the copies later. */
export class Spawner extends MonoBehaviour {
  @field('gameObject')
  prefab: GameObject | null = null;

  @field({ min: 0.05 })
  interval = 0.6;

  lifetime = 4;
  radius = 1.5;

  start() {
    this.startCoroutine(this.spawnLoop());
  }

  *spawnLoop() {
    while (true) {
      this.spawn();
      yield new WaitForSeconds(this.interval);
    }
  }

  spawn() {
    if (!this.prefab) return;
    const offset = new Vector3((Math.random() - 0.5) * 2 * this.radius, 0, (Math.random() - 0.5) * 2 * this.radius);
    const go = this.instantiate(this.prefab, this.transform.position.add(offset), Quaternion.identity);
    go.setActive(true);
    this.destroy(go, this.lifetime);
  }
}
```

Prefab chỉ nạp bằng tên lúc chạy: dùng `Resources.loadPrefab` (xem [Resources](../assets/resources.md)).

## Destroy

```ts
this.destroy(this.gameObject);        // cuối frame
this.destroy(enemy, 2);               // sau 2 giây
this.destroy(this.getComponent(Rigidbody));   // chỉ gỡ component
```

- Trong Play Mode, object bị huỷ **ở cuối frame** (sau `lateUpdate`), giống Unity. Trong Edit Mode thì huỷ ngay.
- Huỷ GameObject → `onDisable` + `onDestroy` của mọi component, kể cả con.
- Không huỷ được `Transform` (hãy huỷ GameObject).
- `obj.destroyed` cho biết object đã bị huỷ (tương đương phép so `obj == null` của Unity). Hàm `isAlive(obj)` (từ `@pia/core`) trả về `true` khi object khác null và chưa bị huỷ.

## ScriptableObject

```ts
const copy = this.instantiate(this.data!);   // bản sao lúc chạy của asset
this.destroy(copy);
```

Xem [ScriptableObject](scriptable-object.md).
