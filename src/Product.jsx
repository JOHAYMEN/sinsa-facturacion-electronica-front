import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBackward } from 'react-icons/fa';
import axios from 'axios';
import UploadImage from './UploadImage'
import { useNavigate } from 'react-router-dom';

import './App.css';

const Product = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');
  const [categoryId, setCategoryId] = useState('');  // Cambiado para seleccionar una sola categoría
  const [categories, setCategories] = useState([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [redirect, setRedirect] = useState(false);

  const navigate = useNavigate();

  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/all-categories'); 
        setCategories(response.data);
      } catch (error) {
        console.error('Error al obtener las categorías:', error);
      }
    };

    fetchCategories();
  }, []);

 
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newProduct = {
      name,
      description,
      price,
      stock,
      image,
      category_id: categoryId // Asociando una única categoría al producto
    };

    if (!categoryId) {
      setErrorMessage("Por favor, selecciona una categoría para el producto.");
      setShowErrorModal(true);
      return;
    }

    try {
      const response = await axios.post('/api/new-product', newProduct);

      if (response.data.success) {
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          setShowConfirmationModal(true);
        }, 1000);
      } else {
        setErrorMessage('Error al crear el producto.');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error al crear producto:', error);
      setErrorMessage('Hubo un error al crear el producto.');
      setShowErrorModal(true);
    }
  };

  const handleModalResponse = (answer) => {
    if (answer === 'yes') {
      setShowConfirmationModal(false);
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setImage('');
      setCategoryId(''); // Limpiar selección de categoría
    } else {
      setShowConfirmationModal(false);
      navigate('/productos');
    }
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
  };
   // Función que se ejecutará cuando se complete la carga de la imagen
   const handleImageUpload = (imageUrl) => {
    setImage(imageUrl);
  };

  return (
    <div className="form-container">
      {/*<div className="form-left">
          <Link to="/home" className="iconRegresar">
            <FaBackward className="icon" /> Ir a Home
          </Link>
        <h1>Sinsa-Ecommerce</h1>
        <p>Sinsa-Ecommerce te ayuda a solucionar tus problemas de inventarios.</p>
      </div>*/}
      <div className="form-right">
        <form className="form" onSubmit={handleSubmit}>
          <h2>Crear Producto</h2>
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
            placeholder="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="form-input"
          />
          <input
            type="number"
            placeholder="Precio"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="form-input"
          />
          <input
            type="number"
            placeholder="Stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
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
          
          <div className="form-group">
            <h3>Categoría</h3>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}  // Almacena la categoría seleccionada
              required
              className="form-input"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="form-button">Crear Producto</button>
        </form>
      </div>

      {showConfirmationModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>¿Deseas crear otro producto?</p>
            <button onClick={() => handleModalResponse('yes')} className="quantity-button increment">Sí</button>
            <button onClick={() => handleModalResponse('no')} className="quantity-button decrement">No</button>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>Producto creado exitosamente</p>
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

export default Product;







