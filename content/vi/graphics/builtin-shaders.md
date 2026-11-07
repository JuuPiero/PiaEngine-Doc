---
title: Shader dựng sẵn
description: Danh mục shader có sẵn cho 3D và 2D cùng các thuộc tính chính.
---

# Shader dựng sẵn

Chọn trong dropdown **Shader** của material, hoặc từ code: `Material.create('Toon/Lit')`, `Shader.find('Sprites/Outline')`.

## 3D

| Nhóm | Shader | Thuộc tính chính |
|---|---|---|
| Standard | `Standard` | `_Color` (Albedo), `_MainTex`, `_Cutoff` (Alpha Cutoff), `_Metallic`, `_Glossiness` (Smoothness), `_BumpMap` + `_BumpScale`, `_OcclusionMap`, `_EmissionColor` + `_EmissionMap` |
| | `Standard (Transparent)` | Như Standard, blend Alpha |
| Unlit | `Unlit/Color` | `_Color` |
| | `Unlit/Texture`, `Unlit/Transparent`, `Unlit/Additive` | `_MainTex`, `_Color` |
| | `Unlit/Cutout` | `_MainTex`, `_Color`, `_Cutoff` |
| | `Unlit/Vertex Color` | `_Color` (nhân với màu đỉnh) |
| | `Unlit/Gradient` | `_TopColor`, `_BottomColor`, `_Range`, `_Exponent` |
| Particles | `Particles/Unlit` | `_MainTex`, `_Color` (nhân với màu đỉnh); alpha blend, không cull, không ghi depth. Shader của material dựng sẵn `Default-Line` ([Line / Trail Renderer](../components/line-trail-renderer.md)), dùng được cả trong scene 2D |
| Mobile (rẻ, hợp playable) | `Mobile/Diffuse` (Lambert) | `_Color`, `_MainTex` |
| | `Mobile/Specular` (Blinn-Phong) | `_Color`, `_MainTex`, `_SpecColor`, `_Shininess` |
| | `Mobile/Vertex Color` | `_Color` |
| Toon | `Toon/Lit` | Cel shading 2–6 dải sáng (`_ToonSteps`) hoặc Ramp texture (`_Ramp`), specular cứng (`_SpecColor`, `_Gloss`), rim light (`_RimColor`, `_RimAmount`, `_RimThreshold`), `_EmissionColor` |
| | `Toon/Outline` | Viền mực (`_OutlineColor`, `_OutlineWidth`): thêm làm **material thứ 2**, ví dụ `[Toon/Lit, Toon/Outline]` |
| Effects | `Effects/Rim Glow` | `_Color`, `_Power`, `_Intensity` (blend cộng) |
| | `Effects/Hologram` | `_Color`, `_RimPower`, `_LineDensity`, `_ScrollSpeed`, `_Wobble` |
| | `Effects/Dissolve` | Lit, cháy rụi theo `_Amount`; `_EdgeColor`, `_EdgeWidth`, `_NoiseScale` |
| | `Effects/Matcap` | `_MatCap` (có sẵn chất "đất sét" khi chưa có ảnh matcap) |
| | `Effects/Scrolling Texture` | `_MainTex`, `_Color`, `_Speed` |
| | `Effects/Silhouette` | Hiện bóng nhân vật sau tường: thêm làm **material thứ 2** |
| Khác | `Nature/Wind Sway` | Cỏ, cây, cờ: `_WindStrength`, `_WindSpeed`, `_WindScale`, `_Cutoff` |
| | `Stylized/Water` | Sóng + fresnel + bọt: `_ShallowColor`, `_DeepColor`, `_WaveHeight`, `_WaveScale`, `_WaveSpeed`, `_FoamColor`, `_Foam` |
| | `Prototype/Grid` | Lưới world-space để dựng màn: `_Color`, `_LineColor`, `_GridSize`, `_LineWidth` |
| | `Stencil/Mask` + `Stencil/Masked` | Cổng, cửa sổ, vùng che: object dùng `Masked` chỉ hiện bên trong `Mask` cùng `_StencilRef` |

## 2D (sprite)

| Shader | Thuộc tính chính |
|---|---|
| `Sprites/Default` | Mặc định của SpriteRenderer |
| `Sprites/Additive`, `Sprites/Multiply`, `Sprites/Screen` | Chế độ blend |
| `Sprites/Grayscale` | `_Amount`, `_Color` |
| `Sprites/Color Adjust` | `_Hue`, `_Saturation`, `_Brightness`, `_Contrast` |
| `Sprites/Flash` | Nháy khi trúng đòn: `_FlashColor`, `_FlashAmount` |
| `Sprites/Outline` | `_OutlineColor`, `_Thickness` |
| `Sprites/Glow` | `_GlowColor`, `_GlowSize`, `_Intensity`, `_Pulse` |
| `Sprites/Drop Shadow` | `_ShadowColor`, `_ShadowOffset`, `_Softness` |
| `Sprites/Dissolve` | `_Amount`, `_EdgeColor`, `_EdgeWidth`, `_Scale` |
| `Sprites/Shine` | Vệt sáng quét: `_ShineColor`, `_Width`, `_Speed`, `_Pause`, `_Angle` |
| `Sprites/Pixelate` | `_PixelSize` |
| `Sprites/Blur` | `_Radius` |
| `Sprites/Wave` | `_Amplitude`, `_Frequency`, `_Speed` |
| `Sprites/Wind` | `_Strength`, `_Speed`, `_Phase` |
| `Sprites/Scroll` | `_Speed` (XY) |

## Ví dụ: nháy đỏ khi trúng đòn

```ts
import { Color, Material, MonoBehaviour, SpriteRenderer, WaitForSeconds } from '@pia/core';

export class HitFlash extends MonoBehaviour {
  private _flash: Material | null = null;

  start() {
    const sr = this.getComponent(SpriteRenderer)!;
    this._flash = Material.create('Sprites/Flash');
    this._flash.setColor('_FlashColor', Color.red);
    sr.sharedMaterials = [this._flash];
  }

  *flash() {
    this._flash?.setFloat('_FlashAmount', 1);
    yield new WaitForSeconds(0.1);
    this._flash?.setFloat('_FlashAmount', 0);
  }

  onHit() {
    this.startCoroutine(this.flash());
  }
}
```
