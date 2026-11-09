---
title: Hierarchy & Inspector
description: Tạo object, gắn component, gán tham chiếu và sửa nhiều object cùng lúc.
---

# Hierarchy & Inspector

## Tạo GameObject

Menu **GameObject** (hoặc chuột phải trong Hierarchy):

| Mục | Tạo ra |
|---|---|
| Create Empty (<kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>N</kbd>) / Create Empty Child (<kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>N</kbd>) | Object rỗng (chỉ có Transform). |
| 3D Object | Cube, Sphere, Capsule, Cylinder, Plane, Quad (MeshFilter + MeshRenderer + collider tương ứng), Text. |
| 2D Object → Sprites | Sprite dựng sẵn: Square, Circle, Triangle, Capsule, Hexagon, RoundedSquare, Particle. |
| UI | Canvas, Panel, Image, Text, Button, Event System. |
| Light | Directional Light, Point Light, Spotlight. |
| Effects | Particle System. |
| Audio | Audio Source. |
| Camera | Camera. |

::: note Ctrl+Shift+N
Unity dùng <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>N</kbd> cho Create Empty, nhưng Chrome giữ tổ hợp này (mở cửa sổ ẩn danh). PiaEngine dùng <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>N</kbd>.
:::

## Hierarchy

- Kéo-thả để đổi cha / thứ tự. <kbd>F2</kbd> đổi tên, <kbd>Ctrl</kbd>+<kbd>D</kbd> nhân bản, <kbd>Del</kbd> xoá.
- Object thuộc prefab hiện màu prefab; chuột phải → **Prefab** (Open Asset in Context, Select Asset, Apply / Revert All Overrides, Unpack).
- Object inactive hiện mờ.
- Click tên scene ở đầu cây → **Scene Settings**.

### Find References

- Chuột phải asset trong **Project** → **Find References In Scene**: Hierarchy chỉ hiện các object dùng asset đó (ô search thành `ref:<guid>`; xoá ô search để hiện lại tất cả). Tìm cả trong component, material, prefab nguồn và sprite con (`guid#id`).
- **Find References In Project**: danh sách file (scene, prefab, material, ScriptableObject, clip…) nhắc tới asset, kèm số lần; bấm một dòng để chọn file đó. Với script, tìm theo tên các component trong script.
- Chuột phải object trong **Hierarchy** → **Find References In Scene**: các object khác tham chiếu tới nó.

## Inspector

- **Add Component**: tìm theo tên hoặc duyệt nhóm (Rendering, Mesh, Physics, Physics 2D, Audio, UI, Effects, Miscellaneous; script của project nằm trong nhóm **Scripts**, component của package trong **Packages/&lt;tên package&gt;**). **New script…** tạo script và gắn luôn.
- Menu ⋮ của component: **Reset**, **Remove Component**, **Move Up** / **Move Down**, **Edit Script** (với script).
- Double-click ô **Script** để mở file trong code editor.
- Ô màu: bấm thanh màu để mở bảng chọn màu; ô mã hex ngay bên cạnh để gõ hoặc dán mã (`E82D29`, `#37A8FD`, `FAE11F80` có alpha) — dán là áp dụng ngay, gõ xong bấm Enter, Esc để huỷ.
- Object có material: cuối Inspector có bảng chỉnh từng material (sửa ở đó là sửa asset). Xem [Material](../graphics/materials.md).

### Gán tham chiếu bằng kéo-thả

| Field | Kéo vào |
|---|---|
| `@field('gameObject')` / `@field(GameObject)` | Object trong Hierarchy, hoặc prefab trong Project |
| `@field(Button)` (class component) | Object có component đó (hoặc prefab) |
| `@field({ assetType: 'sprite' })`… | Asset đúng loại từ Project |
| `@field(EnemyData)` (ScriptableObject) | Asset `.asset.json` cùng kiểu |
| `@field(TextAsset)` / `@field(JsonAsset)` / `@field(BufferAsset)` | File văn bản / `.json` / file bất kỳ — xem [TextAsset](../scripting/text-assets.md) |

- **Danh sách** (`@field([X])`): thả lên **tiêu đề danh sách** để thêm phần tử vào cuối. Kéo nhiều object từ Hierarchy là thêm cả loạt; thứ sai kiểu bị bỏ qua. Một bước Undo.
- **Script**: thả file script từ Project lên Inspector của object để gắn component của script đó (như kéo script lên object trong Hierarchy).

### Click vào ô tham chiếu (ping)

Giống Unity:

- **Click** vào ô đã có giá trị: thứ được tham chiếu **nháy sáng** mà selection không đổi. Object trong scene → Hierarchy tự mở các object cha và cuộn tới; asset (prefab, material, texture, ScriptableObject, file script…) → cửa sổ Project mở thư mục chứa nó và cuộn tới; sprite con của sprite sheet hoặc mesh / material / clip của model → mở rộng file gốc.
- **Double-click**: chọn hẳn object / asset đó (ô **Script**: mở file trong code editor).

Trong cửa sổ Project, **Ctrl + lăn chuột** phóng to / thu nhỏ icon (như thanh trượt ở góc dưới); lăn thường vẫn cuộn.

### Khoá Inspector

Nút **ổ khoá** góc trên Inspector giữ nguyên object / asset đang xem khi bạn chọn thứ khác — dùng để kéo object khác vào field của object đang khoá. Bấm lại để mở khoá (Inspector chuyển sang thứ đang được chọn). Nếu object đang khoá bị xoá, Inspector báo và chờ bạn mở khoá.

### Sửa nhiều object cùng lúc

Chọn nhiều object (<kbd>Ctrl</kbd> / <kbd>Shift</kbd> + click) → Inspector chỉ hiện component chung, giá trị khác nhau hiện **—**, sửa một ô là áp cho tất cả (một bước Undo).

### Prefab instance

Chọn instance của prefab, đầu Inspector có thanh **Prefab**: **Open**, **Select**, **Overrides** (Apply All, Revert All, Unpack Prefab). Giá trị bị override hiện **in đậm**. Xem [Prefab](../assets/prefabs.md).

## Asset trong Inspector

Chọn asset trong Project để sửa:

- Import settings của texture (Texture Type, sRGB, Mip Maps, Wrap / Filter Mode, Pixels Per Unit, nén khi build — xem [Texture & Sprite](../assets/textures-sprites.md)) và model (Scale Factor…).
- Material (shader + thuộc tính), ScriptableObject (field của class) — tự lưu, có Undo.
- Shader: xem thuộc tính, nút **Create Material**.
