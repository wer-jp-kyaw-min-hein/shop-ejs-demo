// routes/checkout.js
import express from "express";
import { cartDetailed } from "../lib/cart.js";
import { ordersStore } from "../models/ordersStore.js"; // simple file/db store
import { productStore } from "../models/productStore.js"; // needed by cartDetailed

const router = express.Router();

router.post("/", (req, res) => {
  const cart = cartDetailed(req, productStore);
  if (cart.lines.length === 0) return res.redirect("/cart");

  const order = ordersStore.create({
    lines: cart.lines.map(({ id, qty, price }) => ({ id, qty, price })),
    total: cart.total,
    createdAt: new Date().toISOString(),
  });

  req.session.cart = []; // clear
  res.render("orders/thanks", { order });
});

export default router;
