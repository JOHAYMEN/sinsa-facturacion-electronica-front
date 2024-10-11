import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBackward } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // Asegúrate de usar react-router-dom v6+
import UploadImage from './UploadImage'
import axios from 'axios'; // Asegúrate de tener axios instalado
import './App.css'; // Usa el mismo CSS para los formularios

const Category = () => {
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate(); // Hook para redirección

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newCategory = { name, image };
    
    try {
      // Lógica para enviar datos (ajusta la URL a tu endpoint real)
      await axios.post('/api/new-category', newCategory);
      console.log('Category created:', newCategory);

      // Mostrar el modal de éxito
      setShowModal(true);
      setShowConfirmation(true);
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleModalResponse = (response) => {
    if (response === 'yes') {
      // Limpiar los campos y mantener el usuario en el formulario
      setName('');
      setShowModal(false);
      setShowConfirmation(false);
    } else {
      // Redirigir a la página principal
      navigate('/home'); // Ajusta la ruta a tu página principal
    }
  };
  const handleImageUpload = (imageUrl) => {
    setImage(imageUrl);
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
          <h2>Crear Categoría</h2>
          <input
            type="text"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="form-input"
          />
            <UploadImage onUpload={handleImageUpload} />

            <input
            type="text"
            placeholder="URL Image"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            required
            className="form-input"
            />
          <button type="submit" className="form-button">Crear Categoría</button>
        </form>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>Desea crear otra categoria?</p>
            {showConfirmation && (
              <div className="confirmation-buttons">
                <button onClick={() => handleModalResponse('yes')} className="quantity-button increment">Sí</button>
                <button onClick={() => handleModalResponse('no')} className="quantity-button decrement">No</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;


