import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import Database from "better-sqlite3";
import crypto from "crypto";
// import { arrayBuffer } from "stream/consumers";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// (optional) static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false}));
app.use(cookieParser());

// --- DB setup ---
const db = new Database(path.join(__dirname, "data.db"));
db.exec(`
  CREATE TABLE IF NOT EXISTS cart_lines (
    cid TEXT NOT NULL,
    product_id TEXT NOT NULL,
    qty INTEGER NOT NULL,
    PRIMARY KEY (cid, product_id)
  );
`);

// ensure a cart id cookie per visitor
app.use((req, res, next) => {
  if (!req.cookies.cid) {
    res.cookie("cid", crypto.randomUUID(), { httpOnly: true });
  }
  next();
});

// ---- VAR LIST (mock products) ----
const products = [
  { id: 1, name: "Sample A", price_cents: 900, stock:5, image_url: "https://picsum.photos/899/200?1", active: true },
  { id: 2, name: "Out of Stock", price_cents: 1200, stock: 0, image_url:"https://picsum.photos/800/200?2", active: true },
  { id: 3, name: "Low Stock", price_cents: 400, stock: 1, image_url: "https://picsum.photos/800/200?3", active: true},
  { id: 4, name: "Hidden Product", price_cents: 1900, stock: 7, image_url: "https://picsum.photos/800/200?4", active: false },
  { id: 5, name: "Long Name Product That Wraps Correctly", price_cents: 200, stock: 10, image_url: "https://picsum.photos/800/200?5", active: true},
  { id: 6, name: "No Image", price_cents: 100, stock: 3, image_url: "",active: true }
];

const cart = [];

app.get("/", (req, res) => {
  const active = products.filter(p => p.active);
    // Make sure views/index.ejs exists
    res.render("index", {
      products: active,
      fmt: cents => (cents / 100).toFixed(2),
    });
});

// Handle add-to-cart posts
app.post("/cart/add/:id", (req, res) => {
  const { id } = req.params;
  const product = products.find(p => p.id == id && p.active);
  if (!product) return res.status(404).send("Not found");

const qty = Number.parseInt(req.body.qty, 10);
  if (!Number.isInteger(qty) || qty < 1) return res.status(400).send("Invalid qty");
  if (qty > product.stock) return res.status(400).send("Exceeds stock");

  const cid = req.cookies.cid;

  const line = cart.find(l => l.id == id);
  if (line) line.qty += qty;
  else cart.push({ id, qty });

 // upsert: add or bump quantity
 db.prepare(`
  INSERT INTO cart_lines (cid, product_id, qty)
  VALUES (?, ?, ?)
  ON CONFLICT(cid, product_id) DO UPDATE SET qty = qty + excluded.qty
`).run(cid, id, qty);

  // product.stock = product.stock - Number(qtyStr);

  return res.redirect("/cart");
});

// 3) Cart page (add this NEW route)
app.get("/cart", (req, res) => {
  const cid = req.cookies.cid;
  const rows = db.prepare(`SELECT product_id, qty FROM cart_lines WHERE cid = ? `).all(cid);

  const lines = rows.map(r => {
    const p = products.find(pp => pp.id == line.id) || {};
    const price_cents = p.price_cents || 0;
    return {
      id: r.product_id,
      name: p.name || `#${r.product_id}`,
      qty: r.qty,
      subtotal_cents: price_cents * r.qty
    };
  });
  const total_cents = lines.reduce((sum, l) => sum + l.subtotal_cents, 0);

  res.render("cart/index", {
    lines,
    total_cents,
    fmt: cents => (cents / 100).toFixed(2),
  });
});

  const PORT = process.env.PORT || 3000;
  // Use a template literal so ${PORT} is interpolated:
  app.listen(PORT, () => console.log(`http://localhost:${PORT}`));

