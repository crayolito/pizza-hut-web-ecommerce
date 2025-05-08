class HeaderPrincipal extends HTMLElement {
  constructor() {
    super();

    this.categoriasConstruccion = [
      { titulo: "TODO", categoria: "" },
      { titulo: "OFERTAS", categoria: "desarrollado" },
      { titulo: "PIZZAS", categoria: "complejo" },
      { titulo: "HUT DAYS 2X1", categoria: "desarrollado" },
      { titulo: "POLLO", categoria: "desarrollado" },
      { titulo: "MELTS", categoria: "desarrollado" },
      { titulo: "MITAD & MITAD", categoria: "desarrollado" },
      { titulo: "PASTAS Y ENSALADAS", categoria: "basico" },
      { titulo: "GASEOSAS", categoria: "basico" },
      { titulo: "CERVEZAS", categoria: "basico" },
      { titulo: "POSTRES", categoria: "basico" }
    ]

    this.coleccionesProcesadas = null;
    this.cantidadDesplazamiento = 400;
  }

  connectedCallback() {
    this.logoPrincipal = this.querySelectorAll('.h-logo-principal');
    // HEADER MOBILE
    this.contenedorMenuMobile = this.querySelector('#h-menu-inicio-sesion-usuario-mobile');
    this.btnBuscarMobile = this.querySelector('#h-btn-buscar-mobile');
    this.btnCarritoMobile = this.querySelector('.h-icono-carrito');
    this.btnSeleccionEntregaMobile = this.querySelector('#h-seleccion-metodo-entrega-mobile');
    this.btnOpcionUsuarioMobile = this.querySelector('#h-opciones-usuario-mobile');
    this.btnEntregaLocalMobile = this.querySelector('#h-btn-entrega-local-mobile');
    this.btnEntregaDomicilioMobile = this.querySelector('#h-btn-entrega-domicilio-mobile');
    this.contenedorIsMenu = this.querySelector('#h-ismm-menu-principal');
    this.contenedorNisMenu = this.querySelector('#h-nismm-menu-principal');
    this.tituloMenuMobile = this.querySelector('#h-titulo-mobile-menu');
    this.btnCerrrarMenuMobile = this.querySelector('#h-boton-cerrar-menu-mobile');
    this.btnPerfilMenuMobile = this.querySelector('#h-ismm-perfil');
    this.btnHistorialMenuMobile = this.querySelector('#h-ismm-historial-pedidos');
    this.btnConfiguracionMenuMobile = this.querySelector('#h-ismm-configuracion');
    this.btnCuponesMenuMobile = this.querySelector('#h-ismm-cupones-descuentos');
    this.btnHutcoinsMenuMobile = this.querySelector('#h-ismm-hutcoins');
    this.btnMisPreferenciasMenuMobile = this.querySelector('#h-ismm-mis-preferencias');
    this.btnCerrarSesionOfMenuM = this.querySelector('#h-ismm-cerrar-sesion');

    this.btnVerMenuMobile = this.querySelector('#h-btn-menu-mobile');
    // HEADER DESKTOP
    this.btnMenu = this.querySelector('.h-mostrar-menu-opciones-productos');
    this.contenedorEstadosEntrega = this.querySelector('.h-sector-metodo-entrega');
    this.btnOpcionOnSesion = this.querySelector('#h-boton-modo-cliente');
    this.btnOpcionOffSesion = this.querySelector('.h-boton-modo-no-cliente');
    this.btnSeleccionMetodoEntrega = this.querySelector('#h-boton-cambio-metodo-entrega');
    this.btnDominicilio = this.querySelector('.h-metodo-domicilio');
    this.btnLocal = this.querySelector('.h-metodo-local');
    this.contenedorMenuDesplegable = this.querySelector('#phh-seccion-opciones');
    this.contenedorResultadoBusqueda = this.querySelector('.h-busqueda-especifica');
    this.sectorGeneralBusqueda = this.querySelector('.h-sector-busqueda');
    this.containerInputBusqueda = this.querySelector('#h-container-input-search');
    this.inputBusqueda = this.querySelector('#h-input-buscar');
    this.contenedorDisMenu = this.querySelector('#h-ismd-opciones-usuario');
    this.btnMiPerfilOfMenu = this.querySelector('#h-ismd-menu');
    this.btnHistorialOfMenu = this.querySelector('#h-ismd-historial-pedidos');
    this.btnCuponesOfMenu = this.querySelector('#h-ismd-cupones-descuentos');
    this.btnHutcoinsOfMenu = this.querySelector('#h-ismd-hutcoins');
    this.btnMisPreferenciasOfMenu = this.querySelector('#h-ismd-mis-preferencias');
    this.btnconfiguracionOfMenu = this.querySelector('#h-ismd-configuracion');
    this.btnCerrarSesionOfMenuD = this.querySelector('#h-ismd-cerrar-sesion');
    // TESTEO DE PRUEBA

    // EVENTOS LISTENER
    this.btnMenu.addEventListener('click', this.mostrarMenuDesplegable.bind(this));
    this.inputBusqueda.addEventListener('keyup', this.accionEnterInput.bind(this));
    this.inputBusqueda.addEventListener('input', this.accionEscribeInput.bind(this));
    this.btnCarritoMobile.addEventListener('click', this.redireccionarCarrito.bind(this));
    this.btnBuscarMobile.addEventListener('click', this.redireccionarBusqueda.bind(this));
    this.btnCerrrarMenuMobile.addEventListener('click', this.cerrarMenuMobile.bind(this));
    this.btnVerMenuMobile.addEventListener('click', this.verMenuMobile.bind(this));
    this.btnOpcionOnSesion.addEventListener('click', this.verMenuDesktop.bind(this));
    this.btnDominicilio.addEventListener('click', this.redireccionMetodoEntrega.bind(this));
    this.btnLocal.addEventListener('click', this.redireccionMetodoEntrega.bind(this));
    this.btnSeleccionEntregaMobile.addEventListener('click', this.redireccionMetodoEntrega.bind(this));
    this.btnMiPerfilOfMenu.addEventListener('click', this.redireccionPerfilMenuDesktop.bind(this));
    this.btnHistorialOfMenu.addEventListener('click', this.redireccionHistorialMenuDesktop.bind(this));
    this.btnCuponesOfMenu.addEventListener('click', this.redireccionCuponesMenuDesktop.bind(this));
    this.btnHutcoinsOfMenu.addEventListener('click', this.redireccionHutcoinsMenuDesktop.bind(this));
    this.btnMisPreferenciasOfMenu.addEventListener('click', this.redireccionPreferenciasMenuDesktop.bind(this));
    this.btnconfiguracionOfMenu.addEventListener('click', this.redireccionConfiguracionMenuDesktop.bind(this));
    this.btnPerfilMenuMobile.addEventListener('click', this.redireccionPerfilMenuDesktop.bind(this));
    this.btnHistorialMenuMobile.addEventListener('click', this.redireccionHistorialMenuDesktop.bind(this));
    this.btnConfiguracionMenuMobile.addEventListener('click', this.redireccionConfiguracionMenuDesktop.bind(this));
    this.btnCuponesMenuMobile.addEventListener('click', this.redireccionCuponesMenuDesktop.bind(this));
    this.btnHutcoinsMenuMobile.addEventListener('click', this.redireccionHutcoinsMenuDesktop.bind(this));
    this.btnMisPreferenciasMenuMobile.addEventListener('click', this.redireccionPreferenciasMenuDesktop.bind(this));
    this.btnCerrarSesionOfMenuD.addEventListener('click', this.cerrarSesion.bind(this));
    this.btnCerrarSesionOfMenuM.addEventListener('click', this.cerrarSesion.bind(this));

    this.menuContainerHeader = this.querySelector('#phh-opciones-menu');
    this.botonIzquierdaMenuHeader = this.querySelector('#phh-btn-izquierda-menu');
    this.botonDerechaMenuHeader = this.querySelector('#phh-btn-derecha-menu');



    this.botonIzquierdaMenuHeader.addEventListener('click', this.desplazarIzquierdaHeader.bind(this));
    this.botonDerechaMenuHeader.addEventListener('click', this.desplazarDerechaHeader.bind(this));

    document.addEventListener('click', this.detectarClickFueraDelInputBusqueda.bind(this));
    this.logoPrincipal.forEach((logo) => {
      logo.addEventListener('click', () => {
        window.location.href = '/';
      });
    });


    // INICIALIZACION DE CONTENIDOSS
    this.contenedorMenuMobile.style.display = 'none';
    this.tituloMenuMobile.style.display = 'none';
    // this.contenedorMenuDesplegable.style.visibility = 'hidden';
    this.contenedorResultadoBusqueda.style.display = 'none';
    this.contenedorIsMenu.style.display = 'none';
    this.contenedorNisMenu.style.display = 'none';
    this.contenedorDisMenu.style.display = 'none';
    this.verificarEstadoSesion();
    this.verificarEstadoEntrega();
    this.contruccionOpcionesMenu();
  }

  verificarEstadoSesion() {
    // Obtener localStorage indentificador sesion
    // telefono cliente - metodo entrega (Official)
    const sesion = localStorage.getItem('ph-datos-usuario');
    const metodoEntrega = localStorage.getItem('ph-metodo-entrega');

    if (sesion == null) {
      this.tituloMenuMobile.style.display = 'flex';
      this.btnOpcionOffSesion.style.display = 'flex';
      this.btnOpcionOnSesion.style.display = 'none';
      this.contenedorIsMenu.style.display = 'none';
      this.contenedorNisMenu.style.display = 'flex';
    } else {
      // Si tienee el dato en el localStorage, traer datos de este mismo
      this.tituloMenuMobile.style.display = 'none';
      this.btnOpcionOffSesion.style.display = 'none';
      this.btnOpcionOnSesion.style.display = 'flex';
      this.contenedorIsMenu.style.display = 'flex';
      this.contenedorNisMenu.style.display = 'none';
    }
  }

  verificarEstadoEntrega() {
    // Obtener localStorage la seleccion metodo de entrega del usuario
    const metodoEntrega = localStorage.getItem('ph-metodo-entrega');

    // Si el usuario no tiene un metodo de entrega seleccionado,
    // mostrar el boton de (selecciona tu metodo de entrega)
    if (metodoEntrega == null || metodoEntrega == 'no') {
      this.contenedorEstadosEntrega.style.display = 'none';
      this.btnSeleccionMetodoEntrega.style.display = 'flex';
      this.btnSeleccionEntregaMobile.style.display = 'flex';
      this.btnOpcionUsuarioMobile.style.display = 'none';
    } else {
      this.btnSeleccionMetodoEntrega.style.display = 'none';
      this.contenedorEstadosEntrega.style.display = 'flex';
      this.btnSeleccionEntregaMobile.style.display = 'none';
      this.btnOpcionUsuarioMobile.style.display = 'flex';
      if (metodoEntrega == 'local') {
        this.btnLocal.style.display = 'flex';
        this.btnDominicilio.style.display = 'none';
        this.btnEntregaLocalMobile.style.display = 'flex';
        this.btnEntregaDomicilioMobile.style.display = 'none';
      }

      if (metodoEntrega == 'domicilio') {
        this.btnDominicilio.style.display = 'flex';
        this.btnLocal.style.display = 'none';
        this.btnEntregaLocalMobile.style.display = 'none';
        this.btnEntregaDomicilioMobile.style.display = 'flex';
      }
    }
  }

  mostrarMenuDesplegable() {
    const estaSeleccionado = this.btnMenu.classList.contains('seleccionado');
    if (estaSeleccionado) {
      this.btnMenu.classList.remove('seleccionado');
      this.contenedorMenuDesplegable.style.left = '100%';
    } else {
      this.btnMenu.classList.add('seleccionado');
      this.contenedorMenuDesplegable.style.left = '0';
    }
  }

  accionEnterInput(event) {
    if (event.key === 'Enter') {
      const textoInput = this.inputBusqueda.value.trim();
      const estaVisible = this.contenedorResultadoBusqueda.style.display === 'flex';

      // Caso 1: Si hay texto y el contenedor está visible, redirigir y ocultar
      if (textoInput !== '' && estaVisible) {
        window.location.href = '/search';
        this.contenedorResultadoBusqueda.style.display = 'none';
      }
      // Caso 2: Si hay texto pero el contenedor NO está visible, solo redirigir
      else if (textoInput !== '' && !estaVisible) {
        window.location.href = '/search';
      }
      // Caso 3: Si NO hay texto pero el contenedor está visible, solo ocultar
      else if (textoInput === '' && estaVisible) {
        this.contenedorResultadoBusqueda.style.display = 'none';
      }
      // Caso 4: Si NO hay texto y el contenedor NO está visible, no hacer nada
    }
  }

  accionEscribeInput() {
    const inputVacio = this.inputBusqueda.value.trim() === '';
    const estaVisible = this.contenedorResultadoBusqueda.style.display === 'flex';

    if (!inputVacio && !estaVisible) {
      // Solo mostrar si no está vacío y no está visible
      this.contenedorResultadoBusqueda.style.display = 'flex';
    } else if (inputVacio && estaVisible) {
      // Solo ocultar si está vacío y está visible
      this.contenedorResultadoBusqueda.style.display = 'none';
    }
  }

  detectarClickFueraDelInputBusqueda(event) {
    // Verificar estado del contenedor de resultados de búsqueda
    let estaAbiertoBusqueda = this.contenedorResultadoBusqueda.style.display == 'flex';
    if (estaAbiertoBusqueda) {
      if (event.target !== this.sectorGeneralBusqueda && !this.sectorGeneralBusqueda.contains(event.target)) {
        this.contenedorResultadoBusqueda.style.display = 'none';
      }
    }

    // Verificar si el clic fue en el botón del menú
    let btnMenuDesktopClicked =
      event.target === this.btnOpcionOnSesion || this.btnOpcionOnSesion.contains(event.target);

    // Si se hizo clic en el botón del menú, salir de la función
    if (btnMenuDesktopClicked) {
      return;
    }

    // Verificar si se hizo clic fuera del menú y el menú está abierto
    let estaAbiertoMenu = this.contenedorDisMenu.style.display == 'flex';
    if (estaAbiertoMenu) {
      if (event.target !== this.contenedorDisMenu && !this.contenedorDisMenu.contains(event.target)) {
        this.contenedorDisMenu.style.display = 'none';
      }
    }
  }

  redireccionarCarrito() {
    window.location.href = '/pages/carrito';
  }

  redireccionarBusqueda() {
    window.location.href = '/search';
  }

  cerrarMenuMobile() {
    console.log('cerrar menu mobile');
    this.contenedorMenuMobile.style.display = 'none';
  }

  verMenuMobile() {
    console.log('ver menu mobile');
    this.contenedorMenuMobile.style.display = 'flex';
  }

  verMenuDesktop() {
    const estaAbierto = this.contenedorDisMenu.style.display == 'flex';
    const datosCliente = localStorage.getItem('ph-datos-usuario');
    console.log('ver menu desktop', estaAbierto);

    // Verificar primero si hay datos de cliente
    if (datosCliente == null) {
      console.log('no hay datos de cliente');
      this.contenedorDisMenu.style.display = 'none';
      return; // Salir de la función si no hay datos
    }

    // Si hay datos de cliente, alternar la visibilidad del menú
    if (estaAbierto) {
      console.log('cerrar menu desktop');
      this.contenedorDisMenu.style.display = 'none';
    } else {
      console.log('abrir menu desktop');
      this.contenedorDisMenu.style.display = 'flex';
    }
  }

  redireccionMetodoEntrega() {
    window.location.href = '/pages/metodo-entrega';
  }

  redireccionPerfilMenuDesktop() {
    console.log('redireccionar a perfil');
    this.contenedorMenuMobile.style.display = 'none';
    this.contenedorDisMenu.style.display = 'none';
    localStorage.setItem('pg-perfil-opcion', 'perfil');
    window.location.href = '/pages/perfil';
  }

  redireccionHistorialMenuDesktop() {
    this.contenedorMenuMobile.style.display = 'none';
    this.contenedorDisMenu.style.display = 'none';
    localStorage.setItem('pg-perfil-opcion', 'historial');
    window.location.href = '/pages/perfil';
  }

  redireccionConfiguracionMenuDesktop() {
    this.contenedorMenuMobile.style.display = 'none';

    this.contenedorDisMenu.style.display = 'none';
    localStorage.setItem('pg-perfil-opcion', 'configuracion');
    window.location.href = '/pages/perfil';
  }

  redireccionCuponesMenuDesktop() {
    this.contenedorMenuMobile.style.display = 'none';
    this.contenedorDisMenu.style.display = 'none';
    window.location.href = '/pages/error-1';
  }

  redireccionHutcoinsMenuDesktop() {
    this.contenedorMenuMobile.style.display = 'none';

    this.contenedorDisMenu.style.display = 'none';
    window.open('https://microsites.spnty.co/pizzahutbolivia/login', '_blank');
  }

  redireccionPreferenciasMenuDesktop() {
    this.contenedorMenuMobile.style.display = 'none';

    this.contenedorDisMenu.style.display = 'none';
    window.location.href = '/pages/error-1';
  }

  cerrarSesion() {
    // Eliminar datos de localStorage
    localStorage.removeItem('ph-datos-usuario');
    localStorage.removeItem('ph-metodo-entrega');
    localStorage.removeItem('pg-perfil-opcion');
    // Redirigir a la página de inicio de sesión
    window.location.href = '/';
  }

  reduccionarDesdeMenuDesplegable(elementoBase) {
    // Del elemento Base traer el atributo menu
    const dataElemento = elementoBase.dataset.menu;
    // Guardar en localStorage el valor para que el Menu Page sepa que hhacer
    localStorage.setItem('phph-itemMenu', dataElemento);
    // Depsue redireccionar
    window.location.href = '/pages/menu';
  }

  async traerColeccionInfo() {
    const graphQLQuery = `
      query GetSpecificCollections {
        collections(first: 100, query: "title:'OFERTAS' OR title:'PIZZAS' OR title:'HUT DAYS 2X1' OR title:'POLLO' OR title:'MELTS' OR title:'MITAD & MITAD' OR title:'PASTAS Y ENSALADAS' OR title:'GASEOSAS' OR title:'CERVEZAS' OR title:'POSTRES'") {
          edges {
            node {
              id
              title
              image {
                url
              }
            }
          }
        }
      }
    `;

    try {
      // Usar el servidor intermediario para la consulta a Shopify
      const respuesta = await fetch(window.urlConsulta, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': window.backendShopify,
        },
        body: JSON.stringify({
          query: graphQLQuery
        }),
      });

      if (!respuesta.ok) {
        throw new Error(`Error de red: ${respuesta.status} ${respuesta.statusText}`);
      }

      const datos = await respuesta.json();

      if (datos.errors) {
        console.error("Errores GraphQL:", datos.errors);
        return null;
      }

      if (datos.data?.collections?.edges?.length > 0) {
        // Procesar todas las colecciones
        const coleccionesShopify = datos.data.collections.edges.map(edge => ({
          id: edge.node.id,
          titulo: edge.node.title,
          imagen: edge.node.image ? edge.node.image.url : null
        }));

        // Combinar con this.categoriasConstruccion para añadir la categoría
        this.coleccionesProcesadas = coleccionesShopify.map(coleccion => {
          // Buscar la categoría correspondiente
          const categoriaInfo = this.categoriasConstruccion.find(
            cat => cat.titulo === coleccion.titulo
          );

          return {
            id: coleccion.id,
            titulo: coleccion.titulo,
            categoria: categoriaInfo ? categoriaInfo.categoria : "",
            imagen: coleccion.imagen
          };
        });

        // Añadir la categoría "TODO" que no está en Shopify
        const todoCategoria = this.categoriasConstruccion.find(cat => cat.titulo === "TODO");
        if (todoCategoria) {
          this.coleccionesProcesadas.unshift({
            id: "categoria-todo",
            titulo: "TODO",
            categoria: "",
            imagen: null
          });
        }

        return this.coleccionesProcesadas;
      } else {
        console.log("No se encontraron colecciones");
        return null;
      }
    } catch (error) {
      console.error("Error al obtener información de colecciones:", error);
      return null;
    }
  }

  async contruccionOpcionesMenu() {
    // MensajeCargaDatos.mostrar("Cargando informacion ...");
    await this.traerColeccionInfo();

    var contenidoHTML = '';
    this.coleccionesProcesadas.forEach((coleccion, index) => {
      if (index === 0) return;
      contenidoHTML += `
      <div
        data-menu="${coleccion.titulo}"
        class="h-menu-opciones-productos-item"
      >
        <div class="h-menu-producto-info-imagen">
        ${coleccion.imagen
          ? `<img src="${coleccion.imagen}" alt="${coleccion.titulo}" width="100" height="100">`
          : `<img src="${window.assets.imagen_aux}" alt="${coleccion.titulo}" width="100" height="100">`
        }
        </div>
        <div class="h-menu-producto-info-nombre">
          <p>${coleccion.titulo}</p>
        </div>
      </div>
      `;
    });
    this.menuContainerHeader.innerHTML = contenidoHTML;
    this.itemMenuDesplegable = this.querySelectorAll('.h-menu-opciones-productos-item');
    this.itemMenuDesplegable.forEach((elementoBase) => {
      elementoBase.addEventListener('click', this.reduccionarDesdeMenuDesplegable.bind(this, elementoBase));
    });
    this.verificarBotonesHeader();
    // MensajeCargaDatos.ocultar();
  }

  // Método para desplazar a la izquierda
  desplazarIzquierdaHeader() {
    console.log("Desplazando a la izquierda");
    console.log("Estado del contenedor:", {
      scrollLeft: this.menuContainerHeader.scrollLeft,
      clientWidth: this.menuContainerHeader.clientWidth,
      scrollWidth: this.menuContainerHeader.scrollWidth
    });

    // Verificar que el contenedor existe
    if (!this.menuContainerHeader) {
      console.error("Error: this.menuContainerHeader es undefined");
      return;
    }

    // Desplaza el contenedor
    this.menuContainerHeader.scrollBy({
      left: -this.cantidadDesplazamiento,
      behavior: 'smooth'
    });

    // Verificar los botones después del desplazamiento
    setTimeout(() => {
      this.verificarBotonesHeader();
      console.log("Después de desplazar a la izquierda:", {
        scrollLeft: this.menuContainerHeader.scrollLeft
      });
    }, 500);
  }
  // Método para desplazar a la derecha
  desplazarDerechaHeader() {
    console.log("Desplazando a la derecha");

    // Verifica que el contenedor existe
    if (!this.menuContainerHeader) {
      console.error("Error: this.menuContainerHeader es undefined");
      return;
    }

    // Desplaza el contenedor
    this.menuContainerHeader.scrollBy({
      left: this.cantidadDesplazamiento,
      behavior: 'smooth'
    });

    // Verifica los botones después del desplazamiento
    setTimeout(() => this.verificarBotonesHeader(), 300);
  }

  // Método para verificar la visibilidad de los botones
  verificarBotonesHeader() {
    // Verificar si el contenedor existe
    if (!this.menuContainerHeader) {
      console.error("Error: this.menuContainerHeader es undefined");
      return;
    }

    // Comprobar inicio
    if (this.menuContainerHeader.scrollLeft <= 0) {
      this.botonIzquierdaMenuHeader.style.opacity = "0.5";
      this.botonIzquierdaMenuHeader.style.pointerEvents = "none";
    } else {
      this.botonIzquierdaMenuHeader.style.opacity = "1";
      this.botonIzquierdaMenuHeader.style.pointerEvents = "auto";
    }

    // Comprobar final
    if (this.menuContainerHeader.scrollLeft + this.menuContainerHeader.clientWidth >= this.menuContainerHeader.scrollWidth - 10) {
      this.botonDerechaMenuHeader.style.opacity = "0.5";
      this.botonDerechaMenuHeader.style.pointerEvents = "none";
    } else {
      this.botonDerechaMenuHeader.style.opacity = "1";
      this.botonDerechaMenuHeader.style.pointerEvents = "auto";
    }
  }

}

customElements.define('header-principal', HeaderPrincipal);