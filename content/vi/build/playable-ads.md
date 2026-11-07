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

**Build Settings → Playable Ads**: chọn mạng, URL App Store / Google Play, Scenes (để trống = scene trong Build Settings; playable thường chỉ 1 scene), Output Name, Orientation, Compress, Preview.html. Hoặc dòng lệnh:

```bash
npm run build:game -- ../MyGame --target playable
npm run build:game -- ../MyGame --target playable --set channels=AppLovin,Unity --set scenes=Level1
```

Kết quả ở `Build/playable/<Output Name>/`: `<Tên>_AppLovin.html`, `<Tên>_Mintegral.zip`… và `<Tên>_Preview.html` (không SDK, mở bằng **Build And Run**). Mỗi file được so với giới hạn dung lượng của mạng (thường 5 MB) và cảnh báo khi vượt.

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
2. `game.js` + asset được **nén bằng JSZip** rồi **base64**, chia thành nhiều thẻ `<script>`. Tắt **Compress** → asset base64 trực tiếp, không kèm JSZip.
3. Loader giải nén rồi phục vụ file cho engine mà không cần mạng.
4. Adapter của mạng quyết định khi nào game được chạy (MRAID ready, quảng cáo hiển thị, `gameStart` của Mintegral…).

Ví dụ: Demo2D (PixiJS + Rapier 2D) 4.01 MB → HTML ~2.1 MB.

::: tip Giảm dung lượng
- Chỉ để scene cần thiết.
- Tránh vật lý nếu không cần (Rapier 2D ~3.3 MB, 3D ~4.2 MB trước khi nén).
- Nén ảnh / audio trước khi đưa vào `Assets/`.
- Dùng shader `Mobile/*` cho 3D.
:::
