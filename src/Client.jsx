import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBackward } from 'react-icons/fa';
import axios from 'axios'; // Importa axios
import { useNavigate } from 'react-router-dom'; // Para redirigir
import './App.css'; // Usa el mismo CSS para los formularios

const Client = () => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [dni, setDni] = useState(''); 
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newClient = {name, surname, dni, address, phone, email}
    
    try {
      // Lógica para enviar datos al backend usando axios
      const response = await axios.post('/api/new-client', newClient);

      if (response.status === 200) {
        console.log('Client created:', { name, surname, dni, address, phone, email });
        setShowModal(true);
        setTimeout(() => {
          setShowModal(false);
          setShowConfirmationModal(true); // Mostrar el modal de confirmación
        }, 2000); // Ocultar el modal de éxito después de 2 segundos
      } else {
        console.log('Error al crear el cliente');
      }
    } catch (error) {
      console.error('Error al crear el cliente:', error);
    }
  };

  const handleModalResponse = (response) => {
    setShowConfirmationModal(false);
    if (response === 'yes') {
      // Limpiar los campos del formulario
      setName('');
      setSurname('');
      setDni('');
      setAddress('');
      setPhone('');
      setEmail('');
    } else {
      // Redirigir a la página principal
      navigate('/home');
    }
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
          <h2>Crear Cliente</h2>
          <input
            type="text"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="form-input"
          />
          <input
            type="text"
            placeholder="Apellido"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            required
            className="form-input"
          />
          <input
            type="text"
            placeholder="DNI"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            required
            className="form-input"
          />
          <input
            type="text"
            placeholder="Dirección"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="form-input"
          />
          <input
            type="text"
            placeholder="Teléfono"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="form-input"
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
          />
          <button type="submit" className="form-button">Crear Cliente</button>
        </form>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>Cliente creado exitosamente</p>
          </div>
        </div>
      )}

      {showConfirmationModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>¿Deseas crear otro cliente?</p>
            <button onClick={() => handleModalResponse('yes')} className="quantity-button increment">Sí</button>
            <button onClick={() => handleModalResponse('no')} className="quantity-button decrement">No</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Client;
