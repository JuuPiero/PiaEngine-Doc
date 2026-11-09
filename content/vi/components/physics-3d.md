---
title: Vật lý 3D
description: Rigidbody, Box/Sphere/Capsule Collider, callback va chạm và Physics.raycast / overlap (Rapier hoặc builtin).
---

# Vật lý 3D

Engine vật lý chọn theo project ([Chọn engine vật lý](physics-engine.md)): **Rapier** (WASM, mặc định, mô phỏng đầy đủ) hoặc **builtin** (~12 KB, chỉ phát hiện va chạm). Engine chỉ được nạp khi scene có `Rigidbody` / collider — game không dùng vật lý không tải gì. Bước vật lý chạy theo `fixedUpdate` (`Time.fixedDeltaTime`).

## Rigidbody

**Add Component → Physics → Rigidbody**. Đặt object dưới quyền điều khiển của engine vật lý.

| Thuộc tính | Field | Mặc định | Mô tả |
|---|---|---|---|
| Mass | `mass` | `1` | Khối lượng |
| Drag | `drag` | `0` | Cản chuyển động |
| Angular Drag | `angularDrag` | `0.05` | Cản quay |
| Use Gravity | `useGravity` | `true` | |
| Is Kinematic | `isKinematic` | `false` | Chỉ di chuyển bằng script (`movePosition` / transform), đẩy được vật dynamic |
| Freeze Position | `freezePosition` | `[false, false, false]` | Khoá vị trí theo X/Y/Z |
| Freeze Rotation | `freezeRotation` | `[false, false, false]` | Khoá xoay theo X/Y/Z |

```ts
const rb = this.getComponent(Rigidbody)!;
rb.velocity = new Vector3(0, 5, 0);
rb.angularVelocity;
rb.addForce(new Vector3(0, 10, 0), ForceMode.Impulse);   // Force | Acceleration | Impulse | VelocityChange
// Force / Acceleration được cộng dồn và áp ở bước vật lý kế tiếp (như Unity), gọi trong awake / start cũng được
rb.addRelativeForce(Vector3.forward);
rb.addTorque(new Vector3(0, 1, 0));
rb.movePosition(target);  rb.moveRotation(q);            // cho vật kinematic
rb.sleep(); rb.wakeUp(); rb.isSleeping();
```

## Collider

Collider không có Rigidbody (trên chính nó hoặc cha) là **collider tĩnh**. Một object có thể có nhiều collider.

| Thuộc tính chung | Field | Mặc định | Mô tả |
|---|---|---|---|
| Is Trigger | `isTrigger` | `false` | Chỉ báo `onTrigger…`, không va chạm |
| Friction | `friction` | `0.6` | Ma sát 0..1 |
| Bounciness | `bounciness` | `0` | Độ nảy 0..1 |
| Center | `center` | `(0, 0, 0)` | Lệch tâm |

| Component | Thuộc tính riêng |
|---|---|
| `BoxCollider` | `size` (mặc định 1, 1, 1) |
| `SphereCollider` | `radius` (0.5) |
| `CapsuleCollider` | `radius` (0.5), `height` (2), `direction` (`X-Axis` / `Y-Axis` / `Z-Axis`) |

`collider.attachedRigidbody` trả về Rigidbody gắn với collider.

Collider đi theo Transform (vị trí, xoay, scale); `center` đi qua đủ Transform nên object scale âm (lật) thì collider lệch tâm cũng lật theo, đúng như đường viền xanh trong Scene view. Bấm **Edit Collider** trên Inspector để kéo mặt / bán kính / chiều cao ngay trong Scene view ([Edit Collider](../editor/scene-view.md#edit-collider)); đổi `size` / `radius` / `height` / `center` khi đang Play thì bước vật lý kế tiếp dùng hình mới.

## Callback

Gửi tới các script trên object của collider **và** object của Rigidbody:

```ts
onCollisionEnter(collision: Collision) {}   // cũng có onCollisionStay, onCollisionExit
onTriggerEnter(other: Collider) {}          // cũng có onTriggerStay, onTriggerExit
```

`Collision` mô tả **object kia**: `collider`, `rigidbody`, `gameObject`, `transform`, `relativeVelocity`, `contacts` / `contactCount` / `getContact(i)` (mỗi contact có `point`, `normal`).

```ts Assets/Scripts/ImpactSound.ts
onCollisionEnter(collision: Collision) {
  const speed = collision.relativeVelocity.magnitude;
  if (!this.clip || speed < this.minSpeed) return;
  this.getComponent(AudioSource)?.playOneShot(this.clip, Math.min(1, speed / 8) * this.volume);
}
```

## Truy vấn

```ts
const hit = Physics.raycast(origin, direction, maxDistance, layerMask);   // RaycastHit | null
if (hit) hit.point, hit.normal, hit.distance, hit.collider, hit.rigidbody, hit.gameObject;

Physics.raycastAll(origin, direction, maxDistance);   // mọi điểm chạm
Physics.overlapSphere(center, radius, layerMask);    // Collider[]
Physics.overlapBox(center, halfExtents, orientation, layerMask);   // Collider[]
Physics.checkSphere(center, radius);                 // boolean (checkBox tương tự)
Physics.gravity = new Vector3(0, -20, 0);
Physics.queriesHitTriggers = false;
```

Ví dụ kiểm tra chạm đất (Demo3D):

```ts Assets/Scripts/PhysicsPlayer.ts
get isGrounded(): boolean {
  const feet = this.transform.position.add(new Vector3(0, -this.footOffset - 0.02, 0));
  return !!Physics.raycast(feet, Vector3.down, 0.2);
}
```

Trọng lực mặc định chỉnh ở **Edit → Project Settings → Gravity 3D (y)**.

## Joint, CharacterController, ConstantForce

`FixedJoint`, `HingeJoint`, `SpringJoint`, `CharacterJoint`, `ConfigurableJoint`, `CharacterController` (di chuyển nhân vật không cần Rigidbody) và `ConstantForce`: xem [Joint, Effector & CharacterController](physics-joints.md).
