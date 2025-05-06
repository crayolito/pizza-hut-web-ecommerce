class EditarPerfil extends HTMLElement {
  constructor() {
    super();
    this.coordenadas = { lat: -17.510420897741643, lng: -63.16459000457593 };
    this.direccionSeleccionada = false;
    this.marcadorMovible = null;
  }

  connectedCallback() {
    // REFERENCIAS A ELEMENTOS
    this.btnContinuar = document.getElementById('phpep-btn-continuar');
    this.inputNombre = document.getElementById('phpep-input-nombre');
    this.inputApellido = document.getElementById('phpep-input-apellido');
    this.inputEmail = document.getElementById('phpep-input-email');
    this.inputCelular = document.getElementById('phpep-input-celular');
    this.inputCi = document.getElementById('phpep-input-ci');
    this.inputDireccion = document.getElementById('phpep-input-direccion');
    this.modalDarDireccion = document.getElementById('phpep-modal-dar-direccion');
    this.modalBodyMap = document.getElementById('phpcc-modal-mapa');
    this.btnModalDDContinuar = document.getElementById('phpep-btn-confirmar-modal');
    this.btnModalDDCancelar = document.getElementById('phpep-btn-cancelar-modal');
    this.btnModalCerrar = document.getElementById('phpep-boton-cerrar-modal');
    this.btnUsarMiUbicacion = document.getElementById('phpep-btn-usar-mi-ubicacion');
    this.contenedorSugerencias = document.getElementById('phpep-sugerencias-direccion');

    // EVENTOS INCIALIZAR
    this.btnUsarMiUbicacion.addEventListener('click', this.btnUsarMiUbicacionActual.bind(this));
    this.btnContinuar.addEventListener('click', this.btnContinuarClick.bind(this));
    this.btnModalDDContinuar.addEventListener('click', this.procesarConfirmacionModal.bind(this));
    this.btnModalDDCancelar.addEventListener('click', this.cerrarModalDarDireccion.bind(this));
    this.btnModalCerrar.addEventListener('click', this.cerrarModalDarDireccion.bind(this));
    this.inputNombre.addEventListener('input', this.verificiarValidacion.bind(this));
    this.inputApellido.addEventListener('input', this.verificiarValidacion.bind(this));
    this.inputEmail.addEventListener('input', this.verificiarValidacion.bind(this));
    this.inputCelular.addEventListener('input', this.verificiarValidacion.bind(this));
    this.inputCi.addEventListener('input', this.verificiarValidacion.bind(this));
    this.inputNombre.addEventListener('input', this.validarInputTexto.bind(this));
    this.inputApellido.addEventListener('input', this.validarInputTexto.bind(this));
    // document.addEventListener('click', this.clickEspeciales.bind(this));

    // INICIALIZAR ELEMENTOS Y PROCESOS (CLAVES)
    this.inicializarDataLocalStorage();
    this.configurarAutocompletadoDirecciones();
  }

  inicializarDataLocalStorage() {
    const datosUsuario = JSON.parse(localStorage.getItem('ph-datos-usuario'));

    if (datosUsuario == null || datosUsuario == undefined) {
      window.location.href = '/';
    }

    this.coordenadas = { lat: parseFloat(datosUsuario.direcciones[0].lat), lng: parseFloat(datosUsuario.direcciones[0].lng) };
    const inputs = {
      nombre: this.inputNombre,
      apellido: this.inputApellido,
      email: this.inputEmail,
      celular: this.inputCelular,
      ci: this.inputCi,
    };

    inputs.nombre.value = datosUsuario.nombre == "----" ? "" : datosUsuario.nombre;
    inputs.apellido.value = datosUsuario.apellido == "----" ? "" : datosUsuario.apellido;
    inputs.email.value = datosUsuario.email == "----" ? "" : datosUsuario.email;
    inputs.celular.value = datosUsuario.celular == "----" ? "" : datosUsuario.celular;
    inputs.ci.value = datosUsuario.ci == "----" ? "" : datosUsuario.ci;

    // inputs.nombre.value = datosUsuario.nombre == "----" ? "" : datosUsuario.nombre;
    // inputs.apellido.value = datosUsuario.apellido == "----" ? "" : datosUsuario.apellido;
    // inputs.email.value = datosUsuario.email == "----" ? "" : datosUsuario.email;
    // inputs.celular.value = datosUsuario.celular == "----" ? "" : datosUsuario.celular;
    // inputs.ci.value = datosUsuario.ci == "----" ? "" : datosUsuario.ci;
    // this.inputDireccion.value = direccion == "----" ? "" : direccion;
    this.verificiarValidacion();
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
      input.setSelectionRange(
        cursorPos - (valorOriginal.length - valorFiltrado.length),
        cursorPos - (valorOriginal.length - valorFiltrado.length)
      );
    }
  }

  cerrarModalDarDireccion() {
    this.modalDarDireccion.style.display = 'none';
  }

  verificiarValidacion() {
    const inputsForm = [this.inputNombre, this.inputApellido, this.inputEmail, this.inputCelular, this.inputCi];

    const todosValidos = inputsForm.every((input) => input.value.trim() !== '');

    if (todosValidos) {
      this.btnContinuar.classList.remove('desactivado');
      this.btnContinuar.disabled = false;
    } else {
      this.btnContinuar.classList.add('desactivado');
      this.btnContinuar.disabled = true;
    }
  }

  async procesarConfirmacionModal() {
    const posicion = this.marcadorMovible.getPosition();
    this.coordenadas = { lat: posicion.lat(), lng: posicion.lng() };
    const direccion = await AuxiliaresGlobal.obtenerDireccionDesdeCoordenadas(posicion.lat(), posicion.lng());
    localStorage.setItem('direccion-cliente', direccion);
    localStorage.setItem('ubicacion-cliente', JSON.stringify(this.coordenadas));
    this.inputDireccion.value = direccion;
    console.log('Coordenadas de dirección seleccionada:', this.coordenadas);
    console.log('Posicion del marcador:', posicion);
    console.log('Direccion seleccionada:', direccion);
    this.cerrarModalDarDireccion();
  }

  async btnContinuarClick() {
    const datosUsuario = JSON.parse(localStorage.getItem('ph-datos-usuario') || '{}');
    MensajeCargaDatos.mostrar('Procesando datos ...');
    const existeClienteAntiguo = await this.porNroTelefonoUsuarioVerificar("+591" + datosUsuario.celular);
    const existeClienteNuevo = await this.porNroTelefonoUsuarioVerificar("+591" + this.inputCelular.value);

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
      MensajeCargaDatos.ocultar();
      localStorage.setItem('pg-perfil-opcion', "perfil");
      window.location.href = '/pages/perfil';
      return;

    } else {
      MensajeCargaDatos.ocultar();
      MensajeTemporal.mostrarMensaje('El número de celular ya está registrado. Por favor, intenta con otro número.', 'error', 3500);
      return;
    }
    // this.modalSnipper.style.display = 'flex';
    // this.modalSnipperBody.style.display = 'flex';

    // const datosUsuario = {
    //   nombre: this.inputNombre.value,
    //   apellido: this.inputApellido.value,
    //   email: this.inputEmail.value,
    //   celular: this.inputCelular.value,
    //   ci: this.inputCi.value,
    // };

    // localStorage.setItem('ph-datos-usuario', JSON.stringify(datosUsuario));
    // localStorage.setItem('direccion-cliente', this.inputDireccion.value);

    // setTimeout(() => {
    //   window.location.href = '/pages/perfil';
    // }, 2000);
  }

  btnUsarMiUbicacionActual() {
    this.modalDarDireccion.style.display = 'flex';

    // 1. Crear el mapa
    if (!this.modalBodyMap) {
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

    const mapa = new google.maps.Map(this.modalBodyMap, configuracionMapa);

    // 2. Crear el marcador movible
    // {% comment %} const marcadorMovible = new google.maps.Marker({ {% endcomment %}
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

    // Validar campos mínimos
    if (!this.inputNombre.value || !this.inputCelular.value) {
      return {
        exito: false,
        mensaje: "Nombre y celular son obligatorios"
      };
    }

    // Crear la nueva dirección
    const nuevaDireccion = {
      lat: this.coordenadas.lat.toString(),
      lng: this.coordenadas.lng.toString(),
      indicaciones: `${this.inputDireccion.value == "" ? "Plaza Principal de Warnes, Santa Cruz." : this.inputDireccion.value + ", Santa Cruz."
        }, Santa Cruz.`,
      alias: "Ubicación de entrega"
    };

    // Mantener las direcciones existentes pero actualizar la primera
    let direcciones = [];

    if (datosUsuario.direcciones && Array.isArray(datosUsuario.direcciones)) {
      // Copiar el array de direcciones para no modificar el original
      direcciones = [...datosUsuario.direcciones];

      // Reemplazar la primera dirección o añadirla si no existe
      if (direcciones.length > 0) {
        direcciones[0] = nuevaDireccion;
      } else {
        direcciones.push(nuevaDireccion);
      }
    } else {
      // Si no hay direcciones, inicializar con la nueva
      direcciones = [nuevaDireccion];
    }

    const informacionExtra = JSON.stringify({
      nit: datosUsuario.nit || "",
      razon_social: datosUsuario.razon_social || "",
      fecha: datosUsuario.fecha_nacimiento || "",
      permisosHutCoins: datosUsuario.permisosHutCoins || false,
      ci: this.inputCi.value || datosUsuario.ci || "",
      direcciones: direcciones
    });

    const variables = {
      input: {
        id: `gid://shopify/Customer/${id}`,
        firstName: this.inputNombre.value,
        lastName: this.inputApellido.value,
        email: this.inputEmail.value,
        phone: `+591${this.inputCelular.value}`,
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
  }
}

customElements.define('editar-perfil', EditarPerfil);