import express from 'express';
import { productStore } from '../models/productStore.js';

const router = express.Router();
router.get("/", (req, res) => {
    res.render("products/index", { products: productStore.getAll() });
});
export default router;