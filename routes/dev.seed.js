// routes/dev.seed.js
import express from "express";
import { productStore } from "../models/productStore.js";
const router = express.Router();

router.post("/seed-product", (req, res) => {
  const p = productStore.create({
    name: "Sample T-Shirt",
    price: 1999,
    imageUrl: "https://via.placeholder.com/150",
    description: "Soft cotton tee",
  });
  res.json(p);
});

export default router;
