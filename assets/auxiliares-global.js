
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

      let contenidoIzquierdoHTML = '';
      let precioTotal = 0;

      infoCarrito.informacionCompleta.items.forEach((item) => {
        if(!(item.properties && item.properties.estructura)){
          return;
        }
        
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
      // accionBtn == "incrementar" ? cantidadElemento++ : cantidadElemento--;
      var cantidadNuevaTrabajo = cantidadElemento;
      var cantidadAntiguaTrabajo = accionBtn == "incrementar" ? cantidadElemento - 1 : cantidadElemento + 1;

      console.log("Testeo de cantidadElemento", {
        cantidadElemento,
        cantidadAntiguaTrabajo,
        cantidadNuevaTrabajo,
      });

      if(informacionCompleta.opcionesPrincipales.productos.length == 0 && informacionCompleta.complementos.productos.length == 0){
        informacionCompleta.producto.cantidad = cantidadElemento;
        informacionCompleta.producto.precioTotalConjunto = informacionCompleta.producto.precio * cantidadElemento;
      }else {
        // 1. Primero se optiene el precio del producto base y se lo multiplica por la cantidad actual
        let cantidadProductoBaseNuevo = parseInt(informacionCompleta.producto.precioProducto) * cantidadNuevaTrabajo;
        // 2. Se optiene el precio del producto base y se lo multiplica por la cantidad antigua
        let cantidadProductoBaseAntiguo = parseInt(informacionCompleta.producto.precioProducto) * cantidadAntiguaTrabajo;
        // 3. Se optiene el precio total del conjunto (producto base + complementos + opciones principales) 
        let cantidadPrecioTotalAntiguo = parseFloat(informacionCompleta.producto.precioTotalConjunto);
        
        let cantidadOpcionesPrincipalesAntiguo = 0;
        let cantidadOpcionesPrincipalesNueva = 0;

        // 4. Se va recorrer las opciones principales
        informacionCompleta.opcionesPrincipales.productos.forEach((producto) => {
          // 5. Se optiene el precio
          cantidadOpcionesPrincipalesNueva  += (cantidadNuevaTrabajo * parseInt(producto.precio));
          cantidadOpcionesPrincipalesAntiguo += (cantidadAntiguaTrabajo * parseInt(producto.precio));
          producto.cantidad = cantidadNuevaTrabajo;
        });
        let cantidadSolamenteComplementos = cantidadPrecioTotalAntiguo - (cantidadProductoBaseAntiguo + cantidadOpcionesPrincipalesAntiguo);

        // Ell nuevo precio del conjunto se calcula (cantidadProductoBaseNuevo + cantidadOpcionesPrincipalesNueva + cantidadSolamenteComplementos)
        informacionCompleta.producto.cantidad = cantidadElemento;
        informacionCompleta.producto.precioTotalConjunto = cantidadProductoBaseNuevo + cantidadOpcionesPrincipalesNueva + cantidadSolamenteComplementos;
        console.log("Testeo completo :",{
          cantidadElemento,
          cantidadAntiguaTrabajo,
          cantidadNuevaTrabajo,
          cantidadPrecioTotalAntiguo,
          cantidadOpcionesPrincipalesNueva,
          cantidadOpcionesPrincipalesAntiguo,
          cantidadSolamenteComplementos,
          "Objeto actualizado" : informacionCompleta.producto.precioTotalConjunto
        })
      }

        console.log("Testeo completo :",{
        cantidadElemento,
        cantidadAntiguaTrabajo,
        cantidadNuevaTrabajo,


        })
  
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

    this.localSeleccionado = null;
    this.direccionSeleccionada = null;

    this.placesService = null;
    // {
    //   "lat" : -17.783315017953004,
    //   "lng" : -63.18214577296119,
    //   "indicaciones referencias para tu direccion" : "Poner si o si (Santa Cruz), 
    //    (Si no se pone nada en indicicaciones usar las indicaciones de google)",
    //   "alias" : "Este es el que se vera primero si o si",
    // }

    this.coordenadasProcesoNuevaDireccion = null;
    this.estadoFaseNuevaDireccion = 1;
    this.listaDireccionPrueba = [
      {
        "lat" : -17.783315017953004,
        "lng" : -63.18214577296119,
        "indicaciones" : "Puente Urubo 91, Santa Cruz de la Sierra",
        "alias" : "Condominio de la amante",
      },
      {
        "lat" : -17.783315017953004,
        "lng" : -63.18214577296119,
        "indicaciones" : "Santa Cruz, San Martin 2200, Bolivia",
        "alias" : "Casa del abuelo",
      },
      {
        "lat" : -17.783315017953004,
        "lng" : -63.18214577296119,
        "indicaciones" : "Santa Cruz, Av. Santos Dumont 3228, Bolivia",
        "alias" : "Casa por mi suegra",
      },
      {
        "lat" : -17.783315017953004,
        "lng" : -63.18214577296119,
        "indicaciones" : "Santa Cruz, Av. Banzer 3er Anillo, Bolivia",
        "alias" : "Trabajo",
      }
    ]

    this.seleccionadoEstadoPago = null;
  }

  connectedCallback() {
    // DECLARAR ELEMENTOS
    this.btnMetodoLocal = this.querySelector('#phpc-metodo-local');
    this.btnMetodoDomicilio = this.querySelector('#phpc-metodo-domicilio');

    this.bodyModalLocalSeleccionado = this.querySelector('#phpc-modal-body-local-seleccionado');
    this.modalBodyContenedorMapa = this.querySelector('#phpc-localSeleccionado-mapa');
    this.btnCerrarModalContenedorLocalSeleccionado = this.querySelector('#phpc-btn-cerrar-modal');
    this.etiquetaModalLocalSeleccionado = this.querySelector('#phpc-etiqueta-informacion-modal-local-seleccionado');
    this.etiquetaLocalSeleccionado = this.querySelector('#pcktph-seleccion-local-detalle-info'); 
    this.btnVerDireccionEnMapa = this.querySelector('#phpc-btn-ver-direccion-mapa');
    this.inputSeleccionarLocal = this.querySelector('#phpc-input-seleccionar-local');
    this.contenedorResultadosBuquedaLocal = this.querySelector('#phpc-resultados-seleccion-local');
    this.btnIconoMostrarTodosLocales = this.querySelector('#phpc-mostrar-todos-locales');

    this.contenedorModalMapaNuevaDireccion = this.querySelector('#phpc-modal-nd-mapa');
    this.btnAnadirNuevaDireccion = this.querySelector('#phpc-btn-anadir-nueva-direccion');
    this.btnVolverAtrasNuevaDireccion = this.querySelector('#phpc-btn-modal-volver-atras');
    this.contenedorResultadosBusquedaDireccion = this.querySelector('#phpc-resultados-seleccion-direccion-envio');
    // this.inputSeleccionarDireccion = this.querySelector('#phpc-input-seleccionar-direccion');
    this.btnCerrarModalNuevaDireccion = this.querySelector('#phpc-btn-cerrar-modal-nuevadireccion');
    this.modalBodyNuevaDireccion = this.querySelector('#phpc-modal-body-nueva-direccion');
    this.modalContenidoF1NuevaDireccion = this.querySelector('#phpc-modal-nd-fase1');
    this.btnMiUbicacionActualF1 = this.querySelector('#phpc-btn-miubicacionactual-nd');
    this.inputPuntoReferenciaF1 = this.querySelector('#phpc-input-punto-referencia-nd');
    this.contenedorResultadosBusquedaReferenciasF1 = this.querySelector('#phpc-resultados-sugerencias-referencia');
    this.modalContenidoF2NuevaDireccion = this.querySelector('#phpc-modal-nd-fase2');
    this.modalContenidoF3NuevaDireccion = this.querySelector('#phpc-modal-nd-fase3');
    this.inputIndicacionesDireccionF3 = this.querySelector('#phpc-input-indicaciones-nd');
    this.inputAliasDireccionF3 = this.querySelector('#phpc-input-alias-nd');
    this.etiquetaBtnModalNuevaDireccion = this.querySelector('#phpc-etiqueta-btn-acciones');
    this.footerModalNuevaDireccion = this.querySelector('#phpc-modal-footer-nd');
    this.btnProcesoPrincipalNd = this.querySelector('#phpc-btn-proceso-principal-nd');
    this.btnCancelarNd = this.querySelector('#phpc-btn-cancelar-nd');

    this.contenedorDireccionEnvioSeleccionado = this.querySelector('#phpc-direccion-envio-de-uso');
    this.etiquetaAliasDireccion = this.querySelector('#phpc-alias-direccion-envio');
    this.etiquetaIndicacionesDireccion = this.querySelector('#phpc-referencias-direccion-envio');

    this.contenedorBaseModal = this.querySelector('.ph-background-container-modal');
    this.btnsSeleccionMetodoEntrega = this.querySelectorAll('.smecph-opcion-metodo');
    
    this.contenedorBaseSeleccionLocal = this.querySelector('#pcktph-seleccion-local');
    this.contenedorBaseSeleccionDireccionEnvio = this.querySelector('#phpc-seccion-seleccion-local');
    this.contenedorDatosContactoInputsForm = this.querySelector('.smecph-formulario-datos-contacto');
    this.contenedorDatosContactoConsolidados = this.querySelector('.smecph-datos-contacto-consolidados');
    this.mensajeAlertaSeleccionMetodoPago = this.querySelector('.smecph-mensaje-alerta');
    this.btnsMetodosPagos = this.querySelectorAll('.smecph-pc-dp-item');

    // Formulario Datos de contacto
    this.seccionFormDatosContacto = this.querySelector('#phpc-sector-datos-contacto');
    this.btnEditarDatos = this.querySelector('#phpc-btn-editar-datos-contacto');
    this.btnGuardarDatos = this.querySelector('#phpc-btn-guardar-datos-contacto');
    this.formDatosContacto = this.querySelector('#phpc-form-datos-contacto');
    this.contenedorDatoContactoConsolidados = this.querySelector('#phpc-datos-contacto-consolidados');
    this.etiquetaDatosConsolidados = this.querySelector('#phpc-etiqueta-datos-consolidados');
    this.contenedorDatosContactoEditar = this.querySelector('#phpc-form-datos-contacto');
    this.inputNombreContacto = this.querySelector('#phpc-input-nombre-contacto');
    this.alertaNombreContacto = this.querySelector('#phpc-alerta-nombre-contacto');
    this.inputApellidoContacto = this.querySelector('#phpc-input-apellido-contacto');
    this.alertaApellidoContacto = this.querySelector('#phpc-alerta-apellido-contacto');
    this.inputCorreoElectronico = this.querySelector('#phpc-input-correo-contacto');
    this.alertaCorreoElectronico = this.querySelector('#phpc-alerta-correo-contacto');
    this.inputCelularContacto = this.querySelector('#phpc-input-celular-contacto');
    this.alertaCelularContacto = this.querySelector('#phpc-alerta-celular-contacto');
    this.mensajeInfoCelularContacto = this.querySelector('#phpc-mensaje-info-celular-contacto');
    this.inputCIContacto = this.querySelector('#phpc-input-ci-contacto');
    this.alertaCIContacto = this.querySelector('#phpc-alerta-ci-contacto');

    // Datos de pago
    this.seccionGeneralMetodosPago =  this.querySelector('#phpc-sector-metodos-de-pago');
    this.mensajeAlertaDatosFacturacion = this.querySelector('#phpc-mensaje-alerta-datos-facturacion');
    this.opcionesTarjetaCredito = this.querySelector('#phpc-opciones-tarjeta-credito');
    this.inputPrimero4Digitos = this.querySelector('#phpc-input-primero-4-digitos');
    this.mensajeAlertaPrimero4Digitos = this.querySelector('#phpc-alerta-primero-4-digitos');
    this.inputUltimos4Digitos = this.querySelector('#phpc-input-ultimos-4-digitos');
    this.mensajeAlertaUltimos4Digitos = this.querySelector('#phpc-alerta-ultimos-4-digitos');
    this.btnsMetodosPagos = this.querySelectorAll('#phpc-btn-metodo-pago');
    
    // Datos de facturacion
    this.etiquetaDatosFacturacionConsolidados = this.querySelector('#phpc-etiqueta-datos-facturacion-consolidados');
    this.contenedorDatosFacturacion = this.querySelector('#phpc-form-datos-facturacion');
    this.contenedorDatosFacturacionConsolidados = this.querySelector('#phpc-datos-facturacion-consolidados');
    this.btnEditarDatosFacturacion = this.querySelector('#phpc-btn-editar-datos-facturacion');
    this.btnGuardarDatosFacturacion = this.querySelector('#phpc-btn-guardar-datos-facturacion');
    this.inputRazonSocial = this.querySelector('#phpc-input-razon-social');
    this.inputNitoCit = this.querySelector('#phpc-input-nit-cit');

    // Carrito
    this.btnEditarCarrito = this.querySelector('#phpc-btn-editar-carrito');
    this.contenedorItemsCarrito = this.querySelector('#phpc-contenedor-items-carrito');
    this.btnEditarCarrito = this.querySelector('#phpc-btn-editar-carrito');
    this.etiquetaSubtotal = this.querySelector('#phpc-etiqueta-subtotal');
    this.etiquetaTotal = this.querySelector('#phpc-etiqueta-total');

    // Hut Coins
    this.contenedorHutCoins = this.querySelector('#phpc-hutcoins');
    this.btnHutCoins = this.querySelector('#phpc-btn-hutcoins');
    this.inputFechaNacimiento = this.querySelector('#phpc-input-fecha-nacimiento');
    this.inputNotaParaElPedido = this.querySelector('#phpc-info-adicional-notapedido');
    this.inputCodigoCupon = this.querySelector('#phpc-input-codigo-cupon');
    this.btnAplicarCupon = this.querySelector('#phpc-btn-aplicar-cupon');

    this.btnContinuar = this.querySelector('#phpc-btn-continuar-general');

    // INICIALIZAR EVENTOS
    this.btnMetodoLocal.addEventListener('click', this.seleccionarMetodoLocal.bind(this));
    this.btnMetodoDomicilio.addEventListener('click', this.seleccionarMetodoDomicilio.bind(this));
    this.btnVerDireccionEnMapa.addEventListener('click', this.verDireccionEnMapaLocalSeleccionado.bind(this));
    this.btnCerrarModalContenedorLocalSeleccionado.addEventListener('click', this.cerrarModalLocalSeleccionado.bind(this));
    this.btnAnadirNuevaDireccion.addEventListener('click', this.procesoParaAnadirNuevaDireccion.bind(this));
    this.btnCerrarModalNuevaDireccion.addEventListener('click', this.cerrarModalNuevaDireccion.bind(this));
    this.btnVolverAtrasNuevaDireccion.addEventListener('click', this.procesoVolverAtrasNuevaDireccion.bind(this));
    this.btnMiUbicacionActualF1.addEventListener('click', this.procesoMiUbicacionActualF1.bind(this));
    this.btnProcesoPrincipalNd.addEventListener('click', this.procesoPrincipalNuevaDireccion.bind(this));
    this.btnCancelarNd.addEventListener('click', this.procesoVolverAtrasNuevaDireccion.bind(this));
    this.inputAliasDireccionF3.addEventListener('input',(event)=>{
      const query = event.target.value.trim();
      console.log("Query de indicaciones", query);
      if(query == "" && this.estadoFaseNuevaDireccion == 3){
        this.btnProcesoPrincipalNd.classList.add('desactivado');
      }else{
        this.btnProcesoPrincipalNd.classList.remove('desactivado');
      }
    });
    this.btnEditarDatos.addEventListener('click', (event) => {
      this.btnAccionDatosContacto(event.currentTarget);
    });
    this.btnGuardarDatos.addEventListener('click', (event)=>{
      this.btnAccionDatosContacto(event.currentTarget);
    });
    this.btnEditarDatosFacturacion.addEventListener('click', (event) => {
      this.btnAccionDatosFacturacion(event.currentTarget);
    });
    this.btnGuardarDatosFacturacion.addEventListener('click', (event)=>{
      this.btnAccionDatosFacturacion(event.currentTarget);
    });
    this.btnsMetodosPagos.forEach((btn) => {
      btn.addEventListener('click', (event) => {
        this.procesoSeleccionMetodoPago(event.currentTarget);
      });
    });
    this.btnContinuar.addEventListener('click', this.procesoContinuarGeneral.bind(this));
    this.btnHutCoins.addEventListener('click', (event)=>{
      this.procesoHutCoins(event.currentTarget);
    });
    this.btnEditarCarrito.addEventListener('click', (event)=>{
      this.procesoEditarCarrito(event.currentTarget);
    });
    // INICIALIZAR ELEMENTOS Y PROCESO

    // local y domicilio
    this.estadoPagina = localStorage.getItem('ph-metodo-entrega') || "domicilio";
    this.direccionSeleccionada = this.listaDireccionPrueba[0];
    this.inicializarDatosdeContacto();
    this.inicializarDatosdeFacturacion();
    this.inicializarDataContruccion();
  }

  // PROCESO DE CONTENEDOR SUGERENCIAS PUNTOS DE REFERENCIAS
  configuracionAutoCompletadoPuntosReferencia() {
    // Verificar que el input existe
    if (!this.inputPuntoReferenciaF1) return;
    
    // Variable para almacenar el timer del debounce
    let timeoutId = null;

    // Variable para el servicio de Google Places
    this.placesService = new google.maps.places.AutocompleteService();
    
    // Configurar evento de entrada en el input
    this.inputPuntoReferenciaF1.addEventListener('input', (event) => {
      // Limpiar el timer anterior si existe
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      const query = event.target.value;
      
      // Si el input está vacío, ocultar sugerencias
      if (!query) {
        this.contenedorResultadosBusquedaReferenciasF1.style.display = "none"; 
        return;
      }
      
      // Configurar debounce (500ms)
      timeoutId = setTimeout(() => {
        // Solo mostrar los 3 primeros resultados más relevantes
        this.buscarSugerenciasSeleccionReferencia(query);
      }, 500);
    });
    
    // Cerrar sugerencias al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!this.inputPuntoReferenciaF1.contains(e.target) && 
          !this.contenedorResultadosBusquedaReferenciasF1.contains(e.target)) {
        this.contenedorResultadosBusquedaReferenciasF1.style.display = 'none';
      }
    });
  }

  buscarSugerenciasSeleccionReferencia(query) {
    // Opciones para la busqueda
    const opcionesBusqueda = {
      input: query,
      componentRestrictions: { country: 'BO' },
    }

    // Realizar la busqueda
    this.placesService.getPlacePredictions(opcionesBusqueda, (predicciones, status) => {
      // Limpiar contenedor de sugerencias
      this.contenedorResultadosBusquedaReferenciasF1.innerHTML = '';

      if (status !== google.maps.places.PlacesServiceStatus.OK || !predicciones) {
        this.contenedorResultadosBusquedaReferenciasF1.style.display = 'none';
        return;
      }

      // Limitar a 3 resultados
      const sugerencias = predicciones.slice(0, 3);

      // Mostrar sugerencias
      sugerencias.forEach(sugerencia => {
        const elemento = document.createElement('div');
        elemento.className = 'smecph-pc-resultado-item-especial';

        // Crear elemento para el nombre del lugar
        const textoElemento = document.createElement('p');
        textoElemento.textContent = sugerencia.description;
        elemento.appendChild(textoElemento);

        // Agregar evento de clic 
        elemento.addEventListener('click', () => {
          this.seleccionarPuntoReferencia(sugerencia);
        });

        this.contenedorResultadosBusquedaReferenciasF1.appendChild(elemento);
      });

      // Mostrar el contenedor
      if(sugerencias.length > 0){
        this.contenedorResultadosBusquedaReferenciasF1.style.display = 'flex';
      }else{
        this.contenedorResultadosBusquedaReferenciasF1.style.display = 'none';
      }
    });
  }

  seleccionarPuntoReferencia(sugerencia) {
    this.inputPuntoReferenciaF1.value = sugerencia.description;
    this.contenedorResultadosBusquedaReferenciasF1.style.display = 'none';
  
    // Obtener las coordenadas del lugar seleccionado
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ placeId: sugerencia.place_id }, (resultados, status) => {
      if (status === google.maps.GeocoderStatus.OK && resultados[0]) {
        const location = resultados[0].geometry.location;
        // Convertir el objeto LatLng de Google Maps a un objeto JavaScript simple
        this.coordenadasProcesoNuevaDireccion = { 
          lat: location.lat(), 
          lng: location.lng() 
        };
        this.coordenadas = this.coordenadasProcesoNuevaDireccion;
        console.log('Coordenadas seleccionadas:', this.coordenadasProcesoNuevaDireccion);
      } else {
        console.error('Error al obtener las coordenadas:', status);
      }
    });
  }

  // PROCESO DE CONTENEDOR SUGERENCIAS BUSQUEDA LOCALA
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
        this.contenedorResultadosBuquedaLocal.style.display = "none"; 
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
      if (this.contenedorResultadosBuquedaLocal.style.display === "block") {
        this.contenedorResultadosBuquedaLocal.style.display = "none";
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
          !this.contenedorResultadosBuquedaLocal.contains(e.target) &&
          !this.btnIconoMostrarTodosLocales.contains(e.target)) {
        this.contenedorResultadosBuquedaLocal.style.display = 'none';
      }
    });
  }

  // Método para mostrar todos los locales
  mostrarTodosLosLocales() {
    // Simplemente llamamos a buscarSugerenciasSeleccionLocal sin límite
    // para mostrar todos los locales
    if (this.contenedorResultadosBuquedaLocal.style.display === "none") {
      this.buscarSugerenciasSeleccionLocal('', null);
      this.contenedorResultadosBuquedaLocal.style.display = "flex";
    }else{
      this.contenedorResultadosBuquedaLocal.style.display = "none";
    }
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
    this.contenedorResultadosBuquedaLocal.innerHTML = '';
    
    // Si hay resultados, mostrar el contenedor
    if (resultados.length > 0) {
      this.contenedorResultadosBuquedaLocal.style.display = "flex";
      
      // Crear y añadir elementos para cada resultado
      resultados.forEach(location => {
        const resultadoItem = document.createElement('div');
        resultadoItem.className = 'smecph-pc-resultado-item';
        
        // Crear elemento para el nombre
        const nombreLocal = document.createElement('p');
        nombreLocal.textContent = location.name;
        
        // Crear elemento para la dirección
        const direccionLocal = document.createElement('p');
        direccionLocal.textContent = location.localizacion;
        
        // Añadir elementos al item
        resultadoItem.appendChild(nombreLocal);
        resultadoItem.appendChild(direccionLocal);
        
        // Añadir evento de clic para seleccionar este locall
        resultadoItem.addEventListener('click', () => {
          this.seleccionarLocal(location);
        });
        
        // Añadir el item al contenedor de resultados
        this.contenedorResultadosBuquedaLocal.appendChild(resultadoItem);
      });
    } else {
      // Si no hay resultados, ocultar el contenedor
      this.contenedorResultadosBuquedaLocal.style.display = "none";
    }
  }

  seleccionarLocal(location) {
    this.localSeleccionado = location;
    // this.coordenadas = { lat: location.lat, lng: location.lng };

    // Actualizar el input con el nombre del local seleccionadoo
    this.inputSeleccionarLocal.value = location.name;
    
    // Ocultar sugerencias
    this.contenedorResultadosBuquedaLocal.style.display = "none";
    
    // Mostrar detalles del local seleccionadoo
    const detalleLocal = this.querySelector('.pcktph-seleccion-local-detalle');
    detalleLocal.style.display = "flex";

    const distancia = this.calcularDistancia(this.coordenadas, {lat: location.lat, lng: location.lng});
    this.etiquetaModalLocalSeleccionado.textContent = `Local : ${location.name} (${distancia.toFixed(2)} Km) de tu ubicación`;

    // Actualizar información del local seleccionado
    const infoLocal = this.querySelector('.pcktph-seleccion-local-detalle-info');
    infoLocal.innerHTML = `
      <p>${location.name.toUpperCase()}</p>
      <p>+591 ${location.telefono} - ${parseFloat(distancia).toFixed(2)} Km</p>
    `;
  }

  // PROCESO DE CONTENEDOR SUGERENCIAS DIRECCION DE ENVI
  configuracionAutoCompletadoSeleccionDireccion(){
        // Verificar que el input existe
        // if (!this.inputSeleccionarDireccion) return;
    
        // Variable para almacenar el timer del debounce
        let timeoutId = null;
        
        // Configurar evento de entrada en el input
        // this.inputSeleccionarDireccion.addEventListener('input', (event) => {
        //   // Limpiar el timer anterior si existe
        //   if (timeoutId) {
        //     clearTimeout(timeoutId);
        //   }
          
        //   const query = event.target.value;
          
        //   // Si el input está vacío, ocultar sugerencias
        //   if (!query) {
        //     this.contenedorResultadosBusquedaDireccion.style.display = "none"; 
        //     return;
        //   }
          
        //   // Configurar debounce (500ms)
        //   timeoutId = setTimeout(() => {
        //     // Solo mostrar los 3 primeros resultados más relevantes
        //     this.buscarSugerenciasSeleccionDireccion(query, 3);
        //   }, 500);
        // });
        
        // Configurar evento para el botón de mostrar/ocultar
        this.contenedorDireccionEnvioSeleccionado.addEventListener('click', () => {
          // Si el contenedor ya está visible, ocultarlo
          if (this.contenedorResultadosBusquedaDireccion.style.display === "flex") {
            this.contenedorResultadosBusquedaDireccion.style.display = "none";
            return;
          }
          
          const query = this.inputSeleccionarLocal.value;
          
          // Si el input está vacío, mostrar todos los locales
          if (!query) {
            this.mostrarTodasDirecciones();
          } else {
            // Si hay texto en el input, mostrar los 3 resultados más asertados
            this.buscarSugerenciasSeleccionDireccion(query, 3);
          }
        });
        
        // Cerrar sugerencias al hacer clic fueraaa
        document.addEventListener('click', (e) => {
          if (!this.contenedorResultadosBusquedaDireccion.contains(e.target) &&
              !this.contenedorDireccionEnvioSeleccionado.contains(e.target)) {
            this.contenedorResultadosBusquedaDireccion.style.display = 'none';
          }
        });
  }

  mostrarTodasDirecciones(){
    if (this.contenedorResultadosBusquedaDireccion.style.display === "none") {
      this.buscarSugerenciasSeleccionDireccion('', null);
      this.contenedorResultadosBusquedaDireccion.style.display = "flex";
    }else{
      this.contenedorResultadosBusquedaDireccion.style.display = "none";
    }
  }

  buscarSugerenciasSeleccionDireccion(query, limite = null) {
    // Filtrar las ubicaciones basadas en la consulta
    let resultados = this.listaDireccionPrueba.filter(direccion => 
      direccion.indicaciones.toLowerCase().includes(query.toLowerCase()) ||
      direccion.alias.toLowerCase().includes(query.toLowerCase())
    );
    
    // Ordenar por relevancia (priorizar coincidencias en el nombre)
    resultados.sort((a, b) => {
      const aInAlias = a.alias.toLowerCase().includes(query.toLowerCase());
      const bInAlias = b.alias.toLowerCase().includes(query.toLowerCase());
      
      if (aInAlias && !bInAlias) return -1;
      if (!aInAlias && bInAlias) return 1;
      return 0;
    });
    
    // Limitar resultados si se especifica un límite
    if (limite && resultados.length > limite) {
      resultados = resultados.slice(0, limite);
    }
  
    // Limpiar resultados anteriores
    this.contenedorResultadosBusquedaDireccion.innerHTML = '';
    
    // Si hay resultados, mostrar el contenedor
    if (resultados.length > 0) {
      this.contenedorResultadosBusquedaDireccion.style.display = "flex";
      
      // Crear y añadir elementos para cada resultado
      resultados.forEach(direccion => {
        const resultadoItem = document.createElement('div');
        resultadoItem.className = 'smecph-pc-resultado-item';
        
        // Crear elemento para el nombre
        const nombreAlias = document.createElement('p');
        nombreAlias.textContent = direccion.alias;
        
        // Crear elemento para la dirección
        const direccionIndicacion = document.createElement('p');
        direccionIndicacion.textContent = direccion.indicaciones;
        
        // Añadir elementos al item
        resultadoItem.appendChild(nombreAlias);
        resultadoItem.appendChild(direccionIndicacion);
        
        // Añadir evento de clic para seleccionar este locall
        resultadoItem.addEventListener('click', () => {
          this.seleccionarDireccion(direccion);
        });
        
        // Añadir el item al contenedor de resultados
        this.contenedorResultadosBusquedaDireccion.appendChild(resultadoItem);
      });
    } else {
      // Si no hay resultados, ocultar el contenedor
      this.contenedorResultadosBusquedaDireccion.style.display = "none";
    }
  }

  seleccionarDireccion(direccion){
    this.direccionSeleccionada = direccion;
    this.coordenadas = { lat: direccion.lat, lng: direccion.lng };
    this.contenedorResultadosBusquedaDireccion.style.display = "none";
    this.etiquetaAliasDireccion.textContent = direccion.alias;
    this.etiquetaIndicacionesDireccion.textContent = direccion.indicaciones;
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
    console.log("Info carrito Testeo : ", this.infoCarrito);
    var contenidoHTML = "";
    var totalPrecioCarrito = 0;
    
    this.infoCarrito.informacionCompleta.items.forEach((item) => {
      if(!(item.properties && item.properties.estructura))return;

      const data = JSON.parse(item.properties.estructura);
      totalPrecioCarrito += parseInt(data.producto.precioTotalConjunto);

      contenidoHTML += `
        <div 
        data-idTrabajo="${data.producto.idTrabajo}"
        data-idShopify="${data.producto.idShopify}"
        data-handle="${data.producto.handle}"
        data-precio="${data.producto.precio}"
        class="smecph-pc-item-carrito">
          <div class="smecph-pc-item-carrito-info">
            <div class="smecph-pc-item-ci-img">
              ${data.producto.imagen == null || data.producto.imagen == '' 
                ? `<img src="{{ 'imagen-pizza-1.png' | asset_url }}" alt="${data.producto.titulo}" width="100" height="100">`
                : `<img src="${data.producto.imagen}" alt="${data.producto.titulo}" width="100" height="100">`
              }
            </div>
            <div class="smecph-pc-item-ci-detalle">
              <div class="smecph-pc-item-cid1">
                <p>${data.producto.titulo}</p>
              </div>
              <div class="smecph-pc-item-cid2">
                <p>x${item.quantity}</p>
              </div>
              <div class="smecph-pc-item-cid3">
                <div class="smecph-pc-item-cid3_total">
                  <small>Bs</small>
                  <p>${data.producto.precioTotalConjunto}</p>
                </div>
                ${
                 data.producto.descuento == null || data.producto.descuento == 0 || data.producto.descuento == undefined 
                 ? ``
                 : `                
                 <div class="smecph-pc-item-cid3_total color-letras-extra">
                  <small>Bs</small>
                  <p>${data.producto.descuento}</p>
                  </div>
                  `
                }
              </div>
            </div>
          </div>
          `
          var seraVisto = data.opcionesPrincipales.productos.length == 0 && data.complementos.productos.length == 0;

          contenidoHTML += `
          <div 
          data-seravisto="${!seraVisto}"
          style="display: none;"
          class="smecph-pc-item-carrito-extra">
            <p>${data.opcionesPrincipales.titulo}</p>
            <ul class="color-letras-extra">
          `;

          data.opcionesPrincipales.productos.forEach((producto) => {
            contenidoHTML += `
              <li>
                <p>${producto.tituloSeccion} : <br> ${producto.titulo}</p>
              </li>
            `;
          });

          contenidoHTML += `
            </ul>
            <p>${data.complementos.titulo}</p>
            <ul class="color-letras-extra">
          `;

          data.complementos.productos.forEach((producto) => {
            contenidoHTML += `
              <li>
                <p>${producto.tituloSeccion} : <br> ${producto.titulo}</p>
              </li>
            `;
          });

          contenidoHTML += `
            </ul>
          </div>
        </div>
        `;
    });

    this.etiquetaSubtotal.textContent = `Bs ${totalPrecioCarrito.toFixed(2)}`;
    this.etiquetaTotal.textContent = `Bs ${totalPrecioCarrito.toFixed(2)}`;
    this.contenedorItemsCarrito.innerHTML = contenidoHTML;
    this.itemProductoCarrito = this.querySelectorAll('.smecph-pc-item-carrito');
    this.itemProductoCarrito.forEach((item) => {
      item.addEventListener('click', (event) => {
        this.procesoVerDetallesProducto(event.currentTarget);
      });
    });
    
    this.configuracionAutoCompletadoSeleccionLocal();
    this.configuracionAutoCompletadoSeleccionDireccion();
    this.configuracionAutoCompletadoPuntosReferencia();

    this.etiquetaAliasDireccion.textContent = this.listaDireccionPrueba[0].alias;
    this.etiquetaIndicacionesDireccion.textContent = this.listaDireccionPrueba[0].indicaciones;
    
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

  verDireccionEnMapaLocalSeleccionado() {
    // Verificar que existe el contenedor para el mapa
    this.modalBodyContenedorMapa = this.querySelector('#phpc-localSeleccionado-mapa');
    
    if (!this.modalBodyContenedorMapa) {
      console.error('No se encontró el contenedor del mapa');
      return;
    }
    
    // Verificar que tenemos un local seleccionado
    if (!this.localSeleccionado) {
      console.error('No hay un local seleccionado');
      return;
    }
    
    // Asegurarse de que el contenedor del mapa sea visible
    // this.modalBodyContenedorMapa.style.display = 'flex';
    this.contenedorBaseModal.style.display = 'flex';
    this.bodyModalLocalSeleccionado.style.display = 'flex';

    // Coordenadas del local seleccionado
    const posicion = {
      lat: this.localSeleccionado.lat,
      lng: this.localSeleccionado.lng
    };
    
    // Opciones del mapa
    const opcionesMapa = {
      center: posicion,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      streetViewControl: false
    };
    
    // Crear el mapa
    const mapa = new google.maps.Map(this.modalBodyContenedorMapa, opcionesMapa);
    
    // Crear icono personalizado
    const iconoPersonalizado = {
      url: window.assets.logo_primario,
      scaledSize: new google.maps.Size(40, 40),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(20, 40) 
    };
    
    // Crear marcador
    const marcador = new google.maps.Marker({
      position: posicion,
      map: mapa,
      icon: iconoPersonalizado,
      title: this.localSeleccionado.name
    });
    
    // // Crear ventana de información
    // const contenidoInfo = `
    //   <div class="info-window-content">
    //     <h4>${this.localSeleccionado.name}</h4>
    //     <p>${this.localSeleccionado.localizacion}</p>
    //     <p>Tel: +591 ${this.localSeleccionado.telefono}</p>
    //     <p>Horario: ${this.localSeleccionado.horario}</p>
    //   </div>
    // `;
    
    // const infoWindow = new google.maps.InfoWindow({
    //   content: contenidoInfo
    // });
    
    // // Abrir ventana de información al hacer clic en el marcador
    // marcador.addListener('click', () => {
    //   infoWindow.open(mapa, marcador);
    // });
    
    // Abrir la ventana de información por defecto
    // infoWindow.open(mapa, marcador);
    
    // Guardar referencias por si necesitamos modificar el mapa después
    // this.mapaActual = mapa;
    // this.marcadorActual = marcador;
  }

  solicitarPermisosDelUsoGPSDispositivo() {
    return new Promise((resolve, reject) => {
      // Verificar si la geolocalización está disponible en el navegador
      if (!navigator.geolocation) {
        const mensaje = 'La geolocalización no está disponible en este navegador.';
        alert(mensaje);
        console.error(mensaje);
        reject(mensaje);
        return;
      }
  
      // Opciones de geolocalización
      const options = {
        enableHighAccuracy: true, // Alta precisión
        timeout: 10000,          // 10 segundos de timeout
        maximumAge: 0            // No usar cache
      };
  
      // Función de éxito
      const success = (position) => {
        // Actualizar las coordenadas con la ubicación actual
        this.coordenadas = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        console.log('Ubicación obtenida:', this.coordenadas);
        resolve(this.coordenadas);
      };
  
      // Función de error
      const error = (err) => {
        let mensaje = '';
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            mensaje = 'Has denegado el permiso para acceder a tu ubicación. No podremos mostrarte los locales más cercanos.';
            break;
          case err.POSITION_UNAVAILABLE:
            mensaje = 'La información de ubicación no está disponible en este momento.';
            break;
          case err.TIMEOUT:
            mensaje = 'Se agotó el tiempo para obtener tu ubicación.';
            break;
          default:
            mensaje = 'Ocurrió un error desconocido al obtener tu ubicación.';
            break;
        }
        
        // Mostrar alerta al usuario
        alert(mensaje);
        console.error('Error de geolocalización:', mensaje);
        reject(mensaje);
      };
  
      // Solicitar la geolocalización
      navigator.geolocation.getCurrentPosition(success, error, options);
    });
  }

  cerrarModalLocalSeleccionado(){
    this.contenedorBaseModal.style.display = 'none';
    this.bodyModalLocalSeleccionado.style.display = 'none';
  }

  calcularDistancia(coordenadas1, coordenadas2) {
    const radioTierra = 6371; // Radio de la Tierra en kilómetros
    const dLat = (coordenadas2.lat - coordenadas1.lat) * (Math.PI / 180);
    const dLng = (coordenadas2.lng - coordenadas1.lng) * (Math.PI / 180);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coordenadas1.lat * (Math.PI / 180)) * Math.cos(coordenadas2.lat * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return radioTierra * c; // Distancia en kilómetros
  }

  procesoParaAnadirNuevaDireccion(){
    this.contenedorBaseModal.style.display = 'flex';
    this.modalBodyNuevaDireccion.style.display = 'flex';
    this.estadoFaseNuevaDireccion = 1;
    this.modalContenidoF1NuevaDireccion.style.display = 'flex';
  }

  cerrarModalNuevaDireccion(){
    this.contenedorBaseModal.style.display = 'none';
    this.modalBodyNuevaDireccion.style.display = 'none';
    this.estadoFaseNuevaDireccion = 1;
    this.modalContenidoF1NuevaDireccion.style.display = 'none';
    this.modalContenidoF2NuevaDireccion.style.display = 'none';
    this.modalContenidoF3NuevaDireccion.style.display = 'none';
    this.footerModalNuevaDireccion.style.display = 'none';
  }

  procesoVolverAtrasNuevaDireccion(){
    if(this.estadoFaseNuevaDireccion == 1){
      this.cerrarModalNuevaDireccion();
    }

    if(this.estadoFaseNuevaDireccion == 2){
      this.modalContenidoF1NuevaDireccion.style.display = 'flex';
      this.footerModalNuevaDireccion.style.display = 'none';
      this.modalContenidoF2NuevaDireccion.style.display = 'none';
      this.estadoFaseNuevaDireccion = 1;
      this.coordenadasProcesoNuevaDireccion = null;
    }

    if(this.estadoFaseNuevaDireccion == 3){
      this.modalContenidoF2NuevaDireccion.style.display = 'flex';
      this.footerModalNuevaDireccion.style.display = 'flex';
      this.modalContenidoF3NuevaDireccion.style.display = 'none';
      this.etiquetaBtnModalNuevaDireccion.textContent = "CONFIRMAR DIRECCION";
      this.estadoFaseNuevaDireccion = 2;
      this.coordenadasProcesoNuevaDireccion = null;
    }
  }

  procesoMiUbicacionActualF1() {
    this.estadoFaseNuevaDireccion = 2;
    this.modalContenidoF1NuevaDireccion.style.display = 'none';
    this.modalContenidoF2NuevaDireccion.style.display = 'flex';
    this.footerModalNuevaDireccion.style.display = 'flex';
    this.etiquetaBtnModalNuevaDireccion.textContent = "CONFIRMAR DIRECCION";
  
    // Siempre inicializamos el mapa con las coordenadas por defecto
    const map = new google.maps.Map(this.contenedorModalMapaNuevaDireccion, {
      zoom: 15,
      center: this.coordenadas, // Coordenadas predeterminadas
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true
    });
  
    // Inicializar el marcador con las coordenadas predeterminadas
    const marker = new google.maps.Marker({
      position: this.coordenadas, // Coordenadas predeterminadas
      map: map,
      draggable: true,
      animation: google.maps.Animation.DROP,
      title: 'Tu ubicación'
    });
  
    // Actualizar coordenadas cuando el marcador se mueve
    google.maps.event.addListener(marker, 'dragend', (event) => {
      const newPosition = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      this.coordenadasProcesoNuevaDireccion = newPosition;
      console.log('Nueva ubicación:', this.coordenadasProcesoNuevaDireccion);
    });

    if(this.coordenadasProcesoNuevaDireccion == null){
    // Intentar obtener la ubicación del usuario después de inicializar el mapa
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        // Solo si el usuario acepta, actualizamos el mapa
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          // Actualizar coordenadas
          this.coordenadasProcesoNuevaDireccion = userLocation;
          
          // Ahora actualizamos el mapa y el marcador
          marker.setPosition(userLocation);
          map.panTo(userLocation);
          
          console.log('GPS activado, ubicación obtenida:', userLocation);
        },
        // Si el usuario rechaza o hay error, simplemente mantenemos la ubicación predeterminada
        (error) => {
          console.warn('Error al obtener la ubicación:', error.message);
          // No necesitamos hacer nada más, ya que el mapa ya está inicializado
          this.coordenadasProcesoNuevaDireccion = this.coordenadas;
        },
        // Opciones
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      // El navegador no soporta geolocalización
      console.warn('Geolocalización no soportada por este navegador');
      this.coordenadasProcesoNuevaDireccion = this.coordenadas;
    }

    }else{
      marker.setPosition(this.coordenadasProcesoNuevaDireccion);
      map.panTo(this.coordenadasProcesoNuevaDireccion);
    }


  }

  async procesoPrincipalNuevaDireccion(){
    if(this.estadoFaseNuevaDireccion == 2){
      this.estadoFaseNuevaDireccion = 3;
      this.modalContenidoF2NuevaDireccion.style.display = 'none';
      this.modalContenidoF3NuevaDireccion.style.display = 'flex';
      this.footerModalNuevaDireccion.style.display = 'flex';
      this.etiquetaBtnModalNuevaDireccion.textContent = "GUARDAR DIRECCION";
      this.btnProcesoPrincipalNd.classList.add('desactivado');
      return;
    }

    if(this.estadoFaseNuevaDireccion == 3){
      this.cerrarModalNuevaDireccion();
      this.etiquetaBtnModalNuevaDireccion.textContent = "CONFIRMAR DIRECCION";
      const alias = this.inputAliasDireccionF3.value;
      const indicaciones = this.inputIndicacionesDireccionF3.value;
      const coordenadasTexto = await AuxiliaresGlobal.obtenerDireccionDesdeCoordenadas(this.coordenadas.lat,this.coordenadas.lng);
      
      this.listaDireccionPrueba.push({
        lat: this.coordenadas.lat,
        lng: this.coordenadas.lng,
        indicaciones: indicaciones == "" ? coordenadasTexto: indicaciones,
        alias: alias,
      });

      console.log('Direccion obtenida desde coordenadas:', coordenadasTexto);

      MensajeCargaDatos.mostrar('Guardando dirección ...');
      setTimeout(() => {
        this.etiquetaIndicacionesDireccion.textContent = indicaciones == "" ? coordenadasTexto: indicaciones;
        this.etiquetaAliasDireccion.textContent = alias;
        MensajeCargaDatos.ocultar();
      }, 3000);
      this.btnProcesoPrincipalNd.classList.add('desactivado');
      this.coordenadasProcesoNuevaDireccion = null;
      return;
    }
  }

  btnAccionDatosContacto(btnElemento) {
    const accion = btnElemento.dataset.accion;
    
    // Si pasa la validación, continuar con la actualización de la interfaz
    if (accion == "editar") {
      this.btnEditarDatos.style.display = "none";
      this.btnGuardarDatos.style.display = "flex";
      this.contenedorDatosContactoEditar.style.display = "flex";
      this.contenedorDatoContactoConsolidados.style.display = "none";
    } else {
      this.btnEditarDatos.style.display = "flex";
      this.btnGuardarDatos.style.display = "none";
      this.contenedorDatosContactoEditar.style.display = "none";
      this.contenedorDatoContactoConsolidados.style.display = "flex";

      // Validar campos primero
      if (!this.validarCamposFormDatosContacto()) {
        return; // Si hay campos vacíos, detener la ejecución
      }

      // Proceso de guardar datos
      const datosActualizados = {
        nombre: this.inputNombreContacto.value,
        apellido: this.inputApellidoContacto.value,
        email: this.inputCorreoElectronico.value,
        celular: this.inputCelularContacto.value,
        ci: this.inputCIContacto.value
      };

      // Actualizar los datos en el localStorage
      localStorage.setItem('ph-datos-usuario', JSON.stringify(datosActualizados));

      // Actualizar la interfaz
      this.inputNombreContacto.textContent = datosActualizados.nombre;
      this.inputApellidoContacto.textContent = datosActualizados.apellido;
      this.inputCorreoElectronico.textContent = datosActualizados.email;
      this.inputCelularContacto.textContent = datosActualizados.celular;
      this.inputCIContacto.textContent = datosActualizados.ci;

      this.etiquetaDatosConsolidados.textContent = `${datosActualizados.nombre} | ${datosActualizados.apellido} | ${datosActualizados.email} | ${datosActualizados.celular} | ${datosActualizados.ci}`;
    }
  }

  btnAccionDatosFacturacion(btnElemento) {
    const accion = btnElemento.dataset.accion;

    if (accion == "editar") {
      this.btnEditarDatosFacturacion.style.display = "none";
      this.btnGuardarDatosFacturacion.style.display = "flex";
      this.contenedorDatosFacturacion.style.display = "flex";
      this.contenedorDatosFacturacionConsolidados.style.display = "none";
    }else{
      this.btnEditarDatosFacturacion.style.display = "flex";
      this.btnGuardarDatosFacturacion.style.display = "none";
      this.contenedorDatosFacturacion.style.display = "none";
      this.contenedorDatosFacturacionConsolidados.style.display = "flex";
      
      if(this.inputRazonSocial.value == "" || this.inputNitoCit.value == "")return;

      // Proceso de guardar datos
      const data = JSON.parse(localStorage.getItem('ph-datos-facturacion'));
      const datosActualizados = {
        razonsocial : this.inputRazonSocial.value,
        nit : this.inputNitoCit.value,
      }

      // Actualizar los datos en el localStorage
      localStorage.setItem('ph-datos-facturacion', JSON.stringify(datosActualizados));

      // Actualizar la interfaz
      this.inputRazonSocial.textContent = datosActualizados.razonsocial;
      this.inputNitoCit.textContent = datosActualizados.nit;

      this.etiquetaDatosFacturacionConsolidados.textContent = `${datosActualizados.razonsocial} | ${datosActualizados.nit}`;
    }
  }

  validarCamposFormDatosContacto() {
    const formulario = {
      nombre: this.inputNombreContacto.value.trim(),
      apellido: this.inputApellidoContacto.value.trim(),
      email: this.inputCorreoElectronico.value.trim(),
      celular: this.inputCelularContacto.value.trim(),
      ci: this.inputCIContacto.value.trim()
    };
    
    const mensajesError = {
      nombre: this.alertaNombreContacto,
      apellido: this.alertaApellidoContacto,
      email: this.alertaCorreoElectronico,
      celular: this.alertaCelularContacto,
      ci: this.alertaCIContacto
    };
    
    // Variable para rastrear contenedores con error
    const contenedoresConError = [];
    
    // Verificar campos vacíos
    let hayCampoVacio = false;
    
    Object.keys(formulario).forEach(key => {
      if (!mensajesError[key]) return;
      
      const contenedorPadre = mensajesError[key].closest('.smecph-pc-info-input');
      
      if (formulario[key] === '') {
        // Campo vacío - mostrar error
        mensajesError[key].style.display = 'flex';
        
        if (contenedorPadre) {
          contenedorPadre.classList.add('error');
          contenedoresConError.push(contenedorPadre);
        }
        
        hayCampoVacio = true;
      } else {
        // Campo con valor - ocultar error
        mensajesError[key].style.display = 'none';
        
        if (contenedorPadre) {
          contenedorPadre.classList.remove('error');
        }
      }
    });
    
    // Si hay campos vacíos, programar limpieza de erroress
    if (hayCampoVacio) {
      this.mensajeInfoCelularContacto.style.display = 'none';
      setTimeout(() => {
        // Quitar la clase de error pero mantener mensajes visibles
        contenedoresConError.forEach(contenedor => {
          contenedor.classList.remove('error');
        });
        // Ocultar todos los mensajes de alerta
        Object.values(mensajesError).forEach(alerta => {
          if (alerta) {
            alerta.style.display = 'none';
          }
        });
        
        // Volver a mostrar el mensaje informativo
        this.mensajeInfoCelularContacto.style.display = 'flex';
      }, 5000); // 5 segundos
    }
    
    return !hayCampoVacio; // Retorna true si no hay campos vacíos
  }

  validarSeleccionMetodoPago() {

    let haySeleccionado = false;
    
    for (const btn of this.btnsMetodosPagos) {
      if (btn.classList.contains('seleccionado')) {
        haySeleccionado = true;
        break; // Termina el bucle al encontrar el primer botón seleccionado
      }
    }
    
    return haySeleccionado;
  }
  validarCamposFormTarjeta(){
    const formulario = {
      primerInput: this.inputPrimero4Digitos.value.trim(),
      segundoInput: this.inputSegundo4Digitos.value.trim()
    }

    const mensajesError ={ 
      primerInput: this.mensajeAlertaPrimero4Digitos,
      segundoInput: this.mensajeAlertaSegundo4Digitos
    }

    // Variable para rastrear contenedores con error
    const contenedoresConError = [];

    // Verificar campos vacíos
    let hayCampoVacio = false;
  
    Object.keys(formulario).forEach(key => {
      if (!mensajesError[key]) return;
      
      const contenedorPadre = mensajesError[key].closest('.smecph-pc-info-input');
      
      if (formulario[key] === '') {
        // Campo vacío - mostrar error
        mensajesError[key].style.display = 'flex';
        
        if (contenedorPadre) {
          contenedorPadre.classList.add('error');
          contenedoresConError.push(contenedorPadre);
        }
        
        hayCampoVacio = true;
      } else {
        // Campo con valor - ocultar error
        mensajesError[key].style.display = 'none';
        
        if (contenedorPadre) {
          contenedorPadre.classList.remove('error');
        }
      }
    });
    
    // Si hay campos vacíos, programar limpieza de errores
    if (hayCampoVacio) {
      setTimeout(() => {
        // Quitar la clase de error pero mantener mensajes visibles
        contenedoresConError.forEach(contenedor => {
          contenedor.classList.remove('error');
        });
        // Ocultar todos los mensajes de alerta
        Object.values(mensajesError).forEach(alerta => {
          if (alerta) {
            alerta.style.display = 'none';
          }
        });
      }, 5000); // 5 segundos
    }
    
    return !hayCampoVacio; // Retorna true si no hay campos vacíos
  }

  procesoSeleccionMetodoPago(btnElemento){
    const accion = btnElemento.dataset.accion;
    const estaSeleccionado = btnElemento.classList.contains('seleccionado');

    if(estaSeleccionado == true)return;

    this.btnsMetodosPagos.forEach(btn => {
      btn.classList.remove('seleccionado');
      const iconoDesSeleccionado = btn.querySelector('.smecph-pc-dp-item-icono');
      iconoDesSeleccionado.innerHTML = window.shopIcons.icon_estado_off;
    });

    if(estaSeleccionado == false){
      this.mensajeAlertaDatosFacturacion.style.display = "none";
      btnElemento.classList.add('seleccionado');
      const iconoSeleccionado = btnElemento.querySelector('.smecph-pc-dp-item-icono');
      iconoSeleccionado.innerHTML = window.shopIcons.icon_estado_on;
    }

    this.seleccionadoEstadoPago = accion;

    // if(accion == "pago-codigo-qr"){}
    // if(accion == "pago-efectivo"){}
    if(accion == "pago-tarjeta-credito"){
      this.opcionesTarjetaCredito.style.display = "flex";
    }else{
      this.opcionesTarjetaCredito.style.display = "none";
    }
  }

  inicializarDatosdeContacto(){
    const data = JSON.parse(localStorage.getItem('ph-datos-usuario'));
    if(data){
      if(!data.permisoHutCoins){
        this.contenedorHutCoins.style.display = "flex";
      }

      this.inputNombreContacto.value = data.nombre;
      this.inputApellidoContacto.value = data.apellido;
      this.inputCorreoElectronico.value = data.email;
      this.inputCelularContacto.value = data.celular;
      this.inputCIContacto.value = data.ci;
      this.etiquetaDatosConsolidados.textContent = `${data.nombre} | ${data.apellido} | ${data.email} | +591 ${data.celular} | ${data.ci}`;
    }else{
      window.location.href = "/pages/iniciar-sesion";
    }
  }

  inicializarDatosdeFacturacion(){
    const data = JSON.parse(localStorage.getItem('ph-datos-facturacion'));
    if(data){
      this.inputRazonSocial.value = data.razonSocial;
      this.inputNitoCit.value = data.nit;
    }else{
      this.inputRazonSocial.value = "----";
      this.inputNitoCit.value = "----";
    }
    this.etiquetaDatosFacturacionConsolidados.textContent = `${this.inputRazonSocial.value} | ${this.inputNitoCit.value}`;
  }

  procesoVerDetallesProducto(elementoHTML){
    const hijoDetalle = elementoHTML.querySelector('.smecph-pc-item-carrito-extra');
    const seraVisto = hijoDetalle.dataset.seravisto;
    if(seraVisto == "true"){
      if(hijoDetalle.style.display == "none"){
        hijoDetalle.style.display = "flex";
      }else{
        hijoDetalle.style.display = "none";
      }
    }
  }

  procesoEditarCarrito(){
    window.location.href = "/pages/carrito";
  }

  procesoHutCoins(btnElemento){
    const estaActivado = btnElemento.classList.contains('seleccionado');
    if(estaActivado == true){
      btnElemento.classList.remove('seleccionado');
      btnElemento.innerHTML = window.shopIcons.icon_estado_off;
    }else{
      btnElemento.classList.add('seleccionado');
      btnElemento.innerHTML = window.shopIcons.icon_estado_on;
    }
  }

  async procesoContinuarGeneral(){
    if(this.localSeleccionado == null && this.estadoPagina == "local"){
      this.contenedorBaseSeleccionDireccionEnvio.scrollIntoView({
        behavior: 'smooth', 
        block: 'start' 
      });
      return;
    }

    if(!this.validarCamposFormDatosContacto()){
      this.seccionFormDatosContacto.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      return;
    }

    if(!this.valirdarSeleccionMetodoPago()){
      this.seccionGeneralMetodosPago.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      return;
    }


    // Actualizar datos de usuario decuerdo a la seleccion HUT COINSS
    this.actualizarDatosUsuario();
    
    const datosCheckout ={
      // Traer datos de metodo de envio seleccionado
      metodo_envio_seleccionado : this.obtenerDatosMetodoEnvio(),
      // Traer datos de metodo facturacion
      info_metodo_pago_seleccionado : this.obtenerDatosPagoSeleccionado(),
      // Traer info facturacion
      info_facturacion :  this.obtenerDatosFacturacion(),
      // Inforacion nota para el pedido
      nota_para_envio : this.inputNotaParaElPedido.value,
    }

    localStorage.setItem('ph-datos-checkout', JSON.stringify(datosCheckout));

    MensajeCargaDatos.mostrar('Su pedido se esta procesando ...');
    const dataOrdenPreliminar = await this.generarPedidoPreliminar(datosCheckout);
    console.log("Data orden preliminar", dataOrdenPreliminar.draftOrderCreate.draftOrder);
    await this.generarPedido(dataOrdenPreliminar.draftOrderCreate.draftOrder.id);
    const dataJSON = this.generarJSONMostrarConsola();
    localStorage.setItem('ph-datos-pedido', JSON.stringify(dataJSON));
    MensajeCargaDatos.ocultar();
    // window.location.href = "/pages/detalle-pedido";
    // 
  }

  async generarPedidoPreliminar(datosCheckout) {
    try {
      const dataUsuario = JSON.parse(localStorage.getItem('ph-datos-usuario'));
      
      // Construir los lineItems para DraftOrderInput
      const lineItems = this.infoCarrito.informacionCompleta.items.map(item => {
        let data = null;
        try {
          if (item.properties && item.properties.estructura) {
            data = JSON.parse(item.properties.estructura);
            console.log("Data de item", data);
          }
        } catch (error) {
          console.error("Error al parsear estructura del item:", error);
        }
        
        return {
          title: item.title || "Producto",
          quantity: parseInt(data.producto.cantidad),
          originalUnitPrice: parseFloat((data.producto.precioTotalConjunto) || 0).toFixed(2)
        };
      });
      
      // La información del pedido para guardar en la not
      const informacionPedido = {
        datosCheckout,
        itemsCarrito: this.infoCarrito.informacionCompleta.items
      };

      // Consulta GraphQL actualizada para draftOrderCreat
      const draftOrderQuery = `
        mutation draftOrderCreate($input: DraftOrderInput!) {
          draftOrderCreate(input: $input) {
            draftOrder {
              id
              name
              email
              totalPrice
              createdAt
            }
            userErrors {
              field
              message
            }

          }
        }
      `;
      
      const variables = {
        input: {

          email: dataUsuario.email,
          lineItems: lineItems,
          shippingAddress: {
            firstName: dataUsuario.nombre,
            lastName: dataUsuario.apellido,
            phone: dataUsuario.celular,
            address1: this.estadoPagina == "domicilio" ? this.direccionSeleccionada.indicaciones : this.localSeleccionado.localizacion,
            city: "Santa Cruz",
            province: "Andres Ibáñez, Santa Cruz de la Sierra",
            countryCode: "BO", 
            zip: "0000",
            // latitude: this.estadoPagina == "domicilio" ? this.direccionSeleccionada.lat : this.localSeleccionado.lat,
            // longitude: this.estadoPagina == "domicilio" ? this.direccionSeleccionada.lng : this.localSeleccionado.lng
          }
        },
        customer: {
          toUpsert: {
            firstName: dataUsuario.nombre,
            lastName: dataUsuario.apellido,
            email: dataUsuario.email,
            phone: dataUsuario.celular,
          }
        },
        metafields: [
          {
            namespace: "custom",
            key: "order_details",
            type: "json_string",
            value:  `${informacionPedido}`
          }
        ]
      };
      
      // Asegúrate de que this.urlConsulta esté definido o usa la URL directa
      const myTest = 'shpat_' + '45f4a7476152f4881d058f87ce063698';
      
      const response = await fetch(this.urlConsulta , {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': myTest
        },
        body: JSON.stringify({
          query: draftOrderQuery,
          variables: variables
        })
      });
      
      const data = await response.json();
      console.log('Respuesta completa de Shopify:', data);
      
      if (data.errors) {
        console.error('Errores en la respuesta GraphQL:', data.errors);
        return { success: false, errors: data.errors };
      }
      
      // Verificar errores en draftOrderCreate, no en orderCreate
      if (data.data && data.data.draftOrderCreate && data.data.draftOrderCreate.userErrors && 
          data.data.draftOrderCreate.userErrors.length > 0) {
        console.error('Errores al crear el pedido:', data.data.draftOrderCreate.userErrors);
        return { success: false, errors: data.data.draftOrderCreate.userErrors };
      }
      
      // Verificar éxito en draftOrderCreate, no en orderCreate
      if (data.data && data.data.draftOrderCreate && data.data.draftOrderCreate.draftOrder) {
        console.log('Pedido creado exitosamente:', data.data.draftOrderCreate.draftOrder);
        return { 
          success: true, 
          order: data.data.draftOrderCreate.draftOrder 
        };
      }
      
      return { success: false, message: 'Respuesta inesperada del servidor' };
    } catch (error) {
      console.error('Error al crear el pedido:', error);
      return { success: false, error: error.message };
    }
  }

  async generarPedido(idOrden) {
    try {
      // Consulta GraphQL para completar un draft order
      const completeDraftOrderQuery = `
        mutation draftOrderComplete($id: ID!) {
          draftOrderComplete(id: $id) {
            draftOrder {
              id
              order {
                id
                name
                financialStatus
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
      
      // El ID ya viene en formato GID completo: "gid://shopify/DraftOrder/1189380718876"
      const variables = {
        id: idOrden
      };
      
      const myTest = 'shpat_' + '45f4a7476152f4881d058f87ce063698';
      
      const response = await fetch(this.urlConsulta, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': myTest
        },
        body: JSON.stringify({
          query: completeDraftOrderQuery,
          variables: variables
        })
      });
      
      const data = await response.json();
      console.log('Respuesta completa de finalización de pedido:', data);
      
      if (data.errors) {
        console.error('Errores en la respuesta GraphQL:', data.errors);
        return { success: false, errors: data.errors };
      }
      
      if (data.data && data.data.draftOrderComplete.userErrors && 
          data.data.draftOrderComplete.userErrors.length > 0) {
        console.error('Errores al completar el pedido:', data.data.draftOrderComplete.userErrors);
        return { success: false, errors: data.data.draftOrderComplete.userErrors };
      }
      
      if (data.data && data.data.draftOrderComplete && data.data.draftOrderComplete.draftOrder) {
        console.log('Pedido completado exitosamente:', data.data.draftOrderComplete.draftOrder);
        return { 
          success: true, 
          order: data.data.draftOrderComplete.draftOrder 
        };
      }
      
      return { success: false, message: 'Respuesta inesperada del servidor' };
    } catch (error) {
      console.error('Error al completar el pedido:', error);
      return { success: false, error: error.message };
    }
  }

  valirdarSeleccionMetodoPago() {
    for (let btn of this.btnsMetodosPagos) {
      if (btn.classList.contains('seleccionado')) {
        if (btn.dataset.accion == "pago-tarjeta-credito") {
          this.inputPrimero4Digitos.value = this.inputPrimero4Digitos.value.trim();
          this.inputUltimos4Digitos.value = this.inputUltimos4Digitos.value.trim();
          
          // Verificar que los campos no estén vacíos después de quitar espacios
          if (this.inputPrimero4Digitos.value === "" || this.inputUltimos4Digitos.value === "") {
            return false; // Los campos están vacíos, no es válido
          }
        }
        
        return true; // Método de pago seleccionado y válid
      }
    }
    
    // Si termina el ciclo sin encontrar ninguno seleccionado
    return false;
  }

  actualizarDatosUsuario(){
    const data = JSON.parse(localStorage.getItem('ph-datos-usuario'));
    const estaSeleccionadoBtnHutCoins = this.btnHutCoins.classList.contains('seleccionado');
    const obtenerInputFechaNacimiento = this.inputFechaNacimiento.value;

    if(estaSeleccionadoBtnHutCoins == false && obtenerInputFechaNacimiento == "")return;

    data.permisoHutCoins = estaSeleccionadoBtnHutCoins;
    data.fechaNacimiento = obtenerInputFechaNacimiento;
  }

  obtenerDatosMetodoEnvio(){


    if(this.btnMetodoLocal.classList.contains('seleccionado')){
      return {
        metodo_envio : "local",
        local_seleccionado : this.localSeleccionado
      }
    }
    if(this.btnMetodoDomicilio.classList.contains('seleccionado')){
      return{
        metodo_envio : "domicilio",
        info_seleccionada : this.direccionSeleccionada
      }
    }
  }

  obtenerDatosFacturacion(){
    if(this.inputRazonSocial.value == "" || this.inputNitoCit.value == "")return null;
    return {
      razon_social : this.inputRazonSocial.value,
      nit : this.inputNitoCit.value
    }
  }

  obtenerDatosPagoSeleccionado() {
    // Buscar el primer botón que tenga la acción que buscamos
    for (let btn of this.btnsMetodosPagos) {
      const accion = btn.dataset.accion;
      
      // Verificar si este botón está seleccionado
      if (!btn.classList.contains('seleccionado')) continue;
      
      // Si llegamos aquí, encontramos un botón seleccionado
      if (accion == "pago-codigo-qr") {
        return { metodo_pago: "pago-codigo-qr" };
      }
      
      if (accion == "pago-tarjeta-credito") {
        return {
          metodo_pago: "pago-tarjeta-credito",
          tarjeta_primera_4_digitos: this.inputPrimero4Digitos.value,
          tarjeta_segundo_4_digitos: this.inputUltimos4Digitos.value
        };
      }
      
      if (accion == "pago-efectivo") {
        return { metodo_pago: "pago-efectivo" };
      }
    }
    
    // Si no se encontró ningún botón seleccionado
    return null;
  }

  generarJSONMostrarConsola(){

  }


}

customElements.define('page-checkout-ph', PageCheckoutPH);