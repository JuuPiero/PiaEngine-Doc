---
title: Từ Unity sang PiaEngine
description: Bảng đối chiếu khái niệm và API giữa Unity và PiaEngine, cùng những điểm khác cần biết.
---

# Từ Unity sang PiaEngine

PiaEngine cố ý giữ **tên và hành vi của Unity**. Khác biệt chính: script là **TypeScript** nên API viết **camelCase** (`getComponent`, `addComponent`, `transform.position`), và chạy trên web.

## Khái niệm & API

| Unity | PiaEngine |
|---|---|
| `GameObject`, `Component`, `Transform` | Cùng tên. `getComponent(Rigidbody)`, `addComponent(AudioSource)`, `transform.position`… |
| `MonoBehaviour` + `Awake/OnEnable/Start/Update/LateUpdate/FixedUpdate/OnDisable/OnDestroy` | `awake/onEnable/start/update/lateUpdate/fixedUpdate/onDisable/onDestroy`, cùng thứ tự gọi |
| `OnValidate`, `Reset` | `onValidate`, `reset` (chỉ trong editor) |
| public field / `[SerializeField]` | Field public (number, boolean, string, Vector2/3, Color) tự hiện trong Inspector; `@field(...)` để thêm range, enum, asset, tham chiếu GameObject |
| `[Range]`, `[Header]`, `[Tooltip]`, `[TextArea]` | `@field({ range: [0, 10] })`, `@field({ header: '...' })`, `@field({ tooltip: '...' })`, `@field({ multiline: true })` |
| `[HideInInspector]`, `[NonSerialized]` | `@hideInInspector`, `@nonSerialized`, hoặc đặt tên bắt đầu bằng `_` |
| `[FormerlySerializedAs]` | `@field({ formerlySerializedAs: 'tênCũ' })` |
| `T[]` / `List<T>`, `[Serializable]` class | `@field(['string']) names: string[] = []`, `@field([Wave]) waves: Wave[] = []` với `@serializable class Wave {...}` |
| `UnityEvent` | `PiaEvent` (ví dụ `Button.onClick`) |
| `ScriptableObject`, `[CreateAssetMenu]`, `CreateInstance` | `extends ScriptableObject`, `@createAssetMenu({...})`, asset `.asset.json`, `ScriptableObject.createInstance(T)` |
| `Instantiate`, `Destroy(obj, t)` | `this.instantiate(...)`, `this.destroy(obj, t)` |
| `StartCoroutine`, `yield return new WaitForSeconds(1)` | `this.startCoroutine(gen())`, `yield new WaitForSeconds(1)` (generator function) |
| `Invoke`, `InvokeRepeating` | `this.invoke`, `this.invokeRepeating` |
| `SendMessage`, `BroadcastMessage` | `gameObject.sendMessage`, `broadcastMessage`, `sendMessageUpwards` |
| `GameObject.Find`, `FindWithTag` | `GameObject.find`, `GameObject.findWithTag`, `GameObject.findGameObjectsWithTag` |
| `FindObjectsOfType<T>()` | `this.gameObject.scene?.findObjectsOfType(T)` |
| `Time`, `Input`, `Debug.Log`, `Mathf` | `Time.deltaTime`, `Input.getAxis('Horizontal')`, `Input.getKeyDown('Space')`, `Debug.log`, `Mathf.clamp` |
| `SceneManager.LoadScene` | `SceneManager.loadScene('Level2')` (theo tên hoặc index trong Build Settings) |
| `Camera.main`, `ScreenToWorldPoint` | `Camera.main`, `camera.screenToWorldPoint(...)` |
| Prefab, Prefab Mode, Apply / Revert / Unpack | Giống Unity (kể cả prefab lồng nhau, override in đậm). Kéo object từ Hierarchy vào Project để tạo prefab |
| `Rigidbody`, `BoxCollider`…, `OnCollisionEnter`, `OnTriggerEnter`, `Physics.Raycast` | `Rigidbody`, `BoxCollider`, `SphereCollider`, `CapsuleCollider`, `onCollisionEnter`, `onTriggerEnter`, `Physics.raycast` |
| `Rigidbody2D`, `BoxCollider2D`, `OnTriggerEnter2D`, `Physics2D.Raycast` | `Rigidbody2D`, `BoxCollider2D`, `CircleCollider2D`, `CapsuleCollider2D`, `onTriggerEnter2D`, `Physics2D.raycast` |
| Joint, Effector 2D, `CharacterController`, `ConstantForce` | Cùng tên: `HingeJoint`, `HingeJoint2D`, `WheelJoint2D`, `PlatformEffector2D`, `CharacterController.move`… — xem [Joint, Effector & CharacterController](../components/physics-joints.md) |
| `AudioSource`, `AudioListener`, `PlayOneShot`, `PlayClipAtPoint` | Cùng tên: `playOneShot`, `AudioSource.playClipAtPoint`; Spatial Blend = 1 là âm thanh 3D |
| `Canvas`, `RectTransform`, `Image`, `Text`, `Button.onClick` | Cùng tên (UI vẽ bằng DOM overlay, anchor/pivot theo công thức Unity) |
| `LineRenderer` (`SetPosition`, `positionCount`, Edit Points), `TrailRenderer` (`time`, `emitting`, `Clear`) | Cùng tên, API camelCase; chạy 2D và 3D; kéo điểm trong Scene view — xem [Line Renderer & Trail Renderer](../components/line-trail-renderer.md) |
| `Animation` + `.anim`, cửa sổ Animation | `Animation` + `.anim.json`, Window → Animation (<kbd>Ctrl</kbd>+<kbd>6</kbd>), nút Record, animation event |
| Model import (FBX/glTF/OBJ), model prefab, `SkinnedMeshRenderer`, `Animator` (`Play`, `CrossFade`), ModelImporter (Model / Rig / Animation / Materials, Convert Units, Extract Materials) | kéo model vào Scene → cây GameObject liên kết với model, cùng tên component / field; Animator chưa có state machine. Xem [Model 3D](../assets/models.md) |
| Sprite Editor, Sprite Mode Multiple, 9-slice, Draw Mode Sliced / Tiled | Giống Unity — xem [Sprite Editor & 9-slice](../assets/sprite-editor.md) |
| Odin Inspector (`[Button]`, `[ShowIf]`, `[BoxGroup]`…), `CustomPropertyDrawer` | `@button`, `@showIf`, `@boxGroup`… trong `@pia/core`, `ctx.registerPropertyDrawer` — xem [Inspector attributes](../scripting/inspector-attributes.md) |
| `OnDrawGizmos`, `Gizmos.DrawWireSphere`, `Handles.Label`, `OnSceneGUI` | `onDrawGizmos()` với `Gizmos.drawWireSphere`, `Handles.label`…, hoặc `ctx.registerSceneGizmo` — xem [Editor extension](../packages/editor-extensions.md#gizmo-va-handle-trong-scene-view) |
| `TextAsset` | `TextAsset`, `JsonAsset<T>` (đã parse), `BufferAsset` (nhị phân) — xem [TextAsset](../scripting/text-assets.md) |
| `#if UNITY_EDITOR` | `if (EDITOR) { ... }` (bị loại khỏi bản build) |
| Cửa sổ Stats, `UnityStats.drawCalls` | Nút **Stats** của Game view; `RenderStats.drawCalls`, `setPassCalls`, `triangles`, `vertices` — xem [Play Mode](../editor/play-mode.md#stats-draw-call) |
| Find References In Scene, khoá Inspector | Cùng tên — xem [Hierarchy & Inspector](../editor/hierarchy-inspector.md#find-references) |
| Cinemachine, Splines, UI Toolkit, spine-unity | Package [Cinemachine](../official/cinemachine.md), [Spline](../official/spline.md), [UI Toolkit (HTML / CSS)](../official/ui-toolkit.md), [Spine](../official/spine.md) |
| `Material`, `Shader`, ShaderLab | `Material` (`.mat.json`), `Shader` (`.shader`, cú pháp kiểu ShaderLab với GLSL) |
| `Resources.Load` | `await Resources.load('Enemies/Goblin', EnemyData)`, `Resources.loadPrefab(...)`, `Resources.loadAll(...)` |
| Package Manager, `Packages/manifest.json` | Window → Package Manager; manifest là `package.json` của project |
| Thư mục `Editor/`, `MenuItem`, custom Editor | `Assets/**/Editor/*.ts` hoặc `Editor/` của package, `defineEditorExtension` |
| Unity Hub | Project Hub (`npm run editor`) |

## Những điểm khác cần nhớ

::: warning Hệ toạ độ 3D
3D dùng hệ **right-handed, forward = -Z** (giống three.js), khác Unity (left-handed, forward = +Z). Camera và Light nhìn theo trục **-Z** cục bộ của chúng. Trong 2D, trục Y vẫn hướng lên và 100 pixel = 1 unit như Unity.
:::

- **Vector là bản sao**: getter như `transform.position`, `rigidbody.velocity` trả về bản sao (như struct C#). Viết `const p = t.position; p.x += 1; t.position = p;`.
- **Phép toán vector là method**: không có operator overloading trong TypeScript, dùng `a.add(b)`, `a.sub(b)`, `v.mul(2)`, `Vector3.lerp(a, b, t)`.
- **Asset field là chuỗi**: field sprite / audio / texture lưu **GUID** dạng chuỗi (`@field({ assetType: 'audio' }) clip = ''`), truyền thẳng chuỗi đó cho `playOneShot(clip)`.
- **Nạp asset là bất đồng bộ**: `Resources.load` và `SceneManager.loadScene` trả về `Promise`, dùng `await`.
- **ScriptableObject trong Play Mode**: script đổi giá trị asset khi đang chơi thì khi Stop giá trị quay về bản đã lưu (Unity thì giữ lại).
- **Enum trong Inspector là chuỗi**: ví dụ `camera.clearFlags = 'Solid Color'`, `light.type = 'Point'`.
- **Decorator**: `@field`, `@serializable`, `@createAssetMenu` là decorator TypeScript (project mới đã bật `experimentalDecorators` trong `tsconfig.json`).
