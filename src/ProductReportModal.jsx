import React from 'react';
import './ReportButtons.css';

const ProductReportModal = ({ isOpen, onClose, maxVendido, minVendido, loading, error }) => {
  if (!isOpen) return null; // Si el modal no está abierto, no mostrar nada

  return (
    <div className="modal-container">
      <div className="modal-box">
      <h2 className="product-report-title">Reporte de Productos Vendidos</h2>
        {loading && <p className="loading-text">Cargando...</p>}
        {error && <p className="error-text">{error}</p>}
        {!loading && !error && (
          <div className="report-content">
            {maxVendido && (
              <div className="max-sold-product">
                <h3 className="product-title">Producto Más Vendido</h3>
                <p className="product-info">ID: {maxVendido.product_id}</p>
                <p className="product-info">Nombre: {maxVendido.product_name}</p>
                <p className="product-info">Total Vendido: {maxVendido.total_vendido}</p>
              </div>
            )}
            {minVendido && (
              <div className="min-sold-product">
                <h3 className="product-title">Producto Menos Vendido</h3>
                <p className="product-info">ID: {minVendido.product_id}</p>
                <p className="product-info">Nombre: {minVendido.product_name}</p>
                <p className="product-info">Total Vendido: {minVendido.total_vendido}</p>
              </div>
            )}
          </div>
        )}
        <div className="button-group">
          <button onClick={onClose} className="btn-close">Cerrar</button>
        </div>

      </div>
    </div>
  );
};

export default ProductReportModal;

