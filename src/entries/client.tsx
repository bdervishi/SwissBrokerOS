
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClientApp } from '../apps/ClientApp';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ClientApp />
  </React.StrictMode>
);
