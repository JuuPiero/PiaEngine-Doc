---
title: Project Hub
description: Tạo và mở project bằng Project Hub (giống Unity Hub) hoặc dòng lệnh.
---

# Project Hub

**Project Hub** (giống Unity Hub) là trang đầu tiên khi chạy `npm run editor` không kèm đường dẫn project.

## Danh sách project

- Project mở gần đây (lưu ở `~/.pia/hub.json`) và các project ví dụ của engine.
- Ô tìm kiếm để lọc theo tên.
- Menu **⋮** của từng project: **Show in Explorer**, **Remove from list**.

## Tạo project mới

Bấm **New project**:

1. Chọn mẫu **2D** hoặc **3D**.
2. Đặt tên và chọn thư mục (**Browse…** để duyệt thư mục trên máy).
3. Bấm tạo → project được tạo rồi mở luôn.

Mẫu 2D tạo scene `SampleScene` có **Main Camera** orthographic; mẫu 3D có thêm **Directional Light**. Mẫu chỉ quyết định pipeline mặc định của scene mới: một project vẫn chứa được cả scene 2D lẫn 3D (xem [Scene & pipeline](../editor/scenes.md)).

Tạo bằng dòng lệnh cũng được:

```bash
npm run create -- ../MyGame 2d   # hoặc 3d
```

## Mở project có sẵn

**Open** → chọn thư mục có file `pia.project.json`.

Khi mở project, server của editor khởi động lại trên project đó ở **cùng địa chỉ**, nên layout và cài đặt của trang được giữ nguyên.

## Quay lại Hub từ editor

**File → Open Project… / New Project…** quay về Hub (editor hỏi lưu scene trước).
