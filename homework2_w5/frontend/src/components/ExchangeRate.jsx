import React, { useState } from 'react';
import axios from 'axios';

function ExchangeRate() {
  const [from, setFrom] = useState('RON');
  const [to, setTo] = useState('USD');
  const [rate, setRate] = useState(null);
  const [error, setError] = useState(null);

  const fetchRate = () => {
    axios.get(`http://localhost:3000/api/exchange?from=${from}&to=${to}`)
      .then(res => {
        setRate(res.data.rate);
        setError(null);
      })
      .catch(err => {
        setRate(null);
        setError('Exchange rate not available.');
        console.error(err);
      });
  };

  return (
    <div>
      <h1>Exchange Rate</h1>
      <input
        type="text"
        placeholder="From currency"
        value={from}
        onChange={e => setFrom(e.target.value.toUpperCase())}
      />
      <input
        type="text"
        placeholder="To currency"
        value={to}
        onChange={e => setTo(e.target.value.toUpperCase())}
      />
      <button onClick={fetchRate}>Get Rate</button>

      {rate && (
        <p style={{ marginTop: '1rem' }}>
          1 {from} = {rate} {to}
        </p>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default ExchangeRate;
