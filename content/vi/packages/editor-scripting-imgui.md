---
title: Editor scripting (IMGUI)
description: Viết EditorWindow, custom Inspector, PropertyDrawer, MenuItem kiểu Unity (OnGUI) — và OnGUI trong game.
---

# Editor scripting kiểu Unity (IMGUI)

Ngoài [`defineEditorExtension`](editor-extensions.md) (React), PiaEngine có API **IMGUI giống hệt Unity**: viết `onGUI()` gọi `GUILayout.button(...)`, `EditorGUILayout.floatField(...)` mỗi lần vẽ, nhận lại giá trị mới — không cần React, không cần giữ state giao diện. Code Unity chuyển sang gần như dòng-đối-dòng, chỉ đổi tên sang **camelCase**.

| Unity (C#) | PiaEngine (TypeScript) |
|---|---|
| `[MenuItem("Tools/My Tool %#t")]` | `@menuItem('Tools/My Tool %#t')` trên method `static` |
| `class MyWindow : EditorWindow` + `GetWindow<MyWindow>()` | `class MyWindow extends EditorWindow` + `EditorWindow.getWindow(MyWindow, 'Title')` |
| `[CustomEditor(typeof(Spawner))]` + `[CanEditMultipleObjects]` | `@customEditor(Spawner)` + `@canEditMultipleObjects` |
| `OnInspectorGUI`, `DrawDefaultInspector`, `OnSceneGUI` | `onInspectorGUI`, `drawDefaultInspector`, `onSceneGUI` |
| `[CustomPropertyDrawer(typeof(Range))]` + `PropertyDrawer.OnGUI` | `@customPropertyDrawer(FloatRange)` / `@customPropertyDrawer('minMaxRange')` + `onGUI(position, property, label)` |
| `GUILayout.Button`, `EditorGUILayout.IntSlider`, `EditorGUI.BeginChangeCheck` | `GUILayout.button`, `EditorGUILayout.intSlider`, `EditorGUI.beginChangeCheck` |
| `using (new EditorGUILayout.HorizontalScope())` | `GUILayout.beginHorizontal()` / `endHorizontal()` (hoặc `GUILayout.horizontal(() => …)`) |
| `SerializedObject`, `FindProperty`, `ApplyModifiedProperties` | `SerializedObject`, `findProperty`, `applyModifiedProperties` |
| `Undo.RecordObject`, `Undo.RegisterCreatedObjectUndo` | `Undo.recordObject`, `Undo.registerCreatedObjectUndo` |
| `EditorUtility.DisplayDialog` (đồng bộ) | `await EditorUtility.displayDialog(...)` (Promise) |
| `[ContextMenu("Reset")]`, `MenuItem("CONTEXT/Rigidbody/…")` | `@contextMenu('Reset')`, `@menuItem('CONTEXT/Rigidbody/…')` |
| `MonoBehaviour.OnGUI` | `onGUI()` trên component (vẽ đè lên game) |

## Đặt script ở đâu

Như Unity: script trong thư mục **`Editor`** (`Assets/**/Editor/*.ts`) hoặc entry `Editor/` của package là **editor-only** — editor nạp, bản build bỏ qua. Class phải được **`export`** (editor tìm `@menuItem`, `EditorWindow`, `@customEditor`, `@customPropertyDrawer` theo export, giống cách tìm component). Sửa script → editor nạp lại, cửa sổ đang mở giữ nguyên dữ liệu.

## EditorWindow

```ts Assets/Scripts/Editor/LevelTools.ts
import { Color, GUILayout, GUILayoutUtility, GameObject, SpriteRenderer, Vector2 } from '@pia/core';
import { EditorGUILayout, EditorWindow, GenericMenu, Selection, Undo, menuItem } from '@pia/editor';

enum Layout { Grid, Line }

export class LevelTools extends EditorWindow {
  // field thường (số, chuỗi, bool, Vector2, mảng) được giữ khi reload script và khi mở lại editor
  prefix = 'Tile';
  count = 6;
  layout = Layout.Grid;
  tint = new Color(0.35, 0.75, 1, 1);
  template: GameObject | null = null;
  scroll = new Vector2();

  @menuItem('Tools/Level Tools/Open Window %#l')      // Ctrl+Shift+L
  static open() {
    EditorWindow.getWindow(LevelTools, 'Level Tools');
  }

  onSelectionChange() {
    this.repaint();
  }

  onGUI() {
    this.prefix = EditorGUILayout.textField('Name Prefix', this.prefix);
    this.count = EditorGUILayout.intSlider('Count', this.count, 1, 64);
    this.layout = EditorGUILayout.enumPopup('Layout', this.layout, Layout);
    this.tint = EditorGUILayout.colorField('Tint', this.tint);
    this.template = EditorGUILayout.objectField('Template', this.template, GameObject, true);

    GUILayout.beginHorizontal();
    GUILayout.flexibleSpace();
    if (GUILayout.button('Create', GUILayout.width(110))) this.create();
    if (GUILayout.button('More ▾', GUILayout.width(70))) {
      const menu = new GenericMenu();
      menu.addItem('Layout/Grid', this.layout === Layout.Grid, () => (this.layout = Layout.Grid));
      menu.addItem('Layout/Line', this.layout === Layout.Line, () => (this.layout = Layout.Line));
      menu.dropDown(GUILayoutUtility.getLastRect());
    }
    GUILayout.endHorizontal();

    this.scroll = EditorGUILayout.beginScrollView(this.scroll);
    for (const go of Selection.gameObjects) GUILayout.label(go.name);
    EditorGUILayout.endScrollView();
  }

  private create() {
    for (let i = 0; i < this.count; i++) {
      const go = new GameObject(`${this.prefix} ${i + 1}`);
      go.addComponent(SpriteRenderer).color = this.tint.clone();
      Undo.registerCreatedObjectUndo(go, 'Create Tiles');   // các lần gọi liên tiếp = một bước Undo
    }
  }
}
```

![Cửa sổ Level Tools (EditorWindow IMGUI) nổi trên Scene view, tab Selection liệt kê object vừa tạo](/images/imgui-level-tools.png)

- Mở: `EditorWindow.getWindow(Type, title)` (một cửa sổ cho mỗi class, mở dạng nổi — kéo vào dock được), `createWindow(Type)` (thêm cửa sổ mới), `showTab()` (mở cạnh Inspector). Cửa sổ cũng nằm trong **Window ▸ Extensions**.
- Thuộc tính / lệnh: `titleContent`, `position`, `minSize`, `wantsMouseMove`, `autoRepaintOnSceneChange`, `hasFocus`, `show`, `focus`, `close`, `repaint`, `showNotification`.
- Message: `onGUI`, `onEnable`, `onDisable`, `onDestroy`, `onFocus`, `onLostFocus`, `onSelectionChange`, `onHierarchyChange`, `onProjectChange`, `onInspectorUpdate` (10 lần/giây), `update` (mỗi frame).

## Menu

```ts
@menuItem('Tools/Level Tools/Reset Rotation &r', false, 30)   // Alt+R, priority 30
static resetRotation() { … }

@menuItem('Tools/Level Tools/Reset Rotation &r', true)        // validate: false = mục bị xám
static canResetRotation() { return Selection.gameObjects.length > 0; }

@menuItem('CONTEXT/Spinner/Double Speed')                     // menu ⋮ của component Spinner
static doubleSpeed(cmd: MenuCommand) {
  const s = cmd.context as Spinner;
  Undo.recordObject(s, 'Double Speed');
  s.speed *= 2;
}
```

- Phím tắt sau dấu cách: `%` Ctrl (Cmd), `#` Shift, `&` Alt, `_` không phím phụ (`_F5`); phím đặc biệt `LEFT`, `RIGHT`, `UP`, `DOWN`, `HOME`, `END`, `PGUP`, `PGDN`, `DEL`, `TAB`, `SPACE`. Phím tắt chạy khi không đang gõ trong ô chữ.
- `priority` sắp thứ tự trong menu; hai mục liền nhau cách nhau hơn 10 thì có vạch ngăn.
- `Assets/Create/...` hiện cả trong menu **Create** của cửa sổ Project.
- Trên component (script runtime): `@contextMenu('Randomize Tint')` trên method → mục trong menu ⋮ của component, chạy cho mọi object đang chọn, một bước Undo.

## Custom Inspector (Editor)

```ts Assets/Scripts/Editor/WaveSpawnerEditor.ts
import { Color, GUILayout, Handles, Vector3 } from '@pia/core';
import { Editor, EditorGUI, EditorGUILayout, EditorStyles, MessageType, Undo, canEditMultipleObjects, customEditor } from '@pia/editor';
import { WaveSpawner } from '../WaveSpawner';

@customEditor(WaveSpawner)
@canEditMultipleObjects
export class WaveSpawnerEditor extends Editor {
  onInspectorGUI() {
    this.serializedObject.update();
    this.drawDefaultInspector();                          // danh sách field mặc định (cả group, nút, drawer)

    const radius = this.serializedObject.findProperty('radius')!;
    EditorGUI.beginChangeCheck();
    EditorGUI.showMixedValue = radius.hasMultipleDifferentValues;   // "—" khi các object khác nhau
    const r = EditorGUILayout.slider('Ring Radius', radius.floatValue, 0.5, 10);
    EditorGUI.showMixedValue = false;
    if (EditorGUI.endChangeCheck()) radius.floatValue = r;

    EditorGUILayout.helpBox('Spawn Ring tạo object con.', MessageType.Info);
    if (GUILayout.button('Spawn Ring')) {
      for (const s of this.targets as WaveSpawner[]) for (const go of s.spawnRing()) Undo.registerCreatedObjectUndo(go, 'Spawn Ring');
    }
    this.serializedObject.applyModifiedProperties();      // một bước Undo, scene được đánh dấu đã sửa
  }

  onSceneGUI() {                                          // khi object được chọn: Handles trong Scene view
    const s = this.target as WaveSpawner;
    Handles.color = new Color(1, 0.8, 0.3, 1);
    Handles.drawWireDisc(s.transform.position, new Vector3(0, 0, 1), s.radius);
  }
}
```

![Inspector của WaveSpawner: phần mặc định (có drawer Min/Max và thanh min-max) + phần Spawner Tools vẽ bằng IMGUI; Scene view vẽ vòng tròn của onSceneGUI](/images/imgui-custom-inspector.png)

## SerializedObject / SerializedProperty

- `new SerializedObject(target | targets[])` trên component, ScriptableObject hoặc object `@serializable`; trong Editor dùng sẵn `this.serializedObject`.
- `findProperty('speed')`, `findProperty('waves.Array.data[0].count')` (hoặc `'waves[0].count'`), `findPropertyRelative('min')`, duyệt bằng `getIterator()` + `nextVisible(enterChildren)`.
- Giá trị: `intValue`, `floatValue`, `boolValue`, `stringValue`, `colorValue`, `vector2Value`, `vector3Value`, `objectReferenceValue`, `enumValueIndex` / `enumNames`, `value` (bất kỳ); mảng: `isArray`, `arraySize`, `getArrayElementAtIndex`, `insertArrayElementAtIndex`, `deleteArrayElementAtIndex`, `moveArrayElement`, `clearArray`; thông tin: `propertyType`, `propertyPath`, `displayName`, `tooltip`, `fieldInfo`, `isExpanded`, `hasMultipleDifferentValues`.
- Thay đổi chờ tới `applyModifiedProperties()` → một bước Undo + `onValidate` + scene "đã sửa" (ScriptableObject: tự lưu file). `update()` bỏ thay đổi chưa áp dụng.
- `EditorGUILayout.propertyField(prop)` vẽ đúng ô của Inspector mặc định; field mảng / class lồng nhau / có attribute kiểu Odin / có drawer React dùng chính widget của Inspector và áp dụng ngay (có Undo).

## PropertyDrawer

```ts Assets/Scripts/Editor/FloatRangeDrawers.ts
@customPropertyDrawer(FloatRange)                 // mọi field kiểu FloatRange (@serializable)
export class FloatRangeDrawer extends PropertyDrawer {
  onGUI(position: Rect, property: SerializedProperty, label: GUIContent) {
    const r = EditorGUI.prefixLabel(position, label);
    EditorGUIUtility.labelWidth = 34;
    const half = (r.width - 4) / 2;
    const min = property.findPropertyRelative('min')!;
    const max = property.findPropertyRelative('max')!;
    min.floatValue = EditorGUI.floatField(new Rect(r.x, r.y, half, r.height), 'Min', min.floatValue);
    max.floatValue = EditorGUI.floatField(new Rect(r.x + half + 4, r.y, half, r.height), 'Max', max.floatValue);
  }
}

@customPropertyDrawer('minMaxRange')              // field có attribute minMaxRange
export class MinMaxRangeDrawer extends PropertyDrawer {
  onGUI(position: Rect, property: SerializedProperty, label: GUIContent) {
    const a = this.attribute as unknown as { min: number; max: number };
    const min = property.findPropertyRelative('min')!, max = property.findPropertyRelative('max')!;
    const v = EditorGUI.minMaxSlider(position, label, min.floatValue, max.floatValue, a.min, a.max);
    min.floatValue = v.min;
    max.floatValue = v.max;
  }
}
```

Attribute được khai báo trong script runtime: `export const minMaxRange = (min: number, max: number) => inspectorAttribute('minMaxRange', { min, max });` rồi `@minMaxRange(0, 10) spawnDistance = new FloatRange(2, 6);`. Drawer cao hơn một dòng thì override `getPropertyHeight(property, label)`.

## Các control

- **`GUI` / `GUILayout`** (`@pia/core`): `label`, `box`, `button`, `repeatButton`, `toggle`, `textField`, `passwordField`, `textArea`, `horizontalSlider`, `verticalSlider`, `toolbar`, `selectionGrid`, `drawTexture`; layout `beginHorizontal` / `beginVertical` / `beginScrollView` / `beginArea`, `space`, `flexibleSpace`, option `GUILayout.width / height / minWidth / maxWidth / minHeight / maxHeight / expandWidth / expandHeight`; `GUI.beginGroup`, `GUI.window` + `GUI.dragWindow`; trạng thái `GUI.changed`, `GUI.enabled`, `GUI.color`, `GUI.backgroundColor`, `GUI.contentColor`; focus `GUI.setNextControlName`, `GUI.focusControl`, `GUI.getNameOfFocusedControl`.
- **`EditorGUILayout` / `EditorGUI`** (`@pia/editor`): `labelField`, `selectableLabel`, `textField`, `delayedTextField`, `textArea`, `passwordField`, `intField`, `floatField`, `slider`, `intSlider`, `minMaxSlider`, `toggle`, `toggleLeft`, `popup`, `intPopup`, `enumPopup`, `maskField`, `enumFlagsField`, `layerField`, `tagField`, `colorField`, `vector2Field`, `vector3Field`, `vector4Field`, `rectField`, `curveField`, `objectField`, `foldout`, `beginFoldoutHeaderGroup`, `beginToggleGroup`, `helpBox`, `progressBar`, `propertyField`, `prefixLabel`, `space`, `separator`, `getControlRect`, `drawRect`; `beginChangeCheck` / `endChangeCheck`, `beginDisabledGroup` / `endDisabledGroup`, `indentLevel`, `showMixedValue`.
- **`objectField(label, value, type, allowSceneObjects)`**: `type` = `GameObject`, class component, class ScriptableObject, hoặc tên loại asset (`'texture'`, `'sprite'`, `'prefab'`, `'material'`, `'audio'`...; giá trị là GUID). Có nút chọn ⊙, kéo-thả từ Project / Hierarchy, click = ping như Inspector.
- **`curveField`**: giá trị `{ keys: Keyframe[] }` (hoặc mảng key); bấm để mở trình sửa: kéo key, double-click thêm, chuột phải xoá.
- **Sự kiện thô**: `Event.current` (`type`, `mousePosition`, `button`, `clickCount`, `keyCode`, `character`, `shift` / `control` / `alt`, `use()`, `getTypeForControl(id)`), `GUIUtility.getControlID`, `hotControl`, `keyboardControl` — viết control riêng như Unity (`MouseDown` → `hotControl = id`, `MouseDrag`, `MouseUp`). `ContextClick` + `GenericMenu.showAsContext()` cho menu chuột phải; `DragUpdated` / `DragPerform` + `DragAndDrop.paths` / `objectReferences` / `visualMode` / `acceptDrag()` để nhận kéo-thả từ Project / Hierarchy.
- **Style**: `GUIStyle` (`new GUIStyle(EditorStyles.boldLabel)`, `fontSize`, `fontStyle`, `alignment`, `wordWrap`, `normal.textColor`, `normal.background`, `padding`, `fixedWidth` / `fixedHeight`, `stretchWidth`), `EditorStyles` (`label`, `boldLabel`, `miniLabel`, `largeLabel`, `wordWrappedLabel`, `centeredGreyMiniLabel`, `helpBox`, `miniButton`, `miniButtonLeft / Mid / Right`, `toolbarButton`, `foldoutHeader`...), `EditorGUIUtility.labelWidth` / `singleLineHeight` / `currentViewWidth`.

## Tiện ích

- `EditorUtility`: `displayDialog` / `displayDialogComplex` (**Promise** — `if (await EditorUtility.displayDialog('Xoá?', '…', 'Xoá', 'Huỷ'))`), `displayProgressBar` / `displayCancelableProgressBar` / `clearProgressBar` (`await` giữa các bước để thanh kịp vẽ), `setDirty`, `copySerialized`, `isPersistent`, `openFilePanel` (chọn file trong project), `saveFilePanelInProject`, `revealInFinder`, `focusProjectWindow`.
- `Selection`: `activeObject`, `activeGameObject`, `activeTransform`, `gameObjects`, `transforms`, `objects`, `assetGUIDs`, `contains`, `selectionChanged.add(fn)`.
- `Undo`: `recordObject`, `recordObjects`, `registerCompleteObjectUndo`, `registerCreatedObjectUndo`, `destroyObjectImmediate`, `addComponent`, `setTransformParent`, `performUndo`, `performRedo`, `addUndoRedoPerformed`. Kéo một slider / nhãn số = một bước Undo cho cả lần kéo.
- `AssetDatabase` (bản editor, gồm cả các hàm của bản runtime): `findAssets('t:Prefab enemy')`, `guidToAssetPath`, `assetPathToGUID`, `getAssetPath`, `getAllAssetPaths`, `loadAssetAtPath` (Promise), `createAsset(scriptableObject, path)`, `writeText`, `createFolder`, `deleteAsset`, `isValidFolder`, `refresh`, `saveAssets`.
- `EditorPrefs`: `getInt / setInt`, `getFloat / setFloat`, `getString / setString`, `getBool / setBool`, `hasKey`, `deleteKey`, `deleteAll`.

## OnGUI trong game

Component có method `onGUI()` được vẽ đè lên game — trong Game view lúc Play và trong bản build — bằng DOM thường. Hợp cho menu debug:

```ts Assets/Scripts/DebugMenu.ts
import { GUI, GUILayout, MonoBehaviour, Rect, Time } from '@pia/core';

export class DebugMenu extends MonoBehaviour {
  private _rect = new Rect(12, 12, 200, 110);

  onGUI() {
    this._rect = GUI.window(1, this._rect, () => {
      GUILayout.beginArea(new Rect(8, 24, 184, 80));
      Time.timeScale = GUILayout.horizontalSlider(Time.timeScale, 0, 2);
      if (GUILayout.button('Reset')) Time.timeScale = 1;
      GUILayout.endArea();
      GUI.dragWindow();                 // kéo thanh tiêu đề để di chuyển
    }, 'Debug');
  }
}
```

![Cửa sổ Debug của onGUI trên Game view lúc Play](/images/imgui-ongui-game.png)

Bản build chỉ kèm phần vẽ IMGUI khi script được build có dùng `onGUI` / `GUI.` / `GUILayout.` — build report ghi `IMGUI (onGUI) ✓`.

## Khác Unity

- Hộp thoại, tải asset (`loadAssetAtPath`) là bất đồng bộ — dùng `await`.
- Control được vẽ bằng ô nhập của editor (giữ gõ tiếng Việt / IME, copy-paste, Tab), nên `GUIStyle` chỉ đổi cỡ / kiểu chữ, màu chữ, màu nền, căn lề, padding — không có texture nền.
- `propertyField` của mảng, class lồng nhau và field có attribute dùng widget của Inspector: áp dụng ngay (có Undo) thay vì đợi `applyModifiedProperties`.
- Mỗi lần vẽ chạy `onGUI` 2 lượt (Layout + sự kiện) như Unity; control nằm ngoài vùng nhìn thấy của scroll view không tạo DOM nên danh sách dài vẫn nhẹ (500 control ≈ 1.5 ms mỗi lần vẽ).

Ví dụ đầy đủ: `examples/Demo2D/Assets/Scripts/IMGUI/` — **Tools ▸ Level Tools ▸ Open Window** (Ctrl+Shift+L), Inspector của **WaveSpawner**, drawer `FloatRange` / `minMaxRange`, `DebugMenu`.
