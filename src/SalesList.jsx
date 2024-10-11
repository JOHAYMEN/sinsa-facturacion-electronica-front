import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { FaEdit, FaFileDownload , FaBackward, FaPrint } from 'react-icons/fa';
import axios from 'axios';
import Header from './Header';
import './ClienteList.css';
import './SalesList.css';
import { toast } from 'react-toastify';

const SalesList = () => {
  const [establecimiento, setEstablecimiento] = useState(null);
  const [user, setUser] = useState(null);
  const [sales, setSales] = useState([]); // Guardará los productos
  const [currentPage, setCurrentPage] = useState(1); // Para la paginación
  const [itemsPerPage] = useState(10); // Productos por página
  const [searchTerm, setSearchTerm] = useState(''); // Para la barra de búsqueda
  const [editableSale, setEditableSale] = useState(null); // Producto editable
  const [showEditSaleModal, setShowEditSaleModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // Para mostrar éxito
  const [showErrorModal, setShowErrorModal] = useState(false); // Para mostrar error
  const [error, setError] = useState('');
  const [showSaleModal, setShowSaleModal] = useState(false);
  const navigate = useNavigate();  // Inicializa useNavigate
  const [showProductModal, setShowProductModal] = useState(false);
  const [products, setProducts] = useState([]); // Lista de productos
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [suggestedProducts, setSuggestedProducts] = useState([]); // Para manejar productos sugeridos
    // ...
    const descargarExcel = () => {
        const ws = XLSX.utils.json_to_sheet(sales);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Ventas');
        XLSX.writeFile(wb, 'ventas.xlsx');
      };
    // Función para buscar productos en la base de datos
    const fetchSuggestedProducts = async (searchTerm) => {
        if (!searchTerm) {
            setSuggestedProducts([]); // Si no hay término de búsqueda, limpiar sugerencias
            return;
        }

        const response = await fetch(`/api/products/${searchTerm}`);
        const data = await response.json();
        setSuggestedProducts(data); // Actualiza las sugerencias con los productos encontrados
    };

    // Manejo del cambio en el input del producto
    const handleProductNameChange = (e, index) => {
        const newName = e.target.value;
        const updatedItems = [...editableSale.items];
        updatedItems[index].name = newName; // Actualiza el nombre del producto

        setEditableSale({ ...editableSale, items: updatedItems });
        fetchSuggestedProducts(newName); // Busca productos sugeridos
    };

    // Manejo de selección de producto sugerido
    const handleSelectSuggestedProduct = (product, index) => {
        const updatedItems = [...editableSale.items];
        updatedItems[index] = { ...product }; // Actualiza el producto con los datos seleccionados
        setEditableSale({ ...editableSale, items: updatedItems });
        setSuggestedProducts([]); // Limpia las sugerencias
    };

  useEffect(() => {
    // Función para obtener productos desde el servidor (simulada aquí)
    const fetchProducts = async () => {
      // Aquí debes hacer la llamada a tu API para obtener los productos
      const response = await fetch('/api/all-products');
      const data = await response.json();
      setProducts(data);
    };

    fetchProducts();
  }, []);
  

   const fetchSales = async () => {
    const response = await fetch('/api/all-sales'); // Reemplazar con tu ruta API
    const data = await response.json();
    setSales(data);
  };

  useEffect(() => {
    fetchSales();
  }, []);

  // Función para abrir el modal de edición y establecer el producto editable
  const handleEditSalesClick = (sale) => {
    setEditableSale(sale); // Establece el producto que se quiere editar
    setShowEditSaleModal(true); // Abre el modal
  };

  // Función para guardar los cambios
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    
    try {
      // Envía la actualización al servidor
      const response = await fetch(`/api/update-sale/${editableSale.numero_venta}`, {
        method: 'PUT', // O POST si estás creando un producto nuevo
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editableSale),
      });
      fetchSales();
      // Verifica si el servidor retornó un 500 error internal
      if (response.status === 500) {
        fetchSales();
        toast.error("No se pudo actualizar la venta, verifique Stock!")
        console.log('Venta NO actualizado correctamente');
      } else {
        // Si no es 204, entonces intenta parsear el JSON
        const result = await response.json();
        fetchSales();

        toast.success('Venta Actualizada');
      }
      setShowEditSaleModal(false); // Cierra el modal después de guardar
    } catch (error) {
      toast.error('Error al guardar los cambios:', error);
    }
  };
  
  // Función para cerrar los modales
  const handleCloseModals = () => {
    setShowEditSaleModal(false); // Cierra el modal de edición
    setShowSuccessModal(false); // Cierra el modal de éxito
    setShowErrorModal(false); // Cierra el modal de error
  };

  // Filtrar productos según el término de búsqueda
  const filteredSales = sales.filter(sale => {
    const numeroVenta = sale.numero_venta; // Asegúrate de que esta es la propiedad correcta

    // Manejo de casos donde numeroVenta puede ser null
    if (numeroVenta === null) {
        return false; // No incluir ventas con numero_venta null
    }

    // Verifica si numeroVenta es un string antes de llamar a toLowerCase
    if (typeof numeroVenta === 'string') {
        return numeroVenta.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (typeof numeroVenta === 'number') {
        // Si es un número, puedes convertirlo a string
        return numeroVenta.toString().includes(searchTerm);
    }

    return false; // Si no es ni string ni número, no se incluye en el filtrado
});


  // Calcular los productos a mostrar en la página actual
  const indexOfLastSale = currentPage * itemsPerPage;
  const indexOfFirstSale = indexOfLastSale - itemsPerPage;
  const currentSales = filteredSales.slice(indexOfFirstSale, indexOfLastSale);

  // Manejar cambio de página
  const paginate = pageNumber => setCurrentPage(pageNumber);
  useEffect(() => {
    const fetchUserInfo = async () => {
        try {
            const response = await axios.get('/api/users/:userId', { withCredentials: true });
            setUser(response.data); // Guarda la información del usuario
        } catch (err) {
            setError('Error fetching user data');
            console.error(err);
        }
    };

    fetchUserInfo();
}, []);

useEffect(() => {
  const fetchEstablecimientoInfo = async () => {
    try {
      const response = await axios.get('/api/users/establecimiento/:usuarioId', { withCredentials: true });
      setEstablecimiento(response.data);
    } catch (err) {
      setError('Error fetching establecimiento data');
      console.error(err);
    }
  };

  fetchEstablecimientoInfo();
}, []);
 
const handlePrintSales = (sale, establecimiento, user) => {
    // Crear un formato legible para los detalles de los productos
    const saleItemsDetails = sale.items.map(item => `
      ${item.name}
      Cantidad: ${item.quantity}
      Valor und: ${item.price}
    `).join('----------------------');  // Unir todos los productos con saltos de línea

    // Detalles generales de la venta, establecimiento y usuario
    const saleDetails = `
      Establecimiento: 
      ${establecimiento.name} (${establecimiento.company_type})
      NIT: ${establecimiento.nit}
      Representante Legal:
      ${establecimiento.legal_representative}
      ---------------------
      Factura Electronica
      de Venta
      ---------------------
      Fuiste atendido por: 
      ${user.username}
      Rol: ${user.rol}
      ---------------------
      Venta Numero: ${sale.numero_venta}
      ${saleItemsDetails}
    ----------------------
      Total de productos: ${sale.total_products}
      Total: ${sale.valor_total_compra}
    `;

    // Crear una ventana temporal para imprimir la venta
    const printWindow = window.open('', '', 'height=400,width=600');
    printWindow.document.write('<html><head><title>Imprimir Venta</title></head>');
    printWindow.document.write('<body>');
    printWindow.document.write('<pre>' + saleDetails + '</pre>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
};

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
                    <FaFileDownload /> Descargar ventas
                    </button>
                    <input
                    type="text"
                    placeholder="Buscar venta..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-bar"
                    />
                </div>
            </div>
            <table className="product-table">
            <thead>
                <tr>
                    <th>Id</th>
                    <th>Numero Venta</th>
                    <th>Fecha</th>
                    <th>Productos</th>
                    <th>Usuario Id</th>
                    <th>Total Productos</th>
                    <th>Valor compra</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {currentSales.map((sale) => (
                    <tr key={sale.id}>
                        <td>{sale.id}</td>
                        <td>{sale.numero_venta}</td>
                        <td>{sale.sale_date}</td>
                        <td>
                            <ul>
                                {Array.isArray(sale.items) ? (
                                    sale.items.map((item) => (
                                    <li key={item.id}>
                                        {item.name} - ${item.price} (Cantidad: {item.quantity})
                                    </li>
                                    ))
                                    ) : (
                                    <li>No hay productos</li>
                                 )}
                            </ul>
                        </td>
                            <td>{sale.usuario_id}</td>
                            <td>{sale.total_products}</td>
                            <td>{sale.valor_total_compra}</td>
                            <td>
                            {/* Botón para editar la venta */}
                            <div className="button-group">
                                <button className='edit-button' onClick={() => handleEditSalesClick(sale)}>
                                    <FaEdit /> Editar
                                </button>
                                <button className='print-button' onClick={() => handlePrintSales(sale, establecimiento, user)}>
                                    <FaPrint /> Imprimir
                                </button>
                            </div>
                        </td>
                    </tr>
                            ))}
            </tbody>
            </table>

            {/* Paginación */}
            <div className="pagination">
                {[...Array(Math.ceil(filteredSales.length / itemsPerPage)).keys()].map(number => (
                <button key={number + 1} onClick={() => paginate(number + 1)}>
                    {number + 1}
                </button>
                ))}
            </div>
        </div>
         {/* Modal para mostrar éxito */}
         {showSuccessModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Éxito</h2>
              <p>La venta se actualizó correctamente.</p>
              <button type="button" className="button-close" onClick={handleCloseModals}>Cerrar</button>
            </div>
          </div>
        )}

        {/* Modal para mostrar error */}
        {showErrorModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Error</h2>
              <p>No se pudo actualizar la venta. Por favor, intente nuevamente.</p>
              <button type="button" className="button-close" onClick={handleCloseModals}>Cerrar</button>
            </div>
          </div>
        )}
        {/* Modal para editar la información del producto */}
        {showEditSaleModal && (
            <div className="modal-overlay">
                <div className="modal-content">
                <button className="modal-close" onClick={handleCloseModals}>×</button>
                    <h2>Editar venta</h2>
                    {editableSale ? (
                        <div className="product-info">
                            <form onSubmit={handleSaveChanges}>
                                <label>
                                    <input
                                        type="number"
                                        value={editableSale.id}
                                        readOnly // El id no debería ser editable
                                        className="form-input"
                                    />
                                    <span className="label-above">Id:</span>
                                </label>
                                <label>
                                    <input
                                        type="number"
                                        value={editableSale.numero_venta}
                                        onChange={(e) =>
                                            setEditableSale({ ...editableSale, numero_venta: e.target.value })
                                        }
                                        className="form-input"
                                    />
                                    <span className="label-above">Numero Venta:</span>
                                </label>
                                <label>
                                    <div className="product-list-scroll-sales">
                                    {editableSale.items.map((item, index) => (
                                        <div key={item.id} className="product-edit">
                                            <input
                                                type="text"
                                                value={item.name || ""}
                                                onChange={(e) => handleProductNameChange(e, index)} // Actualiza el nombre y busca sugerencias
                                                className="form-input"
                                                placeholder="Nombre del producto"
                                            />
                                            {/* Mostrar sugerencias de productos */}
                                            {suggestedProducts.length > 0 && (
                                                <ul className="suggestions-list">
                                                    {suggestedProducts.map((product) => (
                                                        <li key={product.id} onClick={() => handleSelectSuggestedProduct(product, index)}>
                                                            {product.name} - ${product.price}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            <input
                                                type="number"
                                                value={item.price || ""} 
                                                onChange={(e) => {
                                                    const updatedItems = [...editableSale.items];
                                                    updatedItems[index].price = parseFloat(e.target.value) || 0; 
                                                    setEditableSale({ ...editableSale, items: updatedItems });
                                                }}
                                                className="form-input"
                                                placeholder="Precio"
                                            />
                                            <input
                                                type="number"
                                                value={item.quantity || ""} 
                                                onChange={(e) => {
                                                    const updatedItems = [...editableSale.items];
                                                    updatedItems[index].quantity = parseInt(e.target.value) || 0; 
                                                    setEditableSale({ ...editableSale, items: updatedItems });
                                                }}
                                                className="form-input"
                                                placeholder="Cantidad"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updatedItems = editableSale.items.filter((_, i) => i !== index);
                                                    setEditableSale({ ...editableSale, items: updatedItems });
                                                }}
                                                className="button-remove-product"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    ))}
                                    </div>
                                    <span className="label-above">Productos:</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newItem = { id: Date.now(), name: '', price: 0, quantity: 1 }; // Nuevo producto vacío
                                        setEditableSale({ ...editableSale, items: [...editableSale.items, newItem] });
                                    }}
                                    className="button-add-product"
                                >
                                    Agregar producto
                                </button>
                                <label>
                                    <input
                                        type="number"
                                        value={editableSale.total_products}
                                        readOnly // Cambiar a readOnly ya que se calculará automáticamente
                                        className="form-input"
                                    />
                                    <span className="label-above">Total Productos:</span>
                                </label>
                                <label>
                                    <input
                                        type="number"
                                        value={editableSale.valor_total_compra}
                                        readOnly // Cambiar a readOnly ya que se calculará automáticamente
                                        className="form-input"
                                    />
                                    <span className="label-above">Valor Total:</span>
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
                        <p>No se encontró la venta</p>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};

export default SalesList;
