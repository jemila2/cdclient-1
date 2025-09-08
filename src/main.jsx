
if (typeof window.VITE_API_BASE_URL === 'undefined') {
  window.VITE_API_BASE_URL = 'https://backend-21-2fu1.onrender.com';
}
if (typeof window.API_BASE_URL === 'undefined') {
  window.API_BASE_URL = 'https://backend-21-2fu1.onrender.com';
}

// Your existing React imports
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>

);
