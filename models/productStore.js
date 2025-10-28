// models/productStore.js
// import fs, { read } from "fs";
// import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
// import path from "path";
// import crypto from "node:crypto";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const DATA_DIR = path.resolve(__dirname, "../data")
// const DB_PATH = path.join(DATA_DIR, "products.json");

// // --- ensure data directory & file exist
// if (!existsSync(DATA_DIR)) {
//   mkdirSync(DATA_DIR, { recursive: true });
// }

// let db = { products: [] };
// try {
//   if (existsSync(DB_PATH)) {
//     db = JSON.parse(readFileSync(DB_PATH, "utf-8") || "{}");
//     if (!db.products) db.products = [];
//   } else {
//     writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
//   }
// } catch (e) {
//   console.error("Failed to read DB file, starting fresh:", e);
//   db = { products: [] };
//   writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
// }

// function persist() {
//   writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
// }

// export const productStore = {
//   all() {
//     return db.products;
//   },

//   findById(id) {
//     return db.products.find(p => p.id === id) || null;
//   },

//   create(p) {
//     const id = crypto.randomUUID();
//     const now = new Date().toISOString();

//     const rec = {
//       id,
//       name: String(p.name || "").trim(),
//       price: Number(p.price),
//       imageUrl: p.imageUrl ? String(p.imageUrl).trim() : null,
//       description: p.description ? String(p.description).trim() : "",
//       createdAt: now,
//       updatedAt: now,
//     };

//     db.products.push(rec);
//     persist(); // <-- uses DB_PATH defined above
//     return rec;
//   },

//   update(id, patch) {
//     const idx = db.products.findIndex(p => p.id === id);
//     if (idx === -1) return null;
//     const now = new Date().toISOString();
//     db.products[idx] = {
//       ...db.products[idx],
//       ...patch,
//       updatedAt: now,
//     };
//     persist();
//     return db.products[idx];
//   },

//   remove(id) {
//     const before = db.products.length;
//     db.products = db.products.filter(p => p.id !== id);
//     if (db.products.length !== before) persist();
//     return before !== db.products.length;
//   },
// };

//   export default productStore;

// models/productStore.js  (ESM)
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "..", "data");
const DB_PATH = path.join(DATA_DIR, "products.json");

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

class ProductStoreClass {
  constructor() {
    this.items = readAll();
  }

  all() {
    return this.items;
  }

  getAll() {
    return this.all();
  }

  getById(id) {
    const s = String(id);
    return this.items.find((p) => String(p.id) === s) || null;
  }

  findById(id) {
    return this.getById(id);
  }

  create({ name, price, imageUrl, description }) {
    const rec = {
      id: randomUUID(),
      name: String(name || "").trim(),
      price: Number(price) || 0,
      imageUrl: imageUrl ? String(imageUrl).trim() : "",
      description: description ? String(description).trim() : "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.items.push(rec);
    writeAll(this.items);
    return rec;
  }

  update(id, patch) {
    const idx = this.items.findIndex((p) => String(p.id) === String(id));
    if (idx === -1) return null;
    this.items[idx] = { ...this.items[idx], ...patch, updatedAt: new Date().toISOString() };
    writeAll(this.items);
    return this.items[idx];
  }

  remove(id) {
    const before = this.items.length;
    this.items = this.items.filter((p) => String(p.id) !== String(id));
    if (this.items.length !== before) writeAll(this.items);
    return before !== this.items.length;
  }
}

export const productStore = new ProductStoreClass();
