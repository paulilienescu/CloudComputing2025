const express = require("express");
const app = express();
require("dotenv").config();

const productRoutes = require("./routes/productRoutes");
const userRoutes = require('./routes/userRoutes');

app.use(express.json());

app.use('/users', userRoutes);
app.use("/products", productRoutes);

app.get("/", (req, res) => {
  res.send("Catalog App is live with Cosmos DB 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
