class CrearCuenta extends HTMLElement {
  constructor() {
    super();
    this.iconos = {
      iconCheckBoxOff: `${window.shopIcons.icon_checkbox_off}`,
      iconCheckBoxOn: `${window.shopIcons.icon_checkbox_on}`,
    };
    this.coordenadas = { lat: -17.510420897741643, lng: -63.16459000457593 };
    this.direccionSeleccionada = false;
    this.marcadorMovible = null;
  }

  connectedCallback() {
    // CAPTURAR ELEMENTOS
    this.modalBackground = this.querySelector('#phpcc-modal-background');
    this.contenedorTerminosCondiciones = this.querySelector('#phpcc-termino-condiciones');
    this.contenedorGeneralMiUbicacion = this.querySelector('#phpcc-modal-dar-direccion');
    this.contenedorModalBody = this.querySelector('#phpcc-contenido-modal-body');
    this.btnMiUbicacionActual = this.querySelector('#phpcc-btn-mi-ubicacion-actual');
    this.btnCerrarModalMiUbicacion = this.querySelector('#phpcc-boton-cerrar-modal');
    this.contenedorMapaMiUbicacion = this.querySelector('#phpcc-modal-mapa');
    this.btnContinuar = this.querySelector('#phpcc-btn-continuar');
    this.btnConfirmarModal = this.querySelector('#phpcc-btn-confirmar-modal');
    this.btnCancelarModal = this.querySelector('#phpcc-btn-cancelar-modal');
    this.inputDireccion = this.querySelector('#phpcc-input-direccion');
    this.contenedorSugerencias = this.querySelector('#phpcc-sugerencias-direccion');
    this.btnHutCoins = this.querySelector('#phpcc-btn-hutcoins');
    this.btnInfoHutCoins = this.querySelector('#phpcc-btn-info-hutcoins');
    // FORMULARIO GENERAL
    this.frmNombre = this.querySelector('#phpcc-frm-nombre');
    this.frmNombreInput = this.querySelector('#phpcc-frm-nombre-input');
    this.frmApellido = this.querySelector('#phpcc-frm-apellido');
    this.frmApellidoInput = this.querySelector('#phpcc-frm-apellido-input');
    this.frmEmail = this.querySelector('#phpcc-frm-email');
    this.frmEmailInput = this.querySelector('#phpcc-frm-email-input');
    this.frmCelular = this.querySelector('#phpcc-frm-celular');
    this.frmCelularInput = this.querySelector('#phpcc-frm-celular-input');
    this.frmCi = this.querySelector('#phpcc-frm-ci');
    this.frmCiInput = this.querySelector('#phpcc-frm-ci-input');
    this.frmFechaNacimientoInput = this.querySelector('#phpcc-frm-fecha-nacimiento-input');

    // INICIARLZAR EVENTOS
    this.btnMiUbicacionActual.addEventListener('click', this.accesoUbicacionActualModal.bind(this));
    this.btnCerrarModalMiUbicacion.addEventListener('click', this.cerrarModalMiUbicacion.bind(this));
    this.btnHutCoins.addEventListener('click', this.cambiarEstadoHutCoins.bind(this));
    this.btnInfoHutCoins.addEventListener('click', this.cambiarEstadoInfoHutCoins.bind(this));
    this.btnContinuar.addEventListener('click', this.procesoFormulario.bind(this));
    this.btnConfirmarModal.addEventListener('click', this.procesoConfirmacionModal.bind(this));
    this.btnCancelarModal.addEventListener('click', this.cerrarModalMiUbicacion.bind(this));
    document.addEventListener('click', this.detectarClickFueraDeElementosEspeciales.bind(this));

    this.frmNombreInput.addEventListener('input', this.habilitarBtnContinuar.bind(this));
    this.frmApellidoInput.addEventListener('input', this.habilitarBtnContinuar.bind(this));
    this.frmNombreInput.addEventListener('input', this.validarInputTexto.bind(this));
    this.frmApellidoInput.addEventListener('input', this.validarInputTexto.bind(this));
    this.frmEmailInput.addEventListener('input', this.habilitarBtnContinuar.bind(this));
    this.frmCelularInput.addEventListener('input', this.habilitarBtnContinuar.bind(this));
    this.frmCiInput.addEventListener('input', this.habilitarBtnContinuar.bind(this));


    // INICIALIZAR ELEMENTOS
    this.modalBackground.style.display = 'none';
    this.contenedorGeneralMiUbicacion.style.display = 'none';
    this.inicializarPaginaLocalStorage(0);
  }

  inicializarPaginaLocalStorage(intentos = 0) {
    // Verificar si Google Maps esta cargado
    if (typeof google == 'undefined') {
      // Limitar a 10 intentos para evitar bucles infinitos
      if (intentos < 10) {
        console.log('Google Maps no está cargado, esperando... Intento ' + (intentos + 1));
        setTimeout(() => {
          this.inicializarPaginaLocalStorage(intentos + 1);
        }, 500); // Esperar 0.5 segundos antes de volver a intentar
      } else {
        console.error('Google Maps no se cargó después de varios intentos');
      }
      return;
    }

    console.log('Google Maps cargado correctamente');
    this.configurarAutocompletadoDirecciones();
  }

  accesoUbicacionActualModal() {
    this.contenedorGeneralMiUbicacion.style.display = 'flex';
    // Activar el mapa dentro del modall

    // 1. Crear el mapa
    if (!this.contenedorMapaMiUbicacion) {
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

    const mapa = new google.maps.Map(this.contenedorMapaMiUbicacion, configuracionMapa);

    // 2. Crear el marcador movible
    this.marcadorMovible = new google.maps.Marker({
      position: this.coordenadas,
      map: mapa,
      draggable: true,
      animation: google.maps.Animation.DROP,
    });

    // 3. Configurar el evento del marcador
    if (this.direccionSeleccionada == true) return;
    this.marcadorMovible.addListener('dragend', (evento) => {
      try {
        const posicion = this.marcadorMovible.getPosition();
        this.coordenadas = { lat: posicion.lat(), lng: posicion.lng() };

        console.log('Coordenadas: ', this.coordenadas);
        mapa.panTo(posicion);
      } catch {
        alert('Error al actualizar la posición');
        console.error(error);
      }
    });

    // 4. Pedir la ubicacion del usuario y actualizar el marcador a esa posicion
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          try {
            const miUbicacion = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            this.marcadorMovible.setPosition(miUbicacion);
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

  detectarClickFueraDeElementosEspeciales(event) {
    // Verificar si el modal general está visible
    if (this.contenedorGeneralMiUbicacion.style.display === 'flex') {
      // Si el clic fue dentro del modal body, no hacer nada
      if (this.contenedorModalBody.contains(event.target)) {
        return; // El clic fue dentro del contenido del modal, no cerramos
      }

      // Si el clic fue en el contenedor general pero fuera del modal body, cerrar todo
      if (this.contenedorGeneralMiUbicacion.contains(event.target)) {
        this.contenedorGeneralMiUbicacion.style.display = 'none';
        this.modalBackground.style.display = 'none';
      }
    }
  }

  cerrarModalMiUbicacion() {
    this.contenedorGeneralMiUbicacion.style.display = 'none';
  }

  cambiarEstadoHutCoins() {
    const estaActivado = this.btnHutCoins.classList.contains('activado');
    if (estaActivado) {
      this.btnHutCoins.classList.remove('activado');
      this.btnHutCoins.innerHTML = this.iconos.iconCheckBoxOff;
    } else {
      this.btnHutCoins.classList.add('activado');
      this.btnHutCoins.innerHTML = this.iconos.iconCheckBoxOn;
    }
  }

  cambiarEstadoInfoHutCoins() {
    const estaActivado = this.btnInfoHutCoins.classList.contains('activado');

    if (estaActivado) {
      this.btnInfoHutCoins.classList.remove('activado');
      this.btnInfoHutCoins.innerHTML = this.iconos.iconCheckBoxOff;
    } else {
      this.btnInfoHutCoins.classList.add('activado');
      this.contenedorTerminosCondiciones.classList.remove('politicas-terminos');
      this.btnInfoHutCoins.innerHTML = this.iconos.iconCheckBoxOn;
    }
  }

  async procesoFormulario() {
    const estaHabilitado = this.btnContinuar.classList.contains('desactivado');
    const estaHabilitado2 = this.btnInfoHutCoins.classList.contains('activado');
    if (!estaHabilitado && estaHabilitado2) {
      MensajeCargaDatos.mostrar('Procesando datos ...');
      // Verificar si el numero de celular ya esta ocupado
      const existeEsteUsuario = await this.porNroTelefonoUsuarioVerificar(`+591${this.frmCelularInput.value}`);
      if (existeEsteUsuario == undefined) {
        const datosUsuario = await this.crearUnNuevoUsuario();
        localStorage.setItem(
          'ph-datos-usuario',
          JSON.stringify({
            nombre: datosUsuario.nombre,
            celular: datosUsuario.celular,
            apellido: datosUsuario.apellido,
            email: datosUsuario.email,
            ci: datosUsuario.ci,
            direcciones: datosUsuario.direcciones,
            razon_social: datosUsuario.razon_social,
            nit: datosUsuario.nit,
            fecha_nacimiento: datosUsuario.fecha_nacimiento,
            permisosHutCoins: false,
            ordenesPagadas: [],
            ordenesPendientes: []
          })
        );
        MensajeCargaDatos.ocultar();
        window.location.href = '/';
      } else {
        MensajeCargaDatos.ocultar();
        MensajeTemporal.mostrarMensaje('El número de celular ya está registrado. Por favor, intenta con otro número.', 'error', 3500);
      }
      // this.modalBackground.style.display = 'flex';
      // setTimeout(() => {
      //   localStorage.setItem('ph-datos-usuario', JSON.stringify({
      //     nombre: this.frmNombreInput.value,
      //     apellido: this.frmApellidoInput.value,
      //     email: this.frmEmailInput.value,
      //     celular: this.frmCelularInput.value,
      //     ci: this.frmCiInput.value,
      //     fechaNacimiento: this.frmFechaNacimientoInput.value,
      //     permisoHutCoins: this.btnHutCoins.classList.contains('activado'),
      //   }));
      //   this.modalBackground.style.display = 'none';
      //   window.location.href = '/';
      // }, 3000);
    } else {
      if (!estaHabilitado2) {
        this.contenedorTerminosCondiciones.classList.add('politicas-terminos');
      }
    }
  }

  habilitarBtnContinuar() {
    const inputsForm = [
      this.frmNombreInput,
      this.frmApellidoInput,
      this.frmEmailInput,
      this.frmCelularInput,
      this.frmCiInput,
    ];

    const allFilled = inputsForm.every((input) => input.value.trim() !== '');
    if (allFilled) {
      this.btnContinuar.classList.remove('desactivado');
    } else {
      this.btnContinuar.classList.add('desactivado');
    }
  }

  async procesoConfirmacionModal() {
    const posicion = this.marcadorMovible.getPosition();
    this.coordenadas = { lat: posicion.lat(), lng: posicion.lng() };
    const ubicacionTexto = await AuxiliaresGlobal.obtenerDireccionDesdeCoordenadas(this.coordenadas.lat, this.coordenadas.lng);
    this.inputDireccion.value = ubicacionTexto;
    console.log('Coordenadas de dirección seleccionada:', {
      "coordenadas": this.coordenadas,
      "direccion": ubicacionTexto,
    });
    this.cerrarModalMiUbicacion();
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
      componentRestrictions: { country: 'bo' }, // Ajusta al país (Bolivia)
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
      sugerencias.forEach((sugerencia) => {
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

    // Marcar que se ha seleccionado una dirección
    this.direccionSeleccionada = true;

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
          lng: ubicacion.lng(),
        };

        console.log('Coordenadas de direcciónn seleccionada:', this.coordenadas);
      }
    });
  }

  validarInputTexto(event) {
    // El elemento que disparó el evento
    const input = event.target;

    // Guarda la posición actual del cursor
    const cursorPos = input.selectionStart;

    // Filtra cualquier carácter que no sea letra o espacio
    const valorOriginal = input.value;
    const valorFiltrado = valorOriginal.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, '');

    // Solo actualiza si hay cambios
    if (valorOriginal !== valorFiltrado) {
      input.value = valorFiltrado;

      // Ajusta la posición del cursor
      input.setSelectionRange(cursorPos - (valorOriginal.length - valorFiltrado.length),
        cursorPos - (valorOriginal.length - valorFiltrado.length));
    }
  }

  async crearUnNuevoUsuario() {
    // Convertir los datos adicionales a formato JSON para el metafield
    const metafieldValue = `{
      "nit": "",
      "razon_social": "",
      "fecha": "${this.frmFechaNacimientoInput.value}",
      "permisosHutCoins": "${this.btnHutCoins.classList.contains('activado')}",
      "ci": "${this.frmCiInput.value}",
      "direcciones": [
        {
          "lat": "${this.coordenadas.lat}",
          "lng": "${this.coordenadas.lng}",
          "indicaciones": "${this.inputDireccion.value == "" ? "Plaza Principal de Warnes, Santa Cruz." : this.inputDireccion.value + ", Santa Cruz."}",
          "alias": "Ubicación de entrega"
        }
      ]
    }`;

    // Enfoque correcto: usar variables separadas para la consulta GraphQL
    const graphQLMutation = `
      mutation customerCreate($input: CustomerInput!) {
        customerCreate(input: $input) {
          customer {
            id
            firstName
            lastName
            email
            phone
            metafield(namespace: "informacion", key: "extra") {
              id
              namespace
              key
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

    // Asegurarnos de que el teléfono tenga el formato correcto
    const phoneNumber = this.frmCelularInput.value.startsWith("+591")
      ? this.frmCelularInput.value
      : `+591${this.frmCelularInput.value}`;

    // Crear el objeto de variables con datos válidoss
    const variables = {
      input: {
        firstName: `${this.frmNombreInput.value}`,
        lastName: `${this.frmApellidoInput.value}`,
        email: `${this.frmEmailInput.value}`,
        phone: `${phoneNumber}`,
        metafields: [
          {
            namespace: "informacion",
            key: "extra",
            type: "json_string",
            value: metafieldValue
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
          query: graphQLMutation,
          variables: variables
        }),
      });

      // Obtener el texto de la respuesta para debugging
      const respuestaTexto = await respuesta.text();

      // Intentar parsear la respuesta como JSON
      let datos;
      try {
        datos = JSON.parse(respuestaTexto);
      } catch (e) {
        console.error("Error al parsear la respuesta:", respuestaTexto);
        return {
          exito: false,
          mensaje: "Error en la respuesta del servidor"
        };
      }

      console.log('Datos de respuesta completa:', datos);

      // Verificar si hay errores en la respuesta
      if (datos.errors) {
        console.error("Errores de GraphQL:", datos.errors);
        return {
          exito: false,
          errores: datos.errors,
          mensaje: datos.errors[0]?.message || "Error en la consulta GraphQL"
        };
      }

      // Verificar si hay errores específicos de la creación del usuario
      if (datos.data?.customerCreate?.userErrors?.length > 0) {
        console.error("Errores al crear usuario:", datos.data.customerCreate.userErrors);
        return {
          exito: false,
          errores: datos.data.customerCreate.userErrors,
          mensaje: datos.data.customerCreate.userErrors[0]?.message || "Error al crear el usuario"
        };
      }

      // Verificar si se creó el cliente
      if (datos.data?.customerCreate?.customer) {
        const customer = datos.data.customerCreate.customer;

        // Extraer el metafield
        let metafieldData = {};
        if (customer.metafield?.value) {
          try {
            metafieldData = JSON.parse(customer.metafield.value);
          } catch (e) {
            console.error("Error al parsear metafield JSON:", e);
          }
        }

        // Construir y devolver el objeto con toda la información
        return {
          id: customer.id,
          nombre: customer.firstName,
          celular: customer.phone.replace("+591", ""),
          apellido: customer.lastName,
          email: customer.email,
          ci: metafieldData.ci || "",
          direcciones: metafieldData.direcciones || [],
          razon_social: metafieldData.razon_social || "",
          nit: metafieldData.nit || "",
          fecha_nacimiento: metafieldData.fecha || "",
          permisosHutCoins: metafieldData.permisosHutCoins || false,
        };
      } else {
        console.log('No se pudo crear el usuario, respuesta:', datos);
        return {
          exito: false,
          mensaje: "No se pudo crear el usuario"
        };
      }
    } catch (error) {
      console.error("Error al crear usuario:", error);
      return {
        exito: false,
        mensaje: error.message
      };
    }
  }

  async porNroTelefonoUsuarioVerificar(numeroTelefono) {
    const graphQLQuery = `
      query CustomerByIdentifier($identifier: CustomerIdentifierInput!) {
        customer: customerByIdentifier(identifier: $identifier) {
          id
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
}

customElements.define('crear-cuenta', CrearCuenta);