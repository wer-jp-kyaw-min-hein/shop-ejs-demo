import { addToCart, setQty, removeFromCart, cartDetailed } from '../lib/cart.js';
import { productStore } from '../models/productStore.js';

export const showCart = (req, res) => {
  const data = cartDetailed(req, productStore) || { lines: [], total: 0, count: 0 };
  res.render("cart/index", { cart: data });
};

export const addItem = (req, res) => {
    const p = productStore(req.params.id);
    if (!p) return res.status(404).send("Product not found");

    const qty = Math.max(1, parseInt(req.query.qty) || 1);
    addToCart(req, p.id, qty);

    req.session.flash = `Added ${qty} x ${p.name} to cart.`;
    res.redirect("/cart");
    };