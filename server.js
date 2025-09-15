import express from "express"; 
import methodOverride from "method-override";
import path from "path";
import cookieParser from "cookie-parser";
import Database from "better-sqlite3";
import crypto from "crypto";
import bodyParser from "body-parser";
import cartRouter from "./routes/cart.routes.js";
import adminProductsRouter from "./routes/admin.products.js";
// import { arrayBuffer } from "stream/consumers";
import { fileURLToPath } from "url";
import session from 'express-session';
import productStore  from './models/productStore.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// --- view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// --- middlewares
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true})); // parse form
app.use(express.json()); // parse JSON bodies
app.use(methodOverride('_method')); // ?_method=PUT/DELETE from forms
app.use(cookieParser());
app.use(bodyParser.json());

// Cart routes
app.use("/admin/products", adminProductsRouter);
app.use("/cart", cartRouter);

// const adminProductsRouter = require('./routes/admin.products');
app.use(
  session({
    secret: 'dev_mini-shop-secret', // change in real app
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 },
  })
);

// --- mount admin products
app.use('/admin/products', adminProductsRouter);

// ---------- USER SIDE: products list ----------
app.get('/products', async (req, res, next) => {
  try {
    const products = await productStore.getAll();
    res.render('products/index', { products });
  } catch (e) { next(e); }
});

// ---------- CART HELPERS ----------
function getCart(req) {
  if (!req.session.cart) req.session.cart = { items: {}, count: 0, subtotal: 0  };
  return req.session.cart;
}
async function recalc(cart) {
  cart.count = 0;
  cart.subtotal = 0;
  for (const [productId, item] of Object.entries(cart.items)) {
    cart.count += item.qty;
    cart.subtotal += item.qty * item.price;
  }
  cart.subtotal = Math.round(cart.subtotal * 100) / 100;
}

// ---------- CART ROUTES ----------
app.post('/cart', async (req, res, next) => {
  try {
    const { productId, qty = 1 } = req.body;
    const product = await productStore.getById(productId);
    if (!product) return res.status(404).send('Product not found');

    const cart = getCart(req);
    if (!cart.items[productId]) {
      cart.items[productId] = {
        productId,
        name: product.name,
        price: Number(product.price) || 0,
        qty: 0,
      };
    }
    cart.items[productId].qty += Number(qty) || 1;
    await recalc(cart);
    res.redirect('/cart');
  } catch (e) { next(e); }
});

app.get('/cart', (req, res) => {
  const cart = getCart(req);
  res.render('cart/index', { cart });
});

app.post('/cart/:id/increase', async (req, res) => {
  const cart = getCart(req);
  const item = cart.items[req.params.id]
  if (item) item.qty += 1;
  await recalc(cart);
  res.redirect('/cart');
});

app.post('/cart/:id/decrease', async (req, res) => {
  const cart = getCart(req);
  const item = cart.items[req.params.id];
  if (item) {
    item.qty -= 1;
    if (item.qty <= 0) delete cart.items[req.params.id];
  }
  await recalc(cart);
  res.redirect('/cart');
});

app.post('/cart/;id/remove', async (req, res) => {
  const cart = getCart(req);
  delete cart.items[req.params.id];
  await recalc(cart);
  res.redirect('/cart');
});

app.post('/cart/clear', async (req, res) => {
  req.session.cart = null;
  res.redirect('/cart');
});

// ---------- SUBMIT ORDER (stub) ----------
app.post('/orders', async (req, res) => {
  const cart = getCart(req);
  if (!cart.count) return res.redirect('/cart');
  // TODO: save to a JSON orders file or DB later
  req.session.cart = null;
  res.render('orders/thanks');
});

// --- DB setup ---
const db = new Database(path.join(__dirname, "data.db"));
db.exec(`
  CREATE TABLE IF NOT EXISTS cart_lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,  -- single PK
    cid TEXT NOT NULL,                     -- cart id (cookie)
    product_id TEXT NOT NULL,              -- product id
    qty INTEGER NOT NULL,
    UNIQUE (cid, product_id)               -- one row per product per cart
  );
  CREATE INDEX IF NOT EXISTS idx_cart_lines_cid ON cart_lines(cid);
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


app.get("/", (req, res) => {
  const active = products.filter(p => p.active);
    // Make sure views/index.ejs exists
    res.render("index", {
      products: active,
      fmt: cents => (cents / 100).toFixed(2),
    });
});

// Handle add-to-cart posts
app.post("/cart/add", (req, res) => {
  const { id } = req.params;
  const product = products.find(p => p.id == id && p.active);
  if (!product) return res.status(404).send("Not found");

const qty = Number.parseInt(req.body.qty, 10);
  if (!Number.isInteger(qty) || qty < 1) return res.status(400).send("Invalid qty");
  if (qty > product.stock) return res.status(400).send("Exceeds stock");

  const cid = req.cookies.cid;

  db.prepare(`
    INSERT INTO cart_lines (cid, product_id, qty)
    VALUES (?, ?, ?)
    ON CONFLICT(cid, product_id) DO UPDATE
      SET qty = qty + excluded.qty
  `).run(cid, String(id), qty);


  product.stock -= qty;

  return res.redirect("/cart");
});

// 3) Cart page (add this NEW route)
app.get("/cart", (req, res) => {
  const cid = req.cookies.cid;
  const rows = db.prepare(`SELECT product_id, qty FROM cart_lines WHERE cid = ? `).all(cid);

  const lines = rows.map(r => {
    const p = products.find(pp => pp.id == r.product_id) || {};
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

