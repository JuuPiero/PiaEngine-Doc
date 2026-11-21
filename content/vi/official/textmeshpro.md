---
title: TextMeshPro
description: Package com.pia.textmeshpro — chữ SDF sắc nét ở mọi cỡ với material / shader tuỳ biến (outline, bóng đổ, glow, bevel), rich text, Auto Size, font asset + Font Asset Creator, tiếng Việt, chữ UI, ô nhập liệu, dropdown.
---

# TextMeshPro — chữ SDF cho PiaEngine (`com.pia.textmeshpro`)

Chữ chất lượng cao cho PiaEngine theo kiểu **TextMeshPro** của Unity: chữ vẽ bằng **Signed Distance Field** (SDF) nên sắc nét ở mọi cỡ, mọi góc nhìn; mỗi chữ dùng một **Material + Shader** bình thường của engine (`.mat.json`) nên bạn chỉnh được viền (outline), bóng đổ (underlay), phát sáng (glow), nổi khối (bevel + ánh sáng), độ dày, độ mềm… ngay trong Inspector, hoặc **tự viết shader riêng**. Có đủ rich text, Auto Size, các chế độ tràn chữ, `textInfo` để làm hiệu ứng từng ký tự, sprite trong chữ, ô nhập liệu, dropdown, và **tiếng Việt có dấu** chạy sẵn.

Chạy trong scene **2D** (PixiJS) lẫn **3D** (three.js) và trong **UI Canvas**; trong editor, bản web và Playable Ads. Build nào không dùng TextMeshPro thì không chứa một byte nào của package.

Tên API giữ tên của TMP, viết camelCase theo kiểu PiaEngine: `TextMeshPro`, `TextMeshProUGUI`, `TMP_Text.text`, `setText`, `ForceMeshUpdate` → `forceMeshUpdate`, `fontSharedMaterial`, `textInfo.characterInfo`…

## Cài đặt

```bash
cd MyGame
npm install ../path/to/PiaEngine/pia-packages/com.pia.textmeshpro
```

Hoặc **Window → Package Manager → + → Add package from disk**.

Không cần “Import TMP Essential Resources”: package có sẵn font **Inter SDF** (giấy phép SIL OFL, xem `Runtime/Fonts/OFL.txt`) gồm ASCII, Latin-1, Latin Extended-A và **toàn bộ chữ tiếng Việt**, kèm một font dự phòng động lấy chữ từ font hệ thống (sans-serif) cho mọi ký tự khác (tiếng Trung, Nhật, Hàn, Thái, ký hiệu…).

## Bắt đầu nhanh

- **GameObject → 3D Object / 2D Object → Text - TextMeshPro**: chữ trong thế giới (như `TextMesh` nhưng đẹp hơn), có Order in Layer như SpriteRenderer.
- **GameObject → UI → Text - TextMeshPro**: chữ trong Canvas (thay cho `Text`), cùng **Input Field - TextMeshPro** và **Dropdown - TextMeshPro**.

```ts
import { MonoBehaviour } from '@pia/core';
import { TextMeshPro, TMP_Text } from 'com.pia.textmeshpro';

export class Hud extends MonoBehaviour {
  score = 0;
  start() {
    const title = this.getComponent(TextMeshPro)!;
    title.text = 'Xin chào <color=#ffcc00>thế giới</color>! <sprite name="coin">';
    title.fontMaterial.setFloat('_OutlineWidth', 0.2); // chỉ chữ này (bản sao material)
  }
  update() {
    // setText: không tạo chuỗi mới mỗi frame
    this.getComponent(TMP_Text)!.setText('Điểm: {0:000000}  Thời gian: {1:2}s', this.score, this.time);
  }
  time = 0;
}
```

> Cỡ chữ theo quy ước của TMP: với chữ trong thế giới (`TextMeshPro`), cỡ **10 ≈ 1 đơn vị** cho mỗi em; với chữ UI (`TextMeshProUGUI`), cỡ chữ tính bằng pixel của Canvas. Khung chữ của `TextMeshPro` là **Width / Height** (+ Pivot) trong Inspector, hoặc RectTransform nếu object có.

## Component

| Unity | PiaEngine | Ghi chú |
|---|---|---|
| `TextMeshPro` | `TextMeshPro` | chữ thế giới, 2D + 3D, `sortingOrder` |
| `TextMeshProUGUI` | `TextMeshProUGUI` | chữ UI: vẽ đúng thứ tự với Image / Text / con trong Canvas, `raycastTarget` (EventSystem, Button, link) |
| `TMP_Text` | `TMP_Text` | lớp chung của hai cái trên |
| `TMP_InputField` | `TMP_InputField` | gõ qua một `<input>` ẩn: bàn phím, **IME tiếng Việt (Telex / VNI), tiếng Trung / Nhật**, bàn phím điện thoại, copy / paste |
| `TMP_Dropdown` | `TMP_Dropdown` | danh sách dựng từ các object UI, `onValueChanged` |

### Thuộc tính chính của `TMP_Text`

| TMP | PiaEngine |
|---|---|
| `text`, `SetText(format, args)`, `SetCharArray` | `text`, `setText(format, a0…a7)` (`{0}`, `{0:2}` = 2 chữ số thập phân, `{0:000}` = đệm số 0), `setCharArray` |
| `font`, `fontSharedMaterial`, `fontMaterial` | giống hệt (`fontMaterial` = bản sao riêng, tạo lần đầu truy cập) |
| `fontSize`, `enableAutoSizing`, `fontSizeMin/Max` | giống; cỡ thực sau Auto Size: `currentFontSize` |
| `fontStyle` (`FontStyles.Bold \| Italic \| Underline \| Strikethrough \| LowerCase \| UpperCase \| SmallCaps`) | giống |
| `color`, `alpha`, `enableVertexGradient`, `colorGradient`, `colorGradientPreset`, `overrideColorTags` | giống (`VertexGradient`, asset `TMP_ColorGradient`) |
| `characterSpacing`, `wordSpacing`, `lineSpacing`, `paragraphSpacing` | giống (đơn vị em/100) |
| `alignment` (`TextAlignmentOptions`), `horizontalAlignment`, `verticalAlignment` | giống: Left / Center / Right / **Justified** / **Flush** / **Geometry**; Top / Middle / Bottom / **Baseline** / **Midline** (Geometry) / **Capline** |
| `textWrappingMode` / `enableWordWrapping` | giống (`Normal`, `NoWrap`…) |
| `overflowMode` | `Overflow`, `Ellipsis`, `Masking`, `Truncate`, `ScrollRect`, `Page` (+ `pageToDisplay`), `Linked` (+ `linkedTextComponent`) |
| `margin` | mảng `[trái, trên, phải, dưới]` |
| `maxVisibleCharacters / Words / Lines`, `firstVisibleCharacter` | giống — đổi mỗi frame (hiệu ứng máy đánh chữ) **không phải tính lại layout** |
| `isRightToLeftText`, `richText`, `parseCtrlCharacters`, `enableKerning`, `extraPadding` | giống |
| `textInfo`, `ForceMeshUpdate()`, `UpdateVertexData()` | `textInfo`, `forceMeshUpdate()`, `updateVertexData()` |
| `GetPreferredValues`, `preferredWidth/Height`, `renderedWidth/Height`, `textBounds`, `bounds` | giống |
| `isTextOverflowing`, `firstOverflowCharacterIndex`, `isTextTruncated` | giống |
| `TMPro_EventManager.TEXT_CHANGED_EVENT` | `TMPro_EventManager.TEXT_CHANGED_EVENT.add(fn)` |
| `TMP_TextUtilities.FindIntersectingCharacter / Link / Word`, `FindNearestCharacter` | camelCase; vị trí màn hình (gốc dưới-trái như `Input.mousePosition`) + camera |

## Rich text

`<b> <i> <u> <s>`, `<color=#rgb|#rrggbb|#rrggbbaa|red…>` / `<#ff8800>`, `<alpha=#80>`, `<size=36|+4|-4|150%|2em>`, `<font="Tên font asset">` (+ `material="…"`), `<material="Tên material">`, `<sprite=3>` / `<sprite name="coin">` / `<sprite="Tên sprite asset" index=1 tint=1 color=#f00>`, `<link="id">…</link>`, `<mark>` / `<mark=#ffff0060>`, `<sup> <sub>`, `<voffset=1em>`, `<cspace=0.1em>`, `<mspace=1em>`, `<indent=10%>`, `<line-indent=2em>`, `<line-height=120%>`, `<align=left|center|right|justified|flush>`, `<lowercase> <uppercase> <allcaps> <smallcaps>`, `<nobr>`, `<noparse>…</noparse>`, `<br>`, `<space=2em>`, `<pos=50%>`, `<width=60%>`, `<margin=5%>` / `<margin-left>` / `<margin-right>`, `<gradient="Tên preset">`, `<rotate=15>`, `<style="H1">` (style sheet), `<page>`, `<font-weight=700>`.

Thẻ không hợp lệ được hiện nguyên văn như TMP. Chuỗi gõ `\n`, `\t`, `é` được hiểu là ký tự điều khiển khi bật **Parse Escape Characters**. Chữ tiếng Việt gõ ở dạng tổ hợp (a + dấu rời) được chuẩn hoá về dạng dựng sẵn.

Font / material / sprite asset / gradient gọi bằng tên phải **được tải sẵn** (dùng ở đâu đó trong scene, nằm trong danh sách fallback…) hoặc nằm trong thư mục `Resources/` để bản build chứa chúng.

## Font Asset

Một font asset (`TMP_FontAsset`, file `*.asset.json`) gồm atlas SDF (ảnh PNG nằm ngay trong file), bảng glyph / ký tự, thông số mặt chữ (line height, ascender, descender, gạch chân…) và kerning.

**Window → TextMeshPro → Font Asset Creator** (như Unity):

- **Source Font File**: font trong project (`.ttf .otf .woff .woff2`) — hoặc gõ tên một **font hệ thống** (`sans-serif`, `Noto Sans JP`…).
- **Sampling Point Size**: Auto Sizing (cỡ lớn nhất còn vừa atlas) hoặc tự nhập.
- **Padding**: độ rộng vùng SDF (pixel hoặc % cỡ chữ; ~10 % là vừa). Padding càng lớn thì viền / glow / bóng đổ càng dày được.
- **Atlas Resolution**: 256…4096.
- **Character Set**: ASCII, Extended ASCII, **Vietnamese**, **Latin + Vietnamese**, chữ thường / hoa, số + ký hiệu, dải Unicode (hex: `20-7E, 1EA0-1EF9`), ký tự tự nhập, hoặc lấy các ký tự có trong một file text.
- **Render Mode**: SDFAA (nhanh), SDF (lấy mẫu 4× rồi thu nhỏ, mịn hơn), Bitmap (font pixel).
- **Atlas Population**: Static (chỉ các ký tự đã tạo) hoặc **Dynamic** — ký tự còn thiếu được vẽ thêm vào atlas **lúc chạy** từ file font gốc (hợp cho chat tiếng Việt / tiếng Trung…). Bản build sẽ chứa file font gốc khi asset là Dynamic.
- **Generate Font Atlas** → xem trước atlas + danh sách ký tự font không có → **Save As Font Asset**.

Nhanh hơn: chọn file font trong Project → **Assets → Create → TextMeshPro → Font Asset** (asset Dynamic, đã tạo sẵn Latin + tiếng Việt).

**Fallback**: mỗi font asset có `fallbackFontAssetTable`; không tìm thấy ký tự thì tìm lần lượt (đệ quy) trong các font đó, rồi trong **TMP Settings → Fallback Font Assets**, rồi font mặc định, rồi sprite asset theo mã ký tự (emoji); vẫn không có thì hiện ký tự thay thế (□). `TMP_FontAsset.createFontAsset('Noto Sans', …)` tạo font động từ font hệ thống ngay lúc chạy.

## Material và Shader (phần quan trọng nhất)

Material của chữ là **Material thường của engine** (`.mat.json`), dùng các shader dựng sẵn:

| Shader | Dùng cho |
|---|---|
| `TextMeshPro/Distance Field` | đầy đủ: Face (màu, texture + cuộn UV, Dilate, Softness), **Outline** (màu, texture, độ dày), **Underlay** (bóng đổ: màu, lệch X/Y, Dilate, Softness, Inner), **Lighting** (Bevel: độ nổi, offset, width, clamp, roundness, góc sáng, specular, diffuse, ambient), **Glow** (màu, offset, inner, outer, power), Weight Normal / Bold, Sharpness |
| `TextMeshPro/Distance Field Overlay` | như trên nhưng luôn vẽ đè lên (ZTest Always) — nhãn tên trong 3D |
| `TextMeshPro/Mobile/Distance Field` | rẻ: face + outline + underlay |
| `TextMeshPro/Bitmap` | font Bitmap |
| `TextMeshPro/Sprite` | sprite trong chữ (`<sprite>`) |

- Phần **material trong Inspector của TextMeshPro** hiện các thuộc tính theo nhóm Face / Outline / Underlay / Lighting / Glow (công tắc bật / tắt từng hiệu ứng), sửa là thấy ngay — cả trong Play Mode — có Undo và tự lưu vào file `.mat.json`. Material dùng chung (asset) thì mọi chữ dùng nó đổi theo; muốn riêng một chữ thì dùng `fontMaterial` trong script.
- **Material Preset**: nhiều material dùng chung atlas của một font (Outline, Drop Shadow, Glow…). Dropdown **Material Preset** trong Inspector liệt kê material TMP của font đó; nút **New Preset** lưu material đang xem thành một preset mới cạnh font asset. Thẻ `<material="Tên">` đổi preset giữa chừng câu.
- Font fallback vẽ bằng **hiệu ứng của material chính** (như Match Material Presets của TMP).

### Viết shader chữ của riêng bạn

Chép một shader ở trên vào file `.shader`, đổi tên và sửa hàm `frag`. Khối `GLSLPROGRAM` định nghĩa `vec4 frag(TMPInput i)` trả về màu (sRGB, alpha thường — không premultiply):

```glsl
struct TMPInput {
  vec2 uv;        // UV trong atlas (texture SDF là _MainTex)
  vec2 faceUV;    // UV cho texture mặt chữ (0..1 trên mỗi ký tự, theo Horizontal / Vertical Mapping)
  vec4 color;     // màu đỉnh: màu chữ × thẻ <color> × gradient
  float weight;   // 1 với chữ đậm
  vec3 position;  // vị trí trong không gian của object
  vec4 rect;      // ô của glyph trong atlas (u0, v0, u1, v1)
  float scale;    // số pixel màn hình trên một đơn vị SDF (bề rộng khử răng cưa = 1 / scale)
};
float tmpSample(vec2 uv);     // giá trị atlas (0.5 = mép chữ), kẹp trong ô của glyph
float tmpDistance(vec2 uv);   // khoảng cách có dấu: > 0 là bên trong, 1 đơn vị = _GradientScale pixel atlas
float tmpCoverage(float d, float edge, float scale, float softness);
vec4  tmpSprite(vec2 uv);     // texel sprite (shader cho sprite)
```

Uniform có sẵn: mọi Property của shader, `_MainTex_TexelSize`, `_GradientScale` (padding của font), `_Time` / `_SinTime` / `_CosTime` / `_ScreenParams`, `<texture>_ST` (`TRANSFORM_TEX(uv, _Tex)`). Viết kiểu HLSL (`float4`, `lerp`, `frac`…) cũng được. Dòng `Padding <pixel>` trong header nới rộng quad của glyph cho hiệu ứng vẽ ra ngoài chữ. Shader chỉ dùng được cho chữ khi khai báo `vec4 frag(TMPInput i)`; giữ dòng `Pipeline 2D` để engine không dùng nó cho mesh / sprite thường. Ví dụ đầy đủ: `examples/Demo2D/Assets/Samples/TextMeshProShowcase/Shaders/RainbowDissolve.shader` trong repo engine (cầu vồng chạy + hoà tan theo noise có viền cháy).

## Sprite Asset

`TMP_SpriteAsset` = các sprite của một sprite sheet (texture Multiple đã cắt bằng Sprite Editor) để chèn vào chữ: chọn texture → **Assets → Create → TextMeshPro → Sprite Asset**. Mỗi sprite có tên, mã Unicode (emoji: ký tự đó sẽ hiện sprite), scale, bearing, advance. Gán vào ô **Sprite Asset** của chữ (hoặc **TMP Settings → Default Sprite Asset**), rồi dùng `<sprite name="coin">`, `<sprite=2>`, `<sprite="Emoji" index=5>`. Sprite mặc định có màu gốc; `tint=1` (hoặc Tint All Sprites) nhân với màu chữ.

## Script: hiệu ứng từng ký tự

Lưới chữ nằm trong `textInfo.meshInfo[i]` dưới dạng **typed array** (không phải `Vector3[]` như Unity): `vertices` (3 số mỗi đỉnh), `colors32` (4 byte), `uvs0`, `uvs2`. Ký tự `c` (có `isVisible`) sở hữu 4 đỉnh `c.vertexIndex … +3` của `meshInfo[c.materialReferenceIndex]`.

```ts
export class Wave extends MonoBehaviour {
  private text!: TMP_Text;
  private orig: TMP_MeshInfo[] | null = null;
  private dirty = true;
  private onChanged = (t: TMP_Text) => { if (t === this.text) this.dirty = true; };
  start() { this.text = this.getComponent(TMP_Text)!; TMPro_EventManager.TEXT_CHANGED_EVENT.add(this.onChanged); }
  lateUpdate() {
    const ti = this.text.textInfo;
    if (this.dirty || !this.orig) { this.orig = ti.copyMeshInfoVertexData(); this.dirty = false; }
    for (let i = 0; i < ti.characterCount; i++) {
      const c = ti.characterInfo[i];
      if (!c.isVisible) continue;
      const src = this.orig[c.materialReferenceIndex].vertices, dst = ti.meshInfo[c.materialReferenceIndex].vertices;
      const dy = Math.sin(Time.time * 5 + i * 0.6) * 0.1;
      for (let k = 0; k < 4; k++) dst[(c.vertexIndex + k) * 3 + 1] = src[(c.vertexIndex + k) * 3 + 1] + dy;
    }
    this.text.updateVertexData();
  }
}
```

Có thêm `meshInfo.offsetQuad(vertexIndex, dx, dy)`, `setQuadColor(vertexIndex, r, g, b, a)`, `getVertex / setVertex`.

## Ô nhập liệu và Dropdown

- `TMP_InputField`: `text`, `characterLimit`, `contentType` (Standard, IntegerNumber, DecimalNumber, Alphanumeric, Name, EmailAddress, **Password**, Pin, Custom + `customValidation`), `lineType` (SingleLine, MultiLineSubmit, MultiLineNewline), `readOnly`, `caretBlinkRate`, `caretWidth`, `caretColor`, `selectionColor`, `onFocusSelectAll`, `restoreOriginalTextOnEscape`, sự kiện `onValueChanged / onEndEdit / onSubmit / onSelect / onDeselect`, `activateInputField()`, `caretPosition`, `selectionAnchorPosition / selectionFocusPosition`. Bấm / kéo chuột đặt con trỏ đúng theo layout của TMP; chữ dài một dòng tự cuộn ngang.
- `TMP_Dropdown`: `options` (`TMP_OptionData` text + image), `value`, `captionText`, `onValueChanged`, `show()`, `hide()`, `addOptions`, `clearOptions`, `setValueWithoutNotify`.

## TMP Settings

**Edit → Project Settings → TextMesh Pro** tạo / chọn `Assets/TextMesh Pro/Resources/TMP Settings.asset.json` (trong `Resources/` nên bản build luôn có): font mặc định, font fallback toàn cục, sprite asset / style sheet mặc định, ký tự thay thế khi thiếu glyph, mặc định cho chữ mới (cỡ, khung, word wrap, kerning…), quy tắc ngắt dòng CJK (ký tự không được đứng đầu / cuối dòng). Không có file thì dùng mặc định (font Inter SDF).

Asset khác: **Assets → Create → TextMeshPro → Color Gradient** (`<gradient>`, Color Gradient Preset), **Style Sheet** (`<style="H1">`), **Settings**.

## Kết hợp PiaTween

Nếu project có cả `com.pia.tween`, chữ TMP tự có `doText`, `doCounter`, `doColor`, `doFade`, `doBlendableColor` và **`doMaxVisibleCharacters`** (máy đánh chữ) — hai package không import nhau, build chỉ chứa tween khi game dùng tween. Trong TypeScript gọi qua kiểu nới lỏng, ví dụ `(label as any).doMaxVisibleCharacters(label.textInfo.characterCount, 2)`.

## Chuyển từ Text / TextRenderer

Menu ⋮ của component **Text** hoặc **TextRenderer** → **Convert To TextMeshPro** (giữ chữ, cỡ, màu, căn lề).

## Hiệu năng

- Layout + lưới chỉ tính lại khi có gì đổi (chữ, thuộc tính, font, khung, material ảnh hưởng tới padding). Chữ tĩnh: gần như **0 chi phí mỗi frame** và **không cấp phát bộ nhớ**; `setText` mỗi frame và `maxVisibleCharacters` cũng không cấp phát (kiểm tra bằng `Tests~/alloc.test.ts`).
- Chữ UI vẽ bằng một context WebGL2 dùng chung rồi chép vào canvas của phần tử — chỉ khi có thay đổi (hoặc khi material tự động theo `_Time`).
- Font Inter dựng sẵn (~258 KB, ~183 KB gzip) là một chunk riêng, chỉ tải khi có chữ dùng nó. Mã TMP trong build ≈ 160 KB (≈ 57 KB gzip).

## Giới hạn hiện tại

- Atlas một kênh (SDF). Chưa có MSDF, nên góc rất nhọn ở cỡ cực lớn hơi tròn; emoji màu hiện dạng một màu (dùng Sprite Asset cho emoji màu).
- Kerning lấy từ trình duyệt cho các cặp ASCII khi tạo font asset (không đọc bảng GPOS); không có ligature.
- Right-to-left là đảo thứ tự ký tự trên từng dòng (như `isRightToLeftText` của TMP), không phải shaping tiếng Ả Rập.
- UI: chỉ Canvas Screen Space - Overlay (như phần UI của engine); `Masking` cắt theo khung của chính chữ.
- Texture mặt chữ (`_FaceTex`) trong 2D và 3D có hướng V khác nhau.

## Tests

```powershell
node scripts/test-core.mjs "pia-packages/com.pia.textmeshpro/Tests~/textmeshpro.test.ts"   # parser, layout, overflow, auto size, tiếng Việt, SDF, PNG, tween
node scripts/test-core.mjs "pia-packages/com.pia.textmeshpro/Tests~/alloc.test.ts"         # không cấp phát mỗi frame
```

## Ví dụ

- `examples/Demo2D/Assets/Samples/TextMeshProShowcase` — preset Outline / Drop Shadow / Glow / Bevel, rich text + sprite, máy đánh chữ, sóng từng ký tự, shader tự viết, tiếng Việt, Auto Size + Ellipsis, UI: điểm số `setText`, link bấm được, chat có ô nhập, dropdown đổi preset.
- `examples/Demo3D/Assets/Samples/TextMeshPro3D` — nhãn tên luôn quay về camera, tiêu đề Bevel có ánh sáng, chữ nằm trên mặt đất.

Viết lại hoàn toàn từ tài liệu mô tả hành vi của TextMeshPro và các kỹ thuật SDF phổ biến; không dùng mã hay shader của Unity.
