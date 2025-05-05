import React, { useState } from 'react';
import axios from 'axios';

function Weather() {
  const [city, setCity] = useState('Iasi');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  const fetchWeather = () => {
    axios.get(`http://localhost:3000/api/weather?city=${city}`)
      .then(res => {
        setWeather(res.data);
        setError(null);
      })
      .catch(err => {
        setWeather(null);
        setError('Weather data not available.');
        console.error(err);
      });
  };

  return (
    <div>
      <h1>Weather</h1>
      <input
        type="text"
        placeholder="Enter city"
        value={city}
        onChange={e => setCity(e.target.value)}
      />
      <button onClick={fetchWeather}>Get Weather</button>

      {weather && (
        <div style={{ marginTop: '1rem' }}>
          <h3>{weather.city}</h3>
          <p>{weather.temperature}°C – {weather.description}</p>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default Weather;
