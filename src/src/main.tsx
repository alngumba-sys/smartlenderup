import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Changed from ../App to ./App
import './index.css';

// Force light mode - remove any dark mode preferences on app load
localStorage.removeItem('bvfunguo-theme-mode');
document.documentElement.classList.remove('dark');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);