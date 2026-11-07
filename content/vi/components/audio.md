---
title: Audio
description: AudioSource, AudioListener, âm thanh 3D và chính sách autoplay của trình duyệt.
---

# Audio

Audio chạy trên Web Audio API.

## AudioSource

**Add Component → Audio → Audio Source** hoặc **GameObject → Audio → Audio Source**.

| Thuộc tính | Field | Mặc định | Mô tả |
|---|---|---|---|
| AudioClip | `clip` | | `AudioClip` — file audio (`.mp3`, `.ogg`, `.wav`, `.m4a`, `.aac`, `.flac`) |
| Mute | `mute` | `false` | |
| Play On Awake | `playOnAwake` | `true` | Tự phát khi component bật |
| Loop | `loop` | `false` | |
| Volume | `volume` | `1` | 0..1 |
| Pitch | `pitch` | `1` | -3..3 |
| Spatial Blend | `spatialBlend` | `0` | 0 = 2D, 1 = 3D (theo vị trí so với AudioListener) |
| Min Distance / Max Distance | `minDistance`, `maxDistance` | `1`, `500` | Dải suy giảm âm 3D |

```ts
const src = this.getComponent(AudioSource)!;
src.play();                 // phát (hoặc phát lại) clip; play(delay, offset)
src.pause(); src.unPause(); src.stop();
src.isPlaying; src.time;
src.playOneShot(this.jumpSound, 0.7);   // phát chồng một clip, không ngắt clip đang phát

// phát tại một điểm, không cần AudioSource (object tạm)
AudioSource.playClipAtPoint(this.pickupSound, this.transform.position, 0.8);
```

`playOneShot` / `playClipAtPoint` nhận `AudioClip` hoặc chuỗi GUID / đường dẫn (giá trị của field `@field({ assetType: 'audio' })` kiểu cũ vẫn dùng được).

## AudioClip

Giống `UnityEngine.AudioClip`: một file audio dùng làm field. Lưu bằng GUID; clip được scene / prefab tham chiếu sẽ được **nạp và giải mã trước khi scene chạy** (như "Preload Audio Data" của Unity), kể cả trước khi người dùng chạm vào màn hình — nên `length` dùng được ngay trong `start()`.

```ts Assets/Scripts/AudioManager.ts
import { AudioClip, AudioSource, MonoBehaviour, field } from '@pia/core';

export class AudioManager extends MonoBehaviour {
  @field([AudioClip]) clips: AudioClip[] = [];    // kéo nhiều file audio vào danh sách
  @field(AudioClip) music: AudioClip | null = null;
  private byName = new Map<string, AudioClip>();

  awake() {
    for (const c of this.clips) this.byName.set(c.name, c);   // name = tên file không đuôi
  }

  play(name: string, volume = 1) {
    this.getComponent(AudioSource)?.playOneShot(this.byName.get(name) ?? null, volume);
  }
}
```

| Thành viên | Ý nghĩa |
|---|---|
| `name`, `path`, `guid` | Tên file (không đuôi), đường dẫn, GUID |
| `length` | Thời lượng (giây); 0 khi chưa nạp |
| `samples`, `channels`, `frequency` | Số mẫu mỗi kênh, số kênh, tần số lấy mẫu |
| `isLoaded`, `await load()` | Đã nạp chưa / nạp (clip lấy lúc chạy bằng code) |
| `AudioClip.get(ref)`, `await AudioClip.load(ref)` | Lấy clip theo GUID hoặc đường dẫn (`'Assets/Audio/hit.wav'`) |
| `await Resources.load('Sounds/hit', AudioClip)` | Clip trong thư mục `Resources/` |

Mọi field trỏ tới cùng một file dùng chung một instance. Build chỉ đóng gói file audio được tham chiếu.

## AudioListener

Điểm "nghe" của âm 3D — đặt trên camera chính (**Add Component → Audio → Audio Listener**). Điều khiển toàn cục qua thuộc tính static:

```ts
AudioListener.volume = 0.5;   // âm lượng tổng
AudioListener.pause = true;   // tạm dừng mọi âm thanh (ví dụ menu pause)
```

## Autoplay của trình duyệt

Trình duyệt chỉ cho phát âm thanh **sau khi người dùng tương tác** (click, chạm, phím). Lệnh `play()` gọi trước đó được hoãn lại và tự phát ở tương tác đầu tiên; clip vẫn được nạp và giải mã sẵn từ trước. Đây là giới hạn của web, không phải lỗi của game.

::: tip Trong editor
Game view có nút **Mute Audio** để tắt tiếng khi test.
:::

## Ví dụ

```ts Assets/Scripts/PhysicsPlayer.ts
@field(AudioClip) jumpSound: AudioClip | null = null;

update() {
  // ...
  if (Input.getButtonDown('Jump') && this.isGrounded) {
    rb.velocity = new Vector3(rb.velocity.x, this.jumpSpeed, rb.velocity.z);
    if (this.jumpSound) this._audio?.playOneShot(this.jumpSound, 0.7);
  }
}
```

::: note Chưa hỗ trợ
Audio Mixer, hiệu ứng (reverb, filter), Audio Reverb Zone.
:::
