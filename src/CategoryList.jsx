import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaBackward } from 'react-icons/fa';
import Header from './Header';
import CategoryModal from './CategoryModal';
import { toast } from 'react-toastify';
import './ClienteList.css'

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Para la paginación
  const [itemsPerPage] = useState(10); // Productos por página
  const [searchTerm, setSearchTerm] = useState(''); // Para la barra de búsqueda
  const [editableCategory, setEditableCategory] = useState(null); // Producto editable
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // Para mostrar éxito
  const [showErrorModal, setShowErrorModal] = useState(false); // Para mostrar error
  const [error, setError] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const navigate = useNavigate();  // Inicializa useNavigate

  // Función para manejar el click del botón "Nuevo"
  const handleNewProduct = () => {
    navigate('/crear-producto');  // Redirige al componente Product
  };
 
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/all-categories'); // Cambia esta URL a la correcta
        setCategories(response.data);
      } catch (error) {
        console.error('Error al obtener las categorías:', error);
      }
    };
    useEffect(() => {
    fetchCategories();
  }, []);


  // Función para abrir el modal de edición y establecer el producto editable
  const handleEditCategoryClick = (categoria) => {
    setEditableCategory(categoria); // Establece el producto que se quiere editar
    setShowEditCategoryModal(true); // Abre el modal
  };

  // Función para guardar los cambios
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    
    try {
      // Envía la actualización al servidor
      const response = await fetch(`/api/update-categories/${editableCategory.id}`, {
        method: 'PUT', // O POST si estás creando un producto nuevo
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editableCategory),
      });
      fetchCategories();
      // Verifica si el servidor retornó un 204 No Content
      if (response.status === 204) {
        fetchCategories();
        console.log('Categoria actualizado correctamente');
        toast.error("Categoria NO Actualizada Correctamente!")
         // Muestra modal de éxito
         
      } else {
        // Si no es 204, entonces intenta parsear el JSON
        const result = await response.json();
        fetchCategories();
        console.log('Categoria actualizado:', result);
        toast.success("Categoria Actualizada Correctamente!")
         // Muestra modal de error
      }
  
      setShowEditCategoryModal(false); // Cierra el modal después de guardar
    } catch (error) {
      toast.error('Error al guardar los cambios');
      toast.error("Categoria NO Actualizada Correctamente!")
    }
  };
  const toggleCategoryStatus = async (category) => {
    const newId = category.id > 0 ? -category.id : Math.abs(category.id);
    try {
      await axios.put(`/api/disabled-categories/${category.id}`, {}); 
      setCategories((prevCategories) =>
        prevCategories.map((c) =>
          c.id === category.id ? { ...c, id: newId } : c
        )
      );
      toast.success('Estado de la categoria actualizado!')
      console.log('Estado de la categoria actualizado');
    } catch (error) {
      toast.error('Error al actualizar el estado de la categoria!');
      if (error.response && error.response.status === 403) {
        toast.error('No tienes permisos');
      }
    }
  };
  const handleAddCategory = async (category) => {
    try {
      const response = await fetch('/api/new-category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
      });
      if (response.ok) {
        toast.success("Categoría guardada exitosamente!");
        setShowCategoryModal(false);
        fetchCategories();
      } else {
        const result = await response.text(); // Cambiado a .text() para obtener el mensaje de error
        toast.error(result); // Mostrar el error con Toastify
      }
    } catch (error) {
      toast.error('Error al guardar la categoría');
    }
};


  // Función para cerrar los modales
  const handleCloseModals = () => {
    setShowEditCategoryModal(false); // Cierra el modal de edición
    setShowSuccessModal(false); // Cierra el modal de éxito
    setShowErrorModal(false); // Cierra el modal de error
  };

  // Filtrar productos según el término de búsqueda
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular los productos a mostrar en la página actual
  const indexOfLastCategory = currentPage * itemsPerPage;
  const indexOfFirstCategory = indexOfLastCategory - itemsPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstCategory, indexOfLastCategory);

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
                    <button className="new-button" onClick={() => setShowCategoryModal(true)}>
                    <FaPlus /> Nuevo
                    </button>
                    <input
                    type="text"
                    placeholder="Buscar categoria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-bar"
                    />
                </div>
            </div>
            <CategoryModal
                isOpen={showCategoryModal}
                onClose={() => setShowCategoryModal(false)}
                onSave={handleAddCategory}
            />
            <table className="product-table">
                <thead>
                <tr>
                    <th>Id</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                {currentCategories.map((category) => (
                    <tr key={category.id} className={category.id < 0 ? 'inhabilitado' : ''}>
                    <td>{category.id}</td>
                    <td>{category.name}</td>
                    <td>{category.description}</td>
                    <td>

                        {/* Botón para editar el producto */}
                        <div className='button-group'>
                        <button
                        className='edit-button'
                        onClick={() => handleEditCategoryClick(category)}
                        disabled={category.id < 0} // Deshabilitar si el producto está inhabilitado
                        >
                        <FaEdit />Editar
                        </button>

                    {/* Botón para habilitar o inhabilitar el producto */}
                    <button
                    className={category.id > 0 ? 'habilitado-button' : 'inhabilitado-button'}
                    onClick={() => toggleCategoryStatus(category)}
                    >
                    {category.id > 0 ? 'Inhabilitar' : 'Habilitar'}
                    </button>
                    </div>
                </td>
                </tr>
            ))}
            </tbody>

            </table>

            {/* Paginación */}
            <div className="pagination">
                {[...Array(Math.ceil(filteredCategories.length / itemsPerPage)).keys()].map(number => (
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
              <p>La Categoria se actualizó correctamente.</p>
              <button type="button" className="button-close" onClick={handleCloseModals}>Cerrar</button>
            </div>
          </div>
        )}

        {/* Modal para mostrar error */}
        {showErrorModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Error</h2>
              <p>No se pudo actualizar la categoria. Por favor, intente nuevamente.</p>
              <button type="button" className="button-close" onClick={handleCloseModals}>Cerrar</button>
            </div>
          </div>
        )}
        {/* Modal para editar la información del producto */}
        {showEditCategoryModal && (
        <div className="modal-overlay">
            <div className="modal-content">
            <button className="modal-close" onClick={handleCloseModals}>×</button>
            <h2>Editar Categoria</h2>
            {editableCategory ? (
                <div className="product-info">
                <form onSubmit={handleSaveChanges}>
                    <label>
                      <input
                        type="number"
                        value={editableCategory.id}
                        readOnly // El id no debería ser editable
                        className="form-input"
                      />
                      <span className="label-above">Id:</span>
                    </label>
                    <label>
                    <input
                        type="text"
                        value={editableCategory.name}
                        onChange={(e) =>
                        setEditableCategory({ ...editableCategory, name: e.target.value })
                        }
                        className="form-input"
                    />
                    <span className="label-above">Nombre:</span>
                    </label>
                    <label>
                    <input
                        type="text"
                        value={editableCategory.description}
                        onChange={(e) =>
                        setEditableCategory({ ...editableCategory, description: e.target.value })
                        }
                        className="form-input"
                    />
                    <span className="label-above">Descripcion:</span>
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

export default CategoryList;
