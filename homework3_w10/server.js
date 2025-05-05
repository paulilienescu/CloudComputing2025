const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

let products = [];
let orders = [];

app.get("/", (req, res) => {
  res.send("Catalog App running on Azure");
});

// ------------------- PRODUCTS -------------------

app.get("/products", (req, res) => {
  res.json(products);
});

app.post("/products", (req, res) => {
  const { name, price, stock } = req.body;
  if (!name || !price || !stock) {
    return res.status(400).json({ error: "Missing fields in product" });
  }
  const product = { id: products.length + 1, name, price, stock };
  products.push(product);
  res.status(201).json(product);
});

// ------------------- ORDERS -------------------

app.get("/orders", (req, res) => {
  res.json(orders);
});

app.post("/orders", (req, res) => {
  const { productId, quantity } = req.body;
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  if (product.stock < quantity) {
    return res.status(400).json({ error: "Insufficient stock" });
  }

  product.stock -= quantity;
  const order = {
    id: orders.length + 1,
    productId,
    quantity,
    total: product.price * quantity,
  };
  orders.push(order);
  res.status(201).json(order);
});

// ------------------- SERVER -------------------

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
