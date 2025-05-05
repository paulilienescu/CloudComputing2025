const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

const readProductsJSONFile = () => {
    try {
        const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Eroare la citirea products.json : ', err);
        return [];
    }
};

const readOrdersJSONFile = () => {
    try {
        const data = fs.readFileSync(ORDERS_FILE, 'utf8');
        return data.trim() ? JSON.parse(data) : [];
    } catch (err) {
        console.error('Eroare la citirea orders.json : ', err);
        return [];
    }
}

const writeProductsJSONFile = (data) => {
    try {
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error('Eroare la scrierea products.json : ', err);
        return false;
    }
}

const writeOrdersJSONFile = (data) => {
    try {
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error('Eroare la scrierea orders.json : ', err);
        return false;
    }
}

module.exports = {
    readProductsJSONFile,
    writeProductsJSONFile,
    readOrdersJSONFile,
    writeOrdersJSONFile
};