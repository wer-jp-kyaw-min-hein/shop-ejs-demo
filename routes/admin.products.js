import { Router } from "express";
import express from "express";
// const store = require('../models/productStore');
import { productStore } from "../models/productStore.js";
const router = express.Router(); // Creates a mini Express app

// LIST
router.get('/', async (req, res) => {
    const products = productStore.all();
    res.render('admin/products/index', { products });
});

// NEW form
router.get("/new", (req, res) => {
    res.render("admin/products/new");
});

// CREATE
router.post("/", (req, res) => {
    const { name, price, imageUrl, description } = req.body;
    // guard + type conversion
    if (!name || !price)
        // simple validation
        return res.send('name and price are required');
        productStore.create({
            name: String(name).trim(),
            price: Number(price),
            imageUrl: imageUrl?.trim() || null,
            description: description?.trim() || "",
          });
          res.redirect("/admin/products");
        });

// EDIT form
router.get('/:id/edit', (req, res) => {
    const product = productStore.findById(req.params.id);
    if (!product) return res.status(404).send('Not found');
    res.render('admin/products/edit', { product });
});

// UPDATE
router.post('/:id/edit', (req, res) => {
    const { name, price, imageUrl, description } = req.body;
    if (!name || !price) return res.send("name and price are required");

  const updated = productStore.update(req.params.id, {
    name: String(name).trim(),
    price: Number(price),
    imageUrl: imageUrl?.trim() || null,
    description: description?.trim() || "",
  });

  if (!updated) return res.status(404).send("Product not found");
  res.redirect("/admin/products");
});

// GET one product
router.get("/:id", (req, res) => {
    const product = productStore.findById(req.params.id);
    if (!product) return res.status(404).send("Product not found");
    res.render("admin/products/show", { product });
  });

// DELETE (simple, via POST)
router.post("/:id/delete", (req, res) => {
    const ok = productStore.remove(req.params.id);
    if (!ok) return res.status(404).send("Product not found");
    res.redirect("/admin/products");
  });
  
export default router;

//   // CREATE product
//   router.post("/", async (req, res) => {
//     const product = await productStore.create(req.body);
//     res.status(201).json(product);
//   });