import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthProvider } from './AuthContext'
import { toast } from 'react-toastify';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false); // Estado para manejar éxito

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await axios.post('/api/login', {
        username: username,
        password: password
      }, {
        withCredentials: true
      });
      // Guardar estado de autenticación en localStorage
      localStorage.setItem('isAuthenticated', 'true');
      toast.success('Inicio de sesión exitoso');
      setTimeout(() => {
      setShowModal(false);
      navigate('/home', { state: { showLowStockModal: true } });        
      }, 2000);
    } catch (err) {
      toast.error('Credenciales incorrectas o Inhabilitado');
      setTimeout(() => {
        setShowModal(false);
      }, 2000);
    }
  };

  return (
    <div className="login-container">
      <div className="left-section">
        <h1>Sinsa-Ecommerce</h1>
        <p>Sinsa-Ecommerce te ayuda a solucionar tus problemas de inventarios.</p>
      </div>
      <div className="right-section">
        <form className="login-form" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="login-input"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
          />
          <button type="submit" className="login-button">Iniciar Sesión</button>
          <a href="/" className="forgot-password">¿Olvidaste tu contraseña?</a>
        </form>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>{isSuccess ? 'Inicio de sesión exitoso' : errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;




