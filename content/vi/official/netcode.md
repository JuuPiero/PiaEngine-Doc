---
title: PiaNetcode (Netcode for GameObjects API)
description: Package com.pia.netcode — multiplayer cho PiaEngine: NetworkManager, NetworkObject, NetworkVariable, RPC, NetworkTransform, dự đoán phía client, transport Loopback / WebSocket / WebRTC, dedicated server, Multiplayer Play Mode.
---

# PiaNetcode — multiplayer cho PiaEngine (`com.pia.netcode`)

Multiplayer cho PiaEngine theo API **Netcode for GameObjects** (NGO) của Unity — cùng khái niệm, cùng tên, viết camelCase. Đây là bản viết lại độc lập từ tài liệu công khai, không chép mã nguồn NGO / Mirror / FishNet, không liên kết với Unity.

- **`NetworkManager`** (singleton): `startHost` / `startServer` / `startClient` / `shutdown`, `isServer` / `isClient` / `isHost` / `isListening`, `localClientId`, `connectedClients(Ids)`, callback kết nối / ngắt / duyệt kết nối, `networkConfig` (player prefab, danh sách prefab mạng, tick rate, connection data), `spawnManager`, `sceneManager`, `customMessagingManager`.
- **`NetworkObject`**: `spawn` / `spawnWithOwnership` / `spawnAsPlayerObject` / `despawn`, chủ sở hữu (`changeOwnership`, `removeOwnership`), player object, object đặt sẵn trong scene và prefab spawn lúc chạy, ẩn / hiện theo client (`checkObjectVisibility`, `networkHide` / `networkShow`).
- **`NetworkBehaviour`**: `isServer`, `isOwner`, `isLocalPlayer`… và `onNetworkSpawn` / `onNetworkDespawn` / `onGainedOwnership` / `onLostOwnership`.
- **`NetworkVariable<T>`** / **`NetworkList<T>`**: quyền đọc / ghi (Everyone / Owner, Server / Owner), `onValueChanged(prev, next)`, chỉ gửi phần thay đổi mỗi tick; số, chuỗi, bool, Vector2/3, Quaternion, Color, struct `INetworkSerializable`. Hiện trong Inspector (giá trị ban đầu sửa được, chỉ đọc khi Play).
- **RPC**: `@rpc(SendTo.Server | Owner | NotServer | Everyone | ClientsAndHost | NotMe | SpecifiedInParams …)` + `RpcParams` / `RpcTarget`, và kiểu cũ `@serverRpc({ requireOwnership })` / `@clientRpc` + `ClientRpcParams`. Reliable / Unreliable.
- **Component**: `NetworkTransform` (đồng bộ từng trục, ngưỡng, nội suy có bộ đệm, authority Server hoặc Owner = ClientNetworkTransform), `NetworkRigidbody` / `NetworkRigidbody2D`, `NetworkAnimator`, `PredictedCharacterMover` (dự đoán phía client + server reconciliation).
- **Transport**: Loopback (cùng process / cùng trình duyệt qua BroadcastChannel), WebSocket (trình duyệt ↔ server Node), WebRTC (trình duyệt làm host, server signaling nhỏ). **Network Simulator** (độ trễ / jitter / mất gói).
- **Dedicated server**: build target **Dedicated Server** chạy game headless trong Node (không render, vật lý + script chạy bình thường).
- **Editor**: Inspector NetworkManager (Start Host / Server / Client khi Play, client đang kết nối, lưu lượng), cửa sổ **Network Stats**, **Multiplayer Play Mode** (người chơi ảo trong editor, mỗi người một runtime riêng).
- Tick ổn định không cấp phát bộ nhớ (buffer dùng lại, typed array) — có test kiểm tra.

## Cài

```bash
cd MyGame
npm install ../PiaEngine/pia-packages/com.pia.netcode     # hoặc Window → Package Manager → Add package from disk
```

Bản build chỉ chứa package khi scene / script được build dùng nó (không dùng: bị loại hoàn toàn, build giống hệt từng byte). Khi có dùng: phần runtime ≈ 92 KB minified / 27 KB gzip.

## Bắt đầu nhanh

**1. Scene**: **GameObject ▸ Netcode ▸ Network Manager** tạo object có `NetworkManager` + `LoopbackTransport` + `WebSocketTransport`. Trong Inspector: **Network Config ▸ Player Prefab** = prefab nhân vật, **Prefabs** = mọi prefab sẽ spawn qua mạng.

**2. Prefab người chơi**: thêm `NetworkObject`, `NetworkTransform` (Authority Mode = Owner để người chơi tự điều khiển), và script:

```ts
import { Input, Time } from '@pia/core';
import { NetworkBehaviour, NetworkVariable, SendTo, rpc } from 'com.pia.netcode';

export class Player extends NetworkBehaviour {
  speed = 5;
  hp = new NetworkVariable(100);                     // server ghi, mọi người đọc

  onNetworkSpawn(): void {
    this.hp.onValueChanged.addListener((prev, next) => console.log(`hp ${prev} → ${next}`));
  }

  update(): void {
    if (!this.isOwner) return;                       // chỉ chủ sở hữu điều khiển
    const p = this.transform._lp;
    p.x += Input.getAxisRaw('Horizontal') * this.speed * Time.deltaTime;
    if (Input.getKeyDown('Space')) this.attackRpc(3);
  }

  @rpc(SendTo.Server)                                 // client gọi → chạy trên server
  attackRpc(damage: number): void {
    this.hp.value -= damage;
  }
}
```

**3. Chạy**: Play rồi bấm **Start Host** trong Inspector của NetworkManager (hoặc gọi `NetworkManager.singleton.startHost()` từ script). Mở **Window ▸ Extensions ▸ Multiplayer Play Mode**, tích *Player 2*: khi Play, editor làm host và người chơi ảo tự vào phòng.

## NetworkManager

| Thành viên | Ý nghĩa |
|---|---|
| `startHost()` / `startServer()` / `startClient()` | bắt đầu phiên (trả `false` nếu không được, lỗi ghi ra Console) |
| `shutdown()` | ngắt mọi kết nối, despawn object, dừng transport |
| `disconnectClient(id, reason?)` | server đuổi một client (client nhận `disconnectReason`) |
| `isServer` / `isClient` / `isHost` / `isListening` / `isConnectedClient` | trạng thái |
| `localClientId` | id của máy này (server / host = 0, client từ 1) |
| `connectedClientsIds`, `connectedClients` | client đang kết nối (host có cả id 0) |
| `onClientConnectedCallback`, `onClientDisconnectCallback`, `onServerStarted`, `onServerStopped`, `onClientStarted`, `onClientStopped`, `onConnectionEvent`, `onTransportFailure` | sự kiện (`PiaAction`: `addListener` / `removeListener`) |
| `connectionApprovalCallback = (request, response) => …` | duyệt kết nối khi `networkConfig.connectionApproval` bật: đọc `request.payload` (= `connectionData` của client), đặt `response.approved`, `reason`, `createPlayerObject`, `playerPrefabHash`, `position`, `rotation` |
| `networkConfig` | `networkTransport`, `playerPrefab`, `prefabs`, `tickRate` (mặc định 30), `connectionApproval`, `clientConnectionBufferTimeout`, `enableSceneManagement`, `protocolVersion`, `connectionData` (Uint8Array) |
| `spawnManager` | `spawnedObjects` (Map id → NetworkObject), `getPlayerNetworkObject(id)`, `getLocalPlayerObject()`, `instantiateAndSpawn(prefab, owner, destroyWithScene, isPlayer, pos, rot)` |
| `sceneManager` | `loadScene(name, LoadSceneMode)` cho mọi client, `onSceneEvent`, `onLoadEventCompleted` |
| `customMessagingManager` | tin nhắn tự định nghĩa (xem dưới) |
| `serverTime` / `localTime` | `NetworkTime` (`tick`, `time`, `tickRate`) |
| `rtt`, `stats` | thời gian khứ hồi (ms), lưu lượng (byte / gói mỗi giây, tổng, RPC) |
| `dontDestroy` | (mặc định bật) chuyển object NetworkManager sang DontDestroyOnLoad khi bắt đầu phiên, như NGO |

Host là server + client id 0 trong cùng máy: RPC / biến tới host chạy trực tiếp, không qua transport.

## NetworkObject

- **Spawn** (chỉ server): `instantiate(prefab)` rồi `getComponent(NetworkObject).spawn()` — hoặc `networkManager.spawnManager.instantiateAndSpawn(prefab, ownerId)`. Prefab phải nằm trong `networkConfig.prefabs` (client cần tải sẵn nó). Prefab được nhận diện bằng **GUID** của file prefab (`globalObjectIdHash`, tự lưu).
- **Object đặt sẵn trong scene**: server tự spawn khi bắt đầu; client nhận ra chúng theo scene + id object (id trong file scene). Object mà server đã huỷ sẽ bị huỷ ở client khi vào phòng.
- `spawnWithOwnership(clientId)`, `spawnAsPlayerObject(clientId)`, `despawn(destroy = true)`; huỷ GameObject trên server (`destroy(go)`) cũng tự despawn.
- `changeOwnership(id)` / `removeOwnership()` → `onLostOwnership` / `onGainedOwnership` / `onOwnershipChanged(prev, cur)`.
- `dontDestroyWithOwner`: khi chủ rời phòng, object chuyển về server thay vì bị huỷ (player object luôn bị huỷ).
- **Ẩn / hiện**: `checkObjectVisibility = (clientId) => boolean` (lúc spawn / client vào), `networkHide(id)` (object bị huỷ ở client đó), `networkShow(id)`; `spawnWithObservers = false` để spawn mà không ai thấy.
- Tham chiếu tới NetworkObject / NetworkBehaviour / GameObject đã spawn làm tham số RPC được.

## NetworkVariable / NetworkList

```ts
score = new NetworkVariable(0);                                                    // server ghi
nickname = new NetworkVariable('', { writePerm: NetworkVariableWritePermission.Owner }); // chủ sở hữu ghi
secret = new NetworkVariable(0, { readPerm: NetworkVariableReadPermission.Owner });      // chỉ chủ + server đọc
aim = new NetworkVariable(new Vector3());
loadout = new NetworkVariable(new Loadout());                                      // class INetworkSerializable
items = new NetworkList<string>([], {}, '');                                       // phần tử mẫu '' = list chuỗi
```

- Đặt `value` → gửi ở tick mạng kế tiếp (chỉ biến đã đổi); `onValueChanged` chạy ở mọi nơi giá trị đổi (cả bên ghi).
- Ghi sai quyền: bị từ chối + lỗi trong Console (client ghi biến Server, người không phải chủ ghi biến Owner).
- Đổi trực tiếp bên trong một object (`aim.value.x = 1`) không được phát hiện: gán object mới hoặc gọi `setDirty(true)`.
- `NetworkList`: `add`, `insert`, `removeAt`, `remove`, `set(i, v)`, `clear`, `get(i)`, `count`, `toArray()`; gửi từng thao tác, `onListChanged(event)`.
- Client vào sau nhận giá trị hiện tại của mọi biến khi object được tạo.
- Trong Inspector, biến hiện như một field: sửa được giá trị ban đầu (lưu vào scene / prefab), chỉ đọc khi Play.

Struct tự định nghĩa:

```ts
@networkSerializable('Loadout')                 // tên cố định để gửi làm tham số RPC (bundler đổi tên class)
export class Loadout implements INetworkSerializable {
  weapon = 'none'; ammo = 0;
  networkSerialize(s: BufferSerializer) { this.weapon = s.serializeString(this.weapon); this.ammo = s.serializeInt(this.ammo); }
}
```

## RPC

```ts
@rpc(SendTo.Server) fireRpc(dir: Vector2, rpcParams?: RpcParams) {           // client → server
  const who = rpcParams?.receive.senderClientId;
}
@rpc(SendTo.Everyone, { delivery: RpcDelivery.Unreliable }) emoteRpc(id: number) {}
@rpc(SendTo.SpecifiedInParams) hintRpc(text: string, rpcParams?: RpcParams) {}
this.hintRpc('hi', RpcTarget.single(clientId));                               // RpcTarget.group([...]) / RpcTarget.not(id)

@serverRpc() buyServerRpc(item: string) {}                                    // kiểu cũ: requireOwnership mặc định true
@clientRpc() flashClientRpc(color: Color, p?: ClientRpcParams) {}
this.flashClientRpc(Color.red, new ClientRpcParams([2, 3]));                  // chỉ gửi client 2, 3
```

- `SendTo`: `Server`, `NotServer`, `Owner`, `NotOwner`, `Me`, `NotMe`, `Everyone`, `ClientsAndHost`, `Authority`, `NotAuthority`, `SpecifiedInParams`. Client gọi RPC tới người khác → đi qua server rồi được chuyển tiếp.
- `requireOwnership: true`: chỉ chủ sở hữu được gọi (kiểm tra ở bên gọi và ở server). `allowTargetOverride: true`: `RpcParams` đổi được đích.
- Muốn nhận thông tin người gửi: khai báo tham số cuối `rpcParams?: RpcParams` (không đặt giá trị mặc định).
- Tham số: số, chuỗi, bool, null, Vector2/3, Quaternion, Color, mảng, object JSON, `Uint8Array`, NetworkObject / NetworkBehaviour / GameObject đã spawn, struct `@networkSerializable`.

## Component

- **NetworkTransform**: `authorityMode` Server (server di chuyển) / Owner (chủ sở hữu di chuyển = ClientNetworkTransform), chọn trục vị trí / góc quay / tỉ lệ, ngưỡng, `inLocalSpace`, `interpolate` + `interpolationTicks` (phát lại chậm 2 tick qua bộ đệm có dấu thời gian, chịu được jitter), `teleport(pos, rot, scale)`. Gửi unreliable khi thay đổi, thêm một gói reliable khi đứng yên (không kẹt vị trí nếu mất gói cuối).
- **NetworkRigidbody / NetworkRigidbody2D** (cùng object với NetworkTransform): vật lý chỉ mô phỏng ở bên có authority, bên kia body chuyển sang kinematic. Tìm body theo kiểu duck typing nên package không kéo engine vật lý vào build.
- **NetworkAnimator**: đồng bộ tham số của Animator Controller (mỗi tick khi đổi), trigger (`networkAnimator.setTrigger(name)`), state hiện tại cho client vào sau.
- **PredictedCharacterMover** (phase 2, không có trong NGO): di chuyển do chủ sở hữu điều khiển với **dự đoán phía client + server reconciliation**. Mỗi tick: chủ sở hữu đọc input (`readInput`), đánh số, áp dụng ngay (`simulate`), lưu vào bộ đệm và gửi vài input gần nhất (unreliable, lặp lại để chịu mất gói); server áp dụng theo thứ tự cùng `simulate` (+ luật riêng `constrain`: tường, giới hạn tốc độ…) rồi gửi trạng thái + số input đã xử lý; chủ sở hữu quay về trạng thái server, phát lại input server chưa thấy, làm mượt độ lệch (`errorSmoothing`); người khác nội suy trạng thái server (`interpolationTicks`). Thuộc tính `speed`, `plane` (XY / XZ), `inputRedundancy`; `lastCorrection`, `replayed` để xem. Không đặt chung với NetworkTransform trên một object. Ví dụ: Demo3D `Assets/Samples/Netcode3D`.

## Transport

| Transport | Dùng khi | Ghi chú |
|---|---|---|
| `LoopbackTransport` | thử trong editor (người chơi ảo), test, nhiều tab | `mode`: Auto (trình duyệt = BroadcastChannel, Node = bộ nhớ), Memory, BroadcastChannel; `channel` như địa chỉ |
| `WebSocketTransport` | trình duyệt ↔ dedicated server | `address`, `port`, `path`, `secure` (wss), `url`; `setConnectionData(addr, port)`. Server chỉ chạy trong Node (bản build Dedicated Server cài sẵn listener `ws`) |
| `WebRTCTransport` | một trình duyệt làm host, người khác vào trực tiếp | `signalingUrl`, `roomId`, `iceServers` (STUN/TURN). Server signaling: `node Build/server/server.cjs --signaling 7778 --signaling-only` |

Transport tự viết: kế thừa `NetworkTransport` (`startServer`, `startClient`, `send`, `disconnectRemoteClient`, `disconnectLocalClient`, `shutdown`; đẩy sự kiện bằng `_enqueue`).

**Network Simulator**: thêm vào object NetworkManager; preset (Home Broadband, Mobile 4G/3G/2G, Bad Wi-Fi) hoặc Custom: độ trễ, jitter, % mất gói (chỉ gói unreliable). Áp cho mọi gói máy đó gửi.

## Đổi scene

```ts
networkManager.sceneManager.loadScene('Level2', LoadSceneMode.Single);       // chỉ server
networkManager.sceneManager.onLoadEventCompleted.addListener((name, mode, clients) => …);
```

Server gửi lệnh tải cho mọi client, tự tải, spawn NetworkObject của scene mới. Object spawn với `destroyWithScene = false` (mặc định của `spawn()` / player object) được giữ qua lần tải Single; object của scene cũ bị despawn. Client vào sau tự tải scene đang chạy của server trước khi đồng bộ.

## Tin nhắn tự định nghĩa

```ts
const cmm = networkManager.customMessagingManager;
cmm.registerNamedMessageHandler('chat', (sender, reader) => console.log(sender, reader.readString()));
const w = new FastBufferWriter(); w.writeString('xin chào');
cmm.sendNamedMessageToAll('chat', w);          // server; client: cmm.sendNamedMessage('chat', 0, w)
```

## Dedicated server

```bash
node scripts/pia.mjs build MyGame --target server [--scenes Assets/Scenes/Arena.scene.json]
node MyGame/Build/server/server.cjs --port 7777 [--scene Arena] [--fps 60] [--signaling 7778]
```

- Build headless: không có render pipeline / model loader / renderer module, vật lý và script vẫn chạy. Kết quả: `Build/server/game/` + `server.cjs` (launcher Node, kèm `ws`) + `start-server.cmd|sh`.
- Server tải scene đầu, gọi `startServer()` trên NetworkManager của scene với `WebSocketTransport` (port `--port`). `NetworkManager.isDedicatedServerBuild` = true trong bản build này.
- Bản web của game kết nối bằng `WebSocketTransport` (ví dụ mẫu đọc `?net=client&address=…&port=…`).
- Giới hạn: model 3D (prefab từ glTF/FBX) cần loader của three.js nên chưa chạy trên server headless.

## Editor

- **Inspector của NetworkManager**: khi Play có nút **Start Host / Start Server / Start Client / Shutdown**, trạng thái, client (RTT), lưu lượng, số object.
- **Inspector của NetworkObject**: id, chủ sở hữu, observer khi đã spawn.
- **Window ▸ Extensions ▸ Network Stats**: mọi NetworkManager đang chạy.
- **Window ▸ Extensions ▸ Multiplayer Play Mode**: tích Player 2…4; khi Play mỗi người chơi ảo chạy scene đang mở trong runtime riêng (iframe) và vào phiên của editor qua `LoopbackTransport` (BroadcastChannel). *Auto start*: editor tự `startHost()`. Chỉ có trong editor cục bộ (`pia editor`).

## Chưa có (phase 3)

- Dịch vụ Relay / Lobby / matchmaking, NAT traversal ngoài STUN/TURN tự cấu hình.
- Interest management (lọc theo khoảng cách / vùng) — hiện chỉ có `checkObjectVisibility` / `networkHide`.
- Netcode for Entities (ECS), distributed authority, parenting động của NetworkObject sau khi spawn.
- Nén delta theo bit / lượng tử hoá nửa float cho NetworkTransform.

## Ví dụ

- Demo2D `Assets/Samples/NetcodeCoop`: 2–4 người chơi di chuyển, nhặt xu, bắn nhau, điểm do server giữ (Multiplayer Play Mode trong editor, hoặc dedicated server + bản web).
- Demo3D `Assets/Samples/Netcode3D`: `PredictedCharacterMover` dưới Network Simulator *Mobile 3G*.
