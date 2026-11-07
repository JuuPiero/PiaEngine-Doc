---
title: Render state & thuộc tính
description: Bảng tra kiểu thuộc tính, attribute của property và các lệnh render state trong file .shader.
---

# Render state & thuộc tính

## Kiểu thuộc tính

| Khai báo | Kiểu | Giá trị mặc định |
|---|---|---|
| `_C ("Label", Color) = (1,1,1,1)` | Màu | `(r,g,b,a)` |
| `_F ("Label", Float) = 0.5` | Số | số |
| `_R ("Label", Range(0, 1)) = 0.5` | Slider | số |
| `_I ("Label", Int) = 2` | Số nguyên | số |
| `_V ("Label", Vector) = (0,1,0,0)` | Vector4 | `(x,y,z,w)` |
| `_T ("Label", 2D) = "white" {}` | Texture | `"white"`, `"black"`, `"gray"`, `"bump"` |

## Attribute của property

Inspector của material hiểu như Unity:

| Attribute | Tác dụng |
|---|---|
| `[Toggle]` | Checkbox (0 / 1) |
| `[Enum(Off,0,On,1)]` | Dropdown với danh sách tên, giá trị |
| `[Enum(UnityEngine.Rendering.CullMode)]` | Dropdown theo enum Unity: `CullMode`, `CompareFunction`, `BlendMode`, `StencilOp` |
| `[KeywordEnum(A,B)]` | Dropdown |
| `[HDR]` | Màu có cường độ > 1 |
| `[IntRange]` | Slider số nguyên (với `Range`) |
| `[Header(Tiêu đề)]`, `[Space]` | Tiêu đề / khoảng trống phía trên |
| `[HideInInspector]` | Ẩn |
| `[NoScaleOffset]` | Texture không có Tiling / Offset |
| `[Normal]` | Texture là normal map (hoặc mặc định `"bump"`) |

Texture có Tiling khác 1 tự lặp, không cần đổi Wrap Mode.

## Render state

Viết ở phần header (ngoài `GLSLPROGRAM`):

| Lệnh | Giá trị |
|---|---|
| `Pipeline` | `2D`, `3D` |
| `Lighting` | `Standard`, `Toon`, `Lambert`, `BlinnPhong`, `Unlit` (shader 3D có `surf`) |
| `Blend` | `Opaque`, `Alpha`, `Additive`, `Multiply`, `Screen`, hoặc hệ số Unity: `Blend SrcAlpha One`, `Blend One OneMinusSrcAlpha, One One`, `Blend [_SrcBlend] [_DstBlend]` |
| `BlendOp` | `Add`, `Sub`, `RevSub`, `Min`, `Max` |
| `Cull` | `Back`, `Front`, `Off`; nhận `[_Property]` |
| `ZWrite` | `On`, `Off`; nhận `[_Property]`. Mặc định `On` với `Blend Opaque`, `Off` với blend khác |
| `ZTest` | `Less`, `LEqual`, `Equal`, `GEqual`, `Greater`, `NotEqual`, `Always`; nhận `[_Property]` |
| `ColorMask` | `RGBA`; `0` = không ghi màu (chỉ depth / stencil) |
| `Offset` | `Offset -1, -1` (chống z-fighting cho decal) |
| `Queue` / `Tags { "Queue"="Transparent+1" }` | `Background` (1000), `Geometry` (2000), `AlphaTest` (2450), `Transparent` (3000), `Overlay` (4000), ± số. Mặc định `Geometry` với `Blend Opaque`, `Transparent` với blend khác |
| `Stencil { … }` | `Ref` (nhận `[_Prop]`), `Comp`, `Pass`, `Fail`, `ZFail`, `ReadMask`, `WriteMask` |
| `Fog` | `On` / `Off` (mặc định bật, trừ blend cộng / nhân) |
| `Padding` | 2D: số pixel vẽ thêm quanh sprite |

Hầu hết render state áp cho shader 3D; shader 2D dùng `Blend` và `Padding`.

## Ví dụ: stencil

Cặp shader dựng sẵn `Stencil/Mask` + `Stencil/Masked` dùng stencil để làm cổng / cửa sổ. Viết tay:

```shaderlab
Shader "Custom/PortalMask"
{
    Properties { [IntRange] _Ref ("Stencil Ref", Range(0, 255)) = 1 }
    Pipeline 3D
    ColorMask 0          // không vẽ màu, chỉ ghi stencil
    ZWrite Off
    Queue Geometry-1
    Stencil
    {
        Ref [_Ref]
        Comp Always
        Pass Replace
    }

    GLSLPROGRAM
    vec4 frag(vec2 uv) { return vec4(0.0); }
    ENDGLSL
}
```
