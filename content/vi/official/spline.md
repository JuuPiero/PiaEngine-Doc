---
title: Spline
description: Package com.pia.spline — đường cong Bézier sửa trong Scene view, object chạy theo spline, rải prefab dọc spline.
---

# Spline (`com.pia.spline`)

Đường cong **Bézier** giống package **Splines** của Unity: vẽ và sửa spline ngay trong Scene view, cho object chạy theo spline, rải prefab dọc spline. Chạy trong scene 2D (PixiJS) lẫn 3D (three.js).

## Cài đặt

```bash
cd MyGame
npm install ../PiaEngine/pia-packages/com.pia.spline      # hoặc Window → Package Manager → Add package from disk
```

Demo2D và Demo3D đã cài sẵn.

## Bắt đầu nhanh

1. **GameObject → Spline → Open Spline / Circle / Square** (hoặc **Add Component → Spline → Spline Container**).
2. Chọn object rồi sửa trong Scene view:

| Thao tác | Cách làm |
|---|---|
| Chọn knot | Click vào chấm tròn (knot đầu của spline mở là ô vuông) |
| Di chuyển knot | Kéo chấm (3D: trong mặt phẳng nhìn; 2D: mặt XY). Knot đang chọn có mũi tên X/Y/Z như Move tool; transform tool của object tạm ẩn |
| Sửa tangent | Kéo hai hình thoi cam của knot đang chọn. Knot `Auto` / `Mirrored`… tự đổi kiểu như Unity |
| Thêm knot vào cuối | <kbd>Shift</kbd> + click chỗ trống (3D: trên mặt phẳng ngang qua knot cuối; 2D: mặt XY). Giữ Shift để xem trước vị trí |
| Chèn knot | <kbd>Shift</kbd> + click lên đường cong: chèn đúng chỗ đó, giữ nguyên hình dạng |
| Xoá knot | <kbd>Del</kbd> / <kbd>Backspace</kbd> (khi Scene view đang focus) |
| Bỏ chọn knot | <kbd>Esc</kbd>, hoặc bỏ chọn object |
| Snap | Giữ <kbd>Ctrl</kbd> khi kéo: 0.25 đơn vị |
| Khung nhìn | <kbd>F</kbd> đưa cả spline vào khung hình |

Mỗi lần kéo là **một bước Undo**; thêm / chèn / xoá knot, đổi tangent mode cũng undo được.

**Inspector** của Spline Container: Add Knot (chèn sau knot đang chọn), Delete Knot, Reverse, Closed, chọn knot và sửa Position / Tangent Mode / Tangent In / Tangent Out / Rotation của knot đó, độ dài spline; bên dưới là danh sách mọi spline và knot.

## Tangent mode

| Mode | Ý nghĩa |
|---|---|
| `Auto` | Tangent tự tính từ hai knot bên cạnh (Catmull-Rom; `tension` 0 = uniform, 0.5 = centripetal, 1 = chordal). Kéo tangent thì knot chuyển sang `Continuous` |
| `Linear` | Không có tangent: đoạn thẳng vào / ra knot (góc nhọn) |
| `Mirrored` | Tangent vào = − tangent ra (cùng độ dài) |
| `Continuous` | Hai tangent thẳng hàng, độ dài riêng |
| `Broken` | Hai tangent độc lập (góc gãy) |

Tangent lưu dạng **offset so với knot**, trong không gian local của Spline Container (Unity lưu theo hướng xoay của knot). `rotation` của knot (góc Euler) chỉ quyết định **up vector** của spline tại knot đó.

## SplineContainer

Chứa một hoặc nhiều `Spline` (`splines`). Knot nằm trong không gian **local** của object: di chuyển / xoay / scale object là cả spline đi theo. Các hàm dưới đây nhận và trả về **world space**; `t` là vị trí chuẩn hoá 0..1 **theo độ dài** (các bước `t` bằng nhau đi những quãng bằng nhau).

```ts
import { SplineContainer, Spline } from 'com.pia.spline';

const track = this.getComponent(SplineContainer)!;
track.evaluatePosition(0.25);            // điểm ở 1/4 quãng đường
track.evaluateTangent(t).normalized;     // hướng đi
track.evaluateUpVector(t);
track.evaluate(t);                       // { position, tangent, upVector }
track.getLength();                       // độ dài world (Unity: CalculateLength)
track.getNearestPoint(p);                // { position, t, distance }
track.getKnotPosition(i); track.setKnotPosition(i, worldPos);

// dựng spline bằng code (local space)
const s = track.spline;                  // spline đầu tiên
s.add(new Vector3(3, 0, 0));             // thêm knot Auto
s.insertOnCurve(1, 0.5);                 // chèn giữa đoạn 1, giữ hình dạng
s.setTangentMode(2, 'Linear');
s.setTangentOut(0, new Vector3(1, 0, 0)); // tuân theo mode của knot
s.closed = true;
s.reverse();
track.addSpline(Spline.fromPoints([a, b, c], false, 'Auto'));
```

`Spline` (local space) còn có: `getCurveLength(i)`, `getCurve(i)` (4 điểm Bézier), `splineToCurveT` / `curveToSplineT`, `getTangentIn/Out(i)` (tangent thực tế, kể cả Auto), `insert`, `removeAt`, `clear`, `setTangentIn/Out`. Độ dài được cache và tự tính lại khi knot đổi.

## SplineAnimate

Cho object chạy theo spline (Unity: SplineAnimate).

| Field | Ý nghĩa |
|---|---|
| Container, Spline Index | Spline cần chạy theo |
| Play On Awake | Tự chạy khi vào game |
| Animation Method | `Time` (Duration: số giây cho một vòng) hoặc `Speed` (Max Speed: đơn vị / giây) |
| Easing | `None`, `EaseIn`, `EaseOut`, `EaseInOut` |
| Loop Mode | `Once` (gọi `onCompleted` khi tới cuối), `Loop`, `LoopEaseInOnce`, `PingPong` |
| Alignment | `None`; `SplineElement` (theo tangent + up của spline); `SplineObject` (up của container); `World` (giữ thẳng đứng, chỉ quay quanh Y) |
| Object Forward / Up Axis | Trục của object hướng theo spline (mặc định `-Z` = forward của engine, `+Y`). Scene 2D chỉ xoay quanh Z: chọn `+X` hoặc `+Y` |
| Start Offset | Vị trí bắt đầu (0..1) |

```ts
const anim = this.getComponent(SplineAnimate)!;
anim.play(); anim.pause(); anim.restart(true);
anim.normalizedTime = 0.5;     // phần nguyên = số vòng đã chạy
anim.isPlaying; anim.elapsedTime; anim.getDuration();
anim.onCompleted.addListener(() => Debug.log('Tới nơi'));
```

## SplineInstantiate

Rải prefab dọc spline khi game chạy, làm con của object này (Unity: SplineInstantiate).

| Field | Ý nghĩa |
|---|---|
| Items | Danh sách prefab + `probability` (tỉ lệ tương đối), chọn ngẫu nhiên theo `seed` |
| Instantiate Method | `InstanceCount` (Count) hoặc `SpacingDistance` (Spacing: khoảng cách world) |
| Alignment, Forward / Up Axis | Như SplineAnimate |
| Position Offset / Rotation Offset / Scale | Lệch theo hệ trục đã căn của từng instance, xoay thêm, nhân scale |

Trong editor, khi chọn object, Scene view hiện vị trí sẽ đặt instance (chấm vàng). Nút **Bake Instances** tạo luôn các object con trong scene để chỉnh tay (Undo được) và tắt component để không tạo thêm khi chạy. Code: `updateInstances()`, `clear()`, `instances`, `computePlacements()`.

## Ví dụ

- Demo3D `Assets/Scenes/Splines.scene.json`: xe chạy vòng đường đua kín có dốc (căn theo tangent); quả cầu chạy qua lại (PingPong, Speed + EaseInOut) trên đường lượn sóng có một góc `Linear`; cột đèn rải mỗi 1.8 đơn vị bằng SplineInstantiate.
- Demo2D `Assets/Scenes/Splines2D.scene.json`: tam giác bay theo vòng số 8 (căn theo `+Y`), quả bóng PingPong, chấm vàng rải dọc vòng.

Hai scene này không nằm trong Build Settings: mở trong editor rồi Play, hoặc thêm vào Build Settings để build.

## Cho người viết package

Phần editor của package dùng API chung `ctx.registerSceneGizmo` để vẽ đường cong và tay cầm trong Scene view. File `Editor/SplineGizmos.ts` của package là ví dụ đầy đủ (kéo knot / tangent, `positionHandle`, `sceneClick`, `shortcut('Delete')`, `hideTools()`). Xem [Editor extension](../packages/editor-extensions.md#gizmo-va-handle-trong-scene-view).

## Chưa hỗ trợ

- Chọn nhiều knot cùng lúc; nối knot giữa các spline; xoay knot bằng gizmo (chỉ sửa `rotation` trong Inspector).
- `SplineExtrude` (mesh ống / đường từ spline), `SplineInstantiate` theo `LinearDistance`, xem trước instance bằng object thật khi chưa Bake.
- Up vector nội suy tuyến tính giữa các knot rồi trực giao hoá, chưa phải rotation-minimizing frame như Unity.
