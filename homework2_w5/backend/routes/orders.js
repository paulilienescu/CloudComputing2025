const express = require('express');
const router = express.Router();
const { readOrdersJSONFile, writeOrdersJSONFile, readProductsJSONFile } = require('../utils/fileUtils');

const roundTo2 = (num) => Math.round(num * 100) / 100;

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
    }

    if (end < array.length) {
        results.pagination.next = { page: page + 1, limit };
    }

    if (start > 0) {
        results.pagination.previous = { page: page - 1, limit };
    }  

    return results;
}

router.get('/', (req, res) => {
    let orders = readOrdersJSONFile();
    const { status, customerName, sort, page = 1, limit = 10 } = req.query;

    if (status) {
        orders = orders.filter(order =>
            typeof order.status === 'string' &&
            order.status.toLowerCase() === status.toLowerCase()
        )
    }

    if (customerName) {
        orders = orders.filter(order => 
            typeof order.customerName === 'string' &&
            order.customerName.toLowerCase().includes(customerName.toLowerCase())
        )
    }

    if (sort) {
        const field = sort.startsWith('-') ? sort.slice(1) : sort;
        const order = sort.startsWith('-') ? -1 : 1;
        orders.sort((a, b) => {
            if(a[field] < b[field]) return -1 * order;
            if(a[field] > b[field]) return 1 * order;
            return 0;
        })
    }

    const paginated = paginate(orders, parseInt(page), parseInt(limit));
    res.status(200).json(paginated);
});

router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const orders = readOrdersJSONFile()
    const order = orders.find(o => o.id === id)


    if (order) {
        res.status(200).json(order);
    } else {
        res.status(404).json({ error: 'Nu s-a gasit comanda cu ID-ul '.concat(id.toString())})
    }
})

router.post('/', (req, res) => {
    const orders = readOrdersJSONFile();
    const products = readProductsJSONFile();

    const { customerName, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Comanda trebuie sa contina cel putin un produs' });
    }

    const enrichedItems = [];
    let total = 0;
    let hasErrors = false;

    for (const item of items) {
        const { productId, quantity } = item;

        const product = products.find(prod => prod.id === productId);
        if(!product || !quantity || quantity < 0) {
            hasErrors = true;
            break;
        }

        const itemTotal = roundTo2(product.price * quantity);
        total += itemTotal;
        
        enrichedItems.push({
            productId,
            productName: product.name,
            quantity,
            unitPrice: roundTo2(product.price),
            total: itemTotal
        })
    }

    if (hasErrors) {
        return res.status(400).json({ error: 'Toate produsele trebuie sa aibe un ID valid si o cantitate mai mare decat 0'})
    }

    total = roundTo2(total);

    const newOrder = {
        id: orders.length > 0 ? Math.max(...orders.map(order => order.id)) + 1 : 1,
        customerName: customerName,
        items: enrichedItems,
        total,
        status: 'pending',
        createdAt: new Date().toISOString()
    }

    orders.push(newOrder);

    if (writeOrdersJSONFile(orders)) {
        res.status(201).json(newOrder);
    } else {
        res.status(500).json({ error: 'Nu s-a putut salva comanda'})
    }
});


router.put('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const orders = readOrdersJSONFile();
    const orderIndex = orders.findIndex(order => order.id === id);

    if(orderIndex === -1) {
        return res.status(404).json({ error: 'Nu s-a gasit comanda'})
    }

    const { customerName, status } = req.body;

    const updatedOrder = {
        ...orders[orderIndex],
        ...(customerName && { customerName }),
        ...(status && { status }),
        updatedAt: new Date().toISOString()
    };

    orders[orderIndex] = updatedOrder;

    if(writeOrdersJSONFile(orders)) {
        res.status(200).json(updatedOrder);
    } else {
        res.status(500).json({ error: 'Nu s-a putut actualiza comanda'});
    }
});

router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const orders = readOrdersJSONFile();
    const initialLength = orders.length;

    const filteredOrders = orders.filter(order => order.id !== id);

    if (filteredOrders.length === initialLength) {
        return res.status(404).json({ error: 'Nu s-a gasit comanda'})
    }

    if(writeOrdersJSONFile(filteredOrders)) {
        res.status(204).send();
    } else {
        res.status(500).json({ error: 'Nu s-a reusit stergerea comenzii'});
    }
});

module.exports = router;