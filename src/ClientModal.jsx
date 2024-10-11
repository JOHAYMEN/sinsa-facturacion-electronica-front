import React, { useState } from 'react';
import './ProductModal.css'; // Añade o actualiza el archivo de estilos


const ClientModal = ({ isOpen, onClose, onSave }) => {
    
  const [client, setClient] = useState({
    name: '',
    surname:'',
    dni: '',
    address: '',
    phone: '',
    email: ''
  });

  const handleChange = (field, value) => {
    setClient((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(client);
    setClient({
        name: '',
        surname:'',
        dni: '',
        address: '',
        phone: '',
        email: ''
    });
  };

  return isOpen ? (
    <div className="modal-overlay">
      <div className="modal-content" style={{ height: '80vh' }}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Agregar Nuevo Cliente</h2>
        <div className='product-info'>
        <form>
          <label>
          <input
            type="text"
            placeholder="Nombre"
            value={client.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            className="form-input"
          />
          <span className="label-above">Nombre:</span>
          </label>
          <label>
          <input
            type="text"
            placeholder="Apellido"
            value={client.surname}
            onChange={(e) => handleChange('surname', e.target.value)}
            required
            className="form-input"
          />
          <span className="label-above">Apellido:</span>
          </label>
          <label>
          <input
            type="text"
            placeholder="Cedula"
            value={client.dni}
            onChange={(e) => handleChange('dni', e.target.value)}
            required
            className="form-input"
          />
          <span className="label-above">Cedula:</span>
          </label>
          <label>
          <input
            type="text"
            placeholder="Direccion"
            value={client.address}
            onChange={(e) => handleChange('address', e.target.value)}
            required
            className="form-input"
          />
          <span className="label-above">Direccion:</span>
          </label>
          <label>
          <input
            type="text"
            placeholder="Celular"
            value={client.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            required
            className="form-input"
          />
          <span className="label-above">Celular:</span>
          </label>
          <label>
          <input
            type="text"
            placeholder="Correo"
            value={client.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
            className="form-input"
          />
          <span className="label-above">Correo:</span>
          </label>
          <div className="actions-carrito">
            <button type="button" onClick={handleSave} className='form-button'>Crear Cliente</button>
            <button type="button" onClick={onClose} className='button-close-factura'>Cancelar</button>
          </div>
        </form>
        </div>
      </div>
    </div>
  ) : null;
};

export default ClientModal;
