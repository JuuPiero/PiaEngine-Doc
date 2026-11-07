---
title: Prefab
description: Tạo prefab, instance, override, Apply / Revert / Unpack, prefab lồng nhau và Prefab Mode.
---

# Prefab

Prefab (`.prefab.json`) là GameObject mẫu (cùng con và component) dùng lại nhiều lần, giống Unity — kể cả prefab lồng nhau và override.

## Tạo prefab

Kéo object từ **Hierarchy** thả vào cửa sổ **Project**. Object trong scene trở thành **instance** của prefab vừa tạo (hiện màu prefab trong Hierarchy).

## Đặt instance vào scene

- Kéo prefab từ Project vào Scene hoặc Hierarchy.
- Chuột phải prefab trong Project → **Instantiate in Scene**.
- Từ code: `this.instantiate(prefab)` với field `@field(GameObject) prefab` (kéo prefab vào Inspector), hoặc `Resources.loadPrefab(...)`. Xem [Instantiate & Destroy](../scripting/instantiate-destroy.md).

## Override

Sửa giá trị trên một instance tạo ra **override**: giá trị đó hiện **in đậm** trong Inspector và không bị ghi đè khi prefab thay đổi. Thêm object con vào instance cũng là một thay đổi so với prefab.

Thanh **Prefab** ở đầu Inspector (khi chọn instance):

| Nút | Tác dụng |
|---|---|
| **Open** | Mở prefab trong Prefab Mode |
| **Select** | Chọn asset prefab trong Project |
| **Overrides → Apply All** | Ghi mọi override (và object thêm vào) vào asset prefab — mọi instance khác nhận thay đổi |
| **Overrides → Revert All** | Bỏ mọi override, quay về giá trị của prefab |
| **Overrides → Unpack Prefab** | Biến instance thành object thường, cắt liên kết với prefab |

Cũng có trong Hierarchy: chuột phải instance → **Prefab** → Open Asset in Context, Select Asset, Apply All Overrides, Revert All Overrides, Unpack.

::: warning Cấu trúc của instance bị khoá
Không xoá / đổi cha được object **bên trong** một prefab instance (trừ object gốc). Mở prefab (Prefab Mode) hoặc Unpack để đổi cấu trúc — giống Unity.
:::

## Prefab Mode

Mở bằng **Open** trên thanh Prefab, double-click prefab trong Project, hoặc **Open Asset in Context**. Hierarchy hiện nhãn **Prefab Mode**; sửa prefab như một scene riêng. Nút mũi tên quay lại (Hierarchy / Scene view) để rời Prefab Mode — editor hỏi lưu, rồi khôi phục scene và mọi instance nhận thay đổi.

## Prefab lồng nhau

Prefab có thể chứa instance của prefab khác (ví dụ prefab `Level` chứa nhiều prefab `Coin`). Sửa prefab con thì mọi nơi dùng nó đều cập nhật; override trên instance lồng nhau vẫn được giữ.

## Định dạng file

Instance trong scene được lưu gọn: GUID của prefab + danh sách thay đổi (override), không chép lại toàn bộ object. Nhờ vậy sửa prefab là mọi scene dùng nó cập nhật theo.

## Ví dụ

- Demo2D: `Assets/Prefabs/Star.prefab.json` (ngôi sao để nhặt), `Assets/Prefabs/Sparkle.prefab.json` (hiệu ứng hạt một lần).
- Demo3D: `Assets/Prefabs/PhysicsBall.prefab.json`, `Assets/Prefabs/Fountain.prefab.json`.

::: note Chưa hỗ trợ
Prefab Variant; Apply / Revert cho từng thuộc tính riêng lẻ (hiện là Apply All / Revert All).
:::
