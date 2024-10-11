import React from 'react';
import ReactDOM from 'react-dom/client';
import Modal from 'react-modal';
import { App } from './App';
import './App.css'; // Si tienes un archivo CSS global
Modal.setAppElement('#root'); // '#root' es el ID de tu elemento raíz en index.html

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
 
  <App />
  
);


