---
title: SceneManager
description: Chuyển scene lúc chạy theo tên hoặc index trong Build Settings.
---

# SceneManager

```ts
import { SceneManager } from '@pia/core';

await SceneManager.loadScene('Level2');   // theo tên file scene (không đuôi)
await SceneManager.loadScene(1);          // theo index trong Build Settings
```

- Nạp theo tên hoặc index thì scene phải nằm trong danh sách **Build Settings** (cả khi chơi trong editor). `loadScene` cũng nhận đường dẫn đầy đủ (`'Assets/Scenes/Bonus.scene.json'`) hoặc GUID, nhưng nên đưa mọi scene vào Build Settings để chắc chắn chúng có trong bản build.
- `loadScene` trả về `Promise<Scene>`: nạp file, nạp trước prefab / asset mà scene tham chiếu, chuẩn bị vật lý (nếu cần), rồi **thay** scene hiện tại (scene cũ bị huỷ, `onDestroy` được gọi).
- Mỗi scene có pipeline riêng: chuyển từ scene 2D sang scene 3D được.

| API | Ý nghĩa |
|---|---|
| `SceneManager.activeScene` / `getActiveScene()` | Scene đang chạy |
| `SceneManager.sceneCountInBuildSettings` | Số scene trong Build Settings |
| `SceneManager.loadScene(nameOrIndex)` | Nạp scene (thay thế scene hiện tại) |
| `SceneManager.onSceneLoaded(fn)` | Lắng nghe khi scene nạp xong; trả về hàm huỷ đăng ký |

```ts
export class LevelExit extends MonoBehaviour {
  nextLevel = 'Level2';

  onTriggerEnter(other: Collider) {
    if (other.compareTag('Player')) void SceneManager.loadScene(this.nextLevel);
  }
}
```

::: note Chưa hỗ trợ
Chưa có nạp scene cộng dồn (additive) và `DontDestroyOnLoad`. Dữ liệu cần giữ qua scene có thể để trong biến `static` hoặc trong một [ScriptableObject](scriptable-object.md).
:::

Khi test bản build, thêm `?scene=Tên` hoặc `?scene=1` vào URL để mở thẳng một scene.
