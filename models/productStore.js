import fs, { read } from "fs";
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
// mkdirSync(DATA_DIR, { recursive: true });
// }

// let db = { products: [] };
// try {
// if (existsSync(DB_PATH)) {
// db = JSON.parse(readFileSync(DB_PATH, "utf-8") || "{}");
// if (!db.products) db.products = [];
// } else {
// writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
// }
// } catch (e) {
// console.error("Failed to read DB file, starting fresh:", e);
// db = { products: [] };
// writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
// }

// function persist() {
// writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
// }

// export const productStore = {
// all() {
// return db.products;
// },

// findById(id) {
// return db.products.find(p => p.id === id) || null;
// },

// create(p) {
// const id = crypto.randomUUID();
// const now = new Date().toISOString();

// const rec = {
// id,
// name: String(p.name || "").trim(),
// price: Number(p.price),
// imageUrl: p.imageUrl ? String(p.imageUrl).trim() : null,
// description: p.description ? String(p.description).trim() : "",
// createdAt: now,
// updatedAt: now,
// };

// db.products.push(rec);
// persist(); // <-- uses DB_PATH defined above
// return rec;
// },

// update(id, patch) {
// const idx = db.products.findIndex(p => p.id === id);
// if (idx === -1) return null;
// const now = new Date().toISOString();
// db.products[idx] = {
// ...db.products[idx],
// ...patch,
// updatedAt: now,
// };
// persist();
// return db.products[idx];
// },

// remove(id) {
// const before = db.products.length;
// db.products = db.products.filter(p => p.id !== id);
// if (db.products.length !== before) persist();
// return before !== db.products.length;
// },
// };

// export default productStore;

// models/productStore.js (ESM)
import { randomUUID } from "node:crypto";

export class ProductStore {
constructor() {
this.items = []; // seed a few if you want
}

getAll() {
return this.items;
}

// Alias for getAll() (optional, for compatibility)
all() {
return this.items;
}

// Find product by ID (main)
getById(id) {
// accept "1" or 1
const s = String(id);
return this.items.find(p => String(p.id) === s) || null;
}

// Alias for getById() (optional, for compatibility)
findById(id) {
return this.getById(id);
}

// Create new product
create({ name, price, imageUrl, description }) {
const product = {
id: randomUUID(), // or use incremental ids if you prefer
name,
price, // number (e.g., 1999)
imageUrl: imageUrl || "",
description: description || "",
createdAt: new Date().toISOString(),
updatedAt: new Date().toISOString(),
};
this.items.push(product);
return product;
}

// 🆕 Add this update method
update(id, { name, price, imageUrl, description }) {
const product = this.getById(id);
if (!product) return null;

product.name = name;
product.price = price;
product.imageUrl = imageUrl || "";
product.description = description || "";
product.updatedAt = new Date().toISOString();
return product;
}

// 🆕 Add this remove method
remove(id) {
const index = this.items.findIndex(p => String(p.id) === String(id));
if (index === -1) return false;
this.items.splice(index, 1);
return true;
}
}

export const productStore = new ProductStore();

// Seed with a sample product
productStore.create({
name: "Sample T-Shirt",
price: 1999,
imageUrl: "https://via.placeholder.com/150",
description: "Soft cotton tee",
});