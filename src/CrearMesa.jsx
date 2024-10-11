import React, { useState } from 'react';
import axios from 'axios';

const CrearMesa = ({ onMesaCreada }) => {
  const [numero_mesa, setNumero_mesa] = useState('');
  const [estado, setEstado] = useState('libre'); // Por defecto disponible
  const [capacidad, setCapacidad] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleCrearMesa = async () => {
    if (!numero_mesa) {
      setMensaje('Por favor, ingresa un número de mesa.');
      return;
    }

    try {
      const nuevaMesa = { numero_mesa, estado, capacidad };
      const response = await axios.post('/api/new-mesa', nuevaMesa);

      // Limpia los campos y muestra un mensaje
      setNumero_mesa('');
      setEstado('libre');
      setCapacidad('');
      setMensaje('Mesa creada exitosamente.');

      // Llama a la función para refrescar las mesas en el componente principal
      if (onMesaCreada) {
        onMesaCreada(response.data);
      }
    } catch (error) {
      setMensaje('Error al crear la mesa. Inténtalo nuevamente.');
      console.error(error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Crear Nueva Mesa</h2>

      <input
        type="number"
        value={numero_mesa}
        onChange={(e) => setNumero_mesa(e.target.value)}
        placeholder="Número de la mesa"
        className="border p-2 mb-2"
      />
      <input
        type="number"
        value={capacidad}
        onChange={(e) => setCapacidad(e.target.value)}
        placeholder="Capacidad de la mesa"
        className="border p-2 mb-2"
      />
      <select
        value={estado}
        onChange={(e) => setEstado(e.target.value)}
        className="border p-2 mb-2"
      >
        <option value="libre">Libre</option>
        <option value="ocupada">Ocupada</option>
        <option value="reservada">Reservada</option>
      </select>

      <button
        onClick={handleCrearMesa}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Agregar Mesa
      </button>

      {mensaje && <p className="mt-2">{mensaje}</p>}
    </div>
  );
};

export default CrearMesa;
