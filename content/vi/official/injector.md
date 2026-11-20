---
title: PiaInjector (DI)
description: Package com.pia.injector — dependency injection kiểu VContainer: LifetimeScope, Singleton / Scoped / Transient, @inject, entry point trong player loop, scope con cho prefab, Diagnostics.
---

# PiaInjector (`com.pia.injector`)

Dependency injection (DI) cho PiaEngine, theo mô hình **VContainer** của Unity (cùng khái niệm, cùng tên, viết camelCase):

- **`LifetimeScope`**: component dựng một container từ hàm `configure(builder)`. Scope của scene, scope con trong prefab, scope gốc cho cả project.
- Lifetime **Singleton / Scoped / Transient**, đăng ký theo interface (`.as(IFoo)`), keyed, factory, instance, collection.
- **`@inject`** cho field, method, constructor (kể cả tham số), dùng được trên MonoBehaviour lẫn class thường.
- **Entry point** chạy trong player loop của engine: `IStartable`, `ITickable`, `IFixedTickable`, `ILateTickable`, `IAsyncStartable`…, không cần MonoBehaviour.
- `resolver.instantiate(prefab)` inject mọi component của bản sao **trước Awake**.
- Phát hiện **vòng phụ thuộc** khi build (báo cả đường đi). Lỗi thiếu đăng ký chỉ rõ component, field và GameObject.
- Editor: Inspector của LifetimeScope liệt kê các đăng ký, cửa sổ **PiaInjector Diagnostics** (VContainer Diagnostics thu gọn).
- Resolve được "biên dịch" thành closure lưu sẵn: singleton ~18 ns, đồ thị transient 7 object ~70 ns (Node, 100 000 lần).

## Cài

```bash
cd MyGame
npm install ../PiaEngine/pia-packages/com.pia.injector     # hoặc Window → Package Manager → Add package from disk
```

Bản build chỉ chứa package khi scene / script được build thật sự dùng nó (nếu không: bị loại, 0 byte).

## Bắt đầu nhanh

**1. Service** (class thường) + token cho interface — TypeScript xoá interface khi chạy, nên interface cần một `InjectionToken` cùng tên:

```ts
import { InjectionToken, implementsInterfaces } from 'com.pia.injector';

export interface IScoreService { readonly score: number; add(points: number): void }
export const IScoreService = new InjectionToken<IScoreService>('IScoreService');

@implementsInterfaces(IScoreService)            // cho .asImplementedInterfaces()
export class ScoreService implements IScoreService {
  score = 0;
  add(points: number) { this.score += points; }
}
```

**2. Entry point** (VContainer `IStartable` / `ITickable`): constructor nhận phụ thuộc, token liệt kê trên class theo thứ tự tham số:

```ts
import { inject, type IStartable, type ITickable } from 'com.pia.injector';

@inject(IScoreService, IAudioService)
export class GamePresenter implements IStartable, ITickable {
  constructor(private score: IScoreService, private audio: IAudioService) {}
  start() { this.audio.play('start'); }
  tick() { /* mỗi frame, trước Update của MonoBehaviour */ }
}
```

**3. LifetimeScope** của scene:

```ts
import { Lifetime, LifetimeScope, type IContainerBuilder } from 'com.pia.injector';

export class GameLifetimeScope extends LifetimeScope {
  configure(builder: IContainerBuilder) {
    builder.register(ScoreService, Lifetime.Singleton).asImplementedInterfaces();
    builder.register(LogAudioService, Lifetime.Singleton).as(IAudioService);
    builder.registerComponentInHierarchy(EnemySpawner);
    builder.registerEntryPoint(GamePresenter);
  }
}
```

Tạo nhanh: **Assets → Create → PiaInjector → Lifetime Scope Script**, rồi **GameObject → PiaInjector → Lifetime Scope** (hoặc Add Component script vừa tạo).

**4. MonoBehaviour** nhận phụ thuộc bằng field / method:

```ts
export class ScoreView extends MonoBehaviour {
  @inject(IScoreService) score!: IScoreService;          // field
  @inject(IAudioService) construct(audio: IAudioService) {} // method (VContainer [Inject] Construct)
  awake() { this.score.add(0); }                         // đã được inject trước Awake
}
```

Khi scene bắt đầu chạy, mọi LifetimeScope đang active (Auto Run bật) được build **trước mọi Awake**, scope cha trước scope con.

## VContainer ↔ PiaInjector

| VContainer (C#) | PiaInjector (TS) |
|---|---|
| `class X : LifetimeScope { protected override void Configure(IContainerBuilder b) }` | `class X extends LifetimeScope { configure(b: IContainerBuilder) }` |
| `builder.Register<Foo>(Lifetime.Singleton)` | `builder.register(Foo, Lifetime.Singleton)` |
| `.As<IFoo>()` / `.AsSelf()` / `.AsImplementedInterfaces()` | `.as(IFoo)` / `.asSelf()` / `.asImplementedInterfaces()` (interface khai báo bằng `@implementsInterfaces(...)`; entry point + `IDisposable` tự nhận theo method) |
| `builder.Register<IFoo>(c => new Foo(), Lifetime.Scoped)` | `builder.register((r) => new Foo(), Lifetime.Scoped).as(IFoo)` (arrow function) |
| `builder.RegisterInstance(obj)` | `builder.registerInstance(obj)` (+ `.as(...)` nếu là object thường) |
| `RegisterFactory<T>(Func<T>)` / `RegisterFactory<P,T>(c => p => …, Lifetime)` | `registerFactory(token, () => …)` / `registerFactory(token, (r) => (p) => …, Lifetime.Scoped)`; `factoryOf(Foo)` = token `Func<Foo>` |
| `RegisterEntryPoint<T>()` | `registerEntryPoint(T)` |
| `RegisterEntryPointExceptionHandler` | `registerEntryPointExceptionHandler(fn)` |
| `RegisterBuildCallback` / `RegisterDisposeCallback` | `registerBuildCallback` / `registerDisposeCallback` |
| `RegisterComponent(c)` / `RegisterComponentInHierarchy<T>()` | `registerComponent(c)` / `registerComponentInHierarchy(T)` (`.underTransform(t)`) |
| `RegisterComponentOnNewGameObject<T>(lt, name)` / `RegisterComponentInNewPrefab(prefab, lt)` | `registerComponentOnNewGameObject(T, lt, name)` / `registerComponentInNewPrefab(T, prefab, lt)` |
| `.Keyed(key)` + `[Key(key)]` | `.keyed(key)` + `@inject(keyed(IFoo, key))` / `resolve(IFoo, key)` |
| `.WithParameter<T>(v)` / `.WithParameter("name", v)` | `.withParameter(token, v)` / `.withParameter(index, v)` |
| `[Inject]` field / property / method / constructor | `@inject(Token)` field, `@inject(A, B)` method, `@inject(A, B)` trên class hoặc `@inject(A)` từng tham số constructor |
| `IEnumerable<T>` / `IReadOnlyList<T>` | `@inject(all(IFoo)) foos!: IFoo[]` / `resolver.resolveAll(IFoo)` |
| `resolver.Resolve<T>()` / `TryResolve` / `ResolveOrDefault` | `resolve(T)` / `tryResolve(T)` (null khi thiếu) / `resolveOrDefault(T, v)`; `optional(T)` cho field |
| `resolver.Inject(obj)` / `InjectGameObject(go)` | `inject(obj)` / `injectGameObject(go)` |
| `resolver.Instantiate(prefab, …)` | `resolver.instantiate(prefab, parent?)` / `(prefab, pos, rot, parent?)` |
| `CreateScope(b => …)` | `createScope(b => …)` (nhớ `dispose()`, hoặc để scope cha dispose) |
| `LifetimeScope.parentReference` (TypeName) | `parentReference` (tham chiếu) / `parentTypeName` (Parent Type) |
| `autoRun`, `autoInjectGameObjects` | giống tên |
| `using (LifetimeScope.EnqueueParent(p))` / `Enqueue(installer)` | `const h = LifetimeScope.enqueueParent(p); try { … } finally { h.dispose(); }` / `LifetimeScope.enqueue(installer)` |
| `scope.CreateChild(installer)` / `CreateChildFromPrefab(prefab)` | `scope.createChild(installer)` / `scope.createChildFromPrefab(prefab)` |
| `LifetimeScope.Find<T>()` | `LifetimeScope.find(T)` |
| Root LifetimeScope qua VContainerSettings | `ProjectLifetimeScope.configure(b => …)` (trong code) |
| `IInitializable`, `IPostInitializable`, `IStartable`, `IPostStartable`, `IAsyncStartable`, `ITickable`, `IPostTickable`, `IFixedTickable`, `IPostFixedTickable`, `ILateTickable`, `IPostLateTickable` | cùng tên; method `initialize`, `postInitialize`, `start`, `postStart`, `startAsync(signal)`, `tick`, `postTick`, `fixedTick`, `postFixedTick`, `lateTick`, `postLateTick` |
| `IDisposable.Dispose()` | `dispose()` |

**Không có / khác VContainer:**
- Inject tự động mọi component có `@inject` trong scene (không chỉ `autoInjectGameObjects`): component nằm dưới một LifetimeScope nhận từ scope gần nhất phía trên; component không thuộc scope nào nhận từ scope cấp cao nhất đầu tiên của scene (không có thì từ `ProjectLifetimeScope`, nếu không thì cảnh báo trong Console).
- Scope lồng nhau trong Hierarchy tự lấy scope phía trên làm cha (VContainer bắt buộc Parent reference).
- Root scope qua settings asset chưa có (dùng `ProjectLifetimeScope.configure` trong một script).
- Không có source generator / IL weaving: metadata đến từ decorator, resolve được biên dịch thành closure khi dùng lần đầu.

## Thứ tự trong player loop

| Lúc | Entry point |
|---|---|
| Ngay khi container build (scene bắt đầu: trước mọi Awake) | `initialize`, `postInitialize` |
| Đầu frame kế tiếp (trước FixedUpdate / Start của MonoBehaviour) | `start`, `postStart`, `startAsync` (1 lần) |
| Mỗi bước fixed, trước `fixedUpdate` | `fixedTick` |
| Sau `fixedUpdate` + bước vật lý | `postFixedTick` |
| Mỗi frame, trước `update` | `tick` |
| Sau `update` | `postTick` |
| Trước `lateUpdate` | `lateTick` |
| Sau `lateUpdate` | `postLateTick` |
| Scope bị huỷ (destroy GameObject, đổi scene, Stop Play Mode) | `dispose` (ngược thứ tự tạo, scope con trước) |

Lỗi trong entry point được ghi ra Console (hoặc gửi cho `registerEntryPointExceptionHandler`), không dừng các entry point khác. `startAsync` nhận `AbortSignal`, bị abort khi scope dispose.

## Lifetime

| Lifetime | Instance |
|---|---|
| `Singleton` | một cho scope đăng ký nó **và mọi scope con** (phụ thuộc của nó lấy từ scope đăng ký) |
| `Scoped` | một cho mỗi scope resolve nó: scope con có instance riêng |
| `Transient` | mới mỗi lần resolve (không được dispose tự động) |

`registerInstance` / `registerComponent` luôn là cùng một object và không bị container dispose. Scope con đăng ký lại cùng token thì **ghi đè** scope cha; `all(T)` gộp đăng ký của các scope cha trước rồi đến scope con.

## Prefab và scope con

```ts
export class EnemyLifetimeScope extends LifetimeScope {   // trên root của prefab Enemy
  points = 10;
  configure(builder: IContainerBuilder) {
    builder.registerInstance(new EnemyStats(this.points));
    builder.register(EnemyBrain, Lifetime.Scoped);
  }
}

export class EnemySpawner extends MonoBehaviour {
  @field({ type: 'gameObject' }) enemyPrefab: GameObject | null = null;
  @inject(IObjectResolver) private _resolver!: IObjectResolver;
  spawn() { this._resolver.instantiate(this.enemyPrefab!, pos, Quaternion.identity); }
}
```

`resolver.instantiate` tạo bản sao với Awake tạm hoãn, inject mọi component, rồi mới chạy Awake. LifetimeScope trong bản sao nhận scope của resolver làm cha. Đặt LifetimeScope là **component đầu tiên** trên root của prefab: component đứng trước nó trên cùng GameObject sẽ Awake trước khi được inject.

`instantiate` / `addComponent` thường của engine **không** inject (giống VContainer). Từ một MonoBehaviour không có resolver: `LifetimeScope.resolverFor(this.gameObject)?.instantiate(prefab)`.

Cách chọn scope cha, theo thứ tự: scope được enqueue (`enqueueParent`, `resolver.instantiate`) → **Parent Reference** → **Parent Type** (scope đã build hoặc trong scene đang chạy) → LifetimeScope gần nhất phía trên trong Hierarchy → `ProjectLifetimeScope` → không có (scope gốc). Scope cha có Auto Run tắt: scope con chờ đến khi cha được `build()`.

## Decorator: những điều cần biết

TypeScript không giữ kiểu của tham số / field khi chạy (repo không dùng `emitDecoratorMetadata`), nên **mọi chỗ inject phải ghi token**:

- `@inject(Foo) foo!: Foo` — đúng. `@inject() foo!: Foo` — sai (không biết inject gì).
- Constructor: `@inject(A, B)` trên class, hoặc `constructor(@inject(A) a: A, @inject(B) b: B)`. Constructor có tham số mà không khai báo token → lỗi rõ ràng khi resolve.
- **Field được gán sau khi constructor chạy xong.** Với `useDefineForClassFields` (bật trong PiaEngine), field `foo!: Foo` lúc đầu là `undefined`. Đừng đọc field được inject trong constructor hay trong initializer của field khác; dùng `awake` / `start` / method inject.
- Lớp con khai báo lại field của lớp cha (`foo!: Foo` không decorator) vẫn được inject, vì inject chạy sau constructor. Dùng `declare foo: Foo` nếu chỉ muốn đổi kiểu.
- Field / method `@inject` được **kế thừa**. Method override chỉ được gọi một lần (bản của lớp con); token của tham số constructor lấy từ lớp gần nhất có khai báo.
- Field inject không được serialize, không hiện trong Inspector (giá trị mặc định `undefined` / `null`). Tên bắt đầu bằng `_` vẫn inject được.
- Token `undefined` (thường do import vòng: class dùng trước khi được khai báo) → lỗi ngay khi khai báo `@inject(undefined)`. Tách token / interface ra file riêng.
- Đăng ký bằng lambda phải là **arrow function** (`(r) => new Foo()`): hàm có `prototype` (class, `function`) được coi là class.
- Class bên ngoài (thư viện) không gắn được decorator: `injectConstructor(Lib, [A, 'apiUrl'])`.

## Editor

- **Inspector của LifetimeScope** (và mọi lớp con): field mặc định, rồi khung **Container**: scope cha và danh sách đăng ký (token → implementation, lifetime, EntryPoint). Edit Mode hiển thị bản xem trước (chạy `configure` trên builder tạm). Play Mode hiển thị container thật, kèm số lần resolve / instance; bấm một dòng để xem đồ thị phụ thuộc.
- **Window → Extensions → PiaInjector Diagnostics**: cây các scope đang sống (scope con của prefab hiện dưới scope cha), đăng ký, số lần resolve / instance, đồ thị phụ thuộc (đánh dấu vòng), số scope đang trong player loop, danh sách lỗi inject.
- Lỗi thiếu đăng ký ghi rõ: `no registration for IScoreService (required by field 'score' of ScoreView) in scope 'GameLifetimeScope (GameLifetimeScope)' — component ScoreView on 'GameLifetimeScope/HUD'`.

## Sample

`Samples~/BasicGame` (copy vào `Assets/` để dùng): ScoreService, LogAudioService, KeyboardInputService; `GamePresenter` (entry point `IStartable` + `ITickable`, inject qua constructor); `GameLifetimeScope` của scene; prefab `Enemy` có `EnemyLifetimeScope` (scope con với `EnemyStats` / `EnemyBrain` riêng); `EnemySpawner` dùng `resolver.instantiate`; `ScoreView` dùng method injection. Mở `Scenes/InjectorSample.scene.json` rồi Play: địch rơi xuống, chạm đáy được +10 điểm, Space / chuột +1.

## Hiệu năng

Lần resolve đầu của mỗi đăng ký trong một scope dựng một closure (`() => new Impl(dep0(), dep1())` + bộ gán field / method) và lưu lại. Các lần sau chỉ gọi closure: không đọc metadata, không tra Map cho từng phụ thuộc. Đo trên Node, 100 000 lần resolve một đồ thị 5 class / 7 object:

| | ns / resolve |
|---|---|
| tự viết `new` | 16 |
| Transient (7 object mới) | 68 |
| Scoped (đã có trong scope) | 27 |
| Singleton | 18 |
| Singleton từ scope con cấp 3 | 19 |

Tạo scope mới tốn khoảng 2–3 µs: tạo scope cho từng prefab là được, đừng tạo scope mỗi frame.
