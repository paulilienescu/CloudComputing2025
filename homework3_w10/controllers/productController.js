// controllers/productController.js
const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
  } = require("../models/productModel");
  const { v4: uuidv4 } = require("uuid");
  
  async function createProductHandler(req, res) {
    try {
      const { name, price, stock } = req.body;
      if (!name || !price || !stock) {
        return res.status(400).json({ error: "Missing required fields" });
      }
  
      const newProduct = {
        id: uuidv4(), // Cosmos DB requires a string ID
        name,
        price,
        stock,
      };
  
      const created = await createProduct(newProduct);
      res.status(201).json(created);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create product" });
    }
  }
  
  async function getProductsHandler(req, res) {
    try {
      const products = await getAllProducts();
      res.json(products);
    } catch (err) {
      res.status(500).json({ error: "Failed to get products" });
    }
  }
  
  async function getProductHandler(req, res) {
    try {
      const product = await getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (err) {
      res.status(500).json({ error: "Failed to get product" });
    }
  }
  
  async function updateProductHandler(req, res) {
    try {
      const updated = await updateProduct(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: "Failed to update product" });
    }
  }
  
  async function deleteProductHandler(req, res) {
    try {
      const result = await deleteProduct(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  }
  
  module.exports = {
    createProductHandler,
    getProductsHandler,
    getProductHandler,
    updateProductHandler,
    deleteProductHandler,
  };
  