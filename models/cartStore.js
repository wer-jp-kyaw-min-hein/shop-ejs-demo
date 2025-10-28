// models/cartStore.js
import fs, { write } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "..", "data", "cart.json");

function ensureDB() {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, "[]", "utf8");
}

function readAll() {
    ensureDB();
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw || "[]")
}

function writeAll(items) {
    ensureDB();
    fs.writeFileSync(DB_PATH, JSON.stringify(items, null, 2), 'utf-8');    
}

export const cartStore = {
    list() {
        return readAll();
    },
    add(productId, qty = 1) {
        const items = readAll();

        // coerce qty to a positive integer (default 1)
        let n = Number(qty);
        if (!Number.isFinite(n) || n <= 0) n = 1;
        n = Math.floor(n);

        const idStr = String(productId);
        const existing = items.find(i => i.productId === idStr);

        if (existing) {
            existing.qty += n;
        } else {
            items.push({ id: nanoid(), productId: idStr, qty: n });
        }
        
        writeAll(items);
        return items;
    },
    remove(id) {
        let items = readAll();
        items  = items.filter(i => i.id !== id);
        writeAll(items);
        return items;
    },
    clear() {
        writeAll([]);
        return [];
    },
};