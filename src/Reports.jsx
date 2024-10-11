import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const Reports = () => {
    const [ventas, setVentas] = useState([]);
    const [filtro, setFiltro] = useState('dia'); // Por defecto, buscar por día
    const [fecha, setFecha] = useState('');

    const buscarVentas = async () => {
        try {
            let url = `/api/reportes/ventas?filtro=${filtro}`;
    
            // Solo agregar la fecha a la URL si se ha seleccionado una fecha válida
            if (fecha) {
                url += `&fecha=${fecha}`;
            }
    
            const response = await axios.get(url);
            console.log('Datos de respuesta:', response.data);
            setVentas(response.data);
        } catch (error) {
            console.error('Error al buscar ventas:', error);
        }
    };
    

    const descargarPDF = () => {
        const doc = new jsPDF();
        doc.autoTable({ html: '#ventas-table' });
        doc.save('ventas.pdf');
    };

    const descargarExcel = () => {
        const ws = XLSX.utils.json_to_sheet(ventas);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Ventas');
        XLSX.writeFile(wb, 'ventas.xlsx');
    };

    const descargarWord = () => {
        const blob = new Blob([JSON.stringify(ventas)], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        saveAs(blob, 'ventas.docx');
    };
    useEffect(() => {
        buscarVentas();
    }, [filtro, fecha]);

    return (
        <div>
            <h1>Reportes de Ventas</h1>
            <div>
                <label>Filtro:</label>
                <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
                    <option value="dia">Día</option>
                    <option value="semana">Semana</option>
                    <option value="mes">Mes</option>
                </select>
                <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                />
                <button onClick={buscarVentas}>Buscar</button>
            </div>
            <table id="ventas-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Fecha</th>
                        <th>Total</th>
                        <th>Usuario</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(ventas) && ventas.length > 0 ? ventas.map((venta, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{new Date(venta.sale_date).toLocaleString()}</td>
                            <td>{venta.total_products}</td>
                            <td>{venta.usuario_id}</td>
                        </tr>
                    )) : (
                        <tr><td colSpan="4">No se encontraron ventas.</td></tr>
                    )}
                </tbody>
            </table>
            <button onClick={descargarPDF}>Descargar PDF</button>
            <button onClick={descargarExcel}>Descargar Excel</button>
            <button onClick={descargarWord}>Descargar Word</button>
        </div>
    );
};

export default Reports;
