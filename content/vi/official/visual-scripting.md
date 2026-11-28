---
title: Visual Scripting
description: Package com.pia.visualscripting — lập trình bằng node như Visual Scripting (Bolt) của Unity: Script Graph, State Graph, Script Machine, State Machine, biến, mọi API của engine thành node, debug trực tiếp khi Play.
---

# Visual Scripting (`com.pia.visualscripting`)

Lập trình bằng node giống **Visual Scripting của Unity** (trước đây là Bolt), không cần viết code:

- **Script Graph:** đồ thị luồng gồm event (On Start, On Update, va chạm, chuột, phím, UI…), điều khiển (If, For, While, Sequence, Switch…), toán, logic, biến, và **mọi API của engine và các package** (`Transform.translate`, `Input.getAxis`, `Mathf.lerp`, `Instantiate`…).
- **State Graph:** máy trạng thái. Mỗi state chạy một Script Graph, transition có graph riêng quyết định lúc nào chuyển (Trigger State Transition).
- **Component:**
  - **Script Machine** chạy một Script Graph.
  - **State Machine** chạy một State Graph.
  - **Variables:** biến của GameObject.
- **Biến:** 6 loại giống Unity là Flow, Graph, Object, Scene, Application và Saved (lưu giữa các lần chơi bằng PlayerPrefs).
- **Subgraph** (graph lồng nhau, có cổng vào/ra riêng), **Custom Event** có tham số, **coroutine** (Wait For Seconds, Wait Until…), **Formula**, **Try / Catch**.
- **Cửa sổ Visual Scripting Graph:**
  - Fuzzy Finder có hơn 15.000 node.
  - Blackboard và Graph Inspector.
  - Group, Sticky Note, copy / dán.
  - Undo, tự lưu.
- **Debug trực tiếp khi Play:** node vừa chạy sáng lên, giá trị trên các cổng hiện ngay cạnh node, State Graph tô sáng trạng thái đang chạy. Sửa graph trong lúc Play thì có tác dụng ngay.

## Cài

```bash
cd MyGame
npm install ../PiaEngine/pia-packages/com.pia.visualscripting     # hoặc Window → Package Manager → Add package from disk
```

## Bắt đầu nhanh

1. Chọn một GameObject, **Add Component → Visual Scripting → Script Machine**.
2. Inspector có **Source**:
   - **Graph** (mặc định): bấm **New** để tạo file `.scriptgraph.json` dùng lại được cho nhiều object.
   - **Embed**: graph lưu ngay trong component, và có thể tham chiếu object trong scene.
3. Bấm **Edit Graph**. Graph mới có sẵn **On Start** và **On Update**.
4. Chuột phải (hoặc phím Space) vào chỗ trống để mở **Fuzzy Finder**, gõ `rotate` rồi chọn **Rotate (X, Y, Z)** của Transform.
5. Kéo từ cổng tam giác của **On Update** sang cổng vào của **Rotate**. Thêm **Per Second** (Math/Scalar), đặt 90, nối vào **Y**.
6. Bấm Play: object quay 90°/giây, và node đang chạy sáng lên trong cửa sổ graph.

Kéo dây từ một cổng ra chỗ trống thì Fuzzy Finder mở ra và chỉ hiện các node nối được với cổng đó. Ví dụ kéo từ cổng `Transform` thì các member của Transform hiện lên đầu. Chọn node xong thì dây được nối luôn.

## Sample

`examples/Demo3D/Assets/Samples/VisualScripting`: game nhỏ ăn xu (Player di chuyển bằng phím, xu xoay và được nhặt, Enemy là State Graph tuần tra / đuổi theo, Game Manager dùng graph nhúng cập nhật điểm trên UI). Không có dòng code nào; xem README trong thư mục sample.

## Cửa sổ graph

Mở bằng **Window → Visual Scripting → Visual Scripting Graph**, nháy đúp file `.scriptgraph.json` / `.stategraph.json`, hoặc bấm **Edit Graph** trên machine.

| Thao tác | Phím / chuột |
|---|---|
| Tạo node | Chuột phải hoặc **Space** (Fuzzy Finder: duyệt theo nhóm hoặc gõ tìm, ↑ ↓ Enter) |
| Nối dây | Kéo từ cổng sang cổng. Thả ra chỗ trống thì Fuzzy Finder mở và tự nối |
| Bỏ dây | **Alt + click** vào cổng, hoặc chọn dây rồi **Delete** |
| Di chuyển màn hình / Zoom | Chuột giữa, Alt + kéo hoặc Space + kéo / con lăn |
| Chọn nhiều | Kéo khung, Shift / Ctrl + click |
| Xoá, copy, dán, nhân đôi | **Delete**, **Ctrl+C**, **Ctrl+V**, **Ctrl+D** |
| Gom nhóm | **Ctrl+G** (nháy đúp tiêu đề nhóm để đổi tên) |
| Undo / Redo | **Ctrl+Z** / **Ctrl+Y** |
| Xem toàn bộ / xem phần đang chọn | **A** (hoặc nút **Overview**) / **F** |
| Vào Subgraph, State, Transition | Nháy đúp. Thanh breadcrumb phía trên để quay lại |

**Giá trị mặc định của cổng.** Cổng giá trị chưa nối thì có ô nhập ngay bên trái node: số, chữ, checkbox, vector, màu, object.
- Cổng object kiểu GameObject / Transform / component để trống nghĩa là **This**, tức object đang chạy graph.
- Kéo GameObject từ Hierarchy vào ô object hoặc thả vào graph: chỉ làm được với graph **Embed**. Unity cũng không cho file graph tham chiếu object trong scene.
- Kéo asset từ Project vào ô object: được với mọi loại graph. Kéo một Script Graph vào canvas thì tạo node **Subgraph** dùng file đó.

**Blackboard** có 5 tab: Graph, Object, Scene, App, Saved.
- Kéo một biến vào graph để tạo **Get Variable**. Giữ **Alt** khi kéo để tạo **Set Variable**.
- Khi Play, Blackboard hiện giá trị đang chạy của các biến.

**Graph Inspector:**
- Khi chọn một node: mô tả, các tuỳ chọn của node, kiểu của từng cổng.
- Khi không chọn gì: tên và mô tả graph, và các cổng **Trigger / Data Inputs / Outputs** của graph khi được dùng làm Subgraph.

**Lưu:**
- File graph tự lưu sau mỗi lần sửa; **Ctrl+S** lưu ngay.
- Graph Embed lưu cùng scene.
- Sửa graph trong lúc Play thì các machine đang chạy dựng lại graph ngay và giữ nguyên biến Graph.

## Node

| Nhóm | Node |
|---|---|
| Events / Lifecycle | On Start, On Update, On Fixed Update, On Late Update, On Enable, On Disable, On Destroy |
| Events / Physics, Physics 2D | On Collision Enter / Stay / Exit, On Trigger Enter / Stay / Exit (cả bản 2D), On Controller Collider Hit |
| Events / Input | On Keyboard Input (Down / Up / Hold), On Mouse Input, On Button Input (Jump, Fire1…), On Mouse Down / Up / Enter / Exit / Over / Drag |
| Events / GUI | On Button Click, On Toggle / Slider / Scrollbar / Scroll Rect / Dropdown / Input Field Value Changed, On Input Field End Edit |
| Events | Custom Event (tối đa 10 tham số), Trigger Custom Event, On Pia Event, On Animation Event, On Enter State / On Exit State |
| Control | If, Switch On Integer / String, Select, Select On Integer / String / Flow, Sequence, For Loop, For Each Loop (list hoặc dictionary), While Loop, Break Loop, Once, Toggle Flow, Toggle Value, Try Catch, Throw |
| Time | Wait For Seconds, Wait Until, Wait While, Wait For Next Frame, Wait For End Of Frame, Wait For Flow, Cooldown, Timer |
| Logic | And, Or, Exclusive Or, Negate, Equal, Not Equal, Less, Greater, …, Approximately Equal, Comparison |
| Math | Add, Subtract, Multiply, Divide, Modulo, Sum, Average, Min, Max, Lerp, Move Towards, Absolute, Normalize, Round, Per Second, Distance, Dot, Cross, Angle, Project… theo nhóm Generic / Scalar / Vector 2 / Vector 3; Random Range; **Formula** |
| Variables | Get / Set / Is Variable Defined (6 loại biến), This, Literal (Float, Integer, Boolean, String, Vector, Quaternion, Color, Game Object, List) |
| Collections | List: Create, Get / Set / Add / Insert / Remove Item, Count, Contains, Index Of, Merge, Clear. Dictionary: Create, Get / Set / Remove Item, Contains Key, Clear |
| Nesting | Subgraph, Input / Output (cổng của graph), Trigger State Transition |
| Codebase | Mọi method, property, field và constructor của engine và các package (Pia Engine/Transform, Pia Engine/Mathf, Tween/DOTween…), cùng field và method của script trong project |

**Codebase:**
- Method thay đổi object (Translate, AddForce…) có cổng luồng vào/ra.
- Hàm chỉ tính giá trị (Mathf, Vector3, `getComponent`, `transformPoint`…) là node giá trị, chạy khi được dùng tới.
- Danh sách API sinh từ mã nguồn: `node pia-packages/com.pia.visualscripting/Tools~/gen-catalog.mjs`.

**Formula:**
- Các cổng vào tên là `a`, `b`, `c`… Biểu thức hỗ trợ `+ - * / % ^`, so sánh, `and` / `or` / `not`, `x ? y : z`, `if(c, x, y)`, `abs`, `sin` / `cos` (tính theo độ), `min`, `max`, `clamp`, `lerp`, `round`, `sqrt`, `v3(x, y, z)`, `distance`, `random(a, b)`.
- Tên khác được đọc từ biến, theo thứ tự Flow, Graph, Object, Scene, Application.
- Ví dụ: `a * 2 + (health > 50 ? 1 : 0)`.

## Biến

| Loại | Phạm vi | Đặt ở đâu |
|---|---|---|
| Flow | Một lần chạy của luồng | Chỉ có khi graph chạy |
| Graph | Một machine (mỗi machine có biến riêng, kể cả khi dùng chung file graph) | Blackboard → Graph |
| Object | Một GameObject (mọi machine trên object đó dùng chung) | Component **Variables** / Blackboard → Object |
| Scene | Một scene | Object **Scene Variables** (tự tạo khi cần) / Blackboard → Scene |
| Application | Toàn game, khi đang chạy | Blackboard → App (lưu ở `Assets/Resources/Visual Scripting Variables.asset.json`) |
| Saved | Như Application, nhưng giữ giữa các lần chơi (PlayerPrefs) | Blackboard → Saved |

Giá trị khai báo của biến Application / Saved được nạp cùng machine đầu tiên. Biến mà graph gán trước khi file nạp xong vẫn giữ giá trị đã gán.

Biến kiểu GameObject hoặc component của component **Variables** có thể trỏ tới object trong scene hoặc prefab. Instantiate và prefab tự trỏ lại cho đúng.

## State Graph

1. **Add Component → Visual Scripting → State Machine**, rồi **Edit Graph**. Graph mới có sẵn state **Start**.
2. Chuột phải → **Create Script State / Super State / Any State**.
3. Kéo từ chấm tròn ở cạnh phải của một state sang state khác để tạo **transition**. Nháy đúp chấm giữa mũi tên để sửa graph của transition.
4. Transition được thực hiện khi graph của nó chạy tới **Trigger State Transition**. Ví dụ: `On Keyboard Input (Space) → Trigger State Transition`, hoặc chuyển sau một khoảng thời gian: `On Enter State → Wait For Seconds → Trigger State Transition`.
5. Graph của state có sẵn **On Enter State**, **On Update** và **On Exit State**. State có viền xanh lá là state bắt đầu (**Start State** trong Graph Inspector, có thể có nhiều).

**Super State** chạy một State Graph lồng bên trong. Transition xuất phát từ **Any State** có thể được thực hiện từ bất kỳ state nào. Khi Play, cửa sổ tô sáng state đang chạy và transition vừa được thực hiện.

## Gọi từ script

```ts
import { Variables, CustomEvent, VisualScripting } from 'com.pia.visualscripting';

Variables.object(this.gameObject).set('health', 3);
const score = Variables.application.get<number>('score');
Variables.saved.set('bestScore', 120);          // lưu giữa các lần chơi
CustomEvent.trigger(enemy, 'Hit', 10);          // gọi Custom Event "Hit" trên enemy với một tham số
VisualScripting.registerType('MyHelpers', MyHelpers); // cho graph gọi class tĩnh của bạn theo tên
```

Thêm node của riêng bạn bằng `VisualScripting.registerUnit({ type, title, category, ports, compile })`; xem các file trong `Runtime/units/`.

Gọi graph từ UI:
- Nút **On Click ()** của Button có thể gọi `ScriptMachine.triggerPiaEvent("Tên")`, graph nhận ở node **On Pia Event**.
- Animation event có thể gọi `triggerAnimationEvent`, graph nhận ở node **On Animation Event**.

## Hiệu năng

- **Biên dịch một lần thành closure.** Graph được biên dịch một lần thành các closure, mọi machine dùng chung graph thì dùng chung bản biên dịch. Khi chạy không phải thông dịch node hay tra tên.
- **Không cấp phát mỗi khung.** Luồng (flow) được tái sử dụng, các vòng lặp và coroutine không đệ quy trên stack JS. Đo với 200 machine:

  | Graph | Bộ nhớ cấp phát mỗi khung |
  |---|---|
  | Biến + If | 0 byte |
  | For | 0 byte |
  | State Machine | 0 byte |
  | `Transform.rotate` + Per Second | khoảng 16 byte (một số thực bị box giữa hai node) |

  Mỗi machine tốn khoảng 0,5–1 µs/khung.
- **Bản build chỉ mang theo class graph dùng tới.** Mỗi graph lưu danh sách class nó gọi theo tên (`typeRefs`). Khi build, bảng type chỉ import đúng các class đó, nên graph không kéo cả engine vào bundle. Script, component dựng sẵn và vật lý mà graph cần cũng được build tự mang theo.

## Giới hạn so với Unity

- Không có Code Generation (graph luôn được chạy bằng closure), không có các node dành riêng cho Input System mới. Dùng codebase của package `com.pia.inputsystem`.
- Graph dạng file không tham chiếu được object trong scene: dùng biến Object / Scene, hoặc graph Embed.
- State Unit (State Graph đặt bên trong Script Graph) chưa có. Dùng Super State.
- Danh sách codebase của script trong project lấy từ component đã đăng ký (field có kiểu, method không có kiểu tham số).
