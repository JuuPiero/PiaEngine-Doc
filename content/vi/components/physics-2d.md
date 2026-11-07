---
title: Vật lý 2D
description: Rigidbody2D, Box/Circle/Capsule Collider 2D, callback 2D và Physics2D (Rapier 2D hoặc builtin).
---

# Vật lý 2D

Vật lý 2D chạy trên mặt phẳng **XY** bằng engine chọn theo project ([Chọn engine vật lý](physics-engine.md)): **Rapier 2D** (mặc định) hoặc **builtin** (~12 KB, chỉ phát hiện va chạm); chỉ được nạp khi scene có component vật lý 2D. Dùng được trong cả scene 2D lẫn 3D.

## Rigidbody2D

**Add Component → Physics 2D → Rigidbody 2D**.

| Thuộc tính | Field | Mặc định | Mô tả |
|---|---|---|---|
| Body Type | `bodyType` | `Dynamic` | `Dynamic`, `Kinematic`, `Static` |
| Mass | `mass` | `1` | |
| Linear Drag | `linearDrag` | `0` | |
| Angular Drag | `angularDrag` | `0.05` | |
| Gravity Scale | `gravityScale` | `1` | Hệ số trọng lực |
| Freeze Rotation | `freezeRotation` | `false` | Không cho xoay |

```ts
const rb = this.getComponent(Rigidbody2D)!;
rb.velocity = new Vector2(h * speed, rb.velocity.y);
rb.angularVelocity;                                  // độ / giây
rb.addForce(new Vector2(0, 5), ForceMode2D.Impulse); // Force (cộng dồn, áp ở bước vật lý kế tiếp) | Impulse
rb.addTorque(1);
rb.movePosition(new Vector2(0, 2)); rb.moveRotation(45);
rb.isKinematic; rb.sleep(); rb.wakeUp(); rb.isSleeping();
```

## Collider 2D

| Thuộc tính chung | Field | Mặc định |
|---|---|---|
| Is Trigger | `isTrigger` | `false` |
| Friction | `friction` | `0.4` |
| Bounciness | `bounciness` | `0` |
| Used By Effector | `usedByEffector` | `false` — collider được Effector 2D trên cùng object dùng ([xem thêm](physics-joints.md#effector-2d)) |
| Offset | `offset` | `(0, 0)` |

| Component | Thuộc tính riêng |
|---|---|
| `BoxCollider2D` | `size` (1, 1) |
| `CircleCollider2D` | `radius` (0.5) |
| `CapsuleCollider2D` | `size` (0.5, 1), `direction` (`Vertical` / `Horizontal`) |

## Callback

```ts
onCollisionEnter2D(collision: Collision2D) {}   // + Stay2D, Exit2D
onTriggerEnter2D(other: Collider2D) {}          // + Stay2D, Exit2D
```

Ví dụ nhặt vật phẩm (Demo2D):

```ts Assets/Scripts/Collectible.ts
onTriggerEnter2D(other: Collider2D) {
  if (!other.gameObject.compareTag('Player')) return;
  if (this.pickupSound) AudioSource.playClipAtPoint(this.pickupSound, this.transform.position, 0.8);
  if (this.pickupEffect) this.instantiate(this.pickupEffect, this.transform.position, this.transform.rotation);
  ScoreKeeper.instance?.add(this.points);
  this.destroy(this.gameObject);
}
```

## Truy vấn

```ts
Physics2D.raycast(origin, direction, distance, layerMask);   // RaycastHit2D | null
Physics2D.overlapCircle(point, radius, layerMask);           // Collider2D[]
Physics2D.overlapPoint(point, layerMask);                    // Collider2D | null
Physics2D.overlapPointAll(point, layerMask);                 // Collider2D[]
Physics2D.overlapBox(point, size, angle, layerMask);         // Collider2D[]
Physics2D.raycastAll(origin, direction, distance);           // RaycastHit2D[] (gần nhất trước)
Physics2D.gravity = new Vector2(0, -20);
```

```ts Assets/Scripts/PlatformerPlayer.ts
get isGrounded(): boolean {
  const p = this.transform.position;
  for (const dx of [-0.3, 0, 0.3]) {
    if (Physics2D.raycast(new Vector2(p.x + dx, p.y - this.footOffset - 0.02), Vector2.down, 0.12)) return true;
  }
  return false;
}
```

Trọng lực mặc định: **Edit → Project Settings → Gravity 2D (y)**.

## Joint 2D, Effector 2D

Joint 2D (`HingeJoint2D`, `DistanceJoint2D`, `SpringJoint2D`, `FixedJoint2D`, `SliderJoint2D`, `WheelJoint2D`, `TargetJoint2D`, `RelativeJoint2D`, `FrictionJoint2D`), Effector 2D (gió, hút / đẩy, nước, băng chuyền, platform một chiều) và `ConstantForce2D`: xem [Joint, Effector & CharacterController](physics-joints.md).
