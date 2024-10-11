import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaBackward } from 'react-icons/fa';
import Header from './Header';
import ClientModal from './ClientModal';
import './ProductList.css'
import { toast } from 'react-toastify';

const ClientList = () => {
  const [clientes, setClientes] = useState([]); // Guardará los usuarios
  const [currentPage, setCurrentPage] = useState(1); // Para la paginación
  const [itemsPerPage] = useState(10); // Productos por página
  const [searchTerm, setSearchTerm] = useState(''); // Para la barra de búsqueda
  const [editableCliente, setEditableCliente] = useState(null); // Producto editable
  const [showEditClienteModal, setShowEditClienteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // Para mostrar éxito
  const [showErrorModal, setShowErrorModal] = useState(false); // Para mostrar error
  const [error, setError] = useState('');
  const [showClienteModal, setShowClienteModal] = useState(false);
  const navigate = useNavigate();  // Inicializa useNavigate

  // Función para manejar el click del botón "Nuevo"
  const handleNewProduct = () => {
    navigate('/usuarios');  // Redirige al componente
  };
  

   const fetchClientes = async () => {
    try {
      const response = await fetch('/api/all-customers');
      const data = await response.json();
      console.log(data); // Verificar los datos que recibes
      setClientes(data);
    } catch (error) {
      toast.error('Error al obtener los clientes:', error);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  // Función para abrir el modal de edición y establecer el producto editable
  const handleEditClienteClick = (cliente) => {
    setEditableCliente(cliente); // Establece el producto que se quiere editar
    setShowEditClienteModal(true); // Abre el modal
  };

  // Función para guardar los cambios
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    
    try {
      // Envía la actualización al servidor
      const response = await fetch(`/api/update-customers/${editableCliente.id}`, {
        method: 'PUT', // O POST si estás creando un producto nuevo
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editableCliente),
      });
      fetchClientes();
      // Verifica si el servidor retornó un 204 No Content
      if (response.status === 204) {
        fetchClientes();
        console.log('Cliente actualizado correctamente');
        toast.error('No se Actualizo El Cliente!')
         // Muestra modal de éxito
         
      } else {
        // Si no es 204, entonces intenta parsear el JSON
        const result = await response.json();
        fetchClientes();
        console.log('Cliente actualizado:', result);
        toast.success('Cliente Actualizado Correctamente!')
      }
  
      setShowEditClienteModal(false); // Cierra el modal después de guardar
    } catch (error) {
      toast.error('Error al guardar los cambios:', error);
      toast.error("No se Pudo Actualizar El Cliente")
    }
  };
  const toggleClienteStatus = async (cliente) => {
    const newId = cliente.id > 0 ? -cliente.id : Math.abs(cliente.id);
    try {
      await axios.put(`/api/disabled-customers/${cliente.id}`, {}); // Pasar el ID original
      setClientes((prevClientes) =>
        prevClientes.map((c) =>
          c.id === cliente.id ? { ...c, id: newId } : c
        )
      );
      console.log('Estado del cliente actualizado');
      toast.success('Estado del Cliente Actualizado!')
    } catch (error) {
      toast.error('Error al actualizar el estado del cliente, no tienes permisos:', error);
      if (error.response && error.response.status === 403) {
        toast.error('No tienes permisos');
      }
    }
  };
  const handleAddClient = async (cliente) => {
    const { email } = cliente;

    // Validar la estructura del email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expresión regular para validar el email
    if (!emailRegex.test(email)) {
        toast.error('El email no tiene un formato válido.');
        return; // Salir de la función si el email no es válido
    }

    try {
        const response = await fetch('/api/new-client', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cliente),
        });

        if (response.ok) {
            toast.success("Cliente guardado exitosamente!");
            setShowClienteModal(false);
            fetchClientes();
        } else {
            const errorMessage = await response.text();
            toast.error(`Error: ${errorMessage}`);
        }
    } catch (error) {
        toast.error(`Error al guardar el cliente: ${error.message}`);
    }
}
  // Función para cerrar los modales
  const handleCloseModals = () => {
    setShowEditClienteModal(false); // Cierra el modal de edición
    setShowSuccessModal(false); // Cierra el modal de éxito
    setShowErrorModal(false); // Cierra el modal de error
  };

  // Filtrar productos según el término de búsqueda
  const filteredClientes = clientes.filter(cliente =>
    cliente.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  

  // Calcular los productos a mostrar en la página actual
  const indexOfLastCliente = currentPage * itemsPerPage;
  const indexOfFirstCliente = indexOfLastCliente - itemsPerPage;
  const currentClientes = filteredClientes.slice(indexOfFirstCliente, indexOfLastCliente);

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
                    <button className="new-button" onClick={() => setShowClienteModal(true)}>
                    <FaPlus /> Nuevo
                    </button>
                    <input
                    type="text"
                    placeholder="Buscar cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-bar"
                    />
                </div>
            </div>
            <ClientModal
                isOpen={showClienteModal}
                onClose={() => setShowClienteModal(false)}
                onSave={handleAddClient}
            />
            <table className="product-table">
                <thead>
                <tr>
                    <th>Id</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Cedula</th>
                    <th>Direccion</th>
                    <th>Telefono</th>
                    <th>Correo</th>
                    <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                {currentClientes.map((cliente) => (
                    <tr key={cliente.id} className={cliente.id < 0 ? 'inhabilitado' : ''}>
                    <td>{cliente.id}</td>
                    <td>{cliente.name}</td>
                    <td>{cliente.surname}</td>
                    <td>{cliente.dni}</td>
                    <td>{cliente.address}</td>
                    <td>{cliente.phone}</td>
                    <td>{cliente.email}</td>
                    <td>
                        {/* Botón para editar el usuario */}
                        <div className='button-group'>
                          <button
                          className='edit-button'
                          onClick={() => handleEditClienteClick(cliente)}
                          disabled={cliente.id < 0} // Deshabilitar si el usuario está inhabilitado
                          >
                          <FaEdit />Editar
                          </button>

                          {/* Botón para habilitar o inhabilitar el usuario */}
                          <button
                          className={cliente.id > 0 ? 'habilitado-button' : 'inhabilitado-button'}
                          onClick={() => toggleClienteStatus(cliente)}
                          >
                          {cliente.id > 0 ? 'Inhabilitar' : 'Habilitar'}
                          </button>
                        </div> 
                    </td>
                    </tr>
                ))}
                </tbody>

            </table>

            {/* Paginación */}
            <div className="pagination">
                {[...Array(Math.ceil(filteredClientes.length / itemsPerPage)).keys()].map(number => (
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
              <p>El cliente se guardó correctamente.</p>
              <button type="button" className="button-close" onClick={handleCloseModals}>Cerrar</button>
            </div>
          </div>
        )}

        {/* Modal para mostrar error */}
        {showErrorModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Error</h2>
              <p>No se pudo guardar el cliente. Por favor, intente nuevamente.</p>
              <button type="button" className="button-close" onClick={handleCloseModals}>Cerrar</button>
            </div>
          </div>
        )}
        {/* Modal para editar la información del producto */}
        {showEditClienteModal && (
        <div className="modal-overlay">
            <div className="modal-content">
            <button className="modal-close" onClick={handleCloseModals}>×</button>
            <h2>Editar Cliente</h2>
            {editableCliente ? (
                <div className="product-info">
                <form onSubmit={handleSaveChanges}>
                    <label>
                      <input
                        type="number"
                        value={editableCliente.id}
                        readOnly // El id no debería ser editable
                        className="form-input"
                      />
                      <span className="label-above">Id:</span>
                    </label>
                    <label>
                    <input
                        type="text"
                        value={editableCliente.name || ''}
                        onChange={(e) =>
                        setEditableCliente({ ...editableCliente, name: e.target.value })
                        }
                        className="form-input"
                    />
                    <span className="label-above">Nombre:</span>
                    </label>
                    <label>
                    <input
                        type="text"
                        value={editableCliente.surname || ''}
                        onChange={(e) =>
                        setEditableCliente({ ...editableCliente, surname: e.target.value })
                        }
                        className="form-input"
                    />
                    <span className="label-above">Apellido:</span>
                    </label>
                    <label>
                    <input
                        type="text"
                        value={editableCliente.dni || ''}
                        onChange={(e) =>
                        setEditableCliente({ ...editableCliente, dni: e.target.value })
                        }
                        className="form-input"
                    />
                    <span className="label-above">Cedula:</span>
                    </label>
                    <label>
                    <input
                        type="text"
                        value={editableCliente.address || ''}
                        onChange={(e) =>
                        setEditableCliente({ ...editableCliente, address: e.target.value })
                        }
                        className="form-input"
                    />
                    <span className="label-above">Direccion:</span>
                    </label>
                    <label>
                    <input
                        type="text"
                        value={editableCliente.phone || ''}
                        onChange={(e) =>
                        setEditableCliente({ ...editableCliente, phone: e.target.value })
                        }
                        className="form-input"
                    />
                    <span className="label-above">Celular:</span>
                    </label>
                    <label>
                    <input
                        type="text"
                        value={editableCliente.email || ''}
                        onChange={(e) =>
                        setEditableCliente({ ...editableCliente, email: e.target.value })
                        }
                        className="form-input"
                    />
                    <span className="label-above">Correo:</span>
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
                <p>No se encontró el cliente</p>
            )}
            </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;