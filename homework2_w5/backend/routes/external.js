const express = require('express');
const axios = require('axios');
const router = express.Router();

const OPENWEATHER_API_KEY = 'b0ea6e7e40333a67b71ad951691be8b1';
const EXCHANGE_API_KEY = 'ba407135dbbddf7356c82b93';

// localhost:3000/api/weather?city=iasi
router.get('/weather', async (req, res) => {
    const city = req.query.city || 'Iasi,ro';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric`;

    try {
        const response = await axios.get(url);
        res.status(200).json({
            city: response.data.name,
            temperature: response.data.main.temp,
            description: response.data.weather[0].description
        });
    } catch(err) {
        console.error('Weather API error: ', err.message);
        res.status(500).json({ error: 'Nu s-au putut prelua datele despre vreme din orasul '.concat(city)})
    }
});

// localhost:3000/api/exchange?from=RON&to=USD
router.get('/exchange', async (req, res) => {
    const fromCurrency = req.query.from || 'RON';
    const toCurrency = req.query.to || 'USD';
    const url = `https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/latest/${fromCurrency}`;

    try {
        const response = await axios.get(url);
        const rate = response.data.conversion_rates[toCurrency];
        
        if(!rate) {
            return res.status(400).json({ error: 'Nu s-a putut converti valuta '.concat(fromCurrency).concat(' in ').concat(toCurrency)});
        }

        res.status(200).json({
            from: fromCurrency,
            to: toCurrency,
            rate: rate
        });
    } catch(err) {
        console.error('Exchange API error: ', err.message);
        res.status(500).json({ error: 'Nu s-au putut prelua datele despre cursul valutar pentru '.concat(fromCurrency)});
    }
});

module.exports = router;