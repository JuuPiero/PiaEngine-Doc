---
title: AI Assistant
description: Package com.pia.ai — cửa sổ chat trong editor với Claude, GPT / Codex hoặc Gemini: mô tả game, AI dựng scene, viết script, chơi thử; API key nhập ngay trong editor; gửi được ảnh.
---

# AI Assistant (`com.pia.ai`)

Cửa sổ chat trong editor: bạn mô tả game, màn chơi hay thay đổi muốn làm, AI dựng nó ngay trong project đang mở. Chọn được AI: **Claude** (Anthropic), **GPT / Codex** (OpenAI) hoặc **Gemini** (Google).

- **Dựng scene trực tiếp.** AI tạo object, thêm component, đặt field, đặt prefab, viết script TypeScript, tạo prefab, mở / lưu scene.
- **Tự chơi thử.** AI bấm Play, đọc Console, chụp Game view để tự kiểm tra kết quả, rồi Stop.
- **Undo được.** Mọi thay đổi trong scene đi qua undo của editor như khi bạn tự làm: **Ctrl+Z** hoàn tác từng bước.
- **Gửi ảnh.** Dán (Ctrl+V), kéo thả hoặc bấm **Ảnh…** để gửi ảnh tham khảo, mockup hay ảnh chụp lỗi. Mỗi tin nhắn gửi tối đa 8 ảnh. Ảnh lớn được thu nhỏ còn cạnh dài 1568 px trước khi gửi.
- **Thao tác không undo được thì phải duyệt.** Gồm: xoá asset, xoá object hay component, di chuyển asset, build, ghi file ngoài `Assets/`, mở scene mới mà bỏ thay đổi chưa lưu. Những thao tác này chờ bạn bấm **Cho phép / Từ chối**, trừ khi bật **Tự duyệt**.
- **Biết ngữ cảnh.** Mỗi tin nhắn kèm scene đang mở, object đang chọn và trạng thái Play Mode. Vì vậy "đổi màu cái này thành đỏ" là nói về object đang chọn.
- **Viết script đúng tên API.** AI tra API engine (tài liệu sinh từ mã nguồn, `docs/ai/api`) để script dùng đúng tên của Pia.
- **API key nhập ngay trong editor.** Key lưu trên máy bạn (`~/.pia`), không nằm trong project, không bao giờ xuống trình duyệt.
- **Không vào bản build.** Package chỉ có phần editor, bản build không chứa gì của nó (0 byte).

Cửa sổ chat dùng chung bộ tool với `pia mcp` (server MCP cho Claude Code / Codex CLI / Cursor / Antigravity…). Hai cách cho kết quả như nhau: muốn dùng AI ngay trong editor thì cài package này, còn nếu đã quen một công cụ AI có hỗ trợ MCP thì nối nó với `pia mcp`.

## Cài

```bash
cd MyGame
npm install ../PiaEngine/pia-packages/com.pia.ai     # hoặc Window → Package Manager → Add package from disk
```

Khởi động lại editor sau khi cài: phần chạy trên Node được nạp lúc khởi động.

## API key

Mở **Window → AI → AI Assistant**, bấm **⚙** (lần đầu chưa có key thì bảng này tự mở):

1. Bấm **Lấy key ↗** cạnh hãng muốn dùng: trang tạo API key mở trên trình duyệt.

   | AI | Trang lấy key |
   |---|---|
   | Claude (Anthropic) | platform.claude.com → Settings → API keys |
   | OpenAI (GPT / Codex) | platform.openai.com → API keys |
   | Google Gemini | aistudio.google.com → Get API key |

2. Dán key vào ô của hãng đó, bấm **Lưu**. Editor kiểm tra key với hãng (lấy danh sách model) rồi mới lưu. Key sai thì báo ngay.
3. Key được lưu ở `~/.pia/ai-keys.json` (thư mục `PIA_HOME` nếu bạn đặt biến này), dùng chung cho mọi project. Trang editor chỉ thấy vài ký tự cuối của key. **Xoá** gỡ key đã lưu.

Biến môi trường vẫn dùng được nếu bạn thích: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY` (hoặc `GOOGLE_API_KEY`). Key nhập trong editor được ưu tiên hơn biến môi trường.

Mỗi tin nhắn tốn token, tính vào tài khoản API của hãng bạn chọn. Thanh dưới cửa sổ hiện số token đã dùng trong cuộc trò chuyện.

## Dùng

Trên thanh trên cửa sổ:

- **Chọn AI:** Claude / OpenAI / Gemini. Đổi AI là bắt đầu cuộc trò chuyện mới.
- **Model:** gõ tên hoặc chọn trong danh sách lấy từ API của hãng (chỉ hiện các model chat dùng được).
- **Mức suy nghĩ:** `low` → `max`. Thấp hơn thì nhanh và rẻ hơn, cao hơn thì kỹ hơn với việc khó.

Mặc định: `claude-opus-5-5`, `gpt-5.5`, `gemini-3.8-flash`. Lựa chọn được nhớ ở `~/.pia/ai-settings.json`.

Rồi gõ yêu cầu. Ví dụ:

- "Tạo sàn và một khối lập phương rơi xuống có vật lý"
- "Viết script cho object đang chọn: phím mũi tên để di chuyển, Space để nhảy"
- "Làm một màn platformer đơn giản rồi chơi thử xem có lỗi không"
- (kèm ảnh) "Dựng màn chơi giống ảnh này"

| Thao tác | Cách làm |
|---|---|
| Gửi | **Enter** (Shift+Enter để xuống dòng) |
| Đính kèm ảnh | **Ctrl+V** trong ô nhập, kéo thả file ảnh vào cửa sổ, hoặc nút **Ảnh…** (PNG / JPEG / GIF / WebP) |
| Dừng giữa chừng | **Dừng** (huỷ cả thao tác đang chờ duyệt) |
| Cuộc trò chuyện mới | **Mới** (AI quên cuộc trò chuyện cũ) |
| Không hỏi trước thao tác không undo được | Bật **Tự duyệt** (nhớ theo trình duyệt) |
| Xem chi tiết một bước | Bấm vào dòng tool: tham số và kết quả |
| API key | **⚙** |

AI **không lưu scene** trừ khi bạn bảo: bạn xem lại rồi lưu (Ctrl+S) hoặc Ctrl+Z những gì không ưng.

Với Claude, khi một yêu cầu bị bộ lọc an toàn của model chính từ chối, API tự chạy lại yêu cầu đó trên model dự phòng (server-side fallback).

## Giới hạn

- Chỉ chạy trong editor local (`pia editor`), vì cần dev server của editor. Trong editor hosted (`pia agent`), cửa sổ báo package chưa chạy.
- Cuộc trò chuyện nằm trong bộ nhớ của dev server: tắt editor là mất. Tải lại trang thì cửa sổ bắt đầu cuộc mới.
- Thao tác lên **file** (ghi script, ghi asset) không nằm trong undo của editor như thay đổi scene. Dùng git để quay lại khi cần.
- Mỗi tin nhắn tối đa 150 lượt gọi tool. Quá mức đó AI dừng và báo; gửi "tiếp tục" để làm tiếp.
- Đăng nhập bằng tài khoản ChatGPT / Google (gói thuê bao) không dùng được ở đây: các gói đó chỉ dành cho ứng dụng của chính hãng. Muốn dùng gói thuê bao thì nối Codex CLI, Gemini CLI, Antigravity hoặc Claude Code với `pia mcp`.

## Cách hoạt động (cho người viết package)

- `Editor/server.ts` (hook `"pia": { "server" }`) chạy vòng lặp agent chung: kiểm tra tham số tool theo JSON Schema, xin duyệt, chạy tool, gửi kết quả (kèm ảnh chụp).
- Mỗi hãng một adapter trong `Editor/providers/`, giữ hội thoại theo định dạng của API đó:
  - `anthropic.ts`: `@anthropic-ai/sdk`, Messages API stream, adaptive thinking, prompt caching, server-side fallback.
  - `openai.ts`: `openai`, Responses API stream, function tools, nối lượt bằng `previous_response_id`.
  - `gemini.ts`: `@google/genai`, `generateContentStream`, `parametersJsonSchema`, gửi lại nguyên các part kèm `thoughtSignature`.
- `providers/keys.ts`: key và lựa chọn của người dùng trong `~/.pia`.
- Tool lấy từ dev server: `GET /__pia/mcp/tools` (danh mục tool của `scripts/pia-mcp.mjs`) và `POST /__pia/mcp/run`. Tool của editor được chuyển tiếp tới trang editor qua cầu MCP (`packages/editor/server/mcpBridge.ts` → `src/editor/mcpTools.ts`).
- Sự kiện (chữ, suy nghĩ, tool, ảnh, yêu cầu duyệt) về trang qua HMR event `pia-ai:event`. Trang gửi tin nhắn, key, lựa chọn, duyệt và dừng bằng route `POST /__pia/package/com.pia.ai/<send|setKey|clearKey|models|settings|approve|stop|reset|status>`.
- `Editor/ChatWindow.tsx` + `store.ts` là cửa sổ chat. Ảnh được thu nhỏ trong trình duyệt rồi gửi dạng base64.
