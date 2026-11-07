---
title: Web editor + pia agent
description: Deploy editor lên web dưới dạng trang tĩnh, project vẫn nằm trên máy người dùng nhờ pia agent.
---

# Web editor + `pia agent`

Editor build được thành **trang tĩnh**, deploy ở đâu cũng được (S3, Vercel, Nginx…). Project **không** upload lên server: người dùng chạy **agent** trên máy mình, agent chia sẻ thư mục project cho editor qua WebSocket.

```text
https://editor.xxx.com (trang tĩnh)  ⇄  ws://127.0.0.1:7777  ⇄  pia agent (máy người dùng)  ⇄  thư mục project
```

## Dùng

```bash
npm run build:editor                       # → packages/editor/dist  (deploy thư mục này)

# máy người dùng, trong repo engine:
node scripts/pia.mjs agent ../MyGame --editor-url https://editor.xxx.com
#   Open: https://editor.xxx.com#agent=ws%3A%2F%2F127.0.0.1%3A7777&token=...   (tự mở trình duyệt)

# không có web editor nào được deploy: agent tự phục vụ bản build trong packages/editor/dist
node scripts/pia.mjs agent ../MyGame       # → http://127.0.0.1:7777/#token=...
```

Mở editor không kèm link sẽ ra màn hình nhập địa chỉ agent + token. Nhấn <kbd>Ctrl</kbd>+<kbd>C</kbd> trong terminal để ngừng chia sẻ.

## Agent làm gì

Agent thay phần việc của server editor (`pia editor` dùng Vite cho phần này):

| Việc | Qua |
|---|---|
| API project: cây thư mục, đọc / ghi file, `.meta`, build, Package Manager | WebSocket |
| Báo file đổi (sửa script trong VS Code, thêm ảnh…), lỗi biên dịch | WebSocket (sự kiện) |
| Biên dịch script (esbuild): một bundle cho script + package + extension Editor | WebSocket báo phiên bản mới, tải bundle qua HTTP |
| Ảnh, âm thanh, model, kết quả build (Build And Run) | HTTP `http://127.0.0.1:7777/t/<token>/...` |

## Tuỳ chọn

| Tuỳ chọn | Ý nghĩa |
|---|---|
| `--port 7777` | Cổng của agent |
| `--editor-url <url>` (hoặc `PIA_EDITOR_URL`) | Địa chỉ web editor đã deploy; agent in ra link mở sẵn |
| `--allow-origin <origin>` (hoặc `PIA_ALLOW_ORIGINS`, phân cách bằng dấu phẩy) | Cho phép thêm origin kết nối |
| `--token <t>` (hoặc `PIA_AGENT_TOKEN`) | Token cố định thay vì ngẫu nhiên |
| `--no-open` | Không tự mở trình duyệt |

## Bảo mật

- Agent chỉ nghe trên `127.0.0.1`.
- Mọi thứ cần token ngẫu nhiên (hoặc `--token`); file chỉ truy cập được trong thư mục project.
- WebSocket chỉ nhận kết nối từ origin của `--editor-url`, của chính agent và các `--allow-origin`.
- Token chỉ nằm trong phần `#` của link (không gửi lên server editor); editor đọc xong thì xoá khỏi thanh địa chỉ.

## Trình duyệt và kết nối

- Chrome / Edge / Firefox cho trang `https` kết nối tới `ws://127.0.0.1`. Chrome bản mới sẽ hỏi quyền truy cập "thiết bị trong mạng cục bộ" ở lần đầu — hãy cho phép. Safari có thể chặn.
- Mất kết nối (tắt agent, ngủ máy): editor tự kết nối lại; thanh trạng thái hiện `● Agent · <project>`.
- Editor và agent phải cùng phiên bản giao thức; lệch phiên bản thì editor báo lỗi khi kết nối.

::: tip
Khi làm việc trên máy có repo engine, `npm run editor` (Vite, hot reload theo từng module) vẫn là cách nhanh nhất. Web editor + agent dành cho việc phát hành editor cho người khác dùng.
:::
