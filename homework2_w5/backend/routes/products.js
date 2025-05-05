const express = require('express');
const router = express.Router();
const { readProductsJSONFile, writeProductsJSONFile } = require('../utils/fileUtils');

function paginate(array, page = 1, limit = 10) {
    const start = (page - 1) * limit;
    const end = page * limit;
    const results = { 
        data: array.slice(start, end),
        pagination: {
            total: array.length,
            page,
            limit,
            pages: Math.ceil(array.length / limit)
        }
    };

    if (end < array.length) {
        results.pagination.next = { page: page + 1, limit };
    }

    if (start > 0) {
        results.pagination.previous = { page: page - 1, limit };
    }

    return results;
}

router.get('/', (req, res) => {
    let products = readProductsJSONFile();
    const { name, minPrice, maxPrice, sort, page = 1, limit = 10 } = req.query;

    if (req.query.name && typeof req.query.name === 'string') {
        const nameQuery = req.query.name.toLowerCase();
        products = products.filter(product =>
            product?.name?.toLowerCase().includes(nameQuery)
        )
    }

    if (minPrice) {
        products = products.filter(products => products.price >= parseFloat(minPrice));
    }

    if (maxPrice) {
        products = products.filter(products => products.price <= parseFloat(maxPrice));
    }

    if (sort) {
        const field = sort.startsWith('-') ? sort.slice(1) : sort;
        const order = sort. startsWith('-') ? -1 : 1;
        products.sort((a, b) => {
            if (a[field] < b[field]) return -1 * order;
            if (a[field] > b[field]) return 1 * order;
        });
    }

    const paginated = paginate(products, parseInt(page), parseInt(limit));
    res.status(200).json(paginated);
});

router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const products = readProductsJSONFile();

    const product = products.find(p => p.id === id);

    if (product) {
        res.status(200).json(product);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

router.post('/', (req, res) => {
    const products = readProductsJSONFile();
    const { name, price, description } = req.body;

    if(!name || !price || !description) {
        return res.status(400).json({ message: 'Toate campurile sunt necesare' });
    }

    const newProduct = {
        id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
        name,
        price,
        description,
        createdAt: new Date().toISOString()
    };

    products.push(newProduct);

    if (writeProductsJSONFile(products)) {
        res.status(201).json(newProduct);
    } else {
        res.status(500).json({ error: 'Eroare la adaugarea produsului' });
    }
});

router.put('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const products = readProductsJSONFile();
    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) {
        return res.status(404).json({ message: 'Produsul nu s-a gasit' });
    }

    const { name, price, description } = req.body;

    const updatedProduct = {
        ...products[productIndex],
        ...(name && { name }),
        ...(price && { price }),
        ...(description !== undefined && { description }),
        updatedAt: new Date().toISOString()
    };

    products[productIndex] = updatedProduct;

    if (writeProductsJSONFile(products)) {
        res.status(200).json(updatedProduct);
    } else {
        res.status(500).json({ error: 'Eroare la actualizarea produsului' });
    }
});

router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const products = readProductsJSONFile();
    const initialLength = products.length;
    const filtered = products.filter(p => p.id !== id);

    if (filtered.length === initialLength) {
        return res.status(404).json({ message: 'Produsul nu s-a gasit' });
    }

    if (writeProductsJSONFile(filtered)) {
        res.status(204).send();
    } else {
        res.status(500).json({ error: 'Eroare la stergerea produsului' });
    }
});

module.exports = router;