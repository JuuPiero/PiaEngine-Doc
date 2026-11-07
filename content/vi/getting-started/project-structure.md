---
title: Cấu trúc project
description: Các thư mục và file trong một project PiaEngine.
---

# Cấu trúc project

```text
MyGame/
  pia.project.json      tên, 2d/3d, danh sách scene trong build (Build Settings), tags, layers...
  package.json          manifest package (npm) — cài thư viện / Pia package bằng npm install
  tsconfig.json         để VS Code hiểu @pia/core
  Assets/
    Scenes/*.scene.json
    Prefabs/*.prefab.json
    Animations/*.anim.json
    Materials/*.mat.json
    Shaders/*.shader
    Scripts/*.ts        mọi class export kế thừa MonoBehaviour tự thành component
    Editor/*.ts         script chỉ chạy trong editor (giống thư mục Editor của Unity)
    Resources/          asset nạp bằng tên lúc chạy — luôn được đưa vào build
    Sprites/, Textures/, Audio/, Models/ ...
    *.meta              GUID + import settings của từng asset (commit cùng asset, như Unity)
  Packages/<tên>/       package nhúng (embedded) đang tự viết
  Build/web/            output khi build; Build/build-report.json: báo cáo build
```

## Những file quan trọng

| File | Vai trò | Unity tương đương |
|---|---|---|
| `pia.project.json` | Cài đặt project: tên, chế độ 2D/3D mặc định, scene trong build, tags, layers, vật lý, build. Xem [pia.project.json](../reference/project-settings.md). | `ProjectSettings/` |
| `package.json` | Manifest package: dependency npm và Pia package. | `Packages/manifest.json` |
| `*.scene.json` | Scene (JSON). | `.unity` |
| `*.prefab.json` | Prefab. | `.prefab` |
| `*.asset.json` | Asset ScriptableObject. | `.asset` |
| `*.mat.json` / `*.shader` | Material / shader. | `.mat` / `.shader` |
| `*.anim.json` | Animation clip. | `.anim` |
| `*.meta` | GUID và import settings của asset bên cạnh. | `.meta` |

::: warning Commit file .meta
Scene, prefab và material tham chiếu asset bằng **GUID** trong `.meta`. Luôn commit file `.meta` cùng asset, và khi đổi tên / di chuyển asset ngoài editor thì di chuyển cả file `.meta` đi kèm.
:::

## Thư mục đặc biệt

| Thư mục | Ý nghĩa |
|---|---|
| `Assets/**/Editor/` | Script chỉ chạy trong editor (menu, inspector tuỳ biến…). Không bao giờ vào bản build. Xem [Editor extension](../packages/editor-extensions.md). |
| `Assets/**/Resources/` | Asset nạp bằng tên lúc chạy (`Resources.load`). Luôn được đưa vào build. Xem [Resources](../assets/resources.md). |
| `Packages/` | Package nhúng. Xem [Viết package](../packages/creating-packages.md). |
| `Build/` | Kết quả build. Không cần commit. |
