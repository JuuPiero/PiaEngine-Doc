---
title: Model 3D
description: Import glTF / GLB / FBX / OBJ thành cây GameObject (như model prefab của Unity), Import Settings Model / Rig / Animation / Materials, Convert Units, Mesh / Anim. Compression, Animator, SkinnedMeshRenderer.
---

# Model 3D

Hỗ trợ **glTF / GLB**, **FBX** và **OBJ**. Chép file (kèm file phụ: `.bin`, texture…) vào `Assets/`, rồi kéo model từ Project vào **Scene** hoặc **Hierarchy** (hoặc bấm **Add to Scene** trong Inspector của model).

## Model thành cây GameObject

Giống Unity, model được dựng thành **một cây GameObject** theo đúng cấu trúc node trong file:

- Object gốc mang tên model. Mỗi node của file là một GameObject con: tên, position / rotation / scale lấy từ file (đã nhân tỷ lệ import).
- Node có mesh → [MeshFilter + MeshRenderer](../components/rendering-3d.md) dùng mesh và material của model. Mesh nhiều material giữ đủ **submesh**: material thứ i vẽ submesh thứ i.
- Mesh có xương (skinned) hoặc blend shape → [SkinnedMeshRenderer](../components/rendering-3d.md#skinnedmeshrenderer); các xương là những GameObject con, di chuyển / animate chúng thì mesh biến dạng theo.
- Clip trong file → [Animator](../components/animation.md#animator) trên object gốc.
- Camera / light trong file → component [Camera](../components/camera.md) / [Light](../components/lights.md).

Cây object vẫn **liên kết với model** như "model prefab" của Unity:

- Hiện màu xanh trong Hierarchy, Inspector có thanh **Model** (Select, Overrides).
- Sửa giá trị là **override** (in đậm, Revert được).
- Đổi Import Settings, hoặc file model thay đổi → mọi instance tự cập nhật, override vẫn giữ.
- Model không mở Prefab Mode và không Apply override được (file là nguồn). Muốn sửa thoải mái thì **Unpack**, hoặc kéo object vào Project để tạo [prefab](prefabs.md) riêng.

Trong Scene view, click vào một phần của model sẽ chọn object gốc trước; click lần nữa chọn đúng phần đó.

```ts
import { Animator, GameObject, Resources, Vector3, instantiateModel, loadModelPrefab } from '@pia/core';

const robot = await instantiateModel('Assets/Models/Robot.gltf', null, new Vector3(0, 0, 2));
robot?.getComponent(Animator)?.crossFade('Wave', 0.25);

const tpl = await loadModelPrefab('Assets/Models/Robot.gltf');   // template cho this.instantiate(tpl)
const bus = await Resources.load('Vehicles/Bus', GameObject);     // model trong thư mục Resources
```

## Sub-asset trong Project

Bấm **▸** trên model trong Project để xem: **mesh**, **material**, **animation clip**, **texture** nhúng.

| Kéo | Vào | Kết quả |
|---|---|---|
| Model | Scene / Hierarchy | Cây GameObject của model |
| Mesh | Scene / Hierarchy | Object MeshFilter + MeshRenderer (material của model) |
| Material | ô Materials của renderer | Dùng material đó |
| Clip | ô Clips của Animator | Thêm clip |

Chọn sub-asset để xem thông tin (số đỉnh, submesh, xương, blend shape, độ dài clip, giá trị material). File lưu tham chiếu dạng `"<guidModel>#mesh:<tên>"`, `"#material:<tên>"`, `"#clip:<tên>"`, `"#texture:<tên>"`.

## Import Settings

Chọn model trong Project. Inspector chia tab như ModelImporter của Unity; bấm **Apply** để import lại (instance trong scene đổi theo ngay), **Revert** để bỏ thay đổi. Cuối Inspector có **preview**: kéo chuột để xoay, lăn chuột để zoom.

### Model

| Thiết lập | Mặc định | Mô tả |
|---|---|---|
| Scale Factor | `1` | Nhân kích thước model (vị trí và mesh) |
| Convert Units | bật | FBX: đổi đơn vị của file sang mét theo `UnitScaleFactor` ghi trong file, như Unity. Bên cạnh ghi ví dụ `1cm (File) to 0.01m`. glTF luôn là mét; OBJ không có đơn vị (×1) |
| Import BlendShapes | bật | Giữ morph target (blend shape) |
| Import Cameras / Import Lights | bật | Camera / light trong file thành component |
| Preserve Hierarchy | tắt | Tắt: một node gốc rỗng duy nhất được gộp vào object gốc. Bật: giữ thành object con |
| Sort Hierarchy By Name | bật | Object con xếp theo tên (tắt = theo thứ tự trong file) |
| Normals | Import | Import = normal của file; Calculate = tính lại, cạnh gắt hơn **Smoothing Angle** thì giữ cứng |
| Mesh Compression | Off | Low / Medium / High: nén dữ liệu đỉnh trong bản build — xem [Nén model khi build](#nen-model-khi-build) |

Dòng cuối ghi kích thước model (mét), số object, mesh, tam giác, material, clip.

::: tip Tỷ lệ giống Unity
Kích thước = Scale Factor × (Convert Units ? đơn vị của file : 1). FBX lưu cm (Mixamo…) → ×0.01; FBX lưu m → ×1. Model mới có `scaleFactor: 1` + `convertUnits: true` trong `.meta`. File `.meta` cũ còn đúng mặc định cũ (`scaleFactor: 0.01`, không có `convertUnits`) được hiểu như mặc định của Unity; Console ghi một dòng nếu kích thước model đổi. Scale Factor khác do bạn tự đặt thì giữ nguyên (Convert Units tắt).
:::

### Rig

**Animation Type**: **None** (không import animation), **Legacy** (component [Animation](../components/animation.md) trên object gốc), **Generic** (component [Animator](../components/animation.md#animator), mặc định). Humanoid chưa hỗ trợ.

### Animation

- **Import Animation**.
- **Anim. Compression**: Off hoặc **Keyframe Reduction** với Rotation Error (độ), Position Error / Scale Error (% giá trị), mặc định 0.5 như Unity. Bỏ những key mà nội suy hai key bên cạnh tái tạo được trong sai số; áp dụng trong editor lẫn bản build.
- Danh sách **clip**: tên, take nguồn, frame bắt đầu / kết thúc (30 fps — cắt một take thành nhiều clip), **Loop Time**. Nút **+ Clip** thêm clip, **Reset** về một clip cho mỗi take.
- Chọn một clip để xem nó chạy trong preview.

### Materials

| Thiết lập | Mô tả |
|---|---|
| Material Creation Mode | **Import** = material của file; **None** = Default-Material |
| Location | **Use Embedded Materials**; hoặc **Use External Materials** = tự dùng Material cùng tên trong thư mục `Materials/` cạnh model |
| Extract Textures… | Ghi texture nhúng ra `Textures/*.png` cạnh model |
| Extract Materials… | Ghi bản sao sửa được `Materials/*.mat.json` (shader Standard, kèm texture) rồi remap model sang chúng |
| Remapped Materials | Mỗi material của model một ô: gán Material asset để dùng thay (cả instance mới lẫn instance đã đặt trong scene) |

Material import kèm model là **chỉ đọc**: renderer vẽ đúng như file (texture, vertex color…). Muốn sửa thì Extract Materials hoặc remap.

## Build

Scene dùng model (instance, mesh, material hay clip của model) sẽ mang theo file model + file phụ (buffer + texture của glTF, `.mtl` + texture của OBJ, texture của FBX) và loader đúng định dạng. Build report ghi `Loaders: gltf, fbx…`. Material trong Remapped Materials / External Materials cũng được mang theo.

### Nén model khi build

Giống Mesh Compression / Anim. Compression của Unity, để bản build (web và playable) nhẹ hơn:

| Mức | Vị trí, UV | Normal, tangent | Skin weight |
|---|---|---|---|
| Low | 16 bit | 12 bit | 16 bit |
| Medium | 14 bit | 10 bit | 16 bit |
| High | 12 bit | 8 bit | 16 bit |

- Dữ liệu đỉnh được lượng tử hoá theo mức trên rồi nén bằng **meshoptimizer**; clip được Keyframe Reduction (nếu bật); texture nhúng vào cùng file.
- Model được mang theo dạng `<model>.pmodel` thay cho file gốc. Đó là chính các object mà loader FBX / glTF / OBJ tạo ra (cùng cây, tên node, material, xương, blend shape, clip, tỷ lệ Scale Factor / Convert Units), nên override trong scene và sub-asset `"guid#mesh:…"` vẫn đúng như trong editor.
- Loader FBX / glTF không còn trong build khi mọi model định dạng đó đều được nén; game chỉ thêm bộ giải nén meshopt (vài chục KB).
- Mesh Compression chỉ áp dụng cho bản build: trong editor vẫn là mesh gốc.
- Model quá nhỏ mà nén lại lớn hơn file gốc thì giữ nguyên (build report ghi cảnh báo).
- Build report có dòng `Models: N compressed (trước → sau): …`. Ví dụ: Samba.fbx (Mixamo, 166k đỉnh, 18 s animation) 3.51 MB → 0.89 MB với Low + Keyframe Reduction; Bus.fbx 82 KB → 28 KB với Medium.

## Chuyển từ ModelRenderer

`ModelRenderer` (bản cũ: một component vẽ cả model) không còn trong Add Component / menu. Scene và prefab cũ có ModelRenderer vẫn mở và chạy được: khi nạp (trong editor và trong game build), component được thay bằng cây object của model, đặt làm con của object đó. Cast / Receive Shadows, material thay slot, Clip / Play Automatically / Speed / Loop chuyển sang các renderer mới và Animator, nên nhìn và chạy như cũ. **Lưu scene** thì file ghi theo dạng mới.

Trong script, thay `getComponent(ModelRenderer).play('Wave', 0.3)` bằng `getComponentInChildren(Animator).crossFade('Wave', 0.3)`.

::: note Chưa hỗ trợ
- Humanoid / retarget, state machine của Animator (Animator Controller), root motion, blend nhiều layer.
- MeshCollider từ mesh của model, LOD, lightmap UV.
- Sửa clip của model trong cửa sổ Animation (cửa sổ này dành cho clip `.anim.json`).
- OBJ: file `.mtl` chưa được đọc khi hiển thị — gán material bằng Remapped Materials.
:::
