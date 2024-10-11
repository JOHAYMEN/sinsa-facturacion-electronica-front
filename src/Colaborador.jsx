import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBackward } from 'react-icons/fa';
import axios from 'axios';
import UploadImage from './UploadImage'
import { useNavigate } from 'react-router-dom';

import './App.css';

const Colaborador = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [redirect, setRedirect] = useState(false);

  const navigate = useNavigate();

 const handleSubmit = async (e) => {
    e.preventDefault();

    const newColaborador = {
      username,
      email,
      password,
      rol
    };


    try {
      const response = await axios.post('/api/new-usuarios', newColaborador);

      if (response.data.success) {
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          setShowConfirmationModal(true);
        }, 1000);
      } else {
        setErrorMessage('Error al crear el colaborador.');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error al crear colaborador:', error);
      setErrorMessage('Hubo un error al crear el colaborador.');
      setShowErrorModal(true);
    }
  };

  const handleModalResponse = (answer) => {
    if (answer === 'yes') {
      setShowConfirmationModal(false);
      setUsername('');
      setEmail('');
      setPassword('');
      setRol('');
      
    } else {
      setShowConfirmationModal(false);
      navigate('/home');
    }
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
  };
  

  return (
    <div className="form-container">
      <div className="form-left">
          <Link to="/home" className="iconRegresar">
            <FaBackward className="icon" /> Ir a Home
          </Link>
        <h1>Sinsa-Ecommerce</h1>
        <p>Sinsa-Ecommerce te ayuda a solucionar tus problemas de inventarios.</p>
      </div>
      <div className="form-right">
        <form className="form" onSubmit={handleSubmit}>
          <h2>Crear Colaborador</h2>
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="form-input"
          />
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
          />
          <input
            type="text"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
          />
                  
          <div className="form-group">
                <h3>Rol</h3>
                <select
                    value={rol}
                    onChange={(e) => setRol(e.target.value)}  // Almacena el rol seleccionado
                    required
                    className="form-input"
                >
                    <option value="">Selecciona un rol</option>
                    <option value="Admin">Admin</option>
                    <option value="Vendedor">Vendedor</option>
                </select>
            </div>


          <button type="submit" className="form-button">Crear Colaborador</button>
        </form>
      </div>

      {showConfirmationModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>¿Deseas crear otro Colaborador?</p>
            <button onClick={() => handleModalResponse('yes')} className="quantity-button increment">Sí</button>
            <button onClick={() => handleModalResponse('no')} className="quantity-button decrement">No</button>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>Colaborador creado exitosamente</p>
            <button onClick={() => setShowSuccessModal(false)} className="quantity-button decrement">Cerrar</button>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>{errorMessage}</p>
            <button onClick={handleCloseErrorModal}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Colaborador;