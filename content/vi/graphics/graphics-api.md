---
title: Graphics, GL và Post Effect
description: Graphics.drawMesh / drawMeshInstanced / renderMesh, MaterialPropertyBlock, Graphics.blit, Post Effect / OnRenderImage, Graphics.drawTexture, GL, Debug.drawLine.
---

# Graphics, GL và Post Effect

API vẽ cấp thấp giống Unity (camelCase), chạy cả 2D lẫn 3D. Phần vẽ nằm trong module `graphics.ts` của từng pipeline và **chỉ được đưa vào bản build khi game dùng** (báo cáo build có dòng `Graphics (RenderTexture/Texture2D/DrawMesh/GL) ✓ / ✗`).

## Graphics.drawMesh / drawMeshInstanced

```ts
import { Graphics, Material, MaterialPropertyBlock, MonoBehaviour, Time, field } from '@pia/core';

export class Swarm extends MonoBehaviour {
  @field(() => Material) material: Material | null = null;
  count = 10000;

  private matrices = new Float32Array(0);
  private block = new MaterialPropertyBlock();

  start() {
    this.matrices = new Float32Array(this.count * 16);  // 16 số / instance, cột trước (như three.js / Unity)
    const colors = new Float32Array(this.count * 4);
    for (let i = 0; i < this.count; i++) colors.set([Math.random(), Math.random(), 1, 1], i * 4);
    this.block.setVectorArray('_Color', colors);         // màu từng instance
  }

  update() {
    const m = this.matrices;
    for (let i = 0; i < this.count; i++) {
      const o = i * 16;
      m[o] = m[o + 5] = m[o + 10] = 0.3; m[o + 15] = 1;    // scale
      m[o + 12] = (i % 100) * 0.5; m[o + 13] = Math.sin(i + Time.time); m[o + 14] = Math.floor(i / 100) * 0.5;
    }
    Graphics.drawMeshInstanced('Cube', 0, this.material, m, this.count, this.block);
  }
}
```

- Lệnh vẽ chỉ có tác dụng **trong frame** gọi nó — gọi lại mỗi `update` / `lateUpdate`. Mọi camera của frame vẽ nó cùng scene (có đổ / nhận bóng, theo layer); truyền `camera` để chỉ camera đó vẽ.
- Mesh là chuỗi như `MeshFilter.mesh`: primitive (`'Cube'`, `'Sphere'`, `'Capsule'`, `'Cylinder'`, `'Plane'`, `'Quad'`) hoặc mesh của model `'guid#mesh:Tên'`.
- Các dạng gọi:

| Unity | PiaEngine |
|---|---|
| `Graphics.DrawMesh(mesh, matrix, material, layer, camera, submesh, props, castShadows, receiveShadows)` | `Graphics.drawMesh(mesh, matrix, material, layer?, camera?, submesh?, props?, castShadows?, receiveShadows?)` — `matrix` là `Matrix4` hoặc 16 số |
| `Graphics.DrawMesh(mesh, position, rotation, material, …)` | `Graphics.drawMesh(mesh, position, rotation, material, …)` |
| `Graphics.DrawMeshInstanced(mesh, submesh, material, matrices, count, props, …)` | cùng thứ tự; `matrices` là `Matrix4[]` hoặc `Float32Array` (nhanh nhất) |
| `Graphics.RenderMesh(rparams, mesh, submesh, objectToWorld)`, `RenderMeshInstanced(...)`, `RenderParams` | `Graphics.renderMesh`, `renderMeshInstanced`, `new RenderParams(material)` (`layer`, `camera`, `matProps`, `shadowCastingMode`, `receiveShadows`) |

**3D**: lệnh vẽ được gom theo mesh + material + (camera, layer, bóng) thành `InstancedMesh` của three.js — một draw call cho mỗi nhóm. Màu từng instance (`_Color` trong property block: một màu cho cả lệnh, hoặc mảng `setVectorArray` / `setColorArray`) nhân với màu material (RGB; alpha từng instance chưa hỗ trợ). Không cấp phát bộ nhớ theo instance mỗi frame.

Đo trên Chrome headless (SwiftShader, CPU) với 10 000 cube có bóng đổ:

| | Draw call | Script | Đồng bộ scene (CPU) | Gửi lệnh vẽ (CPU) |
|---|---|---|---|---|
| `drawMeshInstanced` | **5** (2 instanced: hình + bóng) | ~2 ms | ~2.5 ms | ~7 ms |
| 10 000 GameObject (MeshRenderer) | ~14 900 | ~2.5 ms | ~130 ms | ~485 ms |

**2D**: `drawMesh(Instanced)` với mesh `'Quad'` (1×1 đơn vị) vẽ thành sprite: texture `_MainTex` và `_Color` của material, màu từng instance (gồm alpha) từ property block; vẽ trên các sprite Order in Layer 0.

## MaterialPropertyBlock

Đổi giá trị material **cho từng renderer** mà không sao chép material:

```ts
const block = new MaterialPropertyBlock();
for (const r of this.getComponentsInChildren(MeshRenderer)) {
  block.setColor('_Color', Color.lerp(Color.red, Color.blue, Math.random()));
  r.setPropertyBlock(block);       // giá trị được sao chép: dùng lại block cho renderer sau
}
```

- `setFloat`, `setInt`, `setColor`, `setVector`, `setTexture` (Texture hoặc tham chiếu), `setFloatArray` / `setVectorArray` / `setColorArray` (cho `drawMeshInstanced`), `get…`, `hasProperty`, `clear`, `isEmpty`.
- `renderer.setPropertyBlock(block)` / `getPropertyBlock(block)` / `hasPropertyBlock()` trên **MeshRenderer**, **SkinnedMeshRenderer**, **SpriteRenderer**. `setPropertyBlock(null)` bỏ block.
- 3D: mọi property của shader (kể cả `<tex>_ST`); Default-Material nhận `_Color`, `_MainTex`, `_Metallic`, `_Glossiness`, `_EmissionColor`. Renderer có block không được gom [GPU Instancing](materials.md) (vẽ riêng). SkinnedMeshRenderer dùng Baked Animation bỏ qua block.
- 2D: `_Color` nhân màu sprite; shader 2D tự viết đọc mọi property của block.

## Post Effect

Hiệu ứng toàn màn hình cho một camera: thêm component **Rendering ▸ Post Effect** vào camera và chọn material. Shader của material đọc ảnh của camera qua `_MainTex` (`mainTex(uv)`) — 3D: shader unlit 3D, 2D: shader 2D. Nhiều Post Effect chạy theo thứ tự component, cái sau nhận kết quả cái trước. Camera vẽ vào [RenderTexture](render-texture.md) cũng có Post Effect được.

```glsl Assets/Shaders/PostGrayscale.shader
Shader "PostEffects/Grayscale"
{
    Properties
    {
        _MainTex ("Image", 2D) = "white" {}
        _Amount ("Amount", Range(0, 1)) = 1
    }
    Pipeline 3D
    ZWrite Off

    GLSLPROGRAM
    vec4 frag(vec2 uv)
    {
        vec4 c = mainTex(uv);
        float g = dot(c.rgb, vec3(0.299, 0.587, 0.114));
        return vec4(mix(c.rgb, vec3(g), _Amount), 1.0);
    }
    ENDGLSL
}
```

`_ScreenParams` là kích thước ảnh đang vẽ: `_ScreenParams.zw - 1.0` là một pixel theo UV (dùng cho blur, viền — xem `Assets/Shaders/PostOutline.shader` của Demo3D).

### OnRenderImage và Graphics.blit

Như Unity, script gắn cùng camera có thể tự xử lý ảnh:

```ts
export class TwoPassBlur extends MonoBehaviour {
  @field(() => Material) blur: Material | null = null;

  onRenderImage(src: RenderTexture, dst: RenderTexture | null) {
    const tmp = RenderTexture.getTemporary(src.width / 2, src.height / 2);
    Graphics.blit(src, tmp, this.blur);    // thu nhỏ + blur
    Graphics.blit(tmp, dst, this.blur);    // dst null = màn hình (hoặc target texture của camera)
    RenderTexture.releaseTemporary(tmp);
  }
}
```

- `Graphics.blit(source, dest, material?, pass?)` vẽ một quad toàn khung với `_MainTex` = `source`; không có material thì sao chép. Dạng `blit(source, dest, scale, offset)` cũng có.
- Gọi được bất cứ lúc nào (không chỉ trong `onRenderImage`): chạy ngay trên thiết bị của Game view.
- Scene không có Post Effect / `onRenderImage` thì render y như trước (không tốn gì thêm).

## Graphics.drawTexture

```ts
Graphics.drawTexture(new Rect(20, 20, 128, 128), tex);    // pixel, gốc trên trái (như GUI của Unity)
```

Vẽ lên màn hình sau các camera, trong frame đó. Dạng `drawTexture(rect, tex, sourceRect, l, r, t, b, color?, material?)` nhận vùng nguồn (UV) và màu (bỏ qua viền 9-slice).

## GL

```ts
lateUpdate() {
  GL.begin(GL.LINES);
  GL.color(Color.red);
  GL.vertex3(0, 0, 0);
  GL.vertex3(0, 2, 0);
  GL.end();

  GL.pushMatrix();
  GL.loadOrtho();                // 0..1 trên màn hình, gốc dưới trái (loadPixelMatrix(): pixel)
  GL.begin(GL.QUADS);
  GL.color(new Color(0, 0, 0, 0.5));
  GL.vertex3(0, 0, 0); GL.vertex3(0.3, 0, 0); GL.vertex3(0.3, 0.1, 0); GL.vertex3(0, 0.1, 0);
  GL.end();
  GL.popMatrix();
}
```

- `GL.LINES`, `LINE_STRIP`, `TRIANGLES`, `TRIANGLE_STRIP`, `QUADS`; `color`, `vertex3` / `vertex`, `pushMatrix` / `popMatrix`, `loadOrtho`, `loadPixelMatrix`, `loadIdentity`, `multMatrix`, `modelview`; `GL.clear(clearDepth, clearColor, color)` xoá `RenderTexture.active` (null = màn hình).
- Khác Unity: gọi trong `update` / `lateUpdate` (không cần `OnPostRender`); vẽ sau các camera của frame, màu đỉnh có alpha, đường trong thế giới có depth test. Chưa có texture (`texCoord` và `material.setPass` được nhận nhưng bỏ qua), `GL.Viewport`, wireframe.

## Debug.drawLine / drawRay

```ts
Debug.drawLine(a, b, Color.yellow);                        // frame này
Debug.drawRay(transform.position, transform.forward.mul(3), Color.magenta, 2);   // 2 giây
```

Hiện trong Scene view **và Game view** (Play Mode), tham số `depthTest = false` vẽ đè lên mọi thứ. Trong bản build chỉ hiện khi bật **Development Build** (Build Settings, hoặc `node scripts/pia.mjs build <project> --development`): bản release biên dịch chúng thành lệnh rỗng (`Debug.isDebugBuild` = false, hằng `DEVELOPMENT` = false) và không kèm phần vẽ.

## Ví dụ

**Demo3D** `Assets/Scenes/Graphics.scene.json`:

- `Scripts/Graphics/InstancedSwarm.ts`: 1 600 cube `drawMeshInstanced`, màu từng instance, sóng; đổi `mode` sang `GameObjects` để so sánh.
- `Scripts/Graphics/PropertyBlockColors.ts`: 5 sphere dùng chung Default-Material, màu riêng bằng property block.
- Main Camera có 2 Post Effect (đen trắng, viền) — phím **P** đổi (`PostEffectSwitcher.ts`).
- `Scripts/Graphics/GLOverlay.ts`: trục XYZ bằng GL, khung màn hình bằng `GL.loadOrtho`, `Debug.drawRay` theo hướng nhìn.
- `Scripts/Graphics/CaptureMinimap.ts`: phím **C** đọc minimap bằng `readPixels` và `encodeToPNG`.
