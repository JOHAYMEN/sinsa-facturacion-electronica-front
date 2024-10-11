export const formatPrice = (price) => {
    // Asegúrate de que price sea un string para trabajar con los separadores correctamente
    const priceString = price.toString();

    // No eliminamos los puntos ni las comas, ya que se respetará el formato
    return priceString;
};

