import React from 'react';
import ReactDOM from 'react-dom';
import './assets/css/main.css';
import App from './App';

const rootElement = document.getElementById('root');
document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    rootElement
  );
});
