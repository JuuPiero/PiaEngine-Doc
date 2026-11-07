---
title: Cinemachine
description: Package com.pia.cinemachine — virtual camera, blend, bám theo, orbit, noise, impulse, confiner cho 2D và 3D.
---

# Cinemachine (`com.pia.cinemachine`)

Camera thông minh cho game 2D và 3D, theo mô hình **Cinemachine 3** của Unity (cùng tên component và field, viết camelCase):

- Đặt nhiều **virtual camera** (`CinemachineCamera`) trong scene, mỗi cái một cách quay.
- **`CinemachineBrain`** trên Camera thật chọn camera có **Priority** cao nhất rồi **blend** mượt khi đổi camera.
- Bám theo nhân vật với **dead zone / soft zone / hard limits**, **lookahead**, damping.
- Quay quanh nhân vật bằng chuột / cảm ứng, góc qua vai (third person).
- **Rung camera**: noise liên tục và **impulse** (va chạm, nổ, nhặt đồ).
- **Giới hạn camera** trong màn chơi (confiner 2D / 3D).

## Cài đặt

```bash
cd MyGame
npm install ../PiaEngine/pia-packages/com.pia.cinemachine     # hoặc Window → Package Manager → Add package from disk
```

Demo2D và Demo3D đã cài sẵn. Package không kéo thêm module vật lý vào bản build: Rapier chỉ có mặt khi scene của bạn tự dùng vật lý.

## Bắt đầu nhanh

1. Chọn nhân vật trong Hierarchy.
2. **GameObject → Cinemachine** và chọn một mẫu:

| Mẫu | Gồm | Dùng cho |
|---|---|---|
| Cinemachine Camera | Chỉ `CinemachineCamera` | Camera đứng yên, tự đặt vị trí |
| 2D Camera (Position Composer) | `CinemachinePositionComposer` (bật dead zone + hard limits) | Game 2D, platformer |
| Follow Camera | `CinemachineFollow` + `CinemachineRotationComposer` | 3D, camera đi theo sau |
| FreeLook Camera (Orbital Follow) | `CinemachineOrbitalFollow` + `CinemachineRotationComposer` + `CinemachineInputAxisController` | 3D, kéo chuột / vuốt để quay quanh nhân vật |
| Third Person Aim Camera | `CinemachineThirdPersonFollow` | Góc qua vai, nhìn theo hướng nhân vật |

Khi tạo: object đang chọn thành **Tracking Target**; Main Camera được thêm `CinemachineBrain` nếu chưa có (hoặc **Tools → Cinemachine → Add Brain To Main Camera**); Lens lấy theo Main Camera. Từ đây Main Camera do Brain điều khiển, cả khi đang sửa scene.

## Thành phần

Các component đặt chung GameObject với `CinemachineCamera` (giống Unity):

| Nhóm | Component | Việc |
|---|---|---|
| Brain | `CinemachineBrain` (trên Camera) | Chọn camera live, blend, ghi vị trí / xoay / FOV / orthographic size / clip vào Camera |
| Virtual camera | `CinemachineCamera` | Priority, Tracking Target, Look At Target, Lens (FOV, Ortho Size, Near/Far, Dutch, Mode Override), Standby Update, Blend Hint |
| Position Control | `CinemachineFollow` | Giữ khoảng cách `followOffset` với target, damping theo trục, Binding Mode (World Space, Lock To Target With World Up, Lazy Follow…) |
| | `CinemachinePositionComposer` | **Chỉ dời camera, không xoay**: giữ target ở `screenPosition`, dead zone, soft zone, hard limits, damping, lookahead, camera distance |
| | `CinemachineOrbitalFollow` | Quỹ đạo Sphere (bán kính) hoặc ThreeRing (3 vòng top / center / bottom); trục `horizontalAxis` (độ), `verticalAxis`, `radialAxis` (hệ số khoảng cách); recentering |
| | `CinemachineThirdPersonFollow` | Shoulder offset, vertical arm, camera side, distance, damping, tránh vật cản (raycast) |
| Rotation Control | `CinemachineRotationComposer` | Xoay để giữ look-at target ở `screenPosition`, dead zone, soft zone, hard limits, damping, lookahead |
| | `CinemachineHardLookAt` | Luôn nhìn thẳng vào target |
| Noise | `CinemachineBasicMultiChannelPerlin` | Rung Perlin. Profile có sẵn: `6D Shake`, `Handheld_normal_mild`, `Handheld_normal_strong`, `Handheld_tele_mild`, `2D Shake`, `2D Handheld`, hoặc tự tạo bằng **Create → Cinemachine → Noise Settings**. Chỉnh `amplitudeGain`, `frequencyGain` |
| Extension | `CinemachineConfiner2D` | Giữ **cả khung hình** trong Box / Circle / Capsule Collider 2D |
| | `CinemachineConfiner3D` | Giữ vị trí camera trong Box / Sphere / Capsule Collider |
| | `CinemachineImpulseListener` | Nhận impulse và rung camera (gain, channel mask, 2D distance) |
| Impulse | `CinemachineImpulseSource` | Phát impulse từ code: `generateImpulse()` |
| | `CinemachineCollisionImpulseSource` | Tự phát khi va chạm / vào trigger (2D và 3D): lọc layer / tag, theo hướng va chạm, nhân theo tốc độ hoặc khối lượng, tốc độ tối thiểu |
| Input | `CinemachineInputAxisController` | Kéo chuột / một ngón tay → quay Orbital Follow, lăn chuột → zoom (radial axis), tuỳ chọn trục bàn phím |

**Toạ độ màn hình trong composer:** tính từ tâm — `0` là giữa, `-0.5` là mép trái / dưới, `0.5` là mép phải / trên. Kích thước dead zone / hard limits là phần của màn hình (`1` = cả màn).

- Target trong **dead zone**: camera đứng yên.
- Target ở **soft zone** (giữa dead zone và hard limits): camera đuổi theo, có damping.
- Target **không bao giờ ra khỏi hard limits**.

## Game 2D (platformer)

```text
Main Camera        Camera (Orthographic) + CinemachineBrain
CM Player Camera   CinemachineCamera (Tracking Target = Player, Lens Ortho Size = 6)
                   CinemachinePositionComposer
                     Composition: Screen Position (0, -0.12), Dead Zone (0.16, 0.22), Hard Limits (0.7, 0.76)
                     Damping (0.7, 0.45, 0), Lookahead: Time 0.35, Ignore Y
                   CinemachineConfiner2D (Bounding Shape 2D = Camera Bounds)
                   CinemachineImpulseListener (Use 2D Distance)
Camera Bounds      BoxCollider2D (tắt component: vật lý bỏ qua, confiner vẫn đọc hình)
Player             CinemachineCollisionImpulseSource (rung khi tiếp đất mạnh)
```

- Pipeline 2D (PixiJS) không xoay camera, nên camera 2D chỉ dùng Position Control.
- Noise cho 2D dùng profile `2D Shake` / `2D Handheld` (chỉ dời vị trí). Impulse vẫn rung bình thường.

## Blend

- **Default Blend** của Brain: `Cut`, `EaseInOut`, `EaseIn`, `EaseOut`, `HardIn`, `HardOut`, `Linear` + thời gian (giây). Mặc định `EaseInOut`, 2 giây.
- **Custom Blends**: danh sách `from` → `to` theo **tên GameObject** của camera; `**ANY CAMERA**` là mọi camera. Ưu tiên: đúng cặp, rồi `ANY → to`, rồi `from → ANY`, cuối cùng là default.
- Đổi camera giữa lúc đang blend thì blend mới đi tiếp từ trạng thái hiện tại, không bị giật.
- Khi hai camera cùng nhìn một target, Brain giữ target trên màn hình suốt quá trình blend.

| Blend Hint (trên camera) | Tác dụng |
|---|---|
| `SphericalPosition` / `CylindricalPosition` | Camera đi vòng quanh target thay vì đi thẳng |
| `InheritPosition` | Camera mới bắt đầu từ vị trí camera cũ (Orbital Follow tự tính lại góc) |
| `IgnoreTarget` | Blend vị trí / xoay thuần, không giữ target |

## Code

```ts
import { CinemachineBrain, CinemachineCamera, CinemachineImpulseSource, CinemachineOrbitalFollow } from 'com.pia.cinemachine';

// đổi camera: priority cao nhất thắng (bằng nhau: camera prioritize() / bật gần nhất thắng)
closeUpCam.priority = 20;
closeUpCam.prioritize();
vcam.enabled = false;                       // tắt camera live → Brain blend sang camera kế tiếp

// target
vcam.follow = player.transform;             // Tracking Target
vcam.lookAt = boss.transform;               // Look At Target
vcam.lens.fieldOfView = 40;                 // lens cũng được blend

// rung
this.getComponent(CinemachineImpulseSource)!.generateImpulse();       // Default Velocity
source.generateImpulse(2);                                            // × 2
source.generateImpulseAt(hitPoint, new Vector3(0, -0.5, 0));          // vị trí + hướng / độ mạnh

// orbit từ code
const orbit = vcam.getComponent(CinemachineOrbitalFollow)!;
orbit.horizontalAxis.value = 90;

// Brain
const brain = Camera.main!.getComponent(CinemachineBrain)!;
brain.activeVirtualCamera; brain.isBlending; brain.activeBlend?.description;
brain.cameraActivatedEvent.addListener((incoming, outgoing) => Debug.log(`${outgoing?.name} → ${incoming.name}`));
brain.cameraCutEvent.addListener(() => { /* đổi camera không blend */ });

// dịch chuyển tức thời (respawn): báo để damping không quét ngang màn chơi
vcam.onTargetObjectWarped(player.transform, delta);
vcam.forceCameraPosition(pos, rot);
```

- Brain cập nhật trong `lateUpdate` (Update Method: `LateUpdate`, `FixedUpdate`, hoặc `ManualUpdate` + gọi `brain.manualUpdate()`).
- **Ignore Time Scale**: camera vẫn chạy khi `Time.timeScale = 0`.
- Tự viết stage / extension: kế thừa `CinemachineComponentBase` / `CinemachineExtension` từ `'com.pia.cinemachine/Runtime/core'`.

## Trong editor

- **Xem trước ở Edit Mode**: Brain điều khiển Main Camera cả khi không chạy game (không damping), nên Game view luôn hiện đúng camera live; kéo target trong Scene view là khung hình đổi theo. Giống Unity, transform của Main Camera do Brain ghi và được lưu cùng scene. Bật / tắt: **Tools → Cinemachine → Toggle Edit Mode Preview**.
- **Guides trên Game view**: chọn camera live có Position / Rotation Composer thì Game view hiện vùng **xanh** (soft zone), **đỏ** (ngoài hard limits), ô trong suốt (dead zone), dấu **+** (Screen Position) và chấm **vàng** (điểm đang bám). Bật / tắt: **Tools → Cinemachine → Toggle Game View Guides**.

## Ví dụ

- **Demo2D** `Assets/Scenes/Platformer Cinemachine.scene.json`: Position Composer với dead zone + lookahead, Confiner 2D theo `Camera Bounds`; rung khi nhặt sao (`Assets/Scripts/Cinemachine/ShakeOnPickup.ts` gọi `generateImpulse`) và khi tiếp đất mạnh; giữ <kbd>Z</kbd> để blend sang camera toàn cảnh (`HoldToZoomOut.ts` đổi priority).
- **Demo3D** `Assets/Scenes/Showcase Cinemachine.scene.json`, nhấn <kbd>C</kbd> để đổi camera (`CameraSwitcher.ts`): Follow (+ Rotation Composer + Confiner 3D), Orbit (kéo chuột quay, lăn chuột zoom, noise handheld, blend hint Spherical), Overview (Hard Look At).

Hai scene chưa nằm trong Build Settings: thêm vào **File → Build Settings** nếu muốn build.

## Khác Unity

- Forward của PiaEngine là **-Z**, nên camera đứng sau nhân vật có offset Z **dương** (ví dụ `followOffset = (0, 5, 9)`).
- Blender Settings là danh sách `customBlends` ngay trên Brain, không phải asset riêng.
- Impulse channel là bit mask số nguyên (mặc định 1).
- Confiner 2D dùng hình bao chữ nhật của collider, chưa hỗ trợ polygon.

## Chưa hỗ trợ

Smart Update, nhiều Brain / output channel, Solo; Target Group / Group Framing, Pan Tilt, Spline Dolly, Deoccluder / Decollider, FreeLook Modifier; secondary reaction noise của Impulse Listener, impulse dạng Custom / Legacy; gizmo trong Scene view.
