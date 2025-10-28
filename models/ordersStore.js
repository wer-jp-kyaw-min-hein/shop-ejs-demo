// models/ordersStore.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "..", "data");
const DB_PATH = path.join(DATA_DIR, "orders.json");

function ensure() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2), "utf8");
}

function readAll() {
  ensure();
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8") || "[]";
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeAll(items) {
  ensure();
  fs.writeFileSync(DB_PATH, JSON.stringify(items, null, 2), "utf8");
}

export const ordersStore = {
  _items: readAll(),

  create({ lines, total, createdAt } = {}) {
    const order = {
      id: randomUUID(),
      lines: Array.isArray(lines) ? lines : [],
      total: Number(total) || 0,
      status: "received",
      createdAt: createdAt || new Date().toISOString(),
    };
    this._items.push(order);
    writeAll(this._items);
    return order;
  },

  getById(id) {
    return this._items.find((o) => String(o.id) === String(id)) || null;
  },

  list() {
    return [...this._items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  update(id, patch = {}) {
    const idx = this._items.findIndex((o) => String(o.id) === String(id));
    if (idx === -1) return null;
    this._items[idx] = { ...this._items[idx], ...patch };
    writeAll(this._items);
    return this._items[idx];
  },
};
