import { Routes, Route, Link } from 'react-router-dom';

import Products from './components/Products';
import Orders from './components/Orders';
import Weather from './components/Weather';
import ExchangeRate from './components/ExchangeRate';

import './App.css';

function App() {
  return (
    <div>
      <header>
        <nav>
          <Link to="/products">Products</Link>
          <Link to="/orders">Orders</Link>
          <Link to="/weather">Weather</Link>
          <Link to="/exchange">Exchange Rate</Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/products" element={<Products />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/exchange" element={<ExchangeRate />} />
        </Routes>
      </main>
    </div>
  )
}

export default App;