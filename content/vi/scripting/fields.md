---
title: Field & Inspector
description: Field nào hiện trong Inspector, decorator @field và các kiểu field (asset, tham chiếu, mảng, class lồng nhau).
---

# Field & Inspector

Field public của component được **lưu vào scene / prefab** và **hiện trong Inspector**, như `public` / `[SerializeField]` của Unity.

## Tự nhận kiểu

Field có giá trị mặc định thuộc các kiểu sau tự hiện trong Inspector, không cần decorator:

```ts
export class Player extends MonoBehaviour {
  speed = 5;                          // number
  playerName = 'Hero';                // string
  canJump = true;                     // boolean
  offset = new Vector3(0, 4, 9);      // Vector3
  size = new Vector2(1, 1);           // Vector2
  tint = new Color(1, 1, 1, 1);       // Color
  tags = ['a', 'b'];                  // mảng: kiểu theo phần tử đầu
}
```

Không được lưu / không hiện:

- Field bắt đầu bằng `_` (ví dụ `private _hp = 0`) — trừ khi có `@field`.
- Field đánh dấu `@nonSerialized`.
- Field có giá trị `null` hoặc mảng rỗng mà không có `@field(...)` cho biết kiểu.

::: tip Quy ước
Đặt state nội bộ là `private _tên` để nó không lọt vào Inspector và file scene — giống các script mẫu trong Demo2D / Demo3D.
:::

## Decorator `@field`

`@field(...)` thêm thông tin cho Inspector hoặc khai báo kiểu khi không tự nhận được:

```ts
import { GameObject, MonoBehaviour, field } from '@pia/core';

export class Enemy extends MonoBehaviour {
  @field({ range: [0, 10] }) speed = 2;                         // slider
  @field({ type: 'int', min: 0 }) lives = 3;                    // số nguyên
  @field({ options: ['Idle', 'Patrol', 'Chase'] }) state = 'Idle';  // dropdown
  @field({ header: 'Combat', tooltip: 'Damage per hit' }) damage = 1;
  @field({ multiline: true }) description = '';
  @field({ assetType: 'audio' }) hitSound = '';                 // ô chọn asset (GUID)
  @field('gameObject') target: GameObject | null = null;        // object trong scene hoặc prefab
}
```

### Tuỳ chọn

| Tuỳ chọn | Ý nghĩa | Unity |
|---|---|---|
| `label` | Tên hiển thị (mặc định "Nice Name" của key: `moveSpeed` → *Move Speed*) | |
| `tooltip` | Chú thích khi rê chuột | `[Tooltip]` |
| `range: [min, max]` | Slider | `[Range]` |
| `min`, `max`, `step` | Giới hạn / bước của ô số | `[Min]` |
| `type: 'int'` | Số nguyên | |
| `options: [...]` | Dropdown (enum chuỗi); có thể là hàm `(component) => string[]` | `enum` |
| `assetType` | Ô chọn asset: `'texture'`, `'sprite'`, `'audio'`, `'model'`, `'prefab'`, `'animation'`, `'font'`, `'scene'` | |
| `header` | Tiêu đề in đậm phía trên | `[Header]` |
| `multiline` | Ô nhập nhiều dòng | `[TextArea]` |
| `hidden` | Lưu nhưng không hiện | `[HideInInspector]` |
| `nonSerialized` | Không lưu, không hiện | `[NonSerialized]` |
| `visibleIf: (c) => boolean` | Chỉ hiện khi điều kiện đúng | |
| `array` | Field là mảng | `T[]` |
| `elementLabel: (owner, i) => string` | Nhãn từng phần tử mảng | |
| `formerlySerializedAs` | Tên cũ (hoặc danh sách tên cũ) của field, dữ liệu cũ vẫn đọc được | `[FormerlySerializedAs]` |

Decorator rút gọn: `@hideInInspector`, `@nonSerialized`.

```ts
import { MonoBehaviour, hideInInspector, nonSerialized } from '@pia/core';

export class Example extends MonoBehaviour {
  @hideInInspector savedButHidden = 0;
  @nonSerialized runtimeOnly = 0;
}
```

## Bảng kiểu field

| Khai báo | Inspector | Lưu trong file |
|---|---|---|
| `speed = 5`, `name = ''`, `on = true`, `v = new Vector3()`, `c = new Color()` | Tự nhận theo giá trị mặc định | Giá trị |
| `@field({ range: [0, 10] })`, `@field({ type: 'int' })`, `@field({ options: ['A', 'B'] })` | Slider / số nguyên / dropdown | Giá trị |
| `@field({ assetType: 'sprite' })`, `@field({ assetType: 'audio' })` | Ô chọn asset | GUID |
| `@field(GameObject)` hoặc `@field('gameObject')` | Object trong scene hoặc prefab | id object / GUID prefab |
| `@field(Button) button: Button \| null = null` (class component) | Kéo object có component đó (hoặc prefab) vào | id object + kiểu |
| `@field(EnemyData)` (class ScriptableObject) | Ô chọn asset `.asset.json` cùng kiểu | GUID |
| `@field(TextAsset)`, `@field(JsonAsset)`, `@field(BufferAsset)`, `@field([JsonAsset]) levels: JsonAsset[] = []` | Ô chọn file văn bản / `.json` / file bất kỳ — xem [TextAsset](text-assets.md) | GUID |
| `@field(AudioClip) hit: AudioClip \| null = null`, `@field([AudioClip]) clips: AudioClip[] = []` | Ô chọn file audio — xem [Audio](../components/audio.md#audioclip) | GUID |
| `@field(PiaEvent)` hoặc `onHit = new PiaEvent()` | Danh sách hàm gọi (như UnityEvent) | Danh sách call |
| `@field([X])` hoặc `@field({ ..., array: true })` — X là `'number'`, `'string'`, `Vector3`, `EnemyData`, `GameObject`, class `@serializable`… | Danh sách: Size, + / −, menu ⋮ (Move Up/Down, Duplicate, Delete) | Mảng |
| `@field(Wave)` hoặc `wave = new Wave()` với `@serializable class Wave` | Nhóm field lồng nhau (foldout) | Object |
| `@field(() => Item)` | Như trên, khai báo lười để tránh import vòng | |
| `@field({ type: SpriteRenderer, label: 'Mask' })`, `@field({ type: [SpriteRenderer] })` | Như truyền class trực tiếp, kèm option khác (label, tooltip, header…) | |

Mảng có giá trị mặc định khác rỗng (`tags = ['a', 'b']`) được tự nhận kiểu theo phần tử đầu; mảng rỗng cần `@field([...])`.

## Mảng và class lồng nhau

```ts
import { GameObject, MonoBehaviour, field, serializable } from '@pia/core';

@serializable
export class Wave {
  @field(GameObject) enemy: GameObject | null = null;   // prefab
  count = 5;
  delay = 1;
}

export class WaveSpawner extends MonoBehaviour {
  @field([Wave]) waves: Wave[] = [];
  @field(['string']) names: string[] = [];
  @field({ assetType: 'audio', array: true }) sounds: string[] = [];
}
```

`@serializable` tương đương `[System.Serializable]` của Unity: field của class được lưu và hiện lồng trong Inspector.

## Field asset là chuỗi GUID

Field `assetType` giữ **chuỗi tham chiếu asset** (GUID). Truyền thẳng chuỗi đó cho API cần asset:

```ts Assets/Scripts/Collectible.ts
@field({ type: 'asset', assetType: 'audio' })
pickupSound = '';

onTriggerEnter2D(other: Collider2D) {
  if (this.pickupSound) AudioSource.playClipAtPoint(this.pickupSound, this.transform.position, 0.8);
}
```

## Đổi tên field mà không mất dữ liệu

```ts
@field({ formerlySerializedAs: 'speed' })
moveSpeed = 5;
```

Scene cũ lưu `speed` vẫn được đọc vào `moveSpeed`. Một giá trị đơn lưu trước khi field thành mảng được đọc thành `[value]`.

## Tuỳ biến Inspector thêm

Muốn có nút bấm, điều kiện ẩn / hiện, nhóm, tab, thanh tiến trình, dropdown, kiểm tra giá trị… ngay trong script: dùng [Inspector attributes](inspector-attributes.md) (kiểu Odin Inspector), ví dụ:

```ts
@boxGroup('Stats') @progressBar(0, 100) health = 100;
@showIf('useShield') @field({ range: [0, 50] }) shield = 20;
@button('Heal') heal() { this.health = 100; }
```

Viết giao diện hoàn toàn riêng: [Editor extension](../packages/editor-extensions.md) (`registerInspector`, `registerPropertyDrawer`).
