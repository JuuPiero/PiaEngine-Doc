---
title: Texture & Sprite
description: Import ảnh, Texture Type, Pixels Per Unit, Filter / Wrap Mode, mip map, nén ảnh khi build và dùng ảnh làm sprite.
---

# Texture & Sprite

Ảnh `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg`, `.avif` trong `Assets/` là texture, dùng làm sprite (2D, UI) hoặc texture cho material (3D).

## Import settings

Chọn ảnh trong Project → Inspector → **Import Settings**, sửa rồi bấm **Apply** (hoặc **Revert**):

| Thiết lập | Mặc định | Mô tả |
|---|---|---|
| Texture Type | `Sprite (2D and UI)` ở project 2D, `Default` ở project 3D | `Default`: texture cho material. `Normal map`: dữ liệu tuyến tính (không chuyển màu sRGB). `Sprite (2D and UI)`: hiện thêm các mục sprite bên dưới |
| Sprite Mode | `Single` | `Single`: cả ảnh là một sprite. `Multiple`: cắt thành nhiều sprite trong Sprite Editor |
| Pixels Per Unit | `100` | Số pixel ảnh ứng với 1 unit thế giới. Sprite 200 px với PPU 100 → rộng 2 unit |
| Pivot | Center | Pivot của sprite (`Single`) |
| sRGB (Color Texture) | bật | Tắt cho texture chứa dữ liệu (mask, roughness…) |
| Generate Mip Maps | bật, trừ Sprite và Filter `Point` | Ảnh mịn hơn khi nhìn xa / thu nhỏ trong 3D |
| Wrap Mode | `Clamp` | `Repeat`, `Clamp`, `Mirror`, hoặc `Per-axis` (U / V riêng) |
| Filter Mode | `Bilinear` | `Point` = sắc nét cho pixel art; `Trilinear` = mượt giữa các mip |
| Aniso Level | `4` | Độ nét khi nhìn nghiêng (3D) |

Import settings lưu trong file `.meta` của ảnh. Nút **Sprite Editor** mở cửa sổ cắt sprite sheet, đặt pivot và viền 9-slice — xem [Sprite Editor & 9-slice](sprite-editor.md).

### Nén khi build (Web / Playable Ads)

Mục **Build** trong Import Settings giảm dung lượng ảnh trong bản build (file gốc trong `Assets/` không đổi):

| Thiết lập | Mặc định | Mô tả |
|---|---|---|
| Max Size | No limit | Ảnh có cạnh lớn hơn thì được thu nhỏ (giữ tỉ lệ). Filter Mode `Point` thu nhỏ kiểu nearest để giữ pixel art sắc nét |
| Format | `Original` | `PNG`, `JPG` (nền trong suốt thành nền đặc), `WebP` (Quality 100 = lossless) |
| Quality | `80` | Chất lượng JPG / WebP |

- Inspector hiện ước lượng *nguồn → bản build* (kích thước pixel).
- Engine chỉ dùng bản đã xử lý khi nó nhỏ hơn file gốc.
- Thu nhỏ không làm sprite nhỏ đi trên màn hình: Pixels Per Unit được bù tự động.
- Báo cáo build ghi từng ảnh đã xử lý, ví dụ `pika.png 1080×1080 → 512×512 WEBP q75 (569 KB → 15 KB)`.

## Dùng ảnh

- Kéo ảnh từ Project vào Scene / Hierarchy → object mới có `SpriteRenderer`.
- Kéo vào ô **Sprite** của SpriteRenderer, **Source Image** của UI Image, ô texture của material.
- Từ code: field `@field({ assetType: 'sprite' })` hoặc `'texture'`, giá trị là chuỗi GUID (sprite con của sheet: `<guid>#<id>`).

```ts
@field({ assetType: 'sprite' }) hurtSprite = '';

onHit() {
  this.getComponent(SpriteRenderer)!.sprite = this.hurtSprite;
}
```

## Kích thước sprite trên màn hình

Kích thước thế giới = pixel ảnh / (PPU của texture × `SpriteRenderer.pixelsPerUnit` / 100) × scale của Transform. `SpriteRenderer.pixelsPerUnit` là **hệ số**: 100 = dùng đúng Pixels Per Unit của texture. Camera orthographic `Size = 5` nhìn thấy 10 unit theo chiều dọc.

Sprite `Sliced` / `Tiled` (9-slice) vẽ theo **Size** của SpriteRenderer thay vì kích thước ảnh — xem [Sprite Editor & 9-slice](sprite-editor.md#9-slice-sliced-tiled).

## Texture lặp trên material

Material có Tiling khác 1 tự lặp texture, không cần đổi Wrap Mode:

```ts
mesh.material!.setTextureScale('_MainTex', [4, 4]);   // lặp 4 × 4
```

Xem [Material](../graphics/materials.md).
