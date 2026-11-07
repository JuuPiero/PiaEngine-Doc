---
title: FAQ & xử lý lỗi
description: Các câu hỏi thường gặp và cách xử lý lỗi hay gặp khi dùng PiaEngine.
---

# FAQ & xử lý lỗi

## Script

### Script không có trong Add Component

- Class phải được **`export`** và kế thừa `MonoBehaviour` (hoặc `Component`).
- File nằm trong `Assets/` (hoặc là entry runtime của một package), không nằm trong thư mục `Editor/`.
- Xem **Console**: lỗi biên dịch khiến script không được nạp.

### Field không hiện trong Inspector

- Tên bắt đầu bằng `_` → bị coi là private. Bỏ `_` hoặc thêm `@field`.
- Giá trị mặc định là `null` hoặc mảng rỗng → cần `@field(...)` để biết kiểu: `@field(GameObject) target: GameObject | null = null`, `@field(['string']) names: string[] = []`.
- Field là object thường (không phải Vector / Color / class `@serializable`) → không được lưu.

Xem [Field & Inspector](../scripting/fields.md).

### Gán `transform.position.x = 1` không có tác dụng

`position` trả về **bản sao**. Viết `const p = t.position; p.x = 1; t.position = p;`. Áp dụng cho mọi getter vector: `localScale`, `rotation`, `rigidbody.velocity`…

### Object 3D quay ngược / camera nhìn sai hướng

3D dùng hệ **right-handed, forward = -Z** (như three.js), khác Unity. Camera, đèn và `transform.forward` hướng theo -Z cục bộ. Đặt camera ở `z = 10` để nhìn về gốc toạ độ.

### `start()` cần dữ liệu nạp bất đồng bộ

Khai báo `async start()` và `await Resources.load(...)`, hoặc dùng coroutine `yield promise`. Asset được scene tham chiếu (prefab, ScriptableObject, material) đã được nạp trước, dùng được ngay trong `awake` / `start`.

### VS Code báo không tìm thấy `@pia/core`

Project có `tsconfig.json` với `paths` trỏ tới repo engine theo **đường dẫn tương đối** lúc tạo project. Nếu di chuyển project hoặc repo engine, sửa lại các đường dẫn trong `compilerOptions.paths`.

## Editor

### Phím không vào game trong Play Mode

Click vào **Game view** để focus. Khi Game view được focus, phím chữ được chuyển cho game thay vì đổi tool.

### Ctrl+Shift+N không tạo object rỗng

Chrome giữ tổ hợp này (cửa sổ ẩn danh). Dùng <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>N</kbd>.

### Thay đổi trong Play Mode bị mất

Đúng như Unity: Stop khôi phục scene trước khi Play. Ghi lại giá trị rồi sửa sau khi Stop, hoặc dùng ScriptableObject (sửa asset trong Inspector lúc Play thì được lưu).

### Không xoá / đổi cha được object con của prefab

Cấu trúc của prefab instance bị khoá. Mở prefab (Prefab Mode) hoặc **Unpack Prefab**. Xem [Prefab](../assets/prefabs.md).

### Cổng 5170 đã bị dùng

Chạy với cổng khác: `$env:PIA_PORT='5180'; npm run editor` (PowerShell) hoặc `PIA_PORT=5180 npm run editor` (bash).

## Âm thanh, đồ hoạ, vật lý

### Không nghe tiếng

- Trình duyệt chỉ phát âm thanh sau tương tác đầu tiên (click / phím): âm thanh gọi trước đó được hoãn.
- Kiểm tra nút **Mute Audio** của Game view, `AudioSource.mute`, `AudioListener.volume`.
- Âm 3D (`Spatial Blend` = 1): cần `AudioListener` trên camera và nguồn âm nằm trong `Max Distance`.

### Shader không chạy / object hiện màu mặc định

Shader lỗi được thay tạm bằng shader mặc định. Xem lỗi GLSL trong **Console** (số dòng tính từ đầu khối `GLSLPROGRAM`). Kiểm tra `Pipeline 2D` / `3D` khớp với renderer (shader 2D cho SpriteRenderer, 3D cho MeshRenderer / SkinnedMeshRenderer).

### Vật lý không chạy

- Cần **Rigidbody** (hoặc **Rigidbody2D**) trên object động và collider trên cả hai phía.
- Không trộn 2D và 3D: collider 2D chỉ va chạm với collider 2D.
- Scene pipeline 2D chỉ chạy vật lý 2D.
- Callback cần đúng tên: `onCollisionEnter` / `onTriggerEnter2D`… (camelCase).

## Build

### Bản build thiếu asset (lỗi 404 / asset trống)

Asset chỉ được nạp bằng tên hoặc đường dẫn tạo động lúc chạy → đặt vào `Resources/`, hoặc thêm vào `build.include`. Xem `Build/build-report.json` để biết asset nào bị loại. Xem [Build web](../build/build-web.md).

### Mở `index.html` của bản build thì trang trắng

Bản build cần chạy qua HTTP: `npx vite preview --outDir Build/web` hoặc deploy lên host tĩnh.

### File playable quá nặng

Bỏ vật lý nếu không cần (Rapier tốn vài MB), chỉ build scene cần thiết, nén ảnh / audio, dùng shader `Mobile/*`. Xem [Playable Ads](../build/playable-ads.md).

## Web editor

### Web editor không kết nối được agent

- Chrome hỏi quyền truy cập "thiết bị trong mạng cục bộ" ở lần đầu — chọn cho phép.
- Safari có thể chặn kết nối từ trang `https` tới `ws://127.0.0.1`: dùng Chrome / Edge / Firefox.
- Origin của trang editor phải là `--editor-url` hoặc nằm trong `--allow-origin`.
- Editor và agent phải cùng phiên bản.

Xem [Web editor + pia agent](../build/web-editor-agent.md).
