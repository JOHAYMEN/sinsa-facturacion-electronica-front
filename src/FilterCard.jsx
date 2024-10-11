import React, { useState } from 'react';
import { FaAppleAlt, FaWineBottle, FaCookieBite, FaStar } from 'react-icons/fa';
import './FilterCard.css';

// Definir los iconos como un objeto para referencia
const ICONOS_CATEGORIAS = {
  2: <FaAppleAlt />, // ID para 'Viveres'
  3: <FaWineBottle />, // ID para 'Bebidas'
  4: <FaCookieBite />, // ID para 'Mekatos'
  5: <FaCookieBite />, // ID para 'Mekatos'
};

const FilterCard = ({ categoriaSeleccionada, onCategoriaSeleccionada, categorias, onShowFavorites }) => {
  const [hoveredCategoria, setHoveredCategoria] = useState(null);

  const manejarCambioCategoria = (id) => {
    onCategoriaSeleccionada(id);
  };

  const manejarMostrarFavoritos = () => {
    onShowFavorites();
  };

  const manejarMouseEnter = (categoria) => {
    setHoveredCategoria(categoria);
  };

  const manejarMouseLeave = () => {
    setHoveredCategoria(null);
  };

  return (
    <div className="contenedor-filtro">
      <div className="seccion-filtro">
        <div className="titulo-filtro-con-favoritos">
          <h3 className="titulo-seccion-filtro">Categorías</h3>
          <button className="favoritos-boton" onClick={manejarMostrarFavoritos}>
            <FaStar className="icono-favorito" />
          </button>
        </div>
        <div className="categorias-container">
          {/* Filtrar categorías con ID positivo antes de mapearlas */}
          {categorias
            .filter(categoria => categoria.id > 0)
            .map((categoria) => (
              <button
                key={categoria.id}
                className={`categoria-boton ${categoria.id === categoriaSeleccionada ? 'seleccionada' : ''}`}
                onClick={() => manejarCambioCategoria(categoria.id)}
                onMouseEnter={() => manejarMouseEnter(categoria)} // Al pasar el mouse sobre la categoría
                onMouseLeave={manejarMouseLeave} // Cuando el mouse se va
              >
                {ICONOS_CATEGORIAS[categoria.id] || null}
                <span>{categoria.name}</span>
                {/* Mostrar la descripción si la categoría está en hover */}
                {hoveredCategoria?.id === categoria.id && (
                  <div className="tooltip">{hoveredCategoria.name}</div>
                )}
              </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterCard;





