---
title: Animation
description: Component Animation, Animator (clip của model), cửa sổ Animation (Record, keyframe, event) và định dạng clip .anim.json.
---

# Animation

Animation clip (`.anim.json`) animate thuộc tính của object và con của nó: vị trí, xoay, scale, màu, cường độ đèn, bật / tắt… Phát bằng component **Animation** (giống component `Animation` legacy của Unity).

## Component Animation

**Add Component → Miscellaneous → Animation**.

| Thuộc tính | Field | Mặc định | Mô tả |
|---|---|---|---|
| Animation | `clip` | | Clip mặc định (asset `.anim.json`) |
| Play Automatically | `playAutomatically` | `true` | Tự phát khi bật |
| Speed | `speed` | `1` | Tốc độ phát |

```ts
const anim = this.getComponent(Animation)!;
anim.play();                 // phát clip mặc định
anim.play(this.openClip);    // phát clip khác (GUID / đường dẫn, ví dụ field @field({ assetType: 'animation' }))
anim.stop();
anim.isPlaying;
anim.time = 0.5;             // tua tới giây 0.5
anim.sample();               // áp ngay trạng thái tại time hiện tại
```

::: note Model có animation
Clip có sẵn trong file glTF / FBX là sub-asset của model (`"<guidModel>#clip:<tên>"`) và được phát bằng [Animator](#animator) trên object gốc của model (Rig ▸ Animation Type: Generic, mặc định). Với Animation Type **Legacy**, model dùng component Animation ở trên: field `clip` nhận cả clip của model. Xem [Model 3D](../assets/models.md).
:::

## Animator

Object gốc của model có **Animator** (Add Component → Miscellaneous → Animator). Clip chạy trên Transform của các GameObject trong cây (vị trí, rotation quaternion nội suy slerp, scale, blend shape của SkinnedMeshRenderer), nên script đọc / sửa được tư thế như mọi object. Chưa có state machine (Animator Controller): đổi clip bằng tên.

| Thuộc tính | Field | Mặc định | Mô tả |
|---|---|---|---|
| Clips | `clips` | các clip của model | Clip phát được: clip của model hoặc `.anim.json` |
| Default Clip | `defaultClip` | | Clip tự phát (trống = clip đầu tiên) |
| Play Automatically | `playAutomatically` | `true` | Tự phát khi bật |
| Speed | `speed` | `1` | Tốc độ phát |
| Wrap Mode | `wrapMode` | `Default` | Default = theo Loop Time của clip; Loop / Once / ClampForever |

```ts
const anim = this.getComponentInChildren(Animator)!;
anim.play('Idle');
anim.crossFade('Run', 0.2);     // chuyển mượt trong 0.2 giây
anim.speed = 1.5;
anim.stop();
anim.isPlaying; anim.currentClip; anim.time; anim.normalizedTime;
anim.getClipLength('Run');
anim.sampleClip('Run', 0.5);    // áp tư thế tại 0.5 giây mà không phát
```

Inspector của Animator có **Preview**: chọn clip, Play / Pause, kéo thanh thời gian để xem clip ngay trong Edit Mode. Bấm Stop (hoặc lưu scene, bấm Play, chọn object khác) thì tư thế trả lại như cũ, scene không bị đổi.


## Cửa sổ Animation

**Window → Animation** (<kbd>Ctrl</kbd>+<kbd>6</kbd>). Chọn GameObject cần animate:

1. **Create** (hoặc chọn *Create New Clip…* trong dropdown) để tạo clip; clip được gán vào component Animation của object.
2. Bấm **Record** (nút tròn đỏ): mọi thay đổi trong Inspector / Scene view trở thành keyframe tại vị trí playhead.
3. Hoặc **Add Property** để chọn thuộc tính cần animate.
4. Kéo playhead / nhập **Time**; đặt **Length** và **Loop** của clip.
5. **Preview** (<kbd>Space</kbd>) để xem thử; nút Stop dừng preview và khôi phục scene.
6. Chuột phải lên key: **Delete Key**, kiểu nội suy **Smooth / Linear / Constant**. Chuột phải lên thuộc tính: **Remove Property**.
7. Nút thêm **event** tại playhead: khi phát tới đó, hàm có tên tương ứng được gọi (qua `sendMessage`) trên object được animate.

## Thuộc tính animate được

| Component | Ví dụ property |
|---|---|
| `Transform` | `localPosition.x`, `localEulerAngles.z`, `localScale.y` |
| `GameObject` | `active` |
| Component bất kỳ | Field số, màu (`color.a`), bool (`enabled`), ví dụ `Light`/`intensity`, `SpriteRenderer`/`color.r` |

Mỗi đường cong (curve) gắn với **đường dẫn con** tính từ object có Animation (`""` = chính nó, `"Arm/Hand"` = con cháu).

## Định dạng clip

```json Assets/Animations/PlatformMove.anim.json
{
  "version": 1,
  "name": "PlatformMove",
  "length": 4,
  "loop": true,
  "frameRate": 60,
  "curves": [
    {
      "path": "",
      "component": "Transform",
      "property": "localPosition.y",
      "keys": [{ "t": 0, "v": 0.8 }, { "t": 2, "v": 3.2 }, { "t": 4, "v": 0.8 }]
    }
  ],
  "events": []
}
```

Clip trên (Demo3D) đưa platform lên xuống trong 4 giây. Một event có dạng `{ "time": 2, "function": "onTurn", "argument": "..." }`. Key có thể có `"i"`: `"smooth"` (mặc định, tiếp tuyến tự động như Auto key của Unity), `"linear"` hoặc `"constant"`.

::: note Chưa hỗ trợ
Animator (state machine, blend tree, transition), chỉnh tiếp tuyến bằng tay, curve editor, keyframe **sprite** (đổi sprite theo frame — tạm dùng script, xem [Sprite Editor](../assets/sprite-editor.md#dung-sprite-con)). Animation xương: package [Spine](../official/spine.md).
:::
