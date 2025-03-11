const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Initialize data files if they don't exist
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
if (!fs.existsSync(PRODUCTS_FILE)) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([], 'utf8'));
}

const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
if (!fs.existsSync(ORDERS_FILE)) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify([], 'utf8'));
}

// Helper functions
const readJSONFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return [];
  }
};

const writeJSONFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing to file ${filePath}:`, error);
    return false;
  }
};

// Parse request body
const parseBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const parsedBody = body ? JSON.parse(body) : {};
        resolve(parsedBody);
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', (error) => {
      reject(error);
    });
  });
};

// Send JSON response
const sendJSONResponse = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

// Pagination helper
const paginateResults = (array, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const results = {
    data: array.slice(startIndex, endIndex),
    pagination: {
      total: array.length,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(array.length / limit)
    }
  };
  
  if (endIndex < array.length) {
    results.pagination.next = {
      page: page + 1,
      limit: limit
    };
  }
  
  if (startIndex > 0) {
    results.pagination.prev = {
      page: page - 1,
      limit: limit
    };
  }
  
  return results;
};

// PRODUCT HANDLERS
// ----------------

const handleGetProducts = (req, res, query) => {
  let products = readJSONFile(PRODUCTS_FILE);
  
  // Apply filters if provided
  if (query.name) {
    products = products.filter(p => 
      p.name.toLowerCase().includes(query.name.toLowerCase())
    );
  }
  
  if (query.minPrice) {
    products = products.filter(p => p.price >= parseFloat(query.minPrice));
  }
  
  if (query.maxPrice) {
    products = products.filter(p => p.price <= parseFloat(query.maxPrice));
  }
  
  // Apply sorting
  if (query.sort) {
    const sortField = query.sort.startsWith('-') 
      ? query.sort.substring(1) 
      : query.sort;
    const sortOrder = query.sort.startsWith('-') ? -1 : 1;
    
    products.sort((a, b) => {
      if (a[sortField] < b[sortField]) return -1 * sortOrder;
      if (a[sortField] > b[sortField]) return 1 * sortOrder;
      return 0;
    });
  }
  
  // Apply pagination
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const paginatedResults = paginateResults(products, page, limit);
  
  sendJSONResponse(res, 200, paginatedResults);
};

const handleGetProductById = (req, res, id) => {
  const products = readJSONFile(PRODUCTS_FILE);
  const product = products.find(p => p.id === id);
  
  if (product) {
    sendJSONResponse(res, 200, product);
  } else {
    sendJSONResponse(res, 404, { error: 'Product not found' });
  }
};

const handleCreateProduct = async (req, res) => {
  try {
    const products = readJSONFile(PRODUCTS_FILE);
    const newProduct = await parseBody(req);
    
    // Validate required fields
    if (!newProduct.name || !newProduct.price) {
      sendJSONResponse(res, 400, { error: 'Name and price are required fields' });
      return;
    }
    
    // Generate a new ID
    const newId = products.length > 0 
      ? Math.max(...products.map(p => p.id)) + 1 
      : 1;
    
    const productToAdd = {
      id: newId,
      name: newProduct.name,
      price: newProduct.price,
      description: newProduct.description || '',
      createdAt: new Date().toISOString()
    };
    
    products.push(productToAdd);
    
    if (writeJSONFile(PRODUCTS_FILE, products)) {
      sendJSONResponse(res, 201, productToAdd);
    } else {
      sendJSONResponse(res, 500, { error: 'Failed to save product' });
    }
  } catch (error) {
    console.error('Error creating product:', error);
    sendJSONResponse(res, 400, { error: 'Invalid JSON data' });
  }
};

const handleUpdateProduct = async (req, res, id) => {
  try {
    const products = readJSONFile(PRODUCTS_FILE);
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      sendJSONResponse(res, 404, { error: 'Product not found' });
      return;
    }
    
    const updatedData = await parseBody(req);
    const updatedProduct = {
      ...products[productIndex],
      ...updatedData,
      id: id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    products[productIndex] = updatedProduct;
    
    if (writeJSONFile(PRODUCTS_FILE, products)) {
      sendJSONResponse(res, 200, updatedProduct);
    } else {
      sendJSONResponse(res, 500, { error: 'Failed to update product' });
    }
  } catch (error) {
    console.error('Error updating product:', error);
    sendJSONResponse(res, 400, { error: 'Invalid JSON data' });
  }
};

const handleDeleteProduct = (req, res, id) => {
  const products = readJSONFile(PRODUCTS_FILE);
  const initialLength = products.length;
  const updatedProducts = products.filter(p => p.id !== id);
  
  if (updatedProducts.length === initialLength) {
    sendJSONResponse(res, 404, { error: 'Product not found' });
    return;
  }
  
  if (writeJSONFile(PRODUCTS_FILE, updatedProducts)) {
    sendJSONResponse(res, 204, null);
  } else {
    sendJSONResponse(res, 500, { error: 'Failed to delete product' });
  }
};

// ORDER HANDLERS
// -------------

const handleGetOrders = (req, res, query) => {
  let orders = readJSONFile(ORDERS_FILE);
  
  // Apply filters if provided
  if (query.status) {
    orders = orders.filter(o => o.status === query.status);
  }
  
  if (query.customerName) {
    orders = orders.filter(o => 
      o.customerName.toLowerCase().includes(query.customerName.toLowerCase())
    );
  }
  
  // Apply sorting
  if (query.sort) {
    const sortField = query.sort.startsWith('-') 
      ? query.sort.substring(1) 
      : query.sort;
    const sortOrder = query.sort.startsWith('-') ? -1 : 1;
    
    orders.sort((a, b) => {
      if (a[sortField] < b[sortField]) return -1 * sortOrder;
      if (a[sortField] > b[sortField]) return 1 * sortOrder;
      return 0;
    });
  }
  
  // Apply pagination
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const paginatedResults = paginateResults(orders, page, limit);
  
  sendJSONResponse(res, 200, paginatedResults);
};

const handleGetOrderById = (req, res, id) => {
  const orders = readJSONFile(ORDERS_FILE);
  const order = orders.find(o => o.id === id);
  
  if (order) {
    sendJSONResponse(res, 200, order);
  } else {
    sendJSONResponse(res, 404, { error: 'Order not found' });
  }
};

const handleCreateOrder = async (req, res) => {
  try {
    const orders = readJSONFile(ORDERS_FILE);
    const products = readJSONFile(PRODUCTS_FILE);
    const newOrder = await parseBody(req);
    
    // Validate required fields
    if (!newOrder.items || !Array.isArray(newOrder.items) || newOrder.items.length === 0) {
      sendJSONResponse(res, 400, { error: 'Order must contain at least one item' });
      return;
    }
    
    // Validate items
    const invalidItems = newOrder.items.filter(item => {
      return !item.productId || !item.quantity || item.quantity <= 0 || 
             !products.some(p => p.id === item.productId);
    });
    
    if (invalidItems.length > 0) {
      sendJSONResponse(res, 400, { 
        error: 'Invalid items in order. Each item must have a valid productId and a positive quantity.' 
      });
      return;
    }
    
    // Calculate total
    let total = 0;
    const orderItems = newOrder.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      const itemTotal = product.price * item.quantity;
      total += itemTotal;
      
      return {
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        total: itemTotal
      };
    });
    
    // Generate a new ID
    const newId = orders.length > 0 
      ? Math.max(...orders.map(o => o.id)) + 1 
      : 1;
    
    const orderToAdd = {
      id: newId,
      customerName: newOrder.customerName || 'Anonymous',
      items: orderItems,
      total: total,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    orders.push(orderToAdd);
    
    if (writeJSONFile(ORDERS_FILE, orders)) {
      sendJSONResponse(res, 201, orderToAdd);
    } else {
      sendJSONResponse(res, 500, { error: 'Failed to save order' });
    }
  } catch (error) {
    console.error('Error creating order:', error);
    sendJSONResponse(res, 400, { error: 'Invalid JSON data' });
  }
};

const handleUpdateOrder = async (req, res, id) => {
  try {
    const orders = readJSONFile(ORDERS_FILE);
    const orderIndex = orders.findIndex(o => o.id === id);
    
    if (orderIndex === -1) {
      sendJSONResponse(res, 404, { error: 'Order not found' });
      return;
    }
    
    const updatedData = await parseBody(req);
    
    // Only allow updating status and customerName
    const updatedOrder = {
      ...orders[orderIndex],
      customerName: updatedData.customerName || orders[orderIndex].customerName,
      status: updatedData.status || orders[orderIndex].status,
      updatedAt: new Date().toISOString()
    };
    
    orders[orderIndex] = updatedOrder;
    
    if (writeJSONFile(ORDERS_FILE, orders)) {
      sendJSONResponse(res, 200, updatedOrder);
    } else {
      sendJSONResponse(res, 500, { error: 'Failed to update order' });
    }
  } catch (error) {
    console.error('Error updating order:', error);
    sendJSONResponse(res, 400, { error: 'Invalid JSON data' });
  }
};

const handleDeleteOrder = (req, res, id) => {
  const orders = readJSONFile(ORDERS_FILE);
  const initialLength = orders.length;
  const updatedOrders = orders.filter(o => o.id !== id);
  
  if (updatedOrders.length === initialLength) {
    sendJSONResponse(res, 404, { error: 'Order not found' });
    return;
  }
  
  if (writeJSONFile(ORDERS_FILE, updatedOrders)) {
    sendJSONResponse(res, 204, null);
  } else {
    sendJSONResponse(res, 500, { error: 'Failed to delete order' });
  }
};

// Health check handler
const handleHealthCheck = (req, res) => {
  sendJSONResponse(res, 200, { 
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
};

// Create HTTP server
const server = http.createServer(async (req, res) => {
  // Parse URL
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;
  const query = parsedUrl.query;
  
  console.log(`${method} ${pathname}`);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Route handling
  try {
    // Health check
    if (pathname === '/api/health' && method === 'GET') {
      handleHealthCheck(req, res);
    }
    // Products collection routes
    else if (pathname === '/api/products' && method === 'GET') {
      handleGetProducts(req, res, query);
    } 
    // Single product routes
    else if (pathname.match(/^\/api\/products\/\d+$/) && method === 'GET') {
      const id = parseInt(pathname.split('/')[3]);
      handleGetProductById(req, res, id);
    } 
    // Create product
    else if (pathname === '/api/products' && method === 'POST') {
      await handleCreateProduct(req, res);
    } 
    // Update product
    else if (pathname.match(/^\/api\/products\/\d+$/) && method === 'PUT') {
      const id = parseInt(pathname.split('/')[3]);
      await handleUpdateProduct(req, res, id);
    } 
    // Delete product
    else if (pathname.match(/^\/api\/products\/\d+$/) && method === 'DELETE') {
      const id = parseInt(pathname.split('/')[3]);
      handleDeleteProduct(req, res, id);
    }
    // Orders collection routes
    else if (pathname === '/api/orders' && method === 'GET') {
      handleGetOrders(req, res, query);
    }
    // Single order routes
    else if (pathname.match(/^\/api\/orders\/\d+$/) && method === 'GET') {
      const id = parseInt(pathname.split('/')[3]);
      handleGetOrderById(req, res, id);
    }
    // Create order
    else if (pathname === '/api/orders' && method === 'POST') {
      await handleCreateOrder(req, res);
    }
    // Update order
    else if (pathname.match(/^\/api\/orders\/\d+$/) && method === 'PUT') {
      const id = parseInt(pathname.split('/')[3]);
      await handleUpdateOrder(req, res, id);
    }
    // Delete order
    else if (pathname.match(/^\/api\/orders\/\d+$/) && method === 'DELETE') {
      const id = parseInt(pathname.split('/')[3]);
      handleDeleteOrder(req, res, id);
    }
    // Not found
    else {
      sendJSONResponse(res, 404, { error: 'Not found' });
    }
  } catch (error) {
    console.error('Server error:', error);
    sendJSONResponse(res, 500, { error: 'Internal server error' });
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
}); 