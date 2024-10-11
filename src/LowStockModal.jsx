// LowStockModal.jsx
import React, { useState } from 'react';
import './LowStockModal.css'; // Importa el archivo CSS

const LowStockModal = ({ products, onClose }) => {
    const filteredProducts = products.filter((product) => product.id >= 0 && product.stock < 10);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Productos con stock bajo</h2>
                <table>
                    <thead>
                        <tr>
                            <th className="table-cell-id">ID</th>
                            <th className="table-cell-product">Producto</th>
                            <th className="table-cell-stock">Stock</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentProducts.length > 0 ? (
                            currentProducts.map((product) => (
                                <tr key={product.id}>
                                    <td className="table-cell-id">{product.id}</td>
                                    <td className="table-cell-product">{product.name}</td>
                                    <td className="table-cell-stock">{product.stock}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} style={{ textAlign: 'center' }}>
                                    No hay productos con stock bajo
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="pagination">
                    <button onClick={handlePrevPage} disabled={currentPage === 1} className="pagination-button">
                        Anterior
                    </button>
                    <button onClick={handleNextPage} disabled={currentPage === totalPages} className="pagination-button">
                        Siguiente
                    </button>
                </div>
                <button onClick={onClose} className="close-button">Cerrar</button>
            </div>
        </div>
    );
};

export default LowStockModal;




