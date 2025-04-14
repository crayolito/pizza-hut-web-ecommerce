class AuxiliaresGlobal {
  static agregarCarrito(valor) {
    // Verificar que el valor sea un número válido mayor a 0
    if (typeof valor === 'number' && valor > 0) {
      const contenedorPadre = document.querySelector('.h-ic-cantidad');
      const mensaje = document.querySelector('.hicc-mensaje');
      
      // Verificar que los elementos existan
      if (mensaje && contenedorPadre) {
        // Obtener el valor actual (si existe)
        let valorActual = 0;
        if (mensaje.textContent.trim() !== '') {
          valorActual = parseInt(mensaje.textContent, 10) || 0;
        }
        
        // Sumar el nuevo valor al actual
        const nuevoValor = valorActual + valor;
        
        // Actualizar el texto con el nuevo valor
        mensaje.textContent = nuevoValor;
        
        // Quitar clases existentes de tamaños de dígitos
        mensaje.classList.remove('digitos-2', 'digitos-3');
        
        // Convertir el valor a string para verificar su longitud
        const valorStr = nuevoValor.toString();
        
        // Añadir clase según número de dígitos
        if (valorStr.length === 2) {
          mensaje.classList.add('digitos-2');
        } else if (valorStr.length >= 3) {
          mensaje.classList.add('digitos-3');
        }
      }
    }
  }
      
    static limpiarCarrito(){}
    static eliminarCarrito(){}
}