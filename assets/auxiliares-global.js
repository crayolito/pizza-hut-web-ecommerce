
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
   * Actualiza un ítem en el carrito
   * @param {string} key - Key del ítem a eliminar
   * @param {number} variante - ID de la variante para el nuevo ítem
   * @param {number} cantidad - Cantidad del nuevo ítem
   * @param {Object} propiedades - Propiedades del nuevo ítem
   * @returns {Promise} - Carrito actualizado
   */
  static actualizarItemCarrito(key, variante, cantidad, propiedades = {}) {
    return new Promise((resolve, reject) => {
      // Eliminar el ítem actual usando su key
      fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, quantity: 0 })
      })
      .then(response => response.json())
      .then(() => {
        // Agregar el nuevo ítem con la variante, cantidad y propiedades
        return fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: [{
              id: variante,
              quantity: cantidad,
              properties: propiedades
            }]
          })
        });
      })
      .then(response => response.json())
      .then(() => {
        // Obtener carrito actualizado
        return fetch('/cart.js');
      })
      .then(response => response.json())
      .then(carrito => {
        // Sincronizar el contador con el carrito actualizado
        this.sincronizarContadorConCarrito(carrito);
        
        // Devolver el carrito actualizado
        resolve(carrito);
      })
      .catch(error => {
        console.error('Error al actualizar ítem:', error);
        reject(error);
      });
    });
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
        // this.mensajeInfo('El carrito ha sido vaciado');
        
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
   * Elimina un ítem específico del carrito usando su key
   * @param {string} key - Key única del ítem a eliminar
   * @param {number} quantity - Nueva cantidad (0 para eliminar)
   */
  static eliminarItemCarritoPorKey(key, quantity) {
    return new Promise((resolve, reject) => {
      // Usar la API de Shopify para actualizar el carrito
      fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: key,  // Usamos la key como id
          quantity: quantity // 0 para eliminar, otro valor para actualizar
        })
      })
      .then(response => response.json())
      .then(cart => {
        // Actualizar el contador visual y componentes
        this.sincronizarContadorConCarrito(cart);
        
        // Mostrar mensaje de éxito
        // const mensaje = quantity === 0 ? 'Producto eliminado del carrito' : 'Carrito actualizado';
        // this.mensajeInfo(mensaje);
        
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
   * Actualiza la cantidad de un ítem en el carrito usando su key
   * @param {string} key - Key única del ítem a actualizar
   * @param {number} cantidad - Nueva cantidad
   */
  static actualizarCantidadItemPorKey(key, cantidad) {
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
          id: key,  // Usamos key en lugar de line
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
          // Verificar si hay un mensaje de error (status 422)
          if (data.status === 422 || data.message) {
            // Verificar si el mensaje contiene la palabra "agotado"
            if (data.message && data.message.toLowerCase().includes('agotado')) {
              this.mensajeError('Este producto está agotado');
            } else {
              // Mostrar mensaje de error genérico o el específico que viene del servidor
              this.mensajeError(data.message || 'No se pudo agregar el producto al carrito');
            }
            console.error('Error al agregar al carrito:', data);
            return; // Salir de la función para no continuar con el flujo de éxito
          }
          
          // Si llegamos aquí, es porque la operación fue exitosa
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
      if (cantidad <= 1) {
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
    // Se ejecuta cuando el componente se añade al DOM
    // No necesitamos inicializar nada especial aquí
  }
  
  /**
   * Método estático para mostrar el mensaje de carga
   * @param {string} mensaje - El mensaje a mostrar durante la carga
   * @param {boolean} bloquearPantalla - Si debe bloquear interacciones con la pantalla (opcional, por defecto true)
   */
  static mostrar(mensaje = 'Cargando datos...', bloquearPantalla = true) {
    // Buscar la instancia del componente
    const mensajeCarga = document.querySelector('mensaje-carga-datos');
    
    if (!mensajeCarga) {
      console.error('No se encontró el componente mensaje-carga-datos en el DOM');
      return false;
    }
    
    // Obtener el contenedor modal y el elemento para el mensaje
    const containerModal = mensajeCarga.querySelector('#ph-container-modal');
    const mensajeElement = mensajeCarga.querySelector('#ph-mensaje-carga-datos');
    
    if (!containerModal || !mensajeElement) {
      console.error('No se encontraron los elementos necesarios dentro del componente');
      return false;
    }
    
    // Establecer el mensaje
    mensajeElement.textContent = mensaje;
    
    // Mostrar el modal
    containerModal.style.display = 'flex';
    
    // Si debe bloquear la pantalla, añadir clase o estilo apropiado
    if (bloquearPantalla) {
      document.body.style.overflow = 'hidden'; // Evita el scroll
      containerModal.style.pointerEvents = 'all'; // Captura todos los clicks
    }
    
    return true;
  }
  
  /**
   * Método estático para ocultar el mensaje de carga
   * @param {number} retraso - Milisegundos de retraso antes de ocultar (opcional)
   */
  static ocultar(retraso = 0) {
    const ocultar = () => {
      // Buscar la instancia del componente
      const mensajeCarga = document.querySelector('mensaje-carga-datos');
      
      if (!mensajeCarga) {
        console.error('No se encontró el componente mensaje-carga-datos en el DOM');
        return false;
      }
      
      // Obtener el contenedor modal
      const containerModal = mensajeCarga.querySelector('#ph-container-modal');
      
      if (!containerModal) {
        console.error('No se encontró el contenedor modal dentro del componente');
        return false;
      }
      
      // Ocultar el modal
      containerModal.style.display = 'none';
      
      // Restaurar comportamiento del body
      document.body.style.overflow = '';
      containerModal.style.pointerEvents = '';
      
      return true;
    };
    
    // Si hay retraso, usar setTimeout
    if (retraso > 0) {
      setTimeout(ocultar, retraso);
    } else {
      ocultar();
    }
  }
}

customElements.define('mensaje-carga-datos', MensajeCargaDatos);

class PageCarrito extends HTMLElement {
  constructor() {
    super();
    this.dataCarrito = null;
    this.productosAcompanamiento = null;
    this.urlConsulta = "https://pizza-hut-bo.myshopify.com/admin/api/2025-01/graphql.json";
  }

  connectedCallback() {
    this.btnPagar = this.querySelector('#phpc-btn-pagar');
    this.contenedorItemsDetalle = this.querySelector('.pcph-items-carrito');
    this.contenedorDerecho = this.querySelector('.pcph-carrito-derecho');
    this.etiquetaSubtotal = this.querySelector('#phpc-etiqueta-subTotal');
    this.etiquetaTotal = this.querySelector('#phpc-etiqueta-total');
    this.contenedorProductosAcompanamientos = this.querySelector('.pcph-productos-items');
    this.btnPagar.addEventListener('click', () => this.pagarBtnPrincipal());
    this.inicializarDataShopify();
  }

  async inicializarDataShopify() {
    try {
      // Mostrar mensaje de carga al iniciar
      MensajeCargaDatos.mostrar('Cargando información del carrito...');

      const infoCarrito = await AuxiliaresGlobal.obtenerCarritoShopify();
      this.dataCarrito = infoCarrito.informacionCompleta;
      console.log('Información completa inicializarDataShopify :', infoCarrito.informacionCompleta);

      let contenidoIzquierdoHTML = '';
      let precioTotal = 0;

      infoCarrito.informacionCompleta.items.forEach((item) => {
        if(!(item.properties && item.properties.estructura)){
          console.log("Testep Pruebas", {
            "testeo 1": item.properties,
            "testeo 2": item.properties?.estructura,
            "testeo 3": item.properties?.estructura == null,
            "testeo 4": item.properties?.estructura == undefined,
            "testeo 5": item.properties?.properties?.estructura,
          });
          return;
        }
        
        const dataContruccion = JSON.parse(item.properties.estructura);
        precioTotal += parseFloat(dataContruccion.producto.precioTotalConjunto);
        console.log('Data de construcción:', dataContruccion);

        contenidoIzquierdoHTML += `
        <div 
        data-idTrabajo="${dataContruccion.producto.idTrabajo}"
        data-idShopify="${dataContruccion.producto.idShopify}"
        data-handle="${dataContruccion.producto.handle}"
        data-precio="${dataContruccion.producto.precio}"
        data-keycarrito="${item.key}"
        class="pcph-item-carrito">
          <div class="pcph-itemc-detalle">
            <div class="pcph-itemc-imagen">
              ${dataContruccion.producto.imagen == null || dataContruccion.producto.imagen == '' 
                ? `<img src="{{ 'imagen-pizza-1.png' | asset_url }}" alt="${dataContruccion.producto.titulo}" width="100" height="100">`
                : `<img src="${dataContruccion.producto.imagen}" alt="${dataContruccion.producto.titulo}" width="100" height="100">`
              }
            </div>
            <div class="pcph-itemc-info">
              <div class="pcph-itemc_opcion1">
                <h2 class="color-letras-extra">Bs. ${dataContruccion.producto.precioTotalConjunto}</h2>
                <div class="pcph-itemc_editar">
                  ${window.shopIcons.icon_editar}
                  <p class="color-letras-primary">Editar</p>
                </div>
              </div>
              <div class="pcph-itemc_opcion2">
                <div class="pcph-itemc-detalles-primarios">
                  <h1>${dataContruccion.producto.titulo}</h1>
                  ${dataContruccion.opcionesPrincipales.productos.length > 0
                    ? `<p>${dataContruccion.opcionesPrincipales.titulo}</p>
                        <ul class="color-letras-extra">`
                    : ''
                  }
        `;
  
        dataContruccion.opcionesPrincipales.productos.forEach((producto) => {
          contenidoIzquierdoHTML += `
              <li>
                <p>${producto.tituloSeccion} : <br> ${producto.titulo}</p>
              </li>
          `;
        });
  
        contenidoIzquierdoHTML += `
                  </ul>
                </div>
                <div class="pcph-itemc-detalles-secundarios">
                ${
                  dataContruccion.complementos.productos.length > 0
                    ? `<p>${dataContruccion.complementos.titulo}</p>
                        <ul class="color-letras-extra">`
                    : ''
                 }

        `;
  
        dataContruccion.complementos.productos.forEach((producto) => {
          contenidoIzquierdoHTML += `
              <li>
                <p>${"x" + producto.cantidad +" "+  producto.tituloSeccion} : <br> ${producto.titulo}</p>
              </li>
          `;
        });
  
        contenidoIzquierdoHTML += `
                ${
                  dataContruccion.complementos.productos.length > 0
                    ? `</ul>`
                    : ''
                 }
                  </ul>
                </div>
              </div>
            </div>
          </div>
        `;
  
        // <div class="pcph-itemc_cantidad">
        //   <button class="pcph-itemc_cantidad-btn">
        //     {% render 'icon-menos' %}
        //   </button>
        //   <p>1</p>
        //   <button class="pcph-itemc_cantidad-btn">
        //     {% render 'icon-mas' %}
        //   </button>
        // </div>
        contenidoIzquierdoHTML += `
            <cantidad-input>
              <div
                origen-trabajo="carrito"
                min="1"
                max="${this.obtenerStockGenericoTrabajo(dataContruccion.producto)}"
                id="producto-id"
                handle="producto-handle"
                class="pcph-itemc_cantidad"
              >
                <button
                  accion="decrementar"
                  data-peticion="eliminar"
                  class="pcph-itemc_cantidad-btn elemento-oculto icon-color-tertiary"
                >
                ${window.shopIcons.icon_basura}
                </button>
                <button
                  accion="decrementar"
                  data-peticion="decrementar"
                  class="pcph-itemc_cantidad-btn  elemento-oculto icon-color-tertiary"
                >
                 ${window.shopIcons.icon_menos}
                </button>
                <p id="phpp-cantidad-general">${item.quantity}</p>
                <button
                  accion="incrementar"
                  class="pcph-itemc_cantidad-btn icon-color-tertiary"
                >
                  ${window.shopIcons.icon_mas}  
                </button>
              </div>
            </cantidad-input>
        </div>
        `;
      });
  
      this.contenedorItemsDetalle.innerHTML = contenidoIzquierdoHTML;
      this.etiquetaSubtotal.textContent = `Bs. ${precioTotal}`;
      this.etiquetaTotal.textContent = `Bs. ${precioTotal}`;

      // DIBUJAR LA SECCION DE POSTRES
      await this.crearSecciondeAcompanamiento();
      
      this.declararComponentesDespuesCreacion();

      MensajeCargaDatos.ocultar();
    } catch (error) {
      console.error('Hubo un error:', error);
      MensajeCargaDatos.ocultar();
    }
  }

  declararComponentesDespuesCreacion() {
    // DECLARAR ELEMENTOS
    this.btnsEditar = this.querySelectorAll('.pcph-itemc_editar');
    this.btnsEditarCantidadItem = this.querySelectorAll('.pcph-itemc_cantidad-btn'); 

    // INICIALIZAR EVENTOS
    this.btnsEditar.forEach((btn) => {
      btn.addEventListener('click', this.procedoEditarItem.bind(this, btn));
    }); 
    this.btnsEditarCantidadItem.forEach((btn) => {
      btn.addEventListener('click', this.actualizarProductoCarrito.bind(this, btn));
    });


    // INICIALIZAR ELEMENTOS Y CARGA DE DATOSS
  }

  async crearSecciondeAcompanamiento() {
    const {informacionColeccion,  productosColeccion } = await this.traerProductoAcompanamiento();
    console.log("Testeo de productos acompanamiento", productosColeccion);

    this.productosAcompanamiento = productosColeccion;

    if (productosColeccion.length == 0 || productosColeccion == null || productosColeccion == undefined) {
      return;
    }

    var contenidoHTML = '';
    productosColeccion.forEach((producto) => {
      contenidoHTML += `
        <div 
        data-idTrabajo="${producto.estructura.id}"
        data-idShopify="${producto.id}"
        data-handle="${producto.handle}"
        data-precio="${producto.precio}"
        data-titulo="${producto.titulo}"
        data-stock="${this.obtenerStockGenericoTrabajo(producto)}"
        class="cardph-item-producto">
          <div class="cardph-itemp-imagen">
          ${producto.imagen == null || producto.imagen == ''
            ? `<img src="{{ 'imagen-pizza-1.png' | asset_url }}" alt="${producto.titulo}" width="100" height="100">`
            : `<img src="${producto.imagen}" alt="${producto.titulo}" width="100" height="100">`
          }
          </div>
          <div class="cardph-itemp-info">
            <h3>${producto.titulo}</h3>
            <h3 class="color-letras-primary">Bs. ${producto.estructura.precio}</h3>
            <button id="phpc-btn-agregar-acompanamiento" class="boton-producto-agregar icon-color-secondary ">
              <p class="color-letras-secondary">AGREGAR</p>
              ${window.shopIcons.icon_carrito}
              </button>
          </div>
        </div>
      `;
    });

    this.contenedorProductosAcompanamientos.innerHTML = contenidoHTML;

    this.btnsAgregarAcompanamiento = this.querySelectorAll('#phpc-btn-agregar-acompanamiento');
    this.btnsAgregarAcompanamiento.forEach((btn) => {
      btn.addEventListener('click', this.agregarProductoAcompanamiento.bind(this, btn));
    });
  }

  async traerProductoAcompanamiento() {
    const graphQLQuery = `
    query GetCollectionByFlexibleTitle {
      collections(first: 1, query: "title:*Postres*") {
        edges {
          node {
            id
            title
            handle
            metafield(namespace: "estructura", key: "json") {
              value
            }
            products(first: 50) {
              edges {
                node {
                  id
                  title
                  handle
                  description
                  totalInventory
                  images(first: 1) {
                    edges {
                      node {
                        url
                      }
                    }
                  }
                  metafield(namespace: "estructura", key: "json") {
                    value
                  }
                  variants(first: 1) {
                    edges {
                      node {
                        id
                        inventoryItem {
                          inventoryLevels(first: 100) {
                            edges {
                              node {
                                location {
                                  name
                                }
                                quantities(names: ["available"]) {
                                  name
                                  quantity
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    `;

    try {
      // Realiza la solicitud a la API de Shopify
      const myTest = 'shpat_' + '45f4a7476152f4881d058f87ce063698';
      const respuesta = await fetch(this.urlConsulta, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': myTest,
        },
        body: JSON.stringify({ query: graphQLQuery }),
      });

      if (!respuesta.ok) {
        throw new Error(`Error de red: ${respuesta.status} ${respuesta.statusText}`);
      }

      // Obtener los datos de la respuesta
      const datosRespuesta = await respuesta.json();

      console.log('Datos de la respuesta Postres:', datosRespuesta);

      // Verificar si tenemos datos
      if (!datosRespuesta.data || !datosRespuesta.data.collections.edges.length || !datosRespuesta.data.collections.edges[0].node.products.edges.length) {
        console.log("No se encontraron productos en la colección PIZZA");
        return [];
      }

      // Extraer la información de la colección 
      const coleccion = datosRespuesta.data.collections.edges[0].node;
      var estructuraColeccion = null;
      if (coleccion.metafield && coleccion.metafield.value) {
        try {
          estructuraColeccion = JSON.parse(coleccion.metafield.value);
        } catch (e) {
          estructuraColeccion = null;
          console.error('Error al parsear la estructura de la colección:', e);
        } 
      }

      // Transformar los productos a un formato más simple
      const productosSimplificados = coleccion.products.edges.map(edge => {
        const producto = edge.node;
        const imagenURL = producto.images.edges.length > 0 ? producto.images.edges[0].node.url : '';
        
        // Obtener el inventario total del producto
        const stockGeneral = producto.totalInventory || 0;
        
        // Obtener el ID de la variante
        let varianteId = '';
        if (producto.variants && producto.variants.edges.length > 0) {
          const varianteCompleta = producto.variants.edges[0].node.id;
          // Extraer solo la parte numérica del ID de la variante
          varianteId = varianteCompleta.split('/').pop();
        }
        
        // Obtener el inventario por sucursal
        const sucursales = [];
        if (producto.variants && producto.variants.edges.length > 0) {
          const variante = producto.variants.edges[0].node;
          if (variante.inventoryItem && variante.inventoryItem.inventoryLevels.edges.length > 0) {
            variante.inventoryItem.inventoryLevels.edges.forEach(levelEdge => {
              const level = levelEdge.node;
              const nombreSucursal = level.location.name;
              let stockSucursal = 0;
              
              // Buscar la cantidad disponible
              if (level.quantities && level.quantities.length > 0) {
                const availableQuantity = level.quantities.find(q => q.name === "available");
                if (availableQuantity) {
                  stockSucursal = availableQuantity.quantity;
                }
              }
              
              sucursales.push({
                nombre: nombreSucursal,
                stock: stockSucursal
              });
            });
          }
        }

        // Crear un objeto simplificado del producto
        const productoSimplificado = {
          id: varianteId, // Usamos el ID de variante en lugar del ID de producto
          titulo: producto.title,
          handle: producto.handle,
          descripcion: producto.description,
          imagen: imagenURL,
          stockGeneral: stockGeneral,
          sucursales: sucursales,
          estructura: producto.metafield && producto.metafield.value ? JSON.parse(producto.metafield.value) : "",
        };

        return productoSimplificado;
      });

      // Crear un objeto con información de la colección y los productos
      const resultado = {
        informacionColeccion: {
          id: coleccion.id,
          titulo: coleccion.title,
          handle: coleccion.handle,
          estructura: estructuraColeccion
        },
        productosColeccion: productosSimplificados
      };

      console.log('Datos de la colección obtenidos:', resultado);

      return resultado;

    } catch (error) {
      // Errores al traer los datos
      console.error('Error al obtener los datos de la colección:', error);
      return [];
    }
  }

  async actualizarProductoCarrito(btnElemento){
    const contenedorPadre = btnElemento.closest('.pcph-item-carrito');
    const dataPeticion = btnElemento.dataset.peticion;
    const keyCarrito = contenedorPadre.dataset.keycarrito;
    let cantidadElemento = parseInt(contenedorPadre.querySelector('#phpp-cantidad-general').textContent);

    console.log('Key del carrito cantidadElemento:', cantidadElemento);

    const itemCarrito = this.dataCarrito.items.find(item => item.key === keyCarrito);

    const informacionCompleta = JSON.parse(itemCarrito.properties.estructura);
    console.log('Información completa del item:', informacionCompleta);

    // Verificar si el botón es de incrementar o decrementar
    const accionBtn = btnElemento.getAttribute('accion');

    if(accionBtn == "decrementar" && dataPeticion == "eliminar"){
      // Se procede a eliminar del carrito
      MensajeCargaDatos.mostrar('Eliminando producto del carrito...');
      await AuxiliaresGlobal.eliminarItemCarritoPorKey(keyCarrito, 0);
    }else{
      if(informacionCompleta.opcionesPrincipales.productos.length == 0 && informacionCompleta.complementos.productos.length == 0){
        informacionCompleta.producto.precioTotalConjunto = informacionCompleta.producto.precio * cantidadElemento;
      }else {
        let cantidadProductoBaseNuevo = parseInt(informacionCompleta.producto.precioProducto) * cantidadElemento;
        let cantidadProductoBaseAntiguo = parseInt(informacionCompleta.producto.precioProducto) * parseInt(informacionCompleta.producto.cantidad);
        let cantidadPrecioTotalAntiguo = parseFloat(informacionCompleta.producto.precioTotalConjunto);
        let cantidadOpcionesPrincipalesAntiguo = 0; 
        let cantidadOpcionesPrincipalesNueva = 0;
        informacionCompleta.opcionesPrincipales.productos.forEach((producto) => {
          cantidadOpcionesPrincipalesNueva  += (cantidadElemento * parseInt(producto.precio));
          cantidadOpcionesPrincipalesAntiguo += (producto.cantidad * parseInt(producto.precio));
        });
        let cantidadSolamenteComplementosAntiguo = cantidadPrecioTotalAntiguo - cantidadOpcionesPrincipalesAntiguo - cantidadProductoBaseAntiguo;
        informacionCompleta.producto.precioTotalConjunto = cantidadOpcionesPrincipalesNueva + cantidadSolamenteComplementosAntiguo + cantidadProductoBaseNuevo;
  
        console.log("Testeo completo :",{
          "cantidadPrecioTotalAntiguo": cantidadPrecioTotalAntiguo,
          "cantidadOpcionesPrincipalesAntiguo": cantidadOpcionesPrincipalesAntiguo,
          "cantidadOpcionesPrincipalesNueva": cantidadOpcionesPrincipalesNueva,
          "cantidadSolamenteComplementosAntiguo": cantidadSolamenteComplementosAntiguo,
          "cantidadProductoBaseNuevo": cantidadProductoBaseNuevo,
          "cantidadProductoBaseAntiguo": cantidadProductoBaseAntiguo,
          "total nuevo : ": informacionCompleta.producto.precioTotalConjunto
        })
      }


  
      if(accionBtn == "decrementar"){
        // Se procede a decrementar la cantidad
        MensajeCargaDatos.mostrar('Actualizando producto en el carrito...');
        await AuxiliaresGlobal.actualizarItemCarrito(keyCarrito,itemCarrito.id, cantidadElemento,{
          "estructura": JSON.stringify(informacionCompleta)
        });
      }
  
      if(accionBtn == "incrementar"){
        // Se procede a incrementar la cantidad
        MensajeCargaDatos.mostrar('Actualizando producto en el carrito...');
        await AuxiliaresGlobal.actualizarItemCarrito(keyCarrito,itemCarrito.id, cantidadElemento,{
          "estructura": JSON.stringify(informacionCompleta)
        });
      }
    }

    await this.actualizarSoloContenidoCarrito();
    MensajeCargaDatos.ocultar();
  }

  async actualizarSoloContenidoCarrito(){
    try {
      console.log('Actualizando solo contenido del carrito...');

      const infoCarrito = await AuxiliaresGlobal.obtenerCarritoShopify();
      this.dataCarrito = infoCarrito.informacionCompleta;
      console.log('Información completa:', infoCarrito.informacionCompleta);

      let contenidoIzquierdoHTML = '';
      let precioTotal = 0;

      console.log('Items del carrito:', infoCarrito.informacionCompleta.items);

      infoCarrito.informacionCompleta.items.forEach((item) => {
        if(item.properties && item.properties.estructura) {
          const dataContruccion = JSON.parse(item.properties.estructura);
          precioTotal += parseFloat(dataContruccion.producto.precioTotalConjunto);
  
          contenidoIzquierdoHTML += `
          <div 
          data-idTrabajo="${dataContruccion.producto.idTrabajo}"
          data-idShopify="${dataContruccion.producto.idShopify}"
          data-handle="${dataContruccion.producto.handle}"
          data-precio="${dataContruccion.producto.precio}"
          data-keycarrito="${item.key}"
          class="pcph-item-carrito">
            <div class="pcph-itemc-detalle">
              <div class="pcph-itemc-imagen">
                ${dataContruccion.producto.imagen == null || dataContruccion.producto.imagen == '' 
                  ? `<img src="{{ 'imagen-pizza-1.png' | asset_url }}" alt="${dataContruccion.producto.titulo}" width="100" height="100">`
                  : `<img src="${dataContruccion.producto.imagen}" alt="${dataContruccion.producto.titulo}" width="100" height="100">`
                }
              </div>
              <div class="pcph-itemc-info">
                <div class="pcph-itemc_opcion1">
                  <h2 class="color-letras-extra">Bs. ${dataContruccion.producto.precioTotalConjunto}</h2>
                  <div class="pcph-itemc_editar">
                    ${window.shopIcons.icon_editar}
                    <p class="color-letras-primary">Editar</p>
                  </div>
                </div>
                <div class="pcph-itemc_opcion2">
                  <div class="pcph-itemc-detalles-primarios">
                    <h1>${dataContruccion.producto.titulo}</h1>
                    ${dataContruccion.opcionesPrincipales.productos.length > 0
                      ? `<p>${dataContruccion.opcionesPrincipales.titulo}</p>
                          <ul class="color-letras-extra">`
                      : ''
                    }
          `;
    
          dataContruccion.opcionesPrincipales.productos.forEach((producto) => {
            contenidoIzquierdoHTML += `
                <li>
                  <p>${producto.tituloSeccion} : <br> ${producto.titulo}</p>
                </li>
            `;
          });
    
          contenidoIzquierdoHTML += `
                    </ul>
                  </div>
                  <div class="pcph-itemc-detalles-secundarios">
                  ${
                    dataContruccion.complementos.productos.length > 0
                      ? `<p>${dataContruccion.complementos.titulo}</p>
                          <ul class="color-letras-extra">`
                      : ''
                   }
  
          `;
    
          dataContruccion.complementos.productos.forEach((producto) => {
            contenidoIzquierdoHTML += `
                <li>
                  <p>${"x" + producto.cantidad +" "+  producto.tituloSeccion} : <br> ${producto.titulo}</p>
                </li>
            `;
          });
    
          contenidoIzquierdoHTML += `
                  ${
                    dataContruccion.complementos.productos.length > 0
                      ? `</ul>`
                      : ''
                   }
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          `;
  
          contenidoIzquierdoHTML += `
              <cantidad-input>
                <div
                  origen-trabajo="carrito"
                  min="1"
                  max="${this.obtenerStockGenericoTrabajo(dataContruccion.producto)}"
                  id="producto-id"
                  handle="producto-handle"
                  class="pcph-itemc_cantidad"
                >
                  <button
                    accion="decrementar"
                    data-peticion="eliminar"
                    class="pcph-itemc_cantidad-btn elemento-oculto icon-color-tertiary"
                  >
                  ${window.shopIcons.icon_basura}
                  </button>
                  <button
                     accion="decrementar"
                  data-peticion="decrementar"
                    class="pcph-itemc_cantidad-btn  elemento-oculto icon-color-tertiary"
                  >
                   ${window.shopIcons.icon_menos}
                  </button>
                  <p id="phpp-cantidad-general">${item.quantity}</p>
                  <button
                    accion="incrementar"
                    class="pcph-itemc_cantidad-btn icon-color-tertiary"
                  >
                    ${window.shopIcons.icon_mas}  
                  </button>
                </div>
              </cantidad-input>
          </div>
          `;

        }else{

        };
      });

      this.contenedorItemsDetalle.innerHTML = contenidoIzquierdoHTML;

      this.etiquetaSubtotal.textContent = `Bs. ${precioTotal}`;
      this.etiquetaTotal.textContent = `Bs. ${precioTotal}`;
      
      this.declararComponentesDespuesCreacion();
    } catch (error) {
      console.error('Hubo un error:', error);
    }
  }

  procedoEditarItem(btnElemento) {}

  obtenerStockGenericoTrabajo(productoTrabajo){
    // Verificar si tenemos una sucursal seleccionada
    const dataSucursal = JSON.parse(localStorage.getItem('sucursal-informacion'));
    if(!dataSucursal || dataSucursal == "") return productoTrabajo.stockTotal || productoTrabajo.stockGeneral;

    const sucursalEncontrada = productoTrabajo.sucursales.find(
      sucursal => sucursal.nombre == dataSucursal.name
    );

    return sucursalEncontrada 
    ? parseInt(sucursalEncontrada.stock) 
    : productoTrabajo.stockTotal;
  }

  async agregarProductoAcompanamiento(btnElemento){
    const contenedorPadre = btnElemento.closest('.cardph-item-producto');
    const idTrabajo = contenedorPadre.dataset.idtrabajo;
    const idShopify = contenedorPadre.dataset.idshopify;

    const productoTrabajo = this.productosAcompanamiento.find(
      producto =>{

        return producto.id == idShopify && producto.estructura.id == idTrabajo
      }
    );

    const detalleProducto = {
      producto: {
        idTrabajo: idTrabajo,
        idShopify: idShopify,
        handle: productoTrabajo.handle,
        titulo: productoTrabajo.titulo,
        precio: parseInt(productoTrabajo.estructura.precio),
        imagen: productoTrabajo.imagen,
        cantidad: 1,
        sucursales: productoTrabajo.sucursales,
        stockTotal : parseInt(productoTrabajo.stockTotal),
        precioTotalConjunto: parseInt(productoTrabajo.estructura.precio) * 1,
      },
      opcionesPrincipales: {
        titulo: "Opciones Principales",
        productos: []  
      },
      complementos: {
        titulo: "Complementos",
        productos: []
      }
    };

    // Se procede a agregar al carritoo
    MensajeCargaDatos.mostrar('Agregando producto al carrito...');
    await AuxiliaresGlobal.agregarCarrito(1, parseInt(idShopify), {
      properties: {"estructura": JSON.stringify(detalleProducto),}
    });

    // Hacer un setTiempo de 3 segundos
    setTimeout(async() => {
      await this.actualizarSoloContenidoCarrito();
      MensajeCargaDatos.ocultar();
    }, 3000);

    // MensajeCargaDatos.ocultar();
  }

  async pagarBtnPrincipal() {
    //  await AuxiliaresGlobal.limpiarCarrito();
    window.location.href = "/pages/checkout-ph";
  }
}

customElements.define('page-carrito', PageCarrito);

class PageCheckoutPH extends HTMLElement {
  constructor() {
    super();
    this.dataCarrito = null;
    this.urlConsulta = "https://pizza-hut-bo.myshopify.com/admin/api/2025-01/graphql.json";
    this.estadoPagina = "domicilio";
    this.estadoProcesoDireccion = "";
    this.coordenadas = { lat: -17.783315017953004, lng: -63.18214577296119 };
    this.pizzaLocations = [
      { 
        lat: -17.757619, 
        lng: -63.178738, 
        name: 'BANZER 3ER ANILLO', 
        localizacion: 'Tercer Anillo Externo', 
        telefono: '78452415', 
        dias : 'Lunes a Viernes', 
        horario: '8:00 a 23:00',
        servicios: ['Envío a domicilio', 'Recoger en local']
      },
      { 
        lat: -17.70001, 
        lng: -63.160219, 
        name: 'BANZER KM 8.5', 
        localizacion: '8R2Q+2XH', 
        telefono: '78452415', 
        dias : 'Lunes a Viernes', 
        horario: '8:00 a 23:00',
        servicios: ['Envío a domicilio', 'Recoger en local']
      },
      { 
        lat: -17.807739, 
        lng: -63.204363, 
        name: 'LAS PALMAS', 
        localizacion: 'Doble vía La Guardia', 
        telefono: '78452415', 
        dias : 'Lunes a Viernes', 
        horario: '8:00 a 23:00',
        servicios: ['Envío a domicilio', 'Recoger en local']
      },
      { 
        lat: -17.758879, 
        lng: -63.19948, 
        name: 'SAN MARTIN', 
        localizacion: 'Av. San Martin 2200', 
        telefono: '78452415', 
        dias : 'Lunes a Viernes', 
        horario: '8:00 a 23:00',
        servicios: ['Envío a domicilio', 'Recoger en local']
      },
      { 
        lat: -17.820341, 
        lng: -63.184337, 
        name: 'SANTOS DUMONT', 
        localizacion: 'Av Santos Dumont 3228', 
        telefono: '78452415', 
        dias : 'Lunes a Viernes', 
        horario: '8:00 a 23:00',
        servicios: ['Envío a domicilio', 'Recoger en local']
      }
    ];
    this.infoCarrito = null;
  }

  connectedCallback() {
    // DECLARAR ELEMENTOS
    this.btnMetodoLocal = this.querySelector('#phpc-metodo-local');
    this.btnMetodoDomicilio = this.querySelector('#phpc-metodo-domicilio');

    this.bodyModalLocalSeleccionado = this.querySelector('#phpc-modal-body-local-seleccionado');
    this.etiquetaModalLocalSeleccionado = this.querySelector('#phpc-etiqueta-informacion-modal-local-seleccionado');
    this.etiquetaLocalSeleccionado = this.querySelector('#pcktph-seleccion-local-detalle-info'); 
    this.btnVerDireccionEnMapa = this.querySelector('#phpc-btn-ver-direccion-mapa');
    this.inputSeleccionarLocal = this.querySelector('#phpc-input-buscar-local');
    this.contenedorReultadosBusquedaLocal = this.querySelector('#smecph-pc-resultados-input');
    this.btnIconoMostrarTodosLocales = this.querySelector('#phpc-mostrar-todos-locales');

    this.contenedorBaseModal = this.querySelector('.ph-background-container-modal');
    this.btnsSeleccionMetodoEntrega = this.querySelectorAll('.smecph-opcion-metodo');
    this.contenedorBaseSeleccionLocal = this.querySelector('#pcktph-seleccion-local');
    this.contenedorBaseSeleccionDireccionEnvio = this.querySelector('#pcktph-direccion-envio');
    this.contenedorDatosContactoInputsForm = this.querySelector('.smecph-formulario-datos-contacto');
    this.contenedorDatosContactoConsolidados = this.querySelector('.smecph-datos-contacto-consolidados');
    this.mensajeAlertaSeleccionMetodoPago = this.querySelector('.smecph-mensaje-alerta');
    this.btnsMetodosPagos = this.querySelectorAll('.smecph-pc-dp-item');
    // INICIALIZAR EVENTOS

    this.btnMetodoLocal.addEventListener('click', this.seleccionarMetodoLocal.bind(this));
    this.btnMetodoDomicilio.addEventListener('click', this.seleccionarMetodoDomicilio.bind(this));

    // INICIALIZAR ELEMENTOS Y PROCESOS BASICOS

    // local y domicilio
    this.estadoPagina = localStorage.getItem('ph-metodo-entrega');
    this.inicializarDataContruccion();
  }

  async inicializarDataContruccion(){
    MensajeCargaDatos.mostrar('Cargando información del pagina ...');

    if(this.estadoPagina == "domicilio"){
      this.contenedorBaseSeleccionDireccionEnvio.style.display = "flex";
      this.contenedorBaseSeleccionLocal.style.display = "none";
      this.btnMetodoDomicilio.classList.add('seleccionado');
      const iconoSeleccionado = this.btnMetodoDomicilio.querySelector('.smecph-opcion-icono'); 
      iconoSeleccionado.innerHTML = window.shopIcons.icon_estado_on;
    }

    if(this.estadoPagina == "local"){
      this.contenedorBaseSeleccionDireccionEnvio.style.display = "none";
      this.contenedorBaseSeleccionLocal.style.display = "flex";
      this.btnMetodoLocal.classList.add('seleccionado');
      const iconoSeleccionado = this.btnMetodoLocal.querySelector('.smecph-opcion-icono');
      iconoSeleccionado.innerHTML = window.shopIcons.icon_estado_on;
    }

    this.infoCarrito = await AuxiliaresGlobal.obtenerCarritoShopify();
    
    this.configuracionAutoCompletadoSeleccionLocal();
    
    MensajeCargaDatos.ocultar();
  }

  seleccionarMetodoLocal(){
    this.estadoPagina = "local";
    this.contenedorBaseSeleccionDireccionEnvio.style.display = "none";
    this.contenedorBaseSeleccionLocal.style.display = "flex";
    this.btnMetodoLocal.classList.add('seleccionado');
    const iconoSeleccionado = this.btnMetodoLocal.querySelector('.smecph-opcion-icono');
    iconoSeleccionado.innerHTML = window.shopIcons.icon_estado_on;

    this.btnMetodoDomicilio.classList.remove('seleccionado');
    const iconoDesSeleccionado = this.btnMetodoDomicilio.querySelector('.smecph-opcion-icono');
    iconoDesSeleccionado.innerHTML = window.shopIcons.icon_estado_off;
  }

  seleccionarMetodoDomicilio(){
    this.estadoPagina = "domicilio";
    this.contenedorBaseSeleccionDireccionEnvio.style.display = "flex";
    this.contenedorBaseSeleccionLocal.style.display = "none";
    this.btnMetodoDomicilio.classList.add('seleccionado');
    const iconoSeleccionado = this.btnMetodoDomicilio.querySelector('.smecph-opcion-icono');
    iconoSeleccionado.innerHTML = window.shopIcons.icon_estado_on;

    this.btnMetodoLocal.classList.remove('seleccionado');
    const iconoDesSeleccionado = this.btnMetodoLocal.querySelector('.smecph-opcion-icono');
    iconoDesSeleccionado.innerHTML = window.shopIcons.icon_estado_off;
  }

  configuracionAutoCompletadoSeleccionLocal() {
    // Verificar que el input existe
    if (!this.inputSeleccionarLocal) return;
    
    // Variable para almacenar el timer del debounce
    let timeoutId = null;
    
    // Configurar evento de entrada en el input
    this.inputSeleccionarLocal.addEventListener('input', (event) => {
      // Limpiar el timer anterior si existe
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      const query = event.target.value;
      
      // Si el input está vacío, ocultar sugerencias
      if (!query) {
        this.contenedorReultadosBusquedaLocal.style.display = "none"; 
        return;
      }
      
      // Configurar debounce (500ms)
      timeoutId = setTimeout(() => {
        // Solo mostrar los 3 primeros resultados más relevantes
        this.buscarSugerenciasSeleccionLocal(query, 3);
      }, 500);
    });
    
    // Configurar evento para el botón de mostrar/ocultar
    this.btnIconoMostrarTodosLocales.addEventListener('click', () => {
      // Si el contenedor ya está visible, ocultarlo
      if (this.contenedorReultadosBusquedaLocal.style.display === "block") {
        this.contenedorReultadosBusquedaLocal.style.display = "none";
        return;
      }
      
      const query = this.inputSeleccionarLocal.value;
      
      // Si el input está vacío, mostrar todos los locales
      if (!query) {
        this.mostrarTodosLosLocales();
      } else {
        // Si hay texto en el input, mostrar los 3 resultados más asertados
        this.buscarSugerenciasSeleccionLocal(query, 3);
      }
    });
    
    // Cerrar sugerencias al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!this.inputSeleccionarLocal.contains(e.target) && 
          !this.contenedorReultadosBusquedaLocal.contains(e.target) &&
          !this.btnIconoMostrarTodosLocales.contains(e.target)) {
        this.contenedorReultadosBusquedaLocal.style.display = 'none';
      }
    });
  }

  // Método para mostrar todos los locales
  mostrarTodosLosLocales() {
    // Simplemente llamamos a buscarSugerenciasSeleccionLocal sin límite
    // para mostrar todos los locales
    this.buscarSugerenciasSeleccionLocal('', null);
  }

  buscarSugerenciasSeleccionLocal(query, limite = null) {
    // Filtrar las ubicaciones basadas en la consulta
    let resultados = this.pizzaLocations.filter(location => 
      location.name.toLowerCase().includes(query.toLowerCase()) ||
      location.localizacion.toLowerCase().includes(query.toLowerCase())
    );
    
    // Ordenar por relevancia (priorizar coincidencias en el nombre)
    resultados.sort((a, b) => {
      const aInName = a.name.toLowerCase().includes(query.toLowerCase());
      const bInName = b.name.toLowerCase().includes(query.toLowerCase());
      
      if (aInName && !bInName) return -1;
      if (!aInName && bInName) return 1;
      return 0;
    });
    
    // Limitar resultados si se especifica un límite
    if (limite && resultados.length > limite) {
      resultados = resultados.slice(0, limite);
    }
  
    // Limpiar resultados anteriores
    this.contenedorReultadosBusquedaLocal.innerHTML = '';
    
    // Si hay resultados, mostrar el contenedor
    if (resultados.length > 0) {
      this.contenedorReultadosBusquedaLocal.style.display = "block";
      
      // Crear y añadir elementos para cada resultado
      resultados.forEach(location => {
        const resultadoItem = document.createElement('div');
        resultadoItem.className = 'smecph-pc-resultado-item';
        
        // Crear elemento para el nombre en negrita
        const nombreLocal = document.createElement('p');
        nombreLocal.innerHTML = `<strong>${location.name}</strong>`;
        
        // Crear elemento para el teléfono
        const telefonoLocal = document.createElement('p');
        telefonoLocal.textContent = `Tel: ${location.telefono}`;
        
        // Añadir elementos al item
        resultadoItem.appendChild(nombreLocal);
        resultadoItem.appendChild(telefonoLocal);
        
        // Añadir evento de clic para seleccionar este local
        resultadoItem.addEventListener('click', () => {
          this.seleccionarLocal(location);
        });
        
        // Añadir el item al contenedor de resultados
        this.contenedorReultadosBusquedaLocal.appendChild(resultadoItem);
      });
    } else {
      // Si no hay resultados, ocultar el contenedor
      this.contenedorReultadosBusquedaLocal.style.display = "none";
    }
  }

  configuracionAutoCompletadoDireccionEnvio(){}

}

customElements.define('page-checkout-ph', PageCheckoutPH);