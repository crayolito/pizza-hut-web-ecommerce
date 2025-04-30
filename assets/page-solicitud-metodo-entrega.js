class ClienteLocalizacion extends HTMLElement {
  constructor() {
    super();
    this.placesService = null;
    this.mapaRecogerLocal = null;
    this.mapaModalEnvioDomicilio = null;
    this.controlSeleccionInput = false;
    this.coordenadas = { lat: -17.783315017953004, lng: -63.18214577296119 };
    this.urlConsulta = "https://pizza-hut-bo.myshopify.com/admin/api/2025-01/graphql.json";
    this.myTest = 'shpat_' + '45f4a7476152f4881d058f87ce063698';
    this.pizzaLocations = [
      {
        lat: -17.757619,
        lng: -63.178738,
        name: 'BANZER 3ER ANILLO',
        localizacion: 'Tercer Anillo Externo',
        telefono: '78452415',
        dias: 'Lunes a Viernes',
        horario: '8:00 a 23:00',
        servicios: ['Envío a domicilio', 'Recoger en local']
      },
      {
        lat: -17.70001,
        lng: -63.160219,
        name: 'BANZER KM 8.5',
        localizacion: '8R2Q+2XH',
        telefono: '78452415',
        dias: 'Lunes a Viernes',
        horario: '8:00 a 23:00',
        servicios: ['Envío a domicilio', 'Recoger en local']
      },
      {
        lat: -17.807739,
        lng: -63.204363,
        name: 'LAS PALMAS',
        localizacion: 'Doble vía La Guardia',
        telefono: '78452415',
        dias: 'Lunes a Viernes',
        horario: '8:00 a 23:00',
        servicios: ['Envío a domicilio', 'Recoger en local']
      },
      {
        lat: -17.758879,
        lng: -63.19948,
        name: 'SAN MARTIN',
        localizacion: 'Av. San Martin 2200',
        telefono: '78452415',
        dias: 'Lunes a Viernes',
        horario: '8:00 a 23:00',
        servicios: ['Envío a domicilio', 'Recoger en local']
      },
      {
        lat: -17.820341,
        lng: -63.184337,
        name: 'SANTOS DUMONT',
        localizacion: 'Av Santos Dumont 3228',
        telefono: '78452415',
        dias: 'Lunes a Viernes',
        horario: '8:00 a 23:00',
        servicios: ['Envío a domicilio', 'Recoger en local']
      }
    ];
  }

  connectedCallback() {
    // CAPTURA DE ELEMENTOS
    // MODAL DE CARGA
    this.containerModalCarga = this.querySelector('#ph-psme-modal-carga');
    // IMAGEN BACKGROUND DEL CONTENEDOR PRINCIPAL
    this.imagenBackground = this.querySelector('.psme-pizza-logo-background');
    // SELECTORES DE OPCIONES DE OBTENER SU PRODUCTO
    this.botonOpcionRecogerLocal = this.querySelector('#psme-boton-recoger-local');
    this.botonOpcionEnvioDomicilio = this.querySelector('#psme-boton-envio-domicilio');
    // SELECTORES DE OPCIONES DEL CLIENTE
    this.contenedorOpcionesUsuario = this.querySelector('.psme-opciones');
    this.botonSiguienteOpcion = this.querySelector('#psme-boton-siguiente');
    this.botonOmitirOpcion = this.querySelector('#p-sme-boton-omitir');
    // SECTOR ELEMENTO OPCIONES ENVIO A DOMICILIO
    this.contenedorOpcionesEnvioDomicilio = this.querySelector('.psme-opciones-envio-domicilio');
    this.botonUsarMiUbicacionActual = this.querySelector('#psme-boton-ubicacion-actual');
    // SECTOR ELEMENTO OPCIONES RECIBIR EN LOCAL
    this.contenedorListaLocales = this.querySelector('.psme-rl-locales');
    this.contenedorMapaRecogerLocal = this.querySelector('.psme-recoger-local-mapa');
    this.contenedorOpcionesRecogerLocal = this.querySelector('.psme-opciones-recoger-local');
    // SELECTORES DE ELEMENTOS SOBRE EL MODAL
    // ELEMENTOS DEL MODAL DE ENVIO A DOMICILIO
    this.contenidoModal = this.querySelector('.psme-modal-mapa-envio-domicilio');
    this.contenedorMapaModal = this.querySelector('.psme-modal-body');
    this.contenedorTotalModal = this.querySelector('.psme-modal-mapa-envio-domicilio');
    this.botonCerrarModal = this.querySelector('#p-sme-boton-cancelar-modal');
    this.botonConfirmarModal = this.querySelector('#p-sme-boton-confirmar-modal');
    this.botonIconoCerrarModal = this.querySelector('#psme-boton-cerrar-modal');
    // ELEMENTOS DEL INPUT DE DIRECCION
    this.inputDireccion = this.querySelector('#psme-input-direccion');
    this.contenedorSugerencias = this.querySelector('#psme-sugerencias-direccion');

    // Asignar event listeners
    this.botonOpcionRecogerLocal.addEventListener('click', this.accionBotonRecogerLocal.bind(this));
    this.botonOpcionEnvioDomicilio.addEventListener('click', this.accionBotonEnvioDomicilio.bind(this));
    this.botonUsarMiUbicacionActual.addEventListener('click', this.accionUbicacionActualEnvioDomicilio.bind(this));
    this.botonCerrarModal.addEventListener('click', this.cerrarModal.bind(this));
    this.botonIconoCerrarModal.addEventListener('click', this.cerrarModal.bind(this));
    this.botonConfirmarModal.addEventListener('click', this.accionConfirmarModal.bind(this));
    this.botonOmitirOpcion.addEventListener('click', this.botonOmitirPrincipal.bind(this));
    this.botonSiguienteOpcion.addEventListener('click', this.botonSiguientePrincipal.bind(this));
    this.contenidoModal.addEventListener('click', (event) => {
      // Verificar si el click fue en el contenedor principal (fondo oscuroo)
      if (event.target === this.contenidoModal) {
        this.cerrarModal();
      }
    });

    // Inicializar contenidos ocultos
    this.contenedorOpcionesRecogerLocal.style.display = 'none';
    this.contenedorOpcionesEnvioDomicilio.style.display = 'none';
    this.contenedorTotalModal.style.visibility = 'hidden';
    this.procesoSucursales();
    this.verificarActivacionBotonSiguientePrincipal();
    // Actualizar la variable this.coordenadas si es que hay en el localstoragee
    if (localStorage.getItem('ubicacion-cliente')) {
      this.coordenadas = JSON.parse(localStorage.getItem('ubicacion-cliente'));
    }
    if (typeof google === 'undefined') {
      console.log('Google Maps aún no está cargado, esperando...');
      // Esperar a que Google Maps se cargue
      window.addEventListener('load', () => {
        if (typeof google !== 'undefined') {
          this.configurarAutocompletadoDirecciones();
        } else {
          console.error('Google Maps no se pudo cargar correctamente');
        }
      });
    } else {
      // Google Maps ya está disponible
      this.configurarAutocompletadoDirecciones();
    }
    this.inicializarPaginaLocalStorage(0);
  }

  async procesoSucursales() {
    const consultaGrapql = `query GetAllLocations {
        locations(first: 50) {
          edges {
            node {
              id
              name
              address {
                address1
                city
                country
                zip
              }
              isActive
            }
          }
        }
      }`;

    try {
      console.log("Consultando API de Shopify...");
      const response = await fetch(window.urlConsulta, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': window.keyBackendShopify
        },
        body: JSON.stringify({ query: consultaGrapql })
      });

      if (!response.ok) {
        console.error(`Error de red: ${response.status}`);
        return;
      }

      const { data, errors } = await response.json();

      if (errors) {
        console.error("Errores en la respuesta GraphQL:", errors);
        return;
      }

      if (!data?.locations?.edges) {
        console.error("Estructura de datos inesperada en la respuesta");
        return;
      }

      const sucursalesShopify = data.locations.edges.map(edge => edge.node);
      console.log("Datos recibidos de Shopify:", sucursalesShopify);

      // Crear un mapa para búsqueda eficiente
      const sucursalesMap = new Map();
      window.localizacionesSucursales.forEach(local => {
        if (local?.name) sucursalesMap.set(local.name, local);
      });

      let actualizadas = 0;

      // Actualizar sucursales
      sucursalesShopify.forEach(sucursal => {
        if (!sucursal?.name) {
          console.warn("Sucursal sin nombre encontrada, omitiendo");
          return;
        }
        const localSucursal = sucursalesMap.get(sucursal.name);
        if (localSucursal) {
          localSucursal.id = sucursal.id || '';
          actualizadas++;
        } else {
          console.log(`No se encontró coincidencia local para: ${sucursal.name}`);
        }
      });

      localStorage.setItem('ph-sucursales', JSON.stringify(window.localizacionesSucursales));
      this.pizzaLocations = window.localizacionesSucursales;
      // console.log(`Proceso finalizado: ${actualizadas} de ${sucursalesShopify.length} sucursales actualizadas`);
      // console.log("Sucursales actualizadas:", window.localizacionesSucursales);
    } catch (error) {
      console.error('Error en el proceso:', error);
    } finally {
      console.log("Proceso de actualización completado");
    }
  }

  inicializarPaginaLocalStorage(intentos = 0) {
    console.log('Inicia la pagina de localStorage');
    // Verificar si existe el localStorage y la clave 'ubicacion-cliente'
    if (localStorage.getItem('ubicacion-cliente')) {
      // Si existe, cargar la ubicación del cliente desde el localStorage
      this.coordenadas = JSON.parse(localStorage.getItem('ubicacion-cliente'));
    }

    // Verificar si Google Maps esta cargado
    if (typeof google == 'undefined') {
      this.containerModalCarga.style.display = 'flex';
      // Limitar a 10 intentos para evitar bucles infinitos
      if (intentos < 10) {
        console.log("Google Maps no está cargado, esperando... Intento " + (intentos + 1));
        setTimeout(() => {
          this.inicializarPaginaLocalStorage(intentos + 1);
        }, 500); // Esperar 0.5 segundos antes de volver a intentar
      } else {
        console.error("Google Maps no se cargó después de varios intentos");
      }
      return;
    }

    // Si llegamos aquí, Google Maps está cargado, podemos ocultar el modal de carga
    if (this.containerModalCarga.style.display === 'flex') {
      this.containerModalCarga.style.display = 'none';
    }

    // Verificar si hay datos preseleccionados en el localStorage (INDEX)
    // Verificar si hay datos en el localStorage (PAGINA METODO DE ENTREGA)
    const localStorageIndex = localStorage.getItem('seleccion-me-mi');
    const localStorageMetodoEntrega = localStorage.getItem('ph-metodo-entrega');

    if (localStorageMetodoEntrega == null || localStorageMetodoEntrega == 'no') {
      if (localStorageIndex == 'domicilio') {
        this.accionBotonEnvioDomicilio();
      }
      if (localStorageIndex == 'local') {
        this.accionBotonRecogerLocal();
      }
    } else {
      if (localStorageMetodoEntrega == 'domicilio') {
        this.accionBotonEnvioDomicilio();
      }
      if (localStorageMetodoEntrega == 'local') {
        this.accionBotonRecogerLocal();
      }
    }
  }

  // FUNCIONES RELACIONADAS A LA SELECCION => RECOGER EN LOCALl 
  inicializarMapaRecogerLocal() {
    // Verificar si existe el contenedor del mapa y crear configuracion de mapa
    if (!this.contenedorMapaRecogerLocal) {
      alert('Error: No se pudo cargar el mapa. Por favor recarga la página');
      return;
    }

    const configuracionMapa = {
      center: this.coordenadas,
      zoom: 14,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      scaleControl: false,
      rotateControl: false,
      panControl: false,
      disableDefaultUI: false,
    };

    // Guardar referencia al mapa en this.mapaRecogerLocal
    this.mapaRecogerLocal = new google.maps.Map(this.contenedorMapaRecogerLocal, configuracionMapa);

    // Crear elemento que indique la ubicacion actual
    const marcadorUbicacionActual = new google.maps.Marker({
      position: this.coordenadas,
      map: this.mapaRecogerLocal,
      draggable: false,
      animation: google.maps.Animation.DROP,
    });

    // Crear marcadores personalizados para cada local
    this.pizzaLocations.forEach(local => {
      // Crear icono personalizado
      const iconoPersonalizado = {
        url: '{{ "logo-primario.png" | asset_url }}',
        scaledSize: new google.maps.Size(40, 40),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(20, 40)
      };

      // Crear el marcador con el icono personalizado
      const marcadorLocal = new google.maps.Marker({
        position: { lat: local.lat, lng: local.lng },
        map: this.mapaRecogerLocal,
        draggable: false,
        icon: iconoPersonalizado
      });

      // Almacenar información personalizada en el marcador
      // marcadorLocal.set('infoLocal', JSON.stringify(local)); 

      // Sacar el nombre del local y guardarlo en el marcador en formato
      marcadorLocal.set('nombreLocal', this.obtenerNombreIdentificadorLocal(local.name));

      // Añadir evento para mostrar la información en la consola al hacer clic
      google.maps.event.addListener(marcadorLocal, 'click', function () {
        console.log('Nombre del local:', this.get('nombreLocal'));

        // Enfocar el local mediante el click del marcador
        // Sera enfocado en la lista de locales
        self.enfocarLocalmedianteelClickMarcador(this.get('nombreLocal'));
      });
    });

    // Guardar una referencia a "this" para usar dentro de callbackss
    const self = this;

    // Pedir la ubicacion del usuario y actualizar el marcador a esa posicion
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          try {
            const miUbicacion = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            // Actualizar el marcador de la ubicación actual
            marcadorUbicacionActual.setPosition(miUbicacion);

            // Mover el mapa a la nueva ubicación
            this.mapaRecogerLocal.panTo(miUbicacion);  // USAR this.mapaRecogerLocal en vez de mapa

            // Actualizar la variable de coordenadas usada de forma general
            this.coordenadas = miUbicacion;

            // Actualizar la lista de locales
            this.actualizarElementosSeleccionLocal();
          } catch (error) {
            alert('Error al obtener la ubicación: Por favor, verifique la ubicación de su dispositivo');
            console.log('Error al obtener la ubicación 1: ', error);
          }
        },
        (error) => {
          alert('Error al obtener la ubicación: Por favor, verifique la ubicación de su dispositivo');
          console.log('Error al obtener la ubicación 2: ', error);
        }
      );
    }
  }

  crearElementosSeleccionLocal() {
    // Pre-renderizar íconos Liquid como variables JavaScript
    const iconoDisponibilidad = `{% render 'icon-disponibilidad' %}`;
    const iconoLocationOn = `{% render 'icon-location-on' %}`;
    const iconoHeadserMic = `{% render 'icon-headser-mic' %}`;
    const iconoClock = `{% render 'icon-clock' %}`;
    const iconoCheck = `{% render 'icon-check' %}`;
    const iconoMap = `{% render 'icon-map' %}`;
    // Obtener la hora actual y almacenar en una variable
    const horaActual = new Date().getHours();

    let contenidoHTML = ``;

    // Lista nueva de locales ordenados deacuerdo a this.coordenadas
    const listaLocalesOrdenados = this.ordenarLocalesPorDistancia();

    listaLocalesOrdenados.forEach(local => {
      // Verificar si el local está abierto
      // Extraer las horas de inicio y fin del formato "8:00 a 23:00"
      const horaInicio = parseInt(local.horario.split('a')[0]);
      const horaFin = parseInt(local.horario.split('a')[1]);
      const estaAbierto = horaActual >= horaInicio && horaActual <= horaFin;
      // Quitar espacios en blanco y convertir a minúsculas para el nombre del local
      const nombreIdentificador = this.obtenerNombreIdentificadorLocal(local.name);

      contenidoHTML += `
          <div class="psme-rl-local psme-rl-local-no-seleccionado" data-local="${nombreIdentificador}" id="psme-rl-local-${nombreIdentificador}">
            <div class="psme-rl-titulos">
              <h3>SANTA CRUZ</h3>
              <h3 style="color: #C8102E;">${local.name}</h3>
            </div>
        `;

      if (estaAbierto) {
        contenidoHTML += `
            <div class="psme-rl-disponibilidad">
              <div class="psme-rl-disponibilidad-info psme-rl-abierto ">
                ${iconoDisponibilidad}
                <p>ABIERTO</p>
              </div>
            </div>
          `;
      } else {
        contenidoHTML += `
          <div class="psme-rl-disponibilidad">
            <div class="psme-rl-disponibilidad-info psme-rl-cerrado ">
              ${iconoDisponibilidad}
              <p>CERRADO</p>
            </div>
          </div>
        `;
      }

      contenidoHTML += `
            <div class="psme-rl-info-local ">
              <div class="psme-rl-info-local-item">
                ${iconoLocationOn}
                <p>${local.localizacion}</p>
              </div>
              <div class="psme-rl-info-local-item">
                ${iconoHeadserMic}
                <p>${local.telefono}</p>
              </div>
              <div class="psme-rl-info-local-item">
                ${iconoClock}
                <p>De ${local.dias} ${local.horario}</p>
              </div>
              <div class="psme-rl-info-servicios">
          `;

      local.servicios.forEach(servicio => {
        contenidoHTML += `
              <div class="psme-rl-info-servicio">
                ${iconoCheck}
                <p>${servicio}</p>
              </div>
            `;
      });

      contenidoHTML += `
              </div>
            </div>
            <button 
              class="psme-rl-boton psme-rl-empezar" 
              data-accion="empezar" 
              data-local="${nombreIdentificador}"  
              id="psme-rl-boton-empezar-${nombreIdentificador}">
              <p>PRE - PEDIDO</p>
            </button>
            <button 
              class="psme-rl-boton psme-rl-ubicacion"
              data-accion="ubicacion" 
              data-local="${nombreIdentificador}"  
              id="psme-rl-boton-ubicacion-${nombreIdentificador}">
              <p>Abrir ubicación en mapa</p>
              ${iconoMap}
            </button>
          </div>
        `;
    });

    this.contenedorListaLocales.innerHTML = contenidoHTML;

    // Configurar el evento delegado después de crear el HTML  => METODO DELEGACION DE EVENTOS
    this.configurarEventosLocales();
  }

  configurarEventosLocales() {
    // Eliminar el evento click del contenedor de locales
    this.contenedorListaLocales.removeEventListener('click', this._manejarEventoLocales);

    // Creamos una función de manejo de eventos y la guardamos como propiedad de la clase
    // para poder eliminarla más tarde si es necesario
    this._manejarEventoLocales = (event) => {
      // 1. Verificar si se hizo clic en un botón específico
      const boton = event.target.closest('.psme-rl-boton');
      if (boton) {
        const nombreLocal = boton.dataset.local;
        const accion = boton.dataset.accion;

        // Ejecutar la acción según el tipo de botón
        if (accion === 'empezar') {
          this.localBotonPrePedido(nombreLocal);
          // Evita que el clic llegue al contenedor local
          event.stopPropagation();
          return;
        } else if (accion === 'ubicacion') {
          this.localBotonUbicacionEnMapa(nombreLocal);
          // Evita que el clic llegue al contenedor local
          event.stopPropagation();
          return;
        }
      }

      // 2. Si no fue un botón, verificar si se hizo click en el área del local
      const localElement = event.target.closest('.psme-rl-local');
      if (localElement) {
        const nombreLocal = localElement.dataset.local;
        this.localSeleccionado(nombreLocal);
      }
    };

    // Agregamos el event listener al contenedor
    this.contenedorListaLocales.addEventListener('click', this._manejarEventoLocales);
  }

  localSeleccionado(nombreLocal) {
    console.log('Entra a localSeleccionado: ', nombreLocal);

    // Quitar la clase seleccionado a todos los locales
    const locales = this.contenedorListaLocales.querySelectorAll('.psme-rl-local');
    locales.forEach(local => {
      local.classList.remove('psme-rl-local-seleccionado');
      local.classList.add('psme-rl-local-no-seleccionado');
    });

    // Marcar el local seleccionado
    const localSeleccionado = this.querySelector(`#psme-rl-local-${nombreLocal}`);
    if (localSeleccionado) {
      localSeleccionado.classList.remove('psme-rl-local-no-seleccionado');
      localSeleccionado.classList.add('psme-rl-local-seleccionado');
    }

    // Enfocar el local seleccionado en el mapa con animación
    const localSeleccionadoDatos = this.pizzaLocations.find(local =>
      this.obtenerNombreIdentificadorLocal(local.name) === nombreLocal
    );

    if (localSeleccionadoDatos) {
      const opciones = {
        duration: 750,
        easing: 'easeInOut'
      };

      // Animar el movimiento del mapa
      this.mapaRecogerLocal.panTo({
        lat: localSeleccionadoDatos.lat,
        lng: localSeleccionadoDatos.lng
      }, opciones);

      // Cambiar el zoom con animación también
      this.mapaRecogerLocal.setZoom(17);
    }
  }

  async localBotonPrePedido(nombreLocal) {
    // Primero se encuentra al nombreLocal
    const localSeleccionado = this.pizzaLocations.find(local =>
      this.obtenerNombreIdentificadorLocal(local.name) === nombreLocal
    );

    // Se guarda en el localStorage las coordendas del local
    const direccion = await AuxiliaresGlobal.obtenerDireccionDesdeCoordenadas(
      localSeleccionado.lat,
      localSeleccionado.lng
    );
    // {% comment %} const direccion = await this.obtenerDireccionDesdeCordenadas(localSeleccionado.lat, localSeleccionado.lng); {% endcomment %}
    localStorage.setItem('direccion-cliente', JSON.stringify(direccion));
    localStorage.setItem('ubicacion-cliente', JSON.stringify({
      lat: localSeleccionado.lat,
      lng: localSeleccionado.lng
    }));
    localStorage.setItem('ph-metodo-entrega', 'local');
    localStorage.setItem('sucursal-informacion', JSON.stringify(localSeleccionado));

    // Despues se redirecciona al indexx
    window.location.href = '/';
    console.log('Boton empezar pedido presionado: ', nombreLocal);
    console.log('Local Boton Pre Pedido: ', localSeleccionado);
  }

  localBotonUbicacionEnMapa(nombreLocal) {
    // Primero se encuentra al nombreLocal
    const localSeleccionado = this.pizzaLocations.find(local =>
      this.obtenerNombreIdentificadorLocal(local.name) === nombreLocal
    );

    // Se habre otra venta google maps con las coordenadas del local
    window.open(`https://www.google.com/maps/search/?api=1&query=${localSeleccionado.lat},${localSeleccionado.lng}`, '_blank');
    console.log('Boton ubicacion en mapa presionado: ', nombreLocal);
  }

  actualizarElementosSeleccionLocal() {
    console.log('Se ejecuto el metodo actualizarElementosSeleccionLocal');

    // Obtener los locales ordenados por distancia
    const listaLocalesOrdenados = this.ordenarLocalesPorDistancia();

    // Obtener referncias a todos los elementos de local existentes
    const elementosLocales = Array.from(this.contenedorListaLocales.querySelectorAll('.psme-rl-local'));

    // No hay elementos para reordenar, posiblemente sea la primera carga 
    if (elementosLocales.length === 0) {
      this.crearElementosSeleccionLocal();
      return;
    }

    // Crear un mapa para asociar el  nombre del local con su elemento DOM 
    const mapaNombreAElemento = {};
    elementosLocales.forEach(elemento => {
      const nombreLocal = elemento.dataset.local;

      // Desconectar el elemento del DOM para manipularlo sin causar reflows
      const elementoClonado = elemento.cloneNode(true);
      mapaNombreAElemento[nombreLocal] = elementoClonado;
      // No eliminamos el original todavia
    });

    // Crear un fragmento para minimizar reflows
    // Este es un objeto DOM ligero que sirve como contenedor
    // temporal para añadir elementos sin causar reflows
    const fragmento = document.createDocumentFragment();

    // Reconstruir la lista en el orden correcto
    listaLocalesOrdenados.forEach(local => {
      const nombreIdentificador = this.obtenerNombreIdentificadorLocal(local.name);
      const elementoLocal = mapaNombreAElemento[nombreIdentificador];

      if (elementoLocal) {
        // Vericicar si el estao de apertura ha cambiado y actualizar si es necesario 
        const horaActual = new Date().getHours();
        const estaAbierto = horaActual >= parseInt(local.horario.split('a')[0]) &&
          horaActual <= parseInt(local.horario.split('a')[1]);

        const divDisponibilidad = elementoLocal.querySelector('.psme-rl-disponibilidad-info');
        if (divDisponibilidad) {
          if (estaAbierto && divDisponibilidad.classList.contains('psme-rl-cerrado')) {
            divDisponibilidad.classList.remove('psme-rl-cerrado');
            divDisponibilidad.classList.add('psme-rl-abierto');
            divDisponibilidad.querySelector('p').textContent = 'ABIERTO';
          } else if (!estaAbierto && divDisponibilidad.classList.contains('psme-rl-abierto')) {
            divDisponibilidad.classList.remove('psme-rl-abierto');
            divDisponibilidad.classList.add('psme-rl-cerrado');
            divDisponibilidad.querySelector('p').textContent = 'CERRADO';
          }
        }

        // Esta linea agrega el elemenot clonado al fragmento (no al DOM todavia).
        fragmento.appendChild(elementoLocal);
      }

      // Calcular la distancia actual y mostrarla si deseas (opcional)
      // {% comment %} const distancia = this.calcularDistancia(this.coordenadas, { lat: local.lat, lng: local.lng }); {% endcomment %}
      // Podrías añadir un elemento para mostrar esta distancia si lo deseas
    });

    // Vaciar el contenedor y añadir el fragmento de una sola vez
    this.contenedorListaLocales.innerHTML = '';
    this.contenedorListaLocales.appendChild(fragmento);

    // Reconfigurar eventos
    this.configurarEventosLocales();

    // Si hay algún local seleccionado previamente, mantener su selección
    const localSeleccionadoElement = this.contenedorListaLocales.querySelector('.psme-rl-local-seleccionado');
    if (localSeleccionadoElement) {
      const nombreLocal = localSeleccionadoElement.dataset.local;
      this.localSeleccionado(nombreLocal);
    }
  }

  enfocarLocalmedianteelClickMarcador(nombreLocal) {
    // 1. Seleccionar el local en la lista
    this.localSeleccionado(nombreLocal);

    // 2. Obtener el elemento del local 
    const elementoLocal = this.querySelector(`#psme-rl-local-${nombreLocal}`);

    if (elementoLocal) {
      // 3. Hacer scroll con animación suave hacia el elemento
      elementoLocal.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }

  // FUNCIONES RELACIONADAS A LA SELECCION => ENVIO A DOMICILIO
  accionUbicacionActualEnvioDomicilio() {
    this.contenedorOpcionesUsuario.style.display = 'none';
    this.contenedorTotalModal.style.visibility = 'visible';
    // Activar el mapa dentro del modal
    this.inicializarMapaEnvioDomicilio();
  }

  configurarAutocompletadoDirecciones() {
    // Verificar que el input existe
    if (!this.inputDireccion) return;

    // Variable para almacenar el timer del debounce
    let timeoutId = null;

    // Variable para el servicio de Places
    this.placesService = new google.maps.places.AutocompleteService();

    // Escuchar el evento input
    this.inputDireccion.addEventListener('input', (e) => {
      // Limpiar el timer anterior si existe
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const query = e.target.value.trim();

      // Si el input está vacío, ocultar sugerencias
      if (!query) {
        this.controlActivacionSiguienteEnvioDomicilio();
        this.contenedorSugerencias.style.display = 'none';
        return;
      }

      // Configurar debounce (500ms)
      timeoutId = setTimeout(() => {
        this.buscarSugerenciasDirecciones(query);
      }, 500);
    });

    // Cerrar sugerencias al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!this.inputDireccion.contains(e.target) && !this.contenedorSugerencias.contains(e.target)) {
        this.contenedorSugerencias.style.display = 'none';
      }
    });
  }

  buscarSugerenciasDirecciones(query) {
    // Opciones para la búsqueda
    const opcionesBusqueda = {
      input: query,
      componentRestrictions: { country: 'bo' } // Ajusta al país (Bolivia)
    };

    // Realizar la búsqueda
    this.placesService.getPlacePredictions(opcionesBusqueda, (predictions, status) => {
      // Limpiar contenedor de sugerencias
      this.contenedorSugerencias.innerHTML = '';

      if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions) {
        this.contenedorSugerencias.style.display = 'none';
        return;
      }

      // Limitar a 3 sugerencias
      const sugerencias = predictions.slice(0, 3);

      // Mostrar sugerencias
      sugerencias.forEach(sugerencia => {
        const elemento = document.createElement('div');
        elemento.classList.add('psme-sugerencia-item');

        // Crear elemento p para el texto
        const textoElemento = document.createElement('p');
        textoElemento.textContent = sugerencia.description;
        elemento.appendChild(textoElemento);

        // Agregar evento de clic
        elemento.addEventListener('click', () => {
          this.seleccionarDireccion(sugerencia);
        });

        this.contenedorSugerencias.appendChild(elemento);
      });

      // Mostrar el contenedor
      if (sugerencias.length > 0) {
        this.contenedorSugerencias.style.display = 'block';
      } else {
        this.contenedorSugerencias.style.display = 'none';
      }
    });
  }

  seleccionarDireccion(sugerencia) {
    this.controlSeleccionInput = true;

    // Actualizar el valor del input
    this.inputDireccion.value = sugerencia.description;

    // Ocultar sugerencias
    this.contenedorSugerencias.style.display = 'none';

    // Obtener las coordenadas del lugar seleccionado
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ placeId: sugerencia.place_id }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results[0]) {
        const ubicacion = results[0].geometry.location;

        // Actualizar la variable de coordenadas usada de forma general
        this.coordenadas = {
          lat: ubicacion.lat(),
          lng: ubicacion.lng()
        };

        console.log('Coordenadas de dirección seleccionada:', this.coordenadas);
        this.controlActivacionSiguienteEnvioDomicilio();

        // Aquí puedes hacer lo que necesites con las coordenadas
        // Por ejemplo, mostrar el modal con el mapa centrado en estas coordenadas
      }
    });
  }

  controlActivacionSiguienteEnvioDomicilio() {
    if (this.inputDireccion.value === '') {
      this.botonSiguienteOpcion.disabled = true;
      this.controlSeleccionInput = false;
    } else {
      this.botonSiguienteOpcion.disabled = false;
      this.controlSeleccionInput = true;
    }
  }

  // FUNCIONES SOBRE EL MODAL DEL ENVIO A DOMICILIO
  inicializarMapaEnvioDomicilio() {
    // 1. Crear el mapa
    if (!this.contenedorMapaModal) {
      alert('Error: No se pudo cargar el mapa. Por favor recarga la página');
      return;
    }

    console.log('Entra a inicializarMapaEnvioDomicilio : ', this.coordenadas);

    const configuracionMapa = {
      center: this.coordenadas,
      zoom: 16,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      scaleControl: false,
      rotateControl: false,
      panControl: false,
      disableDefaultUI: false,
    };

    const mapa = new google.maps.Map(this.contenedorMapaModal, configuracionMapa);

    // 2. Crear el marcador movible 
    const marcadorMovible = new google.maps.Marker({
      position: this.coordenadas,
      map: mapa,
      draggable: true,
      animation: google.maps.Animation.DROP,
    });

    // 3. Configurar el evento del marcador
    marcadorMovible.addListener('dragend', (evento) => {
      try {
        const posicion = marcadorMovible.getPosition();
        this.coordenadas = { lat: posicion.lat(), lng: posicion.lng() };

        console.log('Coordenadas: ', this.coordenadas);
        mapa.panTo(posicion);
      } catch {
        alert('Error al actualizar la posición');
        console.error(error);
      }
    });

    // 4. Pedir la ubicacion del usuario y actualizar el marcador a esa posicion
    if (this.controlSeleccionInput == true) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          try {
            const miUbicacion = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            marcadorMovible.setPosition(miUbicacion);
            mapa.panTo(miUbicacion);
            this.coordenadas = miUbicacion;
          } catch (error) {
            alert('Error al obtener la ubicación: Por favor, verifique la ubicación de su dispositivo');
            console.log('Error al obtener la ubicación 1: ', error);
          }
        },
        (error) => {
          alert('Error al obtener la ubicación: Por favor, verifique la ubicación de su dispositivo');
          console.log('Error al obtener la ubicación 2: ', error);
        }
      );
    }
  }

  async accionConfirmarModal() {
    console.log('Ubicacion guardada en localStorage: ', localStorage.getItem('ubicacion-cliente'));
    this.cerrarModal();
    localStorage.setItem('ph-metodo-entrega', 'domicilio');
    const direccion = await AuxiliaresGlobal.obtenerDireccionDesdeCoordenadas(
      this.coordenadas.lat,
      this.coordenadas.lng
    );

    // {% comment %} const direccion = await this.obtenerDireccionDesdeCordenadas(
    //   this.coordenadas.lat,
    //   this.coordenadas.lng
    // ); {% endcomment %}
    localStorage.setItem('direccion-cliente', JSON.stringify(direccion));
    localStorage.setItem('ubicacion-cliente', JSON.stringify(this.coordenadas));
    window.location.href = '/';

    // Navegar a la siguiente pagina que correspondee
  }

  cerrarModal() {
    this.contenedorOpcionesUsuario.style.removeProperty('display');
    this.contenedorTotalModal.style.visibility = 'hidden';
  }

  // FUNCIONES SOBRE LA OPCIONES PRINCIPALES
  verificarActivacionBotonSiguientePrincipal() {
    if (this.botonOpcionEnvioDomicilio.classList.contains('psme-opcion-seleccionado') ||
      this.botonOpcionRecogerLocal.classList.contains('psme-opcion-seleccionado')) {
      // Al menos uno está seleccionado, ACTIVAR el botón
      this.botonSiguienteOpcion.disabled = false;
    } else {
      // Ninguno está seleccionado, DESACTIVAR el botón
      this.botonSiguienteOpcion.disabled = true;
    }
  }

  async botonOmitirPrincipal() {
    const direccion = await AuxiliaresGlobal.obtenerDireccionDesdeCoordenadas(
      this.coordenadas.lat,
      this.coordenadas.lng
    );
    // {% comment %} const direccion = await this.obtenerDireccionDesdeCordenadas(
    //   this.coordenadas.lat
    //     this.coordenadas.lng
    // ); {% endcomment %}
    localStorage.setItem('direccion-cliente', JSON.stringify(direccion));
    localStorage.setItem('ubicacion-cliente', JSON.stringify(this.coordenadas));
    // {% comment %} localStorage.setItem('ph-metodo-entrega', 'no'); {% endcomment %}
    window.location.href = '/';
    // Navegar a la siguiente pagina que corresponde
    console.log('Se presiono el boton omitir procede ir a la siguiente pagina');
  }

  async botonSiguientePrincipal() {

    const direccion = await AuxiliaresGlobal.obtenerDireccionDesdeCoordenadas(
      this.coordenadas.lat,
      this.coordenadas.lng
    );
    // {% comment %}
    // const direccion = await this.obtenerDireccionDesdeCordenadas(
    //   this.coordenadas.lat,
    //   this.coordenadas.lng
    // );
    // {% endcomment %}
    localStorage.setItem('direccion-cliente', JSON.stringify(direccion));
    localStorage.setItem('ph-metodo-entrega', 'domicilio');
    localStorage.setItem('ubicacion-cliente', JSON.stringify(this.coordenadas));
    window.location.href = '/';
    // Navegar a la siguiente pagina que corresponde
    console.log('Se presiono el boton siguiente procede ir a la siguiente pagina');
  }

  // FUNCIONES RELACIONADAS A LAS OPCIONES DE RESIBIR LA PIZZA

  accionBotonRecogerLocal() {
    // 1. Cambiar estado visual del botón y obtener elementos clave
    const estaActivo = this.botonOpcionRecogerLocal.classList.toggle('psme-opcion-seleccionado');
    const iconoEstado = this.botonOpcionRecogerLocal.querySelector('.psme-icono-select');
    const imagenBackground = this.imagenBackground;

    if (estaActivo) {
      console.log('Entra a activar modo recogida en local test 1');

      // === MODO ACTIVACIÓN ===
      iconoEstado.innerHTML = `{% render 'icon-estado-on' %}`;

      // Ajustar interfaz para modo recogida en local:
      this.imagenBackground.style.visibility = 'hidden';
      this.contenedorOpcionesRecogerLocal.style.removeProperty('display');
      this.botonSiguienteOpcion.style.display = 'none';
    } else {
      // === MODO DESACTIVACIÓN ===
      this.desactivarBotonRecogerLocal();

      // Revertir cambios de interfaz:
      this.imagenBackground.style.removeProperty('visibility');
      this.contenedorOpcionesRecogerLocal.style.display = 'none';
      this.botonSiguienteOpcion.style.removeProperty('display');
    }

    // Desactivar modo envío a domicilio si está activo
    if (this.botonOpcionEnvioDomicilio.classList.contains('psme-opcion-seleccionado')) {
      this.botonSiguienteOpcion.style.display = 'none';
      // {% comment %} this.botonSiguienteOpcion.style.removeProperty('display'); {% endcomment %}
      this.contenedorOpcionesEnvioDomicilio.style.display = 'none';
      this.desactivarBotonEnvioDomicilio();
    }


    // Crear elementos de seleccion de local
    console.log('Se ejecuto el metodo crearElementosSeleccionLocal');
    this.crearElementosSeleccionLocal();
    // Inicializar mapa para el modo de recogida en local
    this.inicializarMapaRecogerLocal();
    // Verificar si cumple con los requisitos para activar el boton siguiente
    this.verificarActivacionBotonSiguientePrincipal();
  }

  accionBotonEnvioDomicilio() {
    // 1. Cambiar estado visual del botón y obtener elementos clave
    const estaActivo = this.botonOpcionEnvioDomicilio.classList.toggle('psme-opcion-seleccionado');
    const iconoEstado = this.botonOpcionEnvioDomicilio.querySelector('.psme-icono-select');
    const imagenBackground = this.imagenBackground;

    if (estaActivo) {
      // === MODO ACTIVACIÓN ===
      iconoEstado.innerHTML = `{% render 'icon-estado-on' %}`;

      // Ajustar interfaz para modo envío a domicilio:
      this.imagenBackground.style.visibility = 'hidden';
      this.contenedorOpcionesEnvioDomicilio.style.removeProperty('display');
    } else {
      // === MODO DESACTIVACIÓN ===
      this.desactivarBotonEnvioDomicilio();

      // Revertir cambios de interfaz:
      this.imagenBackground.style.removeProperty('visibility');
      this.contenedorOpcionesEnvioDomicilio.style.display = 'none';
    }

    // Desactivar el modo de recoger en local si está activo
    if (this.botonOpcionRecogerLocal.classList.contains('psme-opcion-seleccionado')) {
      this.botonSiguienteOpcion.style.removeProperty('display');
      this.contenedorOpcionesRecogerLocal.style.display = 'none';
      this.desactivarBotonRecogerLocal();
    }

    // Verificar si cumple con los requisitos para activar el boton siguiente
    this.verificarActivacionBotonSiguientePrincipal();

    // Verificar si el input esta vacio o fue preseleccionado
    this.controlActivacionSiguienteEnvioDomicilio();
  }

  desactivarBotonEnvioDomicilio() {
    this.botonOpcionEnvioDomicilio.classList.remove('psme-opcion-seleccionado');
    const iconoEstado = this.botonOpcionEnvioDomicilio.querySelector('.psme-icono-select');
    iconoEstado.innerHTML = `{% render 'icon-estado-off' %}`;
  }

  desactivarBotonRecogerLocal() {
    this.botonOpcionRecogerLocal.classList.remove('psme-opcion-seleccionado');
    const iconoEstado = this.botonOpcionRecogerLocal.querySelector('.psme-icono-select');
    iconoEstado.innerHTML = `{% render 'icon-estado-off' %}`;
  }

  // Helpers para todo el componente

  obtenerNombreIdentificadorLocal(nombreLocal) {
    return nombreLocal
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
  }

  ordenarLocalesPorDistancia() {
    return this.pizzaLocations.sort((a, b) => {
      const distanciaA = this.calcularDistancia(this.coordenadas, { lat: a.lat, lng: a.lng });
      const distanciaB = this.calcularDistancia(this.coordenadas, { lat: b.lat, lng: b.lng });
      return distanciaA - distanciaB;
    });
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
}

customElements.define('cliente-localizacion', ClienteLocalizacion);