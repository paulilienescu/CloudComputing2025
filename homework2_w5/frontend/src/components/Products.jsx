import React, { useEffect, useState } from 'react'
import axios from 'axios'

function Products() {
    const [products, setProducts] = useState([])
    const [filter, setFilter] = useState('')

    useEffect(() => {
        axios.get('http://localhost:3000/api/products')
            .then(res => {
                console.log('Products from API:', res.data);
                setProducts(res.data.data || res.data);
            })
            .catch(err => console.error('API error:', err));
    }, []);

    return (
        <div>
            <h1>Products</h1>
            <input
                type="text"
                placeholder="Search by name"
                value={filter}
                onChange={e => setFilter(e.target.value)}
                style={{ marginBottom: '1rem' }}
            />
            <ul>
                {products
                    .filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
                    .map(product => (
                        <li key={product.id}>
                            <strong>{product.name}</strong> – {product.price} RON
                        </li>
                    ))}
            </ul>
        </div>
    )
}

export default Products