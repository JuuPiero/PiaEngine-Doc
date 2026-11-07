---
title: Toán học & Debug
description: Vector2, Vector3, Quaternion, Color, Mathf và Debug.
---

# Toán học & Debug

TypeScript không có operator overloading, nên phép toán vector là **method** và luôn trả về **giá trị mới** (không sửa vector gốc).

## Vector3 / Vector2

```ts
const a = new Vector3(1, 2, 3);
const b = Vector3.up;                // (0, 1, 0) — mỗi lần gọi trả về vector mới

a.add(b); a.sub(b); a.mul(2); a.div(2);
a.scale(new Vector3(1, 2, 1));       // nhân từng thành phần
a.negate(); a.dot(b); a.cross(b);
a.magnitude; a.sqrMagnitude; a.normalized;
a.clone(); a.equals(b); a.set(0, 0, 0);

Vector3.distance(a, b);
Vector3.lerp(a, b, t);               // t bị kẹp trong 0..1
Vector3.moveTowards(a, b, maxDelta);
Vector3.angle(a, b);                 // độ
```

Hằng: `zero`, `one`, `up`, `down`, `left`, `right`, `forward`, `back` (`forward` = (0, 0, -1) theo hệ toạ độ three.js). `Vector2` có API tương tự (không có `cross`, `forward`, `back`).

## Quaternion

```ts
Quaternion.identity;
Quaternion.euler(0, 90, 0);                       // độ
Quaternion.angleAxis(45, Vector3.up);
Quaternion.lookRotation(dir, Vector3.up);
Quaternion.slerp(a, b, t);
Quaternion.rotateTowards(from, to, maxDegrees);
Quaternion.angle(a, b);
q.multiply(r); q.inverse(); q.eulerAngles;
```

## Color

```ts
new Color(1, 0.5, 0, 1);             // r, g, b, a trong 0..1
Color.red; Color.white; Color.clear;
Color.fromHex('#ffcc00');
Color.lerp(a, b, t);
c.toHex();
```

## Mathf

`Mathf.PI`, `Deg2Rad`, `Rad2Deg`, `Epsilon`, `Infinity` và các hàm: `clamp`, `clamp01`, `lerp`, `lerpUnclamped`, `inverseLerp`, `moveTowards`, `smoothStep`, `repeat`, `pingPong`, `deltaAngle`, `approximately`, `sign`, `wrapAngle`. Các hàm khác dùng `Math` của JavaScript.

```ts Assets/Scripts/CameraFollow2D.ts
const x = Mathf.clamp(Mathf.lerp(p.x, t.x, this.smoothing * Time.deltaTime), this.minX, this.maxX);
```

## Debug

```ts
Debug.log('Score', score);           // hiện trong Console của editor (và console trình duyệt)
Debug.warn('...');                   // = Debug.logWarning
Debug.error('...');                  // = Debug.logError
Debug.assert(hp >= 0, 'hp < 0');
Debug.exception(err);
this.print('từ component');          // như Debug.log
```

Object có `toString()` riêng (GameObject, Vector3…) được in gọn; object khác được in dạng JSON.
