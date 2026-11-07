---
title: Port shader từ Unity
description: Chuyển shader ShaderLab / Cg / HLSL của Unity sang shader PiaEngine.
---

# Port shader từ Unity

Phần header gần như giữ nguyên; phần code chuyển từ Cg/HLSL sang GLSL (nhiều cú pháp HLSL vẫn dùng thẳng được).

## Đối chiếu cấu trúc

| Unity | PiaEngine |
|---|---|
| `Shader "Name" { Properties { … } }` | Giữ nguyên |
| `SubShader { Pass { … } }` | Bỏ: một file = một pass. Cần nhiều pass → dùng nhiều material trong list Materials |
| `Tags { "Queue"="Transparent" }` | Giữ nguyên, hoặc `Queue Transparent` |
| `Blend`, `BlendOp`, `Cull`, `ZWrite`, `ZTest`, `ColorMask`, `Offset`, `Stencil { … }` | Giữ nguyên, đặt ở header |
| `CGPROGRAM … ENDCG` / `HLSLPROGRAM … ENDHLSL` | `GLSLPROGRAM … ENDGLSL` |
| `#pragma vertex vert` + `#pragma fragment frag` | Viết `vec4 frag(vec2 uv)`; dịch đỉnh dùng `VERTEXPROGRAM vec3 vert(vec3 position, vec3 normal)` |
| `#pragma surface surf Standard` | `Lighting Standard` + `void surf(Input IN, inout SurfaceOutput o)` |
| `#include "UnityCG.cginc"` | Bỏ: các hàm hay dùng đã có sẵn |
| `#pragma multi_compile`, `shader_feature` | Chưa có: dùng `[Toggle]` + `if` trong code |
| Pipeline | Thêm `Pipeline 2D` (sprite) hoặc `Pipeline 3D` (mesh) |

## Đối chiếu code

| Unity (HLSL) | PiaEngine (GLSL) |
|---|---|
| `float2/3/4`, `half*`, `fixed*`, `float3x3` | Dùng được (hoặc `vec2/3/4`, `mat3`) |
| `lerp`, `frac`, `saturate`, `tex2D`, `atan2`, `ddx`/`ddy` | Dùng được |
| `mul(M, v)` | `M * v` |
| `tex2D(_MainTex, i.uv)` | `mainTex(uv)` (đã áp Tiling/Offset) hoặc `tex2D(_MainTex, TRANSFORM_TEX(uv, _MainTex))` |
| `_Time`, `_SinTime`, `_CosTime`, `_ScreenParams` | Giống Unity |
| `_WorldSpaceLightPos0`, `_LightColor0`, `_WorldSpaceCameraPos` | Giống Unity |
| `UnpackNormal`, `clip`, `Luminance` | Giống Unity |
| `i.worldPos`, `i.worldNormal` (tự truyền qua v2f) | Unlit: varying có sẵn `vWorldPos`, `vNormal`, `vViewDir`, `vUv`; Lit: `IN.worldPos`, `IN.worldNormal`, `IN.viewDir`… |
| `UNITY_MATRIX_MVP`, `unity_ObjectToWorld` | `projectionMatrix`, `viewMatrix`, `modelMatrix` |
| `SurfaceOutputStandard o` | `SurfaceOutput o` với `Albedo`, `Alpha`, `Normal`, `Metallic`, `Smoothness`, `Occlusion`, `Emission` |

## Ví dụ: rim light

Unity (Cg, unlit):

```glsl
fixed4 frag (v2f i) : SV_Target {
    float rim = 1.0 - saturate(dot(normalize(i.viewDir), normalize(i.normal)));
    return _RimColor * pow(rim, _RimPower);
}
```

PiaEngine:

```shaderlab
Shader "Custom/Rim"
{
    Properties
    {
        _RimColor ("Rim Color", Color) = (0.3, 0.7, 1, 1)
        _RimPower ("Rim Power", Range(0.5, 8)) = 3
    }
    Pipeline 3D
    Blend Additive

    GLSLPROGRAM
    vec4 frag(vec2 uv)
    {
        float rim = 1.0 - saturate(dot(normalize(vViewDir), normalize(vNormal)));
        return _RimColor * pow(rim, _RimPower);
    }
    ENDGLSL
}
```

## Không port được (chưa hỗ trợ)

GrabPass, depth texture, post-processing, RenderTexture, nhiều Pass trong một file, keyword / variant, `#include`, cubemap, compute / geometry / tessellation shader. Xem danh sách đầy đủ ở [Viết shader](writing-shaders.md#chua-ho-tro).
