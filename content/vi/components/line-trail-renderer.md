---
title: Line Renderer & Trail Renderer
description: Vẽ đường (laser, đường đi, khung) và vệt sau vật thể đang bay — chạy cả 2D và 3D, kéo điểm ngay trong Scene view.
---

# Line Renderer & Trail Renderer

Giống `LineRenderer` / `TrailRenderer` của Unity. Chạy được cả scene **2D** (mesh PixiJS, sắp xếp cùng sprite theo Order in Layer) lẫn **3D** (mesh three.js quay mặt về camera — dựng lại cho từng camera nên Scene view, Game view và nhiều camera chồng nhau đều đúng).

Đường vẽ là một dải (ribbon) thật chứ không phải nét 1 pixel:

- góc nối **miter** (góc gắt hơn 120° thì **vát**), không hở, không gai nhọn; hoặc **bo tròn** bằng Corner Vertices;
- hai đầu phẳng hoặc **bo tròn** (End Cap Vertices);
- **độ rộng** và **màu** nội suy từ đầu tới cuối đường (theo chiều dài);
- UV theo **Texture Mode** (kéo giãn hoặc lặp texture).

## Tạo

- **GameObject → Effects → Line** — object "Line" với 2 điểm local `(0,0,0) → (1,0,0)`, rộng 0.1, nằm ở chỗ tạo (di chuyển bằng công cụ transform).
- **GameObject → Effects → Trail** — object "Trail" với Trail Renderer.
- Hoặc **Add Component → Effects → Line Renderer / Trail Renderer**.

::: note 2D
Unity đặt 2 điểm mặc định là `(0,0,0), (0,0,1)` (theo trục Z) — nhìn từ camera 2D chỉ thấy một chấm. Trong scene 2D, Add Component dùng `(0,0,0), (1,0,0)` để nhìn thấy được ngay.
:::

## Sửa điểm trong Scene view

Giống chế độ **Edit Points** của Unity, bật sẵn khi chọn object:

- mỗi điểm là một **chấm trắng**: kéo để di chuyển (trong mặt phẳng nhìn; 2D là mặt XY). Giữ <kbd>Ctrl</kbd> để snap;
- **bấm** vào một điểm → hiện **mũi tên di chuyển theo trục** tại điểm đó (công cụ transform của object tạm ẩn). <kbd>Esc</kbd> để thoát;
- mỗi lần kéo là **một bước Undo** (<kbd>Ctrl</kbd>+<kbd>Z</kbd>);
- thêm / xoá điểm bằng danh sách **Positions** trong Inspector.

Đường nét đứt mờ nối các điểm giúp thấy đường cả khi nó rất mảnh.

## Line Renderer

| Thuộc tính | Field | Mặc định | Mô tả |
|---|---|---|---|
| Loop | `loop` | `false` | Nối điểm cuối về điểm đầu (cần ≥ 3 điểm) |
| Positions | `positions` | `(0,0,0), (0,0,1)` | World space khi Use World Space bật, ngược lại là toạ độ local của object |
| Start Width / End Width | `startWidth`, `endWidth` | `0.2`, `0.2` | Độ rộng ở điểm đầu / cuối (đơn vị world) |
| Width Multiplier | `widthMultiplier` | `1` | Nhân với Start / End Width |
| Start Color / End Color | `startColor`, `endColor` | trắng | Nhân với màu / texture của material |
| Corner Vertices | `numCornerVertices` | `0` | 0 = góc miter / vát; > 0 = bo tròn |
| End Cap Vertices | `numCapVertices` | `0` | 0 = đầu phẳng; > 0 = bo tròn |
| Alignment | `alignment` | `View` | `View`: dải quay về camera; `TransformZ`: mặt dải vuông góc trục Z của object |
| Texture Mode | `textureMode` | `Stretch` | Xem bên dưới |
| Use World Space | `useWorldSpace` | `true` | |
| Materials | `sharedMaterials` | `Default-Line` | Mỗi material vẽ đường một lần, theo thứ tự |
| Cast Shadows / Receive Shadows | `castShadows`, `receiveShadows` | `false` | Chỉ 3D |
| Order in Layer | `sortingOrder` | `0` | 2D: thứ tự với sprite; 3D: `renderOrder` |

Độ rộng **không** bị scale của Transform ảnh hưởng (như Unity), kể cả khi Use World Space tắt.

### Texture Mode

| Giá trị | UV dọc theo đường |
|---|---|
| `Stretch` | Texture trải một lần từ đầu tới cuối |
| `Tile` | Lặp mỗi 1 đơn vị world; chỉnh mật độ bằng **Tiling** của material |
| `DistributePerSegment` | Một lần cho cả đường, coi các đoạn dài bằng nhau |
| `RepeatPerSegment` | Lặp một lần mỗi đoạn |

### Material

- **Default-Line** (material dựng sẵn, shader `Particles/Unlit`): không chịu ánh sáng, alpha blend, không cull mặt sau, màu = màu đỉnh × `_Color` × `_MainTex`. Dùng được ở cả 2D và 3D. Muốn đổi màu / texture: tạo Material với shader `Particles/Unlit` hoặc dùng `renderer.material` (bản sao riêng).
- **2D**: shader `Sprites/*` dựng sẵn (blend Alpha / Additive / Multiply / Screen theo shader) và shader 2D tự viết — `frag(uv)` nhận `uv.x` dọc đường, `uv.y` ngang đường (0 → 1); màu của đường là `_SpriteColor`, `mainTex(uv)` là `_MainTex` của material.
- **3D**: mọi material 3D — Standard (có ánh sáng, đổ bóng), Unlit/*, shader tự viết (`vertexColor()` là màu của đường). Material dựng sẵn cũng được tô theo màu đỉnh.

### Từ code

```ts
import { Color, LineRenderer, MonoBehaviour, Vector3 } from '@pia/core';

export class Laser extends MonoBehaviour {
  target: Vector3 = new Vector3(5, 0, 0);

  update() {
    const line = this.getComponent(LineRenderer)!;
    line.useWorldSpace = true;
    line.positionCount = 2;
    line.setPosition(0, this.transform.position);
    line.setPosition(1, this.target);
  }
}
```

```ts
line.setPositions([a, b, c]);          // thay toàn bộ điểm (positionCount = 3)
line.getPosition(1); line.getPositions();
line.positionCount = 10;               // thêm điểm (0,0,0) / bớt điểm cuối
line.startColor = Color.red;
line.endColor = new Color(1, 0, 0, 0);
line.widthMultiplier = 0.5;
line.simplify(0.05);                   // bỏ điểm gần như thẳng hàng (Ramer–Douglas–Peucker)
line.material!.color = Color.cyan;     // material riêng của renderer này
```

## Trail Renderer

Để lại vệt sau object đang di chuyển (chạy trong **Play Mode**). Mỗi frame (sau `update` của các script), nếu object đã đi được `minVertexDistance` thì thêm một điểm; mỗi điểm sống `time` giây. Độ rộng / màu đi từ **Start** (ở object) tới **End** (điểm già nhất) theo **tuổi** của điểm, nên đuôi vệt mờ dần mượt mà.

| Thuộc tính | Field | Mặc định | Mô tả |
|---|---|---|---|
| Start Width / End Width, Width Multiplier | `startWidth`, `endWidth`, `widthMultiplier` | `0.5`, `0`, `1` | |
| Time | `time` | `5` | Thời gian sống của một điểm (giây) |
| Min Vertex Distance | `minVertexDistance` | `0.1` | Khoảng cách tối thiểu giữa hai điểm |
| AutoDestruct | `autodestruct` | `false` | Huỷ GameObject khi đứng yên `time` giây và vệt đã hết |
| Emitting | `emitting` | `true` | Tắt = ngừng thêm điểm; vệt tách khỏi object và mờ dần |
| Start Color / End Color | `startColor`, `endColor` | trắng → trắng trong suốt | |
| Corner Vertices, End Cap Vertices, Alignment, Texture Mode, Materials, Cast / Receive Shadows, Order in Layer | | | Như Line Renderer |

Điểm của vệt luôn ở world space.

```ts
const trail = this.getComponent(TrailRenderer)!;
trail.clear();                         // xoá vệt (vd. sau khi dịch chuyển tức thời)
trail.emitting = false;                // ngừng vẽ thêm
trail.positionCount;                   // số điểm (0 = cũ nhất)
trail.getPosition(0); trail.getPositions();
trail.addPosition(p); trail.setPositions([a, b]);
```

## Ví dụ

- Demo2D: scene `Assets/Scenes/Lines2D.scene.json`
- Demo3D: scene `Assets/Scenes/Lines.scene.json`

Trong mỗi scene: ngôi sao khép kín (Loop) với độ rộng thu nhỏ dần và màu chuyển, đường zigzag bo tròn góc và hai đầu, tia laser do script `LaserBeam` cập nhật mỗi frame (`positionCount` + `setPosition`), và một vật bay hình số 8 (`Orbiter`) kéo theo Trail Renderer.

## Build

Phần vẽ line của pipeline (2D hoặc 3D) chỉ được đưa vào bản build khi scene, prefab hoặc script dùng `LineRenderer` / `TrailRenderer`. Báo cáo build ghi `Line/Trail renderers ✓` / `✗`.

::: note Chưa hỗ trợ
Width curve và Color gradient nhiều điểm (chỉ start → end), Shadow Bias, Generate Lighting Data, `BakeMesh`, Sorting Layer, xem Trail trong Edit Mode.
:::
