import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarDay, FaCalendarWeek, FaCalendarAlt, FaChartLine, FaBackward } from 'react-icons/fa'; // Iconos de react-icons
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './ReportButtons.css'; // Asegúrate de tener este archivo para los estilos
import axios from 'axios'; // Para hacer peticiones HTTP
import SalesByMonthModal from './SalesByMonthModal';
import * as XLSX from 'xlsx'; // Para generar archivos Excel
import { saveAs } from 'file-saver'; // Para guardar archivos
import ProductReportModal from './ProductReportModal'; // Importar el nuevo modal para los productos vendidos
import { toast } from 'react-toastify';

const ReportButtons = () => {
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal de ventas por día
  const [selectedDate, setSelectedDate] = useState(new Date()); // Fecha seleccionada para ventas por día
  const [isMonthModalOpen, setIsMonthModalOpen] = useState(false); // Modal de ventas por mes
  const [isDateRangeModalOpen, setIsDateRangeModalOpen] = useState(false); // Modal para rango de fechas
  const [isProductReportModalOpen, setIsProductReportModalOpen] = useState(false); // Modal para reporte de productos vendidos
  const [startDate, setStartDate] = useState(null); // Fecha de inicio para el reporte de productos
  const [endDate, setEndDate] = useState(null); // Fecha de fin para el reporte de productos
  const [maxVendido, setMaxVendido] = useState(null); // Producto más vendido
  const [minVendido, setMinVendido] = useState(null); // Producto menos vendido
  const [loading, setLoading] = useState(false); // Estado de carga
  const [error, setError] = useState(null); // Estado de errores
  const [showModal, setShowModal] = useState(false);
  const [startDateSale, setStartDateSale] = useState('');
  const [endDateSale, setEndDateSale] = useState('');

  const handleDownloadLowStockReport = async () => {
    try {
        const response = await axios.get('/api/low-stock-products'); // Endpoint que trae productos con bajo stock
        console.log('Respuesta del servidor:', response.data);

        // Verifica que la respuesta contenga productos
        if (!response.data || response.data.length === 0) {
            throw new Error('No hay productos con bajo stock.');
        }

        // Formatear datos de los productos con bajo stock
        const lowStockProducts = response.data.map(product => ({
            id: product.id,
            name: product.name,
            stock: product.stock,
        }));

        // Generar archivo Excel
        const worksheet = XLSX.utils.json_to_sheet(lowStockProducts);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'ProductosBajoStock');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

        // Descarga del archivo Excel
        saveAs(blob, `productos_bajo_stock_${new Date().toLocaleDateString()}.xlsx`);

        // Opcional: Cerrar modal u otras acciones
        setIsModalOpen(false); 
    } catch (error) {
        console.error('Error al descargar el reporte de productos con bajo stock:', error);
        setError('Hubo un error al generar el reporte de productos con bajo stock.');
    }
};

   // Función para abrir el modal
  const openModal = () => setShowModal(true);

  // Función para cerrar el modal
  const closeModal = () => {
    setShowModal(false);
    setError('');
  };

  // Función para manejar la descarga del reporte
  const handleDownloadReport = async () => {
    if (!startDateSale || !endDateSale) {
        toast.error('Por favor, selecciona ambas fechas.');
        return;
    }

    try {
        const response = await axios.get('/api/reportes/ventas/rango', {
            params: { startDate: startDateSale, endDate: endDateSale }
        });
        console.log('Respuesta del servidor:', response.data);
        // Verifica que la respuesta contenga la información necesaria
        const totalValue = parseFloat(response.data.total); // Asegúrate de que sea un número
        if (isNaN(totalValue)) {
            throw new Error('El total no es un número válido.');
        }

        const salesData = [{
            startDate: response.data.startDate,
            endDate: response.data.endDate,
            total: totalValue
        }];

        // Generar archivo Excel
        const worksheet = XLSX.utils.json_to_sheet(salesData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventas');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(blob, `reporte_ventas_${startDateSale}_${endDateSale}.xlsx`); // Nombre del archivo

        setIsModalOpen(false); // Cerrar el modal
    } catch (error) {
        console.error('Error al descargar el reporte:', error);
        toast.error('Hubo un error al generar el reporte.');
    }
};

  // Función para obtener las ventas por día
  const fetchSalesByDate = async () => {
    try {
      const formattedDate = selectedDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      const response = await axios.get(`/api/reportes/ventas/dia?filtro=dia&fecha=${formattedDate}`);
      const salesData = response.data;
  
      if (!salesData || salesData.ventas.length === 0) {
        toast.info('No se encontraron ventas para la fecha seleccionada.');
        return;
      }
  
      // Preparar datos para exportar a Excel
      const ventas = salesData.ventas;
  
      // Agregar una fila con el total de ventas y ganancias
      const totalData = [
        { sale_date: 'Total', valor_total_compra: salesData.total_ventas, ganancia_venta: salesData.total_ganancias, descuento:salesData.descuento_en_ventas, desc_en_porcentaje: salesData.descuento_en_porcentaje }
      ];
  
      // Combinar las ventas con la fila de totales
      const dataToExport = [...ventas, ...totalData];
  
      // Generar archivo Excel
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventas');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, `ventas_${formattedDate}.xlsx`);
  
      setIsModalOpen(false); // Cerrar el modal
    } catch (error) {
      console.error('Error al obtener las ventas:', error);
      toast.info('No se encontraron ventas para la fecha seleccionada.');
    }
  };
  

  // Función para obtener las ventas por mes
  const fetchSalesByMonth = async (selectedMonth) => {
    try {
      const currentYear = new Date().getFullYear();
      const formattedMonth = `${currentYear}-${selectedMonth.value}-01`;
  
      const response = await axios.get(`/api/reportes/ventas/mes?filtro=mes&fecha=${formattedMonth}`);
      const salesData = response.data;
      console.log(salesData);
  
      if (!salesData || Object.keys(salesData).length === 0) {
        toast.info('No se encontraron ventas para el mes seleccionado.');
        return;
      }
  
      // Convertir el objeto en un array de un solo objeto
      const salesArray = [salesData];
  
      // Generar archivo Excel
      const worksheet = XLSX.utils.json_to_sheet(salesArray);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventas');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, `ventas_mes_${selectedMonth.label}_${currentYear}.xlsx`);
  
      setIsMonthModalOpen(false); // Cerrar el modal
    } catch (error) {
      console.error('Error al obtener ventas por mes:', error);
      toast.info('No se encontraron ventas para el mes seleccionado.');
    }
  };
  

  // Función para obtener el reporte de productos más y menos vendidos
  const fetchProductReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/reportes/ventas/productos', {
        params: { startDate, endDate }
      });
      const { maxVendido, minVendido } = response.data;
      setMaxVendido(maxVendido);
      setMinVendido(minVendido);
      setLoading(false);
      setIsProductReportModalOpen(true); // Mostrar modal de productos vendidos
    } catch (err) {
      toast.error('Error al obtener los datos de productos.');
      setLoading(false);
    }
  };

  return (
    <div className="button-container">
        <div>
            <Link to="/home" className="iconRegresarProducts">
                <FaBackward className="icon" /> Ir a Home
            </Link>
        </div>
      <button className="report-button" onClick={() => setIsModalOpen(true)}>
        <FaCalendarDay className="icon" />
        Ventas por día
      </button>
      <button className="report-button" onClick={openModal}>
        <FaCalendarWeek className="icon" />
        Ventas por semana
      </button>
      <button className="report-button" onClick={() => setIsMonthModalOpen(true)}>
        <FaCalendarAlt className="icon" />
        Ventas por mes
      </button>
      <button className="report-button" onClick={() => setIsDateRangeModalOpen(true)}>
        <FaChartLine className="icon" />
        Productos más y menos vendidos por semana
      </button>
      <button className="report-button" onClick={handleDownloadLowStockReport}>
        <FaChartLine className="icon" />
        Productos con baja existencia
      </button>
      
      {/* Modal para seleccionar fecha de ventas por día */}
      {isModalOpen && (
  <div className="modal-container">
    <div className="modal-box">
      <h2>Selecciona una fecha</h2>
      <DatePicker
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        dateFormat="yyyy/MM/dd"
        className="input-field"
      />
      <div className="button-group">
        <button onClick={fetchSalesByDate} className="btn-primary">Consultar</button>
        <button onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
      </div>
    </div>
  </div>
)}

{/* Modal de ventas por mes */}
<SalesByMonthModal
  isOpen={isMonthModalOpen}
  onClose={() => setIsMonthModalOpen(false)}
  onFetchSales={fetchSalesByMonth}
/>

{/* Modal para seleccionar el rango de fechas */}
{isDateRangeModalOpen && (
  <div className="modal-container">
    <div className="modal-box">
      <h2>Selecciona un rango de fechas para el reporte de productos</h2>
      <DatePicker
        selected={startDate}
        onChange={(date) => setStartDate(date)}
        dateFormat="yyyy/MM/dd"
        className="input-field"
        placeholderText="Fecha de inicio"
      />
      <DatePicker
        selected={endDate}
        onChange={(date) => setEndDate(date)}
        dateFormat="yyyy/MM/dd"
        className="input-field"
        placeholderText="Fecha de fin"
      />
      <div className="button-group">
        <button onClick={fetchProductReport} className="btn-primary">Generar Reporte</button>
        <button onClick={() => setIsDateRangeModalOpen(false)} className="btn-secondary">Cancelar</button>
      </div>
    </div>
  </div>
)}

{/* Modal para mostrar los productos más y menos vendidos */}
<ProductReportModal
  isOpen={isProductReportModalOpen}
  onClose={() => setIsProductReportModalOpen(false)}
  maxVendido={maxVendido}
  minVendido={minVendido}
  loading={loading}
  error={error}
/>

{/* Modal para seleccionar las fechas y descargar el reporte */}
{showModal && (
  <div className="modal-container">
    <div className="modal-box">
      <span className="modal-close" onClick={closeModal}>
        &times;
      </span>
      <h2>Selecciona las fechas para el reporte</h2>
      <DatePicker
        selected={startDateSale}
        onChange={(date) => setStartDateSale(date)}
        dateFormat="yyyy/MM/dd"
        className="input-field"
        placeholderText="Fecha de inicio"
      />
      <DatePicker
        selected={endDateSale}
        onChange={(date) => setEndDateSale(date)}
        dateFormat="yyyy/MM/dd"
        className="input-field"
        placeholderText="Fecha de fin"
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
        <div className='button-group'>
          <button onClick={handleDownloadReport} className="btn-success">Descargar Reporte</button>
          <button onClick={closeModal} className="btn-secondary">Cancelar</button>
        </div>
    </div>
  </div>
)}

    </div>
  );
};

export default ReportButtons;




