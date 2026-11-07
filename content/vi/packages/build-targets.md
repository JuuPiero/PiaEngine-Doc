---
title: Build target từ package
description: Thêm platform vào Build Settings bằng một module Node trong package.
---

# Build target từ package

Package có thể thêm **platform** vào **File → Build Settings** (ví dụ Playable Ads) bằng một module Node khai báo trong `package.json`:

```json
"pia": { "build": "Build/index.ts" }
```

Module chạy trong Node (server editor hoặc CLI), được bundle tại chỗ bằng esbuild. Export mặc định là một target (hoặc mảng target):

```ts Build/index.ts
import type { BuildTarget } from '@pia/build';   // chỉ type: mọi thứ khác lấy từ ctx

const target: BuildTarget = {
  id: 'my-platform',
  name: 'My Platform',
  options: [{ key: 'minify', label: 'Minify', type: 'boolean', default: true }],
  async build(ctx) {
    const game = await ctx.buildGame({ singleFile: true, minify: ctx.options.minify });
    ctx.log(`game built in ${game.outDir}`);
    // ...xử lý game.outDir rồi ghi kết quả vào ctx.outDir
  },
};
export default target;
```

## BuildTarget

| Trường | Ý nghĩa |
|---|---|
| `id` | Id ổn định: output ở `Build/<id>`, option lưu ở `pia.project.json → build.targets[id]` |
| `name`, `description` | Hiển thị trong Build Settings |
| `icon` | Tên icon lucide (ví dụ `'Megaphone'`) |
| `options` | Danh sách option, tự hiện thành form trong Build Settings |
| `build(ctx)` | Hàm build; có thể trả `{ outputs, summary, runFile }` (`runFile` = file mà **Build And Run** mở) |

Kiểu option: `string`, `number`, `boolean`, `text` (nhiều dòng), `enum`, `multi` (chọn nhiều từ `choices`); thêm `default`, `description`, `placeholder`, `group` (tiêu đề nhóm).

## BuildContext (`ctx`)

| Thành viên | Ý nghĩa |
|---|---|
| `projectRoot`, `engineRoot`, `packageDir` | Đường dẫn |
| `project` | Nội dung `pia.project.json` |
| `options` | Giá trị option (đã lưu → mặc định → ghi đè từ CLI) |
| `outDir` | Thư mục output: `<project>/Build/<id>` |
| `buildGame({ singleFile?, entry?, scenes?, minify?, target?, include?, outDir? })` | Build game như platform Web (có build stripping). `singleFile` = một script `game.js` dạng IIFE, mọi dynamic import được gộp — cần khi nhét game vào một file HTML |
| `bundleScript(entry, { format?, minify?, target?, define? })` | Bundle một script trình duyệt thành chuỗi |
| `resolve(request)` | Tìm module / file của dependency npm |
| `log`, `warn` | Ghi log |

## Chạy từ dòng lệnh

```bash
npm run build:game -- ../MyGame --target <id> [--set key=value]
# danh sách dùng dấu phẩy:
npm run build:game -- ../MyGame --target playable --set channels=AppLovin,Unity
```

Ví dụ hoàn chỉnh: `pia-packages/com.pia.playable/Build/index.ts` — xem [Playable Ads](../build/playable-ads.md).
