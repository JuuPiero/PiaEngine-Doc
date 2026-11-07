---
title: Giao diện editor
description: Các cửa sổ của editor PiaEngine và vai trò của chúng.
---

# Giao diện editor

Layout mặc định giống Unity: **Hierarchy | Scene / Game | Inspector**, **Project / Console** ở dưới. Mọi panel kéo-thả / dock lại được; **Window → Reset Layout** để về mặc định.

![Editor PiaEngine mở scene Showcase của Demo3D: Hierarchy bên trái, Scene view ở giữa, Inspector bên phải, Project ở dưới](/images/editor-overview.png)

*Scene `Showcase` của Demo3D, đang chọn object **Player** (MeshRenderer, CapsuleCollider, Rigidbody, script PhysicsPlayer).*

## Thanh công cụ

| Nhóm | Nội dung |
|---|---|
| Tool | Hand / Move / Rotate / Scale / Rect / Transform (<kbd>Q</kbd> <kbd>W</kbd> <kbd>E</kbd> <kbd>R</kbd> <kbd>T</kbd> <kbd>Y</kbd>). |
| Pivot / Center | Vị trí tay cầm của tool: tại pivot của object hay tâm vùng chọn. |
| Local / Global | Hướng của tay cầm: theo trục cục bộ của object hay trục thế giới. |
| Play / Pause / Step | Vào / thoát Play Mode, tạm dừng, chạy từng frame. |
| Lối tắt | Animation, Package Manager, Build Settings. |

## Các cửa sổ

| Cửa sổ | Mở từ | Dùng để |
|---|---|---|
| **Hierarchy** | Window → General | Cây GameObject của scene. Click tên scene ở đầu để mở **Scene Settings** (pipeline 2D/3D, ánh sáng môi trường, fog). |
| **Scene** | Window → General | Dựng màn: chọn, di chuyển, xoay, scale object. Có nút 2D view, lưới (grid), gizmo. Xem [Scene view](scene-view.md). |
| **Game** | Window → General | Game nhìn qua các Camera. Chọn tỉ lệ khung (Free Aspect, 16:9, 9:16…), **Stats** (FPS, draw call, tam giác, số object — xem [Play Mode](play-mode.md#stats-draw-call)), tắt tiếng. Nhận input khi được focus. |
| **Inspector** | Window → General | Sửa component của object đang chọn, import settings của asset, material, ScriptableObject. Xem [Hierarchy & Inspector](hierarchy-inspector.md). |
| **Project** | Window → General | Cây thư mục `Assets/` (và package). Create menu, kéo-thả, đổi tên, import file từ máy. |
| **Console** | Window → General | Log của `Debug.log/warn/error`, lỗi biên dịch script, lỗi shader, báo cáo build. |
| **Animation** | Window → Animation (<kbd>Ctrl</kbd>+<kbd>6</kbd>) | Tạo / sửa animation clip, nút Record. Xem [Animation](../components/animation.md). |
| **Package Manager** | Window → Package Manager | Xem, cài, gỡ package. Xem [Dùng package](../packages/using-packages.md). |
| **Sprite Editor** | Window → 2D → Sprite Editor (hoặc nút trong Import Settings của texture) | Cắt sprite sheet, pivot, viền 9-slice. Xem [Sprite Editor & 9-slice](../assets/sprite-editor.md). |
| **Build Settings** | File → Build Settings (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd>) | Scene trong build, platform, Build / Build And Run. |
| **Project Settings** | Edit → Project Settings… | Tên, company, version, chế độ mặc định 2D/3D, tags, layers, trọng lực, fixed timestep. |
| **Keyboard Shortcuts** | Help → Keyboard Shortcuts | Bảng phím tắt. |

Package và script editor có thể thêm cửa sổ riêng, mở từ **Window → Extensions** (xem [Editor extension](../packages/editor-extensions.md)).

## Menu chính

| Menu | Nội dung chính |
|---|---|
| File | New Scene, Open Scene, Save / Save As, Open Project… / New Project… (về Hub), Build Settings, Build And Run |
| Edit | Undo / Redo, Select All, Cut / Copy / Paste / Duplicate / Delete, Frame Selected, Play / Pause / Step, Project Settings |
| Assets | Create (Folder, TypeScript Script, Scene, Animation Clip), Show in Explorer, Open, Delete, Refresh. Menu **Create** khi chuột phải trong cửa sổ Project đầy đủ hơn: thêm ScriptableObject Script, Material, Shader, Scriptable Object… |
| GameObject | Create Empty / Create Empty Child, 3D Object, 2D Object, UI, Light, Effects, Audio, Camera, Move To View, Align With View |
| Component | Add Component theo nhóm (Rendering, Mesh, Physics, Physics 2D, Audio, UI, Effects…) |
| Window | Package Manager, Animation, 2D → Sprite Editor, General (các panel), Extensions (cửa sổ của package / script editor), Reset Layout |
| Help | Keyboard Shortcuts, About |

Script editor có thể thêm menu riêng (ví dụ **Tools**) bằng `ctx.addMenuItem` — xem [Editor extension](../packages/editor-extensions.md).
