---
title: Sự kiện con trỏ (EventSystem)
description: EventSystem, raycaster và các interface IPointerClickHandler, IDragHandler… như UnityEngine.EventSystems; OnMouseDown / OnMouseUp…
---

# Sự kiện con trỏ (EventSystem)

Giống **UnityEngine.EventSystems**: GameObject nhận click, hover, kéo thả, lăn chuột khi scene có một **EventSystem** và có **raycaster** "nhìn thấy" object đó. Chạy với chuột, bút và cảm ứng nhiều ngón, trong Game view khi Play và trong bản build (không chạy trong Scene view).

## Thiết lập

1. **GameObject → UI → Event System** tạo object `EventSystem` (component `EventSystem` + `StandaloneInputModule`). Tạo **Canvas** từ menu GameObject → UI thì EventSystem được thêm tự động nếu scene chưa có, như Unity.
2. Thêm raycaster (**Add Component → Event**):

| Raycaster | Gắn lên | Tìm thấy |
|---|---|---|
| `GraphicRaycaster` | Canvas (Canvas tạo từ menu đã có sẵn) | `Image` / `Text` có **Raycast Target**, `Button` |
| `PhysicsRaycaster` | Camera | Collider 3D (`BoxCollider`, `SphereCollider`, `CapsuleCollider`) |
| `Physics2DRaycaster` | Camera | Collider 2D (`BoxCollider2D`, `CircleCollider2D`, `CapsuleCollider2D`) |

3. Viết script có method handler, gắn lên object có collider (hoặc phần tử UI, hoặc một object cha của nó).

```ts Assets/Scripts/Draggable.ts
import { MonoBehaviour, Vector3, Debug, type IPointerClickHandler, type IPointerEnterHandler, type IPointerExitHandler, type IDragHandler, type PointerEventData } from '@pia/core';

// Cube có BoxCollider + script này; Main Camera có PhysicsRaycaster; scene có EventSystem
export class Draggable extends MonoBehaviour implements IPointerClickHandler, IPointerEnterHandler, IPointerExitHandler, IDragHandler {
  onPointerEnter(e: PointerEventData) {
    Debug.log('hover', this.name);
  }
  onPointerExit(e: PointerEventData) {
    Debug.log('rời', this.name);
  }
  onPointerClick(e: PointerEventData) {
    if (e.clickCount === 2) Debug.log('double click tại', e.pointerCurrentRaycast.worldPosition);
  }
  onDrag(e: PointerEventData) {
    // kéo object theo con trỏ, giữ nguyên khoảng cách tới camera
    const cam = e.pressEventCamera!;
    const z = cam.worldToScreenPoint(this.transform.position).z;
    this.transform.position = cam.screenToWorldPoint(new Vector3(e.position.x, e.position.y, z));
  }
}
```

## Interface handler

TypeScript không có interface lúc chạy, nên engine tìm handler theo **tên method**; `implements` chỉ để có kiểm tra kiểu. Mỗi method nhận `PointerEventData` (hoặc `BaseEventData` với sự kiện chọn / submit).

| Interface (Unity) | Method | Khi nào |
|---|---|---|
| `IPointerEnterHandler` / `IPointerExitHandler` | `onPointerEnter` / `onPointerExit` | Con trỏ vào / rời object (gửi cho cả chuỗi cha) |
| `IPointerDownHandler` / `IPointerUpHandler` | `onPointerDown` / `onPointerUp` | Nhấn trên object / thả (ở bất kỳ đâu) sau khi nhấn trên nó |
| `IPointerClickHandler` | `onPointerClick` | Nhấn và thả trên cùng object, không kéo |
| `IPointerMoveHandler` | `onPointerMove` | Con trỏ di chuyển trên object |
| `IInitializePotentialDragHandler` | `onInitializePotentialDrag` | Lúc nhấn trên object kéo được (đặt `e.useDragThreshold = false` để kéo ngay) |
| `IBeginDragHandler` / `IDragHandler` / `IEndDragHandler` | `onBeginDrag` / `onDrag` / `onEndDrag` | Kéo (sau khi di chuyển quá `pixelDragThreshold` px) |
| `IDropHandler` | `onDrop` | Thả một vật đang kéo lên object này (`e.pointerDrag` là vật được kéo) |
| `IScrollHandler` | `onScroll` | Lăn chuột (`e.scrollDelta`, ≈ 1 mỗi nấc, Y dương = lăn lên) |
| `ISelectHandler` / `IDeselectHandler` | `onSelect` / `onDeselect` | `EventSystem.current.setSelectedGameObject(go)` |
| `IUpdateSelectedHandler` | `onUpdateSelected` | Mỗi frame trên object đang được chọn |
| `ISubmitHandler` / `ICancelHandler` | `onSubmit` / `onCancel` | Phím Enter / Escape khi object đang được chọn (đổi phím trong `StandaloneInputModule`) |

Sự kiện được gửi cho object trúng đầu tiên rồi **nổi lên cha** tới object đầu tiên có handler, như `ExecuteEvents.ExecuteHierarchy`: đặt script lên một object cha để bắt click của mọi con. Chỉ component đang bật trên object đang active mới nhận sự kiện.

## PointerEventData

| Field | Ý nghĩa |
|---|---|
| `position`, `delta`, `pressPosition` | Pixel, gốc ở góc dưới-trái Game view (giống `Input.mousePosition`) |
| `button` | `InputButton.Left` / `Right` / `Middle` |
| `pointerId` | Chuột: -1 (trái), -2 (phải), -3 (giữa); ngón tay: 0, 1, 2… |
| `pointerType` | `'mouse'`, `'pen'`, `'touch'` |
| `clickCount`, `clickTime` | Số click liên tiếp (double click = 2, cách nhau < 0.3 s) |
| `scrollDelta` | Lăn chuột |
| `dragging`, `eligibleForClick`, `useDragThreshold` | Trạng thái kéo |
| `pointerEnter`, `pointerPress`, `rawPointerPress`, `pointerDrag`, `hovered` | Các object liên quan |
| `pointerCurrentRaycast`, `pointerPressRaycast` | `RaycastResult`: `gameObject`, `module` (raycaster), `distance`, `worldPosition`, `worldNormal`, `screenPosition`, `sortingOrder`, `depth` |
| `enterEventCamera`, `pressEventCamera` | Camera của raycaster (null với UI overlay) |
| `use()`, `used` | Đánh dấu đã xử lý |

## Thứ tự và chặn

Kết quả của mọi raycaster được gộp rồi sắp xếp như Unity: **UI Canvas luôn ở trước** object 3D / 2D (nên UI che object phía sau), sau đó theo depth camera, **Order in Layer** (2D), thứ tự vẽ UI, khoảng cách. Object 2D chồng nhau: object có Order in Layer cao hơn nhận click.

```ts
import { EventSystem, Input } from '@pia/core';

update() {
  // bắn khi click vào game, không phải khi click vào UI / object có handler
  if (Input.getMouseButtonDown(0) && !EventSystem.isPointerOverGameObject()) this.shoot();
}
```

`EventSystem.current.isPointerOverGameObject(pointerId?)` (hoặc gọn `EventSystem.isPointerOverGameObject()`) trả về `true` khi con trỏ đang trên object mà raycaster tìm thấy — UI có Raycast Target, hoặc collider nếu có PhysicsRaycaster. Không truyền `pointerId` = chuột hoặc bất kỳ ngón tay nào. Scene không có EventSystem: chỉ tính UI. Phần tử HTML của [UI Toolkit](../official/ui-toolkit.md) cũng được tính và chặn raycast.

## Component

| Component | Field |
|---|---|
| `EventSystem` | **First Selected** (`firstSelectedGameObject`), **Send Navigation Events**, **Drag Threshold** (`pixelDragThreshold`, mặc định 10 px). API: `EventSystem.current`, `currentSelectedGameObject`, `setSelectedGameObject(go)`, `raycastAll(eventData, results)`, `isPointerOverGameObject(pointerId?)` |
| `StandaloneInputModule` | **Submit Button** (`'Return'`), **Cancel Button** (`'Escape'`); `getPointerData(pointerId)`. EventSystem không có input module vẫn chạy với giá trị mặc định |
| `GraphicRaycaster` | **Ignore Reversed Graphics**, **Blocking Objects**, **Blocking Mask** (chưa có tác dụng vì Canvas chỉ có Screen Space - Overlay, giống Unity) |
| `PhysicsRaycaster` | **Event Mask** (kết hợp với Culling Mask của camera), **Max Ray Intersections** (0 = không giới hạn) |
| `Physics2DRaycaster` | Như PhysicsRaycaster |

Tự gửi sự kiện (kể cả sự kiện tự đặt tên):

```ts
import { ExecuteEvents, PointerEventData, EventSystem } from '@pia/core';

const data = new PointerEventData(EventSystem.current);
ExecuteEvents.execute(target, data, ExecuteEvents.pointerClickHandler);   // = 'onPointerClick'
ExecuteEvents.executeHierarchy(target, data, 'onMyEvent');               // object đầu tiên (từ target lên cha) có onMyEvent
ExecuteEvents.getEventHandler(target, ExecuteEvents.dragHandler);        // object sẽ nhận onDrag
```

## OnMouseDown, OnMouseUp…

Như Unity, script trên object có **collider 3D hoặc 2D** nhận các message chuột mà **không cần EventSystem hay raycaster**:

| Method | Khi nào |
|---|---|
| `onMouseDown()` | Nhấn chuột trái trên collider |
| `onMouseUp()` | Thả chuột (sau `onMouseDown` trên object này) |
| `onMouseUpAsButton()` | Thả trên chính collider đã nhấn (một click) |
| `onMouseDrag()` | Mỗi frame khi đang giữ chuột sau `onMouseDown` |
| `onMouseEnter()` / `onMouseOver()` / `onMouseExit()` | Chuột vào / đang ở trên (mỗi frame) / rời collider |

```ts
export class Coin extends MonoBehaviour {
  onMouseDown() {
    this.destroy(this.gameObject);
  }
}
```

Tia bắn từ các camera của scene (depth cao trước), bỏ qua layer **Ignore Raycast**, tôn trọng Culling Mask. Cảm ứng được tính như chuột trái. Giống Unity, OnMouse **không** bị UI chặn — kiểm tra `EventSystem.isPointerOverGameObject()` nếu cần.

::: note
- Scene cũ có Canvas nhưng không có EventSystem: Button vẫn bấm được như trước. Khi đã có EventSystem, Canvas cần `GraphicRaycaster` (Canvas tạo từ menu đã có).
- Build: EventSystem gọi vật lý qua `Physics` / `Physics2D` nên không làm bản build kéo Rapier vào; scene chỉ có UI + EventSystem không chứa vật lý. `PhysicsRaycaster` / `Physics2DRaycaster` cần collider trong scene (có collider thì vật lý đã được đóng gói).
- Với camera perspective, collider 2D được coi như nằm trên mặt phẳng z = 0.
- Chưa có: `EventTrigger`, điều hướng bằng phím mũi tên (`IMoveHandler`, `Selectable`), Canvas Screen Space - Camera / World Space.
:::
