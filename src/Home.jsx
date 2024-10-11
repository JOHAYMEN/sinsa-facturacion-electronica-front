import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FilterCard from './FilterCard';
import ProductCard from './ProductCard';
import Cart from './Cart';
import { formatPrice } from './Util';
import './Home.css';
import Header from './Header';
import { useNavigate } from 'react-router-dom';

const Home = ({usuarioId}) => {
  const [user, setUser] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('BestSellers');
  const [categorias, setCategorias] = useState([]);
  const [products, setProducts] = useState({});
  const [selectedProducts, setSelectedProducts] = useState(() => {
    const userId = user?.id; // Asegúrate de que el usuario esté disponible
    return userId ? JSON.parse(localStorage.getItem(`cart_${userId}`)) || [] : [];
  });
  
  const [favoritos, setFavoritos] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda
  const [showFacturaModal, setShowFacturaModal] = useState(false);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [showClienteInfoModal, setShowClienteInfoModal] = useState(false); 
  const [dni, setDni] = useState('');
  const [cliente, setCliente] = useState(null);
  const [searchResults, setSearchResults] = useState([]); // Estado para los resultados de búsqueda
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalShow, setModalShow] = useState(false); 
  const [cartProducts, setCartProducts] = useState([]);
  const [numeroVenta, setNumeroVenta] = useState(1); // Estado para manejar el número de venta
  const [editedPrices, setEditedPrices] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleCartClick = () => {
    setIsCartOpen(!isCartOpen); // Alterna entre abrir y cerrar el carrito
  };

   useEffect(() => {
    setCartProducts(selectedProducts);
  }, [selectedProducts]);

  useEffect(() => {
    const fetchUserInfo = async () => {
        try {
            const response = await axios.get('/api/users/:userId', { withCredentials: true });
            setUser(response.data);
        } catch (err) {
            console.error('Error fetching user data', err);
        }
    };

    fetchUserInfo();
}, []);

// Inicializar selectedProducts basado en el ID del usuario
useEffect(() => {
    if (user) {
        const userId = user.id;
        const savedCart = localStorage.getItem(`cart_${userId}`);
        if (savedCart) {
            setSelectedProducts(JSON.parse(savedCart));
        } else {
            setSelectedProducts([]); // Asegúrate de inicializarlo correctamente
        }
    }
}, [user]);

// Guardar los productos seleccionados en el localStorage al cambiar
useEffect(() => {
    if (user) {
        const userId = user.id;
        localStorage.setItem(`cart_${userId}`, JSON.stringify(selectedProducts));
    }
}, [selectedProducts, user]);
  const clearCart = () => {
    setSelectedProducts([]);
  };

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await axios.get('/api/all-categories');
        setCategorias(response.data);
      } catch (error) {
        console.error('Error al obtener las categorías:', error);
      }
    };

    fetchCategorias();
  }, []);

  
  const fetchFavoritos = async () => {
      try {
        const response = await axios.get('/api/products-favorites');
        setFavoritos(response.data);
      } catch (error) {
        console.error('Error al obtener los productos favoritos:', error);
      }
    };
  useEffect(() => {
    fetchFavoritos();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const fetchSearchResults = async () => {
        try {
          const response = await axios.get(`/api/products/${searchTerm}`);
          setProducts({ searchResults: response.data });
          console.log('Search results:', response.data); // Agrega este log
        } catch (error) {
          console.error('Error al buscar productos:', error);
        }
      };

      fetchSearchResults();
    } else {
      // Si no hay término de búsqueda, cargar los productos por categoría seleccionada
      if (categoriaSeleccionada !== 'BestSellers') {
        const fetchProducts = async () => {
          try {
            const response = await axios.get(`/api/products/category/${categoriaSeleccionada}`);
            setProducts(prevProducts => ({
              ...prevProducts,
              [categoriaSeleccionada]: response.data
            }));
            console.log('Products by category:', response.data); // Agrega este log
          } catch (error) {
            console.error('Error al obtener los productos:', error);
          }
        };

        fetchProducts();
        
      } else {
        // Mostrar favoritos cuando no hay término de búsqueda
        setProducts({ favorites: favoritos });
        console.log('Favorite products:', favoritos);
      }
    }
  }, [searchTerm, categoriaSeleccionada, favoritos]);

  const manejarCategoriaSeleccionada = (id) => {
    setCategoriaSeleccionada(id);
    setSearchTerm(''); // Limpiar término de búsqueda al cambiar de categoría
  };

  const handleAddToCart = (product) => {
    const formattedPrice = formatPrice(product.price);

    setSelectedProducts(prevProducts => {
      const existingProductIndex = prevProducts.findIndex(p => p.id === product.id);
      if (existingProductIndex > -1) {
        const updatedProducts = [...prevProducts];
        updatedProducts[existingProductIndex] = { 
          ...updatedProducts[existingProductIndex], 
          quantity: updatedProducts[existingProductIndex].quantity + product.quantity,
          price: formattedPrice,
        };
        return updatedProducts;
      }
      return [...prevProducts, { 
        ...product, 
        quantity: product.quantity || 1,
        price: formattedPrice 
      }];
    });
  };

  const handleRemoveFromCart = (productId) => {
    setSelectedProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    setSelectedProducts(prevProducts => {
      const updatedProducts = prevProducts.map(product => 
        product.id === productId ? { ...product, quantity: newQuantity } : product
      );
      return updatedProducts;
    });
  };
  
  const handleShowFavorites = () => {
    setSearchTerm(''); // Limpiar término de búsqueda al mostrar favoritos
    fetchFavoritos();
    setCategoriaSeleccionada('BestSellers');
  };

  const handleToggleFavorite = async (productId) => {
    try {
      const response = await axios.patch(`/api/products/${productId}/favorite`);
      const isNowFavorite = response.data.isFavorite;
  
      setProducts(prevProducts => {
        const updatedProducts = { ...prevProducts };
  
        Object.keys(updatedProducts).forEach(category => {
          updatedProducts[category] = updatedProducts[category].map(product =>
            product.id === productId ? { ...product, isFavorite: isNowFavorite } : product
          );
        });
        
        return updatedProducts;
      });
      
      setFavoritos(prevFavoritos => {
        if (isNowFavorite) {
          const newFavorite = response.data.product;
          return [...prevFavoritos, newFavorite];
        } else {
          return prevFavoritos.filter(product => product.id !== productId);
        }
      });
  
    } catch (error) {
      console.error('Error al cambiar el estado de favorito:', error);
    }
  };
  
  useEffect(() => {
    const handleSearch = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]); // Limpia los resultados si el término de búsqueda está vacío
        return;
      }
  
      try {
        const response = await axios.get(`/api/products/${searchTerm}`);
        
        if (response.data.length > 0) {
          setSearchResults(response.data); // Si hay resultados, los establece
        } else {
          setSearchResults([]); // Si no hay productos, limpia los resultados
          console.log('No se encontraron productos'); // Puedes también manejar esto en la UI
        }
      } catch (error) {
        console.error('Error al buscar productos:', error);
        setSearchResults([]); // Limpia los resultados en caso de error
      }
    };
  
    handleSearch();
  }, [searchTerm]); // Se ejecuta cada vez que cambia el searchTerm
  
  
  
  return (
    <div className="app-container">
    <Header onSearch={setSearchTerm} cartItemsCount={selectedProducts.length} onCartClick={handleCartClick} />
    <div className="filter-section">
      <FilterCard 
        categoriaSeleccionada={categoriaSeleccionada} 
        onCategoriaSeleccionada={manejarCategoriaSeleccionada}
        categorias={categorias}
        onShowFavorites={handleShowFavorites}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
    </div>
    {/* Contenedor principal para los productos */}
    <div className="productos-container">
      <div className="productos-scroll">
        {(searchTerm ? products.searchResults : categoriaSeleccionada === 'BestSellers' ? products.favorites : products[categoriaSeleccionada])
          ?.filter(product => product.id > 0)
          .map((product) => (
            <ProductCard 
              key={product.id} 
              {...product} 
              onAddToCart={handleAddToCart}
              isFavorite={favoritos.some(fav => fav.id === product.id)}
              onToggleFavorite={handleToggleFavorite}  
            />
          ))}
      </div>
      {isCartOpen && (
          <Cart
            selectedProducts={selectedProducts}
            handleRemoveFromCart={handleRemoveFromCart}
            handleUpdateQuantity={handleUpdateQuantity}
            clearCart={clearCart}
          />
        )}
    </div>
  </div>
);
};

export default Home;