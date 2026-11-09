---
title: Joint, Effector & CharacterController
description: Joint 2D/3D, Effector 2D, ConstantForce và CharacterController — cùng tên field và callback với Unity.
---

# Joint, Effector & CharacterController

Các component vật lý mặc định của Unity, cùng tên field / callback. **Add Component → Physics / Physics 2D**. Cần engine **Rapier** ([Chọn engine vật lý](physics-engine.md)) — engine builtin không mô phỏng joint / effector / CharacterController. Xem thêm [Vật lý 3D](physics-3d.md) và [Vật lý 2D](physics-2d.md).

| 2D | 3D |
|---|---|
| `HingeJoint2D`, `DistanceJoint2D`, `SpringJoint2D`, `FixedJoint2D`, `SliderJoint2D`, `WheelJoint2D`, `TargetJoint2D`, `RelativeJoint2D`, `FrictionJoint2D` | `FixedJoint`, `HingeJoint`, `SpringJoint`, `CharacterJoint`, `ConfigurableJoint` |
| `AreaEffector2D`, `PointEffector2D`, `BuoyancyEffector2D`, `SurfaceEffector2D`, `PlatformEffector2D`, `ConstantForce2D` | `CharacterController`, `ConstantForce` |

```ts
const hinge = this.addComponent(HingeJoint2D);
hinge.connectedBody = door;          // để trống = nối vào một điểm cố định trong world
hinge.useMotor = true;
hinge.motor.motorSpeed = 180;        // độ/giây
hinge.breakForce = 500;              // gõ "Infinity" trong Inspector = không bao giờ đứt

onJointBreak2D(joint: Joint2D) { Debug.log('đứt!', joint.reactionForce); }   // 3D: onJointBreak(force)
```

## Quy tắc chung của joint

- Joint đặt trên object có `Rigidbody` / `Rigidbody2D`. **Connected Body** để trống = nối vào một điểm cố định trong world.
- `anchor` theo toạ độ local của object; `connectedAnchor` theo local của connected body (theo world nếu không có). `autoConfigureConnectedAnchor` tự tính connected anchor khi joint được tạo.
- `enableCollision`: cho hai body nối với nhau va chạm nhau (mặc định tắt).
- Chọn joint trong editor để thấy anchor / trục / giới hạn trong Scene view.

### Đứt joint

| | 2D | 3D |
|---|---|---|
| Ngưỡng | `breakForce`, `breakTorque` (mặc định `Infinity`; Inspector nhận chữ `Infinity`) | `breakForce`, `breakTorque` |
| Khi vượt ngưỡng | Gọi `onJointBreak2D(joint)` rồi làm theo `breakAction`: `Ignore`, `CallbackOnly`, `Disable`, `Destroy` (mặc định) | Gọi `onJointBreak(force)` rồi xoá joint |
| Đọc lực | `reactionForce`, `reactionTorque` | `currentForce`, `currentTorque` |

Rapier không trả về lực của joint nên engine tự tính từ chuyển động của các body: chính xác với chuỗi / cây, gần đúng với cầu treo neo hai đầu hoặc vật đang trượt có ma sát.

## Joint 2D

| Component | Field chính |
|---|---|
| `HingeJoint2D` | Bản lề quay quanh anchor. `useMotor` + `motor` (`motorSpeed` độ/giây, `maxMotorTorque`), `useLimits` + `limits` (Lower / Upper Angle) |
| `DistanceJoint2D` | Giữ khoảng cách: `distance`, `autoConfigureDistance`, `maxDistanceOnly` (= dây: chỉ chặn đi xa hơn) |
| `SpringJoint2D` | Lò xo: `distance`, `autoConfigureDistance`, `frequency` (Hz, 0 = cứng), `dampingRatio` |
| `FixedJoint2D` | Gắn cứng hai body; `frequency`, `dampingRatio` để hơi mềm |
| `SliderJoint2D` | Trượt theo một hướng: `angle` (độ, local), `autoConfigureAngle`, `useMotor` + `motor`, `useLimits` + `limits` (Lower / Upper Translation) |
| `WheelJoint2D` | Bánh xe: `suspension` (`dampingRatio`, `frequency`, `angle`), `useMotor` + `motor`. Đặt trên thân xe: `motorSpeed` dương → bánh quay theo chiều kim đồng hồ → xe chạy sang phải |
| `TargetJoint2D` | Kéo `anchor` về điểm `target` (world), ví dụ kéo vật theo chuột: `maxForce`, `frequency`, `dampingRatio`, `autoConfigureTarget` |
| `RelativeJoint2D` | Giữ độ lệch giữa hai body: `linearOffset`, `angularOffset`, `autoConfigureOffset`, `maxForce`, `maxTorque`, `correctionScale` |
| `FrictionJoint2D` | Ma sát giữa hai body (top-down): `maxForce`, `maxTorque` |

Trạng thái: `jointAngle`, `jointSpeed`, `jointTranslation`, `limitState` (`Inactive`, `LowerLimit`, `UpperLimit`, `EqualLimits`).

## Joint 3D

Ngoài `anchor`, joint 3D có `axis` (trục chính, local).

| Component | Field chính |
|---|---|
| `FixedJoint` | Gắn cứng hai body |
| `HingeJoint` | Bản lề quanh `axis`: `useSpring` + `spring` (`spring`, `damper`, `targetPosition` độ), `useMotor` + `motor` (`targetVelocity` độ/giây, `force`, `freeSpin`), `useLimits` + `limits` (`min`, `max`). Đọc `angle`, `velocity` |
| `SpringJoint` | Lò xo: `spring`, `damper`, `minDistance`, `maxDistance` |
| `CharacterJoint` | Khớp ragdoll: `swingAxis`, twist (`lowTwistLimit`, `highTwistLimit`), swing (`swing1Limit`, `swing2Limit`) |
| `ConfigurableJoint` | `secondaryAxis`; `xMotion` / `yMotion` / `zMotion` / `angularXMotion` / `angularYMotion` / `angularZMotion` = `Locked` / `Limited` / `Free`; giới hạn `linearLimit`, `lowAngularXLimit`, `highAngularXLimit`, `angularYLimit`, `angularZLimit`; drive (`xDrive`… với `positionSpring`, `positionDamper`, `maximumForce`), `targetPosition`, `targetVelocity`, `targetRotation`, `targetAngularVelocity` |

## Effector 2D

Effector tác động qua **collider trên chính object đó** có tick **Used By Effector** (field `usedByEffector` của Collider 2D):

- `AreaEffector2D`, `PointEffector2D`, `BuoyancyEffector2D` cần collider **trigger**.
- `SurfaceEffector2D`, `PlatformEffector2D` cần collider thường.

Mọi effector có `useColliderMask` + `colliderMask` để chỉ tác động lên một số layer.

| Component | Dùng cho | Field chính |
|---|---|---|
| `AreaEffector2D` | Gió, vùng đẩy | `forceAngle` (độ, 0 = phải, 90 = lên), `useGlobalAngle`, `forceMagnitude`, `forceVariation`, `forceTarget` (`Rigidbody` / `Collider`), `drag`, `angularDrag` |
| `PointEffector2D` | Hút / đẩy quanh một điểm | `forceMagnitude` (dương = đẩy, âm = hút), `forceMode` (`Constant`, `InverseLinear`, `InverseSquared`), `distanceScale`, `forceSource`, `forceTarget`, `drag`, `angularDrag` |
| `BuoyancyEffector2D` | Nước | `surfaceLevel`, `density` (vật đặc hơn thì chìm), `linearDrag`, `angularDrag`, dòng chảy `flowAngle` / `flowMagnitude` / `flowVariation` |
| `SurfaceEffector2D` | Băng chuyền | `speed` (dương = sang phải), `speedVariation`, `forceScale`, `useContactForce`, `useFriction`, `useBounce` |
| `PlatformEffector2D` | Platform một chiều (nhảy xuyên từ dưới lên) | `useOneWay`, `rotationalOffset` (180 = cứng từ phía dưới), `useSideFriction`, `useSideBounce` |

## ConstantForce / ConstantForce2D

Lực đẩy liên tục mỗi bước vật lý: `force` (world), `relativeForce` (local), `torque` (3D: `torque` + `relativeTorque`). Cần Rigidbody / Rigidbody2D trên cùng object.

## CharacterController

Di chuyển có va chạm **không cần Rigidbody** (như `CharacterController` của Unity): một capsule đứng, trượt dọc tường, leo dốc tới `slopeLimit`, bước lên bậc tới `stepOffset`.

| Field | Mặc định | Ý nghĩa |
|---|---|---|
| Slope Limit | `45` | Dốc tối đa đi lên được (độ) |
| Step Offset | `0.3` | Bậc cao nhất tự bước lên |
| Skin Width | `0.08` | Khoảng hở giữa capsule và collider khác |
| Min Move Distance | `0.001` | Di chuyển ngắn hơn bị bỏ qua |
| Radius / Height | `0.5` / `2` | Kích thước capsule (kéo trong Scene view bằng nút **Edit Collider**, xem [Edit Collider](../editor/scene-view.md#edit-collider)) |
| Center, Is Trigger… | | Như các collider khác |

```ts
import { CharacterController, ForceMode, Input, MonoBehaviour, Vector3, type ControllerColliderHit } from '@pia/core';

export class Walker extends MonoBehaviour {
  speed = 5;
  private _cc: CharacterController | null = null;

  start() {
    this._cc = this.getComponent(CharacterController);
  }

  update() {
    const dir = new Vector3(Input.getAxis('Horizontal'), 0, -Input.getAxis('Vertical'));
    this._cc?.simpleMove(dir.mul(this.speed));        // tốc độ (unit/giây), tự có trọng lực
    // hoặc: this._cc.move(motion) với motion đã nhân Time.deltaTime, trả về collisionFlags
  }

  onControllerColliderHit(hit: ControllerColliderHit) {
    // CharacterController không tự đẩy Rigidbody: tự đẩy ở đây
    hit.rigidbody?.addForce(hit.moveDirection.mul(2), ForceMode.Impulse);
  }
}
```

- `move(motion)` (world, đã nhân `deltaTime`) trả về `collisionFlags` (`Sides`, `Above`, `Below`); `simpleMove(speed)` bỏ qua Y, tự áp trọng lực, trả về `isGrounded`.
- `isGrounded`, `velocity`, `collisionFlags` của lần `move` gần nhất.
- `onControllerColliderHit(hit)`: `hit.collider`, `gameObject`, `rigidbody`, `point`, `normal`, `moveDirection`, `moveLength`. Ví dụ đầy đủ: `CharacterWalker.ts` của Demo3D.

## addForce

`addForce` với `ForceMode.Force` / `Acceleration` được **cộng dồn và áp dụng ở bước vật lý kế tiếp** như Unity; gọi trong `awake` / `start` cũng có tác dụng ngay ở bước đầu.

## Ví dụ

- Demo2D `Assets/Scenes/Joints2D.scene.json`: cầu treo, xe `WheelJoint2D`, dây đứt, lò xo, thang trượt, băng chuyền → quạt → platform một chiều, hồ nước, kéo vật bằng chuột.
- Demo3D `Assets/Scenes/Joints.scene.json`: cửa bản lề tự đóng + CharacterController, con lắc xích, lò xo, cối xay gió có motor, kệ gãy, ConfigurableJoint, ConstantForce.

## Chưa hỗ trợ

- PhysicsMaterial asset, MeshCollider / WheelCollider, Polygon / Edge / Composite Collider 2D.
- Platform một chiều luôn "cứng từ phía trên": chưa dùng `surfaceArc`, `sideArc`, `useOneWayGrouping`.
