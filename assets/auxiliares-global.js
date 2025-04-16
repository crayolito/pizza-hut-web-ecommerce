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

        // Mostrar mensaje de éxito después de actualizar el carrito
        this.mensajeExitoCarrito();
      }
    }
  }
  static limpiarCarrito(){}
  static eliminarCarrito(){}

  static mensajeExitoCarrito() {
    const mensajeExito = document.getElementById('ph-mec');
    
    // Si ya está mostrando un mensaje, no hacer nada
    if (mensajeExito && !mensajeExito.classList.contains('ph-mec-visible')) {
      // Agregar clase para mostrar el mensaje
      mensajeExito.classList.add('ph-mec-visible');
      
      // Remover la clase después de 3 segundos
      setTimeout(() => {
        mensajeExito.classList.remove('ph-mec-visible');
      }, 3000);
    }
  }

  static obtenerDireccionDesdeCoordenadas (lat,lng){
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();
      const latlng = {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      };
      
      geocoder.geocode({ 
        location: latlng,
        language: 'es' // Resultados en español
      }, (results, status) => {
        if (status === "OK" && results && results.length > 0) {
          // Intentar extraer la información más útil para delivery
          let direccionFinal = "";
          let calleEncontrada = false;
          
          // Primero buscar el resultado que tenga más detalles de calle
          for (const result of results) {
            // Verificar si este resultado tiene componentes de dirección útiles
            const tieneRuta = result.address_components.some(comp => 
              comp.types.includes('route') || comp.types.includes('street_address'));
            
            if (tieneRuta) {
              direccionFinal = result.formatted_address;
              calleEncontrada = true;
              break;
            }
          }
          
          // Si no se encontró información de calle, usar la dirección más detallada disponible
          if (!calleEncontrada) {
            direccionFinal = results[0].formatted_address;
          }
          
          // Eliminar el código plus (si existe) de la dirección final
          direccionFinal = direccionFinal.replace(/\b[0-9A-Z]{4}\+[0-9A-Z]{2,3}\b,?/g, '').trim();
          
          // Eliminar el país si está al final para hacerlo más conciso
          const paisRegex = /, Bolivia$/;
          if (paisRegex.test(direccionFinal)) {
            direccionFinal = direccionFinal.replace(paisRegex, '');
          }
          
          resolve(direccionFinal || "Dirección no disponible");
        } else {
          reject("No se pudo obtener una dirección detallada: " + status);
        }
      });
    });
  }

  static mensajeError(){}
  static mensajeExito(){}
  static mensajeAlerta(){}
  static mensajeInformacion(){}

  // Metodo para capturar la cantidad 
}

class CantidadInput extends HTMLElement {
  constructor() {
    super();
    this.iconos
    
    this.cantidadEtiqueta = parseInt(this.querySelector('p').textContent) || 0;
    this.btn = this.querySelectorAll('button');
    this.contenedorGeneral = this.querySelector('div');
    this.baseTrabajo = null;
    this.min = null;
    this.max = null;
  }

  connectedCallback() {
    this.inicializarElemento();
    this.btn.forEach((boton) => {
      boton.addEventListener('click',this.manejarAccionBoton.bind(this,boton));
    });
  }

  inicializarElemento(){
    this.baseTrabajo = this.contenedorGeneral.getAttribute('origen-trabajo') || 'no-definido';
    this.min = this.contenedorGeneral.getAttribute('min') || 0;
    this.max = this.contenedorGeneral.getAttribute('max') || 100;
    this.idProducto = this.contenedorGeneral.getAttribute('id-producto') || 'no-definido';
    this.hadle = this.contenedorGeneral.getAttribute('handle') || 'no-definido';

    console.log('Base de trabajo:', this.baseTrabajo);
    if(this.baseTrabajo != 'carrito'){
      this.btn[1].classList.remove('elemento-oculto');
    }else{
      this.btn[0].classList.remove('elemento-oculto');
    }
   }

   manejarAccionBoton(boton){
    const accion = boton.getAttribute('accion');

    if(accion == 'incrementar'){
      if (this.cantidadEtiqueta >= this.max) {
        return;
      }
      this.cantidadEtiqueta++;
      this.querySelector('p').textContent = this.cantidadEtiqueta;
      if (this.cantidadEtiqueta >= 0  && this.baseTrabajo == 'carrito') {
        this.btn[0].classList.add('elemento-oculto');
        this.btn[1].classList.remove('elemento-oculto');
      }    
    }

    if(accion == 'decrementar'){
      if (this.cantidadEtiqueta <= this.min) {
        return;
      }
      this.cantidadEtiqueta--;
      this.querySelector('p').textContent = this.cantidadEtiqueta;
      console.log({
        cantidadEtiqueta: this.cantidadEtiqueta,
        baseTrabajo: this.baseTrabajo,
        accion: accion,
      })
      if (this.cantidadEtiqueta <= 0  && this.baseTrabajo == 'carrito') {
        this.btn[0].classList.remove('elemento-oculto');
        this.btn[1].classList.add('elemento-oculto');
      }
    }
  }
}

customElements.define('cantidad-input', CantidadInput);
