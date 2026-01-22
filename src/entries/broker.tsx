
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrokerApp } from '../apps/BrokerApp';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrokerApp />
  </React.StrictMode>
);
