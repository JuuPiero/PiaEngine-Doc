---
title: ScriptableObject
description: Dữ liệu dùng chung nằm trong file asset thay vì trên GameObject.
---

# ScriptableObject

Giống Unity: dữ liệu dùng chung nằm trong **file asset** (`.asset.json`) thay vì trên GameObject.

## Khai báo

```ts Assets/Scripts/EnemyData.ts
import { GameObject, MonoBehaviour, ScriptableObject, createAssetMenu, field, serializable } from '@pia/core';

@serializable
export class Drop {
  @field(GameObject) item: GameObject | null = null;   // prefab
  chance = 0.5;
}

@createAssetMenu({ fileName: 'New Enemy', menuName: 'Game/Enemy Data' })
export class EnemyData extends ScriptableObject {
  hp = 10;
  @field({ range: [0, 10] }) speed = 2;
  @field({ assetType: 'sprite' }) sprite = '';
  @field([Drop]) drops: Drop[] = [];

  onEnable() { /* chạy khi asset được nạp */ }
}

// component dùng asset
export class Enemy extends MonoBehaviour {
  @field(EnemyData) data: EnemyData | null = null;   // kéo asset từ Project vào
  private _hp = 0;
  start() { this._hp = this.data?.hp ?? 10; }
}
```

Field của ScriptableObject dùng chung quy tắc với component (xem [Field & Inspector](fields.md)).

## Tạo asset

- **Project → Create → Game → Enemy Data** (theo `@createAssetMenu`). Mọi class ScriptableObject cũng có trong **Create → Scriptable Object**.
- Asset mới tên `New Enemy.asset.json`. Chọn asset để sửa field trong Inspector: tự lưu, có Undo / Redo.
- **Create → ScriptableObject Script** tạo script mẫu.

## Dùng trong code

```ts
// instance lúc chạy (không có file)
const runtime = ScriptableObject.createInstance(EnemyData);

// bản sao của một asset
const copy = this.instantiate(this.data!);
this.destroy(copy);

// nạp theo đường dẫn / GUID
const goblin = await ScriptableObject.loadAsset('Assets/Data/Goblin.asset.json', EnemyData);

// nạp theo tên trong thư mục Resources
const orc = await Resources.load('Enemies/Orc', EnemyData);
```

- Mọi tham chiếu tới cùng một asset dùng **chung một instance**.
- Scene / prefab nạp trước các asset chúng tham chiếu (kể cả chuỗi asset → prefab → asset…), nên `start()` dùng được ngay.

## Vòng đời

| Hàm | Khi nào |
|---|---|
| `awake()` + `onEnable()` | Khi asset được nạp / instance được tạo (sau khi field đã có giá trị) |
| `onDisable()` + `onDestroy()` | Khi instance bị huỷ |
| `onValidate()` | Sau khi sửa trong Inspector (editor) |
| `reset()` | Khi tạo asset từ menu Create hoặc Reset trong Inspector (editor) |

## Lưu ý

- Field `GameObject` trong ScriptableObject chỉ nhận **prefab** (asset không tham chiếu được object trong scene).
- **Play Mode**: script đổi giá trị asset khi đang chơi thì khi Stop giá trị quay về bản đã lưu (khác Unity, nơi thay đổi bị giữ lại). Sửa trong Inspector lúc đang chơi thì được lưu.
- **Build** chỉ đóng gói asset được scene / prefab / asset khác tham chiếu (hoặc nằm trong `Resources/`), kèm script định nghĩa class của nó.

## Ví dụ: Demo2D

`Assets/Scripts/PlayerStats.ts` + `Assets/Data/Player Stats.asset.json` (tốc độ, lực nhảy, số lần nhảy trên không, danh sách âm thanh nhảy), được `PlatformerPlayer.stats` tham chiếu:

```ts Assets/Scripts/PlayerStats.ts
import { ScriptableObject, createAssetMenu, field } from '@pia/core';

@createAssetMenu({ fileName: 'New Player Stats', menuName: 'Demo 2D/Player Stats' })
export class PlayerStats extends ScriptableObject {
  @field({ range: [0, 15] })
  moveSpeed = 6;

  @field({ range: [0, 25] })
  jumpSpeed = 13;

  @field({ type: 'int', min: 0, max: 3, tooltip: 'Extra jumps in the air (1 = double jump)' })
  airJumps = 1;

  /** One is picked at random for every jump. */
  @field({ type: 'asset', assetType: 'audio', array: true })
  jumpSounds: string[] = [];

  /** A random jump sound ('' when the list is empty). */
  randomJumpSound(): string {
    return this.jumpSounds[Math.floor(Math.random() * this.jumpSounds.length)] ?? '';
  }
}
```

File asset:

```json Assets/Data/Player Stats.asset.json
{
  "version": 1,
  "type": "PlayerStats",
  "data": { "moveSpeed": 6, "jumpSpeed": 13, "airJumps": 1, "jumpSounds": ["<guid>"] }
}
```
