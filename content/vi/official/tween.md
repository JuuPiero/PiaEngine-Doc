---
title: PiaTween (DOTween)
description: Package com.pia.tween — tween, Sequence, ease, shortcut doMove / doFade / doText, punch / shake / path, component DOTween Animation / Path có xem trước trong Edit Mode.
---

# PiaTween — DOTween cho PiaEngine (`com.pia.tween`)

Thư viện tween cho PiaEngine, port từ **DOTween + DOTween Pro** của Unity: tween mọi giá trị, Sequence, đủ bộ ease (Back / Elastic / Bounce / Flash / AnimationCurve), loop Restart / Yoyo / Incremental, punch / shake / jump / path, shortcut ngay trên class của engine (`transform.doMove`, `spriteRenderer.doFade`, `text.doText`…), và các component kiểu DOTween Pro (**DOTween Animation**, **DOTween Path**, **DOTween Visual Manager**) có **xem trước trong Edit Mode**. Chạy trong scene 2D lẫn 3D, trong editor, bản web và Playable Ads.

Tên API theo kiểu của PiaEngine: class giữ tên Unity (`DOTween`, `Sequence`, `Ease`…), method viết camelCase (`DOMove` → `doMove`, `SetEase` → `setEase`, `OnComplete` → `onComplete`, `DOTween.KillAll` → `DOTween.killAll`).

## Cài đặt

```bash
cd MyGame
npm install ../path/to/PiaEngine/pia-packages/com.pia.tween
```

Hoặc **Window → Package Manager → + → Add package from disk**.

> **Quan trọng khi build:** build chỉ đóng gói package nào được script `import` (hoặc có component dùng trong scene). Script chỉ gọi shortcut (`this.transform.doMove(...)`) thì vẫn phải import ít nhất một thứ từ `'com.pia.tween'` (ví dụ `import { Ease } from 'com.pia.tween'`) — việc import đó cũng cài shortcut và khai báo type cho chúng.

## Bắt đầu nhanh

```ts
import { MonoBehaviour, Vector3, Color } from '@pia/core';
import { DOTween, Ease, LoopType } from 'com.pia.tween';

export class Demo extends MonoBehaviour {
  async start() {
    // shortcut: tween + chuỗi setting
    this.transform.doMove(new Vector3(0, 2, 0), 1).setRelative().setEase(Ease.OutBack).setLoops(-1, LoopType.Yoyo);

    // tween bất kỳ giá trị nào qua getter / setter
    DOTween.to(() => this.score, (v) => (this.score = v), 100, 2).onUpdate(() => this.refresh());

    // Sequence
    DOTween.sequence()
      .append(this.transform.doScale(1.2, 0.2))
      .append(this.transform.doScale(1, 0.2))
      .appendInterval(0.5)
      .appendCallback(() => this.print('xong'));

    // chờ tween xong (Promise) — hoặc trong coroutine: yield tween.waitForCompletion()
    await this.getComponent(SpriteRenderer)!.doColor(Color.red, 0.5).asyncWaitForCompletion();
  }
  score = 0;
  refresh() {}
}
```

## Bảng API: DOTween ↔ PiaTween

### DOTween (static)

| DOTween (Unity) | PiaTween |
|---|---|
| `DOTween.Init(recycle, safeMode, logBehaviour)` | `DOTween.init(recycle?, safeMode?, logBehaviour?)` (không bắt buộc) |
| `DOTween.SetTweensCapacity(t, s)` | `DOTween.setTweensCapacity(t, s)` |
| `DOTween.To(getter, setter, end, d)` | `DOTween.to(getter, setter, end, d)` — number, Vector2/3, `{x y z w}`, Color, Quaternion (slerp), string |
| `DOTween.ToAlpha / ToArray` | `DOTween.toAlpha` / `DOTween.toArray` |
| `DOTween.Sequence()` | `DOTween.sequence(target?)` |
| `DOTween.Kill(targetOrId, complete)` / `KillAll` | `DOTween.kill(targetOrId?, complete?)` / `DOTween.killAll(complete?, ...trừ)` |
| `Play / Pause / TogglePause / Restart / Rewind / Complete / Goto / Flip / PlayForward / PlayBackwards` (+ `...All`) | cùng tên camelCase, theo target / id (bỏ trống = tất cả) |
| `IsTweening`, `TotalActiveTweens`, `TotalPlayingTweens`, `PlayingTweens`, `PausedTweens`, `TweensById`, `TweensByTarget` | `isTweening`, `totalActiveTweens()`, `totalPlayingTweens()`, `playingTweens()`, `pausedTweens()`, `tweensById`, `tweensByTarget` |
| `DOTween.ManualUpdate(dt, udt)` | `DOTween.manualUpdate(dt, udt)` (tween `setUpdate(UpdateType.Manual)`) |
| `timeScale`, `unscaledTimeScale`, `useSafeMode`, `defaultAutoKill`, `defaultAutoPlay`, `defaultEaseType`, `defaultEaseOvershootOrAmplitude`, `defaultEasePeriod`, `defaultLoopType`, `defaultRecyclable`, `defaultUpdateType`, `defaultTimeScaleIndependent`, `logBehaviour` | cùng tên (static property) |
| `DOTween.Clear(destroy)` | `DOTween.clear(destroy?)` |
| `DOVirtual.Float / Int / Vector3 / Color / DelayedCall / EasedValue` | `DOVirtual.float / int / vector3 / color / delayedCall / easedValue` |

### Setting (chuỗi) của Tween / Tweener / Sequence

| DOTween | PiaTween |
|---|---|
| `SetEase(Ease, overshoot, period)` / `SetEase(AnimationCurve)` / `SetEase(EaseFunction)` | `setEase(Ease.OutBack, 2)` / `setEase(curve)` / `setEase((t) => …)` |
| `SetLoops(n, LoopType)` | `setLoops(n, LoopType.Yoyo)` (`-1` = vô hạn; Restart / Yoyo / Incremental) |
| `SetDelay`, `SetRelative`, `SetSpeedBased`, `SetId`, `SetTarget`, `SetAutoKill`, `SetRecyclable`, `SetLink(go)` | `setDelay`, `setRelative`, `setSpeedBased`, `setId`, `setTarget`, `setAutoKill`, `setRecyclable`, `setLink(go)` |
| `SetUpdate(UpdateType, isIndependentUpdate)` / `SetUpdate(true)` | `setUpdate(UpdateType.Late, true)` / `setUpdate(true)` (bỏ qua `Time.timeScale`) — Normal / Late / Fixed / Manual |
| `From()` / `From(isRelative)` | `from()` / `from(true)` (đặt giá trị "from" ngay lập tức) |
| `SetOptions(snapping)` / `SetOptions(AxisConstraint, snapping)` / `SetOptions(richText, ScrambleMode, chars)` / `SetOptions(closePath, lockPos, lockRot)` | `setOptions(...)` cùng ý nghĩa theo loại tween |
| `SetLookAt(lookAhead / position / transform)` (path) | `setLookAt(0.01)` / `setLookAt(new Vector3(...))` / `setLookAt(transform)` |
| `ChangeStartValue / ChangeEndValue / ChangeValues` | `changeStartValue / changeEndValue / changeValues` |
| `OnStart / OnPlay / OnPause / OnRewind / OnUpdate / OnStepComplete / OnComplete / OnKill / OnWaypointChange` | `onStart / onPlay / onPause / onRewind / onUpdate / onStepComplete / onComplete / onKill / onWaypointChange` |

### Điều khiển & thông tin

| DOTween | PiaTween |
|---|---|
| `Play / Pause / TogglePause / Restart / Rewind / Complete(withCallbacks) / Kill(complete) / Goto(t, andPlay) / Flip / PlayForward / PlayBackwards / ForceInit` | cùng tên camelCase trên tween |
| `IsActive / IsPlaying / IsComplete / IsBackwards / IsInitialized` | `isActive() / isPlaying() / isComplete() / isBackwards() / isInitialized()` |
| `Elapsed / Duration / ElapsedPercentage / ElapsedDirectionalPercentage / CompletedLoops / Loops / Delay / ElapsedDelay` | `elapsed() / duration() / elapsedPercentage() / elapsedDirectionalPercentage() / completedLoops() / loops() / delay() / elapsedDelay()` |
| `AsyncWaitForCompletion / Kill / Rewind / Start / ElapsedLoops / Position` | `asyncWaitForCompletion()` … (Promise) |
| `yield return t.WaitForCompletion()` | `yield t.waitForCompletion()` trong coroutine (cũng có `waitForKill / waitForRewind / waitForStart / waitForElapsedLoops / waitForPosition`) |
| `PathLength / PathGetPoint` | `pathLength() / pathGetPoint(perc)` |

### Sequence

`append`, `join`, `insert(time, t)`, `prepend`, `appendInterval`, `prependInterval`, `appendCallback`, `prependCallback`, `joinCallback`, `insertCallback` — giống hệt DOTween (tween đã cho vào Sequence thì do Sequence điều khiển; Sequence mặc định ease **Linear**).

### Shortcut

| Đối tượng | Shortcut |
|---|---|
| `Transform` | `doMove / doMoveX/Y/Z`, `doLocalMove / doLocalMoveX/Y/Z`, `doRotate(euler, d, RotateMode)`, `doLocalRotate`, `doRotateQuaternion`, `doLocalRotateQuaternion`, `doLookAt(pos, d, AxisConstraint, up)`, `doScale(v hoặc số) / doScaleX/Y/Z`, `doJump / doLocalJump`, `doPunchPosition / Rotation / Scale`, `doShakePosition / Rotation / Scale`, `doPath / doLocalPath`, `doSpline` (com.pia.spline), `doBlendableMoveBy / LocalMoveBy / RotateBy / LocalRotateBy / ScaleBy`, `doFadeGroup` |
| `RectTransform` | `doAnchorPos / X / Y`, `doSizeDelta`, `doPivot`, `doAnchorMin / Max`, `doPunchAnchorPos`, `doShakeAnchorPos`, `doJumpAnchorPos` |
| `SpriteRenderer` | `doColor`, `doFade`, `doBlendableColor` |
| `Image` | `doColor`, `doFade`, `doBlendableColor`, `doFillAmount` (Image có `fillAmount`) |
| `Text` / `TextRenderer` | `doColor`, `doFade`, `doText(text, d, richText, ScrambleMode, chars)`, `doCounter(from, to, d)` |
| `Material` | `doColor(c, [prop], d)`, `doFade`, `doFloat(v, prop, d)`, `doOffset`, `doTiling`, `doVector` |
| `Camera` | `doOrthoSize`, `doFieldOfView`, `doNearClipPlane`, `doFarClipPlane`, `doColor` (background), `doShakePosition`, `doShakeRotation` |
| `AudioSource` | `doFade` (volume), `doPitch` |
| `Light` | `doColor`, `doIntensity` |
| `Rigidbody` / `Rigidbody2D` | `doMove / X / Y / Z` (movePosition), `doRotate` (moveRotation), `doJump` — nên kèm `setUpdate(UpdateType.Fixed)` |
| `GameObject` | `doFadeGroup(alpha, d)` — mờ cả cây Image / Text / SpriteRenderer / TextRenderer (thay cho CanvasGroup.DOFade) |
| Mọi component, `Material` | `doKill`, `doComplete`, `doPause`, `doPlay`, `doRestart`, `doRewind`, `doTogglePause`, `doGoto`, `doFlip`, `doPlayForward`, `doPlayBackwards` — tác động lên các tween có target là object đó |

Target của shortcut là chính component (`transform.doMove` → target = `transform`), nên `transform.doKill()` / `DOTween.kill(transform)` dừng đúng các tween đó.

## Component kiểu DOTween Pro

### DOTween Animation

**Add Component → PiaTween → DOTween Animation.** Chọn **Animation Type** (Move, LocalMove, Rotate, LocalRotate, Scale, Color, Fade, FadeGroup, Text, FillAmount, AnchorPos, UIWidthHeight, Punch*, Shake*, Jump, CameraOrthoSize, CameraFieldOfView, CameraBackgroundColor, AudioVolume), target (chính object hoặc object khác), giá trị đích, Duration, Delay, Ease (hoặc **INTERNAL_Custom** + Ease Curve), Loops, Id, Auto Play, Auto Kill, Relative / From, và các event **On Start / On Play / On Update / On Step Complete / On Complete / On Rewind** (PiaEvent như `Button.onClick`). Inspector chỉ hiện các field hợp với loại animation đang chọn.

- **Xem trước:** nút **▶ Preview** / **⏹ Stop** đầu Inspector chạy tween ngay trong Edit Mode; khi dừng (hoặc khi Save, Undo, bấm Play) mọi thứ tween đã đổi được trả lại như cũ — scene không bị đánh dấu sửa. Đồ thị nhỏ bên cạnh là đường ease, chấm cam là vị trí hiện tại.
- Trong Play Mode: các nút Restart / Pause / Backwards.
- Gọi từ event (vd. Button.onClick): `doPlay`, `doPlayBackwards`, `doPlayForward`, `doPause`, `doTogglePause`, `doRewind`, `doRestart`, `doComplete`, `doKill`, `doPlayById(id)`, `doRestartById(id)`, `doPlayAllById(id)`…, `recreateTween()`.
- Từ code: `getComponent(DOTweenAnimation)!.tween` là tween đã tạo.

### DOTween Path

**Add Component → PiaTween → DOTween Path** (hoặc **GameObject → PiaTween → DOTween Path**). Waypoint sửa thẳng trong Scene view:

| Thao tác | Cách làm |
|---|---|
| Di chuyển waypoint | kéo chấm trắng; waypoint đang chọn có mũi tên X/Y/Z |
| Thêm waypoint | **Shift + click** chỗ trống (2D: mặt XY; 3D: mặt phẳng ngang qua waypoint cuối) |
| Xoá waypoint đang chọn | **Del** / **Backspace** |
| Bỏ chọn | **Esc** |

Mỗi lần kéo / thêm / xoá là một bước Undo. Tuỳ chọn: Path Type (Linear / CatmullRom), Path Mode (Full3D / TopDown2D / Sidescroller2D), Close Path, Relative (waypoint là độ lệch so với vị trí đầu — path đi theo object), Is Local, Orient Type (None / ToPath + Look Ahead / LookAtTransform / LookAtPosition), Resolution, màu path, event **On Waypoint Change**. Cũng có ▶ Preview.

### DOTween Visual Manager

Đặt cạnh DOTween Animation / Path: khi object **bật lại** thì Play / Restart / RestartFromSpawnPoint, khi **tắt** thì Pause / Rewind / Kill / KillAndComplete / DestroyGameObject — tiện cho object pool và panel UI.

## Hành vi giống DOTween

- Tween tự chạy ở update kế tiếp (`DOTween.defaultAutoPlay`), tự kill khi xong (`setAutoKill`). Tween đã kill thì đừng dùng lại (có thể đã được tái sử dụng nếu bật recycle).
- **Safe mode** (mặc định bật): tween có target (hoặc `setLink`) bị destroy thì tự kill; tween bên trong Sequence mà target bị destroy thì bị bỏ khỏi Sequence, Sequence vẫn chạy tiếp.
- Delay chỉ áp dụng lần đầu (không lặp lại mỗi loop). Yoyo với ease OutQuad chạy ngược đúng đường cong (thời gian đảo ngược) như DOTween.
- Ease mặc định `OutQuad`, overshoot 1.70158 (dùng làm amplitude cho Elastic như DOTween), period 0 (= 0.3 × duration).
- `doText` làm tròn số ký tự như DOTween (`Math.round`), hỗ trợ rich text (thẻ `<…>` không bị cắt giữa chừng) và Scramble.
- Thoát Play Mode (hoặc bắt đầu Play) thì mọi tween bị xoá, giống DOTween trong Unity.

## Hiệu năng

- Vòng update **không cấp phát bộ nhớ**: giá trị lưu trong `Float64Array` của tween, mỗi loại thuộc tính có một plugin singleton (không closure mỗi frame), số thực truyền qua thanh ghi typed-array thay vì tham số (V8 không phải "box" số). Tween dùng lại được qua pool (`DOTween.init(true)` hoặc `setRecyclable()`).
- Benchmark Node (10 000 tween cùng lúc, máy rảnh): `doMove` vô hạn yoyo ≈ 2.3–2.9 ms/frame, `doFade` ≈ 3 ms, punch (mảng) ≈ 4.5 ms, 30 000 tween (move + scale + rotate) ≈ 12 ms, 10 000 Sequence ≈ 10 ms. Bộ máy tween tự nó cấp phát **0 byte/frame** (đo bằng plugin ghi vào typed array: 6 KB/frame = đúng mức của một frame trống); phần cấp phát còn lại khi tween Transform (~31 byte mỗi tween / frame) đến từ việc ghi số thực vào field `x / y / z` của `Vector3` trong core (field kiểu Tagged của V8).
- Tween được cập nhật từ các hook player loop của core: Normal trước Update (sau Start), Late sau LateUpdate, Fixed trước FixedUpdate (trước bước vật lý) — không có GameObject ẩn nào trong scene.
- Build chỉ chứa package khi scene dùng component của nó hoặc script import nó; không dùng thì bị bỏ hẳn (0 byte). Khi dùng: +87 KB JS (web, đã minify, chưa gzip), +32 KB trong file HTML Playable (đã nén). Package không nhắc tên class vật lý nào (shortcut Rigidbody được gắn bằng duck typing) nên không kéo theo engine vật lý.

## Mẫu (`Samples~/Scripts/TweenSamples.ts`)

Copy file vào `Assets/Scripts/` của project:

- **Popup Sequence** — popup UI: scale OutBack + fade cả cây (`doFadeGroup`) + punch, `show()` / `hide()` gọi từ Button.
- **Coin Fly** — click: xu bay toả ra rồi bay về bộ đếm, bộ đếm `doPunchScale` mỗi lần xu tới.
- **Shake Camera** — Space: rung camera (`camera.doShakePosition`).
- **Code Path Follower** — vòng Catmull-Rom khép kín, quay theo hướng đi (2D / 3D).
- **Tap Hint** — gợi ý "chạm" cho Playable Ads: tay nhấp nháy, chữ mờ dần, chạy bằng thời gian không scale.

## Giới hạn

- Không có `CanvasGroup` trong core: dùng `doFadeGroup` (nhân alpha của các Image / Text / SpriteRenderer / TextRenderer trong cây).
- `Image` của core chưa có `fillAmount`: `doFillAmount` chỉ có tác dụng với Image có field này.
- `doJump` trả về một Tweener (DOTween trả về Sequence) — cùng chuyển động, cùng tham số.
- Path: Linear và CatmullRom (chưa có CubicBezier); `lockRotation` là gần đúng; `doSpline` (com.pia.spline) cấp phát một ít mỗi frame vì gọi `evaluate` của spline.
- Shake chế độ Harmonic là gần đúng.
