import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './ProductCard.css';
import { FaStar } from 'react-icons/fa'; 

const ProductCard = ({ id, name, description, price, stock, image, favorito, price_initial, descuento, onAddToCart }) => {
    const [quantity, setQuantity] = useState(1);
    const [customPrice, setCustomPrice] = useState(price);
    const [isEditingPrice, setIsEditingPrice] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    const formattedPrice = Math.floor(parseFloat(price.replace('$', '').replace(',', '')));
    const formattedPrice1 = Math.floor(parseFloat(price_initial.replace('$', '').replace(',', '')));

    useEffect(() => {
        setCustomPrice(price);
    }, [price]);

    useEffect(() => {
        // Obtener el estado inicial de favorito
        const fetchFavoriteStatus = async () => {
            try {
                const response = await axios.get(`/api/products/${id}/favorite`);
                setIsFavorite(response.data.isFavorite);
            } catch (error) {
                console.error('Error fetching favorite status:', error);
            }
        };

        fetchFavoriteStatus();
    }, [id]);

    const handleQuantityChange = (event) => {
        const value = parseInt(event.target.value, 10);
        if (!isNaN(value) && value > 0 && value <= stock) {
            setQuantity(value);
        }
    };

    const handlePriceChange = (event) => {
        const value = event.target.value;
        if (!isNaN(value) && value > 0) {
            setCustomPrice(value);
            setError('');
        } else {
            setError('El precio debe ser un número válido mayor que 0');
        }
    };

    const handlePriceClick = () => {
        setIsEditingPrice(true);
    };

    const handlePriceBlur = () => {
        setIsEditingPrice(false);
        if (isNaN(customPrice) || customPrice <= 0) {
            setError('El precio debe ser mayor que 0');
            setShowModal(true);
            setTimeout(() => {
                setShowModal(false);
            }, 3000);
        } else {
            setError('');
        }
    };

    const handleAddToCart = () => {
        if (isNaN(customPrice) || customPrice <= 0) {
            setError('El campo de precio es obligatorio y debe ser mayor que 0');
            setShowModal(true);
            setTimeout(() => {
                setShowModal(false);
            }, 3000);
            return;
        }

        const formattedCustomPrice = parseFloat(customPrice);

        if (onAddToCart) {
            onAddToCart({ id, name, description, price: formattedCustomPrice, price_initial: formattedPrice1, quantity, descuento });
            toast.success(`Producto ${name} agregado al carrito`);
        }
        setCustomPrice(price);
        setError('');
    };
    
    const toggleFavorite = async () => {
        const newFavoriteStatus = !isFavorite;
    
        try {
            const response = await axios.patch(`/api/products/${id}/favorite`, {
                isFavorite: newFavoriteStatus
            });
    
            if (response.data.success) {
                setIsFavorite(newFavoriteStatus);
                // Notificación dependiendo del estado del favorito
                if (newFavoriteStatus) {
                    toast.success('Producto marcado como Favorito');
                } else {
                    toast.success('Producto desmarcado como Favorito');
                }
            } else {
                throw new Error('Error updating favorite status');
            }
        } catch (error) {
            console.error('Error updating favorite status:', error);
            // Revertir el estado si hay un error
            setIsFavorite(!newFavoriteStatus);
            toast.error('Error al actualizar el estado de favorito');
        }
    };
    
    return (
    <div className="product-card">
        <FaStar
            className={`favorite-icon ${isFavorite ? 'active' : ''}`}
            onClick={toggleFavorite}
        />
    <div className="image-container">
        <img
           src={image ? `/api/${image}` : './src/img/NoImage.jpeg'}
           alt={name}
           className="image"
        />
    </div>
    <div className="content">
        <h4 className="name" title={name}>
            {name.length > 18 ? `${name.slice(0, 18)}...` : name}
        </h4>
        <div className="quantity-section">
            <label htmlFor={`quantity-${id}`}> <strong>Cantidad:</strong> </label>
            <input
                id={`quantity-${id}`}
                type="number"
                className="quantity-input"
                value={quantity}
                onChange={handleQuantityChange}
                max={stock}
            />
        </div>
        <div className="price-section">
            {isEditingPrice ? (
                <input
                    type="number"
                    className="custom-price-input"
                    value={customPrice}
                    onChange={handlePriceChange}
                    onBlur={handlePriceBlur}
                    autoFocus
                    min="0"
                />
            ) : (
                <span
                    className="price"
                    onClick={handlePriceClick}
                >
                    ${formattedPrice}
                </span>
            )}
        </div>
        <button
            className="header-button"
            onClick={handleAddToCart}
            disabled={error !== ''}
        >
            Agregar <i className="fa fa-shopping-cart" aria-hidden="true"></i>
        </button>
    </div>


            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <p>{error}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductCard;


