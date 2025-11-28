// // routes/cart.routes.js
// import express from "express";
// import { cartStore } from "../models/cartStore.js";
// import { productStore } from "../models/productStore.js";

// const router = express.Router();

// // GET cart
// router.get('/', (req, res) => {
//     res.json(req.session.cart || []);
// });

// // POST add to cart
// router.post('/', (req, res) => {
//     const { productId, quantity = 1 } = req.body;
    
//     const product = productStore.findById(productId); // correct method name
//     if (!product) {
//         return res.status(404).json({ error: 'Product not found' });
//     }

//     const current = req.session.cart || [];
//     const idx = current.findIndex(i => i.productId === productId);
//     const next = idx >= 0
//         ? current.map((i, k) => (k === idx ? { ...i, quantity: i.quantity + Number(quantity) } : i))
//         : [...current, { productId, name: product.name, price: product.price, quantity: Number(quantity) }];

//     req.session.cart = next;
//     req.session.save(() => res.status(201).json(req.session.cart));
// });

// // Health check (helps confirm mount)
// router.get("/ping", (req, res) => res.json({ ok: true }));

// // POST /cart/add/:productId (qty defaults to 1)
// router.post("/add/:productId", async (req, res) => {
//     const { productId } = req.params;
//     console.log("ADD (default qty) productId=", productId);

//     const product = await productStore.findById(productId);
//     if (!product) {
//         console.log("Product not found:", productId);
//         return res.status(404).json({ error: "Product not found"});
//     }

//     const items = cartStore.add(productId, 1);
//     res.json(items);
// });

// // POST /cart/add/:productId/:qty  (explicit qty)
// router.post("/add/:productId/:qty", async (req, res) => {
//     const { productId, qty } = req.params;
//     console.log("ADD (explicit qty) productId=", productId, "qty=", qty);

//     const product = await productStore.findById(productId);
//     if (!product) {
//         console.log("Product not found:", productId);
//         return res.status(404).json({ error: "Product not found" });
//     }
    
//     const items = cartStore.add(productId, Number(qty) || 1);
//     res.json(items);
//   });
  
// // GET /cart
// router.get("/", (req, res) => {
//     res.json(cartStore.list());
// });

// // DELETE /cart/:id
// router.delete("/:id", (req, res) => {
//     res.json(cartStore.remove(req.params.id));
// });

// // DELETE /cart
// router.delete("/", (req, res) => {
//     res.json(cartStore.clear());
// });

// export default router;

import express from "express";
import { showCart, addItem } from "../controllers/cartController.js";
import { addToCart, setQty, removeFromCart, cartDetailed } from "../lib/cart.js";
import { productStore } from "../models/productStore.js"; // must expose getById
import { Home } from "../controllers/homeCl.js";

const router = express.Router();

// just connect route to controller
router.get("/", Home);
router.get("/", showCart);
router.get("/add/:id", addItem);

// Show cart
router.get("/", (req, res) => {
  const data = cartDetailed(req, productStore) || { lines: [], total: 0, count: 0 };
  res.render("cart/index", { cart: data });
});

// Add
router.post("/add/:id", (req, res) => {
  const p = productStore.getById(req.params.id);
  if (!p) return res.status(404).send("Product not found");

  const qty = Math.max(1, parseInt(req.body.qty || "1", 10) || 1);
  addToCart(req, p.id, qty);

  req.session.flash = `Added ${qty} × ${p.name} to cart`;
  res.redirect("/cart");
});

// Update quantity
router.post("/qty/:id", (req, res) => {
  const qty = Math.max(0, Math.min(99, parseInt(req.body.qty||'1',10)||1));
  setQty(req, req.params.id, isNaN(qty) ? 1 : qty);
  res.redirect("/cart");
});

// Remove
router.post("/remove/:id", (req, res) => {
  removeFromCart(req, req.params.id);
  res.redirect("/cart");
});


export default router;
