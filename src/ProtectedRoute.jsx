import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element }) => {
  console.log(element);
  // Verifica si el usuario está autenticado consultando localStorage
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  // Si no hay autenticación, redirige al login
  return isAuthenticated ? element : <Navigate to="/" />;
};

export default ProtectedRoute;



