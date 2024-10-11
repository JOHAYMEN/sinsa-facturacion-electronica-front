import React, { useState } from 'react';
import './ProductModal.css'; // Añade o actualiza el archivo de estilos


const CategoryModal = ({ isOpen, onClose, onSave }) => {
    
  const [category, setCategory] = useState({
    name:'',
    description: ''
  });

  const handleChange = (field, value) => {
    setCategory((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(category);
    setCategory({
        name:'',
        description: ''
    });
  };

  return isOpen ? (
    <div className="modal-overlay">
      <div className="modal-content" style={{ height: '80vh' }}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Agregar Nueva Categoria</h2>
        <div className='product-info'>
        <form>    
          <label>      
          <input
            type="text"
            placeholder="Nombre"
            value={category.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            className="form-input"
          />
          <span className="label-above">Nombre:</span>
          </label>
          <label>
          <input
            type="text"
            placeholder="Descripcion"
            value={category.description}
            onChange={(e) => handleChange('description', e.target.value)}
            required
            className="form-input"
          />
          <span className="label-above">Descripcion:</span>
          </label>          
          <div className="actions-carrito">
            <button type="button" onClick={handleSave} className='form-button'>Crear Categoria</button>
            <button type="button" onClick={onClose} className='button-close-factura'>Cancelar</button>
          </div>
        </form>
        </div>
      </div>
    </div>
  ) : null;
};

export default CategoryModal;
