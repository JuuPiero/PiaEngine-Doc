---
title: Scene view & tool
description: Điều hướng trong Scene view, các tool Q W E R T Y, snap và gizmo.
---

# Scene view & tool

## Tool biến đổi

| Phím | Tool | Ghi chú |
|---|---|---|
| <kbd>Q</kbd> | Hand | Kéo để pan view. |
| <kbd>W</kbd> | Move | Mũi tên theo trục + ô vuông kéo trên mặt phẳng. |
| <kbd>E</kbd> | Rotate | Vòng xoay theo trục. |
| <kbd>R</kbd> | Scale | Scale theo trục, ô giữa scale đều. |
| <kbd>T</kbd> | Rect | Dành cho 2D / UI: kéo 8 tay cầm để giãn (cạnh đối diện đứng yên; <kbd>Alt</kbd>: giãn từ tâm; <kbd>Shift</kbd>: giữ tỉ lệ), rê ra ngoài góc để xoay, kéo bên trong để di chuyển. Với SpriteRenderer Draw Mode `Sliced` / `Tiled`, Rect tool sửa **Size** thay vì scale. |
| <kbd>Y</kbd> | Transform | 2D: mũi tên di chuyển + vòng xoay + ô vuông giữa để scale đều. 3D: mũi tên di chuyển + vòng xoay. |

Các tool cũng có ở bảng tool góc trái Scene view và trên thanh công cụ. Hai nút **Pivot / Center** và **Local / Global** đổi vị trí và hướng của tay cầm, như Unity.

### Snap

Giữ <kbd>Ctrl</kbd> khi kéo gizmo:

| Tool | Bước snap |
|---|---|
| Move | 0.25 |
| Rotate | 15° |
| Scale | 0.1 |
| Rect | 0.05 |

## Điều hướng

| Thao tác | Phím / chuột |
|---|---|
| Bay (3D) | Giữ chuột phải + <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> / <kbd>Q</kbd><kbd>E</kbd>; <kbd>Shift</kbd> tăng tốc; lăn chuột đổi tốc độ |
| Orbit (3D) / pan (2D) | <kbd>Alt</kbd> + chuột trái |
| Pan | Chuột giữa |
| Zoom | Lăn chuột |
| Frame selected | <kbd>F</kbd> (hoặc double-click object trong Hierarchy) |
| Move To View / Align With View | <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F</kbd> / <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>F</kbd> |

## Thanh công cụ của Scene view

- **2D**: nhìn orthographic từ phía trước (mặc định với scene 2D).
- **Grid**: bật / tắt lưới.
- **Gizmos**: bật / tắt gizmo (camera, đèn, collider…).
- Huy hiệu pipeline (**2D** / **3D**): click để mở Scene Settings.

## Kéo-thả vào Scene

- Kéo **sprite / texture** từ Project vào Scene hoặc Hierarchy → tạo object có `SpriteRenderer`.
- Kéo **model** (`.glb/.gltf/.fbx/.obj`) → tạo cây GameObject của model (MeshRenderer / SkinnedMeshRenderer, Animator), liên kết với model như prefab. Kéo một **mesh** của model (bấm ▸ trên model) → object MeshFilter + MeshRenderer. Xem [Model 3D](../assets/models.md).
- Click vào một phần của model (hay prefab) chọn object gốc trước; click lần nữa chọn đúng phần đó.
- Kéo **prefab** → tạo instance của prefab.
- Kéo **script** lên object → gắn component.

## Xem trước hiệu ứng

Chọn một object có **Particle System** thì hiệu ứng tự chạy trong Scene view, kèm bảng **Particle Effect** (Pause / Restart, thời gian, số hạt). Xem [Particle System](../components/particle-system.md).

Chọn một object có **Line Renderer** thì các điểm của đường hiện thành chấm trắng: kéo để di chuyển, bấm vào một điểm để có mũi tên theo trục (<kbd>Esc</kbd> để thoát). Xem [Line Renderer & Trail Renderer](../components/line-trail-renderer.md).
