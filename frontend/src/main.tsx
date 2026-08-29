import React from 'react';
import ReactDOM from 'react-dom/client';
import AppView from './AppView';
import './index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AppView />
    </React.StrictMode>
  );
}
