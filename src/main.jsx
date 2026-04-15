import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// FIXED: removed TypeScript-only ! non-null assertion — this is a .jsx file,
// not .tsx, so TS syntax is not allowed here.
const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('No #root element found in index.html');

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)