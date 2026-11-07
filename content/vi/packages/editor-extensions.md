---
title: Editor extension
description: Mở rộng editor bằng defineEditorExtension — menu, Inspector tuỳ biến, cửa sổ riêng.
---

# Editor extension

Script mở rộng editor (tương đương thư mục `Editor/`, `[MenuItem]`, custom `Editor` của Unity) đặt ở:

- `Assets/**/Editor/*.ts` (hoặc `.tsx`) trong project, hoặc
- entry `editor` (`Editor/index.ts`) của một package.

Code này **chỉ chạy trong editor** và không bao giờ vào bản build. Export mặc định là kết quả của `defineEditorExtension`:

```ts Assets/Editor/SceneTools.ts
import { defineEditorExtension } from '@pia/editor';
import { Color, MeshRenderer, SpriteRenderer } from '@pia/core';

/**
 * Scripts inside an "Editor" folder are editor-only (Unity convention):
 * they extend the editor and are excluded from game builds.
 */
export default defineEditorExtension((ctx) => {
  ctx.addMenuItem(
    'Tools/Randomize Colors',
    () => {
      ctx.recordUndo('Randomize Colors');
      for (const go of ctx.selection) {
        const c = new Color(Math.random(), Math.random(), Math.random(), 1);
        const mr = go.getComponent(MeshRenderer);
        if (mr) mr.color = c;
        const sr = go.getComponent(SpriteRenderer);
        if (sr) sr.color = c;
      }
      ctx.markSceneChanged();
    },
    { enabled: () => ctx.selection.length > 0 },
  );
});
```

Hàm extension có thể trả về một hàm dọn dẹp, được gọi trước khi extension được nạp lại (khi bạn sửa file).

## API `ctx`

| Thành viên | Ý nghĩa |
|---|---|
| `addMenuItem(path, action, options?)` | Thêm mục menu. Phần đầu của `path` là menu cấp 1 (`'Tools/My Tool/Run'`). `options.shortcut` (chỉ hiển thị), `options.enabled` (trả `false` để làm mờ). Mục đặt dưới `'Assets/Create/...'` cũng hiện trong menu **Create** của cửa sổ Project |
| `registerInspector(componentName, ui)` | Thay Inspector mặc định của một component (theo tên đăng ký) bằng React component |
| `registerWindow(id, title, ui)` | Thêm cửa sổ dock được, mở từ **Window → Extensions** |
| `registerSceneGizmo(componentName, draw, options?)` | Vẽ gizmo / handle trong Scene view — xem [bên dưới](#gizmo-va-handle-trong-scene-view) |
| `registerPropertyDrawer(target, drawer)` | Vẽ field theo attribute hoặc class (như `CustomPropertyDrawer`) — xem [Inspector attributes](../scripting/inspector-attributes.md#attribute-tuy-bien-va-property-drawer) |
| `scene` | Scene đang hiển thị (bản Play Mode khi đang chơi) |
| `selection`, `select(objects)` | GameObject đang chọn / đổi vùng chọn |
| `isPlaying` | Đang ở Play Mode |
| `projectSettings` | Nội dung `pia.project.json` (chỉ đọc) |
| `selectedAsset`, `selectAsset(path)` | Asset đang chọn trong Project (đường dẫn hoặc `null`) / chọn asset (hiện trong Inspector) |
| `currentAssetFolder` | Thư mục mà asset mới sẽ được tạo vào (thư mục đang chọn / đang mở trong Project) |
| `writeAsset(path, content)` | Ghi file text vào project (`'Assets/...'`), làm mới asset database, trả về GUID (hoặc `null`). Ghi đè nếu đã có |
| `openInCodeEditor(path)` | Mở file của project bằng code editor ngoài (VS Code…) |
| `build({ target?, run? })` | Build project (`target` = `'web'` hoặc id platform của package) |
| `openBuildSettings()` | Mở Build Settings |
| `reveal(projectPath)` | Mở file / thư mục trong trình quản lý file của hệ điều hành |
| `recordUndo(label)` | Chụp trạng thái scene để thay đổi kế tiếp undo được |
| `markSceneChanged()` | Báo scene đã đổi (làm mới Hierarchy / Inspector, đánh dấu chưa lưu) |
| `log(...args)` | Ghi ra Console |

Ví dụ tạo asset từ menu:

```ts
ctx.addMenuItem('Assets/Create/My Game/Level Data', async () => {
  const path = `${ctx.currentAssetFolder}/New Level.json`;
  const guid = await ctx.writeAsset(path, JSON.stringify({ waves: [] }, null, 2));
  if (guid) ctx.selectAsset(path);
});
```

::: tip Quy tắc Undo
Gọi `ctx.recordUndo('Tên')` **trước** khi sửa, `ctx.markSceneChanged()` **sau** khi sửa — một lần cho cả thao tác.
:::

## Inspector tuỳ biến

```tsx Assets/Editor/RotatorInspector.tsx
import { defineEditorExtension, type InspectorProps } from '@pia/editor';
import { Vector3 } from '@pia/core';
import type { Rotator } from '../Scripts/Rotator';

function RotatorInspector({ component, onChange, recordUndo }: InspectorProps<Rotator>) {
  return (
    <div style={{ padding: 8 }}>
      <div>Speed: {component.speed.toString()}</div>
      <button
        onClick={() => {
          recordUndo('Reset Speed');
          component.speed = new Vector3(0, 90, 0);
          onChange();
        }}
      >
        Reset speed
      </button>
    </div>
  );
}

export default defineEditorExtension((ctx) => {
  ctx.registerInspector<Rotator>('Rotator', RotatorInspector);
});
```

`InspectorProps`: `component` (component đang sửa), `recordUndo(label)` (gọi trước khi sửa), `onChange()` (gọi sau khi sửa), `drawDefaultInspector()` (vẽ danh sách field mặc định, kể cả [Inspector attributes](../scripting/inspector-attributes.md) — như `DrawDefaultInspector` của Unity, để thêm UI quanh nó):

```tsx
function RotatorInspector({ component, onChange, recordUndo, drawDefaultInspector }: InspectorProps<Rotator>) {
  return (
    <>
      {drawDefaultInspector?.()}
      <button onClick={() => { recordUndo('Reset Speed'); component.speed = new Vector3(0, 90, 0); onChange(); }}>Reset speed</button>
    </>
  );
}
```

## Cửa sổ riêng

```tsx Assets/Editor/StatsWindow.tsx
import { defineEditorExtension } from '@pia/editor';

function StatsWindow() {
  return <div style={{ padding: 8 }}>Hello from my window</div>;
}

export default defineEditorExtension((ctx) => {
  ctx.registerWindow('stats', 'Stats', StatsWindow);
});
```

Mở bằng **Window → Extensions → Stats**.

## Gizmo và handle trong Scene view

Giống `OnDrawGizmos` / `Handles` / `OnSceneGUI` của Unity, chạy cả Scene view 2D lẫn 3D. Mỗi frame editor gọi hàm vẽ của bạn; thứ vẽ ra chỉ tồn tại trong frame đó. Mọi vị trí là **world space**; gizmo vẽ đè lên scene (không bị che).

```ts Assets/Editor/PatrolGizmos.ts
import { defineEditorExtension } from '@pia/editor';
import type { Patrol } from '../Scripts/Patrol';

export default defineEditorExtension((ctx) => {
  ctx.registerSceneGizmo<Patrol>('Patrol', (g, patrol, { selected }) => {
    g.polyline(patrol.points, true, { color: '#4af', width: 2 });
    if (!selected) return;
    patrol.points.forEach((p, i) => {
      const moved = g.freeMoveHandle(`p${i}`, p);      // hoặc g.positionHandle(...) có mũi tên X/Y/Z
      if (!moved.equals(p)) patrol.points[i] = moved;  // mỗi lần kéo = một bước Undo, Ctrl snap 0.25
    });
    if (g.shortcut('Delete')) { /* ... */ }
  }, { always: true });                                 // always: vẽ cả khi object không được chọn
});
```

Hàm vẽ nhận `(gizmos, component, { selected, active })`. Mặc định chỉ chạy cho object đang chọn; `{ always: true }` để vẽ cho mọi object.

| Nhóm | API của `gizmos` |
|---|---|
| Vẽ | `line(from, to, style?)`, `polyline(points, closed?, style?)`, `bezier(p0, c0, c1, p3, style?)`, `circle(center, radius, normal?, style?)`, `disc(...)`, `arrow(from, to, style?)`, `dot(pos, size?, style?)`, `label(pos, text, style?)`, `screenText(x, y, text, style?)` |
| Handle (trả về giá trị mới khi đang kéo) | `freeMoveHandle(id, pos, options?)`, `positionHandle(id, pos, options?)` (mũi tên X/Y/Z như Move tool), `button(id, pos, options?)` (true ở frame được click) |
| Input | `isHovered(id)`, `isDragging(id)`, `pressed(id)`, `clicked(id)`, `sceneClick(id, filter?)` (nhận click vào chỗ trống, ví dụ <kbd>Shift</kbd>+click; click đã nhận không chọn object), `shortcut(key)` (ví dụ `'Delete'`, `'Escape'`) |
| Khác | `is2D`, `selected`, `color` (màu mặc định), `hideTools()` (ẩn transform tool frame này), `pointer`, `worldToScreen(pos)`, `screenToRay(x, y)`, `pixelSize(pos)` (kích thước world của 1 pixel), `pointerDistance(points)` |

- `style`: `color` (chuỗi CSS, `0xRRGGBB` hoặc `Color`), `width`, `alpha`, `dashed`; chữ có thêm `size`, `offset`, `align`, `bold`.
- Handle `options`: `size`, `shape` (`circle` / `square` / `diamond`), `snap` (mặc định 0.25; 0 = tắt), `undoLabel`, `planeNormal`, `hoverColor`. Id của handle chỉ cần duy nhất trong một component.
- Editor tự ghi **một bước Undo cho mỗi lần kéo** và làm mới Inspector.

### `onDrawGizmos` trong component

Component cũng tự vẽ được bằng method `onDrawGizmos()` (vẽ mọi lúc) / `onDrawGizmosSelected()` (chỉ khi object được chọn), dùng `Gizmos` và `Handles` tĩnh của `@pia/core` như Unity. Chỉ chạy trong Scene view của editor; bản build không gọi các method này.

```ts Assets/Scripts/Sensor.ts
import { Color, Gizmos, Handles, MonoBehaviour, Vector3 } from '@pia/core';

export class Sensor extends MonoBehaviour {
  radius = 3;
  target = new Vector3(4, 0, 0);

  onDrawGizmos() {
    Gizmos.color = Color.yellow;
    Gizmos.drawWireSphere(this.transform.position, this.radius);
    Handles.label(this.transform.position, `Sensor ${this.radius}m`);
  }

  onDrawGizmosSelected() {
    Gizmos.color = Color.red;
    Gizmos.drawLine(this.transform.position, this.target);
    this.target = Handles.positionHandle(this.target);   // kéo được, mỗi lần kéo là một bước Undo
  }
}
```

| API | Hàm |
|---|---|
| `Gizmos` | `color`, `matrix` (Matrix4 áp lên mọi điểm), `drawLine`, `drawRay`, `drawLineStrip`, `drawLineList`, `drawWireSphere`, `drawSphere`, `drawWireCube`, `drawCube`, `isDrawing` |
| `Handles` | `color`, `label(position, text, { size, bold, color })`, `drawLine`, `drawDottedLine`, `drawPolyLine`, `drawWireDisc`, `drawSolidDisc`, `drawArrow`, `positionHandle(position, rotation?)`, `freeMoveHandle(position, size?, snap?)`, `button(position, size?)` |

`Gizmos.color`, `Handles.color` và `Gizmos.matrix` được đặt lại cho mỗi component. Method vẫn nhận tham số `gizmos` (API `SceneGizmos` ở trên, `import type { SceneGizmos } from '@pia/editor'`) nếu cần thêm hình như `dot` hay `screenText`.

Ví dụ đầy đủ: `pia-packages/com.pia.spline/Editor/SplineGizmos.ts` (kéo knot / tangent, `positionHandle`, Shift+click bằng `sceneClick`, `shortcut('Delete')`, `hideTools()`) — xem [Spline](../official/spline.md).

## Property drawer

`ctx.registerPropertyDrawer(target, drawer)` vẽ field theo **tên attribute** (`inspectorAttribute('colorPalette')`, hoặc ghi đè drawer có sẵn như `'progressBar'`) hoặc theo **class** (`@serializable`, ScriptableObject, component). Chi tiết và `PropertyDrawerProps`: [Inspector attributes](../scripting/inspector-attributes.md#attribute-tuy-bien-va-property-drawer).
