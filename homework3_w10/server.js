const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Catalog App running on Azure');
})

app.listen(PORT, () => {
    console.log('Server is running on http://localhost:' + PORT);
})