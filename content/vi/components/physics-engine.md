---
title: Chọn engine vật lý
description: Project Settings → Physics — chọn engine vật lý cho 3D / 2D (builtin siêu nhẹ, Rapier, cannon-es, Bullet, Box2D), như Physics Engine của Cocos Creator.
---

# Chọn engine vật lý

Giống **Cocos Creator** (Project Settings → Physics → Physics Engine), mỗi project chọn engine vật lý riêng cho **3D** và **2D**. Script không phải đổi gì: vẫn là `Rigidbody`, `BoxCollider`, `Physics.raycast`, `onTriggerEnter`... (tên Unity).

| Engine | Làm được gì | Dung lượng thêm vào build |
|---|---|---|
| **Rapier** (mặc định) | Mô phỏng đầy đủ: Rigidbody động (trọng lực, lực, va chạm đẩy nhau), [joint, effector 2D, CharacterController](physics-joints.md), continuous collision, contact point chính xác | ≈ 4.2 MB (3D), ≈ 3.3 MB (2D) |
| **cannon-es** (chỉ 3D) | Mô phỏng đầy đủ bằng JavaScript thuần: Rigidbody động, mọi joint (Configurable khóa / giới hạn / drive từng trục), `CharacterController` (trượt theo tường, `slopeLimit`, `stepOffset`), continuous collision (tia quét theo kích thước vật). Engine nhỏ nhất có mô phỏng | ≈ 122 KB (38 KB gzip) |
| **Bullet** (ammo.js, chỉ 3D) | Bullet Physics 2.82 (engine của nhiều game native) biên dịch sang JavaScript, không có file wasm riêng: Rigidbody động, mọi joint, `CharacterController`, continuous collision gốc của Bullet; ma sát / độ nảy lấy trung bình như Unity | ≈ 2.0 MB (450 KB gzip) |
| **Box2D** (planck.js, chỉ 2D) | Engine của Physics2D trong Unity: Rigidbody2D động, joint 2D, effector 2D, continuous collision | ≈ 235 KB (56 KB gzip) |
| **Builtin** | Chỉ **phát hiện va chạm**: collider, raycast / overlap, callback trigger / collision, EventSystem và `OnMouse*` | ≈ 12 KB |

## Cách chọn

**Edit → Project Settings… → Physics & Time**:

- **3D Physics Engine**: `Builtin`, `Rapier`, `cannon-es` hoặc `Bullet`; **2D Physics Engine**: `Builtin`, `Rapier` hoặc `Box2D`. Bên dưới mỗi ô là những gì project đang dùng (scene đang mở, các scene trong Build Settings, prefab đã nạp) và gợi ý engine nhỏ nhất chạy được.
- Nếu engine đã chọn thiếu tính năng mà scene dùng (vd. Rigidbody động hoặc joint với builtin), một dòng cảnh báo ⚠ hiện ngay dưới phần Physics.

Lưu vào `pia.project.json`:

```json pia.project.json
"physics": {
  "backend3d": "builtin",
  "backend2d": "rapier"
}
```

Project chưa chọn dùng **Rapier** (giữ nguyên hành vi cũ). Engine đã chọn được dùng ở cả **Play** trong editor lẫn bản build; script đọc engine đang chạy bằng `Physics.backend` / `Physics2D.backend`.

## Đổi engine giữa chừng

Cùng một scene chạy được trên mọi engine có mô phỏng (rơi, va chạm, trigger, joint, raycast, CharacterController, continuous collision được kiểm bằng cùng bộ kịch bản trên Rapier, cannon-es và Bullet), nhưng mỗi engine có solver riêng: độ nảy, xếp chồng, cảm giác joint hơi khác — chơi thử và chỉnh lại sau khi đổi.

## Collision Detection

`Rigidbody` có trường **Collision Detection** như Unity: `Discrete` (mặc định, chỉ xét vị trí sau mỗi bước — vật nhỏ bay rất nhanh có thể xuyên tường mỏng), `Continuous`, `ContinuousDynamic`, `ContinuousSpeculative` (quét cả quãng đường của bước). Rapier và Bullet dùng CCD gốc; cannon-es dùng một tia quét theo kích thước vật. Builtin không có.

## Khi nào dùng builtin

Game chỉ cần **chạm / click vào object** (`PhysicsRaycaster` / `Physics2DRaycaster` + `IPointerClickHandler`, `OnMouseDown`), **vùng trigger**, **raycast / overlap** — puzzle, idle, playable ads. Ví dụ một playable 3D (xe buýt, chỉ dùng `BoxCollider` + `PhysicsRaycaster`):

| | Rapier | Builtin |
|---|---|---|
| Build web | 5.90 MB (Rapier 4.17 MB) | 1.74 MB (engine 11.4 KB) |
| Playable HTML | 2.22 MB | 0.91 MB |

## Builtin hỗ trợ

- **Collider 3D**: `BoxCollider`, `SphereCollider`, `CapsuleCollider` (+ `CharacterController` như một capsule). **Collider 2D**: `BoxCollider2D`, `CircleCollider2D`, `CapsuleCollider2D`. Theo Transform (vị trí, xoay, scale), `center` / `offset`, `size`, `radius`, `height`, `direction`; `isTrigger`; collider con gắn vào Rigidbody của cha.
- **Layer**: mọi truy vấn nhận `layerMask`; `Physics.queriesHitTriggers` / `Physics2D.queriesHitTriggers`.
- **Truy vấn 3D**: `Physics.raycast`, `raycastAll`, `overlapSphere`, `overlapBox`, `checkSphere`, `checkBox`. **2D**: `Physics2D.raycast`, `raycastAll`, `overlapPoint`, `overlapPointAll`, `overlapCircle`, `overlapBox`. Kết quả (collider, `point`, `normal`, `distance`) giống Rapier; ray bắt đầu bên trong collider trả về khoảng cách 0.
- **Callback**: `onTriggerEnter/Stay/Exit` và `onCollisionEnter/Stay/Exit` (+ bản `2D`) khi hai collider chồng lên nhau và ít nhất một bên có Rigidbody (kinematic cũng được; Rigidbody2D Static thì không) hoặc là `CharacterController`. Hai collider tĩnh không báo. `Collision` có một contact point gần đúng.
- **Rigidbody / Rigidbody2D** như kinematic: di chuyển bằng Transform, `movePosition` / `moveRotation`, hoặc gán `velocity` / `angularVelocity` (engine cộng vào vị trí mỗi bước vật lý, không có trọng lực; tôn trọng `freezePosition` / `freezeRotation` / `freezeRotation` 2D).
- **EventSystem**: `PhysicsRaycaster`, `Physics2DRaycaster` và `OnMouseDown / Up / Enter / Exit...` chạy y như với Rapier.

## Builtin không có

Trọng lực, `addForce` / `addTorque` (bị bỏ qua, Console cảnh báo một lần), va chạm đẩy nhau, [joint, effector 2D, `ConstantForce`](physics-joints.md), `CharacterController.move` có va chạm (object chỉ dịch chuyển thẳng), continuous collision. Khác Rapier / Unity: object kinematic chạm collider thường cũng nhận `onCollision*`, và sự kiện đến sớm hơn một bước vật lý.

## Cảnh báo

Engine đã chọn không chạy được thứ scene dùng → không bao giờ âm thầm hỏng:

- **Play**: Console cảnh báo, vd. `Physics 3D backend 'builtin' doesn't support: Rigidbody dynamics ...` và `Builtin physics: 'Crate' has a non-kinematic Rigidbody ...`.
- **Project Settings**: dòng ⚠ dưới phần Physics.
- **Build**: báo cáo build in dòng `⚠` tương tự. Ngược lại, khi đang chọn Rapier mà game chỉ dùng collider / truy vấn, báo cáo gợi ý `ℹ Physics 3D: ... backend 'builtin' (≈ 12 KB) would do instead of 'rapier'`.

Báo cáo build cũng ghi engine đã đóng gói: `Physics 3D: builtin ✓ (11.4 KB) · Physics 2D: ✗`.

## So với Unity / Cocos

| Unity / Cocos | PiaEngine |
|---|---|
| Unity: luôn PhysX (3D) và Box2D (2D) | Rapier (mặc định) |
| Cocos: Physics Engine = builtin / cannon.js / bullet (ammo) / PhysX; 2D: builtin / Box2D | `physics.backend3d` = `builtin` / `rapier` / `cannon` / `bullet`; `backend2d` = `builtin` / `rapier` / `box2d` |
| Cocos builtin: chỉ phát hiện va chạm | Builtin: chỉ phát hiện va chạm, cùng API Unity |

Xem thêm: [Vật lý 3D](physics-3d.md), [Vật lý 2D](physics-2d.md), [pia.project.json](../reference/project-settings.md), [Build web](../build/build-web.md).
