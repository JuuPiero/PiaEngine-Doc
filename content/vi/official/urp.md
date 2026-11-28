---
title: Universal RP
description: Package com.pia.urp — URP Asset, Volume + 17 hiệu ứng hậu kỳ (Bloom, Tonemapping, Depth Of Field, Motion Blur, Color Curves…), FXAA, Full Screen Pass / SSAO / Decal, shader Lit / Simple Lit / Unlit, 2D Renderer (Light 2D, Shadow Caster 2D, blend style, normal map, Target Sorting Layers) như Universal Render Pipeline của Unity.
---

# Universal RP (`com.pia.urp`)

Mô phỏng **Universal Render Pipeline** của Unity trên PiaEngine: URP Asset cho chất lượng hình ảnh, **Volume** + **Volume Profile** cho hậu kỳ (Bloom, Tonemapping, Color Adjustments…), FXAA, Full Screen Pass, các shader `Universal Render Pipeline/Lit`, `Simple Lit`, `Unlit`, và 2D Renderer (Light 2D, Shadow Caster 2D).

- **URP Asset** (Project Settings → Graphics): HDR, MSAA, Render Scale, bóng đổ (độ phân giải, khoảng cách, mềm / cứng, đèn phụ), Post Processing bật / tắt, Default Volume Profile, Renderer Features.
- **Volume** (Global hoặc Local theo collider, Blend Distance, Weight, Priority) trộn các override giống Unity: mỗi tham số có ô **override** riêng, tham số không override giữ giá trị mặc định / của volume thấp hơn.
- **17 override hậu kỳ:** Bloom, Tonemapping (Neutral / ACES), Color Adjustments, White Balance, Vignette, Chromatic Aberration, Film Grain, Lens Distortion, Lift Gamma Gain, Split Toning, Channel Mixer, Shadows Midtones Highlights, Color Curves, Color Lookup, Panini Projection, Depth Of Field (Gaussian / Bokeh), Motion Blur. Cùng tên tham số, cùng mặc định và cùng công thức với URP.
- **SSAO và Decal** (Renderer Feature, 3D) + component **Decal Projector**.
- **Chạy cả 2D (PixiJS) lẫn 3D (three.js).** Ở 3D ảnh camera là HDR (half float) nên vùng sáng giữ được tới Bloom / Tonemapping. Ở 2D ảnh là LDR, giống Unity khi tắt HDR.
- **Full Screen Pass Renderer Feature:** một material (ví dụ Fullscreen Shader Graph) chạy trên ảnh camera, trước hoặc sau hậu kỳ.
- **2D Renderer:** Light 2D (Global / Spot / Freeform / Sprite, 4 blend style, normal map), Shadow Caster 2D, shader Sprite-Lit-Default (Mask, Normal Map) trên PixiJS.
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
| Renderer Features | Danh sách feature, **Feature** chọn loại: Full Screen Pass (Pass Material, Injection Point Before / After Rendering Post Processing), Screen Space Ambient Occlusion, Decal — xem bên dưới |

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
| Shadows Midtones Highlights | Shadows / Midtones / Highlights (màu + offset), Shadows Start / End, Highlights Start / End |
| Color Curves | Master, Red, Green, Blue, Hue Vs Hue, Hue Vs Sat, Sat Vs Sat, Lum Vs Sat (kéo điểm, nháy đúp thêm điểm, chuột phải xoá điểm) |
| Color Lookup | Lookup Texture (LUT dạng dải, ví dụ 1024 × 32 hoặc 256 × 16), Contribution |
| Panini Projection | Distance, Crop To Fit (camera perspective) |
| Depth Of Field (3D) | Mode Gaussian: Start, End, Max Radius, High Quality Sampling — Mode Bokeh: Focus Distance, Focal Length, Aperture, Blade Count / Curvature / Rotation |
| Motion Blur (3D) | Mode Camera Only, Quality, Intensity, Clamp (mờ theo chuyển động của camera) |

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

## SSAO và Decal (Renderer Feature, 3D)

Trong URP Asset: **Renderer Features → +**, đổi **Feature**:

- **Screen Space Ambient Occlusion**: làm tối các góc khuất, chỗ hai vật chạm nhau, tính từ depth của ảnh. Intensity (0–4), Radius (đơn vị world), Falloff Distance (xa hơn thì mờ dần), Samples (Low / Medium / High), Downsample (nửa độ phân giải: nhanh hơn, mềm hơn). Kết quả nhân vào cả ảnh (Unity chỉ nhân vào ánh sáng gián tiếp).
- **Decal**: vẽ các **Decal Projector** trong scene lên bề mặt phía sau chúng.

**Decal Projector**: **GameObject → Rendering → URP Decal Projector**, tạo material bằng **Assets → Create → Rendering → Decal Material** (shader `Shader Graphs/Decal`: Base Map, Base Color) rồi gán vào Material. Decal chiếu theo trục +Z (mũi tên trong Scene view), trong hộp Size với tâm Pivot; có Tiling / Offset, Opacity, Draw Distance + Start Fade, Angle Fade (mờ theo góc giữa bề mặt và hướng chiếu). Decal được vẽ sau cả vật trong suốt.

Các hiệu ứng cần depth (Depth Of Field, Motion Blur, SSAO, Decal) tự bật depth texture cho camera khi đang dùng; shader tự viết đọc được `_CameraDepthTexture`, `_ZBufferParams`, `unity_MatrixInvVP`… như Unity (khai báo `uniform` trong GLSL).

## 2D Renderer (Light 2D, Shadow Caster 2D)

Chiếu sáng sprite như 2D Renderer của URP:

1. **Assets → Create → Rendering → URP Asset (with 2D Renderer)** rồi chọn nó ở **Project Settings → Graphics** (hoặc đặt **Renderer = 2D** trong URP Asset đang dùng). Không chọn URP Asset nào thì Light 2D vẫn chạy.
2. **Assets → Create → Rendering → Sprite-Lit Material** (shader `Universal Render Pipeline/2D/Sprite-Lit-Default`) rồi gán vào **Material** của các SpriteRenderer cần nhận ánh sáng. Sprite dùng material mặc định (Sprites-Default) hoặc `Sprite-Unlit-Default` thì không bị ảnh hưởng (UI, hiệu ứng phát sáng…).
3. **GameObject → Light 2D → Global Light 2D** (độ sáng nền) và **Spot Light 2D / Freeform Light 2D / Sprite Light 2D**.
4. Muốn có bóng: bật **Shadows** trên đèn và thêm **Shadow Caster 2D** vào các vật chắn sáng.

| Light Type | Field |
|---|---|
| Global | Color, Intensity: sáng đều mọi nơi (nhiều Global Light thì cộng lại) |
| Point (Spot) | Radius Inner / Outer, Inner / Outer Spot Angle (nón quanh trục up của object, 360 = tròn), Falloff Strength |
| Freeform | Shape Path (đa giác, đơn vị local; chọn đèn rồi kéo các điểm trong Scene view), Falloff (viền mềm), Falloff Strength |
| Sprite | Sprite (cookie): ảnh của sprite nhân Color × Intensity |

Mọi đèn có **Target Sorting Layers** (dropdown All / None / từng layer, mặc định mọi layer): chỉ sprite trên các Sorting Layer đó nhận đèn — ví dụ đèn trong nhà chỉ chiếu layer Interior, nền trời chỉ nhận Global Light riêng. Layer không có đèn nào chiếu (hay chỉ có đèn Additive) thì sprite giữ màu gốc. Mọi loại (trừ Global) có **Shadows** + **Strength**. **Shadow Caster 2D**: Casting Source = Sprite Renderer (khung của sprite, mặc định) hoặc Shape Editor (Shape Path tự vẽ, kéo điểm trong Scene view), Casts Shadows, Self Shadows (vật tự bị bóng của mình phủ).

**Blend Style** của đèn (4 kiểu mặc định của Unity):

| Blend Style | Tác dụng |
|---|---|
| 0 Multiply | Nhân với màu sprite (mặc định) |
| 1 Additive | Cộng màu đèn lên trên (phát sáng, tia lửa) |
| 2 Multiply with Mask (R) | Như Multiply, nhân thêm kênh đỏ của **Mask** |
| 3 Additive with Mask (R) | Như Additive, nhân thêm kênh đỏ của Mask |

Material Sprite-Lit có **Mask** (`_MaskTex`) và **Normal Map** (`_NormalMap`): hai ảnh cùng bố cục với ảnh của sprite (cùng kích thước / cùng atlas). Mask đen ở chỗ nào thì đèn kiểu 2 / 3 không chiếu tới chỗ đó. Chỉ có đèn Additive thì sprite giữ màu gốc rồi cộng thêm ánh sáng.

**Normal Maps** trên đèn (Disabled / Fast / Accurate, Distance = độ cao của đèn trên mặt sprite): sprite có Normal Map nhận sáng theo hướng bề mặt (gồ ghề nổi khối); sprite không có Normal Map được xem là mặt phẳng hướng ra camera. Normal map theo chuẩn Unity (xanh lá = lên), xoay theo sprite.

- Scene view hiện ánh sáng giống Game view, vòng bán kính / nón / đa giác của đèn đang chọn.
- Không có Light 2D nào trong scene thì Sprite-Lit vẽ như sprite thường (đủ sáng). Đã có đèn thì chỗ không đèn nào chiếu tới tối đen, nên thường cần một Global Light 2D.
- Ánh sáng cộng dồn tới tối đa 2× (Intensity 2 làm sprite sáng gấp đôi, chỗ trắng thì bão hoà).
- Shader tự viết: khai báo `uniform sampler2D _ShapeLightTexture0; uniform vec4 _ShapeLightParams;` rồi lấy ánh sáng tại pixel bằng `texture(_ShapeLightTexture0, vTargetPos * _ShapeLightParams.xy).rgb * _ShapeLightParams.z` (xem shader Sprite-Lit-Default; `_ShapeLightParams.w` = 0 khi chiếu sáng 2D đang tắt).

**Hiệu năng:** texture ánh sáng có nửa độ phân giải (như Light Render Texture Scale 0.5 mặc định của Unity). Đèn đứng yên không được dựng lại, và scene không có gì di chuyển thì không vẽ lại texture ánh sáng (≈ 0.1 ms / khung). Mỗi đèn có bóng tốn thêm 2 lượt vẽ, nên chỉ bật Shadows cho những đèn cần. Vật chắn nằm ngoài bán kính đèn Point bị bỏ qua. Mỗi Blend Style đang dùng có một texture ánh sáng riêng (các Sorting Layer cùng bộ đèn dùng chung một dải của texture: thường chỉ một dải); đèn bật Normal Maps thêm một lượt vẽ normal của các sprite Sprite-Lit (cũng chỉ khi có gì đó di chuyển).

## Chưa có

- Depth Of Field / Motion Blur trên camera 2D (Unity 2D Renderer cũng không có: không có depth).
- Camera Stacking theo kiểu URP (camera Base / Overlay + danh sách Stack): engine đã chồng nhiều camera theo `depth` (Clear Flags = Depth Only); hậu kỳ áp riêng cho từng camera có Universal Additional Camera Data.
- Light 2D chỉ chạy với pipeline 2D (như Unity). Tối đa 16 Sorting Layer có ánh sáng riêng; từ layer thứ 17 trở đi dùng chung đèn của layer thứ 16.
