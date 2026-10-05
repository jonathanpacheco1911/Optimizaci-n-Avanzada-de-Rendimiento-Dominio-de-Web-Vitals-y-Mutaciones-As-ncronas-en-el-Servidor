"use client";

import { useSyncExternalStore } from "react";

/**
 * Carrito en estado local (localStorage) expuesto con useSyncExternalStore:
 * sin Provider, sincronizado entre pestañas y sin errores de hidratación
 * (el servidor siempre renderiza el carrito vacío).
 */
export type CartItem = {
  productId: number;
  name: string;
  price: number;
  imageUrl: string | null;
  stock: number;
  quantity: number;
};

const KEY = "ecommerce:cart:v1";
const EMPTY: CartItem[] = [];

let items: CartItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function parse(raw: string | null): CartItem[] {
  try {
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    items = parse(localStorage.getItem(KEY));
  } catch {
    items = [];
  }
}

function commit(next: CartItem[]) {
  items = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // localStorage no disponible (modo privado): el carrito vive solo en memoria.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    items = parse(e.newValue);
    listeners.forEach((l) => l());
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  load();
  return items;
}

function getServerSnapshot() {
  return EMPTY;
}

const clamp = (qty: number, stock: number) => Math.max(1, Math.min(qty, Math.max(stock, 1)));

export function addToCart(item: Omit<CartItem, "quantity">, quantity = 1) {
  load();
  const existing = items.find((i) => i.productId === item.productId);
  if (existing) {
    commit(
      items.map((i) =>
        i.productId === item.productId
          ? { ...i, stock: item.stock, quantity: clamp(i.quantity + quantity, item.stock) }
          : i,
      ),
    );
  } else {
    commit([...items, { ...item, quantity: clamp(quantity, item.stock) }]);
  }
}

export function removeFromCart(productId: number) {
  load();
  commit(items.filter((i) => i.productId !== productId));
}

export function setQuantity(productId: number, quantity: number) {
  load();
  commit(items.map((i) => (i.productId === productId ? { ...i, quantity: clamp(quantity, i.stock) } : i)));
}

export function clearCart() {
  load();
  commit([]);
}

export function useCart() {
  const list = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const count = list.reduce((sum, i) => sum + i.quantity, 0);
  const total = list.reduce((sum, i) => sum + i.quantity * i.price, 0);
  return { items: list, count, total };
}
