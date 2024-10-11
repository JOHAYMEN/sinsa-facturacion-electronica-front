import React, { useState } from 'react';
import Select from 'react-select'; // Importar react-select


const SalesByMonthModal = ({ isOpen, onClose, onFetchSales }) => {
  const [selectedMonth, setSelectedMonth] = useState(null);

  const monthsOptions = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' }
  ];

  const handleFetchSales = () => {
    if (!selectedMonth) {
      alert('Por favor, selecciona un mes.');
      return;
    }
    onFetchSales(selectedMonth); // Llamar al fetch pasando el mes seleccionado
  };

  if (!isOpen) return null;

  return (
    <div className="modal-container">
      <div className="modal-box">
        <h2>Seleccionar Mes</h2>
        <Select
          options={monthsOptions}
          value={selectedMonth}
          onChange={setSelectedMonth}
          placeholder="Selecciona un mes"
        />
        <div className="button-group">
          <button onClick={handleFetchSales} className='btn-success'>Buscar Ventas</button>
          <button onClick={onClose} className='btn-secundary'>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default SalesByMonthModal;
