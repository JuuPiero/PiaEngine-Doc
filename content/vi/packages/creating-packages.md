---
title: Viết package
description: Tạo package nhúng, cấu trúc thư mục, mục "pia" trong package.json và chia sẻ package.
---

# Viết package

## Tạo package

```bash
npm run pia -- package create com.mycompany.tools ../MyGame   # hoặc Package Manager → + → Create new package…
npm run pia -- package list ../MyGame
```

Lệnh tạo `Packages/com.mycompany.tools/` — một **package nhúng** (embedded): sửa trực tiếp, hot-reload như script trong `Assets/`.

```text
Packages/com.mycompany.tools/
  package.json        npm package bình thường + mục "pia"
  Runtime/index.ts    code chạy trong game; mọi class Component được export tự đăng ký
  Editor/index.ts     code chỉ chạy trong editor (menu, inspector, cửa sổ); không vào bản build
  README.md
```

## package.json

```json
{
  "name": "com.mycompany.tools",
  "version": "0.1.0",
  "type": "module",
  "main": "Runtime/index.ts",
  "pia": { "displayName": "Tools", "runtime": "Runtime/index.ts", "editor": "Editor/index.ts" },
  "peerDependencies": { "@pia/core": "*" }
}
```

| Khoá trong `"pia"` | Ý nghĩa |
|---|---|
| `displayName` | Tên hiện trong Package Manager |
| `runtime` | Entry chạy trong game |
| `editor` | Entry chỉ chạy trong editor |
| `build` | (Tuỳ chọn) Module Node thêm platform vào Build Settings — xem [Build target](build-targets.md) |
| `renderers` | (Tuỳ chọn) `{ "2d": "...", "3d": "..." }` — module vẽ component riêng theo pipeline, xem [Custom renderer](#custom-renderer) |

## Custom renderer

Package có thể thêm component **tự vẽ** mà engine chưa biết (như Spine: skeleton, tilemap, hình vector…). Phần vẽ phụ thuộc pipeline nên tách thành module riêng cho từng pipeline và khai báo trong `package.json`:

```json
"pia": {
  "runtime": "Runtime/index.ts",
  "renderers": { "2d": "Runtime/Pixi/MyRenderer.ts", "3d": "Runtime/Three/MyRenderer.ts" }
}
```

Engine nạp module đó cùng backend của pipeline, và bản build chỉ kèm module của pipeline mà các scene dùng (game 2D không tải three.js). Module tự đăng ký bằng `CustomRenderers.register`:

```ts Runtime/Pixi/MyRenderer.ts
import { CustomRenderers } from '@pia/core';
import type { PixiCustomRenderer } from '@pia/render-pixi';
import { Graphics } from 'pixi.js';
import { Ring } from '../Ring';            // component của package (có field radius, sortingOrder...)

const renderer: PixiCustomRenderer<Ring, Graphics> = {
  create: () => new Graphics(),
  sync(g, ring) {
    g.clear().circle(0, 0, ring.radius).stroke({ width: 0.05, color: 0xffcc00 });
  },
  getLocalBounds: (_g, ring) => ({ x: -ring.radius, y: -ring.radius, width: ring.radius * 2, height: ring.radius * 2 }),
};

CustomRenderers.register(Ring, '2d', renderer);
```

| Pipeline | Interface | Hàm |
|---|---|---|
| `'2d'` | `PixiCustomRenderer` (`@pia/render-pixi`) | `create(component, backend)` → display object PixiJS; `sync(object, component, backend)` mỗi frame (trả `false` để ẩn frame này, ví dụ đang nạp); `destroy?(object, component)`; `getLocalBounds?(object, component)` cho chọn / khung chọn / Rect tool / Frame Selected |
| `'3d'` | `ThreeCustomRenderer` (`@pia/render-three`) | `create` → `THREE.Object3D`; `sync`; `destroy?` (giải phóng geometry, material, texture tự tạo) |

- Engine lo vị trí: 2D đặt transform theo world matrix của GameObject (vẽ trong toạ độ local, đơn vị world, Y hướng lên) và sắp xếp theo `sortingOrder` (Order in Layer), Z, thứ tự hierarchy như SpriteRenderer; 3D gắn object vào node của GameObject.
- Quy ước: Behaviour đang tắt (`enabled === false`) không được vẽ; property số `sortingOrder` là Order in Layer.
- Script trong project cũng gọi `CustomRenderers.register` trực tiếp được (khi đó import thư viện của pipeline theo kiểu tĩnh).
- Ví dụ thật: `pia-packages/com.pia.spine` (`Runtime/Pixi/SpinePixiRenderer.ts`, `Runtime/Three/SpineThreeRenderer.ts`).

## Ví dụ: com.pia.tween

Project Demo3D có package nhúng `Packages/com.pia.tween`:

```ts Packages/com.pia.tween/Runtime/index.ts
import { Mathf, MonoBehaviour, Time, Vector3, field, type CoroutineGenerator, type Transform } from '@pia/core';

/** Tween helpers built on coroutines. */
export const Tween = {
  *moveTo(t: Transform, target: Vector3, duration: number, ease: EaseName = 'inOutQuad'): CoroutineGenerator {
    const from = t.position;
    for (let e = 0; e < duration; e += Time.deltaTime) {
      t.position = Vector3.lerp(from, target, Ease[ease](e / duration));
      yield null;
    }
    t.position = target;
  },
  // ...
};

/** Makes an object "breathe" by ping-ponging its scale. */
export class PulseScale extends MonoBehaviour {
  @field({ range: [0, 2] })
  amount = 0.2;
  // ...
}
```

- `PulseScale` hiện trong **Add Component → Packages/com.pia.tween**.
- Script trong project dùng: `this.startCoroutine(Tween.moveTo(this.transform, new Vector3(0, 3, 0), 1, 'outBack'))`.
- Phần Editor thêm menu **Tools → Tween**:

```ts Packages/com.pia.tween/Editor/index.ts
import { defineEditorExtension } from '@pia/editor';
import { ComponentRegistry } from '@pia/core';

/** Editor-only part of the Tween package (never included in game builds). */
export default defineEditorExtension((ctx) => {
  ctx.addMenuItem(
    'Tools/Tween/Add Pulse To Selection',
    () => {
      const info = ComponentRegistry.get('PulseScale');
      if (!info) return;
      ctx.recordUndo('Add PulseScale');
      for (const go of ctx.selection) if (!go.getComponent(info.ctor)) go.addComponent(info.ctor);
      ctx.markSceneChanged();
    },
    { enabled: () => ctx.selection.length > 0 },
  );
});
```

## Chia sẻ

`npm publish` trong thư mục package (hoặc push lên git), rồi ở project khác:

```bash
npm install com.mycompany.tools
# hoặc
npm install github:mycompany/tools#v1
```

Package dùng thư viện npm khác thì khai báo trong `dependencies` của package như bình thường.
