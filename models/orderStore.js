// models/ordersStore.js (ESM)
import { randomUUID } from "node:crypto";

export const ordersStore = {
  _items: [],

  create({ lines, total }) {
    const order = {
      id: randomUUID(),
      lines,                  // [{ id, qty, price }]
      total,                  // number (e.g. 3998)
      status: "received",     // simple status for now
      createdAt: new Date().toISOString(),
    };
    this._items.push(order);
    return order;
  },

  getById(id) {
    return this._items.find(o => o.id === id) || null;
  },

  list() {
    // newest first
    return [...this._items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
};
