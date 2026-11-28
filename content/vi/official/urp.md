---
title: Universal RP
description: Package com.pia.urp — URP Asset, Volume + Volume Profile và hậu kỳ (Bloom, Tonemapping, Color Adjustments, Vignette…), FXAA, Full Screen Pass, shader Lit / Simple Lit / Unlit như Universal Render Pipeline của Unity; chạy cả 2D lẫn 3D.
---

# Universal RP (`com.pia.urp`)

Mô phỏng **Universal Render Pipeline** của Unity trên PiaEngine: URP Asset cho chất lượng hình ảnh, **Volume** + **Volume Profile** cho hậu kỳ (Bloom, Tonemapping, Color Adjustments…), FXAA, Full Screen Pass, và các shader `Universal Render Pipeline/Lit`, `Simple Lit`, `Unlit`.

- **URP Asset** (Project Settings → Graphics): HDR, MSAA, Render Scale, bóng đổ (độ phân giải, khoảng cách, mềm / cứng, đèn phụ), Post Processing bật / tắt, Default Volume Profile, Renderer Features.
- **Volume** (Global hoặc Local theo collider, Blend Distance, Weight, Priority) trộn các override giống Unity: mỗi tham số có ô **override** riêng, tham số không override giữ giá trị mặc định / của volume thấp hơn.
- **11 override hậu kỳ:** Bloom, Tonemapping (Neutral / ACES), Color Adjustments, White Balance, Vignette, Chromatic Aberration, Film Grain, Lens Distortion, Lift Gamma Gain, Split Toning, Channel Mixer. Cùng tên tham số, cùng mặc định và cùng công thức với URP.
- **Chạy cả 2D (PixiJS) lẫn 3D (three.js).** Ở 3D ảnh camera là HDR (half float) nên vùng sáng giữ được tới Bloom / Tonemapping. Ở 2D ảnh là LDR, giống Unity khi tắt HDR.
- **Full Screen Pass Renderer Feature:** một material (ví dụ Fullscreen Shader Graph) chạy trên ảnh camera, trước hoặc sau hậu kỳ.
- **Shader URP:** Lit (PBR Metallic: Base Map, Metallic / Smoothness, Normal Map, Occlusion, Emission), Simple Lit (Blinn-Phong + Specular), Unlit. Có Surface Options như Unity: Render Face, Blend, Depth Write, Alpha Clipping.

## Cài

```bash
cd MyGame
npm install ../PiaEngine/pia-packages/com.pia.urp     # hoặc Window → Package Manager → Add package from disk
```

## Bắt đầu nhanh

1. **Assets → Create → Rendering → URP Asset**.
2. **Edit → Project Settings → Graphics → Render Pipeline Asset**: chọn asset vừa tạo.
3. **GameObject → Volume → Global Volume**. Camera chính được thêm component **Universal Additional Camera Data** nếu chưa có.
4. Trong Inspector của Volume bấm **New** để tạo Volume Profile, rồi **Add Override → Bloom** (hoặc Tonemapping, Vignette…).
5. Tick ô bên trái tham số muốn đổi (override), rồi chỉnh giá trị. Game view và Scene view cập nhật ngay, không cần Play.

Không chọn URP Asset trong Project Settings thì Volume vẫn chạy với giá trị mặc định (HDR bật, MSAA 4x, Render Scale 1).

## URP Asset

| Mục | Ý nghĩa |
|---|---|
| Renderer | Universal (3D, hoặc 2D không đèn) / 2D |
| HDR | Camera 3D vẽ ra ảnh half float: màu > 1 giữ được tới Bloom / Tonemapping |
| Anti Aliasing (MSAA) | Disabled / 2x / 4x / 8x |
| Render Scale | 0.1–2: dưới 1 thì nhanh hơn và mềm hơn (UI vẫn giữ độ phân giải đầy đủ) |
| Main Light Shadows, Shadow Resolution, Max Distance | Bóng của đèn Directional: độ phân giải shadow map, bóng phủ bao xa trước camera (mét) |
| Additional Lights Shadows | Đèn Point / Spot có đổ bóng (shadow map nửa độ phân giải) |
| Soft Shadows | Bóng mềm (lọc PCF) hay cứng |
| Post Processing | Tắt thì Volume không có tác dụng (Full Screen Pass vẫn chạy) |
| Default Volume Profile | Profile áp dưới mọi Volume của scene (giống Unity 2023+) |
| Renderer Features | Danh sách Full Screen Pass: Name, Active, Pass Material, Injection Point (Before / After Rendering Post Processing) |

Asset được build mang theo (tham chiếu từ Project Settings), cùng với Default Volume Profile và các material của Renderer Features.

## Volume

| Field | Ý nghĩa |
|---|---|
| Mode | **Global**: tác dụng ở mọi nơi. **Local**: chỉ khi camera ở trong collider (Box / Sphere) trên cùng GameObject, mờ dần trong khoảng Blend Distance |
| Blend Distance | Khoảng (mét) ngoài collider mà volume mờ dần |
| Weight | 0–1, độ mạnh của volume |
| Priority | Volume priority cao hơn áp sau (thắng) |
| Profile | Volume Profile (asset `.asset.json`). **New** tạo profile mới, **Clone** chép profile đang dùng ra asset mới |

**GameObject → Volume → Box Volume / Sphere Volume** tạo Volume Local kèm collider trigger.

Cách trộn giống Unity:
1. Mọi tham số về giá trị mặc định, rồi áp Default Volume Profile của URP Asset.
2. Các Volume đang bật, theo thứ tự priority tăng dần. Độ mạnh của mỗi Volume = Weight × độ ảnh hưởng (1 bên trong collider, giảm dần tới 0 ở Blend Distance).
3. Mỗi tham số **được override** nội suy về giá trị của volume theo độ mạnh. Số, Color và Vector2 nội suy, còn enum và bool đổi khi độ mạnh > 0.

Camera chỉ thấy Volume nằm trên layer có trong **Volume Mask** của Universal Additional Camera Data.

## Universal Additional Camera Data

Component trên camera (giống Unity), thêm tự động khi tạo Volume:

| Field | Ý nghĩa |
|---|---|
| Post Processing | Camera này có nhận hiệu ứng của Volume không |
| Anti-aliasing | None / **FXAA** (khử răng cưa sau hậu kỳ, rẻ, dùng được cả 2D) |
| Volume Mask | Layer của các Volume tác dụng lên camera |

Thứ tự trên ảnh camera: Full Screen Pass (Before) → Bloom + Uber (mọi override) → FXAA → Full Screen Pass (After).

## Override hậu kỳ

| Override | Tham số |
|---|---|
| Bloom | Threshold, Intensity, Scatter, Tint, Clamp, High Quality Filtering |
| Tonemapping | Mode: None / Neutral / ACES |
| Color Adjustments | Post Exposure (EV), Contrast, Color Filter, Hue Shift, Saturation |
| White Balance | Temperature, Tint |
| Vignette | Color, Center, Intensity, Smoothness, Rounded |
| Chromatic Aberration | Intensity |
| Film Grain | Type (Thin / Medium / Large), Intensity, Response |
| Lens Distortion | Intensity, X / Y Multiplier, Center, Scale |
| Lift Gamma Gain | Lift, Gamma, Gain (màu + offset) |
| Split Toning | Shadows, Highlights, Balance |
| Channel Mixer | 9 hệ số Red / Green / Blue ← Red / Green / Blue |

Mỗi override có nút **All / None** (override mọi tham số / không tham số nào), checkbox bật tắt cả override, và **✕** để xoá.

## Đọc giá trị từ script

```ts
import { MonoBehaviour, field } from '@pia/core';
import { Volume, VolumeProfile } from 'com.pia.urp';

export class DamageFlash extends MonoBehaviour {
  @field(() => Volume) volume: Volume | null = null;

  flash() {
    const vignette = this.volume!.profile!.vignette;   // giống profile.TryGet<Vignette>(out var v)
    vignette.intensity = 0.6;
    if (!vignette.overrides.includes('intensity')) vignette.overrides.push('intensity');
  }
}
```

- `profile.add('bloom')` / `profile.remove('bloom')` / `profile.tryGet('bloom')` (null khi chưa thêm).
- Đổi `volume.weight` để làm hiệu ứng mờ dần (trúng đòn, chuyển cảnh…).
- `camera.getComponent(UniversalAdditionalCameraData).stack` chứa giá trị đã trộn của khung hình trước (giống `VolumeManager.instance.stack`).

## Full Screen Pass

1. Tạo shader fullscreen: **Assets → Create → Shader Graph → Fullscreen Shader Graph** (hoặc một shader `.shader` có `frag(vec2 uv)` đọc `mainTex(uv)`), rồi tạo material từ nó.
2. Trong URP Asset: **Renderer Features → +**, chọn material ở **Pass Material**, chọn **Injection Point**.

Ở 3D pass chạy trên ảnh tuyến tính (linear) như URP. Material cần shader đúng pipeline của camera: Fullscreen 3D cho camera three.js, Fullscreen 2D cho camera PixiJS.

## Chưa có

- Depth Of Field, Motion Blur, Panini Projection, Color Curves, Shadows Midtones Highlights, Color Lookup.
- SSAO, Decal, Camera Stacking theo kiểu URP (camera Overlay): dùng nhiều camera có `depth` khác nhau như trước.
- **2D Renderer** (Light 2D, Shadow Caster 2D, Sprite-Lit): đang làm.
