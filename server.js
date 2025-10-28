// server.js (ESM)
import express from "express";
import session from "express-session";
import methodOverride from "method-override";
import cookieParser from "cookie-parser"; // optional, fine to keep
import path from "node:path";
import { fileURLToPath } from "node:url";

// Routers (these should already exist)
import cartRouter from "./routes/cart.js";              // uses lib/cart.js (session)
import adminProductsRouter from "./routes/admin.products.js";
import adminOrdersRouter from './routes/admin.orders.js';
import checkoutRouter from "./routes/checkout.js";
import productRouter from "./routes/products.js";
import devSeed from "./routes/dev.seed.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* ---------- View engine ---------- */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* ---------- Core middleware (order matters) ---------- */
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true })); // forms
app.use(express.json());                         // JSON bodies
app.use(methodOverride("_method"));
app.use(cookieParser());                         // optional

app.use(session({
  secret: process.env.SESSION_SECRET || "dev-secret",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 2, sameSite: 'lax', secure: process.env.NODE_ENV==='production' }
  // and if behind a proxy:
  // app.set('trust proxy', 1);
}));

// cart count
app.use((req, res, next) => {
  const count = (req.session.cart || []).reduce((s, l) => s + (l.qty || 0), 0);
  res.locals.cartCount = count;
  next();
});

// yen helper (optional but handy)
app.use((req, res, next) => {
  res.locals.yen = (n) => Number(n || 0).toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' });
  next();
});

// flash (show once)
app.use((req, res, next) => {
  res.locals.flash = req.session.flash || null;
  req.session.flash = null;
  next();
});


/* ---------- Routers ---------- */
app.use("/dev", devSeed);                        // for quick seeding
app.use("/products", productRouter);             // public product listing
app.use("/admin/products", adminProductsRouter); // admin CRUD
app.use("/cart", cartRouter);                    // session cart (lib/cart.js)
app.use("/checkout", checkoutRouter);            // simple checkout
app.use('/admin/orders', adminOrdersRouter);

// server.js (near your other /dev routes)
// app.get("/dev/reset-session", (req, res) => {
//   req.session.destroy(() => res.send("ok"));
// });

// Home: send people to /products
app.get("/", (req, res) => res.render("index"));

/* ---------- Start ---------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
