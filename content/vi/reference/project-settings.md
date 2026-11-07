---
title: pia.project.json
description: Các trường của file cài đặt project và nơi chỉnh chúng trong editor.
---

# pia.project.json

File cài đặt của project, ở thư mục gốc project. Phần lớn chỉnh qua **Edit → Project Settings** và **File → Build Settings**.

```json pia.project.json
{
  "name": "Demo 2D",
  "dimension": "2d",
  "companyName": "DefaultCompany",
  "version": "0.1.0",
  "scenes": [
    "Assets/Scenes/Main.scene.json",
    "Assets/Scenes/Platformer.scene.json"
  ]
}
```

| Trường | Chỉnh ở | Ý nghĩa |
|---|---|---|
| `name` | Project Settings → Product Name | Tên game |
| `dimension` | Project Settings → Default Mode | `2d` / `3d`: pipeline của scene mới và chế độ Scene view mặc định |
| `companyName`, `version` | Project Settings | |
| `scenes` | Build Settings | Scene trong build theo thứ tự; index 0 chạy đầu tiên |
| `tags` | Project Settings → Tags | Tag tự thêm (tag có sẵn luôn có) |
| `layers` | Project Settings → Layers | Tên layer theo index 0..31 |
| `physics.gravity` | Project Settings → Gravity 3D (y) | `[x, y, z]`, mặc định `[0, -9.81, 0]` |
| `physics.gravity2D` | Project Settings → Gravity 2D (y) | `[x, y]`, mặc định `[0, -9.81]` |
| `physics.backend3d` / `physics.backend2d` | Project Settings → 3D / 2D Physics Engine | `builtin` (chỉ phát hiện va chạm, ~12 KB) hoặc `rapier` (mặc định). Xem [Chọn engine vật lý](../components/physics-engine.md) |
| `time.fixedTimestep` | Project Settings → Fixed Timestep | Bước `fixedUpdate` (mặc định 0.02) |
| `build.target` | Build Settings → Platform | Platform đang chọn (`web` hoặc id của package) |
| `build.targets[id]` | Build Settings (form của platform) | Option của từng platform package |
| `build.include` | Sửa tay | Asset / script / package luôn đưa vào build |
| `build.stripUnused` | Sửa tay | `false` = không lọc, đưa mọi thứ vào build |

Tag có sẵn: `Untagged`, `Respawn`, `Finish`, `EditorOnly`, `MainCamera`, `Player`, `GameController`. Layer có sẵn: `Default`, `TransparentFX`, `Ignore Raycast`, `Water`, `UI`.

Xem thêm: [Build web](../build/build-web.md#ep-dua-vao-build), [Playable Ads](../build/playable-ads.md#build).
