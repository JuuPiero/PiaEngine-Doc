---
title: Giới thiệu
description: PiaEngine là game engine chạy trên web với concept và thao tác giống Unity.
---

# PiaEngine

<p class="lead">Game engine chạy trên trình duyệt, concept và thao tác giống Unity: Hierarchy, Scene, Inspector, Prefab, MonoBehaviour, Play Mode… nhưng script viết bằng TypeScript và game build ra web tĩnh hoặc playable ads.</p>

Nếu bạn đã quen Unity, phần lớn kiến thức dùng lại được ngay. Tài liệu này viết cho **người làm game** dùng engine, không phải người phát triển engine.

## Có gì trong PiaEngine

| Mảng | Nội dung |
|---|---|
| Editor | Chạy trên trình duyệt, layout và phím tắt giống Unity: Hierarchy, Scene, Game, Inspector, Project, Console, Animation, Package Manager, Build Settings, Sprite Editor. Có Project Hub để tạo / mở project. |
| Render 2D | PixiJS v8. World unit, trục Y hướng lên, 100 pixel = 1 unit như Unity 2D. Sprite sheet, Sprite Editor, 9-slice (Sliced / Tiled). |
| Render 3D | three.js: mesh, model glTF/GLB/FBX/OBJ, ánh sáng, bóng đổ, fog. |
| Scripting | TypeScript, class `MonoBehaviour` với `awake/start/update/...`, field tự hiện trong Inspector, `@field(...)` thay cho `[SerializeField]`/`[Range]`, Inspector attributes kiểu Odin (`@button`, `@showIf`, `@boxGroup`…). Sửa trong VS Code → editor tự nạp lại. |
| Asset | `.meta` + GUID như Unity, đổi tên / di chuyển không mất tham chiếu. ScriptableObject, Resources. |
| Prefab | Lồng nhau, override (in đậm), Apply / Revert / Unpack, Prefab Mode. |
| Đồ hoạ | Material + Shader viết theo cú pháp kiểu ShaderLab với GLSL, surface shader có chiếu sáng, nhiều shader dựng sẵn. Particle System. |
| Gameplay | Vật lý 2D/3D chọn engine theo project (Rapier với joint, effector, CharacterController — hoặc builtin ~12 KB chỉ phát hiện va chạm); Audio; UI (Canvas / Text / Image / Button); Animation clip + cửa sổ Animation. |
| Package | `package.json` của project là manifest, cài bằng `npm install`. Package có phần Runtime và Editor, mở rộng editor bằng API (menu, inspector, gizmo Scene view, property drawer, custom renderer). |
| Package chính thức | Spine, Splines, Cinemachine, UI Toolkit (HTML / CSS), Playable Ads. |
| Build | Web tĩnh, chỉ đóng gói thứ thực sự dùng. Package `com.pia.playable` xuất playable ads cho AppLovin, Unity, ironSource, Mintegral, Facebook, Google, TikTok… |

## Bắt đầu từ đâu

<div class="cards">
  <a href="#/getting-started/install"><strong>Cài đặt</strong><span>Cài engine, mở Project Hub, chạy project mẫu.</span></a>
  <a href="#/getting-started/first-script"><strong>Script đầu tiên</strong><span>Tạo MonoBehaviour, gắn vào object, bấm Play.</span></a>
  <a href="#/getting-started/from-unity"><strong>Từ Unity sang PiaEngine</strong><span>Bảng đối chiếu API và những điểm khác cần biết.</span></a>
  <a href="#/editor/overview"><strong>Editor</strong><span>Các cửa sổ, tool, gizmo, Play Mode.</span></a>
  <a href="#/graphics/writing-shaders"><strong>Viết shader</strong><span>Shader 2D, unlit, lit surface shader, render state.</span></a>
  <a href="#/packages/using-packages#package-chinh-thuc"><strong>Package chính thức</strong><span>Spine, Splines, Cinemachine, UI Toolkit (HTML / CSS).</span></a>
  <a href="#/build/playable-ads"><strong>Playable Ads</strong><span>Một file HTML cho từng mạng quảng cáo.</span></a>
</div>

## Ví dụ nhỏ

```ts Assets/Scripts/Rotator.ts
import { MonoBehaviour, Time, Vector3, field, type GameObject } from '@pia/core';

export class Rotator extends MonoBehaviour {
  speed = new Vector3(0, 90, 0);                          // tự hiện trong Inspector
  @field({ range: [0, 10] }) multiplier = 1;              // slider
  @field('gameObject') target: GameObject | null = null;  // kéo object từ Hierarchy vào

  update() {
    this.transform.rotate(this.speed.mul(this.multiplier * Time.deltaTime));
  }
}
```

Lưu file → editor tự biên dịch lại, gắn `Rotator` vào một object trong Inspector, bấm **Play** (Ctrl+P).

## Project mẫu

Repo engine có hai project mẫu, nên mở ra xem khi đọc tài liệu:

- **examples/Demo2D**: platformer 2D (Rigidbody2D, nhặt sao, ScriptableObject `PlayerStats`, shader `Shine`, hiệu ứng `Sparkle`, build playable).
- **examples/Demo3D**: scene 3D (nhân vật vật lý, robot glTF có animation, shader `Hologram`, vòi phun hạt, package nhúng `com.pia.tween`).

::: tip Tìm kiếm nhanh
Bấm <kbd>Ctrl</kbd> + <kbd>K</kbd> (hoặc <kbd>/</kbd>) để tìm trong toàn bộ tài liệu. Gõ không dấu cũng được, ví dụ `vong doi`.
:::
