const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(express.json());

let products = [];
let orders = [];
let users = [];

app.get("/", (req, res) => {
  res.send("Catalog App running on Azure");
});

// ------------------- REGISTER -------------------
app.post('/register', (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
  
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }
  
    users.push({ username, password });
    res.status(201).json({ message: 'User registered successfully' });
  });

  
// ------------------- LOGIN -------------------
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  res.json({ message: 'Login successful' });
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
