import React, { useEffect, useState, useContext, useRef} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { FaUsers, FaProductHunt, FaTag, FaDownload, FaUserCircle,  FaShoppingCart } from 'react-icons/fa';
import FaBars from './FaBars';
import axios from 'axios';
import './Header.css';

const Header = ({ onSearch, cartItemsCount, onCartClick }) => {
  
  const [establecimiento, setEstablecimiento] = useState(null);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [error, setError] = useState();
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  //const { logout } = useContext(AuthContext);
  
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    window.location.href = '/';
  };


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

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };
  const toggleMenu = () => {
    setMenuOpen(prevState => !prevState);
  };

  const handleClickOutside = (event) => {
    const menuContains = menuRef.current && menuRef.current.contains(event.target);
    const buttonContains = buttonRef.current && buttonRef.current.contains(event.target);
    
    if (!menuContains && !buttonContains) {
        setMenuOpen(false);
    }
};

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
 

  return (
    <header className="header">
      {/* Información del establecimiento */}
      <div className="header-title">
        {establecimiento ? (
          <div>
            <p>{establecimiento.name} ({establecimiento.company_type})</p>
            <p><strong>NIT:</strong> {establecimiento.nit}</p>
            <p><strong>Representante Legal:</strong> <span> {establecimiento.legal_representative} </span></p>
          </div>
        ) : (
          <h3>Sinsa-Ecommerce</h3>
        )}
      </div>

      {/* Contenido del Header */}
      <div className="header-content">
        {/* Barra de búsqueda */}
        <input
          type="text"
          placeholder="Buscar productos..."
          className="search-bar"
          value={searchQuery}
          onChange={handleSearchChange}
        />

        {/* Menú hamburguesa */}
      <div className="hamburger-menu">
      <FaBars
        className="hamburger-icon"
        onClick={toggleMenu}
        aria-label="Menu"
      />
      {menuOpen && (
        <div ref={menuRef} className="dropdown-menu">
          <Link to="/clientes" className="dropdown-item">
            <FaUsers className="icon" /> Clientes
          </Link>
          <Link to="/productos" className="dropdown-item">
            <FaProductHunt className="icon" /> Productos
          </Link>
          <Link to="/categorias" className="dropdown-item">
            <FaTag className="icon" /> Categorías
          </Link>
          {user && user.rol === 'Admin' && (
          <>
            <Link to="/usuarios" className="dropdown-item">
              <FaUsers className="icon" /> Usuarios
            </Link>
            <Link to="/ventas" className="dropdown-item">
              <FaDownload className="icon" /> Ventas
            </Link>
            <Link to="/reportes" className="dropdown-item">
              <FaDownload className="icon" /> Reportes
            </Link>
          </>
        )}
            </div>
          )}
        </div>
      </div>
      <div className="cart-icon" onClick={onCartClick}>
          <FaShoppingCart />
          {cartItemsCount > 0 && <span className="cart-count">{cartItemsCount}</span>}
        </div>
      {/* Icono de perfil con menú desplegable */}
      <div className="profile-container">
        <div className="profile-menu" onMouseEnter={() => setProfileMenuOpen(true)} onMouseLeave={() => setProfileMenuOpen(false)}>
          <FaUserCircle className="profile-icon" aria-label="Perfil" />
          {profileMenuOpen && (
            <div className="profile-dropdown">
              <p><strong>Usuario:</strong> Hola {user.username} !</p>
              <p><strong>Rol:</strong> {user.rol}</p>
              <button onClick={handleLogout} className="logout-button">
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>

      );
};

export default Header;




