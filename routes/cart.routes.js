// routes/cart.routes.js
import express from "express";
import { cartStore } from "../models/cartStore.js";
import { productStore } from "../models/productStore.js";

const router = express.Router();

// Health check (helps confirm mount)
router.get("/ping", (req, res) => res.json({ ok: true }));

// POST /cart/add/:productId (qty defaults to 1)
router.post("/add/:productId", async (req, res) => {
    const { productId } = req.params;
    console.log("ADD (default qty) productId=", productId);

    const product = await productStore.getByID(productId);
    if (!product) {
        console.log("Product not found:", productId);
        return res.status(404).json({ error: "Product not found"});
    }

    const items = cartStore.add(productId, 1);
    res.json(items);
});

// POST /cart/add/:productId/:qty  (explicit qty)
router.post("/add/:productId/:qty", async (req, res) => {
    const { productId, qty } = req.params;
    console.log("ADD (explicit qty) productId=", productId, "qty=", qty);

    const product = await productStore.getByID(productId);
    if (!product) {
        console.log("Product not found:", productId);
        return res.status(404).json({ error: "Product not found" });
    }
    
    const items = cartStore.add(productId, Number(qty) || 1);
    res.json(items);
  });
  
// GET /cart
router.get("/", (req, res) => {
    res.json(cartStore.list());
});

// DELETE /cart/:id
router.delete("/:id", (req, res) => {
    res.json(cartStore.remove(req.params.id));
});

// DELETE /cart
router.delete("/", (req, res) => {
    res.json(cartStore.clear());
});

export default router;