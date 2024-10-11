import React, { useState } from 'react';
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';

const SalesByDayModal = ({ isOpen, onClose, onFetchSales }) => {
    const [selectedDate, setSelectedDate] = useState(null);

    const handleConsult = () => {
        if (selectedDate) {
            const formattedDate = moment(selectedDate).format('YYYY-MM-DDTHH:mm:ss'); // Ajusta el formato si es necesario
            onFetchSales(formattedDate); // Llama a la función para obtener las ventas
            onClose(); // Cierra el modal después de consultar
        }
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onClose} ariaHideApp={false}>
            <h2>Selecciona una fecha</h2>
            <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="yyyy/MM/dd"
            />
            <div>
                <button onClick={handleConsult}>Consultar</button>
                <button onClick={onClose}>Cancelar</button>
            </div>
        </Modal>
    );
};

export default SalesByDayModal;
