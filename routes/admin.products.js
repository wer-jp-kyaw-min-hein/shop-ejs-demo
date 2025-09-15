import express from "express";
// const store = require('../models/productStore');
import productStore from "../models/productStore.js";
const router = express.Router(); // Creates a mini Express app

// LIST
router.get('/', async (req, res) => {
    const products = await productStore.getAll();
    res.render('admin/products/index', { products });
});

// NEW form
router.get('/new', (req, res) => {
    res.render('admin/products/new', { product: {} });
});

// CREATE
router.post('/', async (req, res) => {
    const { name, price } = req.body;
    if (!name || price == undefined) {
        // simple validation
        return res.status(400).send('name and price are required');
    }
    await productStore.create(req.body);
    res.redirect('/admin/products');
});

// EDIT form
router.get('/:id', async (req, res) => {
    const product = await productStore.get(req.params.id);
    if (!product) return res.status(404).send('Not found');
    res.render('admin/products/edit', { product });
});

// UPDATE
router.post('/:id', async (req, res) => {
    const updated = await productStore.update(req.params.id, req.body);
    if (!updated) return res.status(404).send('Not found');
    res.redirect('/admin/products');
});

// DELETE
router.post('/:id/delete', async (req, res) => {
    await productStore.remove(req.params.id);
    res.redirect('/admin/products');
});

// export so server.js can use it
export default router;