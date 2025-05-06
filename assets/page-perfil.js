class PerfilUsuario extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // REFERENCIAS ELEMENTOS
    this.menuGeneralSector = document.getElementById('phppu-menu-general');
    this.menuGeneralBody = document.getElementById('phppu-menu-general-body');
    // MOBIL
    this.headerMobil = document.getElementById('phppu-header-movil');
    this.btnAtrasHeader = document.getElementById('phppu-headerm-atras');
    this.btnMenuHeader = document.getElementById('phppu-headerm-menu');
    this.tituloHeaderMobil = document.getElementById('phppu-headerm-titulo');
    // DESKTOP
    this.btnSectorIPerfil = document.getElementById('phppu-btn-menu-perfil');
    this.btnSectorIHistorial = document.getElementById('phppu-btn-historial');
    this.btnSectorIConfiguraciones = document.getElementById('phppu-btn-configuraciones');
    this.seccionPerfil = document.getElementById('phpp-cd-perfil');
    this.seccionHistorial = document.getElementById('phpp-cd-historial');
    this.seccionConfiguraciones = document.getElementById('phpp-cd-configuraciones');
    this.btnCerrarSesion = document.getElementById('phppu-btn-cerrar-sesion');
    this.btnEliminarCuenta = document.getElementById('phppu-btn-eliminar-cuenta');
    this.labelNombre = document.querySelector('#phppu-label-nombre');
    this.labelApellido = document.querySelector('#phppu-label-apellido');
    this.labelTelefono = document.querySelector('#phppu-label-telefono');
    this.labelCi = document.querySelector('#phppu-label-ci');
    this.labelCorreo = document.querySelector('#phppu-label-correo');
    this.labelDireccion = document.querySelector('#phppu-label-direccion');
    this.btnsVerDetalle = document.querySelectorAll('#phppu-btn-ver-detalle');
    this.btnCheckboxEstado = document.querySelector('#phppu-checkbox-estado');

    // EVENTOS INICIALIZAR
    this.btnSectorIPerfil.addEventListener('click', this.seleccionOpcionMenu.bind(this));
    this.btnSectorIHistorial.addEventListener('click', this.seleccionOpcionMenu.bind(this));
    this.btnSectorIConfiguraciones.addEventListener('click', this.seleccionOpcionMenu.bind(this));
    this.btnMenuHeader.addEventListener('click', this.manipulacionContenedorMenu.bind(this));
    this.btnCerrarSesion.addEventListener('click', this.cerrarSesion.bind(this));
    this.btnEliminarCuenta.addEventListener('click', this.eliminarCuenta.bind(this));
    this.btnCheckboxEstado.addEventListener('change', this.solicitarNotificaciones.bind(this));
    this.btnsVerDetalle.forEach((btn) => {
      btn.addEventListener('click', () => {
        localStorage.setItem('ph-estadoDP', 'etapa-2');
        localStorage.setItem('ph-origenHistorial', 'true');
        window.location.href = '/pages/detalle-pedido';
      });
    });
    document.addEventListener('click', this.detectarClickEspeciales.bind(this)(event));

    // INICIALIZAR ELEMENTOS Y PROCESOS CLAVES
    this.menuGeneralSector.style.display = 'none';
    this.seccionPerfil.style.display = 'none';
    this.seccionHistorial.style.display = 'none';
    this.seccionConfiguraciones.style.display = 'none';
    this.inicializarDatosAlmacenados();
    this.verificarPermisoNotificaciones();
  }

  inicializarDatosAlmacenados() {
    const datosUsuario = JSON.parse(localStorage.getItem('ph-datos-usuario'));
    const direccion = localStorage.getItem('direccion-cliente');

    const dataPerfil = localStorage.getItem('pg-perfil-opcion');
    console.log('inicializando datos almacenados');
    if (dataPerfil == null) {
      window.location.href = '/';
    }

    if (!datosUsuario) {
      window.location.href = '/';
    }

    if (dataPerfil == 'perfil') {
      this.btnSectorIPerfil.classList.add('seleccionado');
      this.seccionPerfil.style.display = 'flex';
      this.tituloHeaderMobil.innerText = 'MI PERFIL';
    } else if (dataPerfil == 'historial') {
      this.btnSectorIHistorial.classList.add('seleccionado');
      this.tituloHeaderMobil.innerText = 'HISTORIAL DE PEDIDOS';
      this.seccionHistorial.style.display = 'flex';
    } else if (dataPerfil == 'configuracion') {
      this.btnSectorIConfiguraciones.classList.add('seleccionado');
      this.tituloHeaderMobil.innerText = 'CONFIGURACIONES';
      this.seccionConfiguraciones.style.display = 'flex';
    }

    if (datosUsuario) {
      this.labelNombre.innerText = datosUsuario.nombre || '----';
      this.labelApellido.innerText = datosUsuario.apellido || '----';
      this.labelTelefono.innerText = datosUsuario.celular || '----';
      this.labelCi.innerText = datosUsuario.ci || '----';
      this.labelCorreo.innerText = datosUsuario.email || '----';
      this.labelDireccion.innerText = direccion || '----';
    }

    const tieneNotifi = localStorage.getItem('ph-notificaciones');
    if (tieneNotifi == 'true') {
      this.btnCheckboxEstado.checked = true;
    } else {
      this.btnCheckboxEstado.checked = false;
    }
  }

  seleccionOpcionMenu(event) {
    // Obtener el botón que fue clickeado
    const botonClickeado = event.currentTarget;

    // Si el botón ya está seleccionado, no hacer nada
    if (botonClickeado.classList.contains('seleccionado')) {
      return;
    }

    const elementos = [
      { boton: this.btnSectorIPerfil, seccion: this.seccionPerfil },
      { boton: this.btnSectorIHistorial, seccion: this.seccionHistorial },
      { boton: this.btnSectorIConfiguraciones, seccion: this.seccionConfiguraciones },
    ];

    // Oculta todas las secciones y quita la clasee 'seleccionado' de todos los botones
    elementos.forEach((elemento) => {
      elemento.boton.classList.remove('seleccionado');
      elemento.seccion.style.display = 'none';
    });

    // Selecciona el botón clickeado y muestra su sección correspondiente
    botonClickeado.classList.add('seleccionado');

    // Encuentra y muestra la sección correspondiente al botón clickeado
    const seccionSeleccionada = elementos.find((elemento) => elemento.boton === botonClickeado)?.seccion;
    if (seccionSeleccionada) {
      seccionSeleccionada.style.display = 'flex';
    }
  }

  manipulacionContenedorMenu() {
    if (this.menuGeneralSector.style.display == 'none') {
      this.menuGeneralSector.style.display = 'flex';
    }
  }

  detectarClickEspeciales() {
    // Elemento general que contiene el background
    const menuGeneralSector = this.menuGeneralSector;
    // Elemento contenido modal (el body)
    const menuGeneralBody = this.menuGeneralBody;

    // Detectar clic en el sector general (background)
    menuGeneralSector.addEventListener('click', (event) => {
      // Verificar si el clic fue directamente en el background y no en el body
      if (event.target === menuGeneralSector && !menuGeneralBody.contains(event.target)) {
        // Ocultar el modal cambiando display a none
        menuGeneralSector.style.display = 'none';
      }
    });
  }

  cerrarSesion() {
    localStorage.removeItem('ph-datos-usuario');
    localStorage.removeItem('pg-perfil-opcion');
    localStorage.removeItem('direccion-cliente');
    window.location.href = '/';
  }

  eliminarCuenta() {
    localStorage.removeItem('ph-datos-usuario');
    localStorage.removeItem('pg-perfil-opcion');
    localStorage.removeItem('direccion-cliente');
    window.location.href = '/';
  }

  solicitarNotificaciones() {
    if (this.btnCheckboxEstado.checked) {
      // Usuario quiere activar notificaciones

      // Verificar si ya tenemos el permiso
      if (Notification.permission === 'granted') {
        console.log('Permisos ya estaban aceptados');
        localStorage.setItem('ph-notificaciones', 'true');
        return;
      }

      // Si el permiso ya fue denegado anteriormente, mostrar alerta
      if (Notification.permission === 'denied') {
        alert(
          'Las notificaciones están bloqueadas. Por favor, habilite los permisos de notificación en la configuración de su navegador para este sitio.'
        );
        this.btnCheckboxEstado.checked = false;
        localStorage.setItem('ph-notificaciones', 'false');
        return;
      }

      // Si no tenemos permiso o está en estado 'default', solicitarlo
      Notification.requestPermission()
        .then((permission) => {
          if (permission !== 'granted') {
            // Si rechaza, actualizamos el checkbox para reflejar el estado real
            this.btnCheckboxEstado.checked = false;
            console.log('Permisos de notificación rechazados por el usuario');
            localStorage.setItem('ph-notificaciones', 'false');

            // Mostrar alerta pidiendo que habilite las notificaciones
            alert(
              'Para recibir notificaciones importantes, por favor habilite los permisos en la configuración de su navegador.'
            );
          } else {
            console.log('Permisos de notificación aceptados');
            this.btnCheckboxEstado.checked = true;
            localStorage.setItem('ph-notificaciones', 'true');
          }
        })
        .catch((error) => {
          console.error('Error al solicitar permisos:', error);
          this.btnCheckboxEstado.checked = false;
          localStorage.setItem('ph-notificaciones', 'false');

          // Mostrar alerta en caso de error
          alert('Ocurrió un error al solicitar permisos de notificación. Por favor, inténtelo nuevamente.');
        });
    } else {
      // Usuario quiere desactivar notificaciones
      console.log('Usuario ha desactivado las notificaciones');
      localStorage.setItem('ph-notificaciones', 'false');
    }
  }

  verificarPermisoNotificaciones() {
    // Obtener el permiso actual
    const permiso = Notification.permission;

    // Actualizar el checkbox según el permiso actual
    if (permiso === 'granted') {
      this.btnCheckboxEstado.checked = true;
      localStorage.setItem('ph-notificaciones', 'true');
    } else {
      this.btnCheckboxEstado.checked = false;
      localStorage.setItem('ph-notificaciones', 'false');
    }

    console.log(`Estado actual de permisos de notificación: ${permiso}`);
  }
}

customElements.define('perfil-usuario', PerfilUsuario);