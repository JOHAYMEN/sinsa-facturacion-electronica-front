import React, { useState } from 'react';

const ModalNuevaMesa = ({ isOpen, onClose, onSave }) => {
  const [mesaData, setMesaData] = useState({ numero: '', capacidad: '' });

  const handleSave = () => {
    if (mesaData.numero && mesaData.capacidad) {
      onSave(mesaData); // Guardar la nueva mesa
      setMesaData({ numero: '', capacidad: '' }); // Resetear los campos del formulario
      onClose(); // Cerrar el modal
    } else {
      alert('Por favor, completa todos los campos.'); // Alertar si faltan campos
    }
  };

  return (
    isOpen ? (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-4 rounded">
          <h2 className="text-xl mb-4">Agregar Nueva Mesa</h2>
          <input
            type="text"
            placeholder="Número de Mesa"
            value={mesaData.numero}
            onChange={(e) => setMesaData({ ...mesaData, numero: e.target.value })}
            className="border p-2 mb-2 w-full"
          />
          <input
            type="number"
            placeholder="Capacidad"
            value={mesaData.capacidad}
            onChange={(e) => setMesaData({ ...mesaData, capacidad: e.target.value })}
            className="border p-2 mb-2 w-full"
          />
          <button onClick={handleSave} className="bg-blue-500 text-white p-2 rounded">Guardar</button>
          <button onClick={onClose} className="bg-red-500 text-white p-2 rounded ml-2">Cancelar</button>
        </div>
      </div>
    ) : null
  );
};

export default ModalNuevaMesa;
