---
title: Shader Graph
description: Package com.pia.shadergraph — dựng shader bằng node như Shader Graph của Unity: khoảng 100 node, preview từng node, target Lit / Unlit / Sprite / Fullscreen, lưu là material dùng được ngay.
---

# Shader Graph (`com.pia.shadergraph`)

Dựng shader bằng node, giống **Shader Graph** của Unity: nối các node trong một cửa sổ, xem preview ngay trên từng node, lưu lại là material dùng được luôn.

- **4 target:**
  - **Lit:** 3D có chiếu sáng của engine: Base Color, Normal, Metallic, Smoothness, Emission, Ambient Occlusion, Alpha.
  - **Unlit:** 3D không chiếu sáng.
  - **Sprite:** cho SpriteRenderer trên pipeline 2D.
  - **Fullscreen:** hiệu ứng hậu kỳ cho camera, qua component `PostEffect`.
- **Khoảng 100 node** cùng tên, cùng cổng và cùng công thức với Unity:
  - **Input:** Float, Vector, Color, Time, UV, Position, Normal Vector, View Direction, Screen Position, Vertex Color, Sample Texture 2D (LOD), Triplanar…
  - **Math:** cộng trừ nhân chia, Lerp, Smoothstep, Remap, Clamp, lượng giác, vector, đạo hàm…
  - **UV:** Tiling And Offset, Rotate, Polar Coordinates, Twirl, Flipbook, Spherize…
  - **Procedural:** Simple / Gradient Noise, Voronoi, Checkerboard, Rectangle, Ellipse, Polygon…
  - **Artistic:** Blend (22 chế độ), Hue, Saturation, Contrast, Normal Blend / Strength / From Height…
  - **Utility:** Fresnel, Branch, Comparison, Custom Function (GLSL tự viết).
- **Dời vertex:** khối **Position (Vertex)** trên Master Stack, dùng cho cờ bay, nước gợn, cỏ lay…
- **Preview từng node** và **Main Preview** (quả cầu xoay được hoặc mặt phẳng). Node dùng Time thì preview chạy liên tục.
- **Lưu là dùng được ngay:** material dùng graph cập nhật tức thì trong Scene / Game view. Graph tự sinh shader của engine, nên bản build không mang theo code nào của Shader Graph.

## Cài

```bash
cd MyGame
npm install ../PiaEngine/pia-packages/com.pia.shadergraph     # hoặc Window → Package Manager → Add package from disk
```

## Bắt đầu nhanh

1. **Assets → Create → Shader Graph → Lit Shader Graph** (hoặc Unlit / Sprite Unlit / Fullscreen), đặt tên. Cửa sổ Shader Graph mở ra.
2. **Chuột phải** vào vùng trống (hoặc phím **Space**) → gõ tên node (`fresnel`, `noise`, `lerp`…) → **Enter**.
3. Kéo từ chấm đầu ra của node này sang chấm đầu vào của node khác để nối. Kéo dây ra chỗ trống thì menu tạo node mở ra, node mới được nối sẵn.
4. **Blackboard → +** để thêm property (Color, Float, Texture 2D…). Kéo property vào canvas để dùng. Property hiện trong Inspector của material.
5. **Ctrl+S** để lưu, rồi bấm **Tạo Material** trên thanh công cụ. Kéo material lên object.

Nháy đúp một file `.shadergraph.json` trong Project để mở lại.

## Cửa sổ

| Phần | Việc |
|---|---|
| Canvas | Node và dây. Literal của cổng chưa nối nằm bên trái node: số, vector, màu, checkbox. Cổng có giá trị mặc định đặc biệt (UV0, World Space, View Dir…) hiện dạng nhãn xám |
| Blackboard | Property: Name (nhãn trong Inspector), Reference (tên biến material lưu, ví dụ `_GlowColor`), giá trị mặc định, Range, HDR, Normal Map, Tiling / Offset, Hide in Inspector. Texture có ô **Preview** (kéo texture từ Project vào) chỉ dùng cho preview của graph |
| Graph Inspector | Target, Surface Type (Opaque / Transparent), Blending Mode (Alpha / Premultiply / Additive / Multiply), Lighting (Standard PBR / Toon / Lambert / Blinn-Phong), Alpha Clipping, Two Sided, Fog, Queue Offset; thông tin node đang chọn; danh sách lỗi (bấm để chọn node gây lỗi) |
| Main Preview | Kết quả của cả graph trên Sphere (kéo chuột để xoay) hoặc Quad |
| Code | Xem shader được sinh ra (chỉ đọc) |

Các bảng là cửa sổ nổi trên canvas, bật tắt bằng nút trên thanh công cụ. Cửa sổ hẹp thì chỉ hiện Main Preview.

| Phím | Việc |
|---|---|
| Chuột phải / Space | Create Node |
| Kéo trên vùng trống | Chọn nhiều node (giữ Shift để cộng thêm) |
| Chuột giữa / Alt + kéo / Space + kéo | Di chuyển canvas |
| Lăn chuột | Phóng to / thu nhỏ |
| Delete | Xoá node / dây đang chọn (bấm vào dây để chọn) |
| Ctrl+C / Ctrl+V / Ctrl+D | Copy / dán / nhân bản node (giữ dây giữa chúng) |
| Ctrl+Z / Ctrl+Y | Undo / redo trong graph |
| Ctrl+S | Lưu |
| A / F | Nhìn toàn bộ graph / các node đang chọn |

Kéo một đầu vào đã nối là nhấc dây khỏi đó (để nối sang chỗ khác).

## Target

| Target | Dùng cho | Master Stack |
|---|---|---|
| Lit | MeshRenderer 3D, chiếu sáng như Standard (đèn, bóng, ambient, fog) | Position (Vertex), Base Color, Normal (Tangent Space), Metallic, Smoothness, Emission, Ambient Occlusion, Alpha, Alpha Clip Threshold |
| Unlit | MeshRenderer 3D, màu xuất thẳng | Position (Vertex), Base Color, Alpha, Alpha Clip Threshold |
| Sprite | SpriteRenderer 2D. Node **Main Texture** = sprite đang vẽ; màu của SpriteRenderer được engine nhân sau | Base Color, Alpha, Alpha Clip Threshold |
| Fullscreen | `PostEffect` trên Camera. **Main Texture** = ảnh camera (URP Sample Buffer của Unity). Chọn Pipeline 3D / 2D theo camera | Base Color, Alpha |

Template Sprite và Fullscreen đã nối sẵn Main Texture → Base Color.

Dùng hiệu ứng Fullscreen: thêm component **PostEffect** vào Camera, gán material của graph. Nhiều PostEffect chạy lần lượt theo thứ tự component.

## Kiểu dữ liệu

Giống Unity:

- **Màu dây theo kiểu:** Float xanh ngọc, Vector2 xanh lá, Vector3 vàng, Vector4 hồng, Texture đỏ, Boolean tím.
- **Node "dynamic"** (Add, Multiply, Lerp…) lấy kích thước lớn nhất trong các dây nối vào.
- **Chuyển kiểu:** Float nối vào Vector thì lặp ra mọi thành phần; vector ngắn nối vào vector dài thì thêm 0; vector dài nối vào vector ngắn thì cắt bớt.
- **Màu nhập trong graph** (node Color, cổng màu) là sRGB; với target 3D, engine đổi sang linear như cách nó làm với màu của material.

## Lưu ý

- Một số node chỉ chạy ở **fragment** vì cần đạo hàm màn hình: Screen Position, DDX / DDY, Checkerboard, các hình (Rectangle, Ellipse…), Normal From Height, Main Texture. Nối chúng vào Position (Vertex) thì graph báo lỗi.
- **Normal Vector (Object)** chỉ chính xác ở vertex. Ở fragment nó bằng Normal (World).
- **Texture** phải là property (Texture 2D trên Blackboard) để material gán được.
- **Custom Function:** viết thân hàm `vec4 f(vec4 A, vec4 B, vec4 C, vec4 D)` bằng GLSL, ví dụ `return A * B;` hoặc chỉ một biểu thức.
- **Preview gần đúng:** preview dùng quả cầu tính toán và ánh sáng xấp xỉ. Kết quả chính xác là trên object trong scene (cập nhật ngay khi lưu).
- **File `.shadergraph.json`** chứa cả graph lẫn shader được sinh ra. Material tham chiếu nó bằng GUID như mọi shader.

## Cách hoạt động (cho người viết package)

- `Editor/nodes.ts`: thư viện node. Mỗi node sinh biểu thức GLSL. Giá trị ngữ cảnh (UV, vị trí, normal, hướng nhìn…) đọc qua macro `SG_*`, nên một node chạy được trên mọi target lẫn preview.
- `Editor/codegen.ts`: `StageBuilder` suy kiểu động, sinh biến theo thứ tự phụ thuộc, báo vòng lặp và node fragment-only ở vertex. `generateShader` lắp vào khuôn ShaderLab của engine:
  - Lit = surface shader `surf()`;
  - Unlit / Fullscreen 3D = `frag()` trên three.js;
  - Sprite / Fullscreen 2D = `frag()` trên Pixi;
  - Position = `VERTEXPROGRAM vert()`.
- `Editor/preview.ts`: một context WebGL2 duy nhất vẽ mọi preview (program cache theo mã nguồn).
- Core đọc trường `shader` của file JSON (`shaderSourceOf` trong `Shader.ts`); `.shadergraph.json` là asset loại `shader`.
- Tự động hoá (test, AI): `globalThis.__piaShaderGraph` (`doc`, `open`, `create`, `templateGraph`, `generateShader`, `previewProgram`, `NODES`).
- Test: `node scripts/test-core.mjs "pia-packages/com.pia.shadergraph/Tests~/codegen.test.ts"` (mọi node × mọi target qua parser ShaderLab của core).
