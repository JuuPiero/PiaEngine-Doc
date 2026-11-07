---
title: Playable Ads
description: Package com.pia.playable — xuất game thành playable ads một file HTML cho từng mạng quảng cáo.
---

# Playable Ads (`com.pia.playable`)

Build game thành **playable ads**: mỗi mạng quảng cáo một file HTML duy nhất (hoặc zip theo yêu cầu của mạng), không cần internet để tải asset. Hỗ trợ AppLovin, Unity Ads, ironSource, Mintegral, Facebook, Google Ads, TikTok / Pangle, Moloco, Liftoff, Vungle, Snapchat, Kwai, Bigo…

## Cài

```bash
cd MyGame
npm install ../PiaEngine/pia-packages/com.pia.playable     # hoặc Package Manager → Add package from disk
```

Sau khi cài, **File → Build Settings** có thêm platform **Playable Ads**. Demo2D đã cài sẵn.

## Dùng trong game

```ts
import { Playable } from 'com.pia.playable';

Playable.openStore();   // nút Install / CTA — gọi đúng API của từng mạng
Playable.gameEnd();     // hết màn chơi (Mintegral, ironSource, Vungle, Bigo... được báo)
Playable.gameRetry();   // chơi lại (Mintegral)

Playable.channel;         // 'AppLovin' | 'Unity' | ... | 'None' (ngoài bản playable)
Playable.audioEnabled;    // mạng tắt tiếng → engine tự mute
Playable.isPaused;        // quảng cáo bị ẩn → engine tự pause (timeScale 0 + dừng audio)
Playable.hideCtaButton;   // mạng tự vẽ nút cài đặt → ẩn nút của bạn
Playable.onAudioChanged((on) => { /* ... */ });
```

Ví dụ Demo2D — báo hết màn khi nhặt đủ sao:

```ts Assets/Scripts/ScoreKeeper.ts
add(points: number) {
  this._score += points;
  this.refresh();
  if (this._score >= this._total) {
    Debug.log('All stars collected!');
    // playable ads: tell the network the level is over (end card / install prompt)
    Playable.gameEnd();
  }
}
```

### Không cần code

Thêm component **PlayableActions** vào nút, rồi trong **Button → On Click** chọn `PlayableActions.openStore` (hoặc `gameEnd`, `openStoreAndEnd`, `gameRetry`). Menu **Tools → Playable Ads → Add CTA Actions To Selection** thêm nhanh component này. PlayableActions có hai tuỳ chọn: **Hide If Network Shows Cta** và **Game End On Enable**.

## `openStore()` theo từng mạng

| Mạng | Gọi | Game bắt đầu khi | Xuất |
|---|---|---|---|
| AppLovin | `mraid.open(url)` | MRAID ready + quảng cáo hiển thị | .html |
| Unity Ads | `mraid.open(url Android/iOS)` | MRAID ready + hiển thị | .html |
| ironSource (DAPI) | `dapi.openStoreUrl()` | DAPI ready + hiển thị | .html |
| ironSource (MRAID) | `mraid.open(url)` | MRAID ready | .html |
| Mintegral | `window.install()` | gọi `gameReady()`, chờ mạng gọi `gameStart()` | .zip |
| Facebook | `FbPlayableAd.onCTAClick()` | ngay | .zip |
| Moloco | `FbPlayableAd.onCTAClick()` | ngay | .html |
| Google Ads | `ExitApi.exit()` | ngay | .zip |
| TikTok / Pangle | `openAppStore()` | ngay | .zip + config.json |
| Liftoff, InMobi, Chartboost, Nefta | `mraid.open(url)` | MRAID ready (+ hiển thị) | .html |
| Vungle | `parent.postMessage('download')` | ngay | .zip |
| Snapchat | `ScPlayableAd.onCTAClick()` | ngay | .zip + config.json |
| Kwai | `ks_playable_openAppStore()` | `ks_playable_startPlay()` | .zip + config.json |
| Bigo | `BGY_MRAID.open()` | ngay | .zip + config.json |
| Tencent GDT, Yandex, NewsBreak, Rubeex | API mở store của mạng | ngay | .html / .zip |

Không có SDK (mở file trên máy) → chạy ở chế độ preview, `openStore()` mở URL store (Android → Google Play, còn lại → App Store).

## Build

**Build Settings → Playable Ads**: chọn mạng, URL App Store / Google Play, Scenes (để trống = scene trong Build Settings; playable thường chỉ 1 scene), Output Name, Orientation, Compress, Encoding, Preview.html. Hoặc dòng lệnh:

```bash
npm run build:game -- ../MyGame --target playable
npm run build:game -- ../MyGame --target playable --set channels=AppLovin,Unity --set scenes=Level1
```

Kết quả ở `Build/playable/<Output Name>/`: `<Tên>_AppLovin.html`, `<Tên>_Mintegral.zip`… và `<Tên>_Preview.html` (không SDK, mở bằng **Build And Run**; dùng encoding của mạng đầu tiên trong danh sách). Mỗi file được so với giới hạn dung lượng của mạng (thường 5 MB) và cảnh báo khi vượt; báo cáo build ghi encoding của từng file.

### Encoding

Dữ liệu nén được ghi vào HTML dưới dạng text. Option **Encoding** chọn cách ghi:

| Encoding | Tăng so với dữ liệu nén | Ký tự | Dùng khi |
|---|---|---|---|
| **base64** | +33 % | ASCII | mạng nào cũng nhận |
| **base85** | +25 % (file nhỏ hơn base64 ~6 %) | ASCII | an toàn như base64 ở mọi mạng |
| **base122** | +14 % (file nhỏ hơn base64 ~14 %) | UTF-8 | mạng đọc file đúng UTF-8 |

- **Auto** (mặc định): **AppLovin → base122** (hướng dẫn creative của AppLovin cho phép "base64 or base122"), **mọi mạng khác → base64** vì chưa có tài liệu xác nhận họ nhận HTML có ký tự ngoài ASCII. File **.zip** luôn base64 ở Auto: zip nén lại phần text nên encoding dày hơn không làm zip nhỏ đi.
- **Encoding Per Network** đổi riêng từng mạng, ví dụ `Unity=base122, Moloco=base85` (`Preview=base85` đổi Preview.html). Hãy thử file trong công cụ preview của mạng trước khi dùng base122 cho mạng đó.
- File base122 bắt đầu bằng BOM UTF-8 và `<meta charset="utf-8">`, nên trình duyệt vẫn đọc đúng khi server gửi sai charset.

Option lưu trong `pia.project.json`:

```json pia.project.json
"build": {
  "targets": {
    "playable": {
      "channels": ["AppLovin"],
      "iosUrl": "https://apps.apple.com/app/id0000000000",
      "androidUrl": "https://play.google.com/store/apps/details?id=com.pia.demo2d",
      "scenes": "Platformer",
      "outputName": "PiaPlatformer",
      "orientation": "landscape"
    }
  },
  "target": "playable"
}
```

## Bên trong file HTML

1. Game build thành **một** script (`game.js`, mọi dynamic import được gộp), vẫn áp dụng build stripping.
2. `game.js` + asset được gói thành **một khối**: file nén được → một luồng DEFLATE chung (mức 9); file đã nén sẵn (PNG / WebP / OGG / MP3…) giữ nguyên; file trùng nội dung chỉ lưu một lần. Chuỗi base64 lớn trong `game.js` (WASM của Rapier, asset nhúng data URL) được tách thành nhị phân trước khi nén — nhị phân nén tốt hơn base64 ~25 %.
3. Khối được ghi thành text theo **Encoding**, chia thành nhiều thẻ `<script>`. Tắt **Compress** → không nén.
4. Loader (~10 KB) giải mã, giải nén bằng `DecompressionStream` của trình duyệt (dự phòng: fflate), rồi phục vụ file cho engine mà không cần mạng.
5. Adapter của mạng quyết định khi nào game được chạy (MRAID ready, quảng cáo hiển thị, `gameStart` của Mintegral…).

Ví dụ: Demo2D (PixiJS + Rapier 2D, 4.25 MB) → HTML **1.66 MB** base64 / **1.56 MB** base85 / **1.43 MB** base122 (bản cũ dùng JSZip: 2.18 MB). Giải nén ~30–60 ms trên máy bàn.

::: tip Giảm dung lượng
- Chỉ để scene cần thiết.
- Tránh vật lý nếu không cần (Rapier 2D ~3.3 MB, 3D ~4.2 MB trước khi nén).
- Nén ảnh / audio trước khi đưa vào `Assets/`.
- Dùng shader `Mobile/*` cho 3D.
:::
