---
title: RenderTexture
description: Texture mà camera hoặc Graphics.blit vẽ vào — minimap, gương, picture-in-picture; asset .renderTexture.json, Camera.targetTexture, RawImage.
---

# RenderTexture

Giống `UnityEngine.RenderTexture`: một texture mà **camera** (Camera ▸ Target Texture) hoặc **Graphics.blit** vẽ vào, rồi dùng lại như texture bình thường ở material, sprite, UI. Chạy cả 2D (PixiJS `RenderTexture`) lẫn 3D (three.js `WebGLRenderTarget`).

## Tạo asset

**Project ▸ Create ▸ Render Texture** (hoặc menu **Assets ▸ Create**) tạo file `*.renderTexture.json`. Chọn asset để sửa trong Inspector:

| Field | Ý nghĩa |
|---|---|
| Width / Height | kích thước (pixel) |
| Anti-aliasing | MSAA 1 (tắt), 2, 4, 8 — 3D |
| Color Format | `ARGB32` (8 bit, sRGB), `ARGBHalf` / `DefaultHDR` (float 16), `ARGBFloat` (float 32) — HDR chỉ ở 3D, máy không render được float thì tự dùng ARGB32 (có cảnh báo) |
| Depth Buffer | 0 = không có, 16 = depth, 24 = depth + stencil |
| Enable Mip Maps / Auto Generate Mip Maps | mipmap cho texture |
| Wrap Mode / Filter Mode / Aniso Level | cách lấy mẫu |

Phía dưới Inspector là **ảnh xem trước**: nội dung mới nhất mà Game view đã render vào texture (khi chưa có camera nào vẽ vào thì ghi “Not rendered yet”). Ô của asset trong cửa sổ Project cũng hiện nội dung này.

```json Assets/Textures/Minimap.renderTexture.json
{
  "version": 1,
  "type": "RenderTexture",
  "data": {
    "width": 256,
    "height": 256,
    "antiAliasing": 4,
    "format": "ARGB32",
    "depth": 24,
    "useMipMap": false,
    "autoGenerateMips": true,
    "wrapMode": "Clamp",
    "filterMode": "Bilinear",
    "anisoLevel": 1
  }
}
```

## Camera.targetTexture

Kéo asset vào ô **Target Texture** của Camera: camera đó vẽ vào texture thay cho màn hình. Các camera có target texture được vẽ **trước** camera màn hình, nên quad / Raw Image trên màn hình thấy ngay nội dung của frame hiện tại. Camera vẫn theo Culling Mask, Clear Flags, Depth như bình thường và có thể có [Post Effect](graphics-api.md#post-effect).

Trong code:

```ts
import { Camera, MonoBehaviour, RawImage, RenderTexture, field } from '@pia/core';

export class MinimapSetup extends MonoBehaviour {
  @field(() => Camera) minimapCamera: Camera | null = null;
  @field(() => RawImage) display: RawImage | null = null;

  private rt: RenderTexture | null = null;

  start() {
    this.rt = new RenderTexture(256, 256, 16);    // (width, height, depth, format?)
    this.rt.antiAliasing = 4;
    this.minimapCamera!.targetTexture = this.rt;
    this.display!.texture = this.rt;
  }

  onDestroy() {
    this.rt?.release();                           // giải phóng bộ nhớ GPU
  }
}
```

## Dùng texture ở đâu

- **Material**: ô texture của material trong Inspector nhận cả asset Render Texture; trong code `material.mainTexture = rt` hoặc `material.setTexture('_MainTex', rt)`.
- **UI ▸ Raw Image**: field **Texture** (`rawImage.texture = rt`). UI của PiaEngine là DOM nên Raw Image đọc ngược nội dung từ GPU mỗi frame texture thay đổi — giữ texture nhỏ (256–512 px).
- **Sprite**: `spriteRenderer.sprite = Sprite.create(rt)`, hoặc chọn thẳng asset Render Texture trong ô Sprite (tiện cho picture-in-picture 2D; 100 pixel = 1 đơn vị).

## API

| Unity | PiaEngine |
|---|---|
| `new RenderTexture(w, h, depth, format)` | `new RenderTexture(w, h, depth?, format?)` |
| `width`, `height`, `depth`, `format`, `antiAliasing`, `useMipMap`, `filterMode`, `wrapMode` | cùng tên |
| `Create()`, `Release()`, `IsCreated()`, `DiscardContents()` | `create()`, `release()`, `isCreated()`, `discardContents()` |
| `RenderTexture.active` | `RenderTexture.active` (cho `Texture2D.readPixels`, `GL.clear`) |
| `RenderTexture.GetTemporary`, `ReleaseTemporary` | `RenderTexture.getTemporary(w, h, depth?, format?, aa?)`, `releaseTemporary(rt)` |

Đọc pixel về CPU: xem [Texture2D.readPixels](texture2d.md#doc-tu-rendertexture).

## Khác Unity

- Mỗi WebGL context giữ một bản riêng: Scene view tự vẽ các camera có target texture vào bản của nó, nên quad / sprite dùng texture vẫn hiện nội dung trong Scene view khi không Play. `readPixels` và Raw Image đọc bản của Game view.
- Object hiện texture mà nằm trong khung hình của chính camera vẽ vào texture đó (ví dụ quad minimap nhìn thấy từ camera minimap) thấy nội dung **frame trước** — engine đọc một bản sao để tránh vòng lặp feedback của WebGL.
- Không có `Camera.rect` (viewport) — picture-in-picture làm bằng RenderTexture.

## Ví dụ

- **Demo3D** `Assets/Scenes/Graphics.scene.json`: Minimap Camera (trực giao, nhìn xuống) → `Textures/Minimap.renderTexture.json`, hiện ở góc phải bằng Raw Image và trên một quad dùng material `Materials/MinimapScreen.mat.json` (Unlit/Texture).
- **Demo2D** `Assets/Scenes/PictureInPicture.scene.json`: camera con của nhân vật vẽ vào `Textures/PiP.renderTexture.json` (kèm Post Effect đen trắng 2D), hiện ở góc màn hình bằng một SpriteRenderer.
