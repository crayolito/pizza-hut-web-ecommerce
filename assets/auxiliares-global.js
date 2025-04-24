
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
  }

  connectedCallback() {
    this.btnPagar = this.querySelector('#phpc-btn-pagar');
    this.contenedorItemsDetalle = this.querySelector('.pcph-items-carrito');
    this.contenedorDerecho = this.querySelector('.pcph-carrito-derecho');
    this.etiquetaSubtotal = this.querySelector('#phpc-etiqueta-subTotal');
    this.etiquetaTotal = this.querySelector('#phpc-etiqueta-total');
    this.btnPagar.addEventListener('click', () => this.pagarBtnPrincipal());
    this.inicializarDataShopify();
  }

  async inicializarDataShopify() {
    try {
      // Mostrar mensaje de carga al iniciar
      MensajeCargaDatos.mostrar('Cargando información del carrito...');

      const infoCarrito = await AuxiliaresGlobal.obtenerCarritoShopify();
      this.dataCarrito = infoCarrito.informacionCompleta;
      console.log('Información completa:', infoCarrito.informacionCompleta);

      let contenidoIzquierdoHTML = '';
      let precioTotal = 0;

      infoCarrito.informacionCompleta.items.forEach((item) => {
        if(!(item.properties && item.properties.estructura))return;
        
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
                  class="pcph-itemc_cantidad-btn elemento-oculto icon-color-tertiary"
                >
                ${window.shopIcons.icon_basura}
                </button>
                <button
                  accion="decrementar"
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
      // let contenidoDerechoHTML = '';

      // contenidoDerechoHTML += `
      //     <h1>TOTAL</h1>
      //     <div class="pcph-item-info-pago">
      //       <p>Subtotal</p>
      //       <p>Bs. ${precioTotal}</p>
      //     </div>
      //     <div class="pcph-item-info-pago">
      //       <p>Descuento</p>
      //       <p>Bs. 00.000</p>
      //     </div>
      //     <div class="pcph-item-info-pago">
      //       <p>Recojo en local</p>
      //       <p>Bs. 00.000</p>
      //     </div>
      //     <hr>
      //     <div class="pcph-item-info-total">
      //       <p>Total</p>
      //       <p>Bs. ${precioTotal}</p>
      //     </div>

      // `;
      this.etiquetaSubtotal.textContent = `Bs. ${precioTotal}`;
      this.etiquetaTotal.textContent = `Bs. ${precioTotal}`;
  
      // this.contenedorDerecho.insertAdjacentHTML('afterbegin', contenidoDerechoHTML);

      // DIBUJAR LA SECCION DE POSTRES
      await this.crearSecciondeAcompanamiento();
      
      this.declararComponentesDespuesCreacion();

      // Actualizar mensaje mientras se procesa la información
      // MensajeCargaDatos.mostrar('Procesando items del carrito...');
      MensajeCargaDatos.ocultar();
    } catch (error) {
      console.error('Hubo un error:', error);
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
    // INICIALIZAR ELEMENTOS Y CARGA DE DATOS

  }

  async crearSecciondeAcompanamiento() {
  }

  async actualizarProductoCarrito(btnElemento){
    const contenedorPadre = btnElemento.closest('.pcph-item-carrito');
    const keyCarrito = contenedorPadre.dataset.keycarrito;
    let cantidadElemento = parseInt(contenedorPadre.querySelector('#phpp-cantidad-general').textContent);

    const itemCarrito = this.dataCarrito.items.find(item => item.key === keyCarrito);

    const informacionCompleta = JSON.parse(itemCarrito.properties.estructura);
    console.log('Información completa del item:', informacionCompleta);

    // Verificar si el botón es de incrementar o decrementar
    const accionBtn = btnElemento.getAttribute('accion');

    if(accionBtn == "decrementar" && cantidadElemento == 1){
      // Se procede a eliminar del carrito
      MensajeCargaDatos.mostrar('Eliminando producto del carrito...');
      await AuxiliaresGlobal.eliminarItemCarritoPorKey(keyCarrito, 0);
    }else{
      accionBtn == "incrementar" ? cantidadElemento++ : cantidadElemento--;

      let cantidadPrecioTotalAntiguo = parseFloat(informacionCompleta.producto.precioTotalConjunto);
      let cantidadOpcionesPrincipalesAntiguo = 0; 
      let cantidadOpcionesPrincipalesNueva = 0;
      informacionCompleta.opcionesPrincipales.productos.forEach((producto) => {
        cantidadOpcionesPrincipalesNueva  += (cantidadElemento * parseInt(producto.precio));
        cantidadOpcionesPrincipalesAntiguo += (producto.cantidad * parseInt(producto.precio));
      });
      let cantidadSolamenteComplementosAntiguo = cantidadPrecioTotalAntiguo - cantidadOpcionesPrincipalesAntiguo;
      informacionCompleta.producto.precioTotalConjunto = cantidadOpcionesPrincipalesNueva + cantidadSolamenteComplementosAntiguo;
  
      if(accionBtn == "decrementar"){
        // Se procede a decrementar la cantidad
        MensajeCargaDatos.mostrar('Actualizando producto en el carrito...');
        await AuxiliaresGlobal.actualizarCantidadItemPorKey(keyCarrito,itemCarrito.id, cantidadElemento,{
          properties: {"estructura": JSON.stringify(informacionCompleta)}
        });
      }
  
      if(accionBtn == "incrementar"){
        // Se procede a incrementar la cantidad
        MensajeCargaDatos.mostrar('Actualizando producto en el carrito...');
        await AuxiliaresGlobal.actualizarCantidadItemPorKey(keyCarrito,itemCarrito.id, cantidadElemento,{
          properties: {"estructura": JSON.stringify(informacionCompleta)}
        });
      }
    }

    await this.actualizarSoloContenidoCarrito();
    MensajeCargaDatos.ocultar();
  }

  async actualizarSoloContenidoCarrito(){
    try {

      const infoCarrito = await AuxiliaresGlobal.obtenerCarritoShopify();
      this.dataCarrito = infoCarrito.informacionCompleta;
      console.log('Información completa:', infoCarrito.informacionCompleta);

      let contenidoIzquierdoHTML = '';
      let precioTotal = 0;

      infoCarrito.informacionCompleta.items.forEach((item) => {
        if(!(item.properties && item.properties.estructura))return;
        
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
                  class="pcph-itemc_cantidad-btn elemento-oculto icon-color-tertiary"
                >
                ${window.shopIcons.icon_basura}
                </button>
                <button
                  accion="decrementar"
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
  
      // let contenidoDerechoHTML = '';
      // contenidoDerechoHTML += `
      //     <h1>TOTAL</h1>
      //     <div class="pcph-item-info-pago">
      //       <p>Subtotal</p>
      //       <p>Bs. ${precioTotal}</p>
      //     </div>
      //     <div class="pcph-item-info-pago">
      //       <p>Descuento</p>
      //       <p>Bs. 00.000</p>
      //     </div>
      //     <div class="pcph-item-info-pago">
      //       <p>Recojo en local</p>
      //       <p>Bs. 00.000</p>
      //     </div>
      //     <hr>
      //     <div class="pcph-item-info-total">
      //       <p>Total</p>
      //       <p>Bs. ${precioTotal}</p>
      //     </div>
      // `;
      this.etiquetaSubtotal.textContent = `Bs. ${precioTotal}`;
      this.etiquetaTotal.textContent = `Bs. ${precioTotal}`;
  
      // this.contenedorDerecho.insertAdjacentHTML('afterbegin', contenidoDerechoHTML);
      
      this.declararComponentesDespuesCreacion();
    } catch (error) {
      console.error('Hubo un error:', error);
    }
  }

  procedoEditarItem(btnElemento) {}

  obtenerStockGenericoTrabajo(productoTrabajo){
    // Verificar si tenemos una sucursal seleccionada
    const dataSucursal = JSON.parse(localStorage.getItem('sucursal-informacion'));
    if(!dataSucursal || dataSucursal == "") return productoTrabajo.stockTotal;

    const sucursalEncontrada = productoTrabajo.sucursales.find(
      sucursal => sucursal.nombre == dataSucursal.name
    );

    return sucursalEncontrada 
    ? parseInt(sucursalEncontrada.stock) 
    : productoTrabajo.stockTotal;
  }

  pagarBtnPrincipal() {}
}

customElements.define('page-carrito', PageCarrito);