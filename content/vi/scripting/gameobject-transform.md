---
title: GameObject & Transform
description: Tạo, tìm, bật tắt GameObject; vị trí, xoay, scale và cây cha-con với Transform.
---

# GameObject & Transform

## GameObject

```ts
import { GameObject, SpriteRenderer } from '@pia/core';

const go = new GameObject('Coin');            // thêm vào scene đang chạy
const sr = go.addComponent(SpriteRenderer);
sr.sprite = 'builtin:Circle';

go.name; go.tag; go.layer; go.id;              // id: định danh ổn định trong file scene
go.activeSelf; go.activeInHierarchy;
go.setActive(false);
go.compareTag('Player');
go.scene;                                      // Scene chứa object
go.components;                                 // mọi component, Transform đầu tiên
```

`getComponent` nhận **class** hoặc **tên đăng ký** (chuỗi):

```ts
const rb = this.getComponent(Rigidbody);
const sr = this.getComponent<SpriteRenderer>('SpriteRenderer');
const all = this.getComponentsInChildren(Collider2D);
const ui = this.getComponentInParent(Canvas);
```

## Tìm object

| API | Ý nghĩa |
|---|---|
| `GameObject.find('Player')` | Object **active** theo tên, hoặc đường dẫn `'Root/Child'` |
| `GameObject.findWithTag('Player')` | Object đầu tiên có tag |
| `GameObject.findGameObjectsWithTag('Enemy')` | Mọi object có tag |
| `scene.findObjectsOfType(Star)` / `scene.findObjectOfType(Star)` | Component theo kiểu (`includeInactive` tuỳ chọn) |
| `scene.findById(id)` | Theo id |
| `scene.rootGameObjects`, `scene.getAllGameObjects()` | Duyệt cả scene |
| `transform.find('Arm/Hand')` | Con theo đường dẫn |

Ví dụ từ Demo2D:

```ts Assets/Scripts/Star.ts
start() {
  this._player = GameObject.findWithTag('Player');
}

update() {
  // ...
  const left = (this.gameObject.scene?.findObjectsOfType(Star).length ?? 1) - 1;
}
```

Tag và layer khai báo ở **Edit → Project Settings**. Tag có sẵn: `Untagged`, `Respawn`, `Finish`, `EditorOnly`, `MainCamera`, `Player`, `GameController`. Layer có sẵn: `Default`, `TransparentFX`, `Ignore Raycast`, `Water`, `UI`.

```ts
import { LayerMask } from '@pia/core';

const mask = LayerMask.getMask('Default', 'Water');
LayerMask.nameToLayer('Water');   // 4
```

## Transform

| Thành viên | Ý nghĩa |
|---|---|
| `position`, `rotation` (Quaternion), `eulerAngles` | Toạ độ thế giới |
| `localPosition`, `localRotation`, `localEulerAngles`, `localScale` | Toạ độ cục bộ (so với cha) |
| `lossyScale` | Scale thế giới (chỉ đọc) |
| `forward`, `right`, `up` | Hướng thế giới (forward = -Z cục bộ) |
| `translate(v, space?)`, `rotate(euler, space?)`, `rotateAround(point, axis, angle)`, `lookAt(target, worldUp?)` | Di chuyển / xoay |
| `transformPoint`, `inverseTransformPoint`, `transformDirection`, `inverseTransformDirection`, `transformVector` | Đổi hệ toạ độ |
| `parent`, `setParent(p, worldPositionStays = true)`, `root`, `childCount`, `getChild(i)`, `children`, `isChildOf(t)` | Cây cha-con |
| `getSiblingIndex()`, `setSiblingIndex(i)`, `setAsFirstSibling()`, `setAsLastSibling()`, `detachChildren()` | Thứ tự anh em |
| `setLocalPosition(x, y, z)`, `setLocalEulerAngles(x, y, z)`, `setLocalScale(x, y, z)` | Gán nhanh không tạo Vector3 |

`translate` và `rotate` mặc định theo trục cục bộ (`Space.Self`); truyền `Space.World` để theo trục thế giới:

```ts Assets/Scripts/PlayerController.ts
const move = new Vector3(Input.getAxis('Horizontal'), 0, -Input.getAxis('Vertical'));
if (move.sqrMagnitude > 0.0001) {
  this.transform.translate(move.mul(this.moveSpeed * dt), Space.World);
  const target = Quaternion.lookRotation(move.normalized);
  this.transform.rotation = Quaternion.slerp(this.transform.rotation, target, 12 * dt);
}
```

::: warning Getter trả về bản sao
`position`, `rotation`, `localScale`… trả về **bản sao**. Sửa thành phần rồi gán lại:

```ts
const p = this.transform.position;
p.y += 1;
this.transform.position = p;
```
:::

::: note Hệ toạ độ
3D: right-handed, **forward = -Z** (như three.js). Camera và đèn nhìn theo -Z cục bộ. 2D: X sang phải, Y lên trên, 100 pixel = 1 unit; xoay 2D là trục Z (`transform.rotate(0, 0, deg)`).
:::

## SendMessage

```ts
this.gameObject.sendMessage('takeDamage', 10);        // mọi component của object có hàm takeDamage
this.gameObject.broadcastMessage('onLevelStart');     // object và mọi con
this.gameObject.sendMessageUpwards('onChildHit');     // object và mọi cha
```

Xem thêm [Sự kiện](events.md).
