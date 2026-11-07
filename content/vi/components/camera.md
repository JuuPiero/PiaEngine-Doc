---
title: Camera
description: Component Camera, chiếu perspective / orthographic, xếp nhiều camera và đổi toạ độ màn hình.
---

# Camera

Vẽ scene cho Game view (`UnityEngine.Camera`). Camera nhìn theo trục **-Z cục bộ**. **Add Component → Rendering → Camera**.

| Thuộc tính | Field | Mặc định | Mô tả |
|---|---|---|---|
| Clear Flags | `clearFlags` | `Skybox` | `Skybox`, `Solid Color`, `Depth Only` (vẽ đè lên camera có depth thấp hơn), `Don't Clear` |
| Background | `backgroundColor` | xanh | Màu nền khi `Solid Color` |
| Culling Mask | `cullingMask` | Everything | Layer mà camera vẽ |
| Projection | `projection` | `Perspective` | `Perspective` / `Orthographic` |
| Field of View | `fieldOfView` | `60` | Góc nhìn dọc (độ), khi Perspective |
| Size | `orthographicSize` | `5` | Nửa chiều cao khung nhìn (unit), khi Orthographic |
| Clipping Near / Far | `nearClipPlane`, `farClipPlane` | `0.3`, `1000` | |
| Depth | `depth` | `0` | Thứ tự vẽ: camera depth cao vẽ sau (đè lên) |

## Main camera

`Camera.main` = camera đang bật có tag **MainCamera** trong scene đang chạy. Nếu không có camera nào mang tag này thì `Camera.main` là camera có depth cao nhất. Project mới đã có **Main Camera** với tag MainCamera.

## API

```ts
const cam = Camera.main!;
cam.orthographic = true;
cam.aspect; cam.pixelWidth; cam.pixelHeight;

cam.screenToWorldPoint(new Vector3(px, py, distance));  // pixel (gốc dưới-trái) → thế giới
cam.worldToScreenPoint(worldPos);
cam.viewportToWorldPoint(new Vector3(0.5, 0.5, 10));     // viewport 0..1
cam.worldToViewportPoint(worldPos);
const ray = cam.screenPointToRay(Input.mousePosition);   // { origin, direction }
const hit = Physics.raycast(ray.origin, ray.direction);
```

## Xếp nhiều camera

Như Unity built-in pipeline: mọi camera đang bật được vẽ theo **depth** tăng dần. Camera thứ hai đặt **Clear Flags = Depth Only** và **Culling Mask** chỉ chứa layer của nó để vẽ đè lên camera trước — ví dụ lớp sprite 2D trên nền 3D, hoặc vũ khí góc nhìn thứ nhất.

## Camera bám theo

```ts Assets/Scripts/CameraFollow.ts
import { GameObject, MonoBehaviour, Time, Vector3, field } from '@pia/core';

/** Smoothly follows a target from a fixed offset. Drag the Player onto "Target" in the Inspector. */
export class CameraFollow extends MonoBehaviour {
  @field('gameObject')
  target: GameObject | null = null;

  offset = new Vector3(0, 4, 9);
  smoothing = 4;

  lateUpdate() {
    if (!this.target) return;
    const goal = this.target.transform.position.add(this.offset);
    this.transform.position = Vector3.lerp(this.transform.position, goal, this.smoothing * Time.deltaTime);
    this.transform.lookAt(this.target.transform.position.add(new Vector3(0, 0.5, 0)));
  }
}
```

::: note
Camera thông minh kiểu Cinemachine (virtual camera, blend, dead zone, noise, impulse, confiner): dùng package [Cinemachine](../official/cinemachine.md).
:::
