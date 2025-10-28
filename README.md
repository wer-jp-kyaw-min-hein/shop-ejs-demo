Mini Shop (EJS demo)

Overview
Simple Express + EJS demo with admin CRUD for products, a session-based cart, and simple order management.

Prerequisites
- Node.js 18+ installed
- Run commands from the project root directory

Install and run
1. Install dependencies:
   npm install
2. Start the app (development):
   node .\server.js
   or
   npm run dev
The server will listen on http://localhost:3000 by default.

Important pages
- Home: http://localhost:3000
- Public product listing: http://localhost:3000/products
- Cart (session): http://localhost:3000/cart
- Checkout (form POST from cart): http://localhost:3000/checkout
- Admin product CRUD: http://localhost:3000/admin/products
- Admin order management: http://localhost:3000/admin/orders

Where data is stored
- Products are persisted to data/products.json
- Orders are persisted to data/orders.json
- Cart is session-based (stored in the Express session cookie store)

Manual test plan (UI)
1. Verify products are present
   - Visit http://localhost:3000/products and confirm the sample products appear.
2. Admin: Create product
   - Visit http://localhost:3000/admin/products and click "New Product".
   - Fill name, price, image url and description and submit.
   - Confirm the product appears in the admin list and in data/products.json.
3. Admin: Edit product
   - From the admin products list click "Edit" to open the edit form.
   - Update fields and submit. Confirm changes in the list and in data/products.json.
4. Admin: Delete product
   - From the admin products list click "Delete" and confirm. The product should be removed from the list and data/products.json.
5. User: Add to cart and checkout
   - From the public products page click "Add to Cart" for one or more items.
   - Visit http://localhost:3000/cart to view cart lines, modify qty, or remove items.
   - Submit checkout from the cart page. You should see a thank-you page and an order object written to data/orders.json with status "received".
6. Admin: Accept / Reject orders
   - Visit http://localhost:3000/admin/orders. Each order shows Accept and Reject buttons.
   - Click Accept or Reject and confirm the order status updates both in the UI and in data/orders.json.

Quick command-line smoke tests (PowerShell)
Note: server must be running in a separate terminal. Commands use curl.exe (bundled with Windows) and PowerShell JSON helpers.

# Add an item to the cart (uses a sample product id from data/products.json)
curl.exe -s -c cookies.txt -b cookies.txt -X POST http://localhost:3000/cart/add/1a2b3c4d-0000-0000-0000-000000000001

# View cart page (saved to cart.html)
curl.exe -s -b cookies.txt http://localhost:3000/cart -o cart.html

# Checkout (creates an order)
curl.exe -s -b cookies.txt -X POST http://localhost:3000/checkout -o thanks.html

# Show orders (PowerShell JSON)
Get-Content .\data\orders.json -Raw | ConvertFrom-Json

# Accept the first order (replace <ORDER_ID> or use PowerShell to extract)
$orders = Get-Content .\data\orders.json -Raw | ConvertFrom-Json; $id = $orders[0].id; curl.exe -X POST "http://localhost:3000/admin/orders/$id/accept" -b cookies.txt -c cookies.txt

Notes and caveats
- Admin routes are not protected by authentication in this demo. Add middleware for real deployments.
- The command-line simulation uses cookie files to persist the session across requests. For complex session flows prefer using a browser.
- If you see errors when using curl to exercise cart endpoints, prefer the browser UI — the cart code expects session shapes and form submissions similar to browser behavior.

If you'd like, I can make these improvements for you:
- Add a `dev/seed-all` route that populates products and sample orders.
- Show product names in admin order lines (currently order lines contain product ids).
- Add simple admin authentication middleware.
