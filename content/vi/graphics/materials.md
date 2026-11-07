---
title: Material
description: Material là shader kèm giá trị thuộc tính; danh sách Materials trên renderer, GPU Instancing và API trong code.
---

# Material

Giống Unity:

- **Shader** (`.shader`) khai báo thuộc tính + trạng thái render + GLSL.
- **Material** (`.mat.json`) là một shader kèm giá trị cho các thuộc tính đó.

## Tạo material

- **Project → Create → Material**. Nếu đang chọn một shader thì material dùng luôn shader đó; trong Inspector của shader cũng có nút **Create Material**.
- Chọn material để đổi shader và sửa thuộc tính (tự lưu, có Undo). Lưu file `.shader` là mọi material dùng nó cập nhật ngay.

```json Assets/Materials/Hologram.mat.json
{
  "version": 1,
  "type": "Material",
  "data": {
    "shader": "c3e5a7b9213d4f4bb08c6e4d2f1b9a37",
    "properties": {
      "_Color": [0.25, 0.85, 1, 0.6],
      "_RimPower": 2.5,
      "_LineDensity": 40,
      "_ScrollSpeed": 1.5,
      "_Wobble": 0.015
    }
  }
}
```

## Danh sách Materials trên renderer

Mỗi renderer có list **Materials** (`sharedMaterials`) như Unity:

| Renderer | Ý nghĩa của list |
|---|---|
| **SpriteRenderer** (2D), **MeshRenderer** (3D) | Mỗi material vẽ object **thêm một lần**, theo thứ tự (multi-pass), ví dụ `[Outline, Star Shine]` hoặc `[Standard, Hologram]` |
| **MeshRenderer / SkinnedMeshRenderer của model** (glTF/FBX/OBJ) | Material thứ i vẽ **submesh** thứ i; mặc định là material import kèm model (chỉ đọc). Đổi ngay trên renderer (override) hoặc cho cả model ở Import Settings → Materials (Remapped Materials, Extract Materials) |

Renderer mới có sẵn một material dựng sẵn (chỉ đọc, như built-in resource của Unity): MeshRenderer có `Default-Material`, SpriteRenderer có `Sprites-Default`, LineRenderer / TrailRenderer có `Default-Line` (shader `Particles/Unlit`). `Default-Material` vẽ bằng các thông số Albedo / Metallic / Smoothness / Emission ngay dưới list của chính renderer; muốn dùng shader khác hay chia sẻ một look thì tạo Material (Project → Create → Material). `renderer.material` trả về bản sao (bản sao của Default-Material mang sẵn màu, texture, độ bóng hiện tại). Trong file lưu là `"builtin:Default-Material"`. List rỗng hoặc phần tử None vẫn dùng được như trước.

Inspector của object hiện bảng chỉnh từng material của nó ở cuối, sau các component. Sửa ở đó là **sửa asset**, nên mọi object dùng material đó đều đổi theo.

::: tip Scene cũ
Scene / prefab cũ lưu một ô `sharedMaterial` vẫn mở được (tự đọc thành list một phần tử); lưu lại thì ghi dạng mới `sharedMaterials`. Field của bạn cũng dùng được cơ chế này: `@field({ formerlySerializedAs: 'tênCũ' })`.
:::

## Dùng trong code

```ts
const sr = this.getComponent(SpriteRenderer)!;
sr.material!.setFloat('_FlashAmount', 1);         // .material = bản sao riêng của material đầu tiên (như Unity)
sr.sharedMaterial!.setColor('_Color', Color.red); // .sharedMaterial = asset đầu tiên, đổi cho mọi object dùng nó

const m = Material.create('Sprites/Outline');     // theo tên shader (Shader.find)
m.setColor('_OutlineColor', [1, 0.8, 0, 1]);

sr.sharedMaterial = await Resources.load('Materials/Glow', Material); // thay phần tử 0, giữ các phần tử sau
sr.sharedMaterials = [m, sr.sharedMaterial];      // cả list: viền + glow
for (const mat of sr.materials) mat?.setFloat('_Speed', 2);   // .materials = bản sao riêng của cả list

mesh.material!.mainTextureOffset = new Vector2(Time.time * 0.2, 0);  // cuộn texture
mesh.material!.setTextureScale('_MainTex', [4, 4]);                  // lặp 4 × 4
```

### API của Material

| Nhóm | Thành viên |
|---|---|
| Shader | `shader` (gán `Shader` hoặc tên / GUID), `Material.create(shader)`, `copyPropertiesFromMaterial(other)` |
| Số | `getFloat`, `setFloat`, `getInt`, `setInt` |
| Màu / vector | `getColor`, `setColor(name, Color \| [r,g,b,a])`, `getVector`, `setVector`, `color` (= `_Color`) |
| Texture | `getTexture`, `setTexture(name, guid)`, `getTextureScale/Offset`, `setTextureScale/Offset`, `getTextureScaleOffset`, `setTextureScaleOffset`, `mainTextureScale`, `mainTextureOffset` |
| Chung | `hasProperty(name)`, `getValue`, `setValue` |
| GPU Instancing | `enableInstancing` (xem [GPU Instancing](#gpu-instancing)) |

| Thuộc tính renderer | Ý nghĩa |
|---|---|
| `sharedMaterial` | Asset đầu tiên của list (đổi là đổi cho mọi object dùng nó). Gán = thay phần tử 0, giữ phần còn lại |
| `sharedMaterials` | Cả list asset |
| `material` | Bản sao riêng của phần tử đầu (lần truy cập đầu tạo bản sao) |
| `materials` | Bản sao riêng của cả list |

## GPU Instancing

Như Unity: chọn material → **Advanced Options → Enable GPU Instancing**. Các **MeshRenderer** dùng material đó với **cùng mesh** (cùng submesh), cùng Cast / Receive Shadows và cùng Layer được vẽ chung **một draw call** — ma trận của từng object lấy từ Transform mỗi frame.

```ts
const mat = await Resources.load('Materials/Crate', Material);
mat.enableInstancing = true;   // như material.enableInstancing của Unity
```

Trong file `.mat.json` là `"enableInstancing": true` cạnh `"shader"` (file cũ không có dòng này thì là tắt).

Ví dụ đo trong Game view (nút **Stats**): 500 cube + 20 sphere dùng chung material, có bóng đổ — **Batches 1143 → 33**, trong đó 10 draw call instanced (mỗi nhóm một lần vẽ + một lần đổ bóng).

| Trường hợp | Kết quả |
|---|---|
| Di chuyển, `setActive(false)`, `renderer.enabled = false`, xoá, `instantiate`, đổi `sharedMaterial` lúc chạy | cập nhật ngay frame sau |
| Chọn / click chọn trong Scene view, khung chọn, Frame Selected | như object thường |
| Mesh nhiều submesh | mỗi submesh gom riêng theo material của nó |
| Material thêm (multi-pass) vẽ lại submesh cuối | chỉ gom khi **mọi** material vẽ submesh đó đều bật instancing |
| `renderer.material` (bản sao riêng) | giữ Enable GPU Instancing nhưng là material khác → nhóm riêng (đổi màu từng object thì vẫn một draw call mỗi object) |
| Standard / Unlit dựng sẵn, Lit Shader (surface shader), Unlit Shader tự viết (kể cả `VERTEXPROGRAM`) | hỗ trợ |
| Shader tự đọc `modelMatrix` / `modelViewMatrix` / `normalMatrix` | tự vẽ từng object (Inspector có ghi chú) |
| SkinnedMeshRenderer | gom khi Animator bật [Baked Animation (GPU)](../components/animation.md#baked-animation-gpu) (cùng mesh + material + clip); không bật thì không gom (như Unity) |
| `Default-Material`, material import kèm model | không gom |

::: note 2D
Trong pipeline 2D tuỳ chọn này **không có tác dụng**: PixiJS đã tự gom sprite thành batch. Inspector chỉ hiện Enable GPU Instancing cho shader 3D.
:::

::: tip Giới hạn
Một nhóm được cull theo khung bao của cả nhóm (không cull từng object). Object trong suốt trong cùng một nhóm không được sắp xếp xa → gần với nhau — với material trong suốt chồng lên nhau, cân nhắc tắt instancing.
:::

## Ví dụ

- Demo2D: `Assets/Shaders/Shine.shader` + `Assets/Materials/Star Shine.mat.json` (vệt sáng quét qua ngôi sao).
- Demo3D: `Assets/Shaders/Hologram.shader` (rim + scanline + vertex wobble) trên Shiny Sphere.

::: note Chưa hỗ trợ
Material cho UI và Particle System; `MaterialPropertyBlock`.
:::
