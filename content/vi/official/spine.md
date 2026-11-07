---
title: Spine
description: Package com.pia.spine — animation xương Spine cho 2D và 3D, cách dùng giống spine-unity.
---

# Spine (`com.pia.spine`)

Chạy animation xương [Spine](https://esotericsoftware.com) (Esoteric Software) trong PiaEngine, cách dùng giống **spine-unity**:

- **SkeletonDataAsset**: asset gom file skeleton (`.json` hoặc `.skel`), atlas (`.atlas` + ảnh trang), scale, thời gian mix.
- **SkeletonAnimation**: component phát animation.
- **BoneFollower**: cho một GameObject bám theo một bone.

| Pipeline | Vẽ bằng |
|---|---|
| 2D (PixiJS) | Runtime chính thức `@esotericsoftware/spine-pixi-v8` |
| 3D (three.js) | `@esotericsoftware/spine-core`, mesh three.js dựng trong package |

Runtime Spine **4.2** (`4.2.120`): đọc file xuất từ Spine Editor 4.2.

::: warning License
Package dùng **Spine Runtimes** theo [Spine Runtimes License Agreement](https://esotericsoftware.com/spine-runtimes-license): mỗi người tích hợp Spine Runtimes vào sản phẩm phải có **license Spine Editor** riêng, và khi phân phối phải kèm license cùng thông báo bản quyền. Asset spineboy trong Demo2D chỉ để học, **không dùng cho mục đích thương mại**.
:::

## Cài đặt

```bash
cd MyGame
npm install ../PiaEngine/pia-packages/com.pia.spine      # hoặc Window → Package Manager → Add package from disk
```

## Import skeleton

1. Trong Spine Editor chọn **Export → JSON** (hoặc Binary), bật **Pack atlas**. Kết quả: `hero.json` (hoặc `hero.skel`), `hero.atlas` và các ảnh `hero.png`…
2. Chép cả bộ file vào cùng một thư mục trong `Assets/` (ví dụ `Assets/Spine/hero/`). Ảnh trang phải nằm cạnh file `.atlas`, đúng tên ghi trong atlas.
3. Trong Project chọn file `.json` / `.skel` → **Assets → Spine → Create SkeletonData Asset**.
   - Asset `hero_SkeletonData.asset.json` được tạo cạnh file, tự tìm `.atlas` cùng thư mục (ưu tiên cùng tên).
   - Cách khác: **Project → Create → Spine → SkeletonData Asset** rồi kéo file vào ô *Skeleton JSON* và *Atlas*.
4. Chọn asset để chỉnh trong Inspector:

| Field | Ý nghĩa |
|---|---|
| Skeleton JSON | File `.json` hoặc `.skel` |
| Atlas | File `.atlas` |
| Scale | Đơn vị Spine → đơn vị world. `0.01` = 100 pixel Spine cho 1 unit (giống mặc định của Unity) |
| Default Mix | Thời gian chuyển mượt giữa hai animation (giây) |
| Custom Mix Durations | Thời gian mix riêng cho từng cặp `From → To` |

Atlas *premultiplied alpha* (`pma: true`, Spine khuyên dùng) và atlas thường đều được hỗ trợ. Xuất lại từ Spine thì chọn asset → **Assets → Spine → Reload Skeleton Data**.

## Đưa vào scene

- Chọn SkeletonData asset → **GameObject → Spine → Skeleton Animation**: tạo object có sẵn component, animation đầu là `idle` (nếu có).
- Hoặc **Add Component → Spine → Skeleton Animation** rồi gán *Skeleton Data Asset*.

### SkeletonAnimation

| Field | Ý nghĩa |
|---|---|
| Skeleton Data Asset | Asset ở trên |
| Initial Skin | Dropdown các skin của skeleton |
| Animation Name | Dropdown các animation (track 0). Đổi giá trị (Inspector hoặc code) là phát animation đó, như `AnimationName` của spine-unity |
| Loop | Animation có lặp không |
| Time Scale | Tốc độ phát |
| Flip X / Flip Y | Lật skeleton |
| Color | Màu nhân lên toàn skeleton |
| Order in Layer | Thứ tự vẽ với sprite / renderer khác (2D như SpriteRenderer; 3D là `renderOrder`) |
| Unscaled Time | Bỏ qua `Time.timeScale` (menu pause…) |

Dưới các field có dòng thông tin: số animation, skin, bone, slot, phiên bản Spine.

**Trong Scene view:**

- Skeleton hiện ngay ở Edit Mode, đứng ở frame 0 của animation đã chọn.
- Chọn object thì animation chạy thử, bỏ chọn thì về frame 0.
- Click để chọn (viền chọn ôm theo dáng hiện tại), <kbd>F</kbd> để frame, Rect tool dùng được.

## Script

```ts Assets/Scripts/Hero.ts
import { Debug, MonoBehaviour } from '@pia/core';
import { SkeletonAnimation } from 'com.pia.spine';

export class Hero extends MonoBehaviour {
  private spine!: SkeletonAnimation;

  start() {
    this.spine = this.getComponent(SkeletonAnimation)!;

    // AnimationState của spine-core (spine-unity: skeletonAnimation.AnimationState)
    this.spine.state.setAnimation(0, 'run', true);
    this.spine.state.addAnimation(0, 'idle', true, 2);      // xếp hàng sau 2 giây
    this.spine.state.setAnimation(1, 'shoot', false);       // track 1 chồng lên track 0
    this.spine.state.addEmptyAnimation(1, 0.2, 0);

    // Skeleton của spine-core
    this.spine.skeleton.setSkinByName('goblin');            // hoặc this.spine.setSkin('goblin')
    this.spine.skeleton.setSlotsToSetupPose();
    this.spine.setAttachment('head', 'head-hurt');          // null = gỡ attachment
    this.spine.flipX = true;

    // sự kiện (spine-unity: state.Complete += ..., state.Event += ...)
    this.spine.onComplete((entry) => Debug.log(`${entry.animation?.name} xong`));
    this.spine.onEvent((entry, e) => {
      if (e.data.name === 'footstep') this.playStep();
    });

    // chỉnh bone sau khi animation được áp, trước khi tính world transform (spine-unity: UpdateLocal)
    this.spine.onUpdateLocal(() => {
      const head = this.spine.findBone('head');
      if (head) head.rotation += 10;
    });
  }

  playStep() { /* ... */ }
}
```

- Sự kiện: `onStart`, `onEnd`, `onComplete`, `onEvent`, `addListener({ start, interrupt, end, dispose, complete, event })`. Mỗi hàm trả về một hàm để huỷ đăng ký.
- Lớp của spine-core (`Skeleton`, `AnimationState`, `TrackEntry`, `Physics`…) có trong `import { spine } from 'com.pia.spine'`.

### Vật lý (physics constraint, Spine 4.2)

Physics constraint của Spine 4.2 (tóc, váy, đuôi, dây...) chạy mỗi frame. Như spine-unity, chuyển động của GameObject được truyền vào vật lý (**Physics Inheritance** trong Inspector của SkeletonAnimation):

| Field | Mặc định | Ý nghĩa |
|---|---|---|
| Position (`physicsPositionInheritanceFactor`) | (1, 1) | Object di chuyển thì phần vật lý văng theo quán tính; 0 = bỏ qua (theo trục X / Y) |
| Rotation (`physicsRotationInheritanceFactor`) | 1 | Object xoay quanh Z thì phần vật lý phản ứng theo |
| Movement relative to (`physicsMovementRelativeTo`) | None | Đo chuyển động so với Transform này (camera, sàn đang chạy...): cùng di chuyển với nó thì không văng |

Chỉ áp dụng khi đang chơi (kéo object trong Edit Mode không làm văng). Sau khi dịch chuyển tức thời (teleport) gọi `resetLastPositionAndRotation()` (hoặc `resetLastPosition()` / `resetLastRotation()`) để không bị văng mạnh; `resetPhysics()` đưa vật lý về đúng tư thế hiện tại.

### Khi nào `state` / `skeleton` dùng được

- Scene nạp xong dữ liệu skeleton trước khi chạy, nên `awake` / `start` dùng được ngay — kể cả SkeletonDataAsset mà prefab trong scene tham chiếu.
- Object tạo sau đó với asset chưa từng được nạp: kiểm tra `spine.valid` hoặc `await spine.whenReady()`. Truy cập `state` / `skeleton` khi chưa sẵn sàng sẽ báo lỗi rõ ràng.

## BoneFollower

**Add Component → Spine → Bone Follower** trên object cần bám (súng trên tay, hiệu ứng ở chân, hitbox…).

| Field | Ý nghĩa |
|---|---|
| Skeleton Renderer | Kéo object có SkeletonAnimation vào |
| Bone Name | Dropdown tên bone |
| Follow XY Position, Follow Z Position, Follow Bone Rotation, Follow Skeleton Flip, Follow Local Scale | Những gì được bám theo |

Chạy trong `lateUpdate` (sau khi animation đã cập nhật); gọi `followNow()` để bám ngay. BoneFollower cũng bám bone ngay trong Edit Mode.

## Build

- Bản build chỉ kèm package khi scene / prefab dùng SkeletonAnimation.
- Kèm SkeletonDataAsset, file skeleton, atlas và **ảnh trang mà atlas ghi tên** (engine đọc atlas để tìm).
- Phần vẽ khai báo theo pipeline (`"pia": { "renderers": … }`, xem [Viết package](../packages/creating-packages.md#custom-renderer)): game 2D chỉ có PixiJS + spine-pixi, không kéo theo three.js. Bản playable một file cũng vậy (khoảng 1 MB với demo).

## Ví dụ: Demo2D

Scene `Assets/Scenes/Spine.scene.json`, script `Assets/Scripts/SpineBoyDemo.ts`:

- Spineboy đi bộ; click / <kbd>Space</kbd>: nhảy rồi quay lại animation đang chạy.
- <kbd>1</kbd> / <kbd>2</kbd> / <kbd>3</kbd>: walk / run / idle. <kbd>S</kbd>: bắn (track 1). <kbd>F</kbd>: lật.
- Dòng chữ đếm số bước chân bằng event `footstep`.
- Ngôi sao bám đầu súng bằng BoneFollower.

## Chưa hỗ trợ

- SkeletonGraphic (Spine trong UI Canvas), SkeletonMecanim, SkeletonUtility / BoneFollower ngược (bone theo object).
- Material / shader tuỳ biến cho skeleton; mỗi SkeletonDataAsset chỉ 1 atlas (atlas vẫn có thể nhiều trang).
- 3D: skeleton vẽ phẳng, không đổ / nhận bóng; không có "dark tint" (tint hai màu).
- Cửa sổ xem trước animation trong Inspector của asset.
- Web editor dạng tĩnh + `pia agent` chưa nạp phần vẽ của package.
