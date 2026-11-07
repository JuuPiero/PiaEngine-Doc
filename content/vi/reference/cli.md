---
title: CLI
description: Các lệnh dòng lệnh của PiaEngine (scripts/pia.mjs) và npm script tương ứng.
---

# CLI

Mọi lệnh chạy từ **thư mục gốc repo engine**: `node scripts/pia.mjs <lệnh>` hoặc qua npm script.

## Lệnh

| Lệnh | Tác dụng |
|---|---|
| `editor [project]` | Mở editor cho project; không có đường dẫn → Project Hub |
| `create <path> [2d\|3d]` | Tạo project mới rỗng (như Project Hub → New project); mặc định 3D |
| `build [project] [--target <id>] [--set key=value …]` | Build game. Không có `--target` → platform đang chọn trong Build Settings (mặc định `web`) |
| `package create <name> [project]` | Tạo package nhúng trong `<project>/Packages/<name>` |
| `package list [project]` | Liệt kê package của project (`pia` = Pia package, `lib` = thư viện thường) |
| `agent [project] [tuỳ chọn]` | Chia sẻ project cho web editor qua WebSocket — xem [Web editor + pia agent](../build/web-editor-agent.md) |
| `build-editor` | Build web editor thành trang tĩnh trong `packages/editor/dist` |

`--set` nhận danh sách bằng dấu phẩy: `--set channels=AppLovin,Unity`; `true` / `false` thành boolean.

## npm script

| Script | Tương đương |
|---|---|
| `npm run editor` | `pia.mjs editor` (Project Hub) |
| `npm run editor:3d` / `npm run editor:2d` | Mở `examples/Demo3D` / `examples/Demo2D` |
| `npm run editor -- path/to/MyGame` | Mở một project |
| `npm run create -- ../MyGame 2d` | `pia.mjs create ../MyGame 2d` |
| `npm run build:game -- ../MyGame` | `pia.mjs build ../MyGame` |
| `npm run agent -- ../MyGame` | `pia.mjs agent ../MyGame` |
| `npm run build:editor` | `pia.mjs build-editor` |
| `npm run pia -- <lệnh> …` | `pia.mjs <lệnh> …` |

## Biến môi trường

| Biến | Ý nghĩa |
|---|---|
| `PIA_PORT` | Cổng của editor (mặc định `5170`) |
| `PIA_NO_OPEN=1` | Không tự mở trình duyệt |
| `PIA_HOME` | Thư mục lưu trạng thái Project Hub (mặc định `~/.pia`) |
| `PIA_EDITOR_URL` | Địa chỉ web editor cho `agent` (như `--editor-url`) |
| `PIA_AGENT_TOKEN` | Token cố định cho `agent` (như `--token`) |
| `PIA_ALLOW_ORIGINS` | Origin được phép thêm cho `agent`, phân cách bằng dấu phẩy |

```powershell
# PowerShell
$env:PIA_PORT = '5180'; $env:PIA_NO_OPEN = '1'; npm run editor:2d
```

```bash
# bash
PIA_PORT=5180 PIA_NO_OPEN=1 npm run editor:2d
```
