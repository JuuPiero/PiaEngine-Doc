---
title: UI (Canvas)
description: Canvas, RectTransform, Image, Text, Button và EventSystem — UI kiểu uGUI của Unity.
---

# UI (Canvas)

UI theo mô hình **uGUI** của Unity: một `Canvas` chứa các phần tử con có `RectTransform`. UI được vẽ bằng **DOM overlay** phía trên game, anchor / pivot tính theo công thức của Unity, đơn vị là pixel canvas, trục Y hướng lên.

Tạo nhanh: **GameObject → UI → Canvas / Panel / Image / Text / Button**.

## Canvas

| Thuộc tính | Field | Mặc định | Mô tả |
|---|---|---|---|
| Render Mode | `renderMode` | `Screen Space - Overlay` | Hiện chỉ có chế độ Overlay |
| Sort Order | `sortingOrder` | `0` | Canvas có số lớn hơn vẽ trên |
| UI Scale Mode | `uiScaleMode` | `Scale With Screen Size` | `Constant Pixel Size` hoặc `Scale With Screen Size` (Canvas Scaler) |
| Scale Factor | `scaleFactor` | `1` | Khi Constant Pixel Size |
| Reference Resolution | `referenceResolution` | `1920 × 1080` | Khi Scale With Screen Size |
| Match (Width ↔ Height) | `matchWidthOrHeight` | `0.5` | 0 = theo chiều rộng, 1 = theo chiều cao |

## RectTransform

| Thuộc tính | Field | Mặc định |
|---|---|---|
| Anchor Min / Anchor Max | `anchorMin`, `anchorMax` | `(0.5, 0.5)` |
| Pivot | `pivot` | `(0.5, 0.5)` |
| Pos (Anchored) | `anchoredPosition` | `(0, 0)` |
| Size Delta | `sizeDelta` | `(160, 40)` |

```ts
const rt = this.getComponent(RectTransform)!;
rt.setAnchorPreset('top-right');      // top-left … bottom-right, middle-center, stretch
rt.anchoredPosition = new Vector2(-20, -20);
rt.rect;                              // { x, y, width, height } sau lần layout gần nhất
```

## Image

| Thuộc tính | Field | Mặc định | Mô tả |
|---|---|---|---|
| Source Image | `sprite` | | Sprite / texture (cả sprite con của sheet); trống = hình chữ nhật màu |
| Color | `color` | trắng | |
| Image Type | `type` | `Simple` | `Simple`: giãn cả ảnh. `Sliced`: 9-slice theo border của sprite (góc giữ nguyên). `Tiled`: góc giữ nguyên, cạnh và tâm lặp lại |
| Fill Center | `fillCenter` | `true` | (Sliced / Tiled) vẽ phần giữa |
| Pixels Per Unit Multiplier | `pixelsPerUnitMultiplier` | `1` | (Sliced / Tiled) tỉ lệ của viền: pixel border × (100 / PPU của sprite) × hệ số này = đơn vị canvas |
| Preserve Aspect | `preserveAspect` | `false` | Giữ tỉ lệ ảnh |
| Corner Radius | `cornerRadius` | `0` | Bo góc |
| Raycast Target | `raycastTarget` | `true` | Chặn click xuống game |

Border 9-slice đặt trong [Sprite Editor](../assets/sprite-editor.md) — dùng cho khung, nút, thanh máu giãn được mà không méo góc.

## Text

| Thuộc tính | Field | Mặc định |
|---|---|---|
| Text | `text` | `New Text` |
| Font | `font` | (mặc định) |
| Font Style | `fontStyle` | `Normal` (`Bold`, `Italic`, `Bold And Italic`) |
| Font Size | `fontSize` | `32` |
| Line Spacing | `lineSpacing` | `1.2` |
| Alignment | `alignment` | `Middle Center` (9 vị trí `Upper/Middle/Lower` × `Left/Center/Right`) |
| Color | `color` | xám đậm |
| Text Shadow | `shadow` | `false` |
| Raycast Target | `raycastTarget` | `false` |

```ts Assets/Scripts/ScoreKeeper.ts
private refresh() {
  const t = this.label?.getComponent(Text);
  if (t) t.text = `Stars ${this._score} / ${this._total}`;
}
```

## Button

Nút bấm, tô màu (Color Tint) cho `Image` trên cùng object.

| Thuộc tính | Field | Mặc định |
|---|---|---|
| Interactable | `interactable` | `true` |
| Normal / Highlighted / Pressed / Disabled Color | `normalColor`, `highlightedColor`, `pressedColor`, `disabledColor` | |
| On Click () | `onClick` | `PiaEvent` — cấu hình trong Inspector hoặc `addListener` |

```ts
this.getComponent(Button)?.onClick.addListener(() => Debug.log('Hello'));
```

Xem [Sự kiện (PiaEvent)](../scripting/events.md).

## EventSystem

```ts
if (Input.getMouseButtonDown(0) && !EventSystem.isPointerOverGameObject()) {
  // click vào game, không phải vào UI
}
```

`isPointerOverGameObject()` trả về `true` khi con trỏ đang ở trên phần tử UI có **Raycast Target**.

::: note
- Chưa có: Canvas World Space / Screen Space - Camera, layout group, ScrollRect, InputField, Toggle, Slider, Dropdown, Mask.
- Muốn viết UI bằng HTML + CSS (kiểu UI Toolkit của Unity): dùng package [UI Toolkit](../official/ui-toolkit.md).
- Chữ trong thế giới 2D/3D: dùng [TextRenderer](rendering-2d.md#textrenderer).
:::
