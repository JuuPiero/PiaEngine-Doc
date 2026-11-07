---
title: Sprite Editor & 9-slice
description: Cắt sprite sheet, pivot, viền 9-slice, sprite con và Draw Mode Sliced / Tiled.
---

# Sprite Editor & 9-slice

Giống Unity: một texture có thể là **một sprite** (`Single`) hoặc được **cắt thành nhiều sprite** (`Multiple`). Mỗi sprite có rect, pivot và viền **9-slice** (border) để giãn khung / nút mà không méo góc. Tính năng có sẵn trong engine, dùng cho cả 2D và 3D.

## Import settings của texture

Chọn ảnh trong Project → Inspector → **Import Settings**:

| Thiết lập | Ý nghĩa |
|---|---|
| Sprite Mode | `Single`: cả ảnh là một sprite. `Multiple`: cắt thành nhiều sprite trong Sprite Editor |
| Pixels Per Unit | Số pixel ứng với 1 unit thế giới (mặc định 100) |
| Pivot / Custom Pivot | Pivot của sprite (`Single`): preset (Center, Bottom…) hoặc tuỳ chỉnh |
| Filter Mode, Wrap Mode | Xem [Texture & Sprite](textures-sprites.md) |

Nút **Sprite Editor** mở cửa sổ chỉnh sprite. Bấm **Apply** để lưu (hoặc **Revert**).

## Cửa sổ Sprite Editor

Mở bằng nút **Sprite Editor** trong Import Settings, hoặc **Window → 2D → Sprite Editor**.

| Thao tác | Cách làm |
|---|---|
| Tạo rect mới | Kéo trên vùng trống |
| Di chuyển / đổi kích thước rect | Kéo rect / kéo cạnh, góc |
| Đặt pivot | Kéo vòng tròn pivot (<kbd>Ctrl</kbd> để snap) |
| Viền 9-slice | Kéo các đường **xanh lá** (border) |
| Thu rect về phần có pixel | **Trim** |
| Xoá rect | <kbd>Del</kbd> / <kbd>Backspace</kbd> |
| Zoom / pan | Lăn chuột / kéo chuột giữa (hoặc chuột phải, hoặc <kbd>Alt</kbd> + chuột trái); **Fit** (<kbd>F</kbd>) |
| Undo / Redo trong cửa sổ | <kbd>Ctrl</kbd>+<kbd>Z</kbd> / <kbd>Ctrl</kbd>+<kbd>Y</kbd> |
| Lưu vào `.meta` | **Apply** (hoặc **Revert** để bỏ) |

Bảng bên cạnh sửa sprite đang chọn: **Name**, **Position** (rect), **Border**, **Pivot** / **Custom Pivot**, và hiện **tham chiếu** của sprite (`<texture guid>#<id>`, có nút copy).

### Slice

Menu **Slice ▾**:

| Type | Tuỳ chọn |
|---|---|
| Automatic | Mỗi "đảo" pixel không trong suốt thành một sprite; **Minimum Size** |
| Grid By Cell Size | **Pixel Size** của ô, **Offset**, **Padding**, **Keep Empty Rects** |
| Grid By Cell Count | **Column & Row**, **Offset**, **Padding**, **Keep Empty Rects** |

Chung cho mọi kiểu: **Pivot** của sprite mới và **Method**: `Delete Existing` (xoá hết rect cũ), `Smart` (giữ rect cũ trùng vị trí, kể cả tên / pivot / border), `Safe` (chỉ thêm rect mới, không đụng rect cũ).

::: tip Sprite sheet
Để 1–2 pixel trống giữa các sprite trong sheet, tránh viền của sprite bên cạnh lọt vào khi lọc Bilinear.
:::

## Dùng sprite con

- Trong Project, texture `Multiple` có nút **▸** để mở danh sách sprite con.
- Kéo sprite con vào Scene / Hierarchy (tạo object có SpriteRenderer) hoặc vào bất kỳ ô sprite nào: SpriteRenderer, UI Image, Particle System, field `@field({ assetType: 'sprite' })`.
- Chọn sprite con để xem Rect, Pivot, Border, Pixels Per Unit, World Size trong Inspector.

Tham chiếu được lưu dạng **`<textureGuid>#<spriteId>`**: đổi tên sprite hay di chuyển texture không làm hỏng tham chiếu. Trong code có thể dùng tên:

```ts
sr.sprite = 'Assets/Sprites/SpriteSheet.png#coin_0';   // đường dẫn texture # tên sprite
const coin = Resources.find('Icons/sheet#coin_0');       // texture trong Resources/
const frames = Resources.findSprites('Icons/sheet');     // mọi sprite của sheet, theo thứ tự Sprite Editor
```

Ví dụ đổi frame bằng code:

```ts
import { MonoBehaviour, Resources, SpriteRenderer, Time } from '@pia/core';

export class FlipBook extends MonoBehaviour {
  fps = 8;
  private _frames: string[] = [];

  start() {
    this._frames = Resources.findSprites('Sprites/coin');   // Assets/**/Resources/Sprites/coin.png
  }

  update() {
    if (!this._frames.length) return;
    const i = Math.floor(Time.time * this.fps) % this._frames.length;
    this.getComponent(SpriteRenderer)!.sprite = this._frames[i];
  }
}
```

## 9-slice: Sliced / Tiled

Sprite có border (đặt trong Sprite Editor) giãn được mà không méo góc:

| Component | Thuộc tính |
|---|---|
| [SpriteRenderer](../components/rendering-2d.md#spriterenderer) | **Draw Mode** `Simple` / `Sliced` / `Tiled` + **Size** (unit). Rect tool (<kbd>T</kbd>) sửa **Size** thay vì scale, như Unity |
| [UI Image](../components/ui.md#image) | **Image Type** `Simple` / `Sliced` / `Tiled`, **Fill Center**, **Pixels Per Unit Multiplier** |

- `Sliced`: 4 góc giữ kích thước, cạnh và tâm giãn ra.
- `Tiled`: 4 góc giữ kích thước, cạnh và tâm lặp lại.
- Sprite dựng sẵn `RoundedSquare` có sẵn border.

## Định dạng trong `.meta`

Dữ liệu nằm trong `importer` của file `.meta` của texture (pixel, gốc toạ độ ở **góc dưới-trái**):

```json Assets/Sprites/SpriteSheet.png.meta
{
  "guid": "7c99f8ed0f4c95b3a8aa384c5b821a1a",
  "importer": {
    "filterMode": "Point",
    "pixelsPerUnit": 32,
    "wrapMode": "Clamp",
    "spriteMode": "Multiple",
    "sprites": [
      { "id": "060845ebd285", "name": "coin_0", "x": 0, "y": 34, "width": 32, "height": 32, "pivot": { "x": 0.5, "y": 0 } },
      { "id": "bb46aecc7632", "name": "panel", "x": 0, "y": 0, "width": 32, "height": 32,
        "border": { "left": 8, "bottom": 8, "right": 8, "top": 8 } }
    ]
  }
}
```

Texture `Single` dùng `spritePivot` và `spriteBorder` thay cho `sprites`.

## Ví dụ

Demo2D: scene `Assets/Scenes/SpriteSheetDemo.scene.json` với sheet `Assets/Sprites/SpriteSheet.png` (đồng xu nhiều frame, khung `panel` 9-slice, gem…).

::: note Chưa hỗ trợ
Keyframe sprite trong animation clip (đổi sprite theo frame bằng cửa sổ Animation) — tạm thời đổi `sprite` bằng script như ví dụ trên.
:::
