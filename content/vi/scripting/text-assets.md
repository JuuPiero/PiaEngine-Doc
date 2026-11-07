---
title: TextAsset, JsonAsset, BufferAsset
description: Dùng file văn bản, JSON và nhị phân trong project làm field của script; hằng EDITOR.
---

# TextAsset, JsonAsset, BufferAsset

Giống `TextAsset` của Unity: file dữ liệu thô trong project dùng làm field của script. Field lưu **GUID** của file (đổi tên / di chuyển file không làm hỏng tham chiếu). File được nạp sẵn trước khi scene chạy, nên `start()` dùng được ngay.

| Class | Nhận file | Đọc |
|---|---|---|
| `TextAsset` | `.txt` `.md` `.csv` `.tsv` `.xml` `.yaml` `.ini` `.glsl`, `.json`, `.html`, `.css`, `.shader` | `text`, `lines`, `bytes` |
| `JsonAsset<T>` | `.json` | như `TextAsset`, thêm `json` / `data` (kiểu `T`) |
| `BufferAsset` | file bất kỳ (`.bytes`, `.bin`…) | `buffer` (ArrayBuffer), `bytes` (Uint8Array), `dataView`, `length` |

Chung cho cả ba: `name`, `path`, `guid`, `isLoaded`, `await load()`.

## Khai báo field

```ts Assets/Scripts/LevelManager.ts
import { BufferAsset, Debug, JsonAsset, MonoBehaviour, TextAsset, field } from '@pia/core';

interface Level { name: string; buses: number }

export class LevelManager extends MonoBehaviour {
  @field(TextAsset) credits: TextAsset | null = null;
  @field([JsonAsset]) levels: JsonAsset<Level>[] = [];
  @field(BufferAsset) map: BufferAsset | null = null;

  start() {
    Debug.log(this.credits?.text);
    for (const level of this.levels) Debug.log(level.name, level.json.buses);
    const firstByte = this.map?.bytes[0];
  }
}
```

- Kéo file từ cửa sổ Project vào ô trong Inspector. Với danh sách, thả file lên **tiêu đề danh sách** để thêm phần tử; file sai loại bị từ chối.
- `json` chỉ parse một lần cho mỗi nội dung file. JSON hỏng thì báo lỗi kèm đường dẫn file. File có BOM UTF-8 (hay gặp khi lưu bằng công cụ của Windows) vẫn đọc được.
- Mọi field trỏ tới cùng một file dùng **chung một instance**.

## Nạp bằng code

```ts
const intro = await Resources.load('Dialogs/intro', TextAsset);   // Assets/**/Resources/Dialogs/intro.txt
```

## Trong bản build

Build chỉ đóng gói file được scene / prefab / asset tham chiếu, hoặc nằm trong thư mục `Resources/` (xem [Build web](../build/build-web.md)).

## Hằng `EDITOR`

`EDITOR` là hằng toàn cục, giống `#if UNITY_EDITOR`: `true` khi chạy trong editor (kể cả Play Mode), `false` trong bản build. Khi build, hằng được thay lúc biên dịch nên code trong `if (EDITOR) { ... }` bị loại khỏi bản build.

```ts
if (EDITOR) Debug.log('Chỉ hiện khi chạy trong editor');
```
