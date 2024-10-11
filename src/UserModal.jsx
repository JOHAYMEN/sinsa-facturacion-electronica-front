import React, { useState } from 'react';
import './ProductModal.css'; // Añade o actualiza el archivo de estilos


const UserModal = ({ isOpen, onClose, onSave }) => {
    
  const [user, setUser] = useState({
    username: '',
    name:'',
    lastname: '',
    email: '',
    phone: '',
    address: '',
    rol: '',
    establecimiento_id: ''
  });

  const handleChange = (field, value) => {
    setUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(user);
    setUser({
        username: '',
        name:'',
        lastname: '',
        email: '',
        phone: '',
        address: '',
        rol: '',
        establecimiento_id: ''
    });
  };

  return isOpen ? (
    <div className="modal-overlay">
      <div className="modal-content" style={{ height: '80vh' }}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h3>Agregar Nuevo Usuario</h3>
        <div className='product-info'>
        <form >
          <label>
          <input
            type="text"
            placeholder="Usuario"
            value={user.username}
            onChange={(e) => handleChange('username', e.target.value)}
            required
            className="form-input"
          />
          <span className="label-above">Usuario:</span>
          </label>
          <label >
          <input
            type="text"
            placeholder="Nombre"
            value={user.name}
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
            value={user.lastname}
            onChange={(e) => handleChange('lastname', e.target.value)}
            required
            className="form-input"
          />
          <span className="label-above">Apellido:</span>
          </label>
          <label>
          <input
            type="text"
            placeholder="Contraseña"
            value={user.password}
            onChange={(e) => handleChange('password', e.target.value)}
            required
            className="form-input"
          />
          <span className="label-above">Contraseña:</span>
          </label>
          <label>
          <input
            type="email"
            placeholder="Correo"
            value={user.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
            className="form-input"
          />
          <span className="label-above">Correo:</span>
          </label>
          <label>
         <input
            type="text"
            placeholder="Celular"
            value={user.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            required
            className="form-input"
          />
          <span className="label-above">Celular:</span>
          </label>
          <label>
          <input
            type="text"
            placeholder="Direccion"
            value={user.address}
            onChange={(e) => handleChange('address', e.target.value)}
            required
            className="form-input"
          />
          <span className="label-above">Direccion:</span>
          </label>
          <label>
            Rol:
            <select
              value={user.rol}
              onChange={(e) => handleChange('rol', e.target.value)}
            >
              <option value="">Seleccione un rol</option>
              <option value="Admin">Admin</option>
              <option value="Vendedor">Vendedor</option>
            </select>
          </label>
          <label>
         <input
            type="number"
            placeholder="Establecimiento"
            value={user.establecimiento_id}
            onChange={(e) => handleChange('establecimiento_id', e.target.value)}
            required
            className="form-input"
          />
          <span className="label-above">Establecimiento:</span>
          </label>
          <div className="actions-carrito">
            <button type="button" onClick={handleSave} className='form-button'>Crear Usuario</button>
            <button type="button" onClick={onClose} className='button-close-factura'>Cancelar</button>
          </div>
        </form>
        </div>
      </div>
    </div>
  ) : null;
};

export default UserModal;
