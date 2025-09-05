// models/productStore.js
const fs = require('fs')
const path = require('path');
const { nanoid } = require('nanoid');

const DB_PATH = path.join(__dirname, '..', 'data', 'products.json');

function ensureDB() {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true});
}4