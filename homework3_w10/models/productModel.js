// models/productModel.js
const { database } = require("../config/cosmosClient");

const container = database.container("products");

async function createProduct(product) {
  const { resource } = await container.items.create(product);
  return resource;
}

async function getAllProducts() {
  const querySpec = { query: "SELECT * FROM products" };
  const { resources } = await container.items.query(querySpec).fetchAll();
  return resources;
}

async function getProductById(id) {
  const { resource } = await container.item(id, id).read();
  return resource;
}

async function updateProduct(id, updates) {
  const item = await getProductById(id);
  const updated = { ...item, ...updates };
  const { resource } = await container.items.upsert(updated);
  return resource;
}

async function deleteProduct(id) {
  await container.item(id, id).delete();
  return { id };
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
