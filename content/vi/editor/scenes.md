---
title: Scene & pipeline 2D/3D
description: Scene Settings, chọn render pipeline cho từng scene, trộn 2D và 3D trong một project.
---

# Scene & pipeline 2D/3D

Scene là file `*.scene.json` trong `Assets/`. Tạo bằng **Project → Create → Scene** hoặc **File → New Scene**, mở bằng double-click.

## Scene Settings

Click tên scene ở đầu Hierarchy để mở **Scene Settings** trong Inspector:

| Thiết lập | Ý nghĩa |
|---|---|
| Render Pipeline | `2D (PixiJS)` hoặc `3D (three.js)` — render pipeline của scene này. |
| Ambient Intensity | Cường độ ánh sáng môi trường / phản chiếu của bầu trời (chỉ scene 3D, 0..3). |
| Fog, Fog Color, Fog Start, Fog End | Sương mù tuyến tính (chỉ scene 3D). |

## Hai pipeline

| | `2D (PixiJS)` | `3D (three.js)` |
|---|---|---|
| Vẽ được | Sprite, TextRenderer, UI, Particle System | Mesh, model, ánh sáng, bóng đổ, fog, **và cả** SpriteRenderer, TextRenderer, Particle System |
| Vật lý | 2D | 3D và 2D |
| Hợp với | Game 2D thuần, nhẹ | Game 3D, 2.5D, sprite trong thế giới 3D |

`dimension` trong `pia.project.json` chỉ là **mặc định** cho scene mới và chế độ Scene view (giống chọn template 2D/3D của Unity).

## Trộn 2D và 3D

- **Mỗi scene một pipeline**: ví dụ menu 2D rồi vào màn chơi 3D — hai scene, chuyển bằng `SceneManager.loadScene` (xem [SceneManager](../scripting/scene-manager.md)).
- **Trong một scene 3D**: xếp nhiều camera (Clear Flags = `Depth Only` + Culling Mask theo layer) để vẽ lớp 2D đè lên lớp 3D. Xem [Camera](../components/camera.md).

Bản build chỉ kèm pipeline mà các scene trong Build Settings dùng: game chỉ có scene 2D sẽ không kèm three.js.

::: note Chưa hỗ trợ
Shader 2D tự viết (sprite shader) chưa dùng được cho sprite trong scene 3D.
:::
