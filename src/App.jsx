import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './AuthContext'; // Importa tu contexto de autenticación
import ProtectedRoute from './ProtectedRoute';
import Login from './Login';
import Header from './Header';
import Home from './Home';
import Client from './Client';
import Product from './Product';
import Category from './Category';
import Colaborador from './Colaborador';
import ProductList from './ProductList';
import UserList from './UserList';
import CategoryList from './CategoryList';
import ClientList from './ClientList';
import ClientModal from './ClientModal';
import DashboardMesas from './DashboardMesas'
import ReportButtons from './ReportButtons';
import SalesList from './SalesList';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

export function App() {
  return (
        <Router>
          <ToastContainer />
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/home" element={<ProtectedRoute element={<Home />} />} />
                <Route path="/clientes" element={<ProtectedRoute element={<ClientList />} />} />
                <Route path="/productos" element={<ProtectedRoute element={<ProductList />} />} />
                <Route path="/usuarios" element={<ProtectedRoute element={<UserList />} />} />
                <Route path="/categorias" element={<ProtectedRoute element={<CategoryList />} />} />
                <Route path="/ventas" element={<ProtectedRoute element={<SalesList />} />} />
                <Route path="/crear-cliente" element={<ProtectedRoute element={<ClientModal />} />} />
                <Route path="/reportes" element={<ProtectedRoute element={<ReportButtons />} />} />
                <Route path="/crear-colaborador" element={<ProtectedRoute element={<Colaborador />} />} />
                <Route path="/crear-producto" element={<ProtectedRoute element={<Product />} />} />
              </Routes>
        </Router>
  );
};

  

