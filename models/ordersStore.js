// models/ordersStore.js
import { randomUUID } from "node:crypto";

export const ordersStore = {
  _items: [],

  create({ lines, total }) {
    const order = {
      id: randomUUID(),
      lines,               // array of {id, qty, price}
      total,
      status: "received",  // default status
      createdAt: new Date().toISOString(),
    };
    this._items.push(order);
    return order;
  },

  getById(id) {
    return this._items.find(o => o.id === id) || null;
  },

  list() {
    return [...this._items].sort(
      (a, b) => b.createdAt.localeCompare(a.createdAt)
    );
  }
};
