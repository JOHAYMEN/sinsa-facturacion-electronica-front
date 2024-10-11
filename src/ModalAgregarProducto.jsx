import React, { useState } from 'react';

const ModalAgregarProducto = ({ isOpen, onClose, onSave }) => {
  const [productoData, setProductoData] = useState({ nombre: '', precio: '', cantidad: '' });

  const handleSave = () => {
    if (productoData.nombre && productoData.precio && productoData.cantidad) {
      onSave({ ...productoData, precio: parseFloat(productoData.precio), cantidad: parseInt(productoData.cantidad) }); // Guardar el nuevo producto
      setProductoData({ nombre: '', precio: '', cantidad: '' }); // Resetear los campos del formulario
      onClose(); // Cerrar el modal
    } else {
      alert('Por favor, completa todos los campos.'); // Alertar si faltan campos
    }
  };

  return (
    isOpen ? (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-4 rounded">
          <h2 className="text-xl mb-4">Agregar Producto</h2>
          <input
            type="text"
            placeholder="Nombre del Producto"
            value={productoData.nombre}
            onChange={(e) => setProductoData({ ...productoData, nombre: e.target.value })}
            className="border p-2 mb-2 w-full"
          />
          <input
            type="number"
            placeholder="Precio"
            value={productoData.precio}
            onChange={(e) => setProductoData({ ...productoData, precio: e.target.value })}
            className="border p-2 mb-2 w-full"
          />
          <input
            type="number"
            placeholder="Cantidad"
            value={productoData.cantidad}
            onChange={(e) => setProductoData({ ...productoData, cantidad: e.target.value })}
            className="border p-2 mb-2 w-full"
          />
          <button onClick={handleSave} className="bg-blue-500 text-white p-2 rounded">Agregar</button>
          <button onClick={onClose} className="bg-red-500 text-white p-2 rounded ml-2">Cancelar</button>
        </div>
      </div>
    ) : null
  );
};

export default ModalAgregarProducto;
