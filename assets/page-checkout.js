
class PageCheckoutPH extends HTMLElement {
  constructor() {
    super();
    // INFORMACION DE LA ULTIMA ORDEN
    this.infoOrdenPreliminar = null;
    this.infoUltimaOrden = null;
    this.dataCarrito = null;
    this.urlConsulta = "https://pizza-hut-bo.myshopify.com/admin/api/2025-01/graphql.json";
    this.estadoPagina = "domicilio";
    this.estadoProcesoDireccion = "";
    this.coordenadas = { lat: -17.783315017953004, lng: -63.18214577296119 };
    this.pizzaLocations = window.pizzaLocations || [];
    this.infoCarrito = null;

    this.localSeleccionado = null;

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
    this.listaDireccionPrueba = JSON.parse(localStorage.getItem('ph-datos-usuario')).direcciones || [
      {
        "lat": -17.783315017953004,
        "lng": -63.18214577296119,
        "indicaciones": "Puente Urubo 91, Santa Cruz de la Sierra",
        "alias": "Ubicacion de entrega",
      },
      // {
      //   "lat": -17.783315017953004,
      //   "lng": -63.18214577296119,
      //   "indicaciones": "Santa Cruz, San Martin 2200, Bolivia",
      //   "alias": "Casa del abuelo",
      // },
      // {
      //   "lat": -17.783315017953004,
      //   "lng": -63.18214577296119,
      //   "indicaciones": "Santa Cruz, Av. Santos Dumont 3228, Bolivia",
      //   "alias": "Casa por mi suegra",
      // },
      // {
      //   "lat": -17.783315017953004,
      //   "lng": -63.18214577296119,
      //   "indicaciones": "Santa Cruz, Av. Banzer 3er Anillo, Bolivia",
      //   "alias": "Trabajo",
      // }
    ]
    this.direccionSeleccionada = this.listaDireccionPrueba[0];

    this.seleccionadoEstadoPago = null;

    this.url = "https://qr.farmacorp.com/api/v1";
    this.user = "fbustos";
    this.pass = "Fwy" + "8xYfq";
    this.myTest = "shpat_" + "23d619ad617e8ed378cc27dd6ce39869";
    this.totalCarrito = 0;
  }

  connectedCallback() {
    // DECLARAR ELEMENTOS
    this.btnMetodoLocal = this.querySelector('#phpc-metodo-local');
    this.btnMetodoDomicilio = this.querySelector('#phpc-metodo-domicilio');

    this.bodyModalLocalSeleccionado = this.querySelector('#phpc-modal-body-local-seleccionado');
    this.modalBodyContenedorMapa = this.querySelector('#phpc-localSeleccionado-mapa');
    // this.btnCerrarModalContenedorLocalSeleccionado = this.querySelector('#phpc-btn-cerrar-modal');
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
    this.contenedorBaseMensaje = this.querySelector('.ph-modal-main-mensajes');
    this.contenedorQR = this.querySelector('.ph-modal-body-qr');
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
    this.seccionGeneralMetodosPago = this.querySelector('#phpc-sector-metodos-de-pago');
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

    this.cerrarModalMensaje = this.querySelectorAll('#phpc-btn-cerrar-modal');
    this.btnContinuar = this.querySelector('#phpc-btn-continuar-general');

    // INICIALIZAR EVENTOS
    this.btnMetodoLocal.addEventListener('click', this.seleccionarMetodoLocal.bind(this));
    this.btnMetodoDomicilio.addEventListener('click', this.seleccionarMetodoDomicilio.bind(this));
    this.btnVerDireccionEnMapa.addEventListener('click', this.verDireccionEnMapaLocalSeleccionado.bind(this));
    // this.btnCerrarModalContenedorLocalSeleccionado.addEventListener('click', this.cerrarModalLocalSeleccionado.bind(this));
    this.btnAnadirNuevaDireccion.addEventListener('click', this.procesoParaAnadirNuevaDireccion.bind(this));
    this.btnCerrarModalNuevaDireccion.addEventListener('click', this.cerrarModalNuevaDireccion.bind(this));
    this.btnVolverAtrasNuevaDireccion.addEventListener('click', this.procesoVolverAtrasNuevaDireccion.bind(this));
    this.btnMiUbicacionActualF1.addEventListener('click', this.procesoMiUbicacionActualF1.bind(this));
    this.btnProcesoPrincipalNd.addEventListener('click', this.procesoPrincipalNuevaDireccion.bind(this));
    this.btnCancelarNd.addEventListener('click', this.procesoVolverAtrasNuevaDireccion.bind(this));
    this.inputAliasDireccionF3.addEventListener('input', (event) => {
      const query = event.target.value.trim();
      console.log("Query de indicaciones", query);
      if (query == "" && this.estadoFaseNuevaDireccion == 3) {
        this.btnProcesoPrincipalNd.classList.add('desactivado');
      } else {
        this.btnProcesoPrincipalNd.classList.remove('desactivado');
      }
    });
    this.btnEditarDatos.addEventListener('click', (event) => {
      this.btnAccionDatosContacto(event.currentTarget);
    });
    this.btnGuardarDatos.addEventListener('click', (event) => {
      this.btnAccionDatosContacto(event.currentTarget);
    });
    this.btnEditarDatosFacturacion.addEventListener('click', (event) => {
      this.btnAccionDatosFacturacion(event.currentTarget);
    });
    this.btnGuardarDatosFacturacion.addEventListener('click', (event) => {
      this.btnAccionDatosFacturacion(event.currentTarget);
    });
    this.btnsMetodosPagos.forEach((btn) => {
      btn.addEventListener('click', (event) => {
        this.procesoSeleccionMetodoPago(event.currentTarget);
      });
    });
    this.cerrarModalMensaje.forEach((btn) => {
      btn.addEventListener('click', (event) => {
        this.cerrarModalMensajeProceso(event.currentTarget);
      });
    });
    this.btnContinuar.addEventListener('click', this.procesoContinuarGeneral.bind(this));
    this.btnHutCoins.addEventListener('click', (event) => {
      this.procesoHutCoins(event.currentTarget);
    });
    this.btnEditarCarrito.addEventListener('click', (event) => {
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

    // Cerrar sugerencias al hacer clic fuer  vcd
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
      if (sugerencias.length > 0) {
        this.contenedorResultadosBusquedaReferenciasF1.style.display = 'flex';
      } else {
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
    } else {
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
    console.log("Local seleccionado: ", location);
    // this.coordenadas = { lat: location.lat, lng: location.lng };

    // Actualizar el input con el nombre del local seleccionadoo
    this.inputSeleccionarLocal.value = location.name;

    // Ocultar sugerencias
    this.contenedorResultadosBuquedaLocal.style.display = "none";

    // Mostrar detalles del local seleccionadoo
    const detalleLocal = this.querySelector('.pcktph-seleccion-local-detalle');
    detalleLocal.style.display = "flex";

    const distancia = this.calcularDistancia(this.coordenadas, { lat: location.lat, lng: location.lng });
    this.etiquetaModalLocalSeleccionado.textContent = `Local : ${location.name} (${distancia.toFixed(2)} Km) de tu ubicación`;

    // Actualizar información del local seleccionado
    const infoLocal = this.querySelector('.pcktph-seleccion-local-detalle-info');
    infoLocal.innerHTML = `
        <p>${location.name.toUpperCase()}</p>
        <p>+591 ${location.telefono} - ${parseFloat(distancia).toFixed(2)} Km</p>
      `;
  }

  // PROCESO DE CONTENEDOR SUGERENCIAS DIRECCION DE ENVI
  configuracionAutoCompletadoSeleccionDireccion() {
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

  mostrarTodasDirecciones() {
    if (this.contenedorResultadosBusquedaDireccion.style.display === "none") {
      this.buscarSugerenciasSeleccionDireccion('', null);
      this.contenedorResultadosBusquedaDireccion.style.display = "flex";
    } else {
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

  seleccionarDireccion(direccion) {
    this.direccionSeleccionada = direccion;
    this.coordenadas = { lat: direccion.lat, lng: direccion.lng };
    this.contenedorResultadosBusquedaDireccion.style.display = "none";
    this.etiquetaAliasDireccion.textContent = direccion.alias;
    this.etiquetaIndicacionesDireccion.textContent = direccion.indicaciones;
  }

  async inicializarDataContruccion() {
    MensajeCargaDatos.mostrar('Cargando información del pagina ...');

    if (this.estadoPagina == "domicilio") {
      this.contenedorBaseSeleccionDireccionEnvio.style.display = "flex";
      this.contenedorBaseSeleccionLocal.style.display = "none";
      this.btnMetodoDomicilio.classList.add('seleccionado');
      const iconoSeleccionado = this.btnMetodoDomicilio.querySelector('.smecph-opcion-icono');
      iconoSeleccionado.innerHTML = window.shopIcons.icon_estado_on;
    }

    if (this.estadoPagina == "local") {
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
      if (!(item.properties && item.properties.estructura)) return;
      // Verificar si el item tiene la propiedad "estructura"
      const data = JSON.parse(item.properties.estructura);
      totalPrecioCarrito += parseInt(data.producto.precioTotalConjunto * parseInt(data.producto.cantidad));

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
                  ${data.producto.descuento == null || data.producto.descuento == 0 || data.producto.descuento == undefined
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

    this.totalCarrito = parseInt(totalPrecioCarrito);

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
    await this.procesoSucursales();

    this.etiquetaAliasDireccion.textContent = this.listaDireccionPrueba[0].alias;
    this.etiquetaIndicacionesDireccion.textContent = this.listaDireccionPrueba[0].indicaciones;
    MensajeCargaDatos.ocultar();
  }

  seleccionarMetodoLocal() {
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

  seleccionarMetodoDomicilio() {
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

  cerrarModalLocalSeleccionado() {
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

  procesoParaAnadirNuevaDireccion() {
    this.contenedorBaseModal.style.display = 'flex';
    this.modalBodyNuevaDireccion.style.display = 'flex';
    this.estadoFaseNuevaDireccion = 1;
    this.modalContenidoF1NuevaDireccion.style.display = 'flex';
  }

  cerrarModalNuevaDireccion() {
    this.contenedorBaseModal.style.display = 'none';
    this.modalBodyNuevaDireccion.style.display = 'none';
    this.estadoFaseNuevaDireccion = 1;
    this.modalContenidoF1NuevaDireccion.style.display = 'none';
    this.modalContenidoF2NuevaDireccion.style.display = 'none';
    this.modalContenidoF3NuevaDireccion.style.display = 'none';
    this.footerModalNuevaDireccion.style.display = 'none';
  }

  procesoVolverAtrasNuevaDireccion() {
    if (this.estadoFaseNuevaDireccion == 1) {
      this.cerrarModalNuevaDireccion();
    }

    if (this.estadoFaseNuevaDireccion == 2) {
      this.modalContenidoF1NuevaDireccion.style.display = 'flex';
      this.footerModalNuevaDireccion.style.display = 'none';
      this.modalContenidoF2NuevaDireccion.style.display = 'none';
      this.estadoFaseNuevaDireccion = 1;
      this.coordenadasProcesoNuevaDireccion = null;
    }

    if (this.estadoFaseNuevaDireccion == 3) {
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

    if (this.coordenadasProcesoNuevaDireccion == null) {
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

    } else {
      marker.setPosition(this.coordenadasProcesoNuevaDireccion);
      map.panTo(this.coordenadasProcesoNuevaDireccion);
    }


  }

  async procesoPrincipalNuevaDireccion() {
    if (this.estadoFaseNuevaDireccion == 2) {
      this.estadoFaseNuevaDireccion = 3;
      this.modalContenidoF2NuevaDireccion.style.display = 'none';
      this.modalContenidoF3NuevaDireccion.style.display = 'flex';
      this.footerModalNuevaDireccion.style.display = 'flex';
      this.etiquetaBtnModalNuevaDireccion.textContent = "GUARDAR DIRECCION";
      this.btnProcesoPrincipalNd.classList.add('desactivado');
      return;
    }

    if (this.estadoFaseNuevaDireccion == 3) {
      this.cerrarModalNuevaDireccion();
      this.etiquetaBtnModalNuevaDireccion.textContent = "CONFIRMAR DIRECCION";
      const alias = this.inputAliasDireccionF3.value;
      const indicaciones = this.inputIndicacionesDireccionF3.value;
      const coordenadasTexto = await AuxiliaresGlobal.obtenerDireccionDesdeCoordenadas(this.coordenadas.lat, this.coordenadas.lng);

      this.listaDireccionPrueba.push({
        lat: this.coordenadas.lat,
        lng: this.coordenadas.lng,
        indicaciones: indicaciones == "" ? coordenadasTexto : indicaciones,
        alias: alias,
      });

      console.log('Direccion obtenida desde coordenadas:', coordenadasTexto);

      MensajeCargaDatos.mostrar('Guardando dirección ...');
      setTimeout(() => {
        this.etiquetaIndicacionesDireccion.textContent = indicaciones == "" ? coordenadasTexto : indicaciones;
        this.etiquetaAliasDireccion.textContent = alias;
        MensajeCargaDatos.ocultar();
      }, 3000);
      this.btnProcesoPrincipalNd.classList.add('desactivado');
      this.coordenadasProcesoNuevaDireccion = null;
      return;
    }
  }

  async btnAccionDatosContacto(btnElemento) {
    const accion = btnElemento.dataset.accion;

    // Si pasa la validación, continuar con la actualización de la interfaz
    if (accion == "editar") {
      this.btnEditarDatos.style.display = "none";
      this.btnGuardarDatos.style.display = "flex";
      this.contenedorDatosContactoEditar.style.display = "flex";
      this.contenedorDatoContactoConsolidados.style.display = "none";
    } else {
      MensajeCargaDatos.mostrar('Procesando datos ...');
      this.btnEditarDatos.style.display = "flex";
      this.btnGuardarDatos.style.display = "none";
      this.contenedorDatosContactoEditar.style.display = "none";
      this.contenedorDatoContactoConsolidados.style.display = "flex";

      // Validar campos primero
      if (!this.validarCamposFormDatosContacto()) {
        return; // Si hay campos vacíos, detener la ejecución
      }
      const datosUsuario = JSON.parse(localStorage.getItem('ph-datos-usuario'));
      const existeClienteAntiguo = await this.porNroTelefonoUsuarioVerificar("+591" + datosUsuario.celular);
      console.log("Cliente antiguo : ", existeClienteAntiguo);
      const existeClienteNuevo = await this.porNroTelefonoUsuarioVerificar("+591" + this.inputCelularContacto.value);
      if (existeClienteNuevo == existeClienteAntiguo || existeClienteNuevo == undefined) {
        const nuevosDatosUsuario = await this.actualizarDatosUsuario(existeClienteAntiguo);
        localStorage.setItem('ph-datos-usuario', JSON.stringify({
          id: nuevosDatosUsuario.id,
          nombre: nuevosDatosUsuario.nombre,
          celular: nuevosDatosUsuario.celular,
          apellido: nuevosDatosUsuario.apellido,
          email: nuevosDatosUsuario.email,
          ci: nuevosDatosUsuario.ci,
          direcciones: nuevosDatosUsuario.direcciones,
          razon_social: nuevosDatosUsuario.razon_social,
          nit: nuevosDatosUsuario.nit,
          fecha_nacimiento: nuevosDatosUsuario.fecha_nacimiento,
          permisosHutCoins: nuevosDatosUsuario.permisosHutCoins,
          ordenesPagadas: datosUsuario.ordenesPagadas,
          ordenesPendientes: datosUsuario.ordenesPendientes
        }));
        this.inputNombreContacto.textContent = nuevosDatosUsuario.nombre;
        this.inputApellidoContacto.textContent = nuevosDatosUsuario.apellido;
        this.inputCorreoElectronico.textContent = nuevosDatosUsuario.email;
        this.inputCelularContacto.textContent = nuevosDatosUsuario.celular;
        this.inputCIContacto.textContent = nuevosDatosUsuario.ci;
        this.etiquetaDatosConsolidados.textContent = `${nuevosDatosUsuario.nombre} | ${nuevosDatosUsuario.apellido} | ${nuevosDatosUsuario.email} | ${nuevosDatosUsuario.celular} | ${nuevosDatosUsuario.ci}`;
      } else {
        MensajeCargaDatos.ocultar();
        MensajeTemporal.mostrarMensaje('El número de celular ya está registrado. Por favor, intenta con otro número.', 'error', 3500);
        return;
      }

      // Proceso de guardar datos
      // const datosActualizados = {
      //   nombre: this.inputNombreContacto.value,
      //   apellido: this.inputApellidoContacto.value,
      //   email: this.inputCorreoElectronico.value,
      //   celular: this.inputCelularContacto.value,
      //   ci: this.inputCIContacto.value
      // };

      // Actualizar los datos en el localStorage
      // localStorage.setItem('ph-datos-usuario', JSON.stringify(datosActualizados));

      // // Actualizar la interfaz
      // this.inputNombreContacto.textContent = datosActualizados.nombre;
      // this.inputApellidoContacto.textContent = datosActualizados.apellido;
      // this.inputCorreoElectronico.textContent = datosActualizados.email;
      // this.inputCelularContacto.textContent = datosActualizados.celular;
      // this.inputCIContacto.textContent = datosActualizados.ci;
      MensajeCargaDatos.ocultar();
    }
  }

  btnAccionDatosFacturacion(btnElemento) {
    const accion = btnElemento.dataset.accion;

    if (accion == "editar") {
      this.btnEditarDatosFacturacion.style.display = "none";
      this.btnGuardarDatosFacturacion.style.display = "flex";
      this.contenedorDatosFacturacion.style.display = "flex";
      this.contenedorDatosFacturacionConsolidados.style.display = "none";
    } else {
      this.btnEditarDatosFacturacion.style.display = "flex";
      this.btnGuardarDatosFacturacion.style.display = "none";
      this.contenedorDatosFacturacion.style.display = "none";
      this.contenedorDatosFacturacionConsolidados.style.display = "flex";

      if (this.inputRazonSocial.value == "" || this.inputNitoCit.value == "") return;

      // Proceso de guardar datos
      const data = JSON.parse(localStorage.getItem('ph-datos-facturacion'));
      const datosActualizados = {
        razonsocial: this.inputRazonSocial.value,
        nit: this.inputNitoCit.value,
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

    // Variable para rastrear contenedores con errorr
    const contenedoresConError = [];

    // Verificar campos vacíos
    let hayCampoVacio = false;

    Object.keys(formulario).forEach(key => {
      if (!mensajesError[key]) return;

      const contenedorPadre = mensajesError[key].closest('.smecph-pc-info-input');

      // Validación especial para el campo email
      if (key === 'email') {
        // Mostrar error si email está vacío O contiene "pizzahut"
        const contienePizzaHut = formulario[key].toLowerCase().includes("pizzahut");

        if (formulario[key] === '' || contienePizzaHut) {
          // Mostrar error de email
          mensajesError[key].style.display = 'flex';

          if (contenedorPadre) {
            contenedorPadre.classList.add('error');
            contenedoresConError.push(contenedorPadre);
          }

          hayCampoVacio = true;
        } else {
          // Email válido - ocultar error
          mensajesError[key].style.display = 'none';

          if (contenedorPadre) {
            contenedorPadre.classList.remove('error');
          }
        }
      } else {
        // Para el resto de campos, validación normal (solo campo vacío)
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
      }
    });

    // Si hay campos vacíos, programar limpieza de errores
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

  validarCamposFormTarjeta() {
    const formulario = {
      primerInput: this.inputPrimero4Digitos.value.trim(),
      segundoInput: this.inputSegundo4Digitos.value.trim()
    }

    const mensajesError = {
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

  procesoSeleccionMetodoPago(btnElemento) {
    const accion = btnElemento.dataset.accion;
    const estaSeleccionado = btnElemento.classList.contains('seleccionado');

    if (estaSeleccionado == true) return;

    this.btnsMetodosPagos.forEach(btn => {
      btn.classList.remove('seleccionado');
      const iconoDesSeleccionado = btn.querySelector('.smecph-pc-dp-item-icono');
      iconoDesSeleccionado.innerHTML = window.shopIcons.icon_estado_off;
    });

    if (estaSeleccionado == false) {
      this.mensajeAlertaDatosFacturacion.style.display = "none";
      btnElemento.classList.add('seleccionado');
      const iconoSeleccionado = btnElemento.querySelector('.smecph-pc-dp-item-icono');
      iconoSeleccionado.innerHTML = window.shopIcons.icon_estado_on;
    }

    this.seleccionadoEstadoPago = accion;

    // if(accion == "pago-codigo-qr"){}
    // if(accion == "pago-efectivo"){}
    if (accion == "pago-tarjeta-credito") {
      this.opcionesTarjetaCredito.style.display = "flex";
    } else {
      this.opcionesTarjetaCredito.style.display = "none";
    }
  }

  inicializarDatosdeContacto() {
    const data = JSON.parse(localStorage.getItem('ph-datos-usuario'));
    if (data.nombre.includes("pizzaHut") && data.apellido.includes("pizzaHut") && data.email.includes("pizzaHut")) {
      this.inputNombreContacto.value = "";
      this.inputApellidoContacto.value = "";
      this.inputCorreoElectronico.value = "";
      this.inputCelularContacto.value = data.celular;
      this.inputCIContacto.value = data.ci;
      this.btnEditarDatos.style.display = "none";
      this.btnGuardarDatos.style.display = "flex";
      this.contenedorDatosContactoEditar.style.display = "flex";
      this.contenedorDatoContactoConsolidados.style.display = "none";
    } else {
      this.inputNombreContacto.value = data.nombre;
      this.inputApellidoContacto.value = data.apellido;
      this.inputCorreoElectronico.value = data.email;
      this.inputCelularContacto.value = data.celular;
      this.inputCIContacto.value = data.ci;
      this.etiquetaDatosConsolidados.textContent = `${data.nombre} | ${data.apellido} | ${data.email} | +591 ${data.celular} | ${data.ci}`;
      this.btnEditarDatos.style.display = "flex";
      this.btnGuardarDatos.style.display = "none";
      this.contenedorDatosContactoEditar.style.display = "none";
      this.contenedorDatoContactoConsolidados.style.display = "flex";
    }
    if (!data.permisosHutCoins) {
      this.contenedorHutCoins.style.display = "flex";
    }
    //   this.inputNombreContacto.value = data.nombre;
    //   this.inputApellidoContacto.value = data.apellido;
    //   this.inputCorreoElectronico.value = data.email;
    //   this.inputCelularContacto.value = data.celular;
    //   this.inputCIContacto.value = data.ci;
    //   this.etiquetaDatosConsolidados.textContent = `${data.nombre} | ${data.apellido} | ${data.email} | +591 ${data.celular} | ${data.ci}`;
    // } else {
    //   window.location.href = "/pages/iniciar-sesion";
    // }
  }

  inicializarDatosdeFacturacion() {
    const data = JSON.parse(localStorage.getItem('ph-datos-usuario'));
    if (data.razonSocial == "" || data.nit == "") {
      this.inputRazonSocial.value = "";
      this.inputNitoCit.value = "";
    } else {
      this.inputRazonSocial.value = data.razonSocial;
      this.inputNitoCit.value = data.nit;
    }
    this.etiquetaDatosFacturacionConsolidados.textContent = `${this.inputRazonSocial.value} | ${this.inputNitoCit.value}`;

    // if (data) {
    //   this.inputRazonSocial.value = data.razonSocial;
    //   this.inputNitoCit.value = data.nit;
    // } else {
    //   this.inputRazonSocial.value = "----";
    //   this.inputNitoCit.value = "----";
    // }
    // this.etiquetaDatosFacturacionConsolidados.textContent = `${this.inputRazonSocial.value} | ${this.inputNitoCit.value}`;
  }

  procesoVerDetallesProducto(elementoHTML) {
    const hijoDetalle = elementoHTML.querySelector('.smecph-pc-item-carrito-extra');
    const seraVisto = hijoDetalle.dataset.seravisto;
    if (seraVisto == "true") {
      if (hijoDetalle.style.display == "none") {
        hijoDetalle.style.display = "flex";
      } else {
        hijoDetalle.style.display = "none";
      }
    }
  }

  procesoEditarCarrito() {
    window.location.href = "/pages/carrito";
  }

  procesoHutCoins(btnElemento) {
    const estaActivado = btnElemento.classList.contains('seleccionado');
    if (estaActivado == true) {
      btnElemento.classList.remove('seleccionado');
      btnElemento.innerHTML = window.shopIcons.icon_checkbox_off;
    } else {
      btnElemento.classList.add('seleccionado');
      btnElemento.innerHTML = window.shopIcons.icon_checkbox_on;
    }
  }

  async procesoContinuarGeneral() {
    if (this.localSeleccionado == null && this.estadoPagina == "local" && this.inputSeleccionarLocal.value == "") {
      this.contenedorBaseSeleccionLocal.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      return;
    }

    if (!this.validarCamposFormDatosContacto()) {
      this.btnEditarDatos.style.display = "none";
      this.btnGuardarDatos.style.display = "flex";
      this.contenedorDatosContactoEditar.style.display = "flex";
      this.contenedorDatoContactoConsolidados.style.display = "none";
      this.seccionFormDatosContacto.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      return;
    }

    if (!this.valirdarSeleccionMetodoPago()) {
      this.seccionGeneralMetodosPago.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      return;
    }

    MensajeCargaDatos.mostrar('Su pedido se esta procesando ...');
    const datosBase = JSON.parse(localStorage.getItem('ph-datos-usuario'));

    // Actualizar datos de usuario decuerdo a la seleccion HUT COINS
    const existeClienteAntiguo = await this.porNroTelefonoUsuarioVerificar("+591" + datosBase.celular);
    console.log("Cliente antiguo : ", existeClienteAntiguo);
    const existeClienteNuevo = await this.porNroTelefonoUsuarioVerificar("+591" + this.inputCelularContacto.value);
    if (existeClienteNuevo == existeClienteAntiguo || existeClienteNuevo == undefined) {
      const nuevosDatosUsuario = await this.actualizarDatosUsuario(existeClienteAntiguo);
      localStorage.setItem('ph-datos-usuario', JSON.stringify({
        id: nuevosDatosUsuario.id,
        nombre: nuevosDatosUsuario.nombre,
        celular: nuevosDatosUsuario.celular,
        apellido: nuevosDatosUsuario.apellido,
        email: nuevosDatosUsuario.email,
        ci: nuevosDatosUsuario.ci,
        direcciones: nuevosDatosUsuario.direcciones,
        razon_social: nuevosDatosUsuario.razon_social,
        nit: nuevosDatosUsuario.nit,
        fecha_nacimiento: nuevosDatosUsuario.fecha_nacimiento,
        permisosHutCoins: nuevosDatosUsuario.permisosHutCoins,
        ordenesPagadas: datosBase.ordenesPagadas,
        ordenesPendientes: datosBase.ordenesPendientes
      }));
    } else {
      MensajeCargaDatos.ocultar();
      MensajeTemporal.mostrarMensaje('El número de celular ya está registrado. Por favor, intenta con otro número.', 'error', 3500);
      return;
    }

    // // Proceso de guardar datos
    // const datosActualizados = {
    //   nombre: this.inputNombreContacto.value,
    //   apellido: this.inputApellidoContacto.value,
    //   email: this.inputCorreoElectronico.value,
    //   celular: this.inputCelularContacto.value,
    //   ci: this.inputCIContacto.value
    // };

    // // Actualizar los datos en el localStorage
    // localStorage.setItem('ph-datos-usuario', JSON.stringify(datosActualizados));

    const datosCheckout = {
      // Traer datos de metodo de envio seleccionado
      metodo_envio_seleccionado: this.obtenerDatosMetodoEnvio(),
      // Traer datos de metodo facturacion
      info_metodo_pago_seleccionado: this.obtenerDatosPagoSeleccionado(),
      // Traer info facturacion
      info_facturacion: this.obtenerDatosFacturacion(),
      // Inforacion nota para el pedido
      nota_para_envio: this.inputNotaParaElPedido.value,
    }

    localStorage.setItem('ph-datos-checkout', JSON.stringify(datosCheckout));


    // Orden creada en los preliminaress
    // const dataOrdenPreliminar = await this.generarPedidoPreliminar(datosCheckout);
    const dataOrdenPendiente = await this.crearOrdenPendiente(datosCheckout);
    this.infoOrdenPreliminar = dataOrdenPendiente.order;

    // Orden consolidada como pagada (PEDIDOO)
    const dataJSON = this.generarJSONMostrarConsola();
    console.log("Data JSON", dataJSON);
    // console.log("Data Orden Finalizada", await this.getOrderDetails());
    localStorage.setItem('ph-json-generado', JSON.stringify(dataJSON));
    localStorage.setItem('ph-id-orden', dataOrdenPendiente.order.id);

    if (this.seleccionadoEstadoPago == "pago-codigo-qr") {
      console.log("Testeo de informacion QR", {
        user: this.user,
        pass: this.pass,
        url: this.url,
        infoOrdenPreliminar: this.infoOrdenPreliminar,
        nombre: this.inputNombreContacto.value,
        apellido: this.inputApellidoContacto.value,
        inputCelularContacto: this.inputCelularContacto.value,
        id: this.infoOrdenPreliminar.id.split('/').pop(),
        precio: this.totalCarrito
      });
      // return;
      await this.iniciarPasarela();
    } else {
      // await this.generarPedido(dataOrdenPreliminar.order.id);
      await this.actualizarPedidoCompletado(dataOrdenPendiente.order.id);
      localStorage.setItem('ph-estadoDP', "etapa-1");
      // window.location.href = "/pages/detalle-pedido";
    }

    MensajeCargaDatos.ocultar();
  }

  async iniciarPasarela() {
    try {
      // Paso 1: Login y obtener token
      const loginResponse = await fetch(`${this.url}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: this.user,
          password: this.pass
        })
      });

      const loginData = await loginResponse.json();
      const token = loginData.access;

      // Paso 2: Preparar datos del QR
      const now = new Date();
      now.setHours(now.getHours() - 4); // Restamos 4 horas
      const timestamp = now.toISOString(); // Formato ISO con desfase horario
      const transactionId = `ph-${this.infoOrdenPreliminar.id.split('/').pop()}-${timestamp}`;

      const qrResponse = await fetch(`${this.url}/qr/generate`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          transaction: transactionId,
          amount: this.totalCarrito,
          gloss: `Pago pedido Pizza Hut ${transactionId}`,
          pos: "POS 1",
          cashier: "Web",
          phoneNumber: `+591${this.inputCelularContacto.value}`,
          customData: [
            `${this.inputNombreContacto} ${this.inputApellidoContacto}`,
            "1"
          ],
          lifespan: 300,
          branchOffice: "B990",
          regional: "001"
        })
      });

      const qrData = await qrResponse.json();
      const qrId = qrData.idPublic;

      // Paso 3: Mostrar QR en modal
      this.contenedorBaseModal.style.display = "flex";
      this.contenedorBaseMensaje.style.display = "flex";
      this.contenedorQR.style.display = "flex";

      // document.getElementById(".ph-modal-body-qr").innerHTML = `
      // <iframe id="ifarma" src="https://qr.farmacorp.com/viewer/${qrId}" alt="QR de pago" height="760px" width="100%"></iframe>
      // <p>Escanea el QR para pagar</p>
      // `;

      this.contenedorQR.innerHTML = `
      <iframe id="ifarma" src="https://qr.farmacorp.com/viewer/${qrId}" alt="QR de pago" height="760px" width="100%"></iframe>
      <p>Escanea el QR para pagar</p>
      `;

      // Paso 4: Configurar intervalo para verificar periódicamente el estado del pago
      const interval = setInterval(async () => {
        try {
          const paidResponse = await fetch(`${this.url}/qr/${qrId}/paid`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });

          if (!paidResponse.ok) {
            const errorText = await paidResponse.text();
            console.error("Error en /paid:", paidResponse.status, errorText);
            return;
          }

          const wasPaid = await paidResponse.json(); // Booleano true o falsee
          console.log("¿Pago confirmado?", wasPaid);

          if (wasPaid === true) {
            clearInterval(interval);
            // 
            // document.getElementById(".ph-modal-body-qr").innerHTML = `<p>✅ Pago confirmado.</p>`;
            this.contenedorQR.innerHTML = `<p>✅ Pago confirmado.</p>`;

            // await this.generarPedido(this.infoOrdenPreliminar.id);
            await this.actualizarPedidoCompletado(dataOrdenPendiente.order.id);
            await AuxiliaresGlobal.limpiarCarrito();
            localStorage.setItem('ph-estadoDP', "etapa-1");

            setTimeout(() => {
              window.location.href = "/pages/detalle-pedido";
            }, 3000);

            // createOrder(orderData).then((res) => {
            //   if (res) {
            //     const orderId = res[0].orderId;
            //     const operationCode = localStorage.getItem("operationCode");
            //     // ⬇️ Nuevo: marcar como pagada
            //     marcarOrdenComoPagada(orderId, paymentGatewayAmount);

            //     if (res[0].paymentWebViewHtmlResponse) {
            //       const parser = new DOMParser();
            //       const doc = parser.parseFromString(res[0].paymentWebViewHtmlResponse, 'text/html');
            //       const inputElement = doc.querySelector('input[name="mp"]');
            //       const tipo = inputElement ? inputElement.getAttribute('value') : null;

            //       if (native == true) {
            //         window.location.href = `{{ settings.checkout_domain }}pages/thankyou?orderId=${orderId}`;
            //       } else {
            //         getPickupRequest(orderId).then((res) => {
            //           if (res.data) {
            //             const jobId = res.data.data[0].instaleapJobId;
            //             console.log(res.data.data[0]);
            //             if (jobId !== '')
            //               window.location.href = `{{ settings.checkout_domain }}/pages/lst?jobId=${jobId}&type=${operationCode}`;
            //             else
            //               clearCartAndRedirect(orderId, operationCode);
            //           }
            //         })
            //         .catch((error) => {
            //           console.error('Error processing pickup request:', error);
            //         });
            //       }
            //     }
            //     else {
            //       setTimeout(() => {
            //         clearCartAndRedirect(res[0].orderId, operationCode, native);
            //       }, 4000);
            //     }
            //   }
            // })
            // .catch((error) => {
            //   console.error('Error processing pickup request:', error);
            // });
          }
        } catch (error) {
          console.error("Error al verificar estado de pago:", error);
        }
      }, 10000); // Verifica cada 10 segundoss

    } catch (error) {
      console.error("Error al procesar pago:", error);
      // document.getElementById(".ph-modal-body-qr").innerHTML = `<p>⚠️ Error al generar el QR.</p>`;
      this.contenedorQR.innerHTML = `<p>⚠️ Error al generar el QR.</p>`;
    }
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
              metafields(first: 5) {
                edges {
                  node {
                    namespace
                    key
                    value
                  }
                }
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const metodoPago = () => {
        switch (this.seleccionadoEstadoPago) {
          case "pago-efectivo":
            return "Pago Efectivo";
          case "pago-tarjeta-credito":
            return "Pago Tarjeta";
          case "pago-codigo-qr":
            return "Pago QR";
          default:
            return "Metodo de Pago Desconocido";
        }
      }

      const coordenadasFormatoEnviar = () => {
        var data = null;
        if (this.estadoPagina == "domicilio") {
          data = informacionPedido.datosCheckout.metodo_envio_seleccionado.info_seleccionada;
        } else {
          data = informacionPedido.datosCheckout.metodo_envio_seleccionado.local_seleccionado;
        }
        return `lat: ${data.lat} ,lng: ${data.lng}`
      }


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
          },
          customAttributes: [
            { key: "Metodo Pago", value: metodoPago() },
            { key: "Metodo Entrega", value: this.estadoPagina == "domicilio" ? "Envio a Domicilio" : "Recogo de Local" },
            { key: "Coordenadas", value: coordenadasFormatoEnviar() },
            informacionPedido.datosCheckout.nota_para_envio != ""
              ? { key: "Nota para el pedido", value: informacionPedido.datosCheckout.nota_para_envio }
              : null,
            informacionPedido.datosCheckout.sucursal != null
              ? {
                key: "Local Designado",
                value: this.estadoPagina == "domicilio" ?
                  this.optenerSucursalPorDominicilio(informacionPedido.datosCheckout.metodo_envio_seleccionado.info_seleccionada).name
                  : informacionPedido.datosCheckout.metodo_envio_seleccionado.local_seleccionado.name
              }
              : null,
            { key: "Datos Proceso Checkout", value: JSON.stringify(informacionPedido.datosCheckout) },
            { key: "Datos Carrito PRoceso", value: JSON.stringify(informacionPedido.itemsCarrito) },
          ],
        }
      };

      // Asegúrate de que this.urlConsulta esté definido o usa la URL directaa


      const respuesta = await fetch(window.urlConsulta, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': window.backendShopify,
        },
        body: JSON.stringify({
          query: draftOrderQuery,
          variables: variables
        })
      });

      const data = await respuesta.json();
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

      // Verificar éxito en draftOrderCreate, no en orderCreatee
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

  async crearOrdenPendiente(datosCheckout) {
    try {
      const dataUsuario = JSON.parse(localStorage.getItem('ph-datos-usuario'));

      const lineItems = this.infoCarrito.informacionCompleta.items.map(item => {
        console.log("Testeo Item", item);
        let data = null;
        try {
          if (item.properties && item.properties.estructura) {
            data = JSON.parse(item.properties.estructura);
            console.log("Testeo Data", data);
          }
        } catch (error) {
          console.error("Error al parsear estructura del item:", error);
        }

        return {
          variantId: `gid://shopify/ProductVariant/${data.producto.idShopify}`,
          quantity: parseInt(data.producto.cantidad)
        };
      });

      const metodoPago = () => {
        switch (this.seleccionadoEstadoPago) {
          case "pago-efectivo": return "Pago Efectivo";
          case "pago-tarjeta-credito": return "Pago Tarjeta";
          case "pago-codigo-qr": return "Pago QR";
          default: return "Método de Pago Desconocido";
        }
      };

      const coordenadasFormatoEnviar = () => {
        const data = this.estadoPagina == "domicilio"
          ? datosCheckout.metodo_envio_seleccionado.info_seleccionada
          : datosCheckout.metodo_envio_seleccionado.local_seleccionado;
        return `lat: ${data.lat}, lng: ${data.lng}`;
      };

      console.log('Testeo ubicaicon ', this.optenerSucursalPorDominicilio(datosCheckout.metodo_envio_seleccionado.info_seleccionada))

      const variables = {
        order: {
          lineItems,
          customer: {
            toAssociate: {
              id: dataUsuario.id
            }
          },
          financialStatus: "PENDING",
          shippingAddress: {
            firstName: dataUsuario.nombre,
            lastName: dataUsuario.apellido,
            phone: dataUsuario.celular,
            address1: this.estadoPagina == "domicilio"
              ? this.direccionSeleccionada.indicaciones
              : this.localSeleccionado.localizacion,
            city: "Santa Cruz",
            provinceCode: "SC",
            countryCode: "BO",
            zip: "0000"
          },
          billingAddress: {
            firstName: dataUsuario.nombre,
            lastName: dataUsuario.apellido,
            phone: dataUsuario.celular,
            address1: "Dirección Facturación (opcional)",
            city: "Santa Cruz",
            provinceCode: "SC",
            countryCode: "BO",
            zip: "0000"
          },
          customAttributes: [
            { key: "Metodo Pago", value: metodoPago() },
            { key: "Metodo Entrega", value: this.estadoPagina === "domicilio" ? "Envío a Domicilio" : "Recojo en Local" },
            { key: "Coordenadas", value: coordenadasFormatoEnviar() },
            datosCheckout.nota_para_envio
              ? { key: "Nota para el pedido", value: datosCheckout.nota_para_envio }
              : null,
            {
              key: "Local Designado",
              value: this.estadoPagina === "domicilio"
                ? this.optenerSucursalPorDominicilio(datosCheckout.metodo_envio_seleccionado.info_seleccionada).name
                : datosCheckout.metodo_envio_seleccionado.local_seleccionado.name
            },
            { key: "Datos Proceso Checkout", value: JSON.stringify(datosCheckout) },
            { key: "Datos Carrito Proceso", value: JSON.stringify(this.infoCarrito.informacionCompleta.items) }
          ].filter(Boolean) // elimina cualquier null
        }
      };

      const orderCreateMutation = `
          mutation orderCreate($order: OrderCreateOrderInput!, $options: OrderCreateOptionsInput) {
            orderCreate(order: $order, options: $options) {
            order {
              id
              name
              email
              totalPrice
              createdAt
              shippingAddress {
                address1
                city
                provinceCode
                countryCode
                zip
              }
              billingAddress {
                address1
                city
                provinceCode
                countryCode
                zip
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const respuesta = await fetch(window.urlConsulta, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': window.backendShopify
        },
        body: JSON.stringify({
          query: orderCreateMutation,
          variables: {
            order: variables.order,
            options: null
          }
        })
      });

      const data = await respuesta.json();
      console.log('Respuesta completa de Shopify:', data);

      if (data.errors) {
        console.error('Errores en GraphQL:', data.errors);
        return { success: false, errors: data.errors };
      }

      const resultado = data.data.orderCreate;
      if (resultado.userErrors.length > 0) {
        console.error('Errores del usuario:', resultado.userErrors);
        return { success: false, errors: resultado.userErrors };
      }

      console.log('Orden creada con éxito:', resultado.order);
      return { success: true, order: resultado.order };

    } catch (error) {
      console.error('Error general al crear orden:', error);
      return { success: false, error: error.message };
    }
  }

  optenerSucursalPorDominicilio(informacion) {
    const coordenadasInfo = { lat: parseFloat(informacion.lat), lng: parseFloat(informacion.lng) };

    // Verificar si hay sucursales disponibles
    if (!this.pizzaLocations || this.pizzaLocations.length === 0) {
      return null;
    }

    let sucursalMasCercana = null;
    let distanciaMinima = Infinity;

    // Encontrar la sucursal más cercana
    for (const sucursal of this.pizzaLocations) {
      const coordenadasSucursal = {
        lat: parseFloat(sucursal.lat),
        lng: parseFloat(sucursal.lng)
      };

      const distancia = this.calcularDistancia(coordenadasInfo, coordenadasSucursal);

      if (distancia < distanciaMinima) {
        distanciaMinima = distancia;
        sucursalMasCercana = { ...sucursal, distancia };
      }
    }

    return sucursalMasCercana;
  }

  async generarPedido(idOrden) {
    try {
      // Consulta GraphQL para completar un draft order
      const completeDraftOrderQuery = `
          mutation CompleteDraftOrder {
            draftOrderComplete(id: "${idOrden}",paymentPending: false) {
              draftOrder {
                id
                status
              }
              userErrors {
                field
                message
              }
            }
          }
        `;

      const variables = {
        id: idOrden
      };



      const respuesta = await fetch(window.urlConsulta, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': window.backendShopify,
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

  async actualizarPedidoCompletado(idOrden) {
    try {
      // Consulta GraphQL para marcar un pedido como pagado
      const markOrderAsPaidQuery = `
        mutation MarkOrderAsPaid {
          orderMarkAsPaid(input: { id: "${idOrden}" }) {
            order {
              id
              fullyPaid
              displayFinancialStatus
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const variables = {
        id: idOrden
      };

      const respuesta = await fetch(window.urlConsulta, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': window.backendShopify,
        },
        body: JSON.stringify({
          query: markOrderAsPaidQuery,
          variables: variables
        })
      });

      const data = await respuesta.json();
      console.log('Respuesta completa de actualización de pedido:', data);

      if (data.errors) {
        console.error('Errores en la respuesta GraphQL:', data.errors);
        return { success: false, errors: data.errors };
      }

      if (data.data && data.data.orderMarkAsPaid.userErrors &&
        data.data.orderMarkAsPaid.userErrors.length > 0) {
        console.error('Errores al marcar el pedido como pagado:', data.data.orderMarkAsPaid.userErrors);
        return { success: false, errors: data.data.orderMarkAsPaid.userErrors };
      }

      if (data.data && data.data.orderMarkAsPaid && data.data.orderMarkAsPaid.order) {
        console.log('Pedido marcado como pagado exitosamente:', data.data.orderMarkAsPaid.order);
        return {
          success: true,
          order: data.data.orderMarkAsPaid.order
        };
      }

      return { success: false, message: 'Respuesta inesperada del servidor' };
    } catch (error) {
      console.error('Error al marcar el pedido como pagado:', error);
      return { success: false, error: error.message };
    }
  }

  async getOrderDetails(orderId = "gid://shopify/Order/1189413978396") {
    try {
      // Consulta GraphQL para obtener detalles de la orden
      const orderDetailsQuery = `
          query GetOrderDetails {
            order(id: "${orderId}") {
              id
              name
              lineItems(first: 10) {
                edges {
                  node {
                    title
                    quantity
                    customAttributes {
                      key
                      value
                    }
                  }
                }
              }
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              note
            }
          }
        `;



      const respuesta = await fetch(window.urlConsulta, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': window.backendShopify,
        },
        body: JSON.stringify({
          query: orderDetailsQuery
        })
      });

      const data = await response.json();
      console.log('Respuesta completa de detalles de orden:', data);

      if (data.errors) {
        console.error('Errores en la respuesta GraphQL:', data.errors);
        return { success: false, errors: data.errors };
      }

      if (data.data && data.data.order) {
        console.log('Detalles de orden obtenidos exitosamente:', data.data.order);
        return {
          success: true,
          order: data.data.order
        };
      }

      return { success: false, message: 'Respuesta inesperada del servidor' };
    } catch (error) {
      console.error('Error al obtener detalles de la orden:', error);
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

  async actualizarDatosUsuario(id) {
    const datosUsuario = JSON.parse(localStorage.getItem('ph-datos-usuario') || '{}');
    const graphQLQuery = `
    mutation UpdateCustomer($input: CustomerInput!) {
      customerUpdate(input: $input) {
        customer {
          id
          firstName
          lastName
          email
          phone
          metafield(namespace: "informacion", key: "extra") {
            id
            key
            namespace
            value
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

    const informacionExtra = JSON.stringify({
      nit: this.inputNitoCit.value == "" ? datosUsuario.nit : this.inputNitoCit.value,
      razon_social: this.inputRazonSocial.value == "" ? datosUsuario.razon_social : this.inputRazonSocial.value,
      fecha: this.inputFechaNacimiento.value == "" ? datosUsuario.fecha_nacimiento : this.inputFechaNacimiento.value,
      permisosHutCoins: this.btnHutCoins.classList.contains('seleccionado') ? true : false,
      ci: this.inputCIContacto.value == "" ? datosUsuario.ci : this.inputCIContacto.value,
      direcciones: this.listaDireccionPrueba,
    });

    const variables = {
      input: {
        id: `gid://shopify/Customer/${id}`,
        firstName: this.inputNombreContacto.value == "" ? datosUsuario.nombre : this.inputNombreContacto.value,
        lastName: this.inputApellidoContacto.value == "" ? datosUsuario.apellido : this.inputApellidoContacto.value,
        email: this.inputCorreoElectronico.value == "" ? datosUsuario.email : this.inputCorreoElectronico.value,
        phone: `+591${this.inputCelularContacto.value == "" ? datosUsuario.celular : this.inputCelularContacto.value}`,
        metafields: [
          {
            namespace: "informacion",
            key: "extra",
            type: "json_string",
            value: informacionExtra
          }
        ]
      }
    };

    try {
      const respuesta = await fetch(window.urlConsulta, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': window.backendShopify,
        },
        body: JSON.stringify({
          query: graphQLQuery,
          variables: variables
        }),
      });

      const datos = await respuesta.json();
      console.log("Respuesta de la API:", datos);

      if (datos.data?.customerUpdate?.userErrors?.length > 0) {
        return {
          exito: false,
          errores: datos.data.customerUpdate.userErrors
        };
      }

      // Obtener el cliente actualizado
      const customer = datos.data?.customerUpdate?.customer;

      // Procesar los metafields para extraer la información extra
      let metafieldData = {};
      if (customer?.metafield?.value) {
        try {
          metafieldData = JSON.parse(customer.metafield.value);
        } catch (e) {
          console.error("Error al parsear metafield:", e);
        }
      }

      // Devolver el objeto con el formato solicitado
      return {
        id: customer.id,
        nombre: customer.firstName,
        celular: customer.phone?.replace(/^\+591/, "") || "",
        apellido: customer.lastName,
        email: customer.email,
        ci: metafieldData.ci || "",
        direcciones: metafieldData.direcciones || [],
        razon_social: metafieldData.razon_social || "",
        nit: metafieldData.nit || "",
        fecha_nacimiento: metafieldData.fecha || "",
        permisosHutCoins: metafieldData.permisosHutCoins || false,
      };
    } catch (error) {
      console.error("Error al actualizar datos de usuario:", error);
      return {
        exito: false,
        error: error.message
      };
    }

    // const data = JSON.parse(localStorage.getItem('ph-datos-usuario'));
    // const estaSeleccionadoBtnHutCoins = this.btnHutCoins.classList.contains('seleccionado');
    // const obtenerInputFechaNacimiento = this.inputFechaNacimiento.value;

    // if (estaSeleccionadoBtnHutCoins == false && obtenerInputFechaNacimiento == "") return;

    // data.permisoHutCoins = estaSeleccionadoBtnHutCoins;
    // data.fechaNacimiento = obtenerInputFechaNacimiento;
  }

  async porNroTelefonoUsuarioVerificar(numeroTelefono) {
    const graphQLQuery = `
query($identifier: CustomerIdentifierInput!) {
  customer: customerByIdentifier(identifier: $identifier) {
    id
		            metafield(namespace: "informacion", key: "extra") {
              id
              key
              namespace
              value
            }
  }
}
    `;

    const variables = {
      "identifier": {
        "phoneNumber": numeroTelefono
      }
    };

    try {
      // Usar el servidor intermediario local en lugar de la API directa de Shopify
      const respuesta = await fetch(window.urlConsulta, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': window.backendShopify,
        },
        body: JSON.stringify({
          query: graphQLQuery,
          variables: variables
        }),
      });

      if (!respuesta.ok) {
        throw new Error(`Error de red: ${respuesta.status} ${respuesta.statusText}`);
      }

      const datos = await respuesta.json();

      // Verificar si hay resultados y extraer solo el número del ID
      if (datos.data?.customer?.id) {
        // Extraer solo el número del ID (después de la última barra)
        const idCompleto = datos.data.customer.id;
        const numeroID = idCompleto.split('/').pop();
        return numeroID;
      } else {
        return undefined;
      }

    } catch (error) {
      console.error("Error al verificar usuario por teléfono:", error);
      return undefined;
    }
  }

  obtenerDatosMetodoEnvio() {
    if (this.btnMetodoLocal.classList.contains('seleccionado')) {
      return {
        metodo_envio: "local",
        local_seleccionado: this.localSeleccionado
      }
    }
    if (this.btnMetodoDomicilio.classList.contains('seleccionado')) {
      return {
        metodo_envio: "domicilio",
        info_seleccionada: this.direccionSeleccionada
      }
    }
  }

  obtenerDatosFacturacion() {
    if (this.inputRazonSocial.value == "" || this.inputNitoCit.value == "") return null;
    return {
      razon_social: this.inputRazonSocial.value,
      nit: this.inputNitoCit.value
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

  generarJSONMostrarConsola() {
    const productos = [];

    this.infoCarrito.informacionCompleta.items.forEach(item => {
      const productoCompleto = JSON.parse(item.properties.estructura);
      var opcionesPrincipales = [];
      var complementos = [];

      productoCompleto.opcionesPrincipales.productos.forEach(producto => {
        return opcionesPrincipales.push({
          nombre: producto.nombre,
          cantidad: producto.cantidad,
          precio: producto.precio,
          id: producto.idTrabajo
        });
      });

      productoCompleto.complementos.productos.forEach(producto => {
        return complementos.push({
          nombre: producto.nombre,
          cantidad: producto.cantidad,
          precio: producto.precio,
          id: producto.idTrabajo
        });
      });

      productos.push({
        nombre: productoCompleto.producto.nombre,
        precio: productoCompleto.producto.precioTotalConjunto,
        cantidad: productoCompleto.producto.cantidad,
        id: productoCompleto.producto.idTrabajo,
        opcionesPrincipales,
        complementos
      });
    });

    return {
      productos
    }
  }

  cerrarModalMensajeProceso() {
    console.log("Cerrando modal");
    this.contenedorBaseModal.style.display = "none";
    this.contenedorBaseMensaje.style.display = "none";
    this.contenedorQR.style.display = "none";
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
          'X-Shopify-Access-Token': window.backendShopify
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
}

customElements.define('page-checkout-ph', PageCheckoutPH);
