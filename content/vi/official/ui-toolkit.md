---
title: UI Toolkit (HTML / CSS)
description: Package com.pia.ui-toolkit — UI viết bằng HTML và CSS thật, component UIDocument, data binding, chạy cả trong playable ads.
---

# UI Toolkit (`com.pia.ui-toolkit`)

UI giống **UI Toolkit của Unity** (`UIDocument` + UXML + USS), nhưng viết bằng **HTML và CSS thật**:

| Unity | PiaEngine |
|---|---|
| UXML (`VisualTreeAsset`) | File `.html` — asset **UI Document** |
| USS (`StyleSheet`) | File `.css` — asset **Style Sheet** |
| `UIDocument` + `PanelSettings` | Component `UIDocument` (Source Asset, Style Sheets, Sort Order, Panel Settings) |
| `rootVisualElement`, `Q()`, `Query()` | `doc.rootVisualElement` (thẻ `<body>`), `doc.q('#id')`, `doc.qAll('.class')` |
| `RegisterCallback<ClickEvent>` | `doc.on('#play', 'click', fn)` (tự gỡ khi disable / destroy) |
| Runtime data binding | `{{score}}`, `data-bind="score"`, `data-show`, `data-bind-class-*`… |
| `picking-mode`, `EventSystem.IsPointerOverGameObject` | Chỉ phần tử tương tác chặn click; `UIDocument.isPointerOverUI()` |

UI là lớp DOM phủ lên game (Game view của editor, bản build web, playable ads). Mỗi document nằm trong một **Shadow DOM** riêng: CSS của bạn không lọt ra editor / trang web và ngược lại. [Canvas UI](../components/ui.md) (Canvas / Text / Image / Button) vẫn dùng song song được; document HTML luôn vẽ trên Canvas UI.

## Cài đặt

```bash
cd MyGame
npm install ../PiaEngine/pia-packages/com.pia.ui-toolkit   # hoặc Window → Package Manager → Add package from disk
```

Demo2D đã cài sẵn (scene `Assets/Scenes/Platformer HTML UI.scene.json`).

## Bắt đầu nhanh

1. **Project → Create → UI Toolkit → UI Document**: tạo `New UI Document.html` + `New UI Document.css` (HTML đã link sẵn CSS, có mẫu HUD + menu pause). **Create → UI Toolkit → Style Sheet** tạo riêng một file `.css`.
2. Chọn file `.html` rồi **GameObject → UI Toolkit → UI Document**: tạo object có component `UIDocument` trỏ tới file đó (hoặc **Add Component → UI Toolkit → UI Document** rồi kéo file `.html` vào ô **Source Asset**).
3. Game view hiện UI ngay cả ở Edit Mode. Double-click file (hoặc nút **Edit …html / …css** trong Inspector) để mở bằng code editor; lưu file là editor cập nhật ngay, kể cả khi đang Play.

```html Assets/UI/HUD.html
<!doctype html>
<html>
<head>
  <link rel="stylesheet" href="HUD.css">            <!-- đường dẫn tương đối như web -->
</head>
<body>
  <div class="hud">
    <img src="../Sprites/star.svg"> <b>{{score}}</b> / {{total}}
    <button id="pause">II</button>
  </div>
  <div id="menu" class="menu" data-show="paused">
    <button id="resume">Resume</button>
  </div>
</body>
</html>
```

```ts Assets/Scripts/Hud.ts
import { MonoBehaviour, Time, field } from '@pia/core';
import { UIDocument } from 'com.pia.ui-toolkit';

export class Hud extends MonoBehaviour {
  @field(UIDocument) doc: UIDocument | null = null;
  score = 0;
  total = 6;
  paused = false;

  onEnable() {
    const doc = this.doc!;
    doc.dataSource = this;                                  // {{score}}, data-show="paused" đọc field / getter của this
    doc.on('#pause', 'click', () => this.setPaused(true));  // tự gỡ khi document bị disable / destroy
    doc.on('#resume', 'click', () => this.setPaused(false));
  }

  setPaused(p: boolean) {
    this.paused = p;
    Time.timeScale = p ? 0 : 1;
  }
}
```

## Component UIDocument

| Field | Ý nghĩa |
|---|---|
| Source Asset | File `.html` (lưu bằng GUID) |
| Style Sheets | Thêm file `.css` (áp sau các CSS mà HTML tự link), lưu bằng GUID |
| Sort Order | Document có số lớn hơn nằm trên |
| Visible | Ẩn mà vẫn giữ nguyên trạng thái DOM (tắt component thì DOM bị xoá, bật lại thì dựng mới — giống Unity) |
| Panel Settings | **Scale Mode**: `Constant Pixel Size` (Scale Factor) hoặc `Scale With Screen Size` (Reference Resolution, Screen Match Mode `Match Width Or Height` / `Expand` / `Shrink`, Match 0 = theo rộng … 1 = theo cao) — như Canvas Scaler / PanelSettings của Unity |
| Data Source | Component mà binding đọc giá trị (mặc định `doc.data`) |

Inspector có thêm nút mở HTML / từng CSS trong code editor, nút **Reload**, và thông tin kích thước panel (px), scale, số phần tử.

Một px trong CSS là một "panel pixel": panel có kích thước = game view / scale, rồi được phóng to bằng `transform: scale()`. Ví dụ Reference Resolution 1280 × 720 thì trên mọi màn hình 16:9 nút `width: 64px` luôn chiếm 5% chiều rộng.

## Vòng đời

- **Play Mode / game**: `onEnable` dựng DOM (mọi `.html` / `.css` / font của các UIDocument trong scene, kể cả object đang tắt, được nạp trước khi scene chạy); `onDisable` xoá DOM và gỡ listener của `doc.on`; `onDestroy` huỷ hẳn. Nên đăng ký sự kiện trong `onEnable()`.
- Gọi `doc.rootVisualElement` / `q()` / `on()` trước `onEnable` của UIDocument vẫn được: DOM được dựng ngay khi cần.
- **Edit Mode**: Game view hiển thị preview mọi UIDocument đang bật (binding chưa có giá trị hiện nguyên `{{path}}`; phần tử `data-show` chưa có giá trị vẫn hiện để dễ thiết kế). Click vào UI trong Game view = chọn GameObject của document đó.
- Prefab có UIDocument `instantiate` lúc chạy mà file chưa nạp: DOM xuất hiện sau khi nạp xong (`await doc.ready`). Nạp trước: `await UIAssets.preload('Assets/UI/Shop.html', [])`.

## API

```ts
doc.rootVisualElement            // <body> của document (null nếu file chưa nạp)
doc.shadowRoot                   // shadow root
doc.hostElement                  // phần tử đặt trên game view
doc.q<HTMLButtonElement>('#play')   // querySelector trong document
doc.qAll('.coin')                // mảng phần tử
doc.on('#play', 'click', (e, el) => {})   // delegate theo selector: áp cả cho phần tử tạo sau / sau hot reload
doc.on(element, 'input', (e) => {})       // hoặc gắn thẳng vào một phần tử
const off = doc.on('.slot', 'pointerenter', fn, { once: true });  off();   // gỡ thủ công
doc.offAll();
doc.dataSource = this;           // component; object thường: doc.bind({ ... }); hoặc doc.data.score = 3 / doc.setData({ score: 3 })
doc.refreshBindings();           // cập nhật ngay (bình thường tự cập nhật mỗi frame)
doc.visible = false;
doc.sortOrder = 5;
doc.sourceAsset = 'Assets/UI/Shop.html';    // đổi document lúc chạy (path hoặc GUID)
await doc.ready;                 // đợi file nạp xong
await doc.reload();              // đọc lại file
doc.panelSize;                   // { width, height, scale }
UIDocument.isPointerOverUI();    // con trỏ đang trên phần tử UI tương tác (mọi document)
UIDocument.instances;            // các document đang bật
uiFontFamily('Inter');           // tên font-family thật (đã đổi tên) khi set style bằng code
```

Mọi API DOM bình thường đều dùng được (`classList`, `style`, `animate()`, `appendChild`…). Hot reload file HTML dựng lại DOM, nên tham chiếu phần tử giữ trong biến sẽ cũ — ưu tiên `doc.on(selector, …)` và binding.

## Data binding

Giá trị lấy từ **Data Source** (field, getter; `a.b.c`, `items[0].name`), đánh giá lại mỗi frame, chỉ chạm DOM khi giá trị đổi:

| Cú pháp | Tác dụng |
|---|---|
| `{{score}}` trong text hoặc giá trị attribute (`style="width: {{hp}}%"`, `class="slot {{state}}"`) | Chèn giá trị |
| `data-bind="player.name"` | `textContent`; với `<input>` / `<select>` / `<textarea>` là **hai chiều** (`value`, checkbox: `checked`; số giữ là số) |
| `data-bind-src="iconUrl"`, `data-bind-disabled="locked"` | Đặt attribute (boolean → bật / tắt attribute) |
| `data-bind-class-active="selected"` | Bật / tắt class theo giá trị đúng / sai |
| `data-bind-style-opacity="fade"`, `data-bind-style---fill="hpRatio"` | Đặt thuộc tính CSS (cả biến `--fill`) |
| `data-show="paused"` / `data-hide="paused"` | Hiện / ẩn (attribute `hidden`) |

## Chặn click vào game

Mặc định chỉ **phần tử tương tác** nhận chuột: `button`, `a[href]`, `input`, `select`, `textarea`, `label`, `summary`, `[tabindex]`, `[contenteditable]`, phần tử có listener qua `doc.on(...)`, class `.pickable` / `data-picking="position"`, hoặc phần tử có `pointer-events: auto` trong CSS (ví dụ nền menu modal). Khung bố cục phủ màn hình vẫn cho click xuyên xuống game; `data-picking="ignore"` để bỏ một phần tử.

- Click / chạm vào phần tử tương tác **không tới** `Input` của game; con lăn chuột cũng vậy.
- `UIDocument.isPointerOverUI()` và `EventSystem.isPointerOverGameObject()` trả về `true` khi con trỏ đang trên phần tử tương tác.
- Gõ phím trong `<input>` / `<textarea>` không điều khiển nhân vật và không kích hoạt phím tắt editor.
- Hover / transition / animation CSS chạy bình thường, kể cả khi `Time.timeScale = 0`.

## CSS trong document

Viết như trang web bình thường, thêm vài quy ước để khớp game view:

- `vw`, `vh`, `vmin`, `vmax` (cả `dvh`…) là kích thước **panel**, không phải cửa sổ trình duyệt.
- `@media (orientation: portrait)`, `@media (max-width: 600px)`… được đổi thành `@container` theo panel → test được bằng preset tỉ lệ của Game view (9:16 Portrait…).
- `:root { --accent: … }` dùng được; selector `html`, `body` khớp với `<html>` / `<body>` của document. `position: fixed` tính theo panel.
- `@font-face` dùng font trong project: `src: url('Fonts/MyFont.woff2')`. Font được đăng ký dưới tên riêng nên không ảnh hưởng font của editor; đặt font bằng code: `el.style.fontFamily = uiFontFamily('MyFont')`.
- `@import` và `<link rel="stylesheet">` tới file trong project được nạp qua AssetDatabase (chạy cả trong playable). CSS từ URL ngoài cũng được, trừ trong playable ads.
- Mặc định: chữ trắng, font hệ thống 16px, không chọn được chữ (trừ ô nhập), nền trong suốt.
- `<script>` và thuộc tính `onclick="…"` bị bỏ qua (có cảnh báo): logic viết trong component TypeScript.

## Đường dẫn và build

- URL trong `.html` / `.css` (`<img src>`, `srcset`, `<link href>`, `url(...)`, `@import`, `@font-face`…) là **tương đối với file đó** như trên web; bắt đầu bằng `/` là tính từ gốc project (`/Assets/Sprites/a.png`).
- **Build stripping**: `.html` / `.css` được scene tham chiếu được đưa vào build, và build lần theo các URL bên trong (CSS, ảnh, font…).
- **Playable ads**: chạy nguyên vẹn trong file HTML duy nhất; nút CTA gọi `Playable.openStore()`.
- Đổi tên / di chuyển file `.css` thì sửa lại `href` trong HTML (liên kết bằng đường dẫn như web); field Source Asset / Style Sheets dùng GUID nên không hỏng.

## Ví dụ: Demo2D

Scene **Platformer HTML UI**:

- `Assets/UI/HUD.html` + `HUD.css`: bộ đếm sao bind vào điểm, nảy lên khi nhặt sao (CSS animation), nút pause + menu pause modal, dòng hướng dẫn tự ẩn, `@media (orientation: portrait)`.
- `Assets/UI/EndCard.html` + `EndCard.css`: end card với nút **INSTALL NOW** gọi `Playable.openStore()`.
- `Assets/UI/Theme.css`: biến màu, nút dùng chung, `@font-face` font Inter.
- `Assets/Scripts/HtmlHud.ts`: script điều khiển (<kbd>Esc</kbd> / <kbd>P</kbd> để pause).

```bash
npm run build:game -- examples/Demo2D --target playable --set "scenes=Platformer HTML UI"
```

## Giới hạn

- Không có UI Builder trực quan (sửa HTML / CSS bằng code editor, xem kết quả ngay trong Game view).
- Không chạy `<script>`; không có template của UXML (`<ui:Instance>`) — dùng `<template>` + `cloneNode` trong script nếu cần.
- Binding chỉ đọc đường dẫn thuộc tính (không biểu thức, không vòng lặp danh sách — tạo phần tử bằng DOM API).
- Document HTML luôn nằm trên Canvas UI (Sort Order chỉ so giữa các document).
- Hot reload HTML dựng lại DOM (trạng thái ô nhập, vị trí cuộn bị reset); chỉ sửa CSS thì DOM giữ nguyên.
