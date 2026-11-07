---
title: Render 3D
description: MeshFilter, MeshRenderer, SkinnedMeshRenderer — primitive và mesh của model glTF/FBX/OBJ.
---

# Render 3D

Scene pipeline **3D (three.js)**. Hình 3D vẽ bằng **MeshFilter + MeshRenderer** (primitive dựng sẵn hoặc mesh của [model](../assets/models.md)) và **SkinnedMeshRenderer** (mesh có xương / blend shape của model).

## MeshFilter

| Thuộc tính | Field | Mặc định | Mô tả |
|---|---|---|---|
| Mesh | `mesh` | `Cube` | Hình dựng sẵn (`Cube`, `Sphere`, `Capsule`, `Cylinder`, `Plane`, `Quad`) hoặc mesh của model (`"<guidModel>#mesh:<tên>"`) |

**GameObject → 3D Object → Cube…** tạo MeshFilter + MeshRenderer + collider phù hợp (như `GameObject.CreatePrimitive` của Unity). Nút chọn của ô Mesh liệt kê primitive và mesh của các model trong project; kéo mesh từ model (bấm ▸ trên model trong Project) vào ô cũng được.

## MeshRenderer

| Thuộc tính | Field | Mặc định | Mô tả |
|---|---|---|---|
| Materials | `sharedMaterials` | `[Default-Material]` | Mesh có nhiều submesh (model): material thứ i vẽ submesh thứ i. Material thừa vẽ thêm một lần (multi-pass, ví dụ `[Standard, Rim Glow]`). Default-Material / None = dùng các thông số Standard bên dưới |
| Albedo | `color` | trắng | Màu (khi không có material) |
| Albedo Map | `texture` | | Texture (khi không có material) |
| Metallic | `metallic` | `0` | 0..1 |
| Smoothness | `smoothness` | `0.5` | 0..1 |
| Emission | `emission` | đen | Màu tự phát sáng |
| Cast Shadows | `castShadows` | `true` | Đổ bóng |
| Receive Shadows | `receiveShadows` | `true` | Nhận bóng |

Albedo / Albedo Map / Metallic / Smoothness / Emission chỉ hiện khi list Materials rỗng, có Default-Material hoặc phần tử None. Mesh của model mặc định dùng material import kèm model (chỉ đọc, vẽ đúng như file) — xem [Model 3D](../assets/models.md#materials).

```ts
const mr = this.getComponent(MeshRenderer)!;
mr.color = Color.red;                                      // thông số inline
mr.material!.setColor('_Color', [0, 1, 0, 1]);              // bản sao riêng của material đầu tiên
mr.material!.mainTextureOffset = new Vector2(Time.time * 0.2, 0);  // cuộn texture
```

## SkinnedMeshRenderer

Mesh có xương (skinned) hoặc có blend shape của model. Tạo tự động khi kéo model vào Scene; các xương là GameObject con của model, nên di chuyển / animate chúng (bằng [Animator](animation.md#animator) hay script) thì mesh biến dạng theo.

| Thuộc tính | Field | Mặc định | Mô tả |
|---|---|---|---|
| Mesh | `sharedMesh` (`mesh`) | | Mesh của model (`"<guidModel>#mesh:<tên>"`) |
| Materials | `sharedMaterials` | material của model | Material thứ i vẽ submesh thứ i (None = trắng) |
| Root Bone | `rootBone` | | Xương gốc |
| Bones | `bones` | | Transform của các xương, theo thứ tự bind pose của mesh |
| Update When Offscreen | `updateWhenOffscreen` | `false` | Bật = không bao giờ bị cull theo camera (khi animation đưa mesh ra xa bounds ban đầu) |
| BlendShapes | `blendShapeWeights` | `0` | Trọng số từng blend shape (0..100) |
| Cast / Receive Shadows | `castShadows`, `receiveShadows` | `true` | |

```ts
const smr = this.getComponentInChildren(SkinnedMeshRenderer)!;
smr.setBlendShapeWeight(0, 100);   // blend shape đầu tiên (blendShapeNames[0])
smr.bones[3].localRotation = Quaternion.euler(0, 45, 0);
```

::: note Chưa hỗ trợ
- Mesh tuỳ biến từ code (chưa có class `Mesh` như Unity).
- Shader tự viết dạng unlit (`ShaderMaterial`) chưa skin mesh có xương (shader Standard / Unlit dựng sẵn và surface shader thì có).
- Component `ModelRenderer` cũ: scene cũ tự chuyển sang cây GameObject khi mở — xem [Model 3D](../assets/models.md#chuyen-tu-modelrenderer).
:::
