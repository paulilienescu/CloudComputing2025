const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const externalRoutes = require('./routes/external');

const app = express();

app.use(cors());
app.use(express.json()); 

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api', externalRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

module.exports = app;