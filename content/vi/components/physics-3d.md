---
title: Vật lý 3D
description: Rigidbody, Box / Sphere / Capsule / Mesh / Wheel Collider, Physics Material, callback va chạm và Physics.raycast / overlap.
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
| Automatic Center Of Mass | `automaticCenterOfMass` | `true` | Trọng tâm tính từ collider; tắt thì dùng **Center Of Mass** (`customCenterOfMass`) |
| Automatic Tensor | `automaticInertiaTensor` | `true` | Quán tính tính từ collider; tắt thì dùng **Inertia Tensor** / **Inertia Tensor Rotation** |
| Use Gravity | `useGravity` | `true` | |
| Is Kinematic | `isKinematic` | `false` | Chỉ di chuyển bằng script (`movePosition` / transform), đẩy được vật dynamic |
| Interpolate | `interpolation` | `None` | `Interpolate`: Transform hiện vị trí nội suy giữa 2 bước vật lý (mượt, trễ 1 bước); `Extrapolate`: đoán theo vận tốc |
| Collision Detection | `collisionDetectionMode` | `Discrete` | Discrete / Continuous / ContinuousDynamic / ContinuousSpeculative |
| Freeze Position | `freezePosition` | `[false, false, false]` | Khoá vị trí theo X/Y/Z |
| Freeze Rotation | `freezeRotation` | `[false, false, false]` | Khoá xoay theo X/Y/Z; gán `true` / `false` = cả 3 trục (như Unity) |

```ts
const rb = this.getComponent(Rigidbody)!;
rb.velocity = new Vector3(0, 5, 0);
rb.angularVelocity;
rb.addForce(new Vector3(0, 10, 0), ForceMode.Impulse);   // Force | Acceleration | Impulse | VelocityChange
// Force / Acceleration được cộng dồn và áp ở bước vật lý kế tiếp (như Unity), gọi trong awake / start cũng được
rb.addRelativeForce(Vector3.forward);
rb.addTorque(new Vector3(0, 1, 0));
rb.movePosition(target);  rb.moveRotation(q);            // cho vật kinematic
rb.move(target, q);                                       // cả hai (Unity 2022: Rigidbody.Move)
rb.sleep(); rb.wakeUp(); rb.isSleeping();

// thêm (như Unity)
rb.addForce(0, 10, 0, ForceMode.Impulse);                 // dạng x, y, z
rb.addRelativeTorque(new Vector3(0, 1, 0));
rb.addForceAtPosition(force, worldPoint);                 // đẩy lệch tâm → vừa đẩy vừa xoay
rb.addExplosionForce(500, center, 5, 0.5);                // giảm dần tới bán kính 5, nâng lên một chút
rb.getPointVelocity(worldPoint);                          // vận tốc một điểm trên vật
rb.linearVelocity; rb.linearDamping; rb.angularDamping;   // tên Unity 6
rb.constraints = RigidbodyConstraints.FreezeRotation;     // = các ô Freeze
rb.centerOfMass = new Vector3(0, -0.4, 0);                // trọng tâm thấp (xe khó lật); resetCenterOfMass()
rb.worldCenterOfMass; rb.inertiaTensor; rb.inertiaTensorRotation;
rb.maxAngularVelocity = 7;                                // rad/s (mặc định 50)
rb.maxLinearVelocity; rb.sleepThreshold; rb.detectCollisions = false; rb.solverIterations = 10;
rb.setDensity(1000);                                      // khối lượng = mật độ × thể tích collider
rb.closestPointOnBounds(p); rb.attachedColliders();
```

Center Of Mass tự đặt: Rapier dời trọng tâm thật; cannon-es và Bullet giữ trọng tâm ở gốc object. Inertia Tensor tự đặt: cả ba engine. Interpolate chạy với mọi engine.

## Collider

Collider không có Rigidbody (trên chính nó hoặc cha) là **collider tĩnh**. Một object có thể có nhiều collider.

| Thuộc tính chung | Field | Mặc định | Mô tả |
|---|---|---|---|
| Is Trigger | `isTrigger` | `false` | Chỉ báo `onTrigger…`, không va chạm |
| Material | `sharedMaterial` | none | Asset **Physics Material** (xem bên dưới); không có thì dùng Friction / Bounciness |
| Friction | `friction` | `0.6` | Ma sát 0..1 |
| Bounciness | `bounciness` | `0` | Độ nảy 0..1 |
| Center | `center` | `(0, 0, 0)` | Lệch tâm |

| Component | Thuộc tính riêng |
|---|---|
| `BoxCollider` | `size` (mặc định 1, 1, 1) |
| `SphereCollider` | `radius` (0.5) |
| `CapsuleCollider` | `radius` (0.5), `height` (2), `direction` (`X-Axis` / `Y-Axis` / `Z-Axis`) |
| `MeshCollider` | `sharedMesh` (trống = mesh của Mesh Filter), `convex` |
| `WheelCollider` | bánh xe: xem [Wheel Collider](#wheel-collider) |

`collider.attachedRigidbody` trả về Rigidbody gắn với collider. Mọi collider 3D có `bounds` (`Bounds`: center, extents, size, min, max, contains, intersects, encapsulate, closestPoint...), `closestPoint(p)`, `closestPointOnBounds(p)`, `raycast(origin, dir, maxDistance)` (chỉ với collider đó).

### Mesh Collider

Va chạm theo hình mesh: primitive (Cube, Sphere, Capsule, Cylinder, Plane, Quad) hoặc mesh của model đã import. Không bật **Convex** thì dùng đúng từng tam giác, chỉ cho vật tĩnh hoặc kinematic (mặt đất, địa hình, tường cong). Bật **Convex** thì dùng bao lồi, bắt buộc cho trigger và cho Rigidbody có mô phỏng; không bật mà gắn vào Rigidbody động thì engine tự dùng bao lồi và cảnh báo (Unity cũng yêu cầu Convex).

| Engine | Mesh Collider |
|---|---|
| Rapier | tam giác thật / bao lồi |
| Bullet | `btBvhTriangleMeshShape` / `btConvexHullShape` |
| cannon-es | bao lồi (`ConvexPolyhedron`); không convex: mỗi tam giác thành một lăng trụ mỏng |
| builtin | xấp xỉ bằng hộp bao |

### Wheel Collider

Bánh xe như Unity: tia + giảm xóc + mô hình lốp. Đặt trên object **con** của xe (xe có `Rigidbody`, bánh không có). Chạy được với mọi engine có mô phỏng (Rapier, cannon-es, Bullet), vì nó chỉ dùng raycast và `addForceAtPosition`; tia bỏ qua collider của chính xe.

| Thuộc tính | Field | Mặc định | Mô tả |
|---|---|---|---|
| Center | `center` | `(0, 0, 0)` | Tâm bánh khi giảm xóc nén hết |
| Mass | `mass` | `20` | Khối lượng bánh (quán tính quay = ½ m r²) |
| Radius | `radius` | `0.5` | |
| Wheel Damping Rate | `wheelDampingRate` | `0.25` | Làm chậm vòng quay |
| Suspension Distance | `suspensionDistance` | `0.3` | Hành trình giảm xóc (dãn xuống theo −up) |
| Force App Point Distance | `forceAppPointDistance` | `0` | Điểm đặt lực lốp, cao hơn điểm chạm (tăng để xe bớt nghiêng khi vào cua) |
| Suspension Spring | `suspensionSpring` | `35000, 4500, 0.5` | spring (N/m), damper, target position (0 = nén hết, 1 = dãn hết) |
| Forward / Sideways Friction | `forwardFriction` / `sidewaysFriction` | như Unity | đường cong ma sát: extremum slip / value, asymptote slip / value, stiffness |

```ts Assets/Scripts/CarController.ts
export class CarController extends MonoBehaviour {
  @field({ type: 'component', componentType: WheelCollider }) frontLeft: WheelCollider | null = null;
  @field({ type: 'component', componentType: WheelCollider }) frontRight: WheelCollider | null = null;
  @field({ type: 'component', componentType: WheelCollider }) rearLeft: WheelCollider | null = null;
  @field({ type: 'component', componentType: WheelCollider }) rearRight: WheelCollider | null = null;
  motor = 800;
  brake = 3000;
  steer = 30;

  fixedUpdate() {
    const v = Input.getAxis('Vertical'), h = Input.getAxis('Horizontal');
    for (const w of [this.rearLeft, this.rearRight]) if (w) w.motorTorque = v * this.motor;
    for (const w of [this.frontLeft, this.frontRight]) if (w) w.steerAngle = h * this.steer; // dương = rẽ phải
    const braking = Input.getKey(KeyCode.Space) ? this.brake : 0;
    for (const w of [this.frontLeft, this.frontRight, this.rearLeft, this.rearRight]) if (w) w.brakeTorque = braking;
  }
}
```

Hiện bánh xe: mỗi frame đặt mesh bánh theo `wheel.getWorldPose()` → `{ position, rotation }` (đã gồm giảm xóc, góc lái, vòng quay). Thông tin khác: `isGrounded`, `rpm`, `rotationSpeed`, `sprungMass`, `getGroundHit()` → `WheelHit` (`point`, `normal`, `forwardDir`, `sidewaysDir`, `force`, `forwardSlip`, `sidewaysSlip`, `collider`), `configureVehicleSubsteps(speedThreshold, below, above)`. Bánh được mô phỏng ngay trước mỗi bước vật lý, sau mọi `fixedUpdate` (như Unity), nên đặt `motorTorque` trong `fixedUpdate` hay `update` đều được.

### Physics Material

Asset **Project ▸ Create ▸ Physics Material**, gán vào ô **Material** của collider.

| Thuộc tính | Field | Mặc định |
|---|---|---|
| Dynamic Friction | `dynamicFriction` | `0.6` |
| Static Friction | `staticFriction` | `0.6` (Rapier / cannon / Bullet dùng một hệ số: dynamic) |
| Bounciness | `bounciness` | `0` |
| Friction Combine / Bounce Combine | `frictionCombine` / `bounceCombine` | `Average` — `Average`, `Minimum`, `Multiply`, `Maximum`; hai collider khác chế độ thì chế độ "cao" hơn thắng (như PhysX) |

```ts
const ice = new PhysicsMaterial('Ice');
ice.dynamicFriction = ice.staticFriction = 0.02;
ice.frictionCombine = 'Minimum';
this.getComponent(BoxCollider)!.sharedMaterial = ice;
```

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
