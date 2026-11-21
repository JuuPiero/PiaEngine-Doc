---
title: PiaAnimancer (Animancer API)
description: Package com.pia.animancer — phát animation từ script không cần Animator Controller: cross-fade, layer + avatar mask, state, event, transition, mixer. Clip sprite 2D và clip model 3D.
---

# PiaAnimancer — API Animancer cho PiaEngine (`com.pia.animancer`)

Phát animation **trực tiếp từ script**, không cần dựng Animator Controller: cross-fade giữa các clip, nhiều layer với avatar mask, state có thời gian / tốc độ / trọng số, event theo thời điểm, transition chỉnh trong Inspector và mixer trộn clip theo tham số. API đặt tên theo **Animancer** (v7) của Unity nên script dùng Animancer port sang gần như dòng-đối-dòng.

> **Bản quyền.** PiaAnimancer là bản cài đặt **độc lập**, viết lại từ đầu cho PiaEngine; nó chỉ giữ tên / chữ ký API công khai để dễ port. Package không chứa mã nguồn, tài liệu hay ví dụ của Animancer và **không liên quan / không được Kybernetik bảo trợ**. "Animancer" là sản phẩm của Kybernetik.

Tên API theo kiểu PiaEngine: class giữ tên gốc (`AnimancerComponent`, `ClipTransition`, `LinearMixerState`…), member viết camelCase (`Play` → `play`, `Layers` → `layers`, `Events.OnEnd` → `events.onEnd`, `StartFade` → `startFade`).

## Cài đặt

```bash
cd MyGame
npm install ../path/to/PiaEngine/pia-packages/com.pia.animancer
```

Build chỉ đóng gói package khi scene có component của nó hoặc script `import` từ `'com.pia.animancer'` (~42 KB minified, ~12 KB gzip).

## Bắt đầu nhanh

1. Chọn nhân vật → **Add Component → Animation → Animancer → Animancer Component**.
   - Nhân vật **2D sprite**: không cần Animator.
   - **Model 3D**: giữ Animator mà model tự có (tắt *Play Automatically* của nó cho gọn) — Animancer dùng Animator để biết object / skeleton cần animate, kể cả model *Optimize Game Objects*.
2. Viết script:

```ts
import { Input, MonoBehaviour, field } from '@pia/core';
import { AnimancerComponent, ClipTransition } from 'com.pia.animancer';

export class Player extends MonoBehaviour {
  @field(AnimancerComponent) animancer: AnimancerComponent | null = null;
  @field({ type: 'asset', assetType: 'animation' }) idle = '';
  @field({ type: 'asset', assetType: 'animation' }) run = '';
  @field(ClipTransition) attack = new ClipTransition();

  private attacking = false;
  private readonly onAttackEnd = () => { this.attacking = false; };

  update() {
    const a = this.animancer!;
    if (this.attacking) return;
    if (Input.getKeyDown('J')) {
      this.attacking = true;
      const state = a.play(this.attack);          // fade, speed, event của transition
      state.events.onEnd = this.onAttackEnd;      // gọi khi hết clip
      return;
    }
    const moving = Input.getAxisRaw('Horizontal') !== 0;
    a.play(moving ? this.run : this.idle, 0.25);  // cross-fade 0,25 s
  }
}
```

Clip là **chuỗi tham chiếu** như mọi field asset của PiaEngine: GUID / đường dẫn file `.anim.json`, hoặc clip của model `"<modelGuid>#clip:Run"`. Kéo clip vào field trong Inspector là xong.

## Phát và cross-fade

```ts
animancer.play(clip);                      // ngay lập tức, các state khác dừng
animancer.play(clip, 0.25);                // cross-fade 0,25 s
animancer.play(clip, 0.25, FadeMode.FromStart);
animancer.tryPlay('Run');                  // theo key; null nếu không có
animancer.stop();                          // dừng hết (hoặc stop(clip))
animancer.isPlaying(clip);
```

| FadeMode | Ý nghĩa |
|---|---|
| `FixedSpeed` (mặc định) | mọi state fade với tốc độ `1 / fadeDuration` — state đang fade dở sẽ xong sớm hơn |
| `FixedDuration` | mỗi state mất đúng `fadeDuration` giây |
| `FromStart` | như FixedDuration và chạy lại từ đầu; nếu state đang hiện, một bản sao fade out tiếp từ chỗ cũ |
| `NormalizedSpeed` / `NormalizedDuration` / `NormalizedFromStart` | như trên, `fadeDuration` tính theo tỉ lệ độ dài clip |

Những quy tắc giống Animancer:

- `play(clip)` khi clip **đang phát** thì tiếp tục, không chạy lại. Muốn chạy lại: `FadeMode.FromStart` hoặc `state.time = 0`.
- State fade out về 0 thì tự dừng và tua về đầu.
- Animancer cập nhật **sau `update()` của mọi script** (giống animation của Unity), nên lệnh `play` trong `update()` có hiệu lực ngay frame đó.

## State

`play` trả về `AnimancerState` (clip → `ClipState`):

```ts
const s = animancer.play(run, 0.2);
s.speed = 1.5;            // âm = chạy ngược
s.normalizedTime = 0.5;   // nhảy tới giữa clip (không kích hoạt event ở giữa)
s.time; s.length; s.weight; s.targetWeight; s.isPlaying; s.isLooping; s.duration; s.remainingDuration;
s.startFade(0, 0.3);
animancer.states.tryGet(run);   // state đã tạo cho clip
animancer.states.current;       // state phát sau cùng trên layer 0
```

## Event

```ts
const s = animancer.play(attack);
s.events.add(0.4, () => this.dealDamage());     // tại 40 % clip (mỗi vòng nếu clip lặp)
s.events.onEnd = () => animancer.play(idle, 0.25);
s.events.normalizedEndTime = 0.8;               // End Event sớm hơn
```

- Event của một state **bị xoá mỗi lần state được play** (`AnimancerState.automaticallyClearEvents`) — đăng ký *sau* `play`.
- **End Event được gọi mỗi frame** sau khi qua thời điểm kết thúc (tới khi bạn play cái khác): callback phải chịu được việc gọi lặp, ví dụ chỉ `startFade` khi `layer.targetWeight > 0`.
- `+=` / `-=` của C#: `events.addOnEnd(cb)` / `events.removeOnEnd(cb)`; event có tên: `setCallback('Hit', cb)`, `addCallback`, `removeCallback`.
- Trong callback: `AnimancerEvent.current`, `AnimancerEvent.currentState`.
- **Animation Event của clip** (`events` trong `.anim.json`, cửa sổ Animation) vẫn được gửi bằng `sendMessage` tới object, như khi dùng Animator.

## Layer và Avatar Mask

```ts
const upper = animancer.layers[1];             // tự tạo layer 1
upper.setMask(this.upperBodyMask);             // AvatarMask asset (hoặc ['Torso'])
upper.play(shoot, 0.1);                        // layer đang ở weight 0 tự fade in
upper.startFade(0, 0.25);                      // tắt dần layer
upper.isAdditive = true;                       // cộng thay vì đè
```

- Layer trên **đè** (hoặc cộng) lên layer dưới, chỉ trên các transform trong mask.
- **Avatar Mask**: **Project → Create → Animancer → Avatar Mask** — danh sách đường dẫn transform tính từ object được animate (`Torso/ArmR` gồm cả con của nó). Inspector có cây checkbox lấy từ nhân vật vừa chọn.
- Play trên layer đang fade out sẽ kéo layer sáng lên lại.

## Transition

Transition gói clip + cách phát, chỉnh ngay trong Inspector:

```ts
@field(ClipTransition) attack = new ClipTransition();
start() {
  this.attack.events.setCallback('Hit', () => this.dealDamage());   // event tên "Hit" đặt trong Inspector
}
```

Field **ClipTransition** có: Clip, Fade Duration, Speed, Start Time (bật = chạy lại từ thời điểm đó mỗi lần play, tức `FromStart`), End Time, danh sách Events (thời điểm + tên + callback Inspector), On End. Dưới field là **thanh thời gian** (start, event — kéo để chỉnh —, end, vùng fade) và nút **▶ Preview**.

Có thêm `LinearMixerTransition`, `MixerTransition2D` (Cartesian / Directional) và bản asset dùng chung giữa nhiều nhân vật: **Create → Animancer → Clip Transition / Linear Mixer Transition / Mixer Transition 2D** (`@field(ClipTransitionAsset)`). Lưu ý callback gán vào event của asset là dùng chung.

## Mixer

```ts
const move = new LinearMixerState().initialize([idle, walk, run], [0, 2, 6]);
animancer.play(move, 0.25);
// mỗi frame:
move.parameter = velocity.magnitude;      // > 6 → chạy nhanh hơn (extrapolateSpeed)
```

- `CartesianMixerState` / `DirectionalMixerState`: tham số 2D (`setParameter(x, y)`, `parameterX`, `parameterY`).
- `ManualMixerState`: tự đặt `getChild(i).weight` hoặc `startFade` từng clip con.
- Clip con mặc định chạy **đồng bộ** (cùng normalized time — bước chân khớp khi trộn đi bộ / chạy); trọng số dùng cùng công thức với blend tree của Animator Controller.

## Named & Hybrid

- **Named Animancer Component**: thêm danh sách *Animations*; `play('Run')` theo tên clip; *Play Automatically* phát clip đầu tiên khi bật.
- **Hybrid Animancer Component**: field *Controller* (Animator Controller) chạy như một state: `playController(0.25)`, `setFloat / setBool / setInteger / setTrigger`, cross-fade từ controller sang clip rồi quay lại. Chỉ layer đầu tiên của controller được dùng.

## Sprite 2D

Clip `.anim.json` có **curve tham chiếu**: đổi `SpriteRenderer.sprite` theo từng frame (key nhảy bậc). Cách tạo nhanh: chọn texture đã cắt (Sprite Mode: Multiple) trong Project → **Assets → Create → Animancer → Sprite Animation (from selected sprites)** (12 fps, lặp). Trong code: `createSpriteClip(name, sprites, fps)` của `@pia/core`.

- Sprite không trộn được: khi cross-fade, **clip mạnh nhất** thắng (đổi sprite ở giữa lúc fade); layer trên có weight > 0 thì đè.
- Nhân vật ghép nhiều phần (hai SpriteRenderer con `Legs` / `Torso`) dùng được layer thân trên thật sự: bắn trên layer mask `Torso` trong khi chân vẫn chạy.
- Curve này cũng chạy với **Animator** (Clips và Animator Controller).

## Inspector và xem trước

- **Play Mode**: Inspector của Animancer Component hiện từng layer (weight, mask), từng state (weight — vạch cam là đích của fade —, thời gian, marker event, tốc độ) và nút ▶ để phát state đó.
- **Edit Mode**: phần **Preview** chọn clip rồi ▶ (đổi clip sẽ cross-fade), ⏸, thanh kéo thời gian, ⏹ trả scene về nguyên trạng. Scene không bị đánh dấu thay đổi, event không chạy; preview tự dừng trước khi Save / Undo / Play.

## Cập nhật

| Update Mode | Khi nào |
|---|---|
| Normal | mỗi frame sau Update |
| AnimatePhysics | trong bước vật lý (FixedUpdate) |
| UnscaledTime | bỏ qua `Time.timeScale` |
| Manual | chỉ khi gọi `animancer.evaluate(deltaTime)` |

`animancer.playable.speed`, `pauseGraph()` / `unpauseGraph()`; *Action On Disable*: Stop / Pause / Continue / Reset / Destroy.

## Hiệu năng

- Không cấp phát bộ nhớ mỗi frame (100 nhân vật cross-fade + layer mask + mixer + sprite: ~0 B/frame).
- 100 nhân vật (10 xương × 3 curve): Animancer ≈ 0,40 ms/frame, Animator Controller ≈ 0,39 ms, Animator (clips) ≈ 0,47 ms.

## Port từ Animancer (C#)

| C# | TypeScript |
|---|---|
| `[SerializeField] AnimancerComponent _Animancer;` | `@field(AnimancerComponent) animancer: AnimancerComponent \| null = null;` |
| `[SerializeField] AnimationClip _Run;` | `@field({ type: 'asset', assetType: 'animation' }) run = '';` |
| `_Animancer.Play(_Run, 0.25f);` | `this.animancer.play(this.run, 0.25);` |
| `_Animancer.Layers[1].Play(clip, fade)` | `this.animancer.layers[1].play(clip, fade)` |
| `Layers[1].SetMask(mask)` / `.StartFade(0, d)` | `layers[1].setMask(mask)` / `.startFade(0, d)` |
| `state.Speed = 2;` | `state.speed = 2;` |
| `state.Events.OnEnd += OnEnd;` / `-= OnEnd` | `state.events.addOnEnd(this.onEnd)` / `removeOnEnd(this.onEnd)` |
| `state.Events.OnEnd = OnEnd;` | `state.events.onEnd = this.onEnd;` |
| `_Transition.Events.SetCallback("Hit", OnHit);` | `this.transition.events.setCallback('Hit', () => this.onHit());` |
| `[SerializeField] ClipTransition _Attack;` | `@field(ClipTransition) attack = new ClipTransition();` |
| `[SerializeField] AvatarMask _Mask;` | `@field(AvatarMask) mask: AvatarMask \| null = null;` |
| `_Animancer.States.TryGet(key, out var s)` | `const s = this.animancer.states.tryGet(key);` |
| `_Animancer.Playable.PauseGraph();` | `this.animancer.playable.pauseGraph();` |

Mẹo: lưu callback vào field (arrow function) thay vì tạo `() => …` mới mỗi lần play.

## Chưa hỗ trợ

- Root motion (Animator của PiaEngine chưa có).
- Phần humanoid của Avatar Mask (chỉ có đường dẫn transform; không đọc file `.mask` của Unity).
- Baked Animation (GPU) của Animator khi Animancer điều khiển — pose tính trên CPU.
- HybridAnimancerComponent chỉ dùng layer đầu của controller.
- Animancer FSM, DirectionalAnimationSet, Timeline, IK, Custom Fade, transition asset UnShared.

## Ví dụ

- **Demo2D** `Assets/Samples/AnimancerPlatformer`: nhân vật sprite hai phần — idle / run / jump / fall trên layer 0, chém bằng `ClipTransitionAsset` + event "Hit" + End Event, bắn trên layer thân trên có mask, bị thương trên layer Override, bụi chân từ Animation Event, đồng xu dùng NamedAnimancerComponent. Phím: ← → · Space · J · K · H (để yên 2 giây sẽ tự chạy demo).
- **Demo3D** `Assets/Samples/AnimancerRobots`: model Robot — layer mask cánh tay phải, LinearMixerState, ClipTransition + FromStart + End Event.
