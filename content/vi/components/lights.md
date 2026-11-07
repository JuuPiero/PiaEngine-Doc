---
title: Light & môi trường
description: Đèn Directional / Point / Spot, bóng đổ, ánh sáng môi trường và fog.
---

# Light & môi trường

## Light

Nguồn sáng cho pipeline 3D (`UnityEngine.Light`). Đèn Directional và Spot chiếu theo trục **-Z cục bộ**. **GameObject → Light → Directional Light / Point Light / Spotlight**.

| Thuộc tính | Field | Mặc định | Mô tả |
|---|---|---|---|
| Type | `type` | `Directional` | `Directional`, `Point`, `Spot` |
| Color | `color` | trắng ấm | |
| Intensity | `intensity` | `1` | |
| Range | `range` | `10` | Tầm chiếu (Point, Spot) |
| Spot Angle | `spotAngle` | `30` | Góc nón (Spot) |
| Shadow Type | `shadows` | `Soft Shadows` | `No Shadows`, `Hard Shadows`, `Soft Shadows` |

Object có bóng còn phụ thuộc **Cast Shadows / Receive Shadows** của [MeshRenderer / SkinnedMeshRenderer](rendering-3d.md).

```ts
const light = this.getComponent(Light)!;
light.intensity = 0.5 + Math.sin(Time.time * 10) * 0.2;   // đèn chập chờn
light.type = 'Point';
```

Trong shader, đèn Directional chính có sẵn dưới tên `_WorldSpaceLightPos0` / `_LightColor0` (xem [Viết shader](../graphics/writing-shaders.md)).

## Môi trường của scene

Click tên scene trong Hierarchy → **Scene Settings**:

| Thiết lập | Mô tả |
|---|---|
| Ambient Intensity | Cường độ ánh sáng môi trường / phản chiếu của bầu trời (0..3) |
| Fog | Bật sương mù |
| Fog Color, Fog Start, Fog End | Màu và khoảng cách bắt đầu / đặc hoàn toàn |

Phần Environment chỉ hiện với scene pipeline 3D.

::: note Chưa hỗ trợ
Lighting settings / lightmap (bake), light probe, reflection probe, area light.
:::
