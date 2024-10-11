import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaBackward } from 'react-icons/fa';
import Header from './Header';
import UserModal from './UserModal';
import { toast } from 'react-toastify';
import './ClienteList.css';
import './ProductList.css';


const UserList = () => {
  const [usuarios, setUsuarios] = useState([]); // Guardará los usuarios
  const [currentPage, setCurrentPage] = useState(1); // Para la paginación
  const [itemsPerPage] = useState(10); // Productos por página
  const [searchTerm, setSearchTerm] = useState(''); // Para la barra de búsqueda
  const [editableUsuario, setEditableUsuario] = useState(null); // Producto editable
  const [showEditUsuarioModal, setShowEditUsuarioModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // Para mostrar éxito
  const [showErrorModal, setShowErrorModal] = useState(false); // Para mostrar error
  const [error, setError] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const navigate = useNavigate();  // Inicializa useNavigate

  // Función para manejar el click del botón "Nuevo"
  const handleNewProduct = () => {
    navigate('/usuarios');  // Redirige al componente
  };
  

   const fetchUsuarios = async () => {
    try {
      const response = await fetch('/api/all-users');
      const data = await response.json();
      console.log(data); // Verificar los datos que recibes
      setUsuarios(data);
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Función para abrir el modal de edición y establecer el producto editable
  const handleEditUsuarioClick = (usuario) => {
    setEditableUsuario(usuario); // Establece el producto que se quiere editar
    setShowEditUsuarioModal(true); // Abre el modal
  };

  // Función para guardar los cambios
  const handleSaveChanges = async (e) => {
    e.preventDefault();

    // Validación del formato del correo electrónico
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expresión regular para el formato de email
    if (!emailPattern.test(editableUsuario.email)) {
        toast.error('El formato del correo electrónico no es válido.');
        return; // Detiene la ejecución si el formato es inválido
    }

    try {
      // Envía la actualización al servidor
      const response = await fetch(`/api/update-users/${editableUsuario.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editableUsuario),
      });

      // Verifica si el servidor retornó un 204 No Content
      if (response.ok) {
        // Si es 204 No Content, se considera que la actualización fue exitosa
        toast.success('Usuario actualizado correctamente');
      } else {
        // Si no es 204, intenta parsear el JSON
        const result = await response.json();
        console.log('Usuario actualizado:', result);
        toast.error(result.message || 'Error al actualizar el usuario'); // Muestra el mensaje de error
      }

      setShowEditUsuarioModal(false); // Cierra el modal después de guardar
      fetchUsuarios(); // Refresca la lista de usuarios
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      toast.error('Error al guardar los cambios: ' + error.message); // Muestra error en Toastify
    }
};
  const toggleUsuarioStatus = async (usuario) => {
    const newId = usuario.id > 0 ? -usuario.id : Math.abs(usuario.id);
    try {
      await axios.put(`/api/disabled-users/${usuario.id}`, {}); // Pasar el ID original
      setUsuarios((prevUsuarios) =>
        prevUsuarios.map((u) =>
          u.id === usuario.id ? { ...u, id: newId } : u
        )
      );
      console.log('Estado del usuario actualizado');
      toast.success('Estado del usuario actualizado')
    } catch (error) {
      toast.error('Error al actualizar el estado del usuario');
      if (error.response && error.response.status === 403) {
        toast.error("No tienes permisos")
      }
    }
  };
  const handleAddUser = async (usuario) => {
    try {
        const response = await fetch('/api/new-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(usuario),
        });

        if (response.ok) {
            toast.success("Usuario creado exitosamente!");
            setShowUserModal(false);
            fetchUsuarios();
        } else {
            const result = await response.json();
            toast.error(result.message || 'No se pudo guardar el usuario');
        }
    } catch (error) {
        console.error('Error al guardar el usuario:', error);
        toast.error('Error al guardar el usuario, intenta nuevamente');
    }
};


  // Función para cerrar los modales
  const handleCloseModals = () => {
    setShowEditUsuarioModal(false); // Cierra el modal de edición
    setShowSuccessModal(false); // Cierra el modal de éxito
    setShowErrorModal(false); // Cierra el modal de error
  };

  // Filtrar productos según el término de búsqueda
  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    usuario.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  

  // Calcular los productos a mostrar en la página actual
  const indexOfLastUsuario = currentPage * itemsPerPage;
  const indexOfFirstUsuario = indexOfLastUsuario - itemsPerPage;
  const currentUsuarios = filteredUsuarios.slice(indexOfFirstUsuario, indexOfLastUsuario);

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
                    <button className="new-button" onClick={() => setShowUserModal(true)}>
                    <FaPlus /> Nuevo
                    </button>
                    <input
                    type="text"
                    placeholder="Buscar usuario..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-bar"
                    />
                </div>
            </div>
            <UserModal
                isOpen={showUserModal}
                onClose={() => setShowUserModal(false)}
                onSave={handleAddUser}
            />
            <table className="product-table">
                <thead>
                <tr>
                    <th>Id</th>
                    <th>Usuario</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Correo</th>
                    <th>Telefono</th>
                    <th>Direccion</th>
                    <th>Rol</th>
                    <th>Establecimiento</th>
                    <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                {currentUsuarios.map((usuario) => (
                    <tr key={usuario.id} className={usuario.id < 0 ? 'inhabilitado' : ''}>
                    <td>{usuario.id}</td>
                    <td>{usuario.username}</td>
                    <td>{usuario.name}</td>
                    <td>{usuario.lastname}</td>
                    <td>{usuario.email}</td>
                    <td>{usuario.phone}</td>
                    <td>{usuario.address}</td>
                    <td>{usuario.rol}</td>
                    <td>{usuario.establecimiento_id}</td>
                    <td>
                        {/* Botón para editar el usuario */}
                        <div className='button-group'>
                        <button
                        className='edit-button'
                        onClick={() => handleEditUsuarioClick(usuario)}
                        disabled={usuario.id < 0} // Deshabilitar si el usuario está inhabilitado
                        >
                        <FaEdit />Editar
                        </button>

                        {/* Botón para habilitar o inhabilitar el usuario */}
                        <button
                        className={usuario.id > 0 ? 'habilitado-button' : 'inhabilitado-button'}
                        onClick={() => toggleUsuarioStatus(usuario)}
                        >
                        {usuario.id > 0 ? 'Inhabilitar' : 'Habilitar'}
                        </button>
                        </div>
                    </td>
                    </tr>
                ))}
                </tbody>

            </table>

            {/* Paginación */}
            <div className="pagination">
                {[...Array(Math.ceil(filteredUsuarios.length / itemsPerPage)).keys()].map(number => (
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
              <p>El usuario se guardó correctamente.</p>
              <button type="button" className="button-close" onClick={handleCloseModals}>Cerrar</button>
            </div>
          </div>
        )}

        {/* Modal para mostrar error */}
        {showErrorModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Error</h2>
              <p>No se pudo guardar el usuario. Por favor, intente nuevamente.</p>
              <button type="button" className="button-close" onClick={handleCloseModals}>Cerrar</button>
            </div>
          </div>
        )}
        {/* Modal para editar la información del producto */}
        {showEditUsuarioModal && (
        <div className="modal-overlay">
            <div className="modal-content">
            <button className="modal-close" onClick={handleCloseModals}>×</button>
            <h2>Editar Usuario</h2>
            {editableUsuario ? (
                <div className="product-info">
                <form onSubmit={handleSaveChanges}>
                    <label>
                      <input
                        type="number"
                        value={editableUsuario.id}
                        readOnly // El id no debería ser editable
                        className="form-input"
                      />
                      <span className="label-above">Id:</span>
                    </label>
                    <label>
                    <input
                        type="text"
                        value={editableUsuario.username || ''}
                        onChange={(e) =>
                        setEditableUsuario({ ...editableUsuario, username: e.target.value })
                        }
                        className="form-input"
                    />
                    <span className="label-above">Usuario:</span>
                    </label>
                    <label>
                    <input
                        type="text"
                        value={editableUsuario.name || ''}
                        onChange={(e) =>
                        setEditableUsuario({ ...editableUsuario, name: e.target.value })
                        }
                        className="form-input"
                    />
                    <span className="label-above">Nombre:</span>
                    </label>
                    <label>
                    <input
                        type="text"
                        value={editableUsuario.lastname || ''}
                        onChange={(e) =>
                        setEditableUsuario({ ...editableUsuario, lastname: e.target.value })
                        }
                        className="form-input"
                    />
                    <span className="label-above">Apellido:</span>
                    </label>
                    <label>
                    <input
                        type="text"
                        value={editableUsuario.email || ''}
                        onChange={(e) =>
                        setEditableUsuario({ ...editableUsuario, email: e.target.value })
                        }
                        className="form-input"
                    />
                    <span className="label-above">Correo:</span>
                    </label>
                    <label>
                    <input
                        type="text"
                        value={editableUsuario.phone || ''}
                        onChange={(e) =>
                        setEditableUsuario({ ...editableUsuario, phone: e.target.value })
                        }
                        className="form-input"
                    />
                    <span className="label-above">Celular:</span>
                    </label>
                    <label>
                    <input
                        type="text"
                        value={editableUsuario.address || ''}
                        onChange={(e) =>
                        setEditableUsuario({ ...editableUsuario, address: e.target.value })
                        }
                        className="form-input"
                    />
                    <span className="label-above">Direccion:</span>
                    </label>
                    <label>
                    <input
                        type="text"
                        value={editableUsuario.rol || ''}
                        onChange={(e) =>
                        setEditableUsuario({ ...editableUsuario, rol: e.target.value })
                        }
                        className="form-input"
                    />
                    <span className="label-above">Rol:</span>
                    </label>
                   {/* <label>
                    Establecimiento:
                    <input
                        type="text"
                        value={editableUsuario.establecimiento_id || ''}
                        onChange={(e) =>
                        setEditableUsuario({ ...editableUsuario, establecimiento_id: e.target.value })
                        }
                        className="form-input"
                    />
                    </label>*/}                    
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
                <p>No se encontró el usuario</p>
            )}
            </div>
  </div>
)}

    </div>
  );
};

export default UserList;