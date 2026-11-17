---
title: Texture2D
description: Texture tạo và sửa lúc chạy — setPixel, apply, loadImage, encodeToPNG, readPixels, Sprite.create, Read/Write của texture asset.
---

# Texture2D

Giống `UnityEngine.Texture2D` (API camelCase). Texture asset (PNG / JPG...) cũng là `Texture2D`; texture tạo lúc chạy thì sửa được từng pixel trên CPU rồi `apply()` để đưa lên GPU. Chạy cả 2D lẫn 3D.

## Tạo và sửa pixel

```ts
import { Color, MonoBehaviour, MeshRenderer, Texture2D } from '@pia/core';

export class Checker extends MonoBehaviour {
  start() {
    const tex = new Texture2D(64, 64);          // (width, height, format = 'RGBA32', mipChain = false, linear = false)
    tex.filterMode = 'Point';
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) tex.setPixel(x, y, ((x >> 3) + (y >> 3)) & 1 ? Color.white : Color.black);
    }
    tex.apply();                                // một lần cho cả loạt thay đổi
    this.getComponent(MeshRenderer)!.material!.mainTexture = tex;
  }
}
```

- Toạ độ `(0, 0)` là **góc dưới trái** như Unity; các hàm `getPixels` / `setPixels` đi từng hàng từ dưới lên.
- Định dạng: `RGBA32` / `ARGB32` / `RGB24` / `Alpha8` / `R8` (lưu RGBA 8 bit), `RGBAHalf` / `RGBAFloat` (lưu float, HDR, linear).
- Sửa nhiều pixel nhanh nhất: `tex.getRawTextureData()` trả mảng RGBA (Uint8Array, hoặc Float32Array cho HDR) của chính texture — ghi thẳng vào rồi `apply()`.

| Unity | PiaEngine |
|---|---|
| `SetPixel`, `GetPixel` (clamp / repeat theo Wrap Mode) | `setPixel(x, y, color)`, `getPixel(x, y)` |
| `SetPixels`, `GetPixels` (toàn bộ hoặc một khối) | `setPixels(colors)`, `setPixels(x, y, w, h, colors)`, `getPixels()`, `getPixels(x, y, w, h)` |
| `SetPixels32`, `GetPixels32` | `setPixels32(Color32[] \| Uint8Array)`, `getPixels32()` |
| `GetPixelBilinear(u, v)` | `getPixelBilinear(u, v)` |
| `GetRawTextureData`, `LoadRawTextureData` | `getRawTextureData()`, `loadRawTextureData(data)` |
| `Apply(updateMipmaps, makeNoLongerReadable)` | `apply(updateMipmaps = true, makeNoLongerReadable = false)` |
| `Reinitialize` / `Resize` | `reinitialize(w, h, format?)` / `resize(...)` (xoá pixel) |
| `isReadable`, `width`, `height`, `format`, `mipmapCount`, `texelSize` | cùng tên |
| `Texture2D.whiteTexture` / `blackTexture` / `grayTexture` | cùng tên |

## Ảnh PNG / JPG

```ts
const bytes = new Uint8Array(await (await fetch(url)).arrayBuffer());
const tex = new Texture2D(2, 2);
await tex.loadImageAsync(bytes);                // hoặc tex.loadImage(bytes): trả true ngay, pixel tới sau
const png = tex.encodeToPNG();                  // Uint8Array (đồng bộ); encodeToJPG(quality)
```

- `loadImage(bytes)` nhận PNG / JPG / GIF / WebP, trả `false` nếu không phải ảnh. Kích thước biết ngay (PNG / JPG), điểm ảnh tới sau vài ms vì trình duyệt giải mã bất đồng bộ — cần dùng ngay thì `await tex.loadImageAsync(bytes)` (hoặc `await tex.loading`).
- `encodeToPNG()` giữ đúng từng pixel (ảnh có pixel trong suốt một phần được mã hoá không nén để không bị sai màu); `ImageConversion.loadImage / encodeToPNG / encodeToJPG` cũng có.

## Đọc từ RenderTexture

```ts
const prev = RenderTexture.active;
RenderTexture.active = rt;
tex.readPixels(new Rect(0, 0, rt.width, rt.height), 0, 0);
tex.apply();
RenderTexture.active = prev;
const center = tex.getPixel(rt.width / 2, rt.height / 2);
```

Đọc bản mà Game view đã render (render texture 8 bit trả màu sRGB như ảnh; HDR trả float). Chưa đọc trực tiếp được màn hình: cho camera vẽ vào một RenderTexture rồi đọc.

## Sprite từ texture

```ts
spriteRenderer.sprite = Sprite.create(tex);                                       // cả texture, pivot giữa, 100 px = 1 đơn vị
spriteRenderer.sprite = Sprite.create(tex, new Rect(0, 0, 32, 32), new Vector2(0.5, 0), 32);
```

Field sprite của PiaEngine lưu tham chiếu (chuỗi), nên `Sprite.create(texture, rect?, pivot?, pixelsPerUnit?)` trả về tham chiếu sprite đó (`runtime:sprite:…`). Dùng được với Texture2D và RenderTexture, ở SpriteRenderer 2D lẫn 3D.

## Texture asset và Read/Write

Texture asset (PNG...) là `Texture2D` **không đọc được** (như Unity) — chỉ vẽ. Bật **Read/Write** trong Import Settings của texture rồi nạp bằng:

```ts
const tex = await Texture2D.load('Assets/Sprites/map.png');     // hoặc GUID; Resources.load('map', Texture2D)
const c = tex!.getPixel(10, 10);
tex!.setPixel(10, 10, Color.red);
tex!.apply();   // mọi sprite / material dùng asset này thấy bản đã sửa
```

Field kiểu texture trong script nhận asset texture lẫn render texture (lưu GUID, chọn trong Inspector):

```ts
@field(() => Texture) icon: Texture | null = null;
```

## Giải phóng

Texture tạo lúc chạy sống tới khi bị huỷ (như Unity): `destroy(tex)` (hoặc `this.destroy(tex)` trong MonoBehaviour) giải phóng bộ nhớ GPU.

## Ví dụ: thẻ cào (Playable Ads)

**Demo2D** `Assets/Scenes/ScratchCard.scene.json` + `Assets/Scripts/Graphics/ScratchCard.ts`: lớp phủ bạc là `Texture2D` 520×320 tạo lúc chạy, hiện bằng `Sprite.create`; giữ chuột / ngón tay kéo trên thẻ thì xoá alpha theo cọ tròn mềm (`getRawTextureData`, một `apply(false)` mỗi frame), đếm phần đã cào; quá 55% thì lớp phủ mờ dần và `onRevealed` bật nút **Install** (`PlayableActions.openStore`). Build playable của riêng scene này khoảng 343 KB.
