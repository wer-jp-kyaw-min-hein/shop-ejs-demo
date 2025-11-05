import { cartDetailed } from "../lib/cart";
import { productStore } from "../models/productStore.js"; // must expose getById

export const Home = (req, res) => {
    const data = cartDetailed(req, productStore) || { lines: [], total: 0, count: 0 };
    res.render("cart/index", { cart: data });
};