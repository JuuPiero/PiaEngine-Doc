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

## Edit Collider

Như Unity: Inspector của **Box Collider**, **Sphere Collider**, **Capsule Collider**, **Character Controller**, **Box Collider 2D**, **Circle Collider 2D** và **Capsule Collider 2D** có dòng **Edit Collider** với một nút (icon khung có chấm). Bấm nút → collider hiện các chấm vuông xanh trong Scene view (2D lẫn 3D) và transform tool tạm ẩn. Kéo chấm để đổi kích thước collider ngay trên scene:

| Collider | Chấm | Kéo thì |
|---|---|---|
| Box Collider | 6 chấm giữa 6 mặt | mặt đó đi dọc pháp tuyến, **mặt đối diện đứng yên** → `size` và `center` cùng đổi |
| Box Collider 2D | 4 chấm giữa 4 cạnh + 4 chấm tròn ở góc | cạnh như trên (`size` + `offset`); chấm góc kéo hai cạnh một lúc |
| Sphere Collider / Circle Collider 2D | 6 / 4 chấm trên mặt cầu / đường tròn | `radius`, tâm đứng yên |
| Capsule Collider (theo `direction`) / Character Controller (luôn đứng thẳng) | 4 chấm bán kính quanh thân + 2 chấm ở hai đầu | chấm đầu: `height`, đầu kia đứng yên (`center` dời theo); chấm thân: `radius` |
| Capsule Collider 2D | 4 chấm trên khung bao (theo hướng xoay của object) | `size` + `offset` như Box Collider 2D |

| Phím khi kéo | Tác dụng |
|---|---|
| <kbd>Alt</kbd> (bấm **sau khi** đã nhấn chuột — <kbd>Alt</kbd> + chuột trái trước là orbit / pan) | Đổi cân hai bên, tâm đứng yên. Nhả <kbd>Alt</kbd> giữa chừng là quay lại kiểu một bên. |
| <kbd>Ctrl</kbd> | Snap quãng kéo theo bước 0.25 (như Move tool) |
| <kbd>Esc</kbd> | Thoát chế độ Edit Collider |

- Chấm đổi vàng khi rê chuột tới; chấm ở mặt quay lưng về camera mờ hơn. Khi kéo có nhãn giá trị cạnh chuột, Inspector cập nhật liền.
- Đúng cả với object xoay, scale không đều, scale âm (lật): chấm nằm đúng chỗ đường viền xanh của collider.
- Giá trị không âm: kéo một mặt quá mặt đối diện thì kích thước dừng ở 0. Capsule: kéo bán kính quá nửa chiều cao thì `height` tăng theo; rút `height` dưới 2 × bán kính thì bán kính nhỏ lại.
- Mỗi lần kéo là **một bước Undo** (<kbd>Ctrl</kbd>+<kbd>Z</kbd>), scene được đánh dấu đã sửa.
- Dùng được trong **Play Mode**: vật lý (Rapier lẫn builtin) dùng hình mới từ bước kế tiếp; giá trị trở lại khi Stop như mọi thay đổi trong Play Mode.
- Mỗi lúc chỉ sửa một collider. Thoát bằng <kbd>Esc</kbd>, bấm lại nút, chọn object khác hoặc chọn tool khác (<kbd>Q</kbd> <kbd>W</kbd> <kbd>E</kbd> <kbd>R</kbd> <kbd>T</kbd> <kbd>Y</kbd>). Khi chọn nhiều object, chỉ collider của object **active** (chọn sau cùng) được sửa.
