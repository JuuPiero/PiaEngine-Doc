---
title: Particle System
description: Hệ thống hạt chạy cả 2D và 3D — các mô-đun, xem trước trong editor và điều khiển từ code.
---

# Particle System

**GameObject → Effects → Particle System**, hoặc **Add Component → Effects → Particle System**. Chạy được cả scene 2D (PixiJS `ParticleContainer`, một draw call) lẫn 3D (three.js `Points`). Inspector chia mô-đun như Unity.

## Main

| Thuộc tính | Field | Mặc định | Mô tả |
|---|---|---|---|
| Duration | `duration` | `5` | Độ dài một chu kỳ (giây) |
| Looping | `looping` | `true` | |
| Prewarm | `prewarm` | `false` | Bắt đầu như đã chạy xong một chu kỳ (khi Looping) |
| Start Delay | `startDelay` | `0` | |
| Start Lifetime (min, max) | `startLifetime` | `(1.5, 2.5)` | Tuổi thọ ngẫu nhiên trong khoảng |
| Start Speed (min, max) | `startSpeed` | `(2, 3)` | |
| Start Size (min, max) | `startSize` | `(0.3, 0.6)` | Kích thước (unit) |
| Start Rotation (min, max) | `startRotation` | `(0, 0)` | Độ |
| Start Color | `startColor` | trắng | |
| Random Between Two Colors / Start Color 2 | `randomColor`, `startColor2` | `false` | Màu ngẫu nhiên giữa 2 màu |
| Gravity Modifier | `gravityModifier` | `0` | Hệ số nhân `Physics.gravity` |
| Simulation Space | `simulationSpace` | `World` | `World`: hạt ở lại chỗ đã phát khi object di chuyển; `Local`: đi theo object |
| Simulation Speed | `simulationSpeed` | `1` | |
| Play On Awake | `playOnAwake` | `true` | |
| Max Particles | `maxParticles` | `1000` | Tối đa 20000 |
| Stop Action | `stopAction` | `None` | `None`, `Disable`, `Destroy` — khi hệ không lặp đã xong và mọi hạt đã chết |

## Emission

| Thuộc tính | Field | Mặc định | Mô tả |
|---|---|---|---|
| Rate over Time | `rateOverTime` | `10` | Hạt mỗi giây |
| Bursts | `bursts` | `[]` | Mỗi burst: `time` (giây từ đầu chu kỳ), `count`, `cycles` (0 = mãi mãi), `interval` |

## Shape

Phát theo trục **up (+Y)** cục bộ của object: xoay object để đổi hướng.

| Thuộc tính | Field | Mặc định | Mô tả |
|---|---|---|---|
| Shape | `shape` | `Cone` | `Cone`, `Circle`, `Sphere`, `Box`, `Edge` |
| Radius | `radius` | `0.3` | (trừ Box) |
| Angle | `angle` | `20` | Góc nón (Cone) |
| Box Size | `boxSize` | `(1, 1, 1)` | (Box) |
| Emit From Edge | `emitFromEdge` | `false` | (Circle, Sphere) phát từ viền |
| Randomize Direction | `randomizeDirection` | `0` | 0..1 |

## Over Lifetime

| Thuộc tính | Field | Mặc định | Mô tả |
|---|---|---|---|
| Color at Start / Color at End | `colorStart`, `colorEnd` | trắng → trắng trong suốt | Nhân với Start Color |
| Size (start, end) | `sizeOverLifetime` | `(1, 0.4)` | Hệ số nhân Start Size |
| Size Curve | `sizeCurve` | `Linear` | `Linear`, `Ease In`, `Ease Out`, `Smooth` |
| Velocity | `velocityOverLifetime` | `(0, 0, 0)` | Cộng thêm cho mọi hạt (unit/giây) |
| Drag | `drag` | `0` | Làm chậm dần (0..10) |
| Angular Velocity (min, max) | `angularVelocity` | `(0, 0)` | Độ/giây |

## Renderer

| Thuộc tính | Field | Mặc định | Mô tả |
|---|---|---|---|
| Texture | `texture` | `builtin:Particle` | Chấm tròn mềm; dùng được sprite bất kỳ |
| Blend Mode | `blendMode` | `Additive` | `Alpha`, `Additive`, `Multiply` |
| Order in Layer | `sortingOrder` | `0` | |

## Xem trước trong editor

Chọn object trong editor thì hiệu ứng tự chạy trong Scene view, kèm bảng **Particle Effect** (Pause / Restart, thời gian, số hạt).

## Điều khiển từ code

```ts
const ps = this.getComponent(ParticleSystem)!;
ps.play();  ps.pause();  ps.stop();                   // stop: ngừng phát, hạt cũ chạy hết đời
ps.stop(true, 'StopEmittingAndClear');                // xoá luôn
ps.clear();                                           // xoá mọi hạt
ps.emit(30);                                          // bắn thêm 30 hạt ngay (kể cả khi không play)
ps.simulate(2);                                       // chạy lại từ đầu rồi tua nhanh 2 giây
ps.isPlaying; ps.isPaused; ps.isStopped; ps.isEmitting;
ps.particleCount; ps.time;
```

`play`, `stop`, `pause`, `clear` mặc định áp cho cả Particle System ở object con (tham số đầu `withChildren = true`).

## Hiệu ứng một lần (nổ, nhặt đồ)

1. **Looping** tắt, **Rate over Time** = 0, một **Burst**, **Stop Action** = `Destroy`.
2. Lưu thành prefab.
3. Sinh ra bằng `this.instantiate(prefab, position, rotation)` — object tự huỷ khi hiệu ứng xong.

Ví dụ:

- Demo2D: prefab `Assets/Prefabs/Sparkle.prefab.json`, sinh ra khi nhặt sao (`Collectible.pickupEffect`).
- Demo3D: object **Fountain** (vòi phun hạt có trọng lực).

::: note Chưa hỗ trợ
Noise, Collision, Trails, Sub Emitters, Texture Sheet Animation, đường cong / gradient nhiều điểm, Material tuỳ biến cho hạt.
:::
