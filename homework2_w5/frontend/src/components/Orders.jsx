import React, { useEffect, useState } from 'react'
import axios from 'axios'

function Orders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get('http://localhost:3000/api/orders')
            .then(res => {
                setOrders(res.data.data || res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching orders:', err);
                setLoading(false);
            });
    }, []);

    return (
        <div>
            <h1>Orders</h1>
            {loading ? (
                <p>Loading...</p>
            ) : orders.length === 0 ? (
                <p>No orders found</p>
            ) : (
                <ul>
                    {orders.map(order => (
                        <li key={order.id} style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '1rem' }}>
                            <strong>Order #{order.id}</strong><br />
                            <span>Customer: {order.customerName}</span><br />
                            <span>Status: {order.status}</span><br />
                            <span>Total: {order.total} RON</span><br />
                            <span>Created: {new Date(order.createdAt).toLocaleString()}</span>

                            <details style={{ marginTop: '0.5rem' }}>
                                <summary>Items</summary>
                                <ul>
                                    {order.items.map((item, idx) => (
                                        <li key={idx}>
                                            {item.productName} – {item.quantity} x {item.unitPrice} RON = {item.total} RON
                                        </li>
                                    ))}
                                </ul>
                            </details>
                        </li>
                    ))}

                </ul>
            )}
        </div>
    )
}

export default Orders