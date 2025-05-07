class PageMenuProductos extends HTMLElement {
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

    // Conjunto para llevar control de colecciones ya procesadas
    this.coleccionesProcesadas = new Set();

    this.productosPorCategorias = null
    this.estadoVistaPagina = localStorage.getItem('phph-itemMenu') || "TODO";
  }

  connectedCallback() {
    // REFERENCIAS ELEMENTOS
    this.seccionGeneralPagina = this.querySelector('#phpm-seccion-general-page');
    this.menuContainer = this.querySelector('.phpm-items-menu');
    this.seccionesProductos = null;
    this.opcionesMenu = null;
    this.botonIzquierdaMenu = document.getElementById('phpm-btn-izquierda-menu');
    this.botonDerechaMenu = document.getElementById('phpm-btn-derecha-menu');


    this.cantidadDesplazamiento = 400;


    this.seccionTodoYOfertas = this.querySelector('#phpm-seccion-todo');
    this.seccionPizzas = this.querySelector('#phpm-seccion-pizzas');
    this.seccionPostresYGaseosas = this.querySelector('#phpm-seccion-postres');

    // EVENTOS INICIALIZAR
    // this.btnsAgregar.forEach((elementoBtnAgregar) => {
    //   elementoBtnAgregar.addEventListener('click', this.agregarCarrito.bind(this));
    // });

    // this.btnsPersonalizar.forEach((elementoBtnPersonalizar) => {
    //   elementoBtnPersonalizar.addEventListener('click', this.redireccionPersonalizar.bind(this, elementoBtnPersonalizar));
    // });


    // INICIALIZAR ELEMENTOS Y PROCESOS CLAVES
    // this.contenedorVariantes.forEach((elementoBase) => {
    //   elementoBase.classList.add('elemento-oculto');
    // });

    // Usa bind para mantener el contexto de 'this'
    this.botonIzquierdaMenu.addEventListener('click', this.desplazarIzquierda.bind(this));
    this.botonDerechaMenu.addEventListener('click', this.desplazarDerecha.bind(this));
    // Verificar botones al inicio

    // this.verificacionDataEnLocalStorage();
    this.contruccionPaginaInformacion();
  }

  async traerProductosyColeccionInfo(tituloColeccion) {
    const graphQLQuery = `
      query GetSpecificCollectionWithProducts($query: String!) {
        collections(
          first: 1,
          query: $query
        ) {
          edges {
            node {
              id
              title
              image {
                url
                altText
              }
              products(first: 100) {
                edges {
                  node {
                    id
                    handle
                    title
                    description
                    totalInventory
                    collections(first: 100) {
                      edges {
                        node {
                          title
                        }
                      }
                    }
                    images(first: 1) {
                      edges {
                        node {
                          url
                          altText
                        }
                      }
                    }
                    priceRange {
                      minVariantPrice {
                        amount
                        currencyCode
                      }
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
                    metafields(first: 100) {
                      edges {
                        node {
                          namespace
                          key
                          value
                          type
                          createdAt
                        }
                      }
                    }
                  }
                }
              }
              metafields(first: 100) {
                edges {
                  node {
                    namespace
                    key
                    value
                    type
                    createdAt
                  }
                }
              }
            }
          }
        }
      }
    `;

    const variables = {
      query: `title:'${tituloColeccion}'`
    };

    try {
      // Usar el servidor intermediario para la consulta a Shopify
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

      if (datos.errors) {
        console.error("Errores GraphQL:", datos.errors);
        return null;
      }

      if (datos.data?.collections?.edges?.length > 0) {
        return datos.data.collections.edges[0].node;
      } else {
        console.log(`No se encontró colección con título: ${tituloColeccion}`);
        return null;
      }
    } catch (error) {
      console.error(`Error al obtener información de colección ${tituloColeccion}:`, error);
      return null;
    }
  }

  procesarTodosMetafields(objeto) {
    const metafieldsMap = {};

    if (objeto.metafields && objeto.metafields.edges) {
      objeto.metafields.edges.forEach(metaEdge => {
        const meta = metaEdge.node;
        if (!metafieldsMap[meta.namespace]) {
          metafieldsMap[meta.namespace] = {};
        }
        metafieldsMap[meta.namespace][meta.key] = meta.value;
      });
    }

    return metafieldsMap;
  }

  async traerTodaInformacion() {
    const resultado = [];

    // Procesar cada categoría en la lista predefinida
    for (const categoria of this.categoriasConstruccion) {
      // Evitar procesar la misma colección más de una vez
      if (this.coleccionesProcesadas.has(categoria.titulo)) {
        continue;
      }

      // Marcar como procesada
      this.coleccionesProcesadas.add(categoria.titulo);

      // Obtener información de la colección y sus productos
      const coleccionInfo = await this.traerProductosyColeccionInfo(categoria.titulo);
      if (!coleccionInfo) {
        continue;
      }

      // Crear objeto de resultado para esta categoría
      const categoriaResultado = {
        id: coleccionInfo.id,
        titulo: coleccionInfo.title,
        imagen: coleccionInfo.image ? {
          url: coleccionInfo.image.url,
          altText: coleccionInfo.image.altText
        } : null,
        tipo: categoria.categoria,
        productos: [],
        metafields: this.procesarTodosMetafields(coleccionInfo),
        subColecciones: {}
      };

      // Procesar productos de la colección
      if (coleccionInfo.products && coleccionInfo.products.edges) {
        categoriaResultado.productos = coleccionInfo.products.edges.map(edge => {
          const producto = edge.node;

          // Procesar metafields del producto
          const metafieldsMap = this.procesarTodosMetafields(producto);

          // Obtener el inventario por sucursales
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

          return {
            id: producto.variants.edges[0].node.id.split('/').pop(),
            handle: producto.handle,
            descripcion: producto.description,
            titulo: producto.title,
            imagen: producto.images && producto.images.edges.length > 0
              ? producto.images.edges[0].node.url
              : null,
            precio: producto.priceRange.minVariantPrice.amount,
            moneda: producto.priceRange.minVariantPrice.currencyCode,
            varianteId: producto.variants.edges[0].node.id,
            colecciones: producto.collections.edges.map(edge => edge.node.title),
            stockTotal: producto.totalInventory,
            sucursales,
            metafields: metafieldsMap
          };
        });
      }

      // Procesar estructura de subcolecciones si es categoría "complejo"
      if (categoria.categoria === "complejo") {
        // console.log("Procesando subcolecciones para:", coleccionInfo.title);

        // Buscar metafields de estructura que contiene un array de strings con nombres de subcolecciones
        // Por ejemplo: ["Pizza Clasica","Pizza Supreme","Pizza Lovers"]
        const subcoleccionesMetafield = coleccionInfo.metafields?.edges?.find(
          edge => edge.node.namespace === "estructura" && edge.node.key === "json"
        );

        if (subcoleccionesMetafield) {
          try {
            // Parsing del array de nombres de subcolecciones
            const subcoleccionesArray = JSON.parse(subcoleccionesMetafield.node.value);
            // console.log("Subcolecciones encontradas:", subcoleccionesArray);

            // Procesar cada subcolección del array
            for (const subColeccionNombre of subcoleccionesArray) {
              // Obtener información de la subcolección
              const subColeccion = await this.traerProductosyColeccionInfo(subColeccionNombre);

              if (subColeccion) {
                // console.log("Procesando subcolección:", subColeccionNombre);

                // Agregar a la lista de subcolecciones
                categoriaResultado.subColecciones[subColeccionNombre] = {
                  titulo: subColeccion.title,
                  productos: [],
                  metafields: this.procesarTodosMetafields(subColeccion),
                  estructura: null
                };

                // Procesar productos de la subcolección
                if (subColeccion.products && subColeccion.products.edges) {
                  categoriaResultado.subColecciones[subColeccionNombre].productos =
                    subColeccion.products.edges.map(edge => {
                      const subProducto = edge.node;

                      // Obtener el inventario por sucursales
                      const sucursales = [];
                      if (subProducto.variants && subProducto.variants.edges.length > 0) {
                        const variante = subProducto.variants.edges[0].node;
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

                      return {
                        id: subProducto.variants.edges[0].node.id.split('/').pop(),
                        handle: subProducto.handle,
                        titulo: subProducto.title,
                        descripcion: subProducto.description,
                        imagen: subProducto.images && subProducto.images.edges.length > 0
                          ? subProducto.images.edges[0].node.url
                          : null,
                        precio: subProducto.priceRange.minVariantPrice.amount,
                        varianteId: subProducto.variants.edges[0].node.id,
                        stockTotal: subProducto.totalInventory,
                        sucursales,
                        colecciones: subProducto.collections.edges.map(edge => edge.node.title),
                        metafields: this.procesarTodosMetafields(subProducto)
                      };
                    });
                }

                // Ahora buscar el metafield de estructura de esta subcolección
                // Este metafield contiene la estructura de ramas como PCT, PCMB, etc.
                const estructuraSubcoleccion = this.procesarMetafieldsColeccion(subColeccion);

                if (estructuraSubcoleccion && estructuraSubcoleccion.ramas) {
                  // console.log("Estructura de ramas encontrada para", subColeccionNombre, ":", estructuraSubcoleccion);
                  categoriaResultado.subColecciones[subColeccionNombre].estructura = estructuraSubcoleccion;

                  // Para cada rama en la estructura, obtener información
                  for (const [codigoRama, infoRama] of Object.entries(estructuraSubcoleccion.ramas)) {
                    // Obtener información de la rama (PCT, por ejemplo)
                    const ramaColeccion = await this.traerProductosyColeccionInfo(codigoRama);

                    if (ramaColeccion) {
                      // console.log("Procesando rama:", codigoRama);

                      // Agregamos la información de la rama
                      if (!categoriaResultado.subColecciones[subColeccionNombre].ramas) {
                        categoriaResultado.subColecciones[subColeccionNombre].ramas = {};
                      }

                      categoriaResultado.subColecciones[subColeccionNombre].ramas[codigoRama] = {
                        titulo: infoRama.titulo,
                        min: infoRama.min,
                        max: infoRama.max,
                        metafields: this.procesarTodosMetafields(ramaColeccion),
                        productos: []
                      };


                      // Procesar productos de la rama
                      if (ramaColeccion.products && ramaColeccion.products.edges) {
                        categoriaResultado.subColecciones[subColeccionNombre].ramas[codigoRama].productos =
                          ramaColeccion.products.edges.map(edge => {
                            const ramaProducto = edge.node;

                            const sucursales = [];
                            if (ramaProducto.variants && ramaProducto.variants.edges.length > 0) {
                              const variante = ramaProducto.variants.edges[0].node;
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

                            return {
                              id: ramaProducto.variants.edges[0].node.id.split('/').pop(),
                              handle: ramaProducto.handle,
                              titulo: ramaProducto.title,
                              descripcion: ramaProducto.description,
                              imagen: ramaProducto.images && ramaProducto.images.edges.length > 0
                                ? ramaProducto.images.edges[0].node.url
                                : null,
                              precio: ramaProducto.priceRange.minVariantPrice.amount,
                              varianteId: ramaProducto.variants.edges[0].node.id,
                              stockTotal: ramaProducto.totalInventory,
                              sucursales,
                              colecciones: ramaProducto.collections.edges.map(edge => edge.node.title),
                              metafields: this.procesarTodosMetafields(ramaProducto)
                            };
                          });
                      }

                      // Procesar subramas anidadas si existen (PCMB, PCE, etc.)
                      if (infoRama.ramas) {
                        // console.log("Subramas encontradas para", codigoRama, ":", infoRama.ramas);
                        categoriaResultado.subColecciones[subColeccionNombre].ramas[codigoRama].subramas = {};

                        for (const [subRamaCode, subRamaInfo] of Object.entries(infoRama.ramas)) {
                          const subRamaColeccion = await this.traerProductosyColeccionInfo(subRamaCode);

                          if (subRamaColeccion) {
                            console.log("Procesando subrama:", subRamaCode);

                            categoriaResultado.subColecciones[subColeccionNombre].ramas[codigoRama].subramas[subRamaCode] = {
                              titulo: subRamaInfo.titulo,
                              min: subRamaInfo.min,
                              max: subRamaInfo.max,
                              metafields: this.procesarTodosMetafields(subRamaColeccion),
                              productos: []
                            };

                            // Procesar productos de la subrama
                            if (subRamaColeccion.products && subRamaColeccion.products.edges) {
                              categoriaResultado.subColecciones[subColeccionNombre].ramas[codigoRama].subramas[subRamaCode].productos =
                                subRamaColeccion.products.edges.map(edge => {
                                  const subRamaProducto = edge.node;

                                  const sucursales = [];
                                  if (subRamaProducto.variants && subRamaProducto.variants.edges.length > 0) {
                                    const variante = subRamaProducto.variants.edges[0].node;
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

                                  return {
                                    id: subRamaProducto.variants.edges[0].node.id.split('/').pop(),
                                    handle: subRamaProducto.handle,
                                    titulo: subRamaProducto.title,
                                    descripcion: subRamaProducto.description,
                                    imagen: subRamaProducto.images && subRamaProducto.images.edges.length > 0
                                      ? subRamaProducto.images.edges[0].node.url
                                      : null,
                                    precio: subRamaProducto.priceRange.minVariantPrice.amount,
                                    stockTotal: subRamaProducto.totalInventory,
                                    sucursales,
                                    varianteId: subRamaProducto.variants.edges[0].node.id,
                                    colecciones: subRamaProducto.collections.edges.map(edge => edge.node.title),
                                    metafields: this.procesarTodosMetafields(subRamaProducto)
                                  };
                                });
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          } catch (error) {
            console.error("Error al procesar subcolecciones:", error);
          }
        }
      }

      resultado.push(categoriaResultado);
    }

    return resultado;
  }

  procesarMetafieldsColeccion(coleccion) {
    if (!coleccion || !coleccion.metafields || !coleccion.metafields.edges) {
      return null;
    }

    // Buscar metafield específico que contiene la estructura
    const estructuraMetafield = coleccion.metafields.edges.find(
      edge => edge.node.namespace === "estructura" && edge.node.key === "json"
    );

    if (estructuraMetafield) {
      try {
        return JSON.parse(estructuraMetafield.node.value);
      } catch (error) {
        console.error("Error al parsear estructura JSON:", error);
        return null;
      }
    }

    return null;
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
      // Usar el servidor intermediario local
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

  async contruccionPaginaInformacion() {
    MensajeCargaDatos.mostrar('Cargando datos pagina ...');
    this.productosPorCategorias = await this.traerTodaInformacion()
    console.log("Construyendo la pagina de informacion", this.productosPorCategorias);
    this.contruccionCabeza();
    this.contruccionCuerpo();
    MensajeCargaDatos.ocultar();
  }

  contruccionCabeza() {
    var contenidoHTML = `
      <div data-categoria="TODO" class="page-menu-opcion">
              <div class="page-menu-opcion-nombre">
                ${window.shopIcons.icon_todas_opciones}
                <p>Ver Todo</p>
              </div>
      </div>
    `;
    this.productosPorCategorias.forEach((coleccion) => {
      contenidoHTML += `
        <div
        data-idshopify="${coleccion.id}"
        data-titulo="${coleccion.titulo}"
        data-categoria="${coleccion.titulo}" class="page-menu-opcion">
          <div class="page-menu-opcion-imagen">
           ${(coleccion.imagen && coleccion.imagen.url) ?
          `<img src="${coleccion.imagen.url}" alt="${coleccion.titulo}" width="100%" height="100%">` :
          `<img src="/assets/imagen-pizza-1.png" alt="${coleccion.titulo}" width="100%" height="100%">`
        }
          </div>
          <div class="page-menu-opcion-nombre">
            <p>${coleccion.titulo}</p>
          </div>
        </div>
      `;
    });
    this.menuContainer.innerHTML = contenidoHTML;
    this.opcionesMenu = this.querySelectorAll('.page-menu-opcion');
    this.opcionesMenu.forEach((elementoItemMenu) => {
      elementoItemMenu.addEventListener('click', this.seleccionItemMenu.bind(this, elementoItemMenu));
    });
    this.opcionesMenu.forEach((elementoItemMenu) => {
      if (this.estadoVistaPagina == elementoItemMenu.dataset.categoria) {
        elementoItemMenu.classList.add('seleccionado');
      } else {
        elementoItemMenu.classList.remove('seleccionado');
      }
    });
    this.verificarBotones();

    var contenidoHTMLSecciones = "";
    this.categoriasConstruccion.forEach((coleccion) => {
      contenidoHTMLSecciones += `
        <section 
        data-cargada="no"
        data-tiposeccion="${coleccion.titulo}" style="display: none;" id="phpm-seccion-trabajo" class="page-menu-container">
        </section>
      `;
    });
    this.seccionGeneralPagina.insertAdjacentHTML('beforeend', contenidoHTMLSecciones);
    this.seccionesProductos = this.querySelectorAll('#phpm-seccion-trabajo');
    this.seccionesProductos.forEach((elementoSeccion) => {
      if (this.estadoVistaPagina == elementoSeccion.dataset.tiposeccion) {
        elementoSeccion.style.display = "flex";
      } else {
        elementoSeccion.style.display = "none";
      }
    });
    console.log("Secciones de productos: ", this.opcionesMenu.length);
  }

  contruccionCuerpo() {
    const obtenerSeccion = this.querySelector(`[data-tiposeccion="${this.estadoVistaPagina}"]`);
    // console.log("Seccion de productos: ", obtenerSeccion);

    if (obtenerSeccion.dataset.cargada == "no") {
      var contenidoHTMLTodo = "";
      // Si nunca se acargado tons se va a cargar generando las peticiones 
      switch (this.estadoVistaPagina) {
        case "TODO":
          this.productosPorCategorias.forEach((coleccion) => {
            contenidoHTMLTodo += `
              <div class="phpm-titulo-primario">
                <small>${coleccion.titulo}</small>
              </div>
              <div class="phpm-seccion">
                <div class="phpm-items container-base">
            `;

            switch (coleccion.titulo) {
              case "OFERTAS":
              case "HUT DAYS 2X1":
              case "POLLO":
              case "MITAD & MITAD":
                coleccion.productos.forEach((producto) => {
                  const dataMetaFields = JSON.parse(producto.metafields.estructura.json);
                  contenidoHTMLTodo += `
                    <div data-idshopify="${producto.id}" data-idtrabajo="${dataMetaFields.id}" data-titulo="${producto.titulo}" data-precio="${producto.precio}" data-handle="${producto.handle}"
                      data-tipoproducto="desarrollado" class="producto-es-item">
                      <div class="producto-es-item-imagen">
                       ${producto.imagen
                      ? `<img src="${producto.imagen}" alt="${producto.titulo}" width="100%" height="100%">`
                      : `<img src="${window.assets.imagen_aux}" alt="${producto.titulo}" width="100%" height="100%">`
                    }
                      </div>
                      <div class="producto-es-item-detalle">
                        <div class="producto-es-item-info">
                          <h3>${producto.titulo}</h3>
                          <p>${producto.descripcion}</p>
                        </div>
                        <h3 class="color-letras-primary">${dataMetaFields.precio} BS</h3>
                        <button id="phpm-btn-personalizar" class="ph-btn-general  icon-color-secondary">
                          <p class="color-letras-secondary">PERSONALIZAR</p>
                        </button>
                      </div>
                    </div>
                  `;
                });
                break;
              case "PIZZAS":
                // Pizza Clasica - Pizza Supreme - Pizza Lovers
                Object.keys(coleccion.subColecciones).forEach((claveSubColeccion) => {
                  const subColeccion = coleccion.subColecciones[claveSubColeccion];
                  subColeccion.productos.forEach((productoSubColeccion) => {
                    const dataMetaFieldsProductoS = JSON.parse(productoSubColeccion.metafields.estructura.json);
                    // oBtengo el primero que son los tamanos PCT - PLT- PST
                    const productosTamano = Object.values(subColeccion.ramas)[0];
                    var contenidoVariantes = "";
                    var elementoSeleccionado;
                    contenidoVariantes += productosTamano.productos.map((productoTamano, index) => {
                      const dataMetaFields = JSON.parse(productoTamano.metafields.estructura[subColeccion.titulo.toLowerCase()]);

                      // Determinar si este es el primer elemento
                      const esSeleccionado = index === 0 ? "seleccionado" : "";
                      if (index === 0) {
                        elementoSeleccionado = productoTamano;
                      }

                      return `<div 
                              data-idshopify="${productoTamano.id}"
                              data-idtrabajo="${dataMetaFields.id}"
                              data-handle="${productoTamano.handle}"
                              data-titulo="${productoTamano.titulo}"
                              data-precio="${productoTamano.precio}"
                              class="variante-producto-item ${esSeleccionado}">
                                <p>${this.acortarTitulo(productoTamano.titulo)}</p>
                                <p class="color-letras-primary">${parseInt(dataMetaFieldsProductoS.precio) + (parseInt(dataMetaFields.precio))} BS</p>
                              </div>
                      `;
                    }).join("");
                    contenidoHTMLTodo += `
                        <div 
                        data-idshopify="${productoSubColeccion.id}"
                        data-idtrabajo="${dataMetaFieldsProductoS.id}"
                        data-handle="${productoSubColeccion.handle}"
                        data-titulo="${productoSubColeccion.titulo}"
                        data-precio="${productoSubColeccion.precio}"
                        data-seleccionado="${elementoSeleccionado.id}"
                        data-tipoproducto="complejo" class="producto-es-item">
                          <div class="producto-es-item-imagen">
                            ${productoSubColeccion.imagen
                        ? `<img src="${productoSubColeccion.imagen}" alt="${productoSubColeccion.titulo}" width="100%" height="100%">`
                        : `<img src="${window.assets.imagen_aux}" alt="${productoSubColeccion.titulo}" width="100%" height="100%">`
                      }
                          </div>
                          <div class="producto-es-item-detalle">
                            <div class="producto-es-item-info">
                              <h3>${productoSubColeccion.titulo}</h3>
                              <p>${productoSubColeccion.descripcion}</p>
                            </div>
                            <h3 class="color-letras-primary">${dataMetaFieldsProductoS.precio} BS</h3>
                            <div id="phpm-general-variantes" class="phpg-svpg-pcl seleccion-variante-producto-general">
                              <p>Tamaño</p>
                              <button id="phpm-view-variantes" class="container-info-variante">
                                <p id="phpm-variante-seleccionado">${this.acortarTitulo(productosTamano.productos[0].titulo)}</p>
                                <div class="icono-dropdown-variantes icon-color-tertiary">
                                  ${window.shopIcons.icon_flecha_abajo}
                                </div>
                              </button>
                              <div id="phpm-items-variantes" class="variantes-producto elemento-oculto">
                              ${contenidoVariantes}`;
                    contenidoHTMLTodo += `
                              </div>
                            </div>
                            <button id="phpm-btn-personalizar" class="ph-btn-general  phpm-btn-personalizar ">
                              <p class="color-letras-secondary">PERSONALIZAR</p>
                            </button>
                          </div>
                    </div>
                  `;
                  });
                });
                break;
              case "MELTS":
              case "PASTAS Y ENSALADAS":
              case "GASEOSAS":
              case "CERVEZAS":
              case "POSTRES":
                coleccion.productos.forEach((producto) => {
                  const dataMetaFields = JSON.parse(producto.metafields.estructura.json);
                  contenidoHTMLTodo += `
                    <div data-idshopify="${producto.id}" data-idtrabajo="${dataMetaFields.id}" data-titulo="${producto.titulo}" data-precio="${producto.precio}" data-handle="${producto.handle}"
                      data-tipoproducto="basico" class="producto-es-item">
                      <div class="producto-es-item-imagen">
                      ${producto.imagen
                      ? `<img src="${producto.imagen}" alt="${producto.titulo}" width="100%" height="100%">`
                      : `<img src="${window.assets.imagen_aux}" alt="${producto.titulo}" width="100%" height="100%">`
                    }
                      </div>
                      <div class="producto-es-item-detalle">
                        <div class="producto-item-info-es-basico">
                          <h3>${producto.titulo}</h3>
                        </div>
                        <h3 class="color-letras-primary">${dataMetaFields.precio} BS</h3>
                        <button id="phpm-btn-agregar" class="ph-btn-general  icon-color-secondary">
                           ${window.shopIcons.icon_carrito}
                          <p class="color-letras-secondary">AGREGAR</p>
                        </button>
                      </div>
                    </div>
                  `;
                });
                break;
              default:
                console.log("No se encontró la colección");
                break;
            }

            contenidoHTMLTodo += `
                </div>
              </div>
            `;
          });
          // Declarar elementos basicos para productos ya sea seleccion (Tamano )
          break;
        case "OFERTAS":
        case "MITAD & MITAD":
        case "POLLO":
        case "HUT DAYS 2X1":
          var coleccionTrabajo = this.productosPorCategorias.find((coleccion) => coleccion.titulo == this.estadoVistaPagina);
          contenidoHTMLTodo += `
              <div class="phpm-titulo-primario">
                <small>${coleccionTrabajo.titulo}</small>
              </div>
              <div class="phpm-seccion">
                <div class="phpm-items container-base">
            `;

          coleccionTrabajo.productos.forEach((producto) => {
            const dataMetaFields = JSON.parse(producto.metafields.estructura.json);
            contenidoHTMLTodo += `
                <div data-idshopify="${producto.id}" data-idtrabajo="${dataMetaFields.id}" data-titulo="${producto.titulo}" data-precio="${producto.precio}" data-handle="${producto.handle}"
                  data-tipoproducto="desarrollado" class="producto-es-item">
                  <div class="producto-es-item-imagen">
                   ${producto.imagen
                ? `<img src="${producto.imagen}" alt="${producto.titulo}" width="100%" height="100%">`
                : `<img src="${window.assets.imagen_aux}" alt="${producto.titulo}" width="100%" height="100%">`
              }
                  </div>
                  <div class="producto-es-item-detalle">
                    <div class="producto-es-item-info">
                      <h3>${producto.titulo}</h3>
                      <p>${producto.descripcion}</p>
                    </div>
                    <h3 class="color-letras-primary">${dataMetaFields.precio} BS</h3>
                    <button id="phpm-btn-personalizar" class="ph-btn-general  icon-color-secondary">
                      <p class="color-letras-secondary">PERSONALIZAR</p>
                    </button>
                  </div>
                </div>
              `;
          });

          contenidoHTMLTodo += `
                </div>
              </div>
            `;

          break;
        case "PIZZAS":
          contenidoHTMLTodo += `
            <div class="phpm-titulo-primario">
              <small>PIZZAS</small>
            </div>
          `;
          var coleccionTrabajo = this.productosPorCategorias.find((coleccion) => coleccion.titulo == this.estadoVistaPagina);
          var coleccionesSubColeccion = JSON.parse(coleccionTrabajo.metafields.estructura.json);

          // ["Pizza Clasica","Pizza Supreme","Pizza Lovers"]
          coleccionesSubColeccion.forEach((subColeccion) => {
            // Verificar si la subcolección existe en coleccionTrabajo
            if (!coleccionTrabajo.subColecciones[subColeccion]) {
              return; // Saltar esta iteración
            }

            // Verificacion si esta vacio o tiene productos para trabajar
            const subProductosTrabajo = coleccionTrabajo.subColecciones[subColeccion].productos;


            if (subProductosTrabajo.length == 0) return;
            contenidoHTMLTodo += `
              <div class="phpm-seccion">
                <div class="phpm-titulo-secundario">
                  <h1 class="color-letras-primary">${subColeccion.split(" ")[1] || ""}</h1>
                </div>
                <div class="container-productos-general container-base">
            `;

            subProductosTrabajo.forEach((productoSubColeccion) => {
              const dataMetaFieldsProductoS = JSON.parse(productoSubColeccion.metafields.estructura.json);
              // oBtengo el primero que son los tamanos PCT - PLT- PST
              // const productosTamano = Object.values(subColeccion.ramas)[0];
              const productosTamano = Object.values(coleccionTrabajo.subColecciones[subColeccion].ramas)[0];
              var contenidoVariantes = "";
              var elementoSeleccionado;
              contenidoVariantes += productosTamano.productos.map((productoTamano, index) => {
                const dataMetaFields = JSON.parse(productoTamano.metafields.estructura[subColeccion.toLowerCase()]);

                // Determinar si este es el primer elemento
                const esSeleccionado = index === 0 ? "seleccionado" : "";
                if (index === 0) {
                  elementoSeleccionado = productoTamano;
                }

                return `<div 
                  data-idshopify="${productoTamano.id}"
                  data-idtrabajo="${dataMetaFieldsProductoS.id}"
                  data-handle="${productoTamano.handle}"
                  data-titulo="${productoTamano.titulo}"
                  data-precio="${productoTamano.precio}"
                  class="variante-producto-item ${esSeleccionado}">
                    <p>${this.acortarTitulo(productoTamano.titulo)}</p>
                    <p class="color-letras-primary">${parseInt(dataMetaFieldsProductoS.precio) + (parseInt(dataMetaFields.precio))} BS</p>
                  </div>
                      `;
              }).join("");

              contenidoHTMLTodo += `
                        <div 
                        data-idshopify="${productoSubColeccion.id}"
                        data-idtrabajo="${dataMetaFieldsProductoS.id}"
                        data-handle="${productoSubColeccion.handle}"
                        data-titulo="${productoSubColeccion.titulo}"
                        data-precio="${productoSubColeccion.precio}"
                        data-seleccionado="${elementoSeleccionado.id}"
                        data-tipoproducto="complejo" class="producto-es-item">
                          <div class="producto-es-item-imagen">
                            ${productoSubColeccion.imagen
                  ? `<img src="${productoSubColeccion.imagen}" alt="${productoSubColeccion.titulo}" width="100%" height="100%">`
                  : `<img src="${window.assets.imagen_aux}" alt="${productoSubColeccion.titulo}" width="100%" height="100%">`
                }
                          </div>
                          <div class="producto-es-item-detalle">
                            <div class="producto-es-item-info">
                              <h3>${productoSubColeccion.titulo}</h3>
                              <p>${productoSubColeccion.descripcion}</p>
                            </div>
                            <h3 class="color-letras-primary">${parseInt(dataMetaFieldsProductoS.precio)} BS</h3>
                            <div id="phpm-general-variantes" class="phpg-svpg-pcl seleccion-variante-producto-general">
                              <p>Tamaño</p>
                              <button id="phpm-view-variantes" class="container-info-variante">
                                <p id="phpm-variante-seleccionado">${this.acortarTitulo(productosTamano.productos[0].titulo)}</p>
                                <div class="icono-dropdown-variantes icon-color-tertiary">
                                  ${window.shopIcons.icon_flecha_abajo}
                                </div>
                              </button>
                              <div id="phpm-items-variantes" class="variantes-producto elemento-oculto">
                              ${contenidoVariantes}
                                `;

              contenidoHTMLTodo += `
                              </div>
                            </div>
                            <button id="phpm-btn-personalizar" class="ph-btn-general  phpm-btn-personalizar ">
                              <p class="color-letras-secondary">PERSONALIZAR</p>
                            </button>
                          </div>
                    </div>
                  `;
            });

            contenidoHTMLTodo += `
                </div>
              </div>
            `;
          });

          break;
        case "MELTS":
        case "PASTAS Y ENSALADAS":
        case "GASEOSAS":
        case "CERVEZAS":
        case "POSTRES":
          var coleccionTrabajo = this.productosPorCategorias.find((coleccion) => coleccion.titulo == this.estadoVistaPagina);
          contenidoHTMLTodo += `
              <div class="phpm-titulo-primario">
                <small>${coleccionTrabajo.titulo}</small>
              </div>
              <div class="phpm-seccion">
                <div class="phpm-items container-base">
            `;

          coleccionTrabajo.productos.forEach((producto) => {
            const dataMetaFields = JSON.parse(producto.metafields.estructura.json);
            contenidoHTMLTodo += `
                <div data-idshopify="${producto.id}" data-idtrabajo="${dataMetaFields.id}" data-titulo="${producto.titulo}" data-precio="${producto.precio}" data-handle="${producto.handle}"
                  data-tipoproducto="basico" class="producto-es-item">
                  <div class="producto-es-item-imagen">
                  ${producto.imagen
                ? `<img src="${producto.imagen}" alt="${producto.titulo}" width="100%" height="100%">`
                : `<img src="${window.assets.imagen_aux}" alt="${producto.titulo}" width="100%" height="100%">`
              }
                  </div>
                  <div class="producto-es-item-detalle">
                    <div class="producto-item-info-es-basico">
                      <h3>${producto.titulo}</h3>
                    </div>
                    <h3 class="color-letras-primary">${dataMetaFields.precio} BS</h3>
                    <button id="phpm-btn-agregar" class="ph-btn-general  icon-color-secondary">
                       ${window.shopIcons.icon_carrito}
                      <p class="color-letras-secondary">AGREGAR</p>
                    </button>
                  </div>
                </div>
              `;
          });

          contenidoHTMLTodo += `
                </div>
              </div>
            `;

          break;
        default:
          console.log("No se encontró la colección");
          break;
      }
      obtenerSeccion.innerHTML = contenidoHTMLTodo;
      obtenerSeccion.dataset.cargada = "si";
      this.seccionesProductos.forEach((elementoSeccion) => {
        if (elementoSeccion.dataset.tiposeccion == this.estadoVistaPagina) {
          elementoSeccion.style.display = "flex";
        } else {
          elementoSeccion.style.display = "none";
        }
      });
      contenidoHTMLTodo = "";
    } else {
      // Si ya se acargado la seccion tons solo se va a mostrar
      this.seccionesProductos.forEach((elementoSeccion) => {
        if (elementoSeccion.dataset.tiposeccion == this.estadoVistaPagina) {
          elementoSeccion.style.display = "flex";
        } else {
          elementoSeccion.style.display = "none";
        }
      });
    }
    this.inicializarEventosYElementosSeccion();
  }

  inicializarEventosYElementosSeccion() {
    switch (this.estadoVistaPagina) {
      case "TODO":
        // REFERENCIAS ELEMENTOS
        // Contenedor es un button donde se refleja la variante seleccionada de la pizza
        this.contenedorVarianteSeleccionado = this.querySelectorAll('#phpm-view-variantes');
        // Contenedor donde se muestra todas las variantes
        this.contenedorVariantes = this.querySelectorAll('#phpm-items-variantes');
        // Dentro del contenedor de variantes tiene elementos hijos (son las variantes de esa pizza)
        this.varianteElemento = this.querySelectorAll('.variante-producto-item');
        this.btnsPersonalizarProducto = this.querySelectorAll('#phpm-btn-personalizar');

        // INICIALIZACION DE EVENTOS
        this.btnsPersonalizarProducto.forEach((elementoBase) => {
          elementoBase.addEventListener('click', this.procesoPersonalizarProducto.bind(this, elementoBase));
        });
        this.contenedorVarianteSeleccionado.forEach((elementoBase) => {
          elementoBase.addEventListener('click', this.mostrarYOcultarContenedorVariantes.bind(this, elementoBase));
        });
        this.varianteElemento.forEach((elementoBase) => {
          elementoBase.addEventListener('click', this.procesoVarianteSeleccionada.bind(this, elementoBase));
        });

        this.btnsAgregarProducto = this.querySelectorAll('#phpm-btn-agregar');
        this.btnsAgregarProducto.forEach((elementoBase) => {
          elementoBase.addEventListener('click', this.procesoAgregarProducto.bind(this, elementoBase));
        });

        document.addEventListener('click', this.clicksEspeciales.bind(this));

        break;
      case "OFERTAS":
      case "HUT DAYS 2X1":
      case "POLLO":
      case "MITAD & MITAD":
        this.btnsPersonalizarProducto = this.querySelectorAll('#phpm-btn-personalizar');
        this.btnsPersonalizarProducto.forEach((elementoBase) => {
          elementoBase.addEventListener('click', this.procesoPersonalizarProducto.bind(this, elementoBase));
        });
        break;
      case "PIZZAS":
        // REFERENCIAS ELEMENTOS
        // Contenedor es un button donde se refleja la variante seleccionada de la pizza
        this.contenedorVarianteSeleccionado = this.querySelectorAll('#phpm-view-variantes');
        // Contenedor donde se muestra todas las variantes
        this.contenedorVariantes = this.querySelectorAll('#phpm-items-variantes');
        // Dentro del contenedor de variantes tiene elementos hijos (son las variantes de esa pizza)
        this.varianteElemento = this.querySelectorAll('.variante-producto-item');
        this.btnsPersonalizarProducto = this.querySelectorAll('#phpm-btn-personalizar');

        // INICIALIZACION DE EVENTOS
        this.btnsPersonalizarProducto.forEach((elementoBase) => {
          elementoBase.addEventListener('click', this.procesoPersonalizarProducto.bind(this, elementoBase));
        });
        this.contenedorVarianteSeleccionado.forEach((elementoBase) => {
          elementoBase.addEventListener('click', this.mostrarYOcultarContenedorVariantes.bind(this, elementoBase));
        });
        this.varianteElemento.forEach((elementoBase) => {
          elementoBase.addEventListener('click', this.procesoVarianteSeleccionada.bind(this, elementoBase));
        });

        document.addEventListener('click', this.clicksEspeciales.bind(this));

        break;
      case "MELTS":
      case "PASTAS Y ENSALADAS":
      case "GASEOSAS":
      case "CERVEZAS":
      case "POSTRES":
        this.btnsAgregarProducto = this.querySelectorAll('#phpm-btn-agregar');
        this.btnsAgregarProducto.forEach((elementoBase) => {
          elementoBase.addEventListener('click', this.procesoAgregarProducto.bind(this, elementoBase));
        });
        break;
      default:
        console.log("No se encontró la colección");
        break;
    }
  }

  clicksEspeciales(event) {
    // Si el click es en algun elemento con id="phpm-view-variantes" no hace nada y se sale
    let clickEnContenedorVariante = false;
    this.contenedorVarianteSeleccionado.forEach((elementoBase) => {
      if (elementoBase.contains(event.target)) {
        clickEnContenedorVariante = true;
      }
    });

    if (clickEnContenedorVariante) {
      return;
    }

    // Si el elemento clickeado no es en el contenedor id="phpm-items-variantes" tons cierra a todos
    this.contenedorVariantes.forEach((elementoBase) => {
      if (!elementoBase.contains(event.target)) {
        // {% comment %} elementoBase.style.display = "none"; // Oculto {% endcomment %}
        elementoBase.classList.remove('elemento-visible');
        elementoBase.classList.add('elemento-oculto');
      }
    });
  }

  verificacionDataEnLocalStorage() {
    // Verificar si hay un valor en el localStorage
    const dataLocalStorage = localStorage.getItem('phph-itemMenu') || "todo";

    console.log("Data Local Storage: ", dataLocalStorage);

    // Mostrar la sección correspondiente según el valor en localStorage
    if (dataLocalStorage == "pizzas") {
      this.seccionTodoYOfertas.style.display = "none";
      this.seccionPizzas.style.display = "flex";
      this.seccionPostresYGaseosas.style.display = "none";
    } else if (dataLocalStorage == "postres" || dataLocalStorage == "gaseosas y cervezas") {
      this.seccionTodoYOfertas.style.display = "none";
      this.seccionPizzas.style.display = "none";
      this.seccionPostresYGaseosas.style.display = "flex";
    } else if (dataLocalStorage == "todo" || dataLocalStorage == "ofertas") {
      this.seccionTodoYOfertas.style.display = "flex";
      this.seccionPizzas.style.display = "none";
      this.seccionPostresYGaseosas.style.display = "none";
    }

    // Quitar selección de todos los elementos
    this.opcionesMenu.forEach((elementoItemMenu) => {
      elementoItemMenu.classList.remove('seleccionado');
    });

    // Encontrar y seleccionar el elemento que coincide con el valor del localStorage
    let elementoSeleccionado = null;

    this.opcionesMenu.forEach((elementoItemMenu) => {
      const dataPadre = elementoItemMenu.getAttribute('categoria');

      if (dataPadre == dataLocalStorage) {
        elementoItemMenu.classList.add('seleccionado');
        elementoSeleccionado = elementoItemMenu;
      }
    });

    // Si encontramos el elemento seleccionado, hacemos scroll hacia él
    if (elementoSeleccionado) {
      // Retrasamos ligeramente el scroll para asegurar que los elementos ya se han renderizado
      setTimeout(() => {
        // Calculamos la posición para centrar el elemento en el contenedor
        const contenedor = document.querySelector('.phpm-items-menu');
        const offsetLeft = elementoSeleccionado.offsetLeft;
        const elementoWidth = elementoSeleccionado.offsetWidth;
        const contenedorWidth = contenedor.offsetWidth;

        // Scroll hacia el elemento seleccionado centrándolo en el viewport
        contenedor.scrollLeft = offsetLeft - (contenedorWidth / 2) + (elementoWidth / 2);
      }, 100);
    }
  }

  seleccionItemMenu(elementoBase) {
    // TODO - OFERTAS - PIZZAS - POSTRES etc.
    const dataSeccion = elementoBase.dataset.categoria;
    this.estadoVistaPagina = dataSeccion;
    this.opcionesMenu.forEach((elementoItemMenu) => {
      if (elementoItemMenu == elementoBase) {
        elementoItemMenu.classList.add('seleccionado');
      } else {
        elementoItemMenu.classList.remove('seleccionado');
      }
    });
    this.contruccionCuerpo();
    // Guardar el estado en localStorage para persistencia
    localStorage.setItem('phph-itemMenu', dataSeccion);
  }

  agregarCarrito() {
    AuxiliaresGlobal.agregarCarrito(1);
    console.log("Agregado al carrito");
  }

  acortarTitulo(titulo) {
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
  }

  // Método para desplazar a la izquierda
  desplazarIzquierda() {
    console.log("Desplazando a la izquierda");

    // Verifica que el contenedor existe
    if (!this.menuContainer) {
      console.error("Error: this.menuContainer es undefined");
      return;
    }

    // Desplaza el contenedor
    this.menuContainer.scrollBy({
      left: -this.cantidadDesplazamiento,
      behavior: 'smooth'
    });

    // Verifica los botones después del desplazamiento
    setTimeout(() => this.verificarBotones(), 300);
  }

  // Método para desplazar a la derecha
  desplazarDerecha() {
    console.log("Desplazando a la derecha");

    // Verifica que el contenedor existe
    if (!this.menuContainer) {
      console.error("Error: this.menuContainer es undefined");
      return;
    }

    // Desplaza el contenedor
    this.menuContainer.scrollBy({
      left: this.cantidadDesplazamiento,
      behavior: 'smooth'
    });

    // Verifica los botones después del desplazamiento
    setTimeout(() => this.verificarBotones(), 300);
  }

  // Método para verificar la visibilidad de los botones
  verificarBotones() {
    // Verificar si el contenedor existe
    if (!this.menuContainer) {
      console.error("Error: this.menuContainer es undefined");
      return;
    }

    // console.log("Verificando botones");
    // console.log("scrollLeft:", this.menuContainer.scrollLeft);
    // console.log("clientWidth:", this.menuContainer.clientWidth);
    // console.log("scrollWidth:", this.menuContainer.scrollWidth);

    // Comprobar inicio
    if (this.menuContainer.scrollLeft <= 0) {
      this.botonIzquierdaMenu.style.opacity = "0.5";
      this.botonIzquierdaMenu.style.pointerEvents = "none";
    } else {
      this.botonIzquierdaMenu.style.opacity = "1";
      this.botonIzquierdaMenu.style.pointerEvents = "auto";
    }

    // Comprobar final
    if (this.menuContainer.scrollLeft + this.menuContainer.clientWidth >= this.menuContainer.scrollWidth - 10) {
      this.botonDerechaMenu.style.opacity = "0.5";
      this.botonDerechaMenu.style.pointerEvents = "none";
    } else {
      this.botonDerechaMenu.style.opacity = "1";
      this.botonDerechaMenu.style.pointerEvents = "auto";
    }
  }

  procesoPersonalizarProducto(elementoBase) {
    var productoTrabajo = null;
    var idShopify = elementoBase.closest('.producto-es-item').dataset.idshopify;
    var idTrabajo = idTrabajo = elementoBase.closest('.producto-es-item').dataset.idtrabajo;
    var handle = elementoBase.closest('.producto-es-item').dataset.handle;
    var tipoProducto = elementoBase.closest('.producto-es-item').dataset.tipoproducto;
    const coleccionBaseTrabajo = this.productosPorCategorias.find((coleccion) => coleccion.titulo == this.estadoVistaPagina);
    switch (this.estadoVistaPagina) {
      case "TODO":
        switch (tipoProducto) {
          case "basico":
          case "desarrollado":
            // idShopify = elementoBase.closest('.producto-es-item').dataset.idshopify;
            // idTrabajo = elementoBase.closest('.producto-es-item').dataset.idtrabajo;
            // handle = elementoBase.closest('.producto-es-item').dataset.handle;
            productoTrabajo = coleccionBaseTrabajo.productos.find((producto) => producto.id == idShopify);
            localStorage.setItem('phpp-productoData', JSON.stringify(
              {
                "producto": {
                  idShopify,
                  idTrabajo,
                  handle,
                  titulo: productoTrabajo.titulo,
                  descripcion: productoTrabajo.descripcion,
                  imagen: productoTrabajo.imagen,
                  precio: JSON.parse(productoTrabajo.metafields.estructura.json).precio,
                  stockTotal: productoTrabajo.stockTotal,
                  sucursales: productoTrabajo.sucursales
                },
                "estructura": null,
                "productoParaEstructuraTrabajo": JSON.parse(productoTrabajo.metafields.estructura.json),
                "subProductoSeleccionado": null
              }
            ));
            break;
          case "complejo":
            break;
          default:
            console.log("No se encontró la colección");
            break;
        }
        break;
      case "HUT DAYS 2X1":
      case "POLLO":
      case "MITAD & MITAD":
      case "OFERTAS":
      case "MELTS":
      case "PASTAS Y ENSALADAS":
      case "GASEOSAS":
      case "CERVEZAS":
      case "POSTRES":
        // idShopify = elementoBase.closest('.producto-es-item').dataset.idshopify;
        // idTrabajo = elementoBase.closest('.producto-es-item').dataset.idtrabajo;
        // handle = elementoBase.closest('.producto-es-item').dataset.handle;
        productoTrabajo = coleccionBaseTrabajo.productos.find((producto) => producto.id == idShopify);
        localStorage.setItem('phpp-productoData', JSON.stringify(
          {
            "producto": {
              idShopify,
              idTrabajo,
              handle,
              titulo: productoTrabajo.titulo,
              descripcion: productoTrabajo.descripcion,
              imagen: productoTrabajo.imagen,
              precio: JSON.parse(productoTrabajo.metafields.estructura.json).precio,
              stockTotal: productoTrabajo.stockTotal,
              sucursales: productoTrabajo.sucursales
            },
            "estructura": null,
            "productoParaEstructuraTrabajo": JSON.parse(productoTrabajo.metafields.estructura.json),
            "subProductoSeleccionado": null
          }
        ));
        break;
      case "PIZZAS":
        // Primero se va buscar el producto en la coleccion Pizzas al hacer eso lo va encontrar 
        break;
      default:
        console.log("No se encontró la colección");
        break;
    }
    localStorage.setItem('phpp-tipo-producto', tipoProducto);

    // window.location.href = "/pages/producto";
  }

  procesoAgregarProducto(elementoBase) {
    switch (this.estadoVistaPagina) {
      case "TODO":
      case "OFERTAS":
      case "HUT DAYS 2X1":
      case "POLLO":
      case "MITAD & MITAD":
      case "PIZZAS":
      case "MELTS":
      case "PASTAS Y ENSALADAS":
      case "GASEOSAS":
      case "CERVEZAS":
      case "POSTRES":
      default:
        console.log("No se encontró la colección");
        break;
    }
  }

  mostrarYOcultarContenedorVariantes(elementoBase) {
    // Busco al elemento Padre
    const elementoPadre = elementoBase.closest('#phpm-general-variantes');
    // Busco a su hermano
    const hermano = elementoPadre.querySelector('#phpm-items-variantes');

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

  procesoVarianteSeleccionada(elementoBase) {
    //
    // Es el que tiene la class="producto-es-item"
    const elementoPadreGeneral = elementoBase.closest('.producto-es-item');
    // Busco dentro del elemento al la primer etiqueta <p> y obtengo su valor ya que tenog 3 etiqueta p
    const primerP = elementoBase.querySelectorAll('p')[0];
    // Busco al elemento Padre General con id="phpm-general-variantes"
    const padreGeneral = elementoBase.closest('#phpm-general-variantes');
    // Busco al hijo de Padre con id="phpm-view-variantes"
    const hijo = padreGeneral.querySelector('#phpm-view-variantes');
    // El hijo tiene otro hijo que es una etiqueta p con id="phpm-variante-seleccionado"
    const hijoP = hijo.querySelector('#phpm-variante-seleccionado');
    hijoP.innerHTML = primerP.innerHTML; // Cambiamos el valor de la etiqueta p

    console.log('Testeo de variante seleccionada', {
      "testeo1": elementoBase.dataset.idshopify,
    });
    // Se edita el valor del atributo data-seleccionado del padre general
    elementoPadreGeneral.dataset.seleccionado = elementoBase.dataset.idshopify;

    // Se procede a agregar clase seleccionado a elementoBase y se lo quita a los demas si es que lo llevan
    const hermanos = elementoPadreGeneral.querySelectorAll('.variante-producto-item');
    hermanos.forEach((hermano) => {
      if (hermano !== elementoBase) {
        hermano.classList.remove('seleccionado');
      } else {
        hermano.classList.add('seleccionado');
      }
    });

    // Busco al elemento Padre id="phpm-items-variantes"
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

customElements.define('page-menu-productos', PageMenuProductos);