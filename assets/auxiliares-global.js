
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
    const contenedoresPadre = document.querySelectorAll('.h-ic-cantidad');
    const mensajes = document.querySelectorAll('.hicc-mensaje');

    // Verificar que haya elementos
    if (mensajes && mensajes.length > 0) {
      // Iterar sobre cada mensaje encontrado
      mensajes.forEach(mensaje => {
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
      });

      // Mostrar mensaje de éxito después de actualizar todos los carritos
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
   * Sincroniza el contador visual con el estado actual del carritoo
    * @param {Object} cart - Objeto carrito devuelto por Shopify
    */
  static sincronizarContadorConCarrito(cart) {
    const mensajes = document.querySelectorAll('.hicc-mensaje');
    if (mensajes && mensajes.length > 0) {
      const cantidadTotal = cart.item_count || 0;

      // Actualizar todos los elementos de mensaje encontrados
      mensajes.forEach(mensaje => {
        mensaje.textContent = cantidadTotal;

        // Actualizar clases
        mensaje.classList.remove('digitos-2', 'digitos-3');
        const valorStr = cantidadTotal.toString();
        if (valorStr.length === 2) {
          mensaje.classList.add('digitos-2');
        } else if (valorStr.length >= 3) {
          mensaje.classList.add('digitos-3');
        }
      });

      console.log('Cantidad total de productos Testeo:', cantidadTotal);
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
            console.log("Testeo des la funcion agregarCarrito", valor);
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

    if (this.baseTrabajo != 'carrito') {
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
    if (!this.contenedor || !this.etiquetaMensaje) {
      console.error('No se encontraron todos los elementos necesarios para el componente MensajeTemporal');
    }
  }

  /**
   * Método para mostrar un mensaje
   * @param {string} mensaje - El texto del mensaje a mostrar
   * @param {string} tipo - El tipo de mensaje ('exito', 'error', 'info', 'alerta')
   * @param {number} duracion - Duración en ms que se mostrará el mensaje
  */
  mostrar(mensaje, tipo = "exito", duracion = 3000) {
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
    }, duracion);

    return true;
  }

  ocultar() {
    if (this.contenedor) {
      this.contenedor.style.opacity = '0';
      this.contenedor.style.visibility = 'hidden';
    }

    if (this.tiempoEspera) {
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

class ProductosIndex extends HTMLElement {
  constructor() {
    super();
    this.productosTrabajo = null;
    this.estructuraTrabajo = null;
    this.productoParaEstructuraTrabajo = null;
    this.idProductoSeleccionado = null;
    this.accesoX = "shpat_";
    this.accesoY = "45f4a7476152f4881d058f87ce063698";
    this.urlConsulta = "https://pizza-hut-bo.myshopify.com/admin/api/2025-01/graphql.json";
  }

  connectedCallback() {
    // REFERENCIAS ELEMENTOS
    // {% comment %} this.primeraFaseConsulta(); {% endcomment %}
    this.traerInformacionShopify();
    document.addEventListener('click', this.clicksEspeciales.bind(this));
  }

  inicializarEventos() {
    // REFERENCIAS ELEMENTOS
    this.contenedorVarianteSeleccionado = this.querySelectorAll('#phpi-view-variantes');
    this.contenedorVariantes = this.querySelectorAll('#phpi-items-variantes');
    this.varianteElemento = this.querySelectorAll('.variante-producto-item');
    this.btnsPersonalizar = this.querySelectorAll('#phpi-btn-personalizar');

    // EVENTOS INICIALIZAR
    this.contenedorVarianteSeleccionado.forEach((elementoBase) => {
      elementoBase.addEventListener('click', this.mostrarYOcultarContenedorVariantes.bind(this, elementoBase));
    });

    this.btnsPersonalizar.forEach((elementoBtnPersonalizar) => {
      elementoBtnPersonalizar.addEventListener(
        'click',
        this.redireccionPersonalizar.bind(this, elementoBtnPersonalizar)
      );
    });

    this.varianteElemento.forEach((elementoBase) => {
      elementoBase.addEventListener('click', this.procesoVarianteSeleccionada.bind(this, elementoBase));
    });

    // INICIALIZAR ELEMENTOS Y PROCESOS CLAVES
    this.contenedorVariantes.forEach((elementoBase) => {
      elementoBase.classList.add('elemento-oculto');
    });
  }

  mostrarYOcultarContenedorVariantes(elementoBase) {
    // Busco al elemento Padre
    const elementoPadre = elementoBase.closest('#phpi-general-variantes');
    // Busco a su hermano
    const hermano = elementoPadre.querySelector('#phpi-items-variantes');

    const estaVisible = hermano.classList.contains('elemento-visible');

    if (estaVisible) {
      hermano.classList.remove('elemento-visible');
      hermano.classList.add('elemento-oculto');
    } else {
      hermano.classList.remove('elemento-oculto');
      hermano.classList.add('elemento-visible');
    }

    // Oculto a los otros elementos
    this.contenedorVariantes.forEach((elemento) => {
      if (elemento !== hermano) {
        elemento.classList.remove('elemento-visible');
        elemento.classList.add('elemento-oculto');
        // {% comment %} elemento.style.display = "none"; {% endcomment %}
      }
    });
  }

  async traerInformacionShopify() {
    // Primero va traer la informacion de la colecci  on PIZZA
    const { informacionColeccion, productosColeccion } = await this.primeraFaseConsulta();


    let estructuraColeccionGeneral = [];
    // Ejemplo base de json
    // {
    //   "ramas": {
    //     "PCT": {
    //       "titulo": "Tamaño",
    //       "min": "0",
    //       "max": "8",
    //       "ramas": {
    //         "PCE": {
    //           "titulo": "Extras",
    //           "min": "0",
    //           "max": "8"
    //         },
    //         "PCMB": {
    //           "titulo": "Masas y Bordes",
    //           "min": "0",
    //           "max": "8"
    //         }
    //       }
    //     }
    //   } 
    // }

    // Estructura de trabajo y contruccion de un producto
    console.log("Informacion de la coleccion : ", informacionColeccion);
    if (
      !informacionColeccion ||
      !informacionColeccion.estructura ||
      !informacionColeccion.estructura.ramas ||
      Object.keys(informacionColeccion.estructura.ramas).length === 0
    ) {
      return;
    }
    this.estructuraTrabajo = informacionColeccion.estructura;

    // Procesar la estructura, para saber que colecciones traer correctamente
    for (var keyCustom1 in informacionColeccion.estructura.ramas) {
      // Aqui se va guardar = PCT
      estructuraColeccionGeneral.push(keyCustom1);

      // Recorrer las otras ramas del keyCustom
      if (informacionColeccion.estructura.ramas[keyCustom1].ramas) {
        for (var keyCustom2 in informacionColeccion.estructura.ramas[keyCustom1].ramas) {
          // Aqui se va guardar = PCE y PCMB
          estructuraColeccionGeneral.push(keyCustom2);
        }
      }
    }

    // Esto es para traer la seccion meta fields que se requiere
    const categoriaColeccion = informacionColeccion.titulo;
    const todasColecciones = await this.segundaFaseConsulta(estructuraColeccionGeneral, categoriaColeccion);
    console.log("Todas las colecciones :", todasColecciones);

    var listaProductos = [];

    var productosEstructurados = [];
    for (var codigoRama in informacionColeccion.estructura.ramas) {
      var productosRamaPrincipal = [];
      var dataRama = informacionColeccion.estructura.ramas[codigoRama];
      // Ramas : PCT
      // Obtener la coleccion de productos de esta rama de trabajo
      var productosDeRama = todasColecciones["coleccion" + codigoRama] || [];
      productosDeRama.forEach((producto) => {
        const estadosValidos = ["on", "activado", "activo", "active"];
        if (!estadosValidos.includes(producto.estructura.estado)) return;
        var subProductos = [];

        for (var codigoSubRama in dataRama.ramas) {
          var dataSubRama = dataRama.ramas[codigoSubRama];
          // Obtener la coleccion de productos de esta sub-rama de trabajo
          var productosDeSubRama = todasColecciones["coleccion" + codigoSubRama] || [];

          // Filtrar solo los productos que se va usar deacuerdo al titulo => producto.titulo
          var productosFiltrados = this.filtrarProductosPorTitulo(productosDeSubRama, producto.titulo);
          // Crear estructura de la sub-rama
          var subRamaNueva = {
            codigo: codigoSubRama,
            titulo: dataSubRama.titulo,
            condiciones: {
              min: dataSubRama.min || 0,
              max: dataSubRama.max || 0
            },
            productos: productosFiltrados
          };

          // Agregar la sub-rama al producto
          subProductos.push(subRamaNueva);
        }

        var productoTrabajo = {
          idShopify: producto.id,
          idTrabajo: producto.estructura.id,
          titulo: producto.titulo,
          handle: producto.handle,
          precio: producto.estructura.precio,
          estado: producto.estructura.estado,
          ramas: subProductos
        }

        productosRamaPrincipal.push(productoTrabajo);
      });

      productosEstructurados.push({
        codigo: codigoRama,
        productos: productosRamaPrincipal
      });
    };

    // Productos estructurados, deacuerdo a la estructura de trabajo para mostrar un producto
    this.productoParaEstructuraTrabajo = productosEstructurados;

    // Contruccion del productos en su estado visible en la seccion
    const contenedorProductos = this.querySelector('#phpi-contenedor-productos-muestra');
    var contenidoHTML = ``;

    const acortarTitulo = (titulo) => {
      if (titulo.includes("Super personal")) {
        return "Super Pers.";
      } else if (titulo.includes("Mediana")) {
        return "Mediana";
      } else if (titulo.includes("Familiar")) {
        return "Familiar";
      } else if (titulo.includes("Personal")) {
        return "Personal";
      } else {
        return titulo;
      }
    };

    const productosContruccion = productosColeccion.map((producto) => {
      return {
        idShopify: producto.id,
        idTrabajo: producto.estructura.id,
        handle: producto.handle,
        imagen: producto.imagen,
        titulo: producto.titulo,
        descripcion: producto.descripcion,
        precio: producto.estructura.precio,
        stockTotal: producto.stockGeneral,
        estado: producto.estructura.estado,
        sucursales: producto.sucursales,
      }
    });

    this.productosTrabajo = productosContruccion;

    productosContruccion.forEach((producto) => {
      console.log("Producto de la rama principal 2:", producto.estado);
      const estadosValidos = ["on", "activado", "activo", "active"];
      if (!estadosValidos.includes(producto.estado)) return;
      var variantesHTML = ``;
      let elementoSeleccionado;

      productosEstructurados[0].productos.forEach((productoTrabajo, index) => {
        // Determinamos si este elemento está seleccionado (solo el primero
        const esSeleccionado = index === 0 ? "seleccionado" : "";
        // Si es el primer elemento, lo guardamos en la variable
        if (index === 0) {
          elementoSeleccionado = productoTrabajo;
          // {% comment %} console.log("Elemento seleccionado:", elementoSeleccionado); {% endcomment %}
        }

        // Acortamos el título
        const tituloCorto = acortarTitulo(productoTrabajo.titulo || productoTrabajo.nombre);

        // Agregamos el HTML con la clase de seleccionado para el primer elemento
        variantesHTML += `
          <div 
          data-id="${productoTrabajo.idTrabajo}"
          data-idshopify="${productoTrabajo.idShopify}"
          data-handle="${productoTrabajo.handle}"
          data-precio="${productoTrabajo.precio}"
          class="variante-producto-item ${esSeleccionado}">
            <p>${tituloCorto}</p>
            <p class="color-letras-primary">${(parseInt(productoTrabajo.precio) + parseInt(producto.precio)) + " Bs"}</p>
          </div>
        `;
      });

      contenidoHTML += `
        <div 
        data-id="${producto.idTrabajo}"
        data-idshopify="${producto.idShopify}"
        data-handle="${producto.handle}"
        data-precio="${producto.precio}"
        data-seleccionado="${elementoSeleccionado.idTrabajo}"
        tipo-producto="complejo"
        class="producto-item">
          <div class="producto-item-imagen">
            ${producto.imagen
          ? `<img src="${producto.imagen}" alt="${producto.titulo}" width="100%" height="100%">`
          : `<img src="${window.assets.imagen_aux}" alt="Imagen de ${producto.titulo}" width="100%" height="100%">`
        }
          </div>
          <div
            tipo-producto="simple"
            class="producto-item-detalle"
          >
            <div class="producto-item-info">
              <h3>${producto.titulo}</h3>
              <p>${producto.descripcion}</p>
            </div>
            <h3 class="color-letras-primary">${producto.precio}.00 BS</h3>
            <div
              id="phpi-general-variantes"
              tipo-producto="simple"
              class="seleccion-variante-producto-general"
            >
              <p>Tamaño</p>
              <button 
                 id="phpi-view-variantes" class="container-info-variante">
                <p id="phpi-variante-seleccionado">${acortarTitulo(elementoSeleccionado.titulo)}</p>
                <div class="icono-dropdown-variantes icon-color-tertiary">
                  ${window.shopIcons.icon_flecha_abajo}
                </div>
              </button>
              <div id="phpi-items-variantes" class="variantes-producto">
                ${variantesHTML}
              </div>
            </div>
            <button id="phpi-btn-personalizar" class="ph-btn-general  phpi-btn-personalizar">
              <p class="color-letras-secondary">PERSONALIZAR</p>
            </button>
          </div>
        </div>
      `;
    });

    contenedorProductos.innerHTML = contenidoHTML;
    this.inicializarEventos();
  }

  async segundaFaseConsulta(codigosColeccion, categoriaColeccion) {
    // Validar que codigosColeccion sea un array
    if (!Array.isArray(codigosColeccion) || codigosColeccion.length === 0) {
      console.error("Error: codigosColeccion debe ser un array con al menos un elemento");
      return {};
    }

    // Construir dinámicamente las partes del query para cada colección
    const coleccionesQueries = codigosColeccion.map((codigo, index) => {
      // Crear un alias único para cada colección basado en su código
      const aliasSeguro = `${codigo.toLowerCase()}Collection`;

      return `
        ${aliasSeguro}: collections(first: 1, query: "title:${codigo}") {
          edges {
            node {
              id
              title
              handle
              products(first: 50) {
                edges {
                  node {
                    id
                    title
                    handle
                    description
                    tags
                    images(first: 1) {
                      edges {
                        node {
                          url
                        }
                      }
                    }
                    metafield(namespace: "estructura", key: "${categoriaColeccion.toLowerCase()}") {
                      value
                    }
                    variants(first: 1) {
                      edges {
                        node {
                          id
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
    }).join('\n');

    // Construir el query completo con todas las colecciones
    const graphQLQuery = `
      query GetProductsFromSpecificCollections {
        ${coleccionesQueries}
      }
    `;

    try {
      // Realiza la solicitud a la API de Shopify
      const respuesta = await fetch(window.urlConsulta, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': window.backendShopify,
        },
        body: JSON.stringify({ query: graphQLQuery }),
      });


      if (!respuesta.ok) {
        throw new Error(`Error de red: ${respuesta.status} ${respuesta.statusText}`);
      }

      // Obtener los datos de la respuesta
      const datosRespuesta = await respuesta.json();

      // Verificar si hay errores en la respuesta de GraphQL
      if (datosRespuesta.errors) {
        console.error("Errores en la consulta GraphQL:", datosRespuesta.errors);
        throw new Error("Error en la consulta GraphQL");
      }

      // Función para procesar los datos de una colección
      const procesarProductosColeccion = (coleccion) => {
        // Verificar si la colección existe y tiene edges
        if (!coleccion || !coleccion.edges || coleccion.edges.length === 0) {
          return [];
        }

        const nodoColeccion = coleccion.edges[0].node;

        // Verificar si hay productos
        if (!nodoColeccion.products || !nodoColeccion.products.edges) {
          return [];
        }

        // Procesar productos
        return nodoColeccion.products.edges.map(edge => {
          const producto = edge.node;
          const imagenURL = producto.images && producto.images.edges && producto.images.edges.length > 0
            ? producto.images.edges[0].node.url
            : '';

          // Obtener el ID de la variante
          let varianteId = '';
          if (producto.variants && producto.variants.edges.length > 0) {
            const varianteCompleta = producto.variants.edges[0].node.id;
            // Extraer solo la parte numérica del ID de la variante
            varianteId = varianteCompleta.split('/').pop();
          }

          // Procesar el metafield de estructura
          let estructura = {};
          if (producto.metafield && producto.metafield.value) {
            try {
              estructura = JSON.parse(producto.metafield.value);
            } catch (e) {
              console.error(`Error al parsear estructura para ${producto.title}:`, e);
            }
          }

          return {
            id: varianteId, // Usamos el ID de variante en lugar del ID de producto
            titulo: producto.title,
            handle: producto.handle,
            descripcion: producto.description,
            tags: producto.tags || [],
            imagen: imagenURL,
            estructura: estructura
          };
        });
      };

      // Crear el objeto de resultado con propiedades para cada colección
      const resultado = {};

      // Mapear los códigos de colección a los alias usados en el query
      codigosColeccion.forEach(codigo => {
        const aliasQuery = `${codigo.toLowerCase()}Collection`;
        const nombrePropiedad = `coleccion${codigo}`;

        // Verificar si existe la respuesta para este alias
        if (datosRespuesta.data && datosRespuesta.data[aliasQuery]) {
          resultado[nombrePropiedad] = procesarProductosColeccion(datosRespuesta.data[aliasQuery]);
        } else {
          // Si no hay datos para esta colección, guardar un array vacío
          resultado[nombrePropiedad] = [];
        }
      });

      console.log('Datos de colecciones obtenidos');

      return resultado;
    } catch (error) {
      console.error('Error al obtener datos de las colecciones específicas:', error);

      // Crear un objeto vacío con las propiedades esperadas
      const resultado = {};
      codigosColeccion.forEach(codigo => {
        resultado[`coleccion${codigo}`] = [];
      });

      return resultado;
    }
  }

  async primeraFaseConsulta() {
    const graphQLQuery = `
      query GetCollectionByFlexibleTitle {
        collections(first: 1, query: "title:*Pizza Clasica*") {
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
      // Utilizar el servidor intermediario en lugar de la API de Shopify directamente
      const respuesta = await fetch(window.urlConsulta, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-shopify-access-token': window.backendShopify,
        },
        body: JSON.stringify({ query: graphQLQuery }),
      });

      if (!respuesta.ok) {
        throw new Error(`Error de red: ${respuesta.status} ${respuesta.statusText}`);
      }

      // Obtener los datos de la respuesta
      const datosRespuesta = await respuesta.json();
      console.log('Datos de la respuesta:', datosRespuesta);

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

  // {% comment %} async primeraFaseConsulta() {
  //   const graphQLQuery = `
  //     query GetCollectionByFlexibleTitle {
  //       collections(first: 1, query: "title:*Pizza Clasica*") {
  //         edges {
  //           node {
  //             id
  //             title
  //             handle
  //             metafield(namespace: "estructura", key: "json") {
  //               value
  //             }
  //             products(first: 50) {
  //               edges {
  //                 node {
  //                   id
  //                   title
  //                   handle
  //                   description
  //                   totalInventory
  //                   images(first: 1) {
  //                     edges {
  //                       node {
  //                         url
  //                       }
  //                     }
  //                   }
  //                   metafield(namespace: "estructura", key: "json") {
  //                     value
  //                   }
  //                   variants(first: 1) {
  //                     edges {
  //                       node {
  //                         id
  //                         inventoryItem {
  //                           inventoryLevels(first: 100) {
  //                             edges {
  //                               node {
  //                                 location {
  //                                   name
  //                                 }
  //                                 quantities(names: ["available"]) {
  //                                   name
  //                                   quantity
  //                                 }
  //                               }
  //                             }
  //                           }
  //                         }
  //                       }
  //                     }
  //                   }
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }
  //   `;

  //   try {
  //     // Realiza la solicitud a la API de Shopify

  //     const respuesta = await fetch(this.urlConsulta, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'X-Shopify-Access-Token': myTest,
  //       },
  //       body: JSON.stringify({ query: graphQLQuery }),
  //     });

  //     if (!respuesta.ok) {
  //       throw new Error(`Error de red: ${respuesta.status} ${respuesta.statusText}`);
  //     }

  //     // Obtener los datos de la respuesta
  //     const datosRespuesta = await respuesta.json();

  //     // Verificar si tenemos datos
  //     if (!datosRespuesta.data || !datosRespuesta.data.collections.edges.length || !datosRespuesta.data.collections.edges[0].node.products.edges.length) {
  //       console.log("No se encontraron productos en la colección PIZZA");
  //       return [];
  //     }

  //     // Extraer la información de la colección 
  //     const coleccion = datosRespuesta.data.collections.edges[0].node;
  //     var estructuraColeccion = null;
  //     if (coleccion.metafield && coleccion.metafield.value) {
  //       try {
  //         estructuraColeccion = JSON.parse(coleccion.metafield.value);
  //       } catch (e) {
  //         estructuraColeccion = null;
  //         console.error('Error al parsear la estructura de la colección:', e);
  //       } 
  //     }

  //     // Transformar los productos a un formato más simple
  //     const productosSimplificados = coleccion.products.edges.map(edge => {
  //       const producto = edge.node;
  //       const imagenURL = producto.images.edges.length > 0 ? producto.images.edges[0].node.url : '';

  //       // Obtener el inventario total del producto
  //       const stockGeneral = producto.totalInventory || 0;

  //       // Obtener el ID de la variante
  //       let varianteId = '';
  //       if (producto.variants && producto.variants.edges.length > 0) {
  //         const varianteCompleta = producto.variants.edges[0].node.id;
  //         // Extraer solo la parte numérica del ID de la variante
  //         varianteId = varianteCompleta.split('/').pop();
  //       }

  //       // Obtener el inventario por sucursal
  //       const sucursales = [];
  //       if (producto.variants && producto.variants.edges.length > 0) {
  //         const variante = producto.variants.edges[0].node;
  //         if (variante.inventoryItem && variante.inventoryItem.inventoryLevels.edges.length > 0) {
  //           variante.inventoryItem.inventoryLevels.edges.forEach(levelEdge => {
  //             const level = levelEdge.node;
  //             const nombreSucursal = level.location.name;
  //             let stockSucursal = 0;

  //             // Buscar la cantidad disponible
  //             if (level.quantities && level.quantities.length > 0) {
  //               const availableQuantity = level.quantities.find(q => q.name === "available");
  //               if (availableQuantity) {
  //                 stockSucursal = availableQuantity.quantity;
  //               }
  //             }

  //             sucursales.push({
  //               nombre: nombreSucursal,
  //               stock: stockSucursal
  //             });
  //           });
  //         }
  //       }

  //       // Crear un objeto simplificado del producto
  //       const productoSimplificado = {
  //         id: varianteId, // Usamos el ID de variante en lugar del ID de producto
  //         titulo: producto.title,
  //         handle: producto.handle,
  //         descripcion: producto.description,
  //         imagen: imagenURL,
  //         stockGeneral: stockGeneral,
  //         sucursales: sucursales,
  //         estructura: producto.metafield && producto.metafield.value ? JSON.parse(producto.metafield.value) : "",
  //       };

  //       return productoSimplificado;
  //     });

  //     // Crear un objeto con información de la colección y los productos
  //     const resultado = {
  //       informacionColeccion: {
  //         id: coleccion.id,
  //         titulo: coleccion.title,
  //         handle: coleccion.handle,
  //         estructura: estructuraColeccion
  //       },
  //       productosColeccion: productosSimplificados
  //     };

  //     console.log('Datos de la colección obtenidos:', resultado);

  //     return resultado;

  //   } catch (error) {
  //     // Errores al traer los datos
  //     console.error('Error al obtener los datos de la colección:', error);
  //     return [];
  //   }
  // } {% endcomment %}

  // Función para verificar si un producto de rama coincide con alguna clave de estructura
  filtrarProductosPorTitulo(productosArray, tituloReferencia) {
    // Validación rápida
    if (!productosArray || !tituloReferencia) return [];

    // Extraer la primera palabra una sola vez
    var primeraPalabraReferencia = tituloReferencia.split(' ')[0];

    // Usar reduce para filtrar y transformar en una sola iteración
    var productosFiltrados = productosArray.reduce((resultado, producto) => {
      if (!producto || !producto.estructura) return resultado;

      // Buscar la clave que coincide directamente
      if (producto.estructura[primeraPalabraReferencia]) {
        // Si encontramos coincidencia, creamos el objeto formateado inmediatamente
        resultado.push({
          idTrabajo: producto.estructura[primeraPalabraReferencia].id,
          idShopify: producto.id,
          titulo: producto.titulo,
          handle: producto.handle,
          imagen: producto.imagen,
          precio: producto.estructura[primeraPalabraReferencia].precio
        });
      }

      return resultado;
    }, []);

    return productosFiltrados;
  }

  clicksEspeciales(event) {
    // Si el click es en algun elemento con id="phpi-view-variantes" no hace nada y se sale
    let clickEnContenedorVariante = false;
    this.contenedorVarianteSeleccionado.forEach((elementoBase) => {
      if (elementoBase.contains(event.target)) {
        clickEnContenedorVariante = true;
      }
    });

    if (clickEnContenedorVariante) {
      return;
    }

    // Si el elemento clickeado no es en el contenedor id="phpi-items-variantes" tons cierra a todos
    this.contenedorVariantes.forEach((elementoBase) => {
      if (!elementoBase.contains(event.target)) {
        // {% comment %} elementoBase.style.display = "none"; // Oculto {% endcomment %}
        elementoBase.classList.remove('elemento-visible');
        elementoBase.classList.add('elemento-oculto');
      }
    });
  }

  redireccionPersonalizar(elementoBtn) {
    // Buscar al elemento padre general class="producto-item"
    const elementoPadreGeneral = elementoBtn.closest('.producto-item');
    // Buscar del padre general data-id
    const dataId = elementoPadreGeneral.dataset.id;
    // Buscar el id en el this.productosTrabajo
    const productoTrabajo = this.productosTrabajo.find((producto) => producto.idTrabajo == dataId);
    const padreElemento = elementoBtn.closest('.producto-es-item-detalle') || elementoBtn.closest('.producto-item-detalle');
    const dataPadre = padreElemento.getAttribute('tipo-producto');

    if (dataPadre == null) {
      window.location.href = "/";
    }


    localStorage.setItem('phpp-tipo-producto', dataPadre);
    // Guardar en el localStorage el productoBase y tamano seleccionado su id
    localStorage.setItem('phpp-productoData', JSON.stringify({
      "producto": productoTrabajo,
      "estructura": this.estructuraTrabajo,
      "productoParaEstructuraTrabajo": this.productoParaEstructuraTrabajo,
      "subProductoSeleccionado": elementoPadreGeneral.dataset.seleccionado
    }));

    window.location.href = "/pages/producto";
  }

  procesoVarianteSeleccionada(elementoBase) {
    //
    // Es el que tiene la class="producto-item"
    const elementoPadreGeneral = elementoBase.closest('.producto-item');
    // Busco dentro del elemento al la primer etiqueta <p> y obtengo su valor ya que tenog 3 etiqueta p
    const primerP = elementoBase.querySelectorAll('p')[0];
    // Busco al elemento Padre General con id="phpi-general-variantes"
    const padreGeneral = elementoBase.closest('#phpi-general-variantes');
    // Busco al hijo de Padre con id="phpi-view-variantes"
    const hijo = padreGeneral.querySelector('#phpi-view-variantes');
    // El hijo tiene otro hijo que es una etiqueta p con id="phpi-variante-seleccionado"
    const hijoP = hijo.querySelector('#phpi-variante-seleccionado');
    hijoP.innerHTML = primerP.innerHTML; // Cambiamos el valor de la etiqueta p

    // Se edita el valor del atributo data-seleccionado del padre general
    elementoPadreGeneral.dataset.seleccionado = elementoBase.dataset.id;

    // Se procede a agregar clase seleccionado a elementoBase y se lo quita a los demas si es que lo llevan
    const hermanos = elementoPadreGeneral.querySelectorAll('.variante-producto-item');
    hermanos.forEach((hermano) => {
      if (hermano !== elementoBase) {
        hermano.classList.remove('seleccionado');
      } else {
        hermano.classList.add('seleccionado');
      }
    });

    // Busco al elemento Padre id="phpi-items-variantes"
    // O tambien cierro a todos con ese id
    this.contenedorVariantes.forEach((elementoBase) => {
      if (elementoBase !== padreGeneral) {
        // {% comment %} elementoBase.style.display = "none"; {% endcomment %}
        elementoBase.classList.remove('elemento-visible');
        elementoBase.classList.add('elemento-oculto');
      }
    });
  }
}

customElements.define('productos-index', ProductosIndex);

class SucursalesInformacion extends HTMLElement {
  constructor() {
    super();
    // Datos de ubicaciones de pizzerías
    this.pizzaLocations = window.localizacionesSucursales || [];

    // Obtener ciudades únicas
    this.ciudades = [...new Set(this.pizzaLocations.map((loc) => loc.ciudad || 'Santa Cruz'))];

    // Si no hay ciudades, agregar Santa Cruz por defecto
    if (this.ciudades.length === 0) {
      this.ciudades = ['Santa Cruz'];
    }

    // Tipos de servicio
    this.tiposServicio = ['TODOS', 'ENVÍO A DOMICILIO', 'RECOGER EN LOCAL'];

    // Estado actual de selección
    this.ciudadSeleccionada = this.ciudades[0];
    this.servicioSeleccionado = 'ENVÍO A DOMICILIO'; // Valor por defecto según el HTML
  }

  connectedCallback() {
    // Inicializar los selectores de ciudad y servicio
    this.initSelectors();

    // Configurar los event listeners para los selectores
    this.setupEventListeners();

    // Actualizar los locales visibles
    this.updateLocalesVisibles();
  }

  // Inicializa los selectores de ciudad y tipo de servicio
  initSelectors() {
    // No modificamos los selectores iniciales, solo capturamos sus valores
    const selectorCiudades = this.querySelector('.ds-info:nth-child(2) .ds-select-info h3');
    if (selectorCiudades) {
      this.ciudadSeleccionada = selectorCiudades.textContent.trim();
    }

    const selectorServicio = this.querySelector('.ds-info:nth-child(3) .ds-select-info h3');
    if (selectorServicio) {
      this.servicioSeleccionado = selectorServicio.textContent.trim();
    }
  }

  // Configura los event listeners
  setupEventListeners() {
    // Event listeners para los selectores
    const selectorCiudad = this.querySelector('.ds-info:nth-child(2) .ds-select-info');
    const selectorServicio = this.querySelector('.ds-info:nth-child(3) .ds-select-info');

    if (selectorCiudad) {
      selectorCiudad.addEventListener('click', () => this.toggleSelectorCiudad());
    }

    if (selectorServicio) {
      selectorServicio.addEventListener('click', () => this.toggleSelectorServicio());
    }
  }

  // Muestra u oculta el selector de ciudades
  toggleSelectorCiudad() {
    const contenedor = this.querySelector('.ds-info:nth-child(2)');
    if (contenedor) {
      // Si ya existe el dropdown, lo eliminamos
      const dropdownExistente = contenedor.querySelector('.ds-dropdown');
      if (dropdownExistente) {
        dropdownExistente.remove();
        return;
      }

      // Crear dropdown
      const dropdown = document.createElement('div');
      dropdown.className = 'ds-dropdown';

      // Agregar opciones
      this.ciudades.forEach((ciudad) => {
        const opcion = document.createElement('div');
        opcion.className = 'ds-dropdown-item';
        opcion.textContent = ciudad;
        opcion.addEventListener('click', () => {
          this.seleccionarCiudad(ciudad);
          dropdown.remove();
        });
        dropdown.appendChild(opcion);
      });

      contenedor.appendChild(dropdown);
    }
  }

  // Muestra u oculta el selector de tipo de servicio
  toggleSelectorServicio() {
    const contenedor = this.querySelector('.ds-info:nth-child(3)');
    if (contenedor) {
      // Si ya existe el dropdown, lo eliminamos
      const dropdownExistente = contenedor.querySelector('.ds-dropdown');
      if (dropdownExistente) {
        dropdownExistente.remove();
        return;
      }

      // Crear dropdown
      const dropdown = document.createElement('div');
      dropdown.className = 'ds-dropdown';

      // Agregar opciones
      this.tiposServicio.forEach((servicio) => {
        const opcion = document.createElement('div');
        opcion.className = 'ds-dropdown-item';
        opcion.textContent = servicio;
        opcion.addEventListener('click', () => {
          this.seleccionarServicio(servicio);
          dropdown.remove();
        });
        dropdown.appendChild(opcion);
      });

      contenedor.appendChild(dropdown);
    }
  }

  // Actualiza la ciudad seleccionada
  seleccionarCiudad(ciudad) {
    this.ciudadSeleccionada = ciudad;
    const selectorCiudades = this.querySelector('.ds-info:nth-child(2) .ds-select-info h3');
    if (selectorCiudades) {
      selectorCiudades.textContent = ciudad;
    }
    this.updateLocalesVisibles();
  }

  // Actualiza el tipo de servicio seleccionado
  seleccionarServicio(servicio) {
    this.servicioSeleccionado = servicio;
    const selectorServicio = this.querySelector('.ds-info:nth-child(3) .ds-select-info h3');
    if (selectorServicio) {
      selectorServicio.textContent = servicio;
    }
    this.updateLocalesVisibles();
  }

  // Obtiene los locales filtrados según la selección actual
  getLocalesFiltrados() {
    // Asumimos que todas las sucursales están en Santa Cruz si no se especifica
    let localesFiltrados = this.pizzaLocations;

    // Filtrar por ciudad, si todas las sucursales son de la misma ciudad, no filtramos
    if (this.ciudades.length > 1) {
      localesFiltrados = localesFiltrados.filter((local) =>
        (local.ciudad || 'Santa Cruz') === this.ciudadSeleccionada
      );
    }

    // Filtrar por servicio si no es "TODOS"
    if (this.servicioSeleccionado !== 'TODOS') {
      const servicioNormalizado = this.servicioSeleccionado === 'ENVÍO A DOMICILIO'
        ? 'envío a domicilio'
        : 'recoger en local';

      localesFiltrados = localesFiltrados.filter((local) =>
        local.servicios && local.servicios.some((serv) =>
          serv.toLowerCase() === servicioNormalizado
        )
      );
    }

    return localesFiltrados;
  }

  // Parseamos el horario para obtener hora de apertura y cierre
  parseHorario(horarioString) {
    if (!horarioString) return { horaApertura: 8, horaCierre: 23 }; // Default

    // Ejemplo: "8:00 a 23:00"
    const partes = horarioString.split(' a ');
    if (partes.length !== 2) return { horaApertura: 8, horaCierre: 23 };

    const horaAperturaStr = partes[0].trim();
    const horaCierreStr = partes[1].trim();

    // Extraer solo la hora (ignorar los minutos)
    const horaApertura = parseInt(horaAperturaStr.split(':')[0]);
    const horaCierre = parseInt(horaCierreStr.split(':')[0]);

    return { horaApertura, horaCierre };
  }

  // Verifica si un local está abierto según la hora actual
  estaLocalAbierto(local) {
    if (!local.horario) return true; // Si no hay horario, consideramos que está abierto

    const ahora = new Date();
    const { horaApertura, horaCierre } = this.parseHorario(local.horario);
    const horaActual = ahora.getHours();
    const diaActual = ahora.getDay(); // 0 = domingo, 1 = lunes, 5 = viernes

    // Verificar si hoy está abierto (asumimos que "Lunes a Viernes" es para todos los locales)
    const esDiaLaboral = diaActual >= 1 && diaActual <= 5;
    if (!esDiaLaboral) return false;

    // Verificar horario
    return horaActual >= horaApertura && horaActual < horaCierre;
  }

  // Configura los botones para abrir el mapa
  setupMapButtons() {
    const botonesUbicacion = this.querySelectorAll('.ds-rl-ubicacion');
    const localesFiltrados = this.getLocalesFiltrados();

    botonesUbicacion.forEach((boton, index) => {
      if (index < localesFiltrados.length) {
        const local = localesFiltrados[index];
        boton.addEventListener('click', () => {
          if (local.lat && local.lng) {
            window.open(`https://www.google.com/maps/search/?api=1&query=${local.lat},${local.lng}`, '_blank');
          }
        });
      }
    });
  }

  // Formatea la hora para mostrar (convierte formato 24h a 12h con AM/PM)
  formatearHora(hora) {
    if (hora < 12) {
      return `${hora}:00 AM`;
    } else if (hora === 12) {
      return `12:00 PM`;
    } else {
      return `${hora - 12}:00 PM`;
    }
  }

  // Actualiza la visualización de locales según los filtros actuales
  updateLocalesVisibles() {
    const contenedorRight = this.querySelector('.ds-contenedor-right');
    if (!contenedorRight) return;

    // Limpiar contenedor
    contenedorRight.innerHTML = '';

    // Obtener locales filtrados
    const localesFiltrados = this.getLocalesFiltrados();

    // Generar HTML para cada local
    localesFiltrados.forEach((local) => {
      const horario = this.parseHorario(local.horario);
      const estaAbierto = this.estaLocalAbierto(local);
      const claseDisponibilidad = estaAbierto ? 'ds-abierto' : 'ds-cerrado';
      const textoDisponibilidad = estaAbierto ? 'ABIERTO' : 'CERRADO';

      const horaAperturaFormateada = this.formatearHora(horario.horaApertura);
      const horaCierreFormateada = this.formatearHora(horario.horaCierre);

      const textoHorario = estaAbierto
        ? `Abierto hasta las ${horaCierreFormateada}`
        : `Abre a las ${horaAperturaFormateada}`;

      const localHTML = `
        <div class="ds-rl-local">
          <div class="ds-titulos">
            <h3>${local.ciudad || 'SANTA CRUZ'}</h3>
            <h3 style="color: #C8102E;">${local.name}</h3>
          </div>
          <div class="ds-rl-disponibilidad">
            <div class="ds-rl-disponibilidad-info ${claseDisponibilidad}">
              ${window.shopIcons.icon_disponibilidad}
              <p>${textoDisponibilidad}</p>
            </div>
          </div>
          <div class="ds-rl-info-local">
            <div class="ds-rl-info-local-item">
              ${window.shopIcons.icon_location_on}
              <p>${local.localizacion}</p>
            </div>
            <div class="ds-rl-info-local-item">
              ${window.shopIcons.icon_headser_mic}
              <p>${local.telefono}</p>
            </div>
            <div class="ds-rl-info-local-item">
              ${window.shopIcons.icon_clock}
              <p>${textoHorario}</p>
            </div>
            <div class="ds-rl-info-servicios">
              ${local.servicios
          .map(
            (servicio) => `
                    <div class="ds-rl-info-servicio">
                      ${window.shopIcons.icon_check}
                      <p>${servicio}</p>
                    </div>
                  `
          )
          .join('')}
            </div>
          </div>
          <button class="ds-rl-boton ds-rl-ubicacion">
            <p>Abrir ubicación en mapa</p>
            ${window.shopIcons.icon_map}
          </button>
        </div>
      `;

      // Agregar al contenedor
      contenedorRight.innerHTML += localHTML;
    });

    // Reiniciar event listeners para los botones de mapa
    this.setupMapButtons();
  }
}

// Registrar el elemento personalizado
customElements.define('sucursales-informacion', SucursalesInformacion);
