---
title: AI Assistant
description: Package com.pia.ai — cửa sổ chat trong editor: mô tả game, Claude dựng scene, viết script, chơi thử ngay trong project đang mở; gửi được ảnh, thao tác không undo được phải duyệt.
---

# AI Assistant (`com.pia.ai`)

Cửa sổ chat trong editor: bạn mô tả game, màn chơi hay thay đổi muốn làm, **Claude** dựng nó ngay trong project đang mở.

- **Dựng scene trực tiếp.** Claude tạo object, thêm component, đặt field, đặt prefab, viết script TypeScript, tạo prefab, mở / lưu scene.
- **Tự chơi thử.** Claude bấm Play, đọc Console, chụp Game view để tự kiểm tra kết quả, rồi Stop.
- **Undo được.** Mọi thay đổi trong scene đi qua undo của editor như khi bạn tự làm: **Ctrl+Z** hoàn tác từng bước.
- **Gửi ảnh.** Dán (Ctrl+V), kéo thả hoặc bấm **Ảnh…** để gửi ảnh tham khảo, mockup hay ảnh chụp lỗi. Mỗi tin nhắn gửi tối đa 8 ảnh. Ảnh lớn được thu nhỏ còn cạnh dài 1568 px trước khi gửi.
- **Thao tác không undo được thì phải duyệt.** Gồm: xoá asset, xoá object hay component, di chuyển asset, build, ghi file ngoài `Assets/`, mở scene mới mà bỏ thay đổi chưa lưu. Những thao tác này chờ bạn bấm **Cho phép / Từ chối**, trừ khi bật **Tự duyệt**.
- **Biết ngữ cảnh.** Mỗi tin nhắn kèm scene đang mở, object đang chọn và trạng thái Play Mode. Vì vậy "đổi màu cái này thành đỏ" là nói về object đang chọn.
- **Viết script đúng tên API.** Claude tra API engine (tài liệu sinh từ mã nguồn, `docs/ai/api`) để script dùng đúng tên của Pia.
- **API key nằm ở Node.** Key chỉ ở dev server của editor, không bao giờ xuống trình duyệt.
- **Không vào bản build.** Package chỉ có phần editor, bản build không chứa gì của nó (0 byte).

Cửa sổ chat dùng chung bộ tool với `pia mcp` (server MCP cho Claude Code / Cursor…). Hai cách cho kết quả như nhau; package này cho bạn làm ngay trong editor, không cần công cụ ngoài.

## Cài

```bash
cd MyGame
npm install ../PiaEngine/pia-packages/com.pia.ai     # hoặc Window → Package Manager → Add package from disk
```

Khởi động lại editor sau khi cài: phần chạy trên Node được nạp lúc khởi động.

## API key

Package dùng [Claude API](https://platform.claude.com) của Anthropic. Đặt key vào biến môi trường **`ANTHROPIC_API_KEY`** **trước khi** mở editor:

```powershell
# Windows: lưu lâu dài cho user (mở terminal mới sau lệnh này)
setx ANTHROPIC_API_KEY "sk-ant-..."
# hoặc chỉ cho phiên PowerShell hiện tại
$env:ANTHROPIC_API_KEY = "sk-ant-..."
```

```bash
# macOS / Linux
export ANTHROPIC_API_KEY="sk-ant-..."
```

Rồi chạy editor như mọi khi (`npm run editor`, `node scripts/pia.mjs editor MyGame`). Thiếu key thì cửa sổ báo ngay. Đừng ghi key vào file trong project: lỡ commit lên git là lộ.

Mỗi tin nhắn tốn token, tính vào tài khoản API của bạn. Thanh dưới cửa sổ hiện số token đã dùng trong cuộc trò chuyện. Phần lặp lại giữa các lượt (danh sách tool, hướng dẫn) được cache nên rẻ hơn nhiều.

## Dùng

**Window → AI → AI Assistant**, rồi gõ yêu cầu. Ví dụ:

- "Tạo sàn và một khối lập phương rơi xuống có vật lý"
- "Viết script cho object đang chọn: phím mũi tên để di chuyển, Space để nhảy"
- "Làm một màn platformer đơn giản rồi chơi thử xem có lỗi không"
- (kèm ảnh) "Dựng màn chơi giống ảnh này"

| Thao tác | Cách làm |
|---|---|
| Gửi | **Enter** (Shift+Enter để xuống dòng) |
| Đính kèm ảnh | **Ctrl+V** trong ô nhập, kéo thả file ảnh vào cửa sổ, hoặc nút **Ảnh…** (PNG / JPEG / GIF / WebP) |
| Dừng giữa chừng | **Dừng** (huỷ cả thao tác đang chờ duyệt) |
| Cuộc trò chuyện mới | **Mới** (Claude quên cuộc trò chuyện cũ) |
| Không hỏi trước thao tác không undo được | Bật **Tự duyệt** (nhớ theo trình duyệt) |
| Xem chi tiết một bước | Bấm vào dòng tool: tham số và kết quả |

Claude **không lưu scene** trừ khi bạn bảo: bạn xem lại rồi lưu (Ctrl+S) hoặc Ctrl+Z những gì không ưng.

## Tuỳ chọn (biến môi trường)

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `ANTHROPIC_API_KEY` | (bắt buộc) | API key |
| `PIA_AI_MODEL` | `claude-opus-5-5` | Model Claude |
| `PIA_AI_EFFORT` | `high` | Mức suy nghĩ: `low` / `medium` / `high` / `xhigh` / `max`. Thấp hơn thì nhanh và rẻ hơn, cao hơn thì kỹ hơn với việc khó |

Khi một yêu cầu bị bộ lọc an toàn của model chính từ chối, API tự chạy lại yêu cầu đó trên model dự phòng (server-side fallback).

## Giới hạn

- Chỉ chạy trong editor local (`pia editor`), vì cần dev server của editor. Trong editor hosted (`pia agent`), cửa sổ báo package chưa chạy.
- Cuộc trò chuyện nằm trong bộ nhớ của dev server: tắt editor là mất. Tải lại trang thì cửa sổ bắt đầu cuộc mới.
- Thao tác lên **file** (ghi script, ghi asset) không nằm trong undo của editor như thay đổi scene. Dùng git để quay lại khi cần.
- Mỗi tin nhắn tối đa 150 lượt gọi tool. Quá mức đó Claude dừng và báo; gửi "tiếp tục" để làm tiếp.

## Cách hoạt động (cho người viết package)

- `Editor/server.ts` (hook `"pia": { "server" }`) chạy vòng lặp agent bằng `@anthropic-ai/sdk`, với streaming, prompt caching, adaptive thinking và server-side fallback.
- Tool lấy từ dev server: `GET /__pia/mcp/tools` (danh mục tool của `scripts/pia-mcp.mjs`) và `POST /__pia/mcp/run`. Tool của editor được chuyển tiếp tới trang editor qua cầu MCP (`packages/editor/server/mcpBridge.ts` → `src/editor/mcpTools.ts`).
- Sự kiện (chữ, tool, ảnh, yêu cầu duyệt) về trang qua HMR event `pia-ai:event`. Trang gửi tin nhắn, duyệt và dừng bằng route `POST /__pia/package/com.pia.ai/<send|approve|stop|reset|status>`.
- `Editor/ChatWindow.tsx` + `store.ts` là cửa sổ chat. Ảnh được thu nhỏ trong trình duyệt rồi gửi dạng base64.
