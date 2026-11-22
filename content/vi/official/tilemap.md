---
title: 2D Tilemap
description: Package com.pia.tilemap — Tilemap + 2D Tilemap Extras của Unity cho PiaEngine: Grid chữ nhật / lục giác / isometric, Rule Tile, Animated Tile, GameObject tile (dựng màn 3D), va chạm Tilemap + Composite Collider 2D, cửa sổ Tile Palette với brush.
---

# 2D Tilemap (`com.pia.tilemap`)

Package tilemap theo `com.unity.2d.tilemap` và `com.unity.2d.tilemap.extras` của Unity, tên API viết camelCase: **Grid** (chữ nhật, lục giác point / flat top, isometric, isometric Z as Y, mọi swizzle), **Tilemap**, **TilemapRenderer** (gộp chunk trong PixiJS và three.js), các loại tile (**Tile, RuleTile, AnimatedTile, Random / Weighted Random, Pipeline, Terrain, Hexagonal / Isometric Rule Tile, Rule Override / Advanced Rule Override**), **GameObject tile** (mỗi ô một prefab — dựng màn 3D trên lưới), **TilemapCollider2D** + **CompositeCollider2D**, và cửa sổ **Tile Palette** với các brush.

```bash
npm install ../../pia-packages/com.pia.tilemap     # trong thư mục project
```

## Bắt đầu nhanh

1. **GameObject ▸ 2D Object ▸ Tilemap ▸ Rectangular** (hoặc Hexagonal - Point Top / Flat Top, Isometric, Isometric Z as Y): tạo `Grid` + `Tilemap` + `TilemapRenderer`.
2. **Window ▸ 2D ▸ Tile Palette** → **Create New Palette** (tên, kiểu lưới, Cell Sizing Automatic / Manual). Palette là một prefab (`Grid` + `GridPalette` + một lớp Tilemap).
3. Kéo **sprite / texture đã cắt sprite / tile asset / prefab** từ cửa sổ Project vào palette: sprite thành một `Tile` asset mới (thư mục `<tên palette> Tiles/`), prefab thành `Tile` có Game Object.
4. Bấm (hoặc kéo khung) một tile trong palette → brush lấy các ô đó; vẽ trong Scene view.

| Công cụ | Phím | |
|---|---|---|
| Select | S | chọn khung ô (để Move) |
| Move | M | kéo khung đã chọn tới chỗ khác |
| Paint | B | vẽ theo đường kéo chuột (không bỏ sót ô); **Shift** xoá, **Ctrl** lấy mẫu |
| Box Fill | U | tô khung (lặp mẫu brush); Shift xoá khung |
| Pick | I | lấy mẫu từ tilemap (khung nhiều ô → brush nhiều ô) |
| Erase | D | xoá |
| Flood Fill | G | tô loang vùng cùng tile (ô trống: tô vùng trống trong bounds) |
| Xoay / lật brush | `[` `]` / Shift + `[` `]` | xoay 90° (lục giác 60°), lật X / Y |
| Tầng z | `-` / `=` | đổi Z Position của brush (isometric, khối 3D) |

Mỗi nét vẽ là một bước Undo. Scene view hiện bản xem trước mờ của brush và viền ô dưới chuột; **Focus On: Tilemap** làm mờ các tilemap khác. **Edit** trong palette: các công cụ vẽ thẳng vào palette.

## Unity → Pia

| Unity | Pia | Ghi chú |
|---|---|---|
| `Grid`, `GridLayout` | `Grid`, `GridLayout` | `cellSize`, `cellGap`, `cellLayout` (`'Rectangle' \| 'Hexagon' \| 'Isometric' \| 'IsometricZAsY'`), `cellSwizzle` (`'XYZ'`, `'XZY'` = lưới nằm trên mặt đất…) |
| `CellToWorld / WorldToCell / CellToLocal / LocalToCell / CellToLocalInterpolated / LocalToCellInterpolated / GetBoundsLocal / GetLayoutCellCenter` | `cellToWorld`, `worldToCell`, `cellToLocal`, `localToCell`, `cellToLocalInterpolated`, `localToCellInterpolated`, `getBoundsLocal`, `getCellCenterLocal / World` | lục giác: hàng lẻ lệch nửa ô; flat top = swizzle YXZ (như Unity, toạ độ ô x chạy theo trục y) |
| `Grid.Swizzle / InverseSwizzle` | `Grid.swizzle`, `Grid.inverseSwizzle` | |
| `Vector3Int`, `BoundsInt`, `Bounds` | `Vector3Int`, `BoundsInt`, `Bounds` (export từ package) | `allPositionsWithin()` trả về vector dùng lại |
| `Tilemap.SetTile / GetTile / HasTile` | `setTile`, `getTile<T>`, `hasTile` | không cấp phát; chấp nhận `Vector3Int` hoặc `{x, y, z}` |
| `SetTiles(positions, tiles)` / `SetTiles(TileChangeData[])` | `setTiles(positions, tiles)` / `setTiles(changes)` | refresh **một lần** cho cả lô |
| `SetTilesBlock / GetTilesBlock / GetTilesBlockNonAlloc` | `setTilesBlock`, `getTilesBlock`, `getTilesBlockNonAlloc` | x nhanh nhất, rồi y, rồi z |
| `BoxFill / FloodFill / SwapTile / ContainsTile / ClearAllTiles` | `boxFill`, `floodFill`, `swapTile`, `containsTile`, `clearAllTiles` | |
| `DeleteCells / InsertCells` | `deleteCells`, `insertCells` | |
| `cellBounds / origin / size / localBounds / CompressBounds / ResizeBounds` | `cellBounds`, `origin`, `size`, `localBounds`, `compressBounds()`, `resizeBounds()` | bounds chỉ nở ra cho tới khi compress (như Unity) |
| `GetUsedTilesCount / GetUsedTilesNonAlloc / GetUsedSpritesCount / GetUsedSpritesNonAlloc` | `getUsedTilesCount`, `getUsedTilesNonAlloc`, `getUsedSpritesCount`, `getUsedSpritesNonAlloc` | + `tileCount`, `getUsedPositions()` |
| `GetSprite / GetColor / SetColor / GetTransformMatrix / SetTransformMatrix` | `getSprite`, `getColor`, `setColor`, `getTransformMatrix`, `setTransformMatrix` | sprite là chuỗi tham chiếu (`"<guid>#<spriteId>"`) |
| `GetTileFlags / SetTileFlags / AddTileFlags / RemoveTileFlags`, `TileFlags` | cùng tên, `TileFlags.LockColor / LockTransform / InstantiateGameObjectRuntimeOnly / KeepGameObjectRuntimeOnly` | `Tile` mặc định LockColor (như Unity) |
| `GetColliderType / SetColliderType`, `Tile.ColliderType` | `getColliderType`, `setColliderType`, `ColliderType.None / Sprite / Grid` | |
| `GetInstantiatedObject / GetObjectToInstantiate` | `getInstantiatedObject`, `getObjectToInstantiate` | |
| `GetAnimationFrame / SetAnimationFrame / GetAnimationFrameCount / GetAnimationTime / SetAnimationTime`, `animationFrameRate`, `TileAnimationFlags` | cùng tên camelCase | LoopOnce, PauseAnimation, UpdatePhysics |
| `color`, `tileAnchor`, `orientation`, `orientationMatrix` | cùng tên | `orientation`: `'XY' \| 'XZ' \| 'YX' \| 'YZ' \| 'ZX' \| 'ZY' \| 'Custom'` (Custom: Offset / Rotation / Scale) |
| `RefreshTile / RefreshAllTiles` | `refreshTile`, `refreshAllTiles` | |
| `Tilemap.tilemapTileChanged / tilemapPositionsChanged` | `Tilemap.tilemapTileChanged.add(fn)`, `Tilemap.tilemapPositionsChanged.add(fn)` | `add` trả về hàm gỡ |
| `SetEditorPreviewTile / ClearAllEditorPreviewTiles…` | `setEditorPreviewTile`, `setEditorPreviewTransformMatrix`, `setEditorPreviewColor`, `clearAllEditorPreviewTiles` | vẽ mờ, không bao giờ lưu |
| `TilemapRenderer.sortOrder / mode / detectChunkCullingBounds / chunkCullingBounds / maskInteraction` | cùng tên | `mode`: Chunk / Individual / SRPBatch (= Chunk) |
| `TileBase.GetTileData / GetTileAnimationData / RefreshTile / StartUp`, `ITilemap`, `TileData`, `TileAnimationData` | `getTileData`, `getTileAnimationData`, `refreshTile`, `startUp`, `ITilemap`, `TileData`, `TileAnimationData` | `TileData` dùng chung một instance cho mọi ô: ghi, đừng giữ |
| `Tile` (sprite, color, transform, flags, colliderType, gameObject) | `Tile` | transform = `transformOffset / Rotation / Scale` (getter `transform`); prefab lưu trong `instancedGameObject` (getter `gameObject`) |
| `AnimatedTile`, `RandomTile`, `WeightedRandomTile`, `PipelineTile`, `TerrainTile` | cùng tên | |
| `RuleTile`, `RuleTile.TilingRule(Output)`, `Neighbor.This / NotThis`, `Transform` Fixed / Rotated / MirrorX / MirrorY / MirrorXY / RotatedMirror, `OutputSprite` Single / Random / Animation | `RuleTile`, `TilingRule`, `TilingRuleOutput`, `Neighbor`, `ruleTransform`, `output`, `perlinScale`, `randomTransform` | lookup hàng xóm được biên dịch và cache theo tile; gọi `refreshRules()` sau khi sửa rule bằng code |
| `RuleTile<T>` (neighbor tuỳ biến) | subclass `RuleTile`, override `ruleMatch(neighbor, other)`, liệt kê giá trị trong `static neighborTypes` | Inspector bấm ô 3 × 3 để xoay vòng các giá trị |
| `HexagonalRuleTile` (`m_FlatTop`), `IsometricRuleTile` | `HexagonalRuleTile` (`flatTop`), `IsometricRuleTile` | |
| `RuleOverrideTile`, `AdvancedRuleOverrideTile` | cùng tên | override là "terrain" riêng: "This" của nó là chính nó |
| `TilemapCollider2D` (usedByComposite, extrusionFactor, maximumTileChangeCount) | cùng tên | shape theo chunk, chỉ chunk đổi mới tạo lại (cả trong Rapier) |
| `CompositeCollider2D` (geometryType Outlines / Polygons, generationType Synchronous / Manual, vertexDistance, offsetDistance, pathCount, GetPath, GenerateGeometry) | cùng tên | Polygons = các mảnh lồi (hình chữ nhật khi viền vuông góc) |
| `GridBrushBase`, `GridBrush`, `[CustomGridBrush]` | `GridBrushBase`, `GridBrush`, `@customGridBrush` (`com.pia.tilemap/Editor/brushes`) | `paint`, `erase`, `boxFill`, `floodFill`, `pick`, `select`, `move*`, `rotate`, `flip`, `paintPreview`… |
| `GameObjectBrush`, `RandomBrush`, `LineBrush`, `GroupBrush`, `PrefabBrush`, `PrefabRandomBrush` | cùng tên | |

## Tile asset

**Assets ▸ Create ▸ 2D ▸ Tiles ▸** Tile / Rule Tile / Isometric Rule Tile / Hexagonal Rule Tile / Rule Override Tile / Advanced Rule Override Tile / Animated Tile / Random Tile / Weighted Random Tile / Pipeline Tile / Terrain Tile (`.asset.json`), hoặc **Tile from Selected Sprites** (chọn sprite / texture trong Project). Inspector của Rule Tile: mỗi rule một lưới hàng xóm (bấm để xoay vòng **This** ↑ / **Not This** ✕ / Any, ô giữa đổi Rule Transform), ảnh sprite, Output, Collider, Game Object.

Tile tự viết:

```ts
import { createAssetMenu, field } from '@pia/core';
import { TileBase, type ITilemap, type TileData, type Vector3Int } from 'com.pia.tilemap';

@createAssetMenu({ menuName: 'Tiles/Checker Tile' })
export class CheckerTile extends TileBase {
  @field({ assetType: 'sprite' }) a = '';
  @field({ assetType: 'sprite' }) b = '';
  override getTileData(p: Vector3Int, _tm: ITilemap, data: TileData) {
    data.sprite = ((p.x + p.y) & 1) === 0 ? this.a : this.b;
  }
}
```

## Vẽ (TilemapRenderer)

- **Chunk** (mặc định): mỗi chunk 32 × 32 ô gộp thành **một mesh cho mỗi texture** (dùng sprite sheet / atlas để còn 1 draw call / chunk). Chỉ chunk có ô thay đổi mới dựng lại; ô animated chỉ làm chunk của nó dựng lại khi đổi khung. Chunk ngoài khung nhìn bị bỏ qua (2D: theo view của camera, nở thêm `chunkCullingBounds` khi Manual; 3D: frustum culling của three.js).
- **Individual**: mỗi tile là một sprite riêng, sắp xếp chung với SpriteRenderer (Order in Layer, rồi Z thế giới — Pia chưa có Transparency Sort Axis; muốn sắp theo Y hãy đặt z = y cho sprite).
- `sortOrder`: góc vẽ trước (TopRight cho isometric để ô phía dưới che ô phía trên).
- `material`: shader sprite 2D cho blend mode / màu `_Color`; shader GLSL tuỳ biến chưa áp lên tilemap.
- Chống đường nối: lọc **Point** cho pixel art; với lọc Linear hoặc atlas không padding, đặt `uvInset` 0.5 (thu UV nửa texel).
- 3D: tile sprite nằm trên mặt phẳng của lưới (XY, hoặc `orientation: 'XZ'` cho mặt đất).

## GameObject tile (3D)

Tile có **Game Object** (prefab) → Tilemap tạo một instance prefab cho mỗi ô, làm con của tilemap tại tâm ô (`tileAnchor`), xoay / co giãn theo transform của ô. Instance có `HideFlags.HideAndDontSave`: ẩn khỏi Hierarchy, **không lưu** vào scene / prefab (scene chỉ lưu dữ liệu ô), bấm vào trong Scene view sẽ chọn tilemap. `InstantiateGameObjectRuntimeOnly`: chỉ tạo khi Play; `KeepGameObjectRuntimeOnly`: khi Play, đổi / xoá tile không phá instance cũ. `getInstantiatedObject(cell)` lấy instance.

Nhiều ô: bật **GPU Instancing** trên material của prefab — backend gộp các khối giống nhau (10 000 khối: 3 draw call thay vì ~8 000).

**GameObject Brush** thì khác: vẽ GameObject **thật** (prefab instance, lưu trong scene) làm con của đích, mỗi ô một đối tượng (`anchor`, `randomRotation`, `randomScale`, Erase xoá đối tượng trong ô).

## Va chạm

```
Ground: Tilemap + TilemapRenderer + Rigidbody2D (Static) + TilemapCollider2D (Used By Composite) + CompositeCollider2D
```

- Shape từng ô: **Grid** = hình ô (chữ nhật / lục giác / thoi); **Sprite** = physics shape của sprite: outline tuỳ biến trong import settings (`physicsShape` của sprite trong `.meta`, đơn vị pixel từ góc dưới-trái rect), nếu không có thì outline phần đục của ảnh (dò từ pixel khi ảnh đã tải), nếu không nữa thì rect.
- Rapier 2D: mỗi mảnh lồi một collider, chia nhóm theo chunk — sửa một ô chỉ tạo lại collider của chunk đó; callback va chạm vẫn là một cặp mỗi Collider2D. Engine **builtin** (Project Settings ▸ Physics) cũng hỗ trợ (đa giác lồi / đoạn thẳng: raycast, overlap, trigger).
- Composite: Outlines (đường viền rỗng, nhẹ) hoặc Polygons (đặc, mảnh lồi). Gộp chính xác các shape chạm nhau / chung cạnh (kể cả chữ T: nửa ô cạnh ô đầy); shape chồng lên nhau thì không gộp.
- Build chỉ kèm engine vật lý 2D khi scene dùng `TilemapCollider2D` / `CompositeCollider2D` (khai báo trong package.json `pia.physicsComponents`) — package không bao giờ tự kéo vật lý vào build.

## Dữ liệu trong scene

`Tilemap.tileData` (định dạng phiên bản 1): palette tham chiếu (tile, sprite, prefab — chuỗi GUID nên build ship đúng asset và scene preload chúng) + màu / ma trận + một chuỗi base64 các chunk mã hoá run-length. Map 512 × 512 một loại tile ≈ 8 KB. Phiên bản mới hơn bản package hiểu thì dữ liệu được giữ nguyên (không mất khi lưu lại).

## Hiệu năng (đo bằng `Tests~/bench.ts`, Node 22; trình duyệt headless)

| | |
|---|---|
| `setTiles` 100 000 ô (Tile) | ≈ 35 ms |
| `setTiles` 100 000 ô (RuleTile, 5 rule xoay) | ≈ 115 ms |
| `getTile` × 1 000 000 (map 512 × 512) | ≈ 16 ms (không cấp phát) |
| Vẽ một RuleTile giữa map (refresh 9 ô) | ≈ 9 µs |
| Dựng mesh 256 chunk (map 512 × 512) | ≈ 15 ms (dựng lại chỉ chunk bẩn) |
| Encode / decode map 512 × 512 | ≈ 10 ms / ≈ 8 ms, ≈ 57 KB |
| Map 512 × 512 trong trình duyệt | 4–6 draw call, sync renderer ≈ 0.12–0.16 ms / khung khi pan; 65 536 SpriteRenderer: ≈ 190 ms / khung |
| 10 000 GameObject tile (3D) | tạo ≈ 0.5 s; GPU Instancing: 3 draw call (tắt: ≈ 8 000) |

## Mẫu

- Demo2D `Assets/Samples/TilemapPlatformer` — địa hình Rule Tile, tile animated, composite collider, nhân vật, sinh thủ tục.
- Demo3D `Assets/Samples/Tilemap3D` — prefab tile, GameObject Brush, lục giác + Hexagonal Rule Tile, isometric Z as Y.

## Test

```bash
node scripts/test-core.mjs "pia-packages/com.pia.tilemap/Tests~/tilemap.test.ts"   # lưới, lưu trữ, serialization, rule tile, mesh, collider
node scripts/test-core.mjs "pia-packages/com.pia.tilemap/Tests~/alloc.test.ts"     # đường nóng không cấp phát
node scripts/test-core.mjs "pia-packages/com.pia.tilemap/Tests~/bench.ts"          # số liệu ở trên
```

## Chưa có

Sprite Mask (`maskInteraction` chỉ lưu), shader GLSL tuỳ biến cho tilemap, Transparency Sort Axis cho chế độ Individual, `TilemapCollider3D` (GameObject tile tự mang collider), `edgeRadius` của composite, Sprite Editor để vẽ physics shape (dữ liệu `physicsShape` đã được đọc), cập nhật collider theo khung animation (`UpdatePhysics`).
