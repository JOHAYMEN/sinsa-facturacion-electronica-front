// NotificationContext.jsx (modificado para manejar el modal)
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import LowStockModal from './LowStockModal';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Obtener productos con bajo stock
    const fetchLowStockProducts = async () => {
        try {
            const response = await axios.get('/api/all-products'); // Endpoint para obtener productos
            const products = response.data;
            const lowStock = products.filter(product => product.stock < 10);
            setLowStockProducts(lowStock);

            if (lowStock.length > 0) {
                setIsModalOpen(true); // Mostrar modal si hay productos con bajo stock
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    // Al montar el componente, verificar stock bajo
    useEffect(() => {
        fetchLowStockProducts(); // Llamar al servidor al iniciar la sesión
    }, []);

    return (
        <NotificationContext.Provider value={{}}>
            {children}
            {isModalOpen && (
                <LowStockModal 
                    products={lowStockProducts} 
                    onClose={() => setIsModalOpen(false)} 
                />
            )}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
