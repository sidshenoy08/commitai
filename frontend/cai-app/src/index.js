import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app.js';

import 'bootstrap/dist/css/bootstrap.min.css';

// 1. PrimeReact core styles
import 'primereact/resources/primereact.min.css';

// 2. Theme of your choice (e.g., Lara Light Indigo)
import 'primereact/resources/themes/lara-light-indigo/theme.css';

// 3. PrimeIcons (required for icons in buttons, etc.)
import 'primeicons/primeicons.css';

import "react-chat-elements/dist/main.css"

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
