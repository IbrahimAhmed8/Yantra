import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/editor/legacy/App';
import '@/editor/legacy/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
