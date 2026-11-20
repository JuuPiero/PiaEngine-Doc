---
title: Animator Controller
description: Animator Controller (state machine, transition, parameter, layer, blend tree, sub-state machine, StateMachineBehaviour) và cửa sổ Animator như Unity.
---

# Animator Controller

**Animator Controller** (`*.controller.json`) là state machine điều khiển [Animator](animation.md#animator) giống Unity: các **state** phát clip hoặc **blend tree**, nối với nhau bằng **transition** có điều kiện theo **parameter** (Float / Int / Bool / Trigger); nhiều **layer** chồng lên nhau. Script chỉ đặt parameter, controller tự chọn state và cross-fade.

Chạy được với clip của model 3D (kể cả [Optimize Game Objects](../assets/models.md#optimize-game-objects) và [Baked Animation](animation.md#baked-animation-gpu)) lẫn clip `.anim.json` (sprite 2D, Transform, thuộc tính component).

## Tạo và gắn

1. **Project ▸ Create ▸ Animator Controller** (hoặc chuột phải model ▸ **Create Animator Controller**: mỗi clip của model thành một state).
2. Trên object có **Animator**: kéo controller vào ô **Controller** (`runtimeAnimatorController`). Khi có Controller, các ô Clips / Default Clip / Wrap Mode bị ẩn — Animator chạy theo controller. Để trống thì Animator chạy kiểu cũ (phát clip theo tên).
3. Nút **Open Animator** (Inspector của Animator) hoặc **Window ▸ Animation ▸ Animator** mở cửa sổ Animator. Chọn controller trong Project, hoặc chọn object có Animator, thì cửa sổ hiện controller đó.

**Animator Override Controller** (`*.overrideController.json`, Create ▸ Animator Override Controller): dùng state / transition / parameter của một controller khác nhưng thay một số clip (Inspector: cột Original → Override). Gắn vào ô Controller như controller thường.

## Cửa sổ Animator

![Cửa sổ Animator trong Play Mode: Layers / Parameters bên trái, đồ thị state machine với state đang chạy (thanh tiến độ xanh), Inspector của Animator bên phải](/images/animator-window.png)

- **Bên trái**: tab **Layers** (thêm layer bằng `+`, đổi tên bằng double-click, ⚙ = Blending Override / Additive và Mask, thanh trượt Weight) và tab **Parameters** (`+` ▸ Float / Int / Bool / Trigger, double-click để đổi tên — các điều kiện và blend tree dùng tên cũ được đổi theo, ô bên phải là giá trị mặc định).
- **Breadcrumb** phía trên: layer ▸ sub-state machine ▸ … ▸ blend tree; bấm để quay lại.
- **Đồ thị**: state xám, state mặc định **cam**, **Entry** xanh lá, **Any State** xanh ngọc, **Exit** đỏ; sub-state machine hình lục giác (double-click để vào, node **(Up)** để ra). Mũi tên là transition; nhiều transition giữa cùng hai node hiện ba mũi tên.

| Thao tác | Cách làm |
|---|---|
| Tạo state | Kéo clip từ Project vào đồ thị (model: clip đầu tiên) · chuột phải ▸ Create State ▸ Empty / From Selected Clip / From New Blend Tree |
| Sub-state machine | Chuột phải ▸ Create Sub-State Machine |
| Transition | Chuột phải state (hoặc Entry / Any State / sub-state machine) ▸ **Make Transition** rồi bấm state đích. Bấm vào sub-state machine: chọn state bên trong hoặc "StateMachine (Entry)"; bấm Exit: transition ra khỏi state machine |
| State mặc định | Chuột phải ▸ Set as Layer Default State |
| Chọn | Click, Ctrl / Shift + click, kéo khung trên nền; Ctrl+A |
| Di chuyển | Kéo node (giữ Ctrl: bắt lưới) |
| Pan / zoom | Chuột giữa hoặc Alt + kéo trái / con lăn |
| Khung nhìn | `F` = các node đang chọn, `A` = tất cả |
| Copy / Paste / Duplicate / Delete | Ctrl+C / Ctrl+V / Ctrl+D / Del (transition giữa các state được copy cùng được giữ) |

Mọi thay đổi có **Undo / Redo** (Ctrl+Z / Ctrl+Y) và được lưu vào file ngay.

## Inspector

**State**: Name, Tag, **Motion** (clip hoặc Blend Tree — nút ⋮ để đổi), **Speed**, **Multiplier** (parameter Float nhân với Speed), **Cycle Offset** (số hoặc parameter), **Write Defaults**, danh sách **Transitions** (thứ tự = độ ưu tiên; ↑ ↓ để đổi, Solo / Mute), **Add Behaviour**.

**Transition**: **Has Exit Time**; **Settings**: Exit Time, Fixed Duration, Transition Duration (giây hoặc % của state nguồn), Transition Offset, **Interruption Source** (None / Current State / Next State / Current State Then Next State / Next State Then Current State), Ordered Interruption, Can Transition To Self (Any State); thanh timeline xem trước; **Conditions**: parameter + điều kiện (Float: Greater / Less, Int: Greater / Less / Equals / NotEqual, Bool: true / false, Trigger) + ngưỡng.

**Entry / Any State / sub-state machine**: danh sách transition của chúng.

## Quy tắc chạy (như Unity)

- Mỗi frame, khi không đang chuyển: transition của **Any State** được xét trước, rồi transition của state hiện tại theo thứ tự. Transition đầu tiên thoả mãn thì chạy.
- **Has Exit Time**: chỉ xét khi normalized time của state nguồn đi qua Exit Time (Exit Time < 1: mỗi vòng lặp). Không có Exit Time thì phải có ít nhất một điều kiện (transition không có cả hai bị bỏ qua).
- **Trigger** giữ nguyên tới khi một transition dùng nó chạy, rồi tự reset (một trigger chỉ kích hoạt một lần); `resetTrigger` để huỷ.
- Trong lúc chuyển, state cũ và mới cùng chạy và trộn theo thời gian chuyển. **Interruption Source** quyết định transition nào được ngắt nó (Ordered Interruption: chỉ transition ưu tiên cao hơn của state nguồn).
- Vào sub-state machine: xét **Entry transitions** của nó (theo điều kiện), không có thì vào state mặc định. Tới **Exit**: xét transition của chính sub-state machine (ở state machine cha), không có thì về Entry của cha; Exit ở gốc layer quay lại Entry.
- **Write Defaults** (bật): thuộc tính mà controller animate ở state khác nhưng state hiện tại không animate sẽ trở về giá trị lúc gắn (ví dụ state Jump đổi màu, về Idle màu trở lại).
- **Layer**: layer 0 luôn weight 1. Layer trên **Override** đè lên với Weight (chỉ các thuộc tính clip của nó animate; **Mask**: chỉ các Transform con theo đường dẫn, ví dụ `Torso/ArmR`), **Additive** cộng phần chênh lệch so với frame đầu của clip.

## Blend Tree

![Blend tree 1D theo Speed: node blend tree với thanh trượt, ba motion với trọng số; Inspector hiện biểu đồ tam giác và danh sách motion](/images/animator-blend-tree.png)

Double-click state có blend tree (hoặc nút Motion trong Inspector) để mở: node blend tree bên trái có thanh trượt parameter (Edit Mode: đổi giá trị mặc định của parameter — để xem trước; Play Mode: giá trị đang chạy), các motion bên phải với thanh trọng số. Kéo clip vào để thêm motion; chuột phải ▸ Add Motion / Add Blend Tree (blend tree lồng nhau, double-click để vào).

| Blend Type | Trọng số |
|---|---|
| **1D** | Nội suy tuyến tính giữa hai **Threshold** kề nhau (Automate Thresholds: chia đều Min..Max) |
| **2D Simple Directional** | Hai motion kề nhau theo hướng (+ motion ở tâm) |
| **2D Freeform Directional** | Gradient band trong toạ độ cực (đi / chạy cùng hướng trộn theo độ lớn) |
| **2D Freeform Cartesian** | Gradient band trong toạ độ Descartes |
| **Direct** | Mỗi motion một parameter Float làm trọng số |

Inspector của blend tree: Blend Type, Parameter(s), biểu đồ (1D: tam giác trọng số + vạch giá trị hiện tại; 2D: các điểm motion — kéo được — và điểm parameter màu đỏ), danh sách Motion (Threshold / Pos X / Pos Y, **Speed** riêng từng motion, cột W = trọng số hiện tại). Các motion chạy đồng bộ theo normalized time; độ dài state = trung bình độ dài các motion theo trọng số.

## Script

```ts
import { Animator, MonoBehaviour, Input, Time } from '@pia/core';

export class Player extends MonoBehaviour {
  private _anim!: Animator;
  start() { this._anim = this.getComponent(Animator)!; }
  update() {
    this._anim.setFloat('Speed', this._speed, 0.1, Time.deltaTime);   // có damping
    if (Input.getKeyDown('Space')) this._anim.setTrigger('Jump');
    this._anim.setBool('Grounded', this._grounded);
    const info = this._anim.getCurrentAnimatorStateInfo(0);
    if (info.isName('Jump') && info.normalizedTime > 0.9) { /* … */ }
  }
}
```

| API | Mô tả |
|---|---|
| `setFloat / getFloat`, `setInteger / getInteger`, `setBool / getBool`, `setTrigger / resetTrigger` | Parameter theo tên hoặc hash (`Animator.stringToHash('Speed')`) |
| `getCurrentAnimatorStateInfo(layer)` / `getNextAnimatorStateInfo(layer)` | `isName('Idle')` / `isName('Base Layer.Idle')`, `isTag`, `normalizedTime`, `length`, `speed`, `shortNameHash`, `fullPathHash`, `name`, `fullPath`. Object được dùng lại mỗi lần gọi: đọc ngay hoặc `clone()` |
| `isInTransition(layer)`, `getAnimatorTransitionInfo(layer)` | Đang chuyển state? tiến độ, thời lượng |
| `getCurrentAnimatorClipInfo(layer)` | Các clip đang phát và trọng số (blend tree) |
| `play(state, layer = -1, normalizedTime)`, `playInFixedTime` | Nhảy thẳng tới state |
| `crossFade(state, normalizedDuration, layer, normalizedTimeOffset)`, `crossFadeInFixedTime(state, seconds, …)` | Chuyển mượt tới state |
| `layerCount`, `getLayerName`, `getLayerIndex`, `getLayerWeight / setLayerWeight` | Layer |
| `parameters`, `parameterCount`, `hasState(layer, hash)`, `rebind()` | |

::: note Không có Controller
Khi ô Controller trống, `play(tênClip, normalizedTime)` và `crossFade(tênClip, giây)` giữ nguyên cách dùng cũ (phát clip theo tên).
:::

## StateMachineBehaviour

Script gắn vào state (Inspector ▸ **Add Behaviour**), nhận sự kiện của state đó. Gắn vào sub-state machine thì nhận sự kiện của mọi state bên trong. Mỗi Animator có instance riêng; field được lưu trong controller và chỉnh trong Inspector như field của component.

```ts
import { Debug, StateMachineBehaviour, type AnimatorLike, type AnimatorStateInfo } from '@pia/core';

export class StateLogger extends StateMachineBehaviour {
  message = 'Jump!';
  onStateEnter(animator: AnimatorLike, info: AnimatorStateInfo, layer: number) { Debug.log(this.message); }
  onStateUpdate(animator: AnimatorLike, info: AnimatorStateInfo, layer: number) {}
  onStateExit(animator: AnimatorLike, info: AnimatorStateInfo, layer: number) {}
}
```

## Animation Event

Event của clip `.anim.json` (cửa sổ Animation) chạy cả khi clip phát qua controller (kể cả trong blend tree khi motion có trọng số): gọi `sendMessage(function, argument)` trên object có Animator, ví dụ `OnFootstep(foot: string)` của một MonoBehaviour.

## Debug trong Play Mode

Chọn object có Animator (hoặc để cửa sổ tự tìm Animator đang dùng controller): state đang chạy có viền xanh và **thanh tiến độ** xanh, transition đang chạy sáng lên, tab Parameters hiện giá trị đang chạy và **sửa trực tiếp** được, thanh Weight của layer cũng vậy. Có thể sửa controller ngay khi đang Play (giữ parameter và state hiện tại).

## Ví dụ

- **Demo3D** ▸ `Assets/Scenes/AnimatorController.scene.json`: Robot với `Assets/Animations/Robot/RobotLocomotion.controller.json` — blend tree 1D theo `Speed` (Idle của model + Walk / Run `.anim.json`), trigger `Jump` từ Any State, layer `UpperBody` (Mask `Torso/ArmR`) vẫy tay bằng clip Wave của model. Script `RobotAnimDriver` (W / Shift / Space / Q, hoặc tự chạy).
- **Demo2D** ▸ `Assets/Scenes/AnimatorController2D.scene.json`: nhân vật sprite Idle / Run / Jump (`Assets/Animations/Hero/Hero.controller.json`), Run có Multiplier = `Speed`, Jump có behaviour `StateLogger`, event `OnFootstep` trong clip Run. Script `HeroAnimDriver` (A / D / Space, hoặc tự đi tuần).

## Hiệu năng và giới hạn

- Mỗi frame không cấp phát bộ nhớ: controller được biên dịch một lần (dùng chung), mọi giá trị animate gom vào mảng số; đo: 100 Animator × 30 xương × blend tree 3 clip ≈ 1,3–2,5 ms/frame trên CPU (Node, máy dev).
- **Baked Animation**: GPU chỉ trộn **2 tư thế** — controller dùng hai clip của model có trọng số lớn nhất ở layer 0 (blend tree 3 clip hoặc chuyển state giữa hai blend tree bị rút gọn còn 2); layer trên không ảnh hưởng xương bake (vẫn chạy trên object gốc / blend shape).
- Ngắt transition (interruption) không "đóng băng" tư thế đang trộn như Unity: transition mới bắt đầu từ state đã ngắt nó.
- Chưa có: Mirror, IK, root motion, Humanoid / Avatar Mask asset (Mask là danh sách đường dẫn), synced layer, curve parameter, preview 3D trong Inspector.
