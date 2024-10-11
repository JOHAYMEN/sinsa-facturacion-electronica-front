import React,{useState, useEffect} from 'react';
import Modal from 'react-modal';
import ClientModal from './ClientModal';
import axios from 'axios';
import './Cart.css';
import { toast } from 'react-toastify';

const Cart = ({ selectedProducts, handleRemoveFromCart, handleUpdateQuantity, calculateTotal, usuarioId, clearCart }) => {
  const [showFacturaModal, setShowFacturaModal] = useState(false);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [showClienteInfoModal, setShowClienteInfoModal] = useState(false); 
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [dni, setDni] = useState('');
  const [cliente, setCliente] = useState(null); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [cartProducts, setCartProducts] = useState([]);
  const [cartData, setCartData] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [numeroVenta, setNumeroVenta] = useState(1); // Estado para manejar el número de venta
  const [userId, setUserId] = useState(null);
  const [editedPrices, setEditedPrices] = useState({}); // Almacena los precios editados

  const handleEditPrice = (id, newPrice) => {
    setEditedPrices((prev) => ({
      ...prev,
      [id]: newPrice,
    }));
  };

  // Función para calcular el descuento
  const calculateDiscount = (originalPrice, editedPrice) => {
    if (originalPrice === editedPrice) {
      return 0; // Sin descuento
    }
    const discountPercentage = ((originalPrice - editedPrice) / originalPrice) * 100;
    return discountPercentage.toFixed(2); // Limitar el descuento a 2 decimales
  };
   

// Función para obtener el número de venta actual desde la base de datos cuando el componente se monta
useEffect(() => {
    const fetchNumeroVenta = async () => {
        try {
            const response = await fetch('/api/latest-sale-number');
            if (response.ok) {
                const data = await response.json();
                setNumeroVenta(data.numero_venta);
            } else {
                toast.error('Error al obtener el número de venta');
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            toast.error('Error en la solicitud');
        }
    };

    fetchNumeroVenta(); // Llamar a la función para obtener el número de venta
}, []);

  // Función para manejar la adición de un producto al carrito
  const handleAddProduct = (product) => {
    setRowCount(prevCount => prevCount + 1); 
  };


  useEffect(() => {
    setCartProducts(selectedProducts);
  }, [selectedProducts]);

  const handleRemove = (productId) => {
    const updatedCart = cartProducts.filter(product => product.id !== productId);
    setCartProducts(updatedCart);
    handleRemoveFromCart(productId);
  };

  const handleQuantityUpdate = (productId, newQuantity) => {
    const updatedCart = cartProducts.map(product => 
      product.id === productId ? { ...product, quantity: newQuantity } : product
    );
    setCartProducts(updatedCart);
    handleUpdateQuantity(productId, newQuantity);
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (cartProducts.length > 0) {
        event.preventDefault();
        event.returnValue = ''; // Mensaje de advertencia
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [cartProducts]);

  const handleImprimir = async () => {
    if (!Array.isArray(cartProducts) || cartProducts.length === 0) {
        toast.error("El carrito está vacío");
        return false;  
    }

    try {
        // Obtener el último número de venta
        const numeroVentaResponse = await fetch('/api/latest-sale-number');
        if (!numeroVentaResponse.ok) {
            throw new Error('Error al obtener el número de venta');
        }
        const { numero_venta } = await numeroVentaResponse.json();

        // Calcular el total de descuento de la venta
        const totalDescuento = cartProducts.reduce((total, product) => {
            const editedPrice = editedPrices[product.id] || product.price;
            const descuento = calculateDiscount(product.price, editedPrice);
            return total + (descuento > 0 ? (product.price - editedPrice) * product.quantity : 0);
        }, 0);
        toast.success(`Total descuento aplicado en la venta: ${totalDescuento}`);

        // Calcular el total sin descuento (precio original)
        const totalSinDescuento = cartProducts.reduce((total, product) => {
            return total + (product.price * product.quantity);
        }, 0);

        // Calcular el total con descuento (precio final)
        const totalConDescuento = cartProducts.reduce((total, product) => {
            const editedPrice = editedPrices[product.id] || product.price;
            return total + (editedPrice * product.quantity);
        }, 0);

        // Calcular el porcentaje de descuento total de la venta
        const desc_en_porcentaje = totalSinDescuento > 0 ? ((totalSinDescuento - totalConDescuento) / totalSinDescuento) * 100 : 0;

        // Preparar cartData con precio_inicial, precio_final, ganancia y descuento en porcentaje
        const cartData = cartProducts.map(product => {
            const editedPrice = editedPrices[product.id] || product.price;
            const ganancia = (editedPrice - product.price_initial) * product.quantity;
            const descuento = calculateDiscount(product.price, editedPrice);
            const descuentoPorcentaje = ((product.price - editedPrice) / product.price) * 100;

            return {
                id: product.id,
                name: product.name,
                quantity: product.quantity,
                price: editedPrice,
                price_initial: product.price_initial,
                description: product.description,
                ganancia: ganancia,
                descuento,
                descuentoPorcentaje
            };
        });

        // Calcular la cantidad total de productos
        const totalProducts = cartProducts.reduce((total, product) => total + product.quantity, 0);
        const totalCompra = cartProducts.reduce((total, product) => total + (product.quantity * (editedPrices[product.id] || product.price)), 0);

        // Hacer la solicitud a la API para guardar la venta y generar la factura
        const response = await fetch('/api/print-invoice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                usuarioId, 
                cartData,
                totalProducts, 
                totalCompra, 
                totalDescuento,
                desc_en_porcentaje, // Usar el nuevo cálculo de porcentaje
                numeroVenta: numero_venta 
            }),
            credentials: 'include',
        });

        if (response.ok) {
            toast.success('Factura generada y descargada con exito!');
            setNumeroVenta(prev => prev + 1);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'invoice.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
            clearCart(); // Limpiar el carrito después de imprimir la factura
            return true;
        } else {
            const errorData = await response.json();
            console.error('Error al generar la factura:', errorData.message);
            toast.error('Error al generar la factura!');
            toast.error(`${errorData.message} Los siguientes productos están inhabilitados: ${errorData.invalidProducts ? errorData.invalidProducts.join(', ') : 'Ninguno'}`);
            return false;
        }
    } catch (error) {
        toast.error('Error al generar la factura');
        console.error('Error al intentar imprimir la factura:', error);
    }
};


  const handleVistaPrevia = async () => {
    try {
        const cartData = cartProducts.map(product => ({
            id: product.id,
            name: product.name,
            quantity: product.quantity,
            price: product.price,
            description: product.description
        }));

        // Obtener la cantidad de productos únicos usando un Set para los IDs
        const uniqueProductIds = new Set(cartProducts.map(product => product.id));
        const totalProducts = uniqueProductIds.size; // Contar solo productos únicos

        const response = await fetch('/api/view-print-invoice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ usuarioId, cartData, totalProducts }),
            credentials: 'include',
        });

        if (response.ok) {
            toast.success('Vista previa generada con exito!');
            const { pdfBase64 } = await response.json();
            const pdfBlob = base64ToBlob(pdfBase64, 'application/pdf');
            const url = window.URL.createObjectURL(pdfBlob);
            setPdfUrl(url);
            setIsModalOpen(true);
        } else {
            console.error('Error al generar la factura:', response.statusText);
            toast.error('Error al generar la factura!')
        }
    } catch (error) {
        console.error('Error al generar la vista previa:', error);
        toast.error('Error al generar la vista previa');
    }
};

  const base64ToBlob = (base64, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  };
  const calculateTotal1 = () => {
    if (!selectedProducts || !Array.isArray(selectedProducts)) {
      return 0;
    }
  
    return selectedProducts.reduce((total, product) => {
      // Obtener el precio editado si existe, si no, usar el precio original
      const editedPrice = editedPrices[product.id] || product.price;
      
      // Asegurarse de que el precio sea numérico y eliminar posibles comas
      const price = parseFloat(editedPrice.toString().replace(',', '')) || 0;
      const quantity = product.quantity || 0;
  
      return total + (price * quantity);
    }, 0);
  };
  const handleOpenModal1 = () => {
    setIsModalOpen1(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen1(false);
  };

  const handleSaveClient = async (cliente) => {
    try {
      const response = await fetch('/api/new-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cliente),
      });
      if (response.ok) {
        toast.success('Cliente Creado Exitosamente')
        setShowClienteModal(false);
        //fetchClientes();
      } else {
        const result = await response.json();
        setError(result.message);
        toast.error('No se puedo crear el cliente!')
      }
    } catch (error) {
      console.error('Error al guardar el cliente:', error);
      toast.error('Error al guardar el cliente');
    }
  };
  const handleFacturar = () => {
    setShowFacturaModal(true);
  };
  const handleClienteSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.get(`/api/customers/${dni}`);
  
      if (response.status === 200 && response.data && response.data.dni) {
        setCliente(response.data);
        setShowClienteInfoModal(true);
        setShowFacturaModal(false);
      } else {
        setShowFacturaModal(false);
        setShowClienteModal(true);
      }
    } catch (error) {
      console.error('Error al obtener cliente:', error);
      toast.error('Error al obtener el cliente')
      setShowFacturaModal(false);
      setShowClienteModal(true);
    }
  };
 
 const handleCloseModals = () => {
    setShowFacturaModal(false);
    setShowClienteModal(false);
    setShowClienteInfoModal(false); 
  };
  const handleEnviarCorreo = async () => {
    try {
        const cartData = selectedProducts.map(product => {
            const editedPrice = editedPrices[product.id] || product.price;
            // Descuento por unidad
            const descuentoPorUnidad = product.price - editedPrice;
            // Descuento total para todas las unidades
            const descuentoTotal = descuentoPorUnidad * product.quantity;
            // Precio de venta final por unidad después del descuento
            const precioVentaFinal = editedPrice;
            // Precio total de la venta por todas las unidades (precio final * cantidad)
            const totalVentaProducto = precioVentaFinal * product.quantity;
            // Descuento en porcentaje
            const descuentoPorcentaje = ((descuentoPorUnidad / product.price) * 100).toFixed(2);

            return {
                id: product.id,
                name: product.name,
                quantity: product.quantity,
                price: product.price, // Precio original
                price_final: precioVentaFinal, // Precio de venta final por unidad
                price_initial: product.price_initial,
                description: product.description,
                totalVenta: totalVentaProducto, // Total de la venta por todas las unidades
                descuento: descuentoTotal, // Descuento total en pesos
                descuentoPorcentaje: `${descuentoPorcentaje}%` // Descuento en porcentaje
            };
        });

        const venta_Total_compra = cartData.reduce((total, product) => total + product.totalVenta, 0);

        const clienteYProductos = {
            cliente: {
                name: cliente.name,
                email: cliente.email,
                dni: cliente.dni,
                address: cliente.address,
                phone: cliente.phone,
            },
            productos: cartData,
            venta_Total_compra,
        };

        const facturaGenerada = await handleImprimir();
        toast.success("Factura Descargada")
        if (!facturaGenerada) {
            toast.error('Error al generar la factura. No se enviará el correo.');
            return;
        }

        try {
            const response = await axios.post('/api/enviar-correo', clienteYProductos);
            console.log('Correo enviado exitosamente:', response.data.message);
            toast.success('Correo Enviado Exitosamente');
        } catch (error) {
            console.error('Error al enviar el correo:', error.response ? error.response.data : error.message);
            toast.error('Error al enviar el correo');
        }

    } catch (error) {
        console.error('Error al enviar el correo:', error.response ? error.response.data : error.message);
        toast.error('Error al enviar el correo');
    }
};

  
  return (
    <div className="selected-products-container">
      <div className="headerCarrito">
            <h3>Productos Seleccionados ({cartProducts.length})</h3>
            <h3>Venta Número: {numeroVenta}</h3>
            <h3>Total: ${calculateTotal1(cartProducts)}</h3>
                <div className="actionsCarrito">
                <button className="action-buttonCarrito" onClick={handleFacturar}>Facturar</button>
                <button className="action-buttonCarrito" onClick={handleImprimir}>Imprimir</button>
                <button className="action-buttonCarrito" onClick={handleVistaPrevia}>Vista Previa</button>
            </div>
      </div>
      <div>
      <table className="selected-products-table">
        <thead>
                <tr>
                <th>Id</th>
                <th>Nombre</th>
                <th>Cantidad</th>
                <th>Precio Inicial</th>
                <th>Precio Final</th>
                <th>       </th>
                <th>Total</th>
                <th>Acciones</th>
                <th>Descripción</th>
                <th>Descuento (%)</th>
                </tr>
        </thead>
        <tbody>
            {cartProducts.map((product, index) =>  {
                const editedPrice = editedPrices[product.id] || product.price; // Mover la declaración de editedPrice dentro de un bloque de código

            return (
                    <tr key={product.id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                        <td>{product.id}</td>
                        <td>{product.name}</td>
                        <td>
                          <div className="quantity-container"> {/* Contenedor para los botones y la cantidad */}
                              <button 
                                  className="quantity-button decrement" 
                                  onClick={() => handleQuantityUpdate(product.id, product.quantity - 1)} 
                                  disabled={product.quantity <= 1}
                              >
                                  -1
                              </button>
                              <span className="quantity-display">{product.quantity}</span> {/* Muestra la cantidad */}
                              <button 
                                  className="quantity-button increment" 
                                  onClick={() => handleQuantityUpdate(product.id, product.quantity + 1)}
                              >
                                  +1
                              </button>
                          </div>
                      </td>

                        <td>${product.price_initial}</td>
                        <td>${product.price}</td>
                        <td>
                            <input 
                            type="number" 
                            value={editedPrice} 
                            onChange={(e) => handleEditPrice(product.id, parseFloat(e.target.value) || product.price)} 
                            />
                        </td>
                        <td>${product.price * product.quantity}</td>
                        <td>
                          <div >
                            <button onClick={() => handleRemove(product.id)} className='button-decrement' >Eliminar</button>
                        </div>
                        </td>
                        <td>{product.description}</td>
                        <td>{calculateDiscount(product.price, editedPrice)}%</td>
                    </tr>
                    )})
                    }
                    <tr className="total-row">
                    <td colSpan="4"><strong>Total:</strong></td>
                    <td>${calculateTotal1(cartProducts)}</td>
                    <td colSpan="2"></td>        
                    </tr>
        </tbody>
      </table>
    </div>

      {/* Modal para la vista previa del PDF */}
      <Modal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} contentLabel="Vista Previa de la Factura">
        <h2>Vista Previa de la Factura</h2>
        <button onClick={() => setIsModalOpen(false)}>Cerrar</button>
        <iframe src={pdfUrl} width="100%" height="600px" title="Vista Previa de la Factura"></iframe>
      </Modal>
      
      {/* Modal para factura */}
      {showFacturaModal && (
        <div className="modal-overlay">
          <div className="modal-content">
          <h2>Buscar Cliente</h2>
            <form onSubmit={handleClienteSubmit}>
              <label>
                Cedula:
                <input type="text"
                 value={dni}
                 onChange={(e) => setDni(e.target.value)}
                 required
                 className="form-input" />
              </label>
              <div className='button-form-factura'>
                <button type="submit" className="form-button">Buscar Cliente</button>
                <button type="button" className="button-close-factura" onClick={handleCloseModals}>Cerrar</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
     {/* Modal de información del cliente encontrado */}
     {showClienteInfoModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Información del Cliente</h2>
            <p>Nombre: {cliente.name}</p>
            <p>Apellido: {cliente.surname}</p>
            <p>Cedula: {cliente.dni}</p>
            <p>Dirección: {cliente.address}</p>
            <p>Teléfono: {cliente.phone}</p>
            <p>Correo: {cliente.email}</p>
            <button onClick={handleCloseModals} className="quantity-button decrement">Cerrar</button>
            <button onClick={handleEnviarCorreo} className="quantity-button send">Enviar</button>
          </div>
        </div>
      )}

        {showClienteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Cliente no encontrado</h2>
            <p>¿Desea registrar un nuevo cliente?</p>
            <div className="modal-buttons">
              <button onClick={handleOpenModal1} className="form-button" >Registrar Cliente</button>
              <ClientModal
                isOpen={isModalOpen1}
                onClose={handleCloseModal}
                onSave={handleSaveClient}
            />
              <button onClick={handleCloseModals} className="quantity-button decrement" >Cancelar</button>
            </div>
          </div>
        </div>
      )}
       {isModalOpen && (
            <div className="modal-fullscreen" onClick={() => setIsModalOpen(false)}>
                <iframe src={pdfUrl} width="100%" height="100%" title="Vista previa de factura"></iframe>
            </div>
        )}
    </div>
  );
};

export default Cart;

