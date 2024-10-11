import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaBackward, FaFileDownload } from 'react-icons/fa';
import Header from './Header';
import ProductModal from './ProductModal';
import * as XLSX from 'xlsx';
import './ClienteList.css'
import './ProductList.css'
import { toast } from 'react-toastify';

const ProductList = () => {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]); // Guardará los productos
  const [currentPage, setCurrentPage] = useState(1); // Para la paginación
  const [itemsPerPage] = useState(10); // Productos por página
  const [searchTerm, setSearchTerm] = useState(''); // Para la barra de búsqueda
  const [editableProduct, setEditableProduct] = useState(null); // Producto editable
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // Para mostrar éxito
  const [showErrorModal, setShowErrorModal] = useState(false); // Para mostrar error
  const [error, setError] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const navigate = useNavigate();  // Inicializa useNavigate
  
  
  const descargarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(products);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Productos');
    XLSX.writeFile(wb, 'productos.xlsx');
  };
 
  useEffect(() => {
    const fetchUserInfo = async () => {
        try {
            const response = await axios.get('/api/users/:userId', { withCredentials: true });
            setUser(response.data); // Guarda la información del usuario
            console.log(response.data)
        } catch (err) {
            setError('Error fetching user data');
            console.error(err);
        }
    };

    fetchUserInfo();
}, []);

  // Función para manejar el click del botón "Nuevo"
  const handleNewProduct = () => {
    navigate('/crear-producto');  // Redirige al componente Product
  };
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/all-categories'); // Cambia esta URL a la correcta
        setCategories(response.data);
      } catch (error) {
        console.error('Error al obtener las categorías:', error);
      }
    };

    fetchCategories();
  }, []);

   const fetchProducts = async () => {
    const response = await fetch('/api/all-products'); // Reemplazar con tu ruta API
    const data = await response.json();
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Función para abrir el modal de edición y establecer el producto editable
  const handleEditProductClick = (product) => {
    setEditableProduct(product); // Establece el producto que se quiere editar
    setShowEditProductModal(true); // Abre el modal
  };

  // Función para guardar los cambios
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    
    try {
      // Envía la actualización al servidor
      const response = await fetch(`/api/update-products/${editableProduct.id}`, {
        method: 'PUT', // O POST si estás creando un producto nuevo
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editableProduct),
      });
      fetchProducts();
      // Verifica si el servidor retornó un 204 No Content
      if (response.status === 204) {
        fetchProducts();
        console.log('Producto actualizado correctamente');
        toast.success('No se puedo actualizar el producto')
         
      } else {
        // Si no es 204, entonces intenta parsear el JSON
        const result = await response.json();
        fetchProducts();
        console.log('Producto actualizado:', result);
        toast.success('Producto actualizado correctamente')
      }
  
      setShowEditProductModal(false); // Cierra el modal después de guardar
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      toast.error('Error al guardar los cambios');
    }
  };
  const toggleProductStatus = async (product) => {
    const newId = product.id > 0 ? -product.id : Math.abs(product.id);
    try {
      await axios.put(`/api/disabled-productos/${product.id}`, {}); 
      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p.id === product.id ? { ...p, id: newId } : p
        )
      );
      console.log('Estado del producto actualizado');
      toast.success('Estado del producto actualizado');
    } catch (error) {
      console.error('Error al actualizar el estado del producto:', error);
      toast.error('Error al actualizar el estado del producto');
      if (error.response && error.response.status === 403) {
        toast.error('No tienes permisos!');
      }
    }
  };
  const handleAddProduct = async (product) => {
    try {
      const response = await fetch('/api/new-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });
      if (response.ok) {
        toast.success('Producto Agregado Exitosamente!');
        setShowProductModal(false);
        fetchProducts();
      } else {
        const result = await response.json();
        setError(result.message);
        toast.error('No se pudo guardar el producto!');
      }
    } catch (error) {
      console.error('Error al guardar el producto:', error);
      toast.error('Error al guardar el producto!');
    }
  }

  // Función para cerrar los modales
  const handleCloseModals = () => {
    setShowEditProductModal(false); // Cierra el modal de edición
    setShowSuccessModal(false); // Cierra el modal de éxito
    setShowErrorModal(false); // Cierra el modal de error
  };

  // Filtrar productos según el término de búsqueda
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular los productos a mostrar en la página actual
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // Manejar cambio de página
  const paginate = pageNumber => setCurrentPage(pageNumber);
 

  return (
    <div className='container-productList'>
        <Header/>
        <div className="product-list">
            <div className="headerProductList">
                <div>
                    <Link to="/home" className="iconRegresarProducts">
                        <FaBackward className="icon" /> Ir a Home
                    </Link>
                </div>
                <div className='Buttons-new-search'>
                    <button onClick={descargarExcel} className="download-button">
                    <FaFileDownload /> Descargar Productos
                    </button>
                    <button className="new-button" onClick={() => setShowProductModal(true)}>
                    <FaPlus /> Nuevo
                    </button>
                    <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-bar"
                    />
                </div>
            </div>
            <ProductModal
                isOpen={showProductModal}
                onClose={() => setShowProductModal(false)}
                onSave={handleAddProduct}
                categories={ categories || []}
            />
            <table className="product-table">
                <thead>
                <tr>
                    <th>Id</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Precio Inicial</th>
                    <th>Precio Final</th>
                    <th>Stock</th>
                    <th>Categoria</th>
                    <th>Favorito</th>
                    <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                {currentProducts.map((product) => (
                    <tr key={product.id} className={product.id < 0 ? 'inhabilitado' : ''}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>{product.description}</td>
                    <td>{product.price_initial}</td>
                    <td>{product.price}</td>
                    <td>{product.stock}</td>
                    <td>{product.category_name}</td>
                    <td>{product.favorito}</td>
                    <td>
                        {/* Botón para editar el producto */}
                        <div className='button-group'>
                        {user && user.rol === 'Admin' && (
                        <button
                        className='edit-button'
                        onClick={() => handleEditProductClick(product)}
                        disabled={product.id < 0} // Deshabilitar si el producto está inhabilitado
                        >
                        <FaEdit />Editar
                        </button>
                        )}
                    {/* Botón para habilitar o inhabilitar el producto */}
                    <button
                    className={product.id > 0 ? 'habilitado-button' : 'inhabilitado-button'}
                    onClick={() => toggleProductStatus(product)}
                    >
                    {product.id > 0 ? 'Inhabilitar' : 'Habilitar'}
                    </button>
                    </div>
                </td>
                </tr>
            ))}
            </tbody>

            </table>

            {/* Paginación */}
            <div className="pagination">
                {[...Array(Math.ceil(filteredProducts.length / itemsPerPage)).keys()].map(number => (
                <button key={number + 1} onClick={() => paginate(number + 1)}>
                    {number + 1}
                </button>
                ))}
            </div>
        </div>
        
        {/* Modal para editar la información del producto */}
        {showEditProductModal && (
        <div className="modal-overlay">
            <div className="modal-content">
            <button className="modal-close" onClick={handleCloseModals}>×</button>
            <h2>Editar Producto</h2>
            {editableProduct ? (
                <div className="product-info">
               <form onSubmit={handleSaveChanges}>
                      <label>
                          <input
                              type="number"
                              value={editableProduct.id}
                              readOnly
                              className="form-input"
                          />
                          <span className="label-above">Id:</span>
                      </label>
                      <label>
                          <input
                              type="text"
                              value={editableProduct.name}
                              onChange={(e) =>
                                  setEditableProduct({ ...editableProduct, name: e.target.value })
                              }
                              className="form-input"
                          />
                          <span className="label-above">Nombre:</span>
                      </label>
                      <label>
                          <input
                              type="text"
                              value={editableProduct.description}
                              onChange={(e) =>
                                  setEditableProduct({ ...editableProduct, description: e.target.value })
                              }
                              className="form-input"
                          />
                          <span className="label-above">Descripcion:</span>
                      </label>
                      <label>
                          <input
                              type="number"
                              value={editableProduct.price_initial}
                              onChange={(e) =>
                                  setEditableProduct({ ...editableProduct, price_initial: e.target.value })
                              }
                              className="form-input"
                          />
                          <span className="label-above">Precio Inicial:</span>
                      </label>
                      <label>
                          <input
                              type="number"
                              value={editableProduct.price}
                              onChange={(e) =>
                                  setEditableProduct({ ...editableProduct, price: e.target.value })
                              }
                              className="form-input"
                          />
                          <span className="label-above">Precio:</span>
                      </label>
                      <label>
                          <input
                              type="number"
                              value={editableProduct.stock}
                              onChange={(e) =>
                                  setEditableProduct({ ...editableProduct, stock: e.target.value })
                              }
                              className="form-input"
                          />
                          <span className="label-above">Stock:</span>
                      </label>
                      <label>
                          <select
                              value={editableProduct.favorito}
                              onChange={(e) =>
                                  setEditableProduct({ ...editableProduct, favorito: e.target.value })
                              }
                              className="form-input"
                          >
                              <option value="1">1</option>
                              <option value="0">0</option>
                          </select>
                          <span className="label-above">Favorito:</span>
                      </label>
                      <div className="actionsCarrito">
                          <button type="submit" className="form-button">
                              Guardar Cambios
                          </button>
                          <button
                              type="button"
                              className="button-close-factura"
                              onClick={handleCloseModals}
                          >
                              Cerrar
                          </button>
                      </div>
                  </form>
                </div>
            ) : (
                <p>No se encontró el producto</p>
            )}
            </div>
  </div>
)}

    </div>
  );
};

export default ProductList;
