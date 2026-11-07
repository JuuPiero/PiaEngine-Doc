---
title: Dùng package
description: Cài thư viện npm và Pia package vào project bằng npm hoặc Package Manager.
---

# Dùng package

`package.json` của project **là manifest** (tương đương `Packages/manifest.json` của Unity). Dùng npm như mọi project web.

## Cài bằng dòng lệnh

```bash
cd MyGame
npm install gsap                       # thư viện npm thường: import thẳng trong script
npm install some-pia-package           # Pia package từ npm
npm install github:me/my-pia-tools#v1  # từ git
npm install ../shared/my-package       # thư mục local (file: dependency)
```

Editor tự nạp lại khi `package.json` thay đổi.

## Package Manager

**Window → Package Manager**:

- Nút **+**: **Add package by name / git URL…**, **Add package from disk…**, **Create new package…**.
- Bộ lọc: *In Project*, *Pia packages only*, *Embedded (being developed)*.
- Nút **npm install** (hoặc **Install missing** khi có package chưa cài) chạy `npm install` trong thư mục project.
- Chọn một package để xem: Version spec, Location, phần Runtime / Editor, Components mà package cung cấp, Dependencies; các nút **Remove**, **Update to latest**, **Show in Explorer**.

## Thư viện npm thường

Import thẳng trong script, bundler của engine lo phần còn lại:

```ts
import { gsap } from 'gsap';

export class Intro extends MonoBehaviour {
  start() {
    gsap.to(this, { duration: 1 /* ... */ });
  }
}
```

## Pia package

Pia package là npm package có mục `"pia"` trong `package.json`. Engine nhận diện:

- **Runtime**: code chạy trong game. Mọi class component được export tự đăng ký, hiện trong **Add Component → Packages/&lt;tên package&gt;**.
- **Editor**: code chỉ chạy trong editor (menu, inspector, cửa sổ) — không vào bản build.
- **Build** (tuỳ chọn): thêm platform vào Build Settings, ví dụ Playable Ads.

Script trong project import package theo tên:

```ts
import { Playable } from 'com.pia.playable';
import { Tween } from 'com.pia.tween';
```

## Package chính thức

Nằm trong thư mục `pia-packages/` của repo engine, cài bằng đường dẫn:

```bash
npm install ../PiaEngine/pia-packages/com.pia.playable
```

| Package | Nội dung |
|---|---|
| [`com.pia.spine`](../official/spine.md) | Animation xương Spine 4.2 (như spine-unity), 2D và 3D |
| [`com.pia.spline`](../official/spline.md) | Đường cong Bézier sửa trong Scene view, SplineAnimate, SplineInstantiate |
| [`com.pia.cinemachine`](../official/cinemachine.md) | Camera thông minh: virtual camera, blend, dead zone, orbit, noise, impulse, confiner |
| [`com.pia.ui-toolkit`](../official/ui-toolkit.md) | UI viết bằng HTML + CSS (UIDocument), data binding |
| [`com.pia.playable`](../build/playable-ads.md) | Xuất playable ads cho các mạng quảng cáo |

Bản build chỉ kèm package có component được dùng hoặc được script import.
