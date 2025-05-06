// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const {
  createProductHandler,
  getProductsHandler,
  getProductHandler,
  updateProductHandler,
  deleteProductHandler,
} = require("../controllers/productController");

// ruta de creare produs
router.post("/", createProductHandler);

// obține toate produsele
router.get("/", getProductsHandler);

// obține un produs după id
router.get("/:id", getProductHandler);

// actualizează un produs după id
router.put("/:id", updateProductHandler);

// șterge un produs după id
router.delete("/:id", deleteProductHandler);

module.exports = router;
