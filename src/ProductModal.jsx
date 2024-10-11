import React, { useState } from 'react';
import UploadImage from './UploadImage'; // Asegúrate de que el path es correcto
import './ProductModal.css'; // Añade o actualiza el archivo de estilos


const ProductModal = ({ isOpen, onClose, onSave, categories }) => {
    
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    image: '',
    favorito: '0',
    price_initial:''
  });

  const handleChange = (field, value) => {
    setProduct((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(product);
    setProduct({
      name: '',
      description: '',
      price: '',
      stock: '',
      category_id: '',
      image: '',
      favorito: '0',
      price_initial:''
    });
  };

  return isOpen ? (
    <div className="modal-overlay">
      <div className="modal-content" style={{ height: '80vh' }}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Agregar Nuevo Producto</h2>
        <div className='product-info'>
        <form>
          <label>
          <input
            type="text"
            placeholder="Nombre"
            value={product.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            className="form-input"
          />
          <span className="label-above">Nombre:</span>
          </label>
          <label>
          <input
            type="text"
            placeholder="Descripción"
            value={product.description}
            onChange={(e) => handleChange('description', e.target.value)}
            required
            className="form-input"
          />
          <span className="label-above">Descripcion:</span>
          </label>
          <label>
          <input
            type="number"
            placeholder="Precio Inicial"
            value={product.price_initial}
            onChange={(e) => handleChange('price_initial', e.target.value)}
            required
            className="form-input"
          />
          <span className="label-above">Precio Costo:</span>
          </label>
          <label>
          <input
            type="number"
            placeholder="Precio Final"
            value={product.price}
            onChange={(e) => handleChange('price', e.target.value)}
            required
            className="form-input"
          />
          <span className="label-above">Precio Venta:</span>
          </label>
          <label>
          <input
            type="number"
            placeholder="Stock"
            value={product.stock}
            onChange={(e) => handleChange('stock', e.target.value)}
            required
            className="form-input"
          />
          <span className="label-above">Cantidad:</span>
          </label>
          {/* Componente para subir imágenes */}
          <UploadImage onUpload={(imageUrl) => handleChange('image', imageUrl)} />
          <label>
          <input
            type="text"
            placeholder="URL Image"
            value={product.image}
            onChange={(e) => handleChange('image', e.target.value)}
            required
            className="form-input"
          />
          <span className="label-above">Url Imagen:</span>
          </label>
          <div className="form-group">
                <select
                    value={product.category_id}
                    onChange={(e) => handleChange('category_id', e.target.value)}
                    required
                    className="form-input"
                    >
                    <option value="">Selecciona una categoría</option>
                    {categories && categories.length > 0 ? (
                        categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                            ))
                            ) : (
                        <option value="">No hay categorías disponibles</option>
                    )}
                </select>
          </div>
          <label>
            Favorito:
            <select
              value={product.favorito}
              onChange={(e) => handleChange('favorito', e.target.value)}
            >
              <option value="1">Sí</option>
              <option value="0">No</option>
            </select>
          </label>

          <div className="actions-carrito">
            <button type="button" onClick={handleSave} className='form-button'>Crear Producto</button>
            <button type="button" onClick={onClose}className='button-close-factura'>Cancelar</button>
          </div>
        </form>
        </div>
      </div>
    </div>
  ) : null;
};

export default ProductModal;
