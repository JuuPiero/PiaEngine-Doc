---
title: Resources
description: Nạp asset theo tên lúc chạy từ thư mục Resources.
---

# Resources

Bản build chỉ chứa asset mà scene tham chiếu. Asset bạn chỉ nạp **bằng tên trong code** phải đặt trong một thư mục tên **`Resources`** (bất kỳ đâu trong `Assets/`) — thư mục này **luôn được đưa vào build**, như Unity.

```text
Assets/
  Resources/
    Enemies/
      Goblin.prefab.json
    Data/
      Goblin.asset.json
    Sounds/
      hit.wav
```

Đường dẫn tính từ thư mục `Resources`, **không cần đuôi file**, không phân biệt hoa thường.

::: warning Trùng tên
Vì bỏ đuôi file, hai asset cùng tên trong cùng thư mục (ví dụ `Goblin.prefab.json` và `Goblin.asset.json`) sẽ trùng đường dẫn `Enemies/Goblin`. Đặt tên khác nhau hoặc tách thư mục như ví dụ trên.
:::

## API

| API | Trả về |
|---|---|
| `await Resources.load(path, Type?)` | ScriptableObject / Material (instance), prefab (template để `instantiate`), JSON đã parse của clip / file dữ liệu, hoặc **GUID** với asset khác (texture, audio…). Truyền class để kiểm tra kiểu (sai kiểu → `null`) |
| `await Resources.loadAll(folder, Type?)` | Mọi asset trong `Resources/<folder>` |
| `await Resources.loadPrefab(path)` | Prefab dạng template cho `instantiate` |
| `await Resources.loadJson(path)` | JSON đã parse |
| `Resources.find(path)` | GUID của asset (đồng bộ, không nạp). `'Icons/sheet#coin_0'` → tham chiếu sprite con theo tên |
| `Resources.findSprites(path)` | Mọi sprite con của một sprite sheet (`<guid>#<id>`, theo thứ tự Sprite Editor), như `Resources.LoadAll<Sprite>`; texture `Single` → `[guid]` |
| `Resources.findAll(folder)` | Mọi GUID trong folder |

```ts
import { AudioSource, MonoBehaviour, Resources } from '@pia/core';
import { EnemyData } from './EnemyData';

export class EnemySpawner extends MonoBehaviour {
  async start() {
    const goblin = await Resources.loadPrefab('Enemies/Goblin');   // Assets/**/Resources/Enemies/Goblin.prefab.json
    if (goblin) this.instantiate(goblin);

    const data = await Resources.load('Data/Goblin', EnemyData);   // Resources/Data/Goblin.asset.json
    const all = await Resources.loadAll('Data', EnemyData);

    const hit = Resources.find('Sounds/hit');                       // GUID, dùng cho audio
    if (hit) this.getComponent(AudioSource)?.playOneShot(hit);
  }
}
```

::: note Hàm vòng đời async
`start()` có thể là `async`. Engine không chờ promise; phần sau `await` chạy khi asset nạp xong.
:::

## Cách khác để ép đưa asset vào build

- Ghi đường dẫn `'Assets/...'` hoặc GUID dưới dạng chuỗi trong script: build tự nhận.
- Khai báo `build.include` trong `pia.project.json`. Xem [Build web](../build/build-web.md#ep-dua-vao-build).
