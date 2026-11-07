---
title: Inspector attributes
description: Decorator kiểu Odin Inspector — nút bấm, điều kiện, nhóm, thanh tiến trình, dropdown, kiểm tra giá trị, property drawer tuỳ biến.
---

# Inspector attributes (kiểu Odin)

Các decorator trong `@pia/core` để tuỳ biến Inspector ngay trong script: nút bấm, điều kiện ẩn / hiện, nhóm (box, foldout, tab, hàng ngang), thanh tiến trình, dropdown, kiểm tra giá trị… Dùng được cho **component**, **ScriptableObject**, class `@serializable` lồng nhau và **mảng**, kể cả khi chọn nhiều object cùng lúc.

- Decorator chỉ ghi **metadata** lên class; toàn bộ phần vẽ nằm trong editor, **không bao giờ vào bản build**.
- Attribute không đổi cách lưu dữ liệu: field nào được serialize vẫn như cũ (xem [Field & Inspector](fields.md)).
- Ví dụ đầy đủ: Demo2D — scene `Assets/Scenes/InspectorShowcase.scene.json`, script `Assets/Scripts/InspectorShowcase.ts`, `ShowcaseSettings.ts`, drawer tuỳ biến `Assets/Scripts/Editor/ShowcaseDrawers.tsx`.

```ts Assets/Scripts/Enemy.ts
import { MonoBehaviour, Vector2, boxGroup, button, field, minMaxSlider, progressBar, showIf, showInInspector, suffixLabel, tabGroup } from '@pia/core';

export class Enemy extends MonoBehaviour {
  @boxGroup('Stats') @progressBar(0, 100) health = 100;
  @boxGroup('Stats') @suffixLabel('m/s') speed = 4;

  @tabGroup('Combat') useShield = false;
  @tabGroup('Combat') @showIf('useShield') @field({ range: [0, 50] }) shield = 20;
  @tabGroup('Spawn') @minMaxSlider(0, 20) spawnRange = new Vector2(2, 8);

  @showInInspector get speedKmh() { return this.speed * 3.6; }   // chỉ hiển thị, không lưu

  @button('Heal') heal() { this.health = 100; }                   // chạy cả ở Edit Mode, có Undo
}
```

Decorator không tham số dùng được cả hai cách: `@readOnly` hoặc `@readOnly()`. Nhiều decorator trên cùng một member được áp dụng theo thứ tự từ trên xuống.

## Nút bấm

| Decorator | Tác dụng |
|---|---|
| `@button()`, `@button('Nhãn')`, `@button('Nhãn', { size, params, expanded, color })` | Hiện method thành nút. Bấm ở Edit Mode = **một bước Undo** (snapshot scene, hoặc asset với ScriptableObject), scene được đánh dấu đã sửa. Chạy cho mọi object đang chọn. Method `async` được chờ rồi Inspector tự cập nhật. `size`: `'small'` / `'medium'` / `'large'` / số pixel |

Tham số đơn giản tự có ô nhập (nút có mũi tên mở rộng): kiểu lấy từ giá trị mặc định (`count = 3` → số, `name = 'x'` → chuỗi, `on = true` → checkbox), hoặc khai báo: `@button('Spawn', { params: { count: 'int', prefab: { type: 'gameObject' }, tint: 'color' } })`.

```ts
@button('Spawn Stars', { size: 'large' })
spawnStars(count = 3, spacing = 1.5, prefix = 'Star'): void {
  // ...
}
```

## Điều kiện

| Decorator | Tác dụng |
|---|---|
| `@showIf(cond)` / `@hideIf(cond)` | Hiện / ẩn member |
| `@enableIf(cond)` / `@disableIf(cond)` | Cho sửa / làm mờ (không sửa được) |
| `@showIf('mode', 'Advanced')` | So sánh member với một giá trị (hoặc mảng giá trị: `['A', 'B']`) |
| `@readOnly` | Hiện nhưng không sửa được |
| `@disableInPlayMode`, `@disableInEditMode`, `@hideInPlayMode`, `@hideInEditMode` | Theo chế độ của editor |

`cond` là:

- Tên một member của object chứa field: field / getter (giá trị truthy? — object đã destroy, mảng rỗng tính là false) hoặc **method** (được gọi, kết quả truthy?). Thêm `!` để đảo: `'!isBoss'`.
- Hoặc callback `(target) => boolean` — `target` là component, ScriptableObject hoặc instance `@serializable` chứa field.

Khi chọn nhiều object: member chỉ hiện nếu điều kiện đúng với **tất cả**, bị làm mờ nếu sai với một object bất kỳ.

## Bố cục

| Decorator | Tác dụng |
|---|---|
| `@title('Tiêu đề', { subtitle, bold, horizontalLine })` | Tiêu đề phía trên member |
| `@infoBox('Thông báo', 'info' \| 'warning' \| 'error', visibleIf?)` | Hộp thông báo phía trên; `message` có thể là `(target) => string` |
| `@boxGroup('Đường/Dẫn', { label, showLabel })` | Khung có tiêu đề |
| `@foldoutGroup('Đường/Dẫn', { expanded })` | Nhóm thu gọn được (mặc định thu gọn) |
| `@tabGroup('Tab')` / `@tabGroup('Nhóm/Tab', 'Tên tab')` | Các tab; nhóm con trong tab: `'Nhóm/Tab/Tên tab/...'` |
| `@horizontalGroup('Đường/Dẫn', { width, labelWidth, title })` | Các member nằm cạnh nhau; `width` của member (px nếu > 1, tỉ lệ nếu ≤ 1); `labelWidth` (px) cho cả nhóm |
| `@propertyOrder(n)` | Thứ tự hiển thị (nhỏ trước, mặc định 0) |
| `@labelText('Nhãn')` | Đổi nhãn (hoặc `(target) => string`) |
| `@hideLabel` | Bỏ nhãn, ô nhập chiếm cả hàng; với class `@serializable`: hiện các field lồng tại chỗ, không có foldout |
| `@suffixLabel('m/s')` | Chữ sau ô nhập |
| `@indent` / `@indent(2)` | Thụt lề |

Đường dẫn nhóm lồng nhau bằng `/`: `@boxGroup('Settings')` + `@foldoutGroup('Settings/Movement')`. Nhóm nằm ở vị trí member đầu tiên của nó và tự ẩn khi mọi member bên trong bị ẩn. Thứ tự mặc định là thứ tự khai báo trong class (class cha trước).

## Giá trị

| Decorator | Dùng cho | Tác dụng |
|---|---|---|
| `@minMaxSlider(min, max, showFields?)` | `Vector2` (x = min, y = max) | Thanh trượt hai đầu + hai ô số |
| `@progressBar(min, max, { color, height, showValue })` | Số | Thanh tiến trình, kéo / bấm để đổi giá trị; `color` có thể là `(value) => string` |
| `@valueDropdown(list)` | Mọi kiểu | Chọn từ danh sách: mảng giá trị, mảng `{ text, value }`, tên member trả về danh sách, hoặc `(target) => list` |
| `@enumToggleButtons` | Field có `options`, boolean | Hàng nút bật / tắt thay cho dropdown |
| `@required` / `@required('Thông báo')` | Tham chiếu, chuỗi, asset | Hộp lỗi khi rỗng / `None` / Missing |
| `@validateInput(cond, 'Thông báo', type?)` | Mọi kiểu | `cond` = tên method `(value) => boolean \| string` hoặc `(value, target) => …`; `false` → hiện thông báo, chuỗi → hiện chuỗi đó |
| `@onValueChanged(method)` | Mọi kiểu | Gọi `target[method](value)` (hoặc `(target, value) => void`) sau mỗi lần sửa trong Inspector. Không gọi khi script tự đổi giá trị |
| `@previewField(size?)` | Asset sprite / texture | Ảnh xem trước lớn (mặc định 64 px) |
| `@inlineEditor` / `@inlineEditor({ expanded })` | ScriptableObject, component | Sửa luôn asset / component được tham chiếu ngay bên dưới |
| `@assetsOnly` / `@sceneObjectsOnly` | GameObject, component | Chỉ nhận prefab / chỉ nhận object trong scene |
| `@listDrawerSettings({ showIndexLabels, draggable, numberOfItemsPerPage, isReadOnly, hideAddButton, hideRemoveButton, expanded, showItemCount })` | Mảng | Nhãn phần tử, kéo thả đổi thứ tự (mặc định bật), phân trang |
| `@displayAsString` | Mọi kiểu | Hiện giá trị dạng chữ, chỉ đọc |

Attribute vẽ giá trị (`progressBar`, `previewField`, `valueDropdown`, drawer tuỳ biến…) đặt trên **mảng** áp dụng cho **từng phần tử**; attribute bố cục / điều kiện / kiểm tra áp dụng cho cả mảng.

## Giá trị không serialize

| Decorator | Tác dụng |
|---|---|
| `@showInInspector` | Hiện getter, field `_private` hoặc `@nonSerialized`. Getter không có setter → chỉ đọc; có setter / field thường → sửa được (không lưu vào scene, nhưng setter có thể đổi field được lưu — có Undo). Trong Play Mode giá trị cập nhật liên tục |
| `@showInInspector({ type: 'gameObject' })` | Chỉ định kiểu vẽ khi không đoán được (nhận các option như `@field`: `type`, `range`, `options`, `assetType`…) |

## Attribute tuỳ biến và property drawer

Giống `PropertyAttribute` + `CustomPropertyDrawer` của Unity:

```ts Assets/Scripts/Painter.ts
// Runtime — chỉ là metadata
import { Color, MonoBehaviour, field, inspectorAttribute } from '@pia/core';
import { Stat } from './Stat';

export const colorPalette = (...colors: string[]) => inspectorAttribute('colorPalette', { colors });

export class Painter extends MonoBehaviour {
  @colorPalette('#e74c3c', '#2ecc71', '#3498db') tint = new Color(1, 1, 1, 1);
  @field([Stat]) stats: Stat[] = [];
}
```

```tsx Assets/Scripts/Editor/PainterDrawers.tsx
// Editor — không vào bản build
import { defineEditorExtension, type PropertyDrawerProps } from '@pia/editor';
import { Color } from '@pia/core';
import { Stat } from '../Stat';

export default defineEditorExtension((ctx) => {
  // theo tên attribute
  ctx.registerPropertyDrawer('colorPalette', ({ attribute, setValue, row }: PropertyDrawerProps<Color>) =>
    row(attribute.colors.map((c: string) => <button key={c} style={{ flex: 1, background: c }} onClick={() => setValue(Color.fromHex(c))} />)),
  );
  // theo class (@serializable, ScriptableObject, component — kể cả class con)
  ctx.registerPropertyDrawer(Stat, ({ value, setValue, row }: PropertyDrawerProps<Stat>) => row(/* ... */));
});
```

| `PropertyDrawerProps` | Ý nghĩa |
|---|---|
| `field`, `attribute`, `label` | Thông tin field (`field.attributes` = mọi attribute), attribute của drawer, nhãn |
| `value`, `values`, `mixed` | Giá trị của object chọn sau cùng, giá trị của mọi object đang chọn, các giá trị có khác nhau không |
| `target`, `targets` | Object chứa field (component / ScriptableObject / instance struct) |
| `setValue(v, continuous?)` | Gán cho mọi object: một bước Undo, cập nhật Inspector, đánh dấu scene / lưu asset. Khi kéo: `beginEdit()` → `setValue(v, true)` nhiều lần → `endEdit()` |
| `row(children)` | Hàng Inspector chuẩn (nhãn bên trái, tooltip, tô đậm override của prefab, thụt lề) |
| `drawDefault()` | UI mặc định của field (cho drawer chỉ thêm thứ xung quanh) |
| `readOnly`, `depth` | Đang bị `@readOnly` / `@disableIf`…; độ sâu lồng |

Drawer của extension ghi đè drawer có sẵn cùng tên (`'progressBar'`, `'previewField'`, `'valueDropdown'`, `'enumToggleButtons'`, `'minMaxSlider'`, `'inlineEditor'`, `'displayAsString'`). Drawer bị lỗi chỉ hiện hộp lỗi tại field đó. Xem thêm [Editor extension](../packages/editor-extensions.md).

## Giới hạn

- Điều kiện theo tên chỉ tìm member của object chứa field (với field trong struct: chính instance struct). Cần dữ liệu của component cha thì dùng callback giữ tham chiếu.
- Tham số của `@button` lấy từ mã nguồn của method (tên + giá trị mặc định đơn giản); destructuring / rest parameter không hỗ trợ.
- Nút bấm trên ScriptableObject chỉ Undo được dữ liệu của asset đó.
- `@inlineEditor` với component trong prefab asset chỉ hiện thông báo (mở Prefab Mode để sửa). Lồng tối đa 4 cấp.
- Custom inspector (`ctx.registerInspector`) thay thế toàn bộ Inspector của component; `drawDefaultInspector()` vẽ đủ các attribute.
