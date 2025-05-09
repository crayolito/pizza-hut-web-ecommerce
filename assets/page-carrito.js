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
      console.log('Información del carrito:', this.dataCarrito);

      let contenidoIzquierdoHTML = '';
      let precioTotal = 0;

      infoCarrito.informacionCompleta.items.forEach((item) => {
        if (!(item.properties && item.properties.estructura)) {
          return;
        }

        const dataContruccion = JSON.parse(item.properties.estructura);
        precioTotal += parseInt(dataContruccion.producto.precioTotalConjunto) * parseInt(item.quantity);
        // 
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
                  <h2 class="color-letras-extra">Bs. ${parseInt(dataContruccion.producto.precioTotalConjunto) * parseInt(item.quantity)}</h2>
                  <div 
                  style="display: none;"
                  class="pcph-itemc_editar">
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
                  ${dataContruccion.complementos.productos.length > 0
            ? `<p>${dataContruccion.complementos.titulo}</p>
                          <ul class="color-letras-extra">`
            : ''
          }
  
          `;

        dataContruccion.complementos.productos.forEach((producto) => {
          contenidoIzquierdoHTML += `
                <li>
                  <p>${"x" + producto.cantidad + " " + producto.tituloSeccion} : <br> ${producto.titulo}</p>
                </li>
            `;
        });

        contenidoIzquierdoHTML += `
                  ${dataContruccion.complementos.productos.length > 0
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
    const { informacionColeccion, productosColeccion } = await this.traerProductoAcompanamiento();
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

  async actualizarProductoCarrito(btnElemento) {
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

    if (accionBtn == "decrementar" && dataPeticion == "eliminar") {
      // Se procede a eliminar del carrito
      MensajeCargaDatos.mostrar('Eliminando producto del carrito...');
      await AuxiliaresGlobal.eliminarItemCarritoPorKey(keyCarrito, 0);
    } else {
      // accionBtn == "incrementar" ? cantidadElemento++ : cantidadElemento--;
      var cantidadNuevaTrabajo = cantidadElemento;
      var cantidadAntiguaTrabajo = accionBtn == "incrementar" ? cantidadElemento - 1 : cantidadElemento + 1;

      console.log("Testeo de cantidadElemento", {
        cantidadElemento,
        cantidadAntiguaTrabajo,
        cantidadNuevaTrabajo,
      });

      if (informacionCompleta.opcionesPrincipales.productos.length == 0 && informacionCompleta.complementos.productos.length == 0) {
        informacionCompleta.producto.cantidad = cantidadElemento;
        // informacionCompleta.producto.precioTotalConjunto = informacionCompleta.producto.precio * cantidadElemento;
      } else {
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
          cantidadOpcionesPrincipalesNueva += (cantidadNuevaTrabajo * parseInt(producto.precio));
          cantidadOpcionesPrincipalesAntiguo += (cantidadAntiguaTrabajo * parseInt(producto.precio));
          producto.cantidad = cantidadNuevaTrabajo;
        });
        let cantidadSolamenteComplementos = cantidadPrecioTotalAntiguo - (cantidadProductoBaseAntiguo + cantidadOpcionesPrincipalesAntiguo);

        // Ell nuevo precio del conjunto se calcula (cantidadProductoBaseNuevo + cantidadOpcionesPrincipalesNueva + cantidadSolamenteComplementos)
        informacionCompleta.producto.cantidad = cantidadElemento;
        // informacionCompleta.producto.precioTotalConjunto = cantidadProductoBaseNuevo + cantidadOpcionesPrincipalesNueva + cantidadSolamenteComplementos;
        console.log("Testeo completo :", {
          cantidadElemento,
          cantidadAntiguaTrabajo,
          cantidadNuevaTrabajo,
          cantidadPrecioTotalAntiguo,
          cantidadOpcionesPrincipalesNueva,
          cantidadOpcionesPrincipalesAntiguo,
          cantidadSolamenteComplementos,
          "Objeto actualizado": informacionCompleta.producto.precioTotalConjunto
        })
      }

      console.log("Testeo completo :", {
        cantidadElemento,
        cantidadAntiguaTrabajo,
        cantidadNuevaTrabajo,
      })

      if (accionBtn == "decrementar") {
        // Se procede a decrementar la cantidad
        MensajeCargaDatos.mostrar('Actualizando producto en el carrito...');
        await AuxiliaresGlobal.actualizarItemCarrito(keyCarrito, itemCarrito.id, cantidadElemento, {
          "estructura": JSON.stringify(informacionCompleta)
        });
      }

      if (accionBtn == "incrementar") {
        // Se procede a incrementar la cantidad
        MensajeCargaDatos.mostrar('Actualizando producto en el carrito...');
        await AuxiliaresGlobal.actualizarItemCarrito(keyCarrito, itemCarrito.id, cantidadElemento, {
          "estructura": JSON.stringify(informacionCompleta)
        });
      }
    }

    await this.actualizarSoloContenidoCarrito();
    MensajeCargaDatos.ocultar();
  }

  async actualizarSoloContenidoCarrito() {
    try {
      console.log('Actualizando solo contenido del carrito...');

      const infoCarrito = await AuxiliaresGlobal.obtenerCarritoShopify();
      this.dataCarrito = infoCarrito.informacionCompleta;
      console.log('Información completa:', infoCarrito.informacionCompleta);

      let contenidoIzquierdoHTML = '';
      let precioTotal = 0;

      console.log('Items del carrito:', infoCarrito.informacionCompleta.items);

      infoCarrito.informacionCompleta.items.forEach((item) => {
        if (item.properties && item.properties.estructura) {
          const dataContruccion = JSON.parse(item.properties.estructura);
          precioTotal += parseInt(dataContruccion.producto.precioTotalConjunto) * parseInt(item.quantity);

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
                    <h2 class="color-letras-extra">Bs. ${parseInt(dataContruccion.producto.precioTotalConjunto) * parseInt(item.quantity)}</h2>
                    <div 
                    style="display: none;"
                    class="pcph-itemc_editar">
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
                    ${dataContruccion.complementos.productos.length > 0
              ? `<p>${dataContruccion.complementos.titulo}</p>
                            <ul class="color-letras-extra">`
              : ''
            }
    
            `;

          dataContruccion.complementos.productos.forEach((producto) => {
            contenidoIzquierdoHTML += `
                  <li>
                    <p>${"x" + producto.cantidad + " " + producto.tituloSeccion} : <br> ${producto.titulo}</p>
                  </li>
              `;
          });

          contenidoIzquierdoHTML += `
                    ${dataContruccion.complementos.productos.length > 0
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

        } else {

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

  procedoEditarItem(btnElemento) { }

  obtenerStockGenericoTrabajo(productoTrabajo) {
    // Verificar si tenemos una sucursal seleccionada
    const dataSucursal = JSON.parse(localStorage.getItem('sucursal-informacion'));
    if (!dataSucursal || dataSucursal == "") return productoTrabajo.stockTotal || productoTrabajo.stockGeneral;

    const sucursalEncontrada = productoTrabajo.sucursales.find(
      sucursal => sucursal.nombre == dataSucursal.name
    );

    return sucursalEncontrada
      ? parseInt(sucursalEncontrada.stock)
      : productoTrabajo.stockTotal;
  }

  async agregarProductoAcompanamiento(btnElemento) {
    const contenedorPadre = btnElemento.closest('.cardph-item-producto');
    const idTrabajo = contenedorPadre.dataset.idtrabajo;
    const idShopify = contenedorPadre.dataset.idshopify;

    const productoTrabajo = this.productosAcompanamiento.find(
      producto => {

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
        stockTotal: parseInt(productoTrabajo.stockTotal),
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
      properties: { "estructura": JSON.stringify(detalleProducto), }
    });

    // Hacer un setTiempo de 3 segundos
    setTimeout(async () => {
      await this.actualizarSoloContenidoCarrito();
      MensajeCargaDatos.ocultar();
    }, 3000);
  }

  async pagarBtnPrincipal() {
    //  await AuxiliaresGlobal.limpiarCarrito();
    window.location.href = "/pages/checkout-ph";
  }
}

customElements.define('page-carrito', PageCarrito);