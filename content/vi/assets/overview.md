---
title: Asset, .meta & GUID
description: Các loại asset, file .meta, GUID và cách tham chiếu asset.
---

# Asset, .meta & GUID

Mọi file trong `Assets/` là một asset. Mỗi asset có file **`.meta`** bên cạnh chứa **GUID** và **import settings**, giống Unity:

```json Assets/Shaders/Hologram.shader.meta
{
  "guid": "c3e5a7b9213d4f4bb08c6e4d2f1b9a37",
  "importer": {}
}
```

Scene, prefab, material, clip tham chiếu asset bằng **GUID**, nên đổi tên / di chuyển asset (trong editor, hoặc cùng file `.meta` bên ngoài) không làm hỏng tham chiếu. Editor tự tạo `.meta` cho file mới.

::: warning
Commit file `.meta` cùng asset. Xoá `.meta` thì asset nhận GUID mới và mọi tham chiếu tới nó bị mất.
:::

## Loại asset

| Loại | Đuôi file | Ghi chú |
|---|---|---|
| Scene | `.scene.json` | [Scene](../editor/scenes.md) |
| Prefab | `.prefab.json` | [Prefab](prefabs.md) |
| Animation clip | `.anim.json` | [Animation](../components/animation.md) |
| Material | `.mat.json` | [Material](../graphics/materials.md) |
| Shader | `.shader` | [Viết shader](../graphics/writing-shaders.md) |
| ScriptableObject | `.asset.json` | [ScriptableObject](../scripting/scriptable-object.md) |
| Script | `.ts`, `.tsx`, `.js`, `.mjs` | |
| Texture / sprite | `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg`, `.avif` | [Texture & Sprite](textures-sprites.md) |
| Model | `.glb`, `.gltf`, `.fbx`, `.obj` | [Model](models.md) |
| Audio | `.mp3`, `.ogg`, `.wav`, `.m4a`, `.aac`, `.flac` | [Audio & Font](audio-fonts.md) |
| Font | `.ttf`, `.otf`, `.woff`, `.woff2` | [Audio & Font](audio-fonts.md) |
| JSON | `.json` | Dữ liệu tuỳ ý (`Resources.loadJson`) |
| UI Document / Style Sheet | `.html`, `.css` | Package [UI Toolkit](../official/ui-toolkit.md) |
| Text | `.txt`, `.md`, `.csv`, `.xml`, `.glsl` | |

## Import asset

- Kéo file từ máy thả vào cửa sổ **Project**.
- Hoặc chép file vào thư mục `Assets/` bằng trình quản lý file — editor tự nhận (hoặc **Assets → Refresh**, <kbd>Ctrl</kbd>+<kbd>R</kbd>).
- Chọn asset trong Project để sửa import settings trong Inspector.

## Cửa sổ Project

Chuột phải lên asset: **Open**, **Instantiate in Scene** (prefab), **Rename** (<kbd>F2</kbd>), **Delete**, **Copy Path**, **Copy GUID**, **Show in Explorer**, **Refresh**.

**Create** (chuột phải trong cửa sổ Project, hoặc nút **+** của nó): Folder, TypeScript Script, ScriptableObject Script, Scene, Animation Clip, Material, Shader (Sprite / Lit / Unlit), Scriptable Object, và các mục do `@createAssetMenu` thêm. Menu **Assets → Create** ở thanh menu có các mục cơ bản (Folder, Script, Scene, Animation Clip).

## Tham chiếu asset trong code

Field asset trong component giữ **chuỗi tham chiếu**. Các dạng chuỗi engine hiểu:

| Dạng | Ví dụ |
|---|---|
| GUID | `8d298693d11825bc0bd51126606be338` |
| Đường dẫn project | `Assets/Audio/jump.wav` |
| Sprite con của sprite sheet | `<guid texture>#<id sprite>`, hoặc `Assets/Sprites/SpriteSheet.png#coin_0` (theo tên) — xem [Sprite Editor](sprite-editor.md) |
| Asset dựng sẵn | `builtin:Circle`, `builtin:Particle` |

```ts
@field({ assetType: 'sprite' }) icon = '';     // kéo sprite vào Inspector
sr.sprite = this.icon;
sr.sprite = 'builtin:Circle';
```

::: tip Build
Bản build chỉ chứa asset được scene / prefab / clip / material tham chiếu, được script ghi bằng chuỗi `'Assets/...'` hoặc GUID, hoặc nằm trong `Resources/`. Xem [Build web](../build/build-web.md).
:::
