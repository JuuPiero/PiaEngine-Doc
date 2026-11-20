---
title: Entities (ECS)
description: Package com.pia.entities — ECS kiểu Unity Entities / DOTS: archetype + chunk typed array, system, query, EntityCommandBuffer, baking, vẽ instanced.
---

# Entities — ECS (`com.pia.entities`)

ECS (Entity Component System) theo mô hình **Unity Entities / DOTS**, API viết camelCase như phần còn lại của PiaEngine. Dùng khi cần **hàng chục nghìn đối tượng** (đạn, đàn cá, hạt, đơn vị RTS…) mà GameObject quá nặng:

- **Entity** chỉ là một số; dữ liệu nằm trong **chunk** theo **archetype**, mỗi field là một **typed array** (SoA) — vòng lặp của system chạy thẳng trên `Float32Array`, không cấp phát gì mỗi frame.
- **System** (`SystemBase` / `ISystem`) trong các **group** Initialization / Simulation / Presentation, sắp thứ tự bằng `@updateBefore` / `@updateAfter` / `@updateInGroup`.
- **Baking**: dựng nội dung bằng GameObject như thường (Inspector, prefab), lúc Play được **bake** thành entity (`SubScene`, `Baker<T>`).
- **Vẽ** entity bằng `Graphics.drawMeshInstanced`: mỗi cặp mesh + material = **1 draw call**, frustum culling theo chunk, màu riêng từng entity. 2D: sprite instanced.
- Cửa sổ **Window ▸ Entities ▸ Systems** (thứ tự, bật/tắt, ms) và **Window ▸ Entities ▸ Hierarchy** (world, archetype, chunk, giá trị component).

## Cài

```bash
cd MyGame
npm install ../PiaEngine/pia-packages/com.pia.entities     # hoặc Window → Package Manager → Add package from disk
```

Package chỉ vào bản build khi script / scene của bạn dùng nó (~84 KB min, ~27 KB gzip).

## Unity Entities ↔ Pia Entities

| Unity | Pia | Ghi chú |
|---|---|---|
| `struct X : IComponentData { float3 Value; }` | `export const X = defineComponent('X', { value: 'float3' })` | field: `float double int uint short ushort byte sbyte bool entity float2 float3 float4 quaternion color int2 int3 int4 float3x3 float4x4` |
| tag (struct rỗng) | `defineTag('Enemy')` | |
| `IEnableableComponent` | `defineComponent(..., { enableable: true })` / `defineTag(..., { enableable: true })` | `setComponentEnabled` không đổi archetype |
| `ISharedComponentData` | `defineSharedComponent('Team', { id: 0 })` | chunk tách theo giá trị |
| `IBufferElementData` + `DynamicBuffer<T>` | `defineBuffer('Waypoint', { position: 'float3' })` → `DynamicBuffer` | |
| managed component (`class : IComponentData`) | `defineManagedComponent('X', () => obj)` | cột mảng object (chậm hơn) |
| `Entity`, `Entity.Null` | `Entity` (number), `Entity.null`, `Entity.index(e)`, `Entity.version(e)` | 22 bit index + version |
| `World`, `World.DefaultGameObjectInjectionWorld` | `World`, `World.defaultGameObjectInjectionWorld` | tạo lúc Play, huỷ khi Stop |
| `EntityManager.CreateEntity / Instantiate / DestroyEntity / AddComponent / SetComponentData / GetComponentData / HasComponent / CreateArchetype` | cùng tên camelCase | `instantiate(prefab, count)` theo lô |
| `EntityQuery`, `WithAll/WithAny/WithNone/WithDisabled/WithAbsent/WithPresent` | `EntityQuery`, `EntityQueryBuilder.withAll(...)…`, hoặc `{ all, any, none, disabled, absent, present }` | `toEntityArray`, `calculateEntityCount`, `toComponentDataArray`, `getSingleton` |
| `SetChangedVersionFilter`, `SetSharedComponentFilter` | `setChangedVersionFilter`, `setSharedComponentFilter` | theo chunk, như Unity |
| `EntityCommandBuffer` (+ `ParallelWriter`) | `EntityCommandBuffer`, `asParallelWriter()` | entity tạo trong ECB là "deferred", được map lại lúc playback |
| `Begin/EndSimulationEntityCommandBufferSystem.Singleton` | `SystemAPI.getSingletonObject(EndSimulationEntityCommandBufferSystem.Singleton).createCommandBuffer()` | |
| `SystemBase`, `ISystem` + `SystemState` | `SystemBase`, `ISystem` + `SystemState` | ISystem cần một decorator (`@system`, `@updateInGroup`…) |
| `[UpdateInGroup] [UpdateBefore] [UpdateAfter] [DisableAutoCreation] [RequireMatchingQueriesForUpdate]`, `OrderFirst/OrderLast` | `@updateInGroup(G, { orderFirst })`, `@updateBefore`, `@updateAfter`, `@disableAutoCreation`, `@requireMatchingQueriesForUpdate` | |
| `RequireForUpdate<T>()` | `requireForUpdate(T)` | |
| `SystemAPI.Query<RefRW<A>, RefRO<B>>()` | `for (const chunk of SystemAPI.query(A, B))` + `chunk.getArray(A.field)` / `getArrayRO` | không cấp phát theo entity |
| `SystemAPI.Time.DeltaTime`, `GetSingleton`, `GetComponentLookup`, `GetBufferLookup` | `SystemAPI.time.deltaTime`, `getSingleton`, `getComponentLookup`, `getBufferLookup` | |
| `IJobEntity`, `IJobChunk`, `JobHandle` | `IJobEntity` (`beginChunk` + `execute`), `IJobChunk`, `JobHandle` | chạy tuần tự trên main thread (xem Giới hạn) |
| `FixedStepSimulationSystemGroup`, `LateSimulationSystemGroup` | cùng tên | timestep mặc định 1/60, catch-up |
| `Unity.Mathematics.Random`, `math`, `quaternion` | `Random` (cùng thuật toán xorshift), `math`, `float3`, `quaternion`, `float4x4` (hàm trên `(array, offset)`) | |
| `LocalTransform`, `LocalToWorld`, `Parent`, `Child`, `PostTransformMatrix`, `TransformSystemGroup` | cùng tên | |
| `Baker<T>`, `GetEntity(TransformUsageFlags)`, `AddComponent`, `AddBuffer`, `CreateAdditionalEntity` | `Baker<T>` + `@bakes(Authoring)`, `getEntity(...)`, `addComponent`, `addBuffer`, `createAdditionalEntity` | |
| `SubScene` | component `SubScene` (con của nó là nội dung được bake) | không có file scene riêng |
| Entities Graphics: `RenderMeshArray` + `MaterialMeshInfo`, `RenderBounds`, `URPMaterialPropertyBaseColor`, `DisableRendering` | `RenderMesh` (shared: mesh + material), `RenderBounds`, `MaterialColor`, `DisableRendering`; 2D: `RenderSprite` | |

## Bắt đầu nhanh (Unity HelloCube)

```ts
import { MonoBehaviour, GameObject, component, field } from '@pia/core';
import { Baker, bakes, defineComponent, LocalTransform, SystemBase, SystemAPI, TransformUsageFlags, math, quaternion } from 'com.pia.entities';

// 1. Dữ liệu
export const RotationSpeed = defineComponent('RotationSpeed', { radiansPerSecond: 'float' });

// 2. Authoring (component bình thường, chỉnh trong Inspector) + Baker
@component({ menu: 'Samples/Rotation Speed Authoring' })
export class RotationSpeedAuthoring extends MonoBehaviour {
  degreesPerSecond = 180;
}

@bakes(RotationSpeedAuthoring)
export class RotationSpeedBaker extends Baker<RotationSpeedAuthoring> {
  bake(a: RotationSpeedAuthoring) {
    const e = this.getEntity(TransformUsageFlags.Dynamic);
    this.addComponent(e, RotationSpeed, { radiansPerSecond: math.radians(a.degreesPerSecond) });
  }
}

// 3. System — tự được tạo trong world mặc định (SimulationSystemGroup)
export class RotationSystem extends SystemBase {
  onUpdate() {
    const dt = SystemAPI.time.deltaTime;
    for (const chunk of SystemAPI.query(LocalTransform, RotationSpeed)) {
      const rot = chunk.getArray(LocalTransform.rotation);          // Float32Array, 4 số / entity
      const speed = chunk.getArrayRO(RotationSpeed.radiansPerSecond);
      for (let i = 0; i < chunk.count; i++) quaternion.mulRotateY(rot, i * 4, speed[i] * dt);
    }
  }
}
```

4. Trong scene: **GameObject ▸ Entities ▸ Sub Scene**, kéo các cube (MeshFilter + MeshRenderer + `RotationSpeedAuthoring`) vào làm con của SubScene. Bấm Play: SubScene được bake thành entity rồi tắt đi; cube quay, vẽ bằng 1 draw call instanced.

## Dữ liệu và truy cập

```ts
const em = World.defaultGameObjectInjectionWorld!.entityManager;
const e = em.createEntity(LocalTransform, LocalToWorld, Velocity);
em.setComponentData(e, Velocity, { value: [0, 1, 0] });     // ghi cả struct (field thiếu = giá trị mặc định)
em.getComponentData(e, Velocity).value;                      // [0, 1, 0] (cấp phát — dùng trong code thường)
em.setField(e, Velocity.value, 2, 1);                        // nhanh, không cấp phát: value.y = 2
const clones = em.instantiate(prefab, 1000);                  // theo lô, chép thẳng cột
```

- **Vòng lặp nhanh**: `query.chunks()` → `chunk.getArray(field)` (ghi: đánh dấu chunk đã đổi), `getArrayRO` (chỉ đọc), `chunk.entities`, `chunk.count`. Field vector chiếm `stride` số liên tiếp (`float3` = 3).
- **Enableable**: `em.setComponentEnabled(e, Stunned, false)`; query `withAll` bỏ qua entity đang tắt, `withDisabled` chỉ lấy chúng. Khi query có component enableable, dùng `query.forEachChunk((chunk, mask) => …)` (mask = 1 cho dòng khớp, null = cả chunk khớp).
- **Change filter**: `query.setChangedVersionFilter(LocalTransform)` → chỉ những chunk bị ghi từ lần update trước của system sở hữu query (như Unity: theo chunk).
- **Shared component**: entity cùng giá trị nằm chung chunk (`setSharedComponentFilter`). `RenderMesh` là shared nên mỗi mesh + material là một nhóm chunk = một draw call.
- **Buffer**: `em.addBuffer(e, Waypoint).add({ position: [1, 2, 3] })`; `buf.data` là `Float64Array`, `buf.stride` số / phần tử.
- **Singleton**: `SystemAPI.getSingleton(Config)`, `SystemAPI.getSingletonEntity(Config)`.
- **Prefab**: entity có tag `Prefab` bị query bỏ qua; `LinkedEntityGroup` giữ cả cây — `instantiate` chép cả nhóm và đổi tham chiếu entity bên trong sang bản sao; `destroyEntity` huỷ cả nhóm.

## Structural change và EntityCommandBuffer

Thêm / bớt component, tạo / huỷ entity làm entity đổi chunk: **không** làm giữa lúc duyệt query (`forEach` sẽ báo lỗi). Ghi vào ECB rồi để sync point phát lại:

```ts
const ecb = SystemAPI.getSingletonObject(EndSimulationEntityCommandBufferSystem.Singleton).createCommandBuffer();
const b = ecb.instantiate(bulletPrefab);                     // entity "deferred"
ecb.setComponent(b, LocalTransform, { position: [x, y, 0] });
ecb.destroyEntity(oldBullet);
```

Lệnh được lưu trong typed array (giá trị chép lúc ghi), phát theo thứ tự ghi; `asParallelWriter()` nhận `sortKey` và phát theo key (ổn định). Các sync point: `Begin/EndInitialization…`, `BeginSimulation…`, `Begin/EndFixedStepSimulation…`, `EndSimulation…`, `BeginPresentation…`.

## System, group và thứ tự frame

| Pha của frame (PlayerLoop) | Group |
|---|---|
| sau Start, trước MonoBehaviour `update` | `InitializationSystemGroup` |
| sau `update` + coroutine, trước `lateUpdate` | `SimulationSystemGroup`: BeginSimulationECB → FixedStepSimulationSystemGroup → system của bạn → LateSimulationSystemGroup → EndSimulationECB → TransformSystemGroup |
| sau `lateUpdate` (trước khi vẽ) | `PresentationSystemGroup`: EntitiesGraphicsSystem |

- Mọi `SystemBase` được export từ script/package tự được tạo (mặc định trong Simulation). `ISystem` cần một decorator vì interface không còn lại lúc chạy.
- **Khác Unity**: `TransformSystemGroup` chạy **sau** EndSimulationECB để entity vừa spawn có `LocalToWorld` đúng ngay frame đầu.
- `system.enabled = false` tắt system (Systems window có checkbox). `requireForUpdate(T)` chỉ chạy khi có entity khớp.
- `FixedStepSimulationSystemGroup.timestep` (mặc định 1/60): chạy 0…n lần / frame, `SystemAPI.time.deltaTime` = timestep.
- MonoBehaviour nói chuyện với world qua `World.defaultGameObjectInjectionWorld.entityManager` (xem sample BulletHell2D: con tàu là GameObject, ghi vị trí vào singleton).

## Baking

- **SubScene**: mọi con cháu của GameObject có `SubScene` thành entity lúc Play (theo thứ tự: tạo entity cho mọi object → chạy baker → thêm transform), rồi SubScene bị tắt. Camera, Light, UI để **ngoài** SubScene.
- **`Baker<T>`** + `@bakes(Authoring)`: `getEntity(flags)` (entity của object này), `getEntity(prefabOrObject, flags)` (prefab được bake thành prefab entity một lần), `addComponent`, `addBuffer`, `appendToBuffer`, `addSharedComponent`, `createAdditionalEntity`, `getComponent…`.
- **`TransformUsageFlags`**: `None` (không transform), `Renderable` (chỉ `LocalToWorld`, tĩnh — rẻ nhất), `Dynamic` (`LocalTransform` + `LocalToWorld`, có `Parent` khi cha cũng Dynamic), `WorldSpace`, `NonUniformScale` (scale lệch → `PostTransformMatrix`). Con `Renderable` của cha `Dynamic` tự thành Dynamic để đi theo cha.
- Baker có sẵn: **MeshFilter + MeshRenderer** → `RenderMesh` + `RenderBounds` (+ `MaterialColor` khi dùng màu của renderer), **SpriteRenderer** → `RenderSprite` (+ `MaterialColor`).
- Code: `BakingUtility.bakePrefab(world, prefabGameObject)`, `BakingUtility.bakeGameObjects(world, roots)`.

## Vẽ

`EntitiesGraphicsSystem` (Presentation) gom entity có `RenderMesh` / `RenderSprite` + `LocalToWorld` (trừ `DisableRendering`):

1. Theo chunk: tính bounds thế giới (cache trong chunk, chỉ tính lại khi `LocalToWorld` đổi), loại chunk ngoài frustum của camera chính, chunk cắt frustum thì loại từng entity.
2. Chép ma trận vào một mảng / nhóm (mesh + material), màu `MaterialColor` → `_Color` từng instance.
3. `Graphics.drawMeshInstanced` một lần / nhóm (3D: một `InstancedMesh` three.js; 2D: sprite Pixi, Pixi tự batch).

Tuỳ chọn: `frustumCulling` (tắt = vẽ hết), `cullingCamera`; thống kê `drawCalls`, `visibleCount`, `culledCount`.

## Cửa sổ editor

- **Window ▸ Entities ▸ Systems**: cây group / system của world, checkbox bật/tắt, số entity system đang xử lý, ms trung bình. Ngoài Play Mode: danh sách system sẽ được tạo.
- **Window ▸ Entities ▸ Hierarchy**: world, archetype (số entity, số chunk × sức chứa), tìm theo tên / component; chọn entity xem giá trị component (chỉ đọc, cập nhật trực tiếp).
- Authoring component hiện trong Inspector như component thường.

![Cửa sổ Entities Systems trong Play Mode: cây group / system, checkbox, số entity và ms; Game view vẽ 10 000 cube bằng 1 draw call](/images/entities-systems.png)

![Cửa sổ Entities Hierarchy: archetype, danh sách entity lọc theo component, giá trị component của entity đang chọn](/images/entities-hierarchy.png)

![Sample BulletHell2D: đạn là entity (sprite instanced), con tàu là GameObject](/images/entities-bullethell.png)

## Samples (`Samples~`)

Chép thư mục `Samples~/<tên>` vào `Assets/` của project (Unity cũng giấu thư mục `~`):

| Sample | Nội dung |
|---|---|
| `SpinningCubes` | HelloCube: 10 000 cube từ prefab, `CubeSpawnSystem` + `RotationSystem` + `BobSystem` → 1 draw call |
| `Swarm` | 4 000 con boid (tách / dóng hàng / gắn kết) với spatial hash trong typed array, `PostTransformMatrix` (scale lệch) |
| `PhysicsLite` | đài phun: vận tốc, trọng lực, nảy trên mặt phẳng (AABB vs plane), lifetime — trong `FixedStepSimulationSystemGroup`, spawn / huỷ qua ECB (không phải engine vật lý) |
| `BulletHell2D` | 2D, hợp với Playable Ads (sprite có sẵn, không vật lý): emitter phun đạn xoắn ốc qua ECB, đạn va chạm tàu (GameObject) qua singleton |

## Hiệu năng (đo thật)

Node 22, máy ít tải (`Tests~/bench.ts`, bundle esbuild):

| Trường hợp | ms / frame | GC trong 300 frame |
|---|---|---|
| 100 000 entity: move + spin (2 system) | **1,4 – 1,6** | **0** |
| như trên + `LocalToWorld` cho cả 100 000 | 3,7 | 0 |
| instantiate 10 000 từ prefab + destroy (mỗi frame) | 2,6 | rất ít (chunk được pool) |
| 100 000 GameObject: `MonoBehaviour.update` (cùng việc) | 13,6 – 14,6 | 124 lần (~0,5 s) |
| tạo 100 000 entity / GameObject | 14 – 23 ms / 1,7 s | |

Chrome headless (đồ hoạ phần mềm SwiftShader nên CPU bị chia; số tuyệt đối cao hơn máy thật), 10 000 cube quay:

| | ECS | GameObject |
|---|---|---|
| script + system | 4,6 ms | 19,4 ms |
| renderer sync | 1,0 ms | 82 ms |
| renderGame (CPU) | 2,5 ms | 428 ms |
| GL draw call | **3** | **11 012** |

2D (BulletHell2D bị đẩy lên): 31 000 viên đạn, 22 000 viên trong màn hình, 2 nhóm vẽ. Playable Ads (AppLovin, base122) của sample 2D: 395 KB.

Mẹo: tạo query trong `onCreate`; dùng `getArray` / `getArrayRO` thay vì `getComponentData` trong vòng lặp; `getArrayRO` khi chỉ đọc để change filter chính xác; entity tĩnh thì bake `Renderable` (không có `LocalTransform` = không tính lại ma trận).

## Giới hạn

- **Job chạy tuần tự** trên main thread (`schedule` / `scheduleParallel` chạy ngay). Đã cân nhắc Web Worker: cần `SharedArrayBuffer` (header COOP/COEP — các mạng quảng cáo playable không có), và chép chunk qua lại tốn hơn chính vòng lặp ở quy mô vài chục nghìn entity → không làm.
- **Baking lúc Play**, không lúc build: không có file entity scene, không live/incremental baking; SubScene là con của một GameObject chứ không phải file scene riêng.
- Chưa có: Aspect, cleanup / system-state component, chunk component, blob asset, write group, Unity Physics / NetCode (chỉ "physics-lite" trong sample).
- Vẽ: material đầu tiên của MeshRenderer; chỉ `_Color` theo instance; mesh của model không có bounds → không bị cull (tự thêm `RenderBounds`); cull theo camera chính nên Scene view chỉ thấy entity trong tầm camera đó; chưa có LOD, SkinnedMeshRenderer. 2D: texture + tint của sprite (shader 2D tuỳ biến không áp lên đường instanced), Pixi tạo một sprite / instance.
- Structural change trong `forEach` / job báo lỗi; khi tự duyệt `chunks()` thì tự tránh.
- Tối đa ~4,19 triệu entity sống cùng lúc (22 bit index).
- **Build**: script chỉ chứa system (không ai nhắc tên) bị strip — để system chung file với component / authoring của nó, hoặc thêm `// @pia-keep`.
