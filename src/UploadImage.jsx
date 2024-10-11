import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // Si tienes estilos personalizados

const UploadImage = ({onUpload}) => {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!image) {
      alert('Por favor selecciona una imagen');
      return;
    }

    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

       // Guardar la URL de la imagen
       const uploadedImageUrl = response.data.imageUrl;
       setImageUrl(uploadedImageUrl);
 
       // Llamar a la función 'onUpload' para pasar la URL de la imagen al componente padre
       if (onUpload) {
         onUpload(uploadedImageUrl);  // Aquí se pasa la URL al componente Product
       }
    
    } catch (error) {
      console.error('Error al cargar la imagen', error);
    }
  };

  return (
    <div className="upload-container">
     <div className="form-group">
          <label>Subir Imagen</label>
          <input
            type="file"
            onChange={handleImageChange}
            style={{ marginBottom: '10px' }}
          />
        </div>
      <button onClick={handleUpload} className='form-button' >Subir Imagen</button>

    </div>
  );
};

export default UploadImage;

