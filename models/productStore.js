// models/productStore.js
// import fs, { read } from "fs";
import { promises as fs } from 'fs';
import path from "path";
import crypto from 'crypto';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, '..', 'data');
const FILE = path.join(DB_DIR, 'products.json');

async function ensureFile() {
  try {
    await fs.mkdir(DB_DIR, { recrusive: true });
    await fs.access(FILE);
  } catch {
    await fs.writeFile(FILE, JSON.stringify([], null, 2));
  }
}

async function readAll() {
  await ensureFile();
  const raw = await fs.readFile(FILE, 'utf-8');
  return JSON.parse(raw || '[]');
}
async function writeAll(items) {
  await ensureFile();
  await fs.writeFile(FILE, JSON.stringify(items, null, 2));
}

export const productStore = {
  async getAll() {
    return await readAll();
  },
  async getByID(id) {
    const items = await readAll();
    return items.find(p => String(p.id) === String(id)) || null;
  },

  async create(data) {
    const items = await readAll();
    const product = {
      id: crypto.randomUUID(),
      name: data.name?.trim() || 'Untitled',
      price: Number(data.price) || 0,
      imageUrl: data.imageUrl || '',
      description: data.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    items.push(product);
    await writeAll(items);
    return product;
  },
  async update(id,data) {
    const items = await readAll();
    const idx = items.findIndex(p => String(p.id) === String(id));
    if (idx === -1) return null;
    items[idx] = {
      ...items[idx],
      ...data,
      price: data.price !== undefined ? Number(data.price) : items[idx].price,
      updatedAt: new Date().toISOString(),
    };

    await writeAll(items);
    return items[idx];
  },
  async remove(id) {
    const items = await readAll();
    const next = items.filter(p => String(p.id) !== String(id));
    const changed = next.length !== items.length;
    if (changed) await writeAll(next);
    return changed;
  },
};
// function ensureDB() {
//     const dir = path.dirname(DB_PATH);
//     if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true});
//     if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, '[]', 'utf8');
// }

// function readAll() {
//     ensureDB();
//     const raw = fs.readFileSync(DB_PATH, 'utf8');
//     return JSON.parse(raw);
// }

// function writeAll(items) {
//     fs.writeFileSync(DB_PATH, JSON.stringify(items, null, 2), 'utf8');
// }

// module.exports = {
//     async list() {
//         return readAll().sort((a, b) => b.createdAt - a.createdAt);
//     },

//     async get(id) {
//         return readAll().find(p => p.id === id) || null;
//     },

//     async create({ name, description, price, imageUrl, inStock }) {
//         const items = readAll();
//         const product = {
//             id: nanoid(10),
//             name,
//             description: description || '',
//             price: Number(price || 0),
//             imageUrl: imageUrl || '',
//             inStock: inStock === 'on' || inStock === true,
//             createdAt: Date.now(),
//             updatedAt: Date.now(),
//         };
//         items.push(product);
//         writeAll(items);
//         return product;
//     },

//     async update(id, { name, description, price, imageUrl, inStock }) {
//         const items = readAll();
//         const idx = items.findIndex(p => p.id === id);
//         if (idx === -1) return null;
//         const current = items[idx];
//         const updated = {
//             ...current,
//             name: name ?? current.name,
//             description: description ?? current.description,
//             price: price !== undefined ? Number(price) : current.price,
//             imageUrl: imageUrl ?? current.imageUrl,
//             inStock: inStock !== undefined ? (inStock === 'on' || inStock === true) : current.inStock,
//             updatedAt: Date.now(),
//         };
//         items[idx] = updated;
//         writeAll(items);
//         return updated; 
//     },

//     async remove(id) {
//         const items = readAll();
//         const next = items.filter(p => p.id !== id);
//         writeAll(next);
//         return items.length !== next.length;
//     },
// };

// const productStore = {
//     async list() {
//       return readAll().sort((a, b) => b.createdAt - a.createdAt);
//     },
//     async get(id) {
//       return readAll().find(p => p.id === id) || null;
//     },
//     async create({ name, description, price, imageUrl, inStock }) {
//       const items = readAll();
//       const product = {
//         id: nanoid(10),
//         name,
//         description: description || "",
//         price: Number(price || 0),
//         imageUrl: imageUrl || "",
//         inStock: inStock === "on" || inStock === true,
//         createdAt: Date.now(),
//         updatedAt: Date.now(),
//       };
//       items.push(product);
//       writeAll(items);
//       return product;
//     },
//     async update(id, { name, description, price, imageUrl, inStock }) {
//       const items = readAll();
//       const idx = items.findIndex(p => p.id === id);
//       if (idx === -1) return null;
//       const current = items[idx];
//       const updated = {
//         ...current,
//         name: name ?? current.name,
//         description: description ?? current.description,
//         price: price !== undefined ? Number(price) : current.price,
//         imageUrl: imageUrl ?? current.imageUrl,
//         inStock: inStock !== undefined ? (inStock === "on" || inStock === true) : current.inStock,
//         updatedAt: Date.now(),
//       };
//       items[idx] = updated;
//       writeAll(items);
//       return updated;
//     },
//     async remove(id) {
//       const items = readAll();
//       const next = items.filter(p => p.id !== id);
//       writeAll(next);
//       return items.length !== next.length;
//     },
//   };
  
  export default productStore;