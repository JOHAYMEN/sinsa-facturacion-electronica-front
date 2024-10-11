import React, { useState, useEffect, useRef } from 'react'; 
import axios from 'axios';
import CrearMesa from './CrearMesa';
import './Dashboard.css'

const DashboardMesas = () => {
  const [mesas, setMesas] = useState([]); // Mesas disponibles
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null); // Mesa seleccionada
  const [pedidos, setPedidos] = useState({}); // Objeto para almacenar los pedidos por mesa
  const [productos, setProductos] = useState([]); // Lista de productos de la base de datos
  const [busquedaProducto, setBusquedaProducto] = useState(''); // Valor del buscador de productos
  const [productosFiltrados, setProductosFiltrados] = useState([]); // Productos filtrados por búsqueda
  const [pedidoTemporal, setPedidoTemporal] = useState([]); // Pedido actual antes de añadir
  const [searchTerm, setSearchTerm] = useState(''); // Para la barra de búsqueda
  const [horaReserva, setHoraReserva] = useState(null); // Almacena la hora de reserva
  const [temporizador, setTemporizador] = useState(null);
  const [horaSeleccionada, setHoraSeleccionada] = useState('');

  // Obtener mesas desde la base de datos
  useEffect(() => {
    const fetchMesas = async () => {
      try {
        const response = await axios.get('/api/all-mesas');
        // Asegurar que cada mesa tenga sus propias propiedades de reserva y temporizador
        const mesasConReservas = response.data.map((mesa) => ({
          ...mesa,
          horaReserva: null,
          temporizador: null
        }));
        setMesas(mesasConReservas);
      } catch (error) {
        console.error('Error al obtener las mesas:', error);
      }
    };
    fetchMesas();
  }, []);

  // Manejar el cambio de mesa seleccionada
  const handleMesaClick = (mesa) => {
    setMesaSeleccionada(mesa);

    // Recuperar el pedido de la mesa seleccionada si ya existe
    if (pedidos[mesa.id_mesa]) {
      setPedidoTemporal(pedidos[mesa.id_mesa]);
    } else {
      setPedidoTemporal([]); // Limpiar pedido temporal si no hay pedido para esta mesa
    }
  };

  // Manejar el input del buscador de productos
  const handleBuscarProducto = async (e) => {
    const valor = e.target.value;
    setBusquedaProducto(valor);

    if (valor.length > 0) {
      try {
        const response = await axios.get(`/api/products/${valor}`);
        setProductosFiltrados(response.data); // Actualizar la lista con los productos filtrados
      } catch (error) {
        console.error('Error al buscar productos:', error);
      }
    } else {
      setProductosFiltrados([]); // Limpiar la lista si no hay valor de búsqueda
    }
  };

  // Añadir producto al pedido y cambiar mesa a "ocupada"
  const handleAgregarProducto = (producto) => {
    setPedidoTemporal((prevPedido) => {
      const productoExistente = prevPedido.find((p) => p.id === producto.id);
      if (productoExistente) {
        return prevPedido.map((p) =>
          p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
        );
      }
      return [...prevPedido, { ...producto, cantidad: 1 }];
    });

    // Cambiar el estado de la mesa a "ocupada" si se agrega un producto
    if (mesaSeleccionada) {
      setMesas((prevMesas) =>
        prevMesas.map((mesa) =>
          mesa.id_mesa === mesaSeleccionada.id_mesa ? { ...mesa, estado: 'ocupada' } : mesa
        )
      );
    }
  };

  // Editar cantidad de un producto
  const handleEditarCantidad = (id, nuevaCantidad) => {
    setPedidoTemporal((prevPedido) =>
      prevPedido.map((p) =>
        p.id === id ? { ...p, cantidad: nuevaCantidad > 0 ? nuevaCantidad : 1 } : p
      )
    );
  };

  const handleHoraChange = (event) => {
    setHoraSeleccionada(event.target.value); // Almacenar la hora seleccionada
  };

  // Confirmar hora de reserva y configurar temporizador
  const handleConfirmarHoraReserva = (mesaId) => {
    if (!horaSeleccionada) {
      alert('Por favor, selecciona una hora para reservar la mesa.');
      return;
    }

    setMesas((prevMesas) =>
      prevMesas.map((mesa) =>
        mesa.id_mesa === mesaId ? { ...mesa, estado: 'reservada' } : mesa
      )
    );

    // Guardar la hora de reserva confirmada
    setHoraReserva(horaSeleccionada);

    // Iniciar temporizador para cancelar automáticamente después de 5 minutos
    const timer = setTimeout(() => {
      setMesas((prevMesas) =>
        prevMesas.map((mesa) =>
          mesa.id_mesa === mesaId ? { ...mesa, estado: 'libre' } : mesa
        )
      );
    }, 5 * 60 * 1000); // 5 minutos
    setTemporizador(timer);
  };
 // Cancelar la reserva manualmente
   const handleCancelarReserva = (mesaId) => {
    clearTimeout(temporizador); // Cancelar temporizador
    setMesas((prevMesas) =>
      prevMesas.map((mesa) =>
        mesa.id_mesa === mesaId ? { ...mesa, estado: 'libre' } : mesa
      )
    );
    setHoraReserva(''); // Limpiar la hora de reserva
  };

  // Eliminar un producto del pedido
  const handleEliminarProducto = (id) => {
    setPedidoTemporal((prevPedido) => {
      const nuevoPedido = prevPedido.filter((p) => p.id !== id);
      // Si el nuevo pedido está vacío, cambiar la mesa a "libre"
      if (nuevoPedido.length === 0 && mesaSeleccionada) {
        setMesas((prevMesas) =>
          prevMesas.map((mesa) =>
            mesa.id_mesa === mesaSeleccionada.id_mesa ? { ...mesa, estado: 'libre' } : mesa
          )
        );
      }
      return nuevoPedido;
    });
  };

  // Guardar el pedido en la mesa seleccionada
  const handleGuardarPedido = () => {
    setPedidos((prevPedidos) => ({
      ...prevPedidos,
      [mesaSeleccionada.id_mesa]: pedidoTemporal,
    })); // Limpiar pedido temporal

    // Cambiar el estado de la mesa a "libre" si no hay productos en el pedido
    if (pedidoTemporal.length === 0 && mesaSeleccionada) {
      setMesas((prevMesas) =>
        prevMesas.map((mesa) =>
          mesa.id_mesa === mesaSeleccionada.id_mesa ? { ...mesa, estado: 'libre' } : mesa
        )
      );
    }
  };

  // Calcular el total del pedido
  const calcularTotalPedido = (productos) => {
    return productos.reduce((acc, producto) => acc + producto.price * producto.cantidad, 0);
  };

    return (
      <div className="flex h-screen">
        {/* Lado Izquierdo: Cuadros de Mesas */}
        <div className="mesas-container">
          <h2 className="title">Mesas</h2>
          <div className="grid grid-cols-4 gap-4">
            {mesas.map((mesa) => (
              <div
                key={mesa.id_mesa}
                onClick={() => handleMesaClick(mesa)}
                className={`mesa ${
                  mesa.estado === 'libre'
                    ? 'mesa-libre'
                    : mesa.estado === 'ocupada'
                    ? 'mesa-ocupada'
                    : 'mesa-reservada'
                }`}
              >
                <h3>Mesa {mesa.numero_mesa}</h3>
                <p>{mesa.estado.charAt(0).toUpperCase() + mesa.estado.slice(1)}</p>
                {mesa.estado === 'reservada' && horaReserva && (
                  <p>Reservada para las {horaReserva}</p>
                )}
                {/* Opciones de reserva */}
                {mesa.estado === 'libre' && (
                  <div>
                    <input
                      type="time"
                      value={horaSeleccionada}
                      onChange={(e) => setHoraSeleccionada(e.target.value)}
                      className="time-input"
                    />
                    <button
                      onClick={() => handleConfirmarHoraReserva(mesa.id_mesa)}
                      className="btn-reservar"
                    >
                      Reservar
                    </button>
                  </div>
                )}
                {mesa.estado === 'reservada' && (
                  <button
                    onClick={() => handleCancelarReserva(mesa.id_mesa)}
                    className="btn-cancelar"
                  >
                    Cancelar Reserva
                  </button>
                )}
              </div>
            ))}
          </div>
          <CrearMesa />
        </div>
        <div className="divider"></div>
        {/* Lado Derecho: Detalle del Pedido */}
        <div className="pedidos-container">
          {mesaSeleccionada ? (
            <div>
              <h2 className="title">Mesa {mesaSeleccionada.numero_mesa} - Pedido</h2>
  
              {/* Input para buscar productos */}
              <input
                type="text"
                placeholder="Buscar producto"
                value={busquedaProducto}
                onChange={handleBuscarProducto}
                className="search-input"
              />
  
              {/* Mostrar productos filtrados si hay búsqueda */}
              {productosFiltrados.length > 0 && (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Precio</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosFiltrados.map((producto) => (
                      <tr key={producto.id}>
                        <td>{producto.name}</td>
                        <td>{producto.price}</td>
                        <td>
                          <button
                            onClick={() => handleAgregarProducto(producto)}
                            className="btn-agregar"
                          >
                            Agregar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
  
              <h3 className="mt-4 text-xl">Pedido Actual</h3>
              {pedidoTemporal.length > 0 ? (
                <table className="table mt-2">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio</th>
                      <th>Total</th>
                      <th>Eliminar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidoTemporal.map((producto) => (
                      <tr key={producto.id}>
                        <td>{producto.name}</td>
                        <td>
                          <input
                            type="number"
                            value={producto.cantidad}
                            min="1"
                            onChange={(e) => handleEditarCantidad(producto.id, parseInt(e.target.value))}
                            className="cantidad-input"
                          />
                        </td>
                        <td>${producto.price}</td>
                        <td>${(producto.price * producto.cantidad).toFixed(2)}</td>
                        <td>
                          <button
                            onClick={() => handleEliminarProducto(producto.id)}
                            className="btn-eliminar"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <h4 className="font-bold mt-2">Total: ${calcularTotalPedido(pedidoTemporal)}</h4>
                </table>
              ) : (
                <p>No hay productos en el pedido.</p>
              )}
  
              <button
                onClick={handleGuardarPedido}
                className="btn-guardar"
              >
                Guardar Pedido
              </button>
            </div>
          ) : (
            <p>Selecciona una mesa para ver los detalles del pedido.</p>
          )}
        </div>
      </div>
    );
  };
  
  export default DashboardMesas;

