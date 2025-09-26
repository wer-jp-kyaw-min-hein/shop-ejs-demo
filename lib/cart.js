export function getCart(req) {
    if (!req.session.cart) req.session.cart = [];
    return req.session.cart;
}

export function addToCart(req, productId, qty = 1) {
    const cart = getCart(req);
    const line = cart.find(l => l.id === productId);
    if (line) line.qty += qty;
    else cart.push({ id: productId, qty });
}

export function setQty(req, productId, qty) {
    const cart = getCart(req);
    const line = cart.find(l => l.id === productId);
    if (!line) return;
    if (qty <= 0) {
        req.session.cart = cart.filter(l => l.id !== productId);
    } else {
        line.qty = qty;
    }
}

export function removeFromCart(req, productId) {
    req.session.cart = getCart(req).filter(l => l.id !== productId);
}

export function cartDetailed(req, productStore) {
    const lines = getCart(req).map(l => {
        const p = productStore.getById(l.id); // make sure you have this
        if (!p) return null;
        const price = p.price // integer (e.g., 1999 = ¥1,999)
        const subtotal = price * l.qty;
        return {...l, name: p.name, price, imageUrl: p.imageUrl, subtotal };
    }).filter(Boolean);

    const total = lines.reduce((s, x) => s + x.subtotal, 0);
    const count = lines.reduce((s, x) => s + x.qty, 0);
    return { lines, total, count };
}