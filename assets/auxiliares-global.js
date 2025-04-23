
class AuxiliaresGlobal {
  /**
   * Muestra un mensaje de éxito para el carrito
    */
  static mensajeExitoCarrito() {
    MensajeTemporal.mostrarMensaje('Se añadió tu orden al carrito con éxito.', 'exito');
  }

  /**
   * Muestra un mensaje de error
    * @param {string} mensaje - Mensaje de error a mostrar
    */
  static mensajeError(mensaje = 'Ha ocurrido un error.') {
    MensajeTemporal.mostrarMensaje(mensaje, 'error');
  }

  /**
   * Muestra un mensaje informativo
    * @param {string} mensaje - Mensaje informativo a mostrar
    */
  static mensajeInfo(mensaje = 'Información importante.') {
    MensajeTemporal.mostrarMensaje(mensaje, 'info');
  }

  /**
   * Muestra un mensaje de alerta
    * @param {string} mensaje - Mensaje de alerta a mostrar
    */
  static mensajeAlerta(mensaje = 'Advertencia.') {
    MensajeTemporal.mostrarMensaje(mensaje, 'alerta');
  }

  // MÉTODOS PARA OBTENER INFORMACIÓN DEL CARRITO (BACKEND SHOPIFY)

  static obtenerCarritoShopify() {
    return new Promise((resolve, reject) => {
      fetch('/cart.js')
        .then(response => response.json())
        .then(cart => {
          // Mostrar en consola la información completa del carrito
          console.log('Información completa del carrito Shopify:', cart);
          
          // Crear un objeto con la información solicitada
          const infoCarrito = {
            informacionCompleta: cart, // Todo el objeto original del carrito
            cantidadTotal: cart.item_count // Solo la cantidad total de productos
          };
          
          // Mostrar en consola específicamente la cantidad total
          console.log(`Cantidad total de productos: ${infoCarrito.cantidadTotal}`);
          
          resolve(infoCarrito);
        })
        .catch(error => {
          console.error('Error al obtener el carrito de Shopify:', error);
          reject(error);
        });
    });
  }

  static totalPrecioCarritoShopify() {
    return new Promise((resolve, reject) => {
      // Utilizar la función existente para obtener el carrito
      this.obtenerCarritoShopify()
        .then(carrito => {
          // Verificar que existe la información y el precio total
          if (carrito && carrito.informacionCompleta && 
              typeof carrito.informacionCompleta.total_price !== 'undefined') {
            
            // Obtener el precio total (viene en centavos)
            const precioTotalCentavos = carrito.informacionCompleta.total_price;
            
            // Convertir a formato de moneda (dividir por 100 para obtener el valor en la moneda base)
            const precioTotal = precioTotalCentavos / 100;
            
            // Mostrar en consola el precio total formateado
            console.log(`Precio total del carrito: ${precioTotal.toFixed(2)}`);
            
            // Resolver la promesa con el precio total
            resolve(precioTotal);
          } else {
            throw new Error('No se pudo obtener el precio total del carrito');
          }
        })
        .catch(error => {
          console.error('Error al calcular el precio total del carrito:', error);
          reject(error);
        });
    });
  }

  static cantidadProductosCarritoShopify() {
    return new Promise((resolve, reject) => {
      // Utilizar la función existente para obtener el carrito
      this.obtenerCarritoShopify()
        .then(carrito => {
          // Verificar que existe la información del carrito
          if (carrito && typeof carrito.cantidadTotal !== 'undefined') {
            
            // Obtener la cantidad total de productos
            const cantidadTotal = carrito.cantidadTotal;
            
            // Mostrar en consola la cantidad total de productos
            console.log(`Cantidad total de productos en el carrito: ${cantidadTotal}`);
            
            // Resolver la promesa con la cantidad total
            resolve(cantidadTotal);
          } else {
            throw new Error('No se pudo obtener la cantidad de productos del carrito');
          }
        })
        .catch(error => {
          console.error('Error al obtener la cantidad de productos del carrito:', error);
          reject(error);
        });
    });
  }

  /**
  * Agrega productos al carrito y actualiza la visualización
  * @param {number} valor - Cantidad de productos a agregar
  * @param {number} variantId - ID de la variante del producto (opcional)
  * @param {Object} opciones - Opciones adicionales para el producto (opcional)
  */
  static agregarCarrito(valor, variantId = null, opciones = {}) {
    // Verificar que el valor sea un número válido mayor a 0
    if (typeof valor === 'number' && valor > 0) {
      // Si se proporciona un variantId, agregar al carrito de Shopify
      if (variantId) {
        // Datos para enviar a la API de Shopify
        const datos = {
          items: [{
            id: variantId,
            quantity: valor,
            ...opciones // Propiedades adicionales (como propiedades de línea)
          }]
        };
        
        // Realizar la petición para añadir al carrito
        fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(datos)
        })
        .then(response => response.json())
        .then(data => {
          // Actualizar el contador visual
          this.actualizarContadorVisual(valor);
          
          // Disparar evento personalizado
          document.dispatchEvent(new CustomEvent('product:added-to-cart', { 
            detail: { product: data }
          }));
          
          console.log('Producto agregado al carrito:', data);
        })
        .catch(error => {
          console.error('Error al agregar al carrito:', error);
          this.mensajeError('No se pudo agregar el producto al carrito');
        });
      } else {
        // Si no hay variantId, solo actualizar el contador visual
        this.actualizarContadorVisual(valor);
      }
    }
  }
  
  /**
   * Método para actualizar el contador visual
    */
  static actualizarContadorVisual(valor) {
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
      
      // Actualizar también todos los componentes CarritoShopify
      this.actualizarComponentesCarrito();
    }
  }
  
  /**
   * Actualiza todos los componentes CarritoShopify en la página
    */
  static actualizarComponentesCarrito() {
    // Si existe el método estático en CarritoShopify, usarlo
    if (typeof CarritoShopify !== 'undefined' && 
        typeof CarritoShopify.actualizarContador === 'function') {
      CarritoShopify.actualizarContador();
    } else {
      // Si no, buscar todos los componentes y actualizar manualmente
      const componentesCarrito = document.querySelectorAll('carrito-shopify');
      componentesCarrito.forEach(componente => {
        if (typeof componente.actualizarContadorCarrito === 'function') {
          componente.actualizarContadorCarrito();
        }
      });
    }
  }

  /**
   * Limpia el carrito (lo vacía por completo)
    */
  static limpiarCarrito() {
    return new Promise((resolve, reject) => {
      // Usar la API de Shopify para vaciar el carrito
      fetch('/cart/clear.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(data => {
        // Actualizar el contador visual a 0
        const mensaje = document.querySelector('.hicc-mensaje');
        if (mensaje) {
          mensaje.textContent = '0';
          mensaje.classList.remove('digitos-2', 'digitos-3');
        }
        
        // Actualizar los componentes CarritoShopify
        this.actualizarComponentesCarrito();
        
        // Mostrar mensaje de éxito
        this.mensajeInfo('El carrito ha sido vaciado');
        
        // Disparar evento personalizado
        document.dispatchEvent(new CustomEvent('cart:cleared'));
        
        console.log('Carrito limpiado:', data);
        resolve(data);
      })
      .catch(error => {
        console.error('Error al limpiar el carrito:', error);
        this.mensajeError('No se pudo vaciar el carrito');
        reject(error);
      });
    });
  }

  /**
   * Elimina un ítem específico del carrito
    * @param {number} lineId - ID de línea del ítem a eliminar (1-based, no 0-based)
    */
  static eliminarItemCarrito(lineId) {
    return new Promise((resolve, reject) => {
      // Usar la API de Shopify para actualizar el carrito
      fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          line: lineId,
          quantity: 0 // Cantidad 0 elimina el ítem
        })
      })
      .then(response => response.json())
      .then(cart => {
        // Actualizar el contador visual y componentes
        this.sincronizarContadorConCarrito(cart);
        
        // Mostrar mensaje de éxito
        this.mensajeInfo('Producto eliminado del carrito');
        
        // Disparar evento personalizado
        document.dispatchEvent(new CustomEvent('cart:updated', {
          detail: { cart }
        }));
        
        console.log('Ítem eliminado del carrito:', cart);
        resolve(cart);
      })
      .catch(error => {
        console.error('Error al eliminar ítem del carrito:', error);
        this.mensajeError('No se pudo eliminar el producto del carrito');
        reject(error);
      });
    });
  }

  /**
   * Actualiza la cantidad de un ítem en el carrito
    * @param {number} lineId - ID de línea del ítem a actualizar (1-based, no 0-based)
    * @param {number} cantidad - Nueva cantidad
    */
  static actualizarCantidadItem(lineId, cantidad) {
    return new Promise((resolve, reject) => {
      // Validar cantidad
      if (typeof cantidad !== 'number' || cantidad < 0) {
        reject(new Error('Cantidad inválida'));
        return;
      }
      
      // Usar la API de Shopify para actualizar el carrito
      fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          line: lineId,
          quantity: cantidad
        })
      })
      .then(response => response.json())
      .then(cart => {
        // Actualizar el contador visual y componentes
        this.sincronizarContadorConCarrito(cart);
        
        // Mostrar mensaje de éxito
        this.mensajeInfo('Carrito actualizado');
        
        // Disparar evento personalizado
        document.dispatchEvent(new CustomEvent('cart:updated', {
          detail: { cart }
        }));
        
        console.log('Carrito actualizado:', cart);
        resolve(cart);
      })
      .catch(error => {
        console.error('Error al actualizar el carrito:', error);
        this.mensajeError('No se pudo actualizar el carrito');
        reject(error);
      });
    });
  }
  
  /**
   * Sincroniza el contador visual con el estado actual del carrito
    * @param {Object} cart - Objeto carrito devuelto por Shopify
    */
  static sincronizarContadorConCarrito(cart) {
    const mensaje = document.querySelector('.hicc-mensaje');
    if (mensaje) {
      const cantidadTotal = cart.item_count || 0;
      mensaje.textContent = cantidadTotal;
      
      // Actualizar clases
      mensaje.classList.remove('digitos-2', 'digitos-3');
      const valorStr = cantidadTotal.toString();
      if (valorStr.length === 2) {
        mensaje.classList.add('digitos-2');
      } else if (valorStr.length >= 3) {
        mensaje.classList.add('digitos-3');
      }
    }
    
    // Actualizar componentes CarritoShopify
    this.actualizarComponentesCarrito();
  }
  
  // MÉTODOS DE GOOGLE MAPS
  static obtenerDireccionDesdeCoordenadas(lat, lng) {
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
}

class CarritoShopify extends HTMLElement {
  constructor() {
    super();
    // Inicializar variable para almacenar la cantidad
    this.cantidadTotal = 0;
  }

  connectedCallback() {
    // Obtener el contador
    const contador = this.querySelector('#contador-carrito');
    
    // Usar AuxiliaresGlobal para obtener la cantidad actual del carrito de Shopify
    AuxiliaresGlobal.obtenerCarritoShopify()
      .then(carrito => {
        // Guardar la cantidad en la propiedad de la clase
        this.cantidadTotal = carrito.cantidadTotal || 0;
        
        // Actualizar el texto del contador con la cantidad actual
        if (contador) {
          contador.textContent = this.cantidadTotal;
        }
        
        // Log después de obtener los datos
        console.log('Componente CarritoShopify inicializado');
        console.log('Cantidad total de productos:', this.cantidadTotal);
      })
      .catch(error => {
        console.error('Error al obtener el carrito:', error);
      });
  }
}

customElements.define('carrito-shopify', CarritoShopify);

class CantidadInput extends HTMLElement {
  constructor() {
    super();
    
    this.btn = this.querySelectorAll('button');
    this.contenedorGeneral = this.querySelector('div');
    this.parrafo = this.querySelector('p');
    this.baseTrabajo = null;
    this.min = null;
    this.max = null;
  }

  // Propiedad calculada que siempre lee el valor actual del DOM
  get cantidadEtiqueta() {
    return parseInt(this.parrafo.textContent) || 0;
  }
  
  // Setter que actualiza tanto la variable como el DOM
  set cantidadEtiqueta(valor) {
    this.parrafo.textContent = valor;
    this.actualizarBotones();
  }
  
  connectedCallback() {
    this.inicializarElemento();
    this.actualizarBotones(); // Inicializar estado de botones
    
    this.btn.forEach((boton) => {
      boton.addEventListener('click', this.manejarAccionBoton.bind(this, boton));
    });
  }
  
  inicializarElemento() {
    this.baseTrabajo = this.contenedorGeneral.getAttribute('origen-trabajo') || 'no-definido';
    this.min = parseInt(this.contenedorGeneral.getAttribute('min')) || 0;
    this.max = parseInt(this.contenedorGeneral.getAttribute('max')) || 100;
    this.idProducto = this.contenedorGeneral.getAttribute('id-producto') || 'no-definido';
    this.handle = this.contenedorGeneral.getAttribute('handle') || 'no-definido';
    
    console.log('Base de trabajo:', this.baseTrabajo);
    
    if(this.baseTrabajo != 'carrito'){
      this.btn[1].classList.remove('elemento-oculto');
    }
  }
   
  actualizarBotones() {
    // Actualizar visibilidad de botones según el valor actual
    const cantidad = this.cantidadEtiqueta;
    
    if (this.baseTrabajo == 'carrito') {
      if (cantidad <= 0) {
        this.btn[0].classList.remove('elemento-oculto');
        this.btn[1].classList.add('elemento-oculto');
      } else {
        this.btn[0].classList.add('elemento-oculto');
        this.btn[1].classList.remove('elemento-oculto');
      }
    }
  }
  
  manejarAccionBoton(boton) {
    const accion = boton.getAttribute('accion');
    let nuevaCantidad = this.cantidadEtiqueta;
    
    if (accion == 'incrementar' && nuevaCantidad < this.max) {
      nuevaCantidad++;
      this.parrafo.textContent = nuevaCantidad;
    }
    
    if (accion == 'decrementar' && nuevaCantidad > this.min) {
      nuevaCantidad--;
      this.parrafo.textContent = nuevaCantidad;
    }
    
    this.actualizarBotones();
  }
}

customElements.define('cantidad-input', CantidadInput);

class MensajeTemporal extends HTMLElement {
  // REFERENCIAS ELEMENTOS
  contenedor = null;
  etiquetaMensaje = null;
  iconos = [];
  tiempoEspera = null;

  constructor() {
    super();
  }

  connectedCallback() {
    // Obtenemos referencias a los elementos internos
    this.contenedor = this.querySelector('#ph-mec');
    this.etiquetaMensaje = this.querySelector('#ph-mec-etiqueta-mensaje');
    this.iconos = this.querySelectorAll('[id="ph-mec-icono-"]');

    this.iconos.forEach((icono) => {
      icono.classList.add('elemento-oculto');
    });


    // Verificamos que todos los elementos existan
    if (!this.contenedor || !this.etiquetaMensaje){
      console.error('No se encontraron todos los elementos necesarios para el componente MensajeTemporal');
    }
  }

  /**
   * Método para mostrar un mensaje
   * @param {string} mensaje - El texto del mensaje a mostrar
   * @param {string} tipo - El tipo de mensaje ('exito', 'error', 'info', 'alerta')
   * @param {number} duracion - Duración en ms que se mostrará el mensaje
  */
  mostrar(mensaje, tipo="exito",duracion = 3000) {
    // Verificar que las referencias esten disponibles
    if (!this.contenedor || !this.etiquetaMensaje) {
      console.error('No se encontraron todos los elementos necesarios para el componente MensajeTemporal');
      return false;
    }

    // Ocultar todos los iconos
    this.iconos.forEach((icono) => {
      icono.classList.remove('elemento-visible');
      icono.classList.add('elemento-oculto');
    });

    // Mostrar el icono correspondiente al tipo de mensaje
    const iconoActual = this.querySelector(`.ph-mec-icono-${tipo}`);
    if (iconoActual) {
      iconoActual.classList.remove('elemento-oculto');
      iconoActual.classList.add('elemento-visible');
    }

    // Esatblecer el texto del mensaje 
    this.etiquetaMensaje.textContent = mensaje;

    // Remove clases de tipo anteriores y aplicar la nueva
    this.contenedor.classList.remove('exito', 'error', 'info', 'alerta');
    this.contenedor.classList.add(tipo);

    // Mostrar el mensaje
    this.contenedor.style.opacity = '1';
    this.contenedor.style.visibility = 'visible';

    // Limpiar el timeout nterior si existe
    if (this.tiempoEspera) {
      clearTimeout(this.tiempoEspera);
    }

    // Establecer nuevo tiemout
    this.tiempoEspera = setTimeout(() => {
      this.ocultar();
    },duracion);

    return true;
  }

  ocultar(){
    if(this.contenedor){
      this.contenedor.style.opacity = '0';
      this.contenedor.style.visibility = 'hidden';
    }
    
    if(this.tiempoEspera) {
      clearTimeout(this.tiempoEspera);
      this.tiempoEspera = null;
    }
  }

  disconnectedCallback() {
    // Limpiamos cualquier timeout pendiente
    if (this.tiempoEspera) {
      clearTimeout(this.tiempoEspera);
      this.tiempoEspera = null;
    }
  }

   /**
   * Método estático para mostrar un mensaje global
   * Encuentra o crea una instancia del componente y muestra el mensaje
   */
  static mostrarMensaje(mensaje, tipo = 'exito', duracion = 3000) {
    // Buscar si ya existe una instancia del componente
    let mensajeElement = document.querySelector('mensaje-temporal');
    
    // Si no existe una instancia, mostrar error
    if (!mensajeElement) {
      console.error('No se encontró el componente mensaje-temporal en el DOM');
      return false;
    }
    
    // Llamar al método de instancia
    return mensajeElement.mostrar(mensaje, tipo, duracion);
  }
  
  /**
   * Método estático para ocultar el mensaje global
   */
  static ocultarMensaje() {
    const mensajeElement = document.querySelector('mensaje-temporal');
    if (mensajeElement) {
      mensajeElement.ocultar();
    }
  }
}

customElements.define('mensaje-temporal', MensajeTemporal);

class MensajeCargaDatos extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
  }
}

customElements.define('mensaje-carga-datos', MensajeCargaDatos);