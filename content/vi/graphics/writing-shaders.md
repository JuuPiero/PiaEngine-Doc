---
title: Viết shader
description: Cấu trúc file .shader, shader 2D, shader 3D unlit và lit surface shader, vertex program, biến và hàm có sẵn.
---

# Viết shader

File `.shader` dùng cú pháp **kiểu ShaderLab** của Unity cho phần khai báo (thuộc tính, trạng thái render) và **GLSL** (WebGL2) cho phần code.

Tạo nhanh: **Project → Create → Shader → Sprite Shader (2D) / Lit Shader (3D) / Unlit Shader (3D)** — file mẫu có chú thích đầy đủ.

## Cấu trúc

```shaderlab
Shader "Custom/Tên"
{
    Properties
    {
        _Color ("Color", Color) = (1,1,1,1)       // thuộc tính hiện trong Inspector của material
        _MainTex ("Texture", 2D) = "white" {}
    }
    Pipeline 3D          // 2D = sprite (SpriteRenderer), 3D = mesh (MeshRenderer / SkinnedMeshRenderer)
    Blend Opaque         // render state (xem bảng Render state)
    Cull Back

    GLSLPROGRAM
    vec4 frag(vec2 uv) { return mainTex(uv) * _Color; }
    ENDGLSL
}
```

- Mỗi thuộc tính là một **uniform** cùng tên trong GLSL.
- `Pipeline` chọn loại shader: `2D` hoặc `3D`.
- Có **ba loại** shader: 2D (sprite), 3D unlit, 3D lit (surface shader).

## Shader 2D (sprite)

Viết `vec4 frag(vec2 uv)`:

- `uv`: 0..1 trên sprite (gốc dưới-trái).
- `mainTex(uv)` là chính sprite (alpha thường; ngoài 0..1 thì trong suốt).
- `_MainTex_TexelSize` = (1/w, 1/h, w, h).
- Màu của SpriteRenderer tự nhân vào kết quả.
- `Padding <px>` cho vẽ tràn ra ngoài sprite (viền, glow).

```shaderlab Assets/Shaders/Shine.shader
Shader "Custom/Shine"
{
    Properties
    {
        _ShineColor ("Shine Color", Color) = (1, 1, 1, 0.9)
        _Width ("Width", Range(0.02, 0.5)) = 0.18
        _Speed ("Speed", Float) = 0.7
        _Pause ("Pause", Float) = 1.2
        _Angle ("Angle", Range(-1, 1)) = 0.4
    }
    Pipeline 2D
    Blend Alpha

    GLSLPROGRAM
    // A band of light sweeps across the sprite, then pauses (like a shiny coin).
    vec4 frag(vec2 uv)
    {
        vec4 c = mainTex(uv);
        float period = 1.0 + _Pause;
        float t = mod(_Time.y * _Speed, period);              // 0..1 = sweeping, then a pause
        float pos = uv.x + uv.y * _Angle;
        float center = t * (1.0 + abs(_Angle) + 2.0 * _Width) - _Width + min(_Angle, 0.0);
        float shine = smoothstep(_Width, 0.0, abs(pos - center)) * _ShineColor.a;
        c.rgb = mix(c.rgb, _ShineColor.rgb, shine);
        return c;
    }
    ENDGLSL
}
```

## Shader 3D unlit

`vec4 frag(vec2 uv)` trả về **màu cuối cùng**. Varying (world space): `vUv`, `vUv2`, `vNormal`, `vWorldPos`, `vLocalPos`, `vViewDir`; hàm `vertexColor()`.

```shaderlab Assets/Shaders/Hologram.shader
Shader "Custom/Hologram"
{
    Properties
    {
        _Color ("Color", Color) = (0.25, 0.85, 1, 0.6)
        _RimPower ("Rim Power", Range(0.5, 8)) = 2.5
        _LineDensity ("Scan Lines", Float) = 40
        _ScrollSpeed ("Scroll Speed", Float) = 1.5
        _Wobble ("Wobble", Range(0, 0.1)) = 0.015
    }
    Pipeline 3D
    Blend Alpha
    Cull Back
    ZWrite Off

    GLSLPROGRAM
    // Rim light + scrolling scan lines (vNormal, vViewDir, vWorldPos are world space).
    vec4 frag(vec2 uv)
    {
        float rim = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewDir)), 0.0), _RimPower);
        float lines = 0.55 + 0.45 * sin(vWorldPos.y * _LineDensity - _Time.y * _ScrollSpeed * 6.0);
        vec3 col = _Color.rgb * (0.5 + 1.8 * rim) * lines;
        float a = clamp(_Color.a * (0.35 + rim) * lines, 0.0, 1.0);
        return vec4(col, a);
    }
    ENDGLSL

    VERTEXPROGRAM
    // small glitchy wobble along the normals
    vec3 vert(vec3 position, vec3 normal)
    {
        return position + normal * _Wobble * sin(_Time.y * 7.0 + position.y * 12.0);
    }
    ENDVERTEX
}
```

## Shader 3D lit (surface shader)

Viết `void surf(Input IN, inout SurfaceOutput o)` điền thông số bề mặt; engine lo chiếu sáng như surface shader của Unity: mọi đèn, bóng đổ, ánh sáng môi trường, fog, skinning. Chọn mô hình chiếu sáng bằng `Lighting`:

| `Lighting` | Mô hình |
|---|---|
| `Standard` (mặc định khi có `surf`) | PBR (metallic / smoothness) |
| `Toon` | Cel shading |
| `Lambert` | Khuếch tán |
| `BlinnPhong` | Khuếch tán + specular (`o.Specular`) |
| `Unlit` | Không chiếu sáng |

```shaderlab
Shader "Custom/Rock"
{
    Properties
    {
        [Header(Surface)] _Color ("Color", Color) = (1,1,1,1)
        _MainTex ("Albedo", 2D) = "white" {}
        [Normal] _BumpMap ("Normal Map", 2D) = "bump" {}
        _Glossiness ("Smoothness", Range(0, 1)) = 0.3
        [HDR] _EmissionColor ("Emission", Color) = (0,0,0,1)
        [Toggle] _Moss ("Moss", Float) = 0
        [Enum(UnityEngine.Rendering.CullMode)] _Cull ("Cull", Float) = 2
    }
    Pipeline 3D
    Lighting Standard        // Standard (PBR) | Toon | Lambert | BlinnPhong | Unlit
    Cull [_Cull]             // render state đọc từ property, như Unity

    GLSLPROGRAM
    void surf(Input IN, inout SurfaceOutput o)
    {
        vec4 c = mainTex(IN.uv) * _Color;                 // mainTex đã áp Tiling / Offset
        float moss = _Moss * saturate(IN.worldNormal.y);  // rêu mọc ở mặt hướng lên
        o.Albedo = mix(c.rgb, vec3(0.3, 0.5, 0.2), moss);
        o.Normal = UnpackNormal(tex2D(_BumpMap, TRANSFORM_TEX(IN.uv, _BumpMap)));
        o.Smoothness = _Glossiness;
        o.Emission = _EmissionColor.rgb;
    }
    ENDGLSL
}
```

| `Input IN` | `SurfaceOutput o` |
|---|---|
| `uv`, `uv2` | `Albedo`, `Alpha` |
| `worldPos`, `localPos` | `Normal` (tangent space, từ normal map) |
| `worldNormal`, `viewDir` | `WorldNormal` (nếu tự tính normal theo world) |
| `screenPos` (0..1) | `Metallic`, `Smoothness`, `Occlusion` |
| `color` (vertex color) | `Emission`, `Specular` (BlinnPhong) |

## Vertex program (3D)

Tuỳ chọn, cho cả shader unlit và lit: dịch chuyển đỉnh trong **object space**.

```shaderlab
VERTEXPROGRAM
vec3 vert(vec3 position, vec3 normal) { return position + normal * 0.02 * sin(_Time.y * 4.0); }
ENDVERTEX
```

## Biến và hàm có sẵn

Đặt tên giống Unity để port shader dễ:

| Nhóm | Có sẵn |
|---|---|
| Thời gian, màn hình | `_Time` = (t/20, t, 2t, 3t), `_SinTime`, `_CosTime`, `_ScreenParams` |
| 3D | `_WorldSpaceLightPos0` / `_LightColor0` (đèn Directional chính), `_WorldSpaceCameraPos`, ma trận `modelMatrix` / `viewMatrix` / `projectionMatrix` |
| Texture | `mainTex(uv)`; mỗi texture có `<tên>_ST` (tiling, offset) và dùng được `TRANSFORM_TEX(uv, _Tex)` |
| Hàm | `UnpackNormal`, `clip()`, `saturate`, `Luminance`, `alphaBlend` (chồng màu có alpha), `PI` |
| Cú pháp HLSL | `float2/3/4`, `half*`, `fixed*`, `float3x3`, `lerp`, `frac`, `tex2D`, `atan2`, `ddx` / `ddy` dùng thẳng được |

## Lỗi và hot reload

- Lỗi GLSL hiện trong **Console** kèm số dòng (tính từ đầu khối `GLSLPROGRAM`).
- Object có shader lỗi tạm vẽ bằng shader mặc định, game không bị dừng.
- Lưu file `.shader` là mọi chỗ dùng nó cập nhật ngay.

## Chưa hỗ trợ

- Shader 2D tự viết cho sprite trong scene 3D; vertex program cho sprite 2D.
- Đọc màn hình hoặc depth (GrabPass, khúc xạ, nước thật), post-processing, RenderTexture.
- Nhiều `Pass` trong một file (dùng nhiều material thay thế), keyword / variant, `#include`.
- Material cho UI và Particle System.
- Bóng đổ chưa tính `clip()` và dịch đỉnh trong shader.
- `ColorMask` chỉ bật hoặc tắt hết (không tắt riêng từng kênh).
- Cubemap, MaterialPropertyBlock.
- Compute / geometry / tessellation shader (giới hạn của WebGL2).

Tiếp: [Render state & thuộc tính](shader-reference.md), [Shader dựng sẵn](builtin-shaders.md).
