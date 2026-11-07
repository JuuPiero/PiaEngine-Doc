---
title: Coroutine, Invoke & Time
description: Coroutine bằng generator function, Invoke / InvokeRepeating và lớp Time.
---

# Coroutine, Invoke & Time

## Coroutine

Coroutine là **generator function** (`function*` / method `*tên()`), `yield` thay cho `yield return` của C#:

```ts
import { MonoBehaviour, WaitForSeconds, WaitUntil } from '@pia/core';

export class Blinker extends MonoBehaviour {
  start() {
    this.startCoroutine(this.blink());
  }

  *blink() {
    while (true) {
      this.enabled = !this.enabled;
      yield new WaitForSeconds(0.5);
    }
  }
}
```

### Có thể `yield` gì

| Yield | Chờ |
|---|---|
| `null` (hoặc `yield;`) | Một frame |
| `new WaitForSeconds(s)` | `s` giây theo thời gian có scale (`Time.timeScale`) |
| `new WaitForSecondsRealtime(s)` | `s` giây thời gian thực |
| `new WaitUntil(() => cond)` | Đến khi điều kiện đúng |
| `new WaitWhile(() => cond)` | Trong khi điều kiện còn đúng |
| Một `Promise` | Đến khi promise xong (ví dụ `Resources.load(...)`) |
| Một `Coroutine` khác (giá trị trả về của `startCoroutine`) | Đến khi coroutine đó xong |
| Một generator khác (`yield this.other()`) | Chạy lồng generator đó tới hết |

```ts
*intro() {
  yield new WaitForSeconds(1);
  const data = Resources.load('Levels/One');   // Promise
  yield data;                                  // chờ nạp xong
  yield this.fadeIn();                         // chạy lồng generator
}
```

- `startCoroutine` chạy ngay tới `yield` đầu tiên (như Unity), trả về `Coroutine`.
- `stopCoroutine(co)`, `stopAllCoroutines()`. Coroutine cũng dừng khi component bị huỷ.
- Coroutine chạy sau `update`, trước `lateUpdate`.
- Chỉ chạy trong Play Mode (gọi ngoài Play Mode thì chỉ cảnh báo trong Console).

Kiểu trả về khi cần khai báo: `CoroutineGenerator`.

```ts
import { Time, Vector3, type CoroutineGenerator, type Transform } from '@pia/core';

function* moveTo(t: Transform, target: Vector3, duration: number): CoroutineGenerator {
  const from = t.position;
  for (let e = 0; e < duration; e += Time.deltaTime) {
    t.position = Vector3.lerp(from, target, e / duration);
    yield null;
  }
  t.position = target;
}
```

## Invoke

```ts
this.invoke('spawn', 2);                       // gọi this.spawn() sau 2 giây
this.invoke(() => this.explode(), 0.5);        // hoặc truyền hàm
const co = this.invokeRepeating('spawn', 1, 0.5);   // sau 1 giây, rồi mỗi 0.5 giây
this.stopCoroutine(co);                        // dừng invokeRepeating
```

## Time

| Thuộc tính | Ý nghĩa |
|---|---|
| `Time.deltaTime` | Thời gian frame trước (đã scale). Trong `fixedUpdate` bằng `fixedDeltaTime`. |
| `Time.time` | Thời gian (đã scale) từ khi bắt đầu chơi |
| `Time.unscaledDeltaTime`, `Time.unscaledTime` | Không bị `timeScale` ảnh hưởng |
| `Time.timeScale` | Hệ số tốc độ (0 = tạm dừng gameplay) |
| `Time.fixedDeltaTime` | Bước cố định (mặc định 0.02; đổi trong Project Settings → Fixed Timestep) |
| `Time.fixedTime` | Thời gian theo bước cố định |
| `Time.frameCount` | Số frame |
| `Time.timeSinceLevelLoad` | Thời gian từ khi scene hiện tại được nạp |
| `Time.realtimeSinceStartup` | Thời gian thực từ khi trang chạy |
| `Time.maximumDeltaTime` | Trần của `deltaTime` (mặc định 1/3 giây) |
| `Time.inFixedTimeStep` | `true` khi đang trong `fixedUpdate` |
