---
title: Audio & Font
description: File âm thanh và font chữ trong project.
---

# Audio & Font

## Audio

Định dạng: `.mp3`, `.ogg`, `.wav`, `.m4a`, `.aac`, `.flac` (giải mã bằng Web Audio của trình duyệt — `.mp3` và `.wav` an toàn nhất trên mọi trình duyệt).

- Kéo file vào ô **AudioClip** của [AudioSource](../components/audio.md), hoặc field `@field({ assetType: 'audio' })` trong script.
- Clip được nạp và giải mã khi cần; bản build chỉ kèm clip được tham chiếu (hoặc nằm trong `Resources/`).

```ts
@field({ assetType: 'audio' }) hitSound = '';

onCollisionEnter() {
  this.getComponent(AudioSource)?.playOneShot(this.hitSound);
}
```

::: tip Playable ads
Nén audio trước khi đưa vào `Assets/` (mono, bitrate thấp) để giữ file playable dưới giới hạn của mạng quảng cáo.
:::

## Font

Định dạng: `.ttf`, `.otf`, `.woff`, `.woff2`.

- Kéo vào ô **Font** của UI [Text](../components/ui.md#text) hoặc [TextRenderer](../components/rendering-2d.md#textrenderer).
- Để trống = font mặc định của hệ thống (sans-serif).
- Font có đủ glyph tiếng Việt nếu muốn hiển thị chữ có dấu đẹp và đồng nhất trên mọi máy.
