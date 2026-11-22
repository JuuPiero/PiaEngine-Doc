---
title: Render 2D
description: SpriteRenderer, TextRenderer, sprite dựng sẵn và thứ tự vẽ.
---

# Render 2D

Scene pipeline **2D (PixiJS)** dùng world unit như Unity 2D: trục Y hướng lên, mặc định **100 pixel = 1 unit**. `SpriteRenderer` và `TextRenderer` cũng vẽ được trong scene **3D**.

## SpriteRenderer

**Add Component → Rendering → Sprite Renderer**. Vẽ một sprite; kích thước thế giới = pixel / Pixels Per Unit.

| Thuộc tính | Field | Mặc định | Mô tả |
|---|---|---|---|
| Sprite | `sprite` | `builtin:Square` | Sprite / texture (GUID) hoặc sprite dựng sẵn `builtin:<Tên>` |
| Color | `color` | trắng | Màu nhân vào sprite (kể cả alpha) |
| Flip X / Flip Y | `flipX`, `flipY` | `false` | Lật ảnh |
| Draw Mode | `drawMode` | `Simple` | `Simple`: kích thước theo ảnh. `Sliced`: 9-slice giãn tới **Size** (góc giữ nguyên). `Tiled`: góc giữ nguyên, cạnh và tâm lặp lại. Dùng border đặt trong Sprite Editor |
| Size | `size` | `(1, 1)` | Kích thước (unit, local) khi Sliced / Tiled. Rect tool (<kbd>T</kbd>) sửa Size như Unity |
| Mask Interaction | `maskInteraction` | `None` | `VisibleInsideMask`: chỉ hiện bên trong các [Sprite Mask](#sprite-mask); `VisibleOutsideMask`: chỉ hiện bên ngoài |
| Materials | `sharedMaterials` | `[]` | Danh sách material, mỗi material vẽ sprite thêm một lần (multi-pass). Rỗng = `Sprites/Default`. Xem [Material](../graphics/materials.md) |
| Order in Layer | `sortingOrder` | `0` | Thứ tự vẽ: số lớn vẽ đè lên |
| Pixels Per Unit | `pixelsPerUnit` | `100` | **Hệ số** nhân với PPU của texture: 100 = dùng đúng Pixels Per Unit trong import settings |

Sprite có thể là cả texture hoặc **sprite con** cắt trong [Sprite Editor](../assets/sprite-editor.md) (tham chiếu `<guid>#<id>`, hoặc `'Assets/Sprites/SpriteSheet.png#coin_0'` trong code).

```ts
const sr = this.getComponent(SpriteRenderer)!;
sr.color = new Color(1, 0.5, 0.5, 1);
sr.flipX = Input.getAxisRaw('Horizontal') < 0;
sr.sprite = this.hurtSprite;          // field @field({ assetType: 'sprite' })
```

### Sprite dựng sẵn

`Square`, `Circle`, `Triangle`, `Capsule`, `Hexagon`, `RoundedSquare`, `Particle` — dùng làm `builtin:Circle`… hoặc tạo nhanh từ **GameObject → 2D Object → Sprites**. Hợp để dựng prototype mà chưa cần ảnh. `RoundedSquare` có sẵn border 9-slice (dùng được với Draw Mode `Sliced`).

### Thứ tự vẽ

Sprite được sắp theo **Order in Layer**, rồi theo **Z**, rồi theo thứ tự trong Hierarchy.

## Sprite Mask

Che / khoét sprite theo hình một sprite khác, như `SpriteMask` của Unity. **Add Component → Rendering → Sprite Mask**.

| Thuộc tính | Field | Mặc định | Mô tả |
|---|---|---|---|
| Sprite | `sprite` | `builtin:Circle` | Hình của mask (bản thân mask **không được vẽ**) |
| Alpha Cutoff | `alphaCutoff` | `0.2` | Pixel có alpha lớn hơn giá trị này thuộc về mask |
| Custom Range | `isCustomRangeActive` | `false` | Bật: mask chỉ ảnh hưởng renderer có Order in Layer trong khoảng (Back, Front] |
| Front Order / Back Order | `frontSortingOrder`, `backSortingOrder` | `0`, `-1` | Khoảng Order in Layer khi bật Custom Range |

- Renderer chọn cách phản ứng bằng **Mask Interaction**: *Visible Inside Mask* chỉ hiện trong **hợp** của mọi mask ảnh hưởng tới nó, *Visible Outside Mask* chỉ hiện bên ngoài. Không có mask nào: Visible Inside thì không vẽ, Visible Outside thì vẽ bình thường (như Unity).
- Dùng được cho `SpriteRenderer` và `TilemapRenderer` (package [Tilemap](../official/tilemap.md)); chạy cả pipeline 2D (PixiJS) lẫn 3D (three.js) bằng stencil buffer.
- Mask có thể di chuyển / xoay / co giãn và đổi sprite lúc chạy (ví dụ vùng sáng quanh nhân vật, cửa sổ nhìn xuyên tường).
- Chọn object có Sprite Mask: Scene view vẽ **viền xanh ngọc** theo đúng hình mask (phần pixel trên Alpha Cutoff).

```ts
import { SpriteMask, SpriteRenderer } from '@pia/core';

const mask = this.gameObject.addComponent(SpriteMask);
mask.sprite = 'builtin:Circle';
mask.alphaCutoff = 0.5;
this.map.getComponent(SpriteRenderer)!.maskInteraction = 'VisibleInsideMask';
```

## TextRenderer

Chữ trong thế giới (như TextMesh của Unity), dùng trong cả 2D và 3D. **Add Component → Rendering → Text Renderer** hoặc **GameObject → 3D Object → Text**.

| Thuộc tính | Field | Mặc định | Mô tả |
|---|---|---|---|
| Text | `text` | `Hello World` | Nội dung (nhiều dòng) |
| Font | `font` | (mặc định) | Asset font `.ttf/.otf/.woff/.woff2` |
| Font Size | `fontSize` | `48` | Pixel; 100 px = 1 unit |
| Font Style | `fontStyle` | `Bold` | `Normal`, `Bold`, `Italic`, `Bold And Italic` |
| Alignment | `alignment` | `Center` | `Left`, `Center`, `Right` |
| Color | `color` | trắng | |
| Outline Width / Outline Color | `outlineWidth`, `outlineColor` | `0`, đen | Viền chữ |
| Order in Layer | `sortingOrder` | `0` | |
| Billboard | `billboard` | `false` | Luôn quay mặt về camera (3D) |

```ts Assets/Scripts/RobotGreeter.ts
const t = this.speechBubble?.getComponent(TextRenderer);
if (t) t.text = 'Hi there!';
```

## Liên quan

- [Texture & Sprite](../assets/textures-sprites.md) — import settings (Sprite Mode, Pixels Per Unit, Filter Mode, Wrap Mode).
- [Sprite Editor & 9-slice](../assets/sprite-editor.md) — cắt sprite sheet, pivot, border.
- [Spine](../official/spine.md) — animation xương (package `com.pia.spine`).
- [Camera](camera.md) — camera orthographic cho 2D.
- [Vật lý 2D](physics-2d.md).
