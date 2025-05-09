class PizzaHutProducto extends HTMLElement {
   constructor() {
      super();
      this.iconos = {
         iconCheckBoxOff: `${window.shopIcons.icon_checkbox_off}`,
         iconCheckBoxOn: `${window.shopIcons.icon_checkbox_on}`,
         iconEstadoOff: `${window.shopIcons.icon_estado_off}`,
         iconEstadoOn: `${window.shopIcons.icon_estado_on_plus}`,
         flechaIzquierda: `${window.shopIcons.icon_volver_atras}`,
         flechaDerecha: `${window.shopIcons.icon_flecha_derecha}`,
      };
      this.cualSeccionExtrasEs = "";
      this.cantidadClickCarrito = 0;
      this.estadoTrabajoExtras = 'n1';
      this.ladoPizza = '';
      this.tipoProceso = '';
      this.urlConsulta = "https://pizza-hut-bo.myshopify.com/admin/api/2025-01/graphql.json";
      this.productoSeleccionadoRamaPrincipal = null;
      this.itemsSeleccionadoPostres = [];
      this.itemsSeleccionadoGaseosasyCervezas = [];
      this.cantidadPrecioCarrito = null;
      this.cantidadPrecioHazUnPedido = null;
      this.carritoShopify = null;
      // REFERENCIAS ELEMENTOS
      this.btnHazUnPedido = this.querySelector('#phpm-btn-haz-un-pedido');
      this.btnAgregarCarrito = this.querySelector('#phpm-btn-agregar-carrito');
      this.etiquetaAgregarCarrito = this.querySelector('#phpp-etiqueta-agregarcarrito');
      this.etiquetaHazUnPedido = this.querySelector('#phpp-etiqueta-hazunpedido');
      this.btnVolverAtras = this.querySelector('.pmph-volver-atras');

      this.modalProductoExtras = this.querySelector('#pmph-modal-productos-extras');
      this.contenedorItemsComplejos = this.querySelector('#pmph-seleccion-pizza-mitadymitad');

      this.tipoProducto = null;
      this.productoInfo = null;
   }

   connectedCallback() {
      // EVENTOS INICIALIZAR

      // INICIZAR EVENTOS
      this.btnHazUnPedido.addEventListener('click', this.procesoBotonesInferiores.bind(this, 'hazunpedido'));
      this.btnAgregarCarrito.addEventListener('click', this.procesoBotonesInferiores.bind(this, 'agregarcarrito'));

      // INICIALIZAR ELEMENTOS Y PROCESOS CLAVES
      this.contenedorItemsComplejos.style.display = 'none';
      this.inicializarMedianteDataLocalStorage();
   }

   async inicializarMedianteDataLocalStorage() {
      // HACER UNA VALIDACION SI ES UN PRODUCTO 
      // - Basico - Desarrollado - Complejo
      this.tipoProducto = localStorage.getItem('phpp-tipo-producto') || '';
      this.productoInfo = JSON.parse(localStorage.getItem('phpp-productoData')) || null;

      MensajeCargaDatos.mostrar('Procesando Informacion ...');
      if (this.tipoProducto == 'basico' || this.tipoProducto == 'desarrollado') {
         var productoImagenHTML = '';
         const contenedorImg = this.querySelector('.pmph-imagen');
         productoImagenHTML += `
          <img
          id="phmp-contenido-ver-producto-simple"
          class="phmp-img-simple"
          src="${this.productoInfo.producto.imagen}"
          alt="${this.productoInfo.producto.titulo}"
          width="100%"
          height="100%"
          >
        `;
         contenedorImg.innerHTML = productoImagenHTML;

         var detallaBasicoProducto = '';
         detallaBasicoProducto += `
          <button 
          id="phpp-btn-volver-atras"
          class="pmph-volver-atras icon-color-primary ">
            ${window.shopIcons.icon_volver_atras}
            <p class="color-letras-primary">Volver</p>
          </button>
          <small>${this.productoInfo.producto.titulo}</small>
          <p>${this.productoInfo.producto.descripcion}</p>
        `;
         this.querySelector('.pmph-header').innerHTML = detallaBasicoProducto;

         // Aqui se va definir si se usar el stockTodo o de alguna sucursal especifica
         var stockTrabajo = this.optenerStockTrabajo();

         var detalleSubProductos = '';
         detalleSubProductos += `
                <div class="pmph-seleccion-normal pmph-cantidad">
                  <h3>Cantidad</h3>
                  <cantidad-input>
                    <div
                      origen-trabajo="producto"
                      min="1"
                      max="${stockTrabajo}"
                      id="producto-id"
                      handle="producto-handle"
                      class="pmph-cantidad-selector"
                    >
                      <button
                        accion="decrementar"
                        class="pmph-cantidad-selector-button elemento-oculto icon-color-tertiary"
                      >
                        ${window.shopIcons.icon_basura}
                      </button>
                      <button
                        accion="decrementar"
                        class="pmph-cantidad-selector-button  elemento-oculto icon-color-tertiary"
                      >
                        ${window.shopIcons.icon_menos}
                      </button>
                      <p id="phpd-cantidad-general">1</p>
                      <button
                        accion="incrementar"
                        class="pmph-cantidad-selector-button icon-color-tertiary"
                      >
                        ${window.shopIcons.icon_mas}
                      </button>
                    </div>
                  </cantidad-input>
                </div>
              `;

         // Contruccion de la estructura de las ramas principales de productos para el HTML
         // productos(Rama Principal) - productos(subRama) / productos(Rama Principal) - productos(subRama)
         for (const ramaPrincipal in this.productoInfo.productoParaEstructuraTrabajo.ramas) {
            var infoRamaPrincipal = this.productoInfo.productoParaEstructuraTrabajo.ramas[ramaPrincipal];
            /**
             Selecciona automáticamente un producto de la categoría actual.
             Prioridad de selección:
             1. Primer producto con precio 0 (gratuito)
             2. Si no existe ninguno gratuito, selecciona el primer producto disponible
    
             IMPORTANTE:
             El producto preseleccionado será mostrado como opción predeterminada al usuario y se usara sus datos
             para preseleccionar un subProducto de una subRama para tener algo predeterminado.
            */
            var productoPreSeleccionadoRamaPrincipal = infoRamaPrincipal.productos.find((item) => parseInt(item.precio) == 0) ||
               infoRamaPrincipal.productos[0];

            // En este parte me traigo lso productos de la rama principal de trabajo 
            detalleSubProductos += `
        <div data-max="${infoRamaPrincipal.max}" data-min="${infoRamaPrincipal.min}" data-codigo="${ramaPrincipal}"
          id="pmph-seleccion-rama-principal" class="pmph-seleccion-normal">
            <h3>${infoRamaPrincipal.titulo}</h3>
        `;
            infoRamaPrincipal.productos.forEach((producto) => {
               const contenidoSiTienePrecio = () => {
                  const palabras = producto.nombre.trim().split(/\s+/);
                  const dosPrimerasPalabras = palabras.slice(0, 3).join(' ');
                  const restoPalabras = palabras.slice(3).join(' ');

                  if (parseInt(producto.precio) == 0) {
                     return `<h3>${producto.nombre}</h3>`;
                  } else if (palabras.length <= 3) {
                     return `<h3>${dosPrimerasPalabras}</h3>
              <p>+ ${producto.precio} Bs</p>`;
                  } else {
                     return `<h3>${dosPrimerasPalabras}</h3>
              <p>${restoPalabras} + ${producto.precio} Bs</p>`;
                  }
               };
               if (productoPreSeleccionadoRamaPrincipal.nombre == producto.nombre) {
                  detalleSubProductos += `
              <button
              data-precio="${producto.precio}" 
              data-idtrabajo="${producto.id}"
              data-titulo="${producto.nombre}"

              id="pmp-item-rama-principal" class="pmp-item-simple seleccionado">
                <div class="pmp-item-simple-info">
                  ${contenidoSiTienePrecio()}
                </div>
                <div class="pmp-item-simple-escoger">
                 ${this.iconos.iconEstadoOn}
                </div>
            </button>
              `;
               } else {
                  detalleSubProductos += `
              <button 
              data-precio="${producto.precio}" 
              data-idtrabajo="${producto.id}"
              data-titulo="${producto.nombre}"

              id="pmp-item-rama-principal" class="pmp-item-simple">
                <div class="pmp-item-simple-info">
                  ${contenidoSiTienePrecio()}
                </div>
                <div class="pmp-item-simple-escoger">
                 ${this.iconos.iconEstadoOff}
                </div>
              </button>
              `;
               }
            });
            detalleSubProductos += `
        </div>
        `;

            // Se va unificar todos los productos de las subRamas de la rama actual de trabajo
            var unificarProductosSubRama = [];
            var infoBaseSubRama = '';
            var llaveSubRama = '';
            var siguienteNomas = false;
            // Vamos a volver a recorrer los productos de la rama principal, pero con el objetivo de unificar
            // los productos de las subRamas para evitar repetidos
            infoRamaPrincipal.productos.forEach((producto) => {
               if (producto.ramas == undefined || producto.ramas == null) {
                  siguienteNomas = true
                  return
               };
               for (const subRama in producto.ramas) {
                  var infoSubRama = producto.ramas[subRama];
                  infoBaseSubRama = infoSubRama;
                  llaveSubRama = subRama;
                  infoSubRama.productos.forEach((producto) => {
                     // Verifica si el producto se encuentra dentro del categoria de ramas de la (Personal)
                     if (!unificarProductosSubRama.some((item) => item.nombre == producto.nombre)) {
                        unificarProductosSubRama.push(producto);
                     }
                  });
               }
            });

            if (siguienteNomas) continue;

            // En este sector se dibuja la estructura de los productos de las subRamas que
            // fueron unificados para evitar repetidos si son lo mismo con respecto al titulo
            console.log('Producto Predeterminado Rama Principal:', productoPreSeleccionadoRamaPrincipal);
            var productoPreSeleccionadoSubRama = null;
            for (const subRama in productoPreSeleccionadoRamaPrincipal.ramas) {
               const infoBaseSubRama = productoPreSeleccionadoRamaPrincipal.ramas[subRama];
               /**
                * Busca el producto pre-seleccionado para la sub-rama actual siguiendo estas prioridades:
                * 1. El primer producto con precio 0 (gratuito)
                * 2. Si no existe ninguno gratuito, selecciona el primer producto disponible
                * 
                * Al encontrar el producto, se asigna a productoPreSeleccionadoSubRama y 
                * se finaliza la iteración de todos los bucles.
                */
               for (let i = 0; i < infoBaseSubRama.productos.length; i++) {
                  const producto = infoBaseSubRama.productos[i];

                  if (parseInt(producto.precio) === 0 || i === 0) {
                     productoPreSeleccionadoSubRama = producto;

                     // Si el producto tiene precio 0, salimos inmediatamente del bucle
                     if (parseInt(producto.precio) === 0) {
                        break; // Sale del bucle de productos
                     }
                  }
               }

               // Si ya encontramos un producto con precio 0, salimos del bucle de sub-ramas
               if (productoPreSeleccionadoSubRama && parseInt(productoPreSeleccionadoSubRama.precio) === 0) {
                  break; // Sale del bucle de sub-ramas
               }
            }
            console.log('Producto Predeterminado SubRama:', productoPreSeleccionadoSubRama);

            detalleSubProductos += `
        <div data-max="${infoBaseSubRama.max}" data-min="${infoBaseSubRama.min}" data-codigo="${llaveSubRama}"
        data-codigopadre="${ramaPrincipal}"
          id="pmph-seleccion-subRama" class="pmph-seleccion-normal">
            <h3>${infoBaseSubRama.titulo}</h3>
        `;
            console.log('Unificar Productos SubRama:', unificarProductosSubRama.length);
            unificarProductosSubRama.forEach((producto) => {
               const contenidoSiTienePrecio = () => {
                  const palabras = producto.nombre.trim().split(/\s+/);
                  const dosPrimerasPalabras = palabras.slice(0, 3).join(' ');
                  const restoPalabras = palabras.slice(3).join(' ');

                  if (parseInt(producto.precio) == 0) {
                     return `<h3>${producto.nombre}</h3>`;
                  } else if (palabras.length <= 3) {
                     return `<h3>${dosPrimerasPalabras}</h3>
              <p>+ ${producto.precio} Bs</p>`;
                  } else {
                     return `<h3>${dosPrimerasPalabras}</h3>
              <p>${restoPalabras} + ${producto.precio} Bs</p>`;
                  }
               };

               // Aqui se va a consultar si el (producto) se encuentra dentro de las subRamas
               // del productoPreSeleccionadoRamaPrincipal 
               const siSeEncuentraDentroRamasPrincipal = () => {
                  for (const subRama in productoPreSeleccionadoRamaPrincipal.ramas) {
                     const infoSubRama = productoPreSeleccionadoRamaPrincipal.ramas[subRama];
                     if (infoSubRama.productos.some((item) => item.nombre == producto.nombre && item.id == producto.id)) {
                        return true; // El producto se encuentra dentro de las subRamas
                     }
                  }
                  return false; // El producto NO se encuentra en ninguna sub-rama
               };

               if (siSeEncuentraDentroRamasPrincipal()) {
                  // Teniendo el producto que se encuentra dentro de las subRamas
                  // Se va buscar al subProducto que se encuentra dentro de la subRama que 
                  // sera el preseleccionado 
                  if (productoPreSeleccionadoSubRama.nombre == producto.nombre) {
                     detalleSubProductos += `
              <button 
                data-precio="${producto.precio}" 
                data-idtrabajo="${producto.id}"
              data-titulo="${producto.nombre}"

                id="pmp-item-rama-principal" class="pmp-item-simple seleccionado">
                  <div class="pmp-item-simple-info">
                    ${this.contenidoSiTienePrecio(producto.nombre, parseInt(producto.precio))}
                  </div>
                  <div class="pmp-item-simple-escoger">
                   ${this.iconos.iconEstadoOn}
                  </div>
              </button>
            `;
                  } else {
                     detalleSubProductos += `
              <button 
                data-precio="${producto.precio}" 
                data-idtrabajo="${producto.id}"
              data-titulo="${producto.nombre}"
                id="pmp-item-rama-principal" class="pmp-item-simple">
                  <div class="pmp-item-simple-info">
                    ${this.contenidoSiTienePrecio(producto.nombre, parseInt(producto.precio))}
                  </div>
                  <div class="pmp-item-simple-escoger">
                   ${this.iconos.iconEstadoOff}
                  </div>
              </button>
            `;
                  }
               } else {
                  detalleSubProductos += `
            <button 
              data-precio="${producto.precio}" 
              data-idtrabajo="${producto.id}"
              data-titulo="${producto.nombre}"
              id="pmp-item-rama-principal" class="pmp-item-simple desactivado">
                <div class="pmp-item-simple-info ">
                  ${this.contenidoSiTienePrecio(producto.nombre, parseInt(producto.precio))}
                </div>
                <div class="pmp-item-simple-escoger">
                 ${this.iconos.iconEstadoOff}
                </div>
            </button>
            `;
               }
            });

            detalleSubProductos += `
        </div>
        `;
         }

         this.querySelector('.pmph-seleccion').insertAdjacentHTML('afterbegin', detalleSubProductos);
      } else {
         // MensajeCargaDatos.mostrar('Procesando Informacion ...');
         // Traer informacion para contruir el producto
         const dataProducto = JSON.parse(localStorage.getItem('phpp-productoData'));
         // Primero se crea la estructura generale productos del atributo => productoParaEstructuraTrabajo
         var estructuraContruccion = dataProducto.estructura;
         var coleccionSubProductosTrabajar = [];

         var indice = 0;
         for (var ramaPrincipal in estructuraContruccion.ramas) {
            const productoTrabajo = dataProducto.productoParaEstructuraTrabajo[indice];

            if (ramaPrincipal == productoTrabajo.codigo) {
               estructuraContruccion.ramas[ramaPrincipal].productos = productoTrabajo.productos;
               var subProductosTrabajo = null;
               // Esto es la estructura rama sus ramas hijas => PCE y PCMB
               for (var subRama in estructuraContruccion.ramas[ramaPrincipal].ramas) {
                  var subIndice = 0;
                  subProductosTrabajo = [];

                  // Estos son los productos => PCT de la rama principa
                  productoTrabajo.productos.forEach((producto) => {
                     // Aqui trae los los productos de la subRama = [PCE, PCMB]
                     producto.ramas.forEach((subProducto) => {
                        if (subRama == subProducto.codigo) {
                           subProducto.productos.forEach((subProductoTrabajo) => {
                              if (!subProductosTrabajo.some((item) => item.idShopify === subProductoTrabajo.idShopify)) {
                                 subProductosTrabajo.push(subProductoTrabajo);
                              }
                           });
                        }
                     });
                  });

                  estructuraContruccion.ramas[ramaPrincipal].ramas[subRama].productos = subProductosTrabajo;
               }
            }
            indice++;
         }

         var productoImagenHTML = '';
         const contenedorImg = this.querySelector('.pmph-imagen');
         productoImagenHTML += `
          <img
          id="phmp-contenido-ver-producto-simple"
          class="phmp-img-simple"
          src="${dataProducto.producto.imagen}"
          alt="${dataProducto.producto.titulo}"
          width="100%"
          height="100%"
          >
        `;
         contenedorImg.innerHTML = productoImagenHTML;

         var detallaBasicoProducto = '';
         detallaBasicoProducto += `
          <button 
          id="phpp-btn-volver-atras"
          class="pmph-volver-atras icon-color-primary ">
            ${window.shopIcons.icon_volver_atras}
            <p class="color-letras-primary">Volver</p>
          </button>
          <small>${dataProducto.producto.titulo}</small>
          <p>${dataProducto.producto.descripcion}</p>
        `;
         this.querySelector('.pmph-header').innerHTML = detallaBasicoProducto;

         // Aqui se va definir si se usar el stockTodo o de alguna sucursal especifica
         var stockTrabajo = this.optenerStockTrabajo();

         var detalleSubProductos = '';
         detalleSubProductos += `
          <div class="pmph-seleccion-normal pmph-cantidad">
            <h3>Cantidad</h3>
            <cantidad-input>
              <div
                origen-trabajo="producto"
                min="1"
                max="${stockTrabajo}"
                id="producto-id"
                handle="producto-handle"
                class="pmph-cantidad-selector"
              >
                <button
                  accion="decrementar"
                  class="pmph-cantidad-selector-button elemento-oculto icon-color-tertiary"
                >
                  ${window.shopIcons.icon_basura}
                </button>
                <button
                  accion="decrementar"
                  class="pmph-cantidad-selector-button  elemento-oculto icon-color-tertiary"
                >
                  ${window.shopIcons.icon_menos}
                </button>
                <p id="phpd-cantidad-general">1</p>
                <button
                  accion="incrementar"
                  class="pmph-cantidad-selector-button icon-color-tertiary"
                >
                  ${window.shopIcons.icon_mas}
                </button>
              </div>
            </cantidad-input>
          </div>
        `;

         // Contruccion de la estructura de los (SUB - VARIANTES) productos para el HTML
         for (var ramaPrincipal in estructuraContruccion.ramas) {
            var infoRamaPrincipal = estructuraContruccion.ramas[ramaPrincipal];
            var productoRamaTrabajo = [];

            // En esta parte me traigo los productos PCT => Personal Familiar Mediana
            dataProducto.productoParaEstructuraTrabajo.forEach((producto) => {
               if (ramaPrincipal == producto.codigo) {
                  productoRamaTrabajo = producto.productos;
               }
            });

            // Se va optener el primer elemento sus sub elemento al primeor con precio 0
            var auxProductoPreSeleccionado = productoRamaTrabajo.find((item) => item.idTrabajo == dataProducto.subProductoSeleccionado) ||
               productoRamaTrabajo.find((item) => parseInt(item.precio) == 0) ||
               productoRamaTrabajo[0];
            this.productoSeleccionadoRamaPrincipal = auxProductoPreSeleccionado;

            detalleSubProductos += `
          <div
          data-max="${infoRamaPrincipal.max}"
          data-min="${infoRamaPrincipal.min}"
          data-codigo="${ramaPrincipal}"
          id="pmph-seleccion-rama-principal" class="pmph-seleccion-normal">
            <h3>${infoRamaPrincipal.titulo}</h3>
          `;
            infoRamaPrincipal.productos.forEach((producto) => {

               const precio = parseInt(producto.precio) == 0 ? '' : ` + ${producto.precio} Bs`;
               const { importante, mensaje } = this.dividirTitulo(producto.titulo + precio);
               if (auxProductoPreSeleccionado.titulo == producto.titulo) {
                  detalleSubProductos += `
              <button
              data-precio="${producto.precio}" 
              data-handle="${producto.handle}"
              data-titulo="${producto.titulo}"
              data-idtrabajo="${producto.idTrabajo}"
              data-idshopify="${producto.idShopify}"
              id="pmp-item-rama-principal" class="pmp-item-simple seleccionado">
                <div class="pmp-item-simple-info">
                  <h3>${importante}</h3>
                  <p>${mensaje}</p>
                </div>
                <div class="pmp-item-simple-escoger">
                 ${this.iconos.iconEstadoOn}
                </div>
            </button>
              `;
               } else {
                  detalleSubProductos += `
              <button 
              data-handle="${producto.handle}"
              data-titulo="${producto.titulo}"
              data-precio="${producto.precio}" 
              data-idtrabajo="${producto.idTrabajo}"
              data-idshopify="${producto.idShopify}"
              id="pmp-item-rama-principal" class="pmp-item-simple">
                <div class="pmp-item-simple-info">
                  <h3>${importante}</h3>
                  <p>${mensaje}</p>
                </div>
                <div class="pmp-item-simple-escoger">
                 ${this.iconos.iconEstadoOff}
                </div>
              </button>
              `;
               }
            });
            detalleSubProductos += `
          </div>
          `;



            // Bandera para tipo de botones = circle o checkbx
            var bptb = false;

            for (var subRama in infoRamaPrincipal.ramas) {
               var infoSubRama = infoRamaPrincipal.ramas[subRama];
               var subProductoTrabajo = [];
               var banderaPrimero = false;
               // De los productos PCT me traigo sus ramas del primer elemento en este caso (Personal)
               auxProductoPreSeleccionado.ramas.forEach((producto) => {
                  if (subRama == producto.codigo) {
                     subProductoTrabajo = producto.productos;
                  }
               });

               detalleSubProductos += `
            <div 
            data-max="${infoSubRama.max}"
            data-min="${infoSubRama.min}"
            data-codigo="${subRama}"
            data-codigopadre="${ramaPrincipal}"
            tipo-boton="${bptb ? 'checkbox' : 'circle'}"
            id="pmph-seleccion-subRama" class="pmph-seleccion-especial ">
            <h3>${infoSubRama.titulo}</h3>
            `;

               infoSubRama.productos.forEach((producto, index) => {
                  const tituloTrabajo = producto.titulo.startsWith("Extra ") ? producto.titulo.substring(6) : producto.titulo;
                  const sePondraNombre = infoSubRama.titulo == "Masas y Bordes";
                  // Verifica si el producto se encuentra dentro del categoria de ramas de la (Personal)
                  if (subProductoTrabajo.some((item) => item.idShopify === producto.idShopify)) {

                     // Si se encuentra todos estara activado
                     if (banderaPrimero == false && infoSubRama.min == "1" && parseInt(producto.precio) == 0) {
                        // Se auto preseleccionara el primer elemento
                        detalleSubProductos += `
                  <button 
                  data-precio="${producto.precio}"
                  data-idtrabajo="${producto.idTrabajo}"
                  data-idshopify="${producto.idShopify}"
                  data-handle="${producto.handle}"
                  data-titulo="${producto.titulo}"
                  id="pmp-item-subRama" class="pmp-item-complejo seleccionado">
                    <div class="pmp-item-complejo-imagen ">
                    ${producto.imagen == "" || producto.imagen == undefined || producto.imagen == null ?
                              `<img src="{{ 'imagen-pizza-1.png' | asset_url }}" alt="${tituloTrabajo}" width="100%" height="100%">` :
                              `<img src="${producto.imagen}" alt="${tituloTrabajo}" width="100%" height="100%">`}
                    </div>
                    <div class="pmp-item-complejo-info">
                      <div class="pmp-item-complejo-info-detalle ">
                        <p>${tituloTrabajo}</p>
                         ${parseInt(producto.precio) == 0 ? '' : `<p id="pmp-item-info-precio">+ ${producto.precio} Bs</p>`}
                      </div>
                      <div class="pmp-item-simple-escoger">
                        ${bptb ? this.iconos.iconCheckBoxOn : this.iconos.iconEstadoOn}
                      </div>
                    </div>
                  </button>
                  `;
                        banderaPrimero = true;
                     } else {
                        // Elemento activado pero no seleccionado
                        detalleSubProductos += `
  
                  <button
                  data-precio="${producto.precio}" 
                  data-idtrabajo="${producto.idTrabajo}"
                  data-idshopify="${producto.idShopify}"
                  data-handle="${producto.handle}"
                  data-titulo="${producto.titulo}"
                  id="pmp-item-subRama" class="pmp-item-complejo ">
                    <div class="pmp-item-complejo-imagen ">
                                        ${producto.imagen == "" ?
                              `<img src="{{ 'imagen-pizza-1.png' | asset_url }}" alt="${tituloTrabajo}" width="100%" height="100%">` :
                              `<img src="${producto.imagen}" alt="${tituloTrabajo}" width="100%" height="100%">`}
                    </div>
                    <div class="pmp-item-complejo-info">
                      <div class="pmp-item-complejo-info-detalle ">
                        <p>${tituloTrabajo}</p>
                         ${parseInt(producto.precio) == 0 ? '' : `<p id="pmp-item-info-precio">+ ${producto.precio} Bs</p>`}
                      </div>
                      <div class="pmp-item-simple-escoger">
                        ${bptb ? this.iconos.iconCheckBoxOff : this.iconos.iconEstadoOff}
                      </div>
                    </div>
                  </button>
                  `;
                     }
                  } else {
                     // Aqui el producto no se encuentra se lo desactivaba
                     detalleSubProductos += `
                  <button
                  data-precio="${producto.precio}" 
                  data-idtrabajo="${producto.idTrabajo}"
                  data-idshopify="${producto.idShopify}"
                  data-handle="${producto.handle}"
                  data-titulo="${producto.titulo}"
                  id="pmp-item-subRama" class="pmp-item-complejo desactivado">
                    <div class="pmp-item-complejo-imagen ">
                                        ${producto.imagen == "" ?
                           `<img src="{{ 'imagen-pizza-1.png' | asset_url }}" alt="${tituloTrabajo}" width="100%" height="100%">` :
                           `<img src="${producto.imagen}" alt="${tituloTrabajo}" width="100%" height="100%">`}
                    </div>
                    <div class="pmp-item-complejo-info">
                      <div class="pmp-item-complejo-info-detalle ">
                        <p>${tituloTrabajo}</p>
                         ${parseInt(producto.precio) == 0 ? '' : `<p id="pmp-item-info-precio">+ ${producto.precio} Bs</p>`}
                      </div>
                      <div class="pmp-item-simple-escoger">
                        ${bptb ? this.iconos.iconCheckBoxOff : this.iconos.iconEstadoOff}
                      </div>
                    </div>
                  </button>
                `;
                  }
               });
               detalleSubProductos += `
            </div>
            `;
               bptb = !bptb;
            }
         }

         this.querySelector('.pmph-seleccion').insertAdjacentHTML('afterbegin', detalleSubProductos);
      }

      this.inicializarPreSeleccionadasMedianteCondiciones();
      MensajeCargaDatos.ocultar();
   }

   async inicializarPreSeleccionadasMedianteCondiciones() {
      if (this.tipoProducto == 'basico' || this.tipoProducto == 'desarrollado') {
         // Se inicializa las secciones de productos rama principal
         this.seccionProductosRamaPrincipales = this.querySelectorAll('#pmph-seleccion-rama-principal');

         // Se inicializa las secciones de productos subRama
         this.seccionProductosSubRama = this.querySelectorAll('#pmph-seleccion-subRama');

         // Contador global para ramas principales

         this.seccionProductosRamaPrincipales.forEach((seccion, index) => {
            var productosPreSeleccionados = [];
            const minRamaPrincipal = parseInt(seccion.dataset.min);
            const codigoRamaPrincipal = seccion.dataset.codigo;

            // Verificar si debemos preseleccionar esta sección basada en su min
            // y en el contador global controlRamaPrincipal
            if (minRamaPrincipal > 0 && productosPreSeleccionados.length < minRamaPrincipal) {
               // Buscar la rama principal por código
               for (const ramaPrincipal in this.productoInfo.productoParaEstructuraTrabajo.ramas) {
                  var infoRamaPrincipal = this.productoInfo.productoParaEstructuraTrabajo.ramas[ramaPrincipal];

                  if (ramaPrincipal == codigoRamaPrincipal && productosPreSeleccionados.length < minRamaPrincipal) {
                     // Calculamos cuántos productos faltan por añadir
                     const productosNecesarios = minRamaPrincipal - productosPreSeleccionados.length;
                     const productosDisponibles = [...infoRamaPrincipal.productos];

                     // Primero buscamos productos con precio 0 que no estén preseleccionados
                     const productosPrecio0 = productosDisponibles.filter(
                        item => parseInt(item.precio) === 0 &&
                           !productosPreSeleccionados.some(p => p.id === item.id)
                     );

                     // Luego productos que no estén preseleccionados (de cualquier precio)
                     const productosNoSeleccionados = productosDisponibles.filter(
                        item => !productosPreSeleccionados.some(p => p.id === item.id)
                     );

                     // Preparamos la lista de candidatos, priorizando productos con precio 0
                     let productosCandidatos = [...productosPrecio0];

                     // Si no hay suficientes productos con precio 0, añadimos otros no seleccionados
                     if (productosCandidatos.length < productosNecesarios) {
                        const otrosNoSeleccionados = productosNoSeleccionados.filter(
                           item => !productosPrecio0.some(p => p.id === item.id)
                        );
                        productosCandidatos = [...productosCandidatos, ...otrosNoSeleccionados];
                     }

                     // Si aún no hay suficientes, añadimos cualquier producto disponible
                     if (productosCandidatos.length < productosNecesarios && productosDisponibles.length > 0) {
                        productosCandidatos = [...new Set([...productosCandidatos, ...productosDisponibles])];
                     }

                     // Tomamos solo los productos necesarios
                     const productosASeleccionar = productosCandidatos.slice(0, productosNecesarios);

                     // console.log('Testeo :', {
                     //    productosASeleccionar,
                     //    productosPreSeleccionados,
                     //    infoRamaPrincipal,
                     //    infoRamaPrincipalProductos: infoRamaPrincipal.productos,
                     //    minRamaPrincipal,
                     //    productosNecesarios
                     // });

                     // Añadimos los productos seleccionados a la lista de preseleccionados
                     if (productosASeleccionar.length > 0) {
                        productosPreSeleccionados.push(...productosASeleccionar);
                     }

                     break;
                  }
               }

               // Verificación final para asegurar que productosPreSeleccionados.length === minRamaPrincipal
               // console.log('Verificación final:', {
               //    longitudFinal: productosPreSeleccionados.length,
               //    minRequerido: minRamaPrincipal,
               //    cumpleRequisito: productosPreSeleccionados.length === minRamaPrincipal
               // });

               if (productosPreSeleccionados.length === minRamaPrincipal) {
                  // Preseleccionar productos en la rama principal
                  const itemsDentroSeccionRamaPrincipal = seccion.querySelectorAll('.pmp-item-simple');
                  const productosPreSeleccionadosIds = new Set(productosPreSeleccionados.map(producto => producto.id.toString()));

                  // console.log('Testeo : ', {
                  //    itemsDentroSeccionRamaPrincipal,
                  //    productosPreSeleccionadosIds,
                  // });

                  itemsDentroSeccionRamaPrincipal.forEach(item => {
                     const idTrabajo = item.dataset.idtrabajo;
                     const estaDentroPreseleccionados = productosPreSeleccionadosIds.has(idTrabajo);

                     // Actualizar clases y contenido HTML
                     item.classList.toggle('seleccionado', estaDentroPreseleccionados);
                     item.querySelector('.pmp-item-simple-escoger').innerHTML =
                        estaDentroPreseleccionados ? this.iconos.iconEstadoOn : this.iconos.iconEstadoOff;
                  });

                  // Ahora procesar las subRamas si es necesario
                  // if ((this.seccionProductosSubRama.length > 0) && (minSubRama > 0 && productoParaPreseleccionado.ramas)) {
                  //    var controlSubRama = 0;
                  //    const seccionSubRama = this.seccionProductosSubRama[index];
                  //    const itemsDentroSeccionSubRama = seccionSubRama.querySelectorAll('#pmp-item-complejo');

                  //    // Recorrer las subRamas y preseleccionar según sea necesario
                  //    for (const subRama in productoParaPreseleccionado.ramas) {
                  //       var infoSubRama = productoParaPreseleccionado.ramas[subRama];

                  //       // Si esta subRama tiene min > 0
                  //       if (infoSubRama.min > 0) {
                  //          // Solo procesar si hay productos disponibles
                  //          if (infoSubRama.productos && infoSubRama.productos.length > 0) {
                  //             // Intentar encontrar un producto para preseleccionar
                  //             const productoSubRamaParaPreseleccionar = infoSubRama.productos.find(
                  //                (item) => parseInt(item.precio) == 0
                  //             ) || infoSubRama.productos[0];

                  //             // Preseleccionar el producto en la UI según corresponda
                  //             itemsDentroSeccionSubRama.forEach((item) => {
                  //                if (item.dataset.titulo == productoSubRamaParaPreseleccionar.titulo) {
                  //                   // Siempre actualizar los datos del producto
                  //                   item.dataset.idtrabajo = productoSubRamaParaPreseleccionar.idTrabajo;
                  //                   item.precio = productoSubRamaParaPreseleccionar.precio;
                  //                   const mostrarDatos = item.querySelector('.pmp-item-simple-info');
                  //                   mostrarDatos.innerHTML = this.contenidoSiTienePrecio(
                  //                      productoSubRamaParaPreseleccionar.titulo,
                  //                      parseInt(productoSubRamaParaPreseleccionar.precio)
                  //                   );

                  //                   // Solo seleccionarlo si aún no hemos alcanzado el mínimo requerido
                  //                   if (controlSubRama < minSubRama) {
                  //                      item.classList.add('seleccionado');
                  //                      item.querySelector('.pmp-item-simple-escoger').innerHTML = this.iconos.iconEstadoOn;
                  //                      controlSubRama++;
                  //                   } else {
                  //                      // Ya se cumplió el mínimo, solo actualizar datos sin seleccionar
                  //                      item.classList.remove('seleccionado');
                  //                      item.querySelector('.pmp-item-simple-escoger').innerHTML = this.iconos.iconEstadoOff;
                  //                   }
                  //                } else {
                  //                   // No remover selección de otros elementos que podrían estar seleccionados
                  //                   // para cumplir con el mínimo de otras subRamas
                  //                   if (!item.classList.contains('seleccionado')) {
                  //                      item.querySelector('.pmp-item-simple-escoger').innerHTML = this.iconos.iconEstadoOff;
                  //                   }
                  //                }
                  //             });
                  //          }
                  //       }
                  //    }

                  //    // Verificar si cumplimos con el mínimo de subRamas
                  //    if (controlSubRama < minSubRama) {
                  //       console.warn(`No se pudo cumplir con el mínimo de ${minSubRama} productos para la subRama de ${codigoRamaPrincipal}`);
                  //    }
                  // }

                  // Ahora procesar las subRamas si es necesario
                  if ((this.seccionProductosSubRama.length > 0)) {
                     const seccionSubRama = this.seccionProductosSubRama[index];
                     const minSubRama = parseInt(seccionSubRama.dataset.min);

                     // Solo procesamos si hay un mínimo requerido para las subRamas
                     if (minSubRama > 0) {
                        // Inicializamos contador para el seguimiento de productos de subRama ya seleccionados
                        var productosSubRamaSeleccionados = [];
                        const itemsDentroSeccionSubRama = seccionSubRama.querySelectorAll('.pmp-item-complejo');

                        // Construimos un conjunto con IDs de productos principales preseleccionados para búsquedas eficientes
                        const idsProductosPrincipalesSeleccionados = new Set(productosPreSeleccionados.map(p => p.id.toString()));

                        // Paso 1: Recopilamos todos los productos de subRama disponibles para los productos principales seleccionados
                        let productosSubRamaDisponibles = [];

                        // Iteramos por cada producto principal preseleccionado
                        for (const productoPrincipal of productosPreSeleccionados) {
                           // Verificamos si este producto principal tiene subRamas definidas
                           if (productoPrincipal.ramas) {
                              // Recorremos las subRamas de este producto principal
                              for (const codigoSubRama in productoPrincipal.ramas) {
                                 const infoSubRama = productoPrincipal.ramas[codigoSubRama];

                                 // Solo consideramos subRamas que tengan productos
                                 if (infoSubRama.productos && infoSubRama.productos.length > 0) {
                                    // Añadimos información sobre el producto principal al que pertenece cada producto de subRama
                                    const productosConRelacion = infoSubRama.productos.map(producto => ({
                                       ...producto,
                                       productoPrincipalId: productoPrincipal.id,
                                       codigoSubRama
                                    }));

                                    // Agregamos los productos a nuestra lista de disponibles
                                    productosSubRamaDisponibles = [...productosSubRamaDisponibles, ...productosConRelacion];
                                 }
                              }
                           }
                        }

                        // Paso 2: Priorizamos productos con precio 0
                        // Ordenamos dando prioridad a productos con precio 0
                        productosSubRamaDisponibles.sort((a, b) => {
                           // Primero los de precio 0
                           if (parseInt(a.precio) === 0 && parseInt(b.precio) !== 0) return -1;
                           if (parseInt(a.precio) !== 0 && parseInt(b.precio) === 0) return 1;
                           // Si ambos tienen el mismo estado de precio, mantener el orden original
                           return 0;
                        });

                        // Paso 3: Seleccionamos productos hasta cumplir con el mínimo requerido
                        const productosASeleccionar = productosSubRamaDisponibles.slice(0, minSubRama);

                        // Creamos un conjunto de títulos de productos a seleccionar para búsquedas eficientes
                        const titulosProductosASeleccionar = new Set(productosASeleccionar.map(p => p.titulo));

                        // Paso 4: Actualizamos la UI para reflejar las selecciones
                        itemsDentroSeccionSubRama.forEach((item) => {
                           const tituloItem = item.dataset.titulo;
                           const estaSeleccionado = titulosProductosASeleccionar.has(tituloItem);

                           // Buscar el producto correspondiente si está seleccionado
                           if (estaSeleccionado) {
                              const productoSeleccionado = productosASeleccionar.find(p => p.titulo === tituloItem);

                              // Actualizar datos del producto en el DOM
                              item.dataset.idtrabajo = productoSeleccionado.idTrabajo;
                              item.dataset.precio = productoSeleccionado.precio;
                              item.dataset.productoPrincipalId = productoSeleccionado.productoPrincipalId; // Guardamos relación con producto principal

                              // Actualizar visualización de información
                              const mostrarDatos = item.querySelector('.pmp-item-simple-info');
                              mostrarDatos.innerHTML = this.contenidoSiTienePrecio(
                                 productoSeleccionado.titulo,
                                 parseInt(productoSeleccionado.precio)
                              );

                              // Marcar como seleccionado
                              item.classList.add('seleccionado');
                              item.querySelector('.pmp-item-simple-escoger').innerHTML = this.iconos.iconEstadoOn;

                              // Añadir a la lista de seleccionados para seguimiento
                              productosSubRamaSeleccionados.push(productoSeleccionado);
                           } else {
                              // No está entre los seleccionados para cumplir el mínimo
                              item.classList.remove('seleccionado');
                              item.querySelector('.pmp-item-simple-escoger').innerHTML = this.iconos.iconEstadoOff;
                           }
                        });

                        // Paso 5: Verificación final de cumplimiento de requisitos
                        // console.log('Verificación subRamas:', {
                        //    seleccionados: productosSubRamaSeleccionados.length,
                        //    requeridos: minSubRama,
                        //    cumpleMinimo: productosSubRamaSeleccionados.length >= minSubRama
                        // });

                        // Advertir si no se pudo cumplir con el mínimo
                        if (productosSubRamaSeleccionados.length < minSubRama) {
                           console.warn(`No se pudo cumplir con el mínimo de ${minSubRama} productos para las subRamas de los productos principales seleccionados en ${codigoRamaPrincipal}`);
                        }
                     }
                  }
               }
            }
         });

         if (this.seccionProductosRamaPrincipales.length > 0) {
            // Se inicializa los btn de productos rama principal
            this.btnsProductosRamaPrincipales = this.querySelectorAll('#pmp-item-rama-principal');
            this.btnsProductosRamaPrincipales.forEach((btn) => {
               btn.addEventListener('click', (btnElemento) => {
                  const elementoPadre = btn.closest('#pmph-seleccion-rama-principal');
                  const max = parseInt(elementoPadre.dataset.max);
                  const min = parseInt(elementoPadre.dataset.min);
                  const codigoRama = elementoPadre.dataset.codigo;
                  const estaSeleccionado = btn.classList.contains('seleccionado');
                  const hijosSeleccionadosPadre = elementoPadre.querySelectorAll('.seleccionado');
                  const informacionRama = this.productoInfo.productoParaEstructuraTrabajo.ramas[codigoRama];
                  const productoInfo = informacionRama.productos.find((item) => item.id == btn.dataset.idtrabajo);
                  console.log("Testeo de productos,", {
                     elementoPadre,
                     max,
                     min,
                     codigoRama,
                     estaSeleccionado,
                     hijosSeleccionadosPadre: hijosSeleccionadosPadre.length,
                  })
                  if (estaSeleccionado) {
                     // Si está seleccionado y se le hizo click, quiere deseleccionarlo
                     // Calculamos cuántos elementos quedarían seleccionados después de esta acción
                     const totalSeleccionadosDespues = hijosSeleccionadosPadre.length - 1;

                     // Verificamos que al deseleccionar no incumplamos el mínimo requerido
                     if (min > 0 && totalSeleccionadosDespues < min) {
                        // No se puede deseleccionar porque quedaríamos por debajo del mínimo
                        console.warn(`No se puede deseleccionar. Se requiere un mínimo de ${min} elementos seleccionados.`);
                        return; // Salimos sin hacer cambios
                     }

                     // Si pasamos la verificación, podemos deseleccionar
                     btn.classList.remove('seleccionado');
                     btn.querySelector('.pmp-item-simple-escoger').innerHTML = this.iconos.iconEstadoOff;

                     // Aquí podríamos añadir lógica adicional para manejar subRamas relacionadas
                  } else {
                     // Si no está seleccionado y se le hizo click, quiere seleccionarlo
                     // Calculamos cuántos elementos quedarían seleccionados después de esta acción
                     const totalSeleccionadosDespues = hijosSeleccionadosPadre.length;

                     // Verificamos que al seleccionar no sobrepasemos el máximo permitido
                     if (min > 0 && hijosSeleccionadosPadre.length < min) {
                        // No se puede seleccionar porque excederíamos el máximo
                        console.warn(`No se puede seleccionar más elementos. El máximo permitido es ${max}.`);
                        return; // Salimos sin hacer cambios
                     }

                     // Si pasamos la verificación, podemos seleccionar
                     hijosSeleccionadosPadre.forEach((hijo) => {
                        if (hijo !== btn) {
                           hijo.classList.remove('seleccionado');
                           hijo.querySelector('.pmp-item-simple-escoger').innerHTML = this.iconos.iconEstadoOff;
                        }
                     });
                     btn.classList.add('seleccionado');
                     btn.querySelector('.pmp-item-simple-escoger').innerHTML = this.iconos.iconEstadoOn;

                     // El producto fue exitosamente seleccionado se va proceder a actualizar a la seccionSubRama
                     // que corresponde ya que tiene un codigo como data-codigopadre en este caso primero hay 
                     // encontrar a la subRama que corresponde
                     if (this.seccionProductosSubRama.length > 0) {
                        // Buscamos la sección de subRama correspondiente a la rama principal actual
                        const seccionSubRama = Array.from(this.seccionProductosSubRama).find((subRama) => {
                           return subRama.dataset.codigopadre == codigoRama;
                        });

                        if (seccionSubRama) {
                           // Verificamos si el producto seleccionado tiene subRamas
                           if (productoInfo && productoInfo.ramas) {
                              // Se va unificar todos los productos de las ramas que tiene el productoInfo
                              // Productos de trabajo base para actualizar desactivar o activar lo que corresponde
                              let productosSubRamaUnificados = [];

                              // Iteramos por cada subRama del producto seleccionado
                              for (const codigoSubRama in productoInfo.ramas) {
                                 const infoSubRama = productoInfo.ramas[codigoSubRama];

                                 // Solo consideramos subRamas que tengan productos
                                 if (infoSubRama.productos && infoSubRama.productos.length > 0) {
                                    // Añadimos los productos a nuestra lista unificada
                                    productosSubRamaUnificados = [
                                       ...productosSubRamaUnificados,
                                       ...infoSubRama.productos.map(producto => ({
                                          ...producto,
                                          codigoSubRama
                                       }))
                                    ];
                                 }
                              }

                              // Obtenemos el mínimo requerido para las subRamas
                              const minSubRama = parseInt(seccionSubRama.dataset.min) || 0;
                              const hijosSeccionSubRama = seccionSubRama.querySelectorAll('.pmp-item-complejo');

                              // Detectar productos ya seleccionados en subRamas
                              const productosYaSeleccionados = Array.from(seccionSubRama.querySelectorAll('.seleccionado')).map(
                                 item => item.dataset.idtrabajo
                              );

                              // Ordenamos los productos priorizando los de precio 0
                              productosSubRamaUnificados.sort((a, b) => {
                                 // Primero los de precio 0
                                 if (parseInt(a.precio) === 0 && parseInt(b.precio) !== 0) return -1;
                                 if (parseInt(a.precio) !== 0 && parseInt(b.precio) === 0) return 1;
                                 // Si ambos tienen el mismo estado de precio, mantener el orden original
                                 return 0;
                              });

                              // Contador para productos de subRama seleccionados
                              let contadorSeleccionados = productosYaSeleccionados.length;

                              // Recorremos todos los elementos de la subRama para actualizarlos
                              hijosSeccionSubRama.forEach((item) => {
                                 const idTrabajo = item.dataset.idtrabajo;
                                 // Verificamos si este producto está entre los disponibles en las subRamas
                                 const productoEncontrado = productosSubRamaUnificados.find(p => p.idTrabajo == idTrabajo);

                                 if (productoEncontrado) {
                                    // Activamos el elemento para que sea seleccionable
                                    item.classList.remove('desactivado');

                                    // Actualizamos los datos del producto en el DOM
                                    item.dataset.idtrabajo = productoEncontrado.idTrabajo;
                                    item.dataset.precio = productoEncontrado.precio;
                                    item.dataset.productoPrincipalId = btnTarget.dataset.idtrabajo; // Guardamos relación con producto principal

                                    // Actualizamos visualización de información
                                    const mostrarDatos = item.querySelector('.pmp-item-simple-info');
                                    mostrarDatos.innerHTML = this.contenidoSiTienePrecio(
                                       productoEncontrado.titulo,
                                       parseInt(productoEncontrado.precio)
                                    );

                                    // Si aún no hemos alcanzado el mínimo y este producto tiene precio 0 o ya estaba seleccionado
                                    // lo seleccionamos automáticamente
                                    const yaEstabaSeleccionado = productosYaSeleccionados.includes(idTrabajo);
                                    const precioCero = parseInt(productoEncontrado.precio) === 0;

                                    if (contadorSeleccionados < minSubRama && (precioCero || yaEstabaSeleccionado)) {
                                       // Solo lo seleccionamos si aún no estaba seleccionado
                                       if (!item.classList.contains('seleccionado')) {
                                          item.classList.add('seleccionado');
                                          item.querySelector('.pmp-item-simple-escoger').innerHTML = this.iconos.iconEstadoOn;
                                          contadorSeleccionados++;
                                       }
                                    } else if (!item.classList.contains('seleccionado')) {
                                       // Si no cumple criterios para selección automática y no estaba ya seleccionado
                                       item.querySelector('.pmp-item-simple-escoger').innerHTML = this.iconos.iconEstadoOff;
                                    }
                                 } else {
                                    // Este producto no está disponible en las subRamas del producto principal seleccionado
                                    // Lo desactivamos para que no sea seleccionable
                                    item.classList.add('desactivado');
                                    item.classList.remove('seleccionado');
                                    item.querySelector('.pmp-item-simple-escoger').innerHTML = this.iconos.iconEstadoOff;

                                    // Si estaba contado como seleccionado, ajustamos el contador
                                    if (productosYaSeleccionados.includes(idTrabajo)) {
                                       contadorSeleccionados--;
                                    }
                                 }
                              });

                              // Verificación final de cumplimiento del mínimo
                              if (contadorSeleccionados < minSubRama) {
                                 console.warn(`Advertencia: No se pudo cumplir con el mínimo de ${minSubRama} productos para las subRamas`);

                                 // Intentamos seleccionar productos adicionales para cumplir el mínimo
                                 if (productosSubRamaUnificados.length > 0) {
                                    const productosDisponiblesNoSeleccionados = Array.from(hijosSeccionSubRama)
                                       .filter(item => !item.classList.contains('seleccionado') && !item.classList.contains('desactivado'));

                                    // Seleccionamos elementos adicionales hasta cumplir el mínimo
                                    for (const item of productosDisponiblesNoSeleccionados) {
                                       if (contadorSeleccionados >= minSubRama) break;

                                       item.classList.add('seleccionado');
                                       item.querySelector('.pmp-item-simple-escoger').innerHTML = this.iconos.iconEstadoOn;
                                       contadorSeleccionados++;
                                    }
                                 }
                              }
                           } else {
                              // Si el producto seleccionado no tiene subRamas, desactivamos todos los elementos de subRama
                              const hijosSeccionSubRama = seccionSubRama.querySelectorAll('.pmp-item-complejo');
                              hijosSeccionSubRama.forEach((item) => {
                                 item.classList.add('desactivado');
                                 item.classList.remove('seleccionado');
                                 item.querySelector('.pmp-item-simple-escoger').innerHTML = this.iconos.iconEstadoOff;
                              });
                           }
                        }
                     }
                  }
               });
            });
         }

         if (this.seccionProductosSubRama.length > 0) {
            this.btnsProductosSubRama = this.querySelectorAll('#pmp-item-subRama');
            this.btnsProductosSubRama.forEach((btn) => {
               btn.addEventListener('click', (btnElemento) => {
                  // Verificamos si el elemento está desactivado, en cuyo caso no hacemos nada
                  const btnTarget = btnElemento.target.closest('.pmp-item-complejo') || btnElemento.target;
                  if (btnTarget.classList.contains('desactivado')) {
                     return; // No permitimos acción en elementos desactivados
                  }

                  // Obtenemos el elemento padre (sección de subRama)
                  const elementoPadre = btnTarget.closest('#pmph-seleccion-subRama');
                  if (!elementoPadre) return; // Si no encontramos el padre, salimos

                  // Obtenemos los valores de mínimo y máximo
                  const min = parseInt(elementoPadre.dataset.min) || 0;
                  const max = parseInt(elementoPadre.dataset.max) || 0;

                  // Verificamos si el elemento está seleccionado
                  const estaSeleccionado = btnTarget.classList.contains('seleccionado');

                  // Obtenemos todos los elementos seleccionados en la misma sección
                  const hijosSeleccionadosPadre = elementoPadre.querySelectorAll('.seleccionado');

                  if (estaSeleccionado) {
                     // Si está seleccionado, intentamos deseleccionar
                     const totalSeleccionadosDespues = hijosSeleccionadosPadre.length - 1;

                     // Verificamos que al deseleccionar no incumplamos el mínimo requerido
                     if (min > 0 && totalSeleccionadosDespues < min) {
                        // No se puede deseleccionar porque quedaríamos por debajo del mínimo
                        console.warn(`No se puede deseleccionar. Se requiere un mínimo de ${min} elementos seleccionados en esta subRama.`);
                        return; // Salimos sin hacer cambios
                     }

                     // Si pasamos la verificación, podemos deseleccionar
                     btnTarget.classList.remove('seleccionado');
                     btnTarget.querySelector('.pmp-item-simple-escoger').innerHTML = this.iconos.iconEstadoOff;
                  } else {
                     // Si no está seleccionado, intentamos seleccionar
                     const totalSeleccionadosDespues = hijosSeleccionadosPadre.length + 1;

                     // Verificamos que al seleccionar no sobrepasemos el máximo permitido
                     if (max > 0 && totalSeleccionadosDespues > max) {
                        // No se puede seleccionar porque excederíamos el máximo
                        console.warn(`No se puede seleccionar más elementos. El máximo permitido es ${max} en esta subRama.`);
                        return; // Salimos sin hacer cambios
                     }

                     // Si pasamos la verificación, podemos seleccionar
                     btnTarget.classList.add('seleccionado');
                     btnTarget.querySelector('.pmp-item-simple-escoger').innerHTML = this.iconos.iconEstadoOn;
                  }
               });
            });
         }

      } else {
         // // Creacion de elementos de la coleccion Postres
         // await this.creacionHTMLPostres();

         // // Creacion de elementos de la coleccion Gaseosas y Postres
         // await this.creacionHTMLGaseosasCervesas();

         // // Se inicializa el precio del carrito y haz un pedido
         // this.cantidadPrecioCarrito = await AuxiliaresGlobal.totalPrecioCarritoShopify();

         // // Declaracion referenciar - inicializar - eventos
         // await this.declararComponentesDespuesCreacion();
      }
      // Creacion de elementos de la coleccion Postres
      await this.creacionHTMLPostres();

      // Creacion de elementos de la coleccion Gaseosas y Postres
      await this.creacionHTMLGaseosasCervesas();

      // Se inicializa el precio del carrito y haz un pedido
      this.cantidadPrecioCarrito = await AuxiliaresGlobal.totalPrecioCarritoShopify();

      // Declaracion referenciar - inicializar - eventos
      await this.declararComponentesDespuesCreacion();

      this.btnVolverAtras = this.querySelector('#phpp-btn-volver-atras');
      this.btnVolverAtras.addEventListener('click', () => {
         console.log('Volver Atras');
         if (window.history.length > 1) {
            window.history.back();
         } else {
            window.location.href = '/';
         }
      });
   }

   async declararComponentesDespuesCreacion() {
      if (this.tipoProducto == 'basico' || this.tipoProducto == 'desarrollado') {
         // REFERENCIAS ELEMENTOS
         this.estadoVacioContenedorPostres = this.querySelector('#phpm-vacio-extras-especiales-postres');
         this.estadoItemsContenedorPostres = this.querySelector('#phpm-extras-especiales-postres');
         this.anadirMasContenedorPostres = this.querySelector('#phpm-btn-anadir-extras-postres');
         this.btnsEliminarExtrasPostres = null;

         this.estadoVacioContenedorGaseosasCerversas = this.querySelector('#phpm-vacio-extras-especiales-gaseosasycervezas');
         this.estadoItemsContenedorGaseosasCerversas = this.querySelector('#phpm-extras-especiales-gaseosasycervezas');
         this.anadirMasContenedorGaseosasCerversas = this.querySelector('#phpm-btn-anadir-extras-gaseosasycervezas');
         this.btnsEliminarExtrasGaseosasCerversas = null;

         this.btnSeccionModalSalir = this.querySelector('#phppm-btn-salir');
         this.btnSeccionModalGuardar = this.querySelector('#phppm-btn-guardar');

         // this.seccionProductosRamaPrincipales = this.querySelectorAll('#pmph-seleccion-rama-principal');
         // this.seccionProductosSubRama = this.querySelectorAll('#pmph-seleccion-subRama');

         // this.btnsProductosRamaPrincipales = this.querySelectorAll('#pmp-item-rama-principal');
         // this.btnsProductosSubRama = this.querySelectorAll('#pmp-item-subRama');

         this.seccionModalExtrasPostres = this.querySelector('#phpp-modal-productos-postres');
         this.seccionModalExtrasGaseosasCerversas = this.querySelector('#phpp-modal-productos-gaseosasycervezas');

         this.cantidadProductoGeneralEtiqueta = this.querySelector('#phpd-cantidad-general');

         this.btnsContenedorCantidad = this.querySelectorAll('.pmph-cantidad-selector-button');
         this.btnsContenedorCantidad.forEach((btn) => {
            btn.addEventListener('click', this.actualizarEstadoBotonesInferiores.bind(this));
         });

         // INICIALIZAR EVENTOS
         // this.btnsProductosRamaPrincipales.forEach((btn) => {
         //    btn.addEventListener('click', this.procesoItemRamaPrincipal.bind(this, btn));
         // });
         // this.btnsProductosSubRama.forEach((btn) => {
         //    btn.addEventListener('click', this.procesoItemSubRama.bind(this, btn));
         // });
         this.estadoVacioContenedorPostres.addEventListener('click', this.abrirSeccionModalExtras.bind(this, 'postres'));
         this.estadoVacioContenedorGaseosasCerversas.addEventListener('click', this.abrirSeccionModalExtras.bind(this, 'gaseosasycervezas'));
         this.btnSeccionModalSalir.addEventListener('click', this.cerrarSeccionModalExtras.bind(this));
         this.btnSeccionModalGuardar.addEventListener('click', this.procesarSeccionModal.bind(this));
         this.anadirMasContenedorPostres.addEventListener('click', this.abrirSeccionModalExtras.bind(this, 'postres'));
         this.anadirMasContenedorGaseosasCerversas.addEventListener('click', this.abrirSeccionModalExtras.bind(this, 'gaseosasycervezas'));

         // INICIALIZAR ELEMENTOS Y PROCESOS CLAVES
         this.cantidadProductoGeneralEtiqueta.innerHTML = 1;
         await this.actualizarEstadoBotonesInferiores();

      } else {

         // REFERENCIAS ELEMENTOS
         this.estadoVacioContenedorPostres = this.querySelector('#phpm-vacio-extras-especiales-postres');
         this.estadoItemsContenedorPostres = this.querySelector('#phpm-extras-especiales-postres');
         this.anadirMasContenedorPostres = this.querySelector('#phpm-btn-anadir-extras-postres');
         this.btnsEliminarExtrasPostres = null;

         this.estadoVacioContenedorGaseosasCerversas = this.querySelector('#phpm-vacio-extras-especiales-gaseosasycervezas');
         this.estadoItemsContenedorGaseosasCerversas = this.querySelector('#phpm-extras-especiales-gaseosasycervezas');
         this.anadirMasContenedorGaseosasCerversas = this.querySelector('#phpm-btn-anadir-extras-gaseosasycervezas');
         this.btnsEliminarExtrasGaseosasCerversas = null;

         this.btnSeccionModalSalir = this.querySelector('#phppm-btn-salir');
         this.btnSeccionModalGuardar = this.querySelector('#phppm-btn-guardar');

         this.seccionProductosRamaPrincipales = this.querySelectorAll('#pmph-seleccion-rama-principal');
         this.seccionProductosSubRama = this.querySelectorAll('#pmph-seleccion-subRama');

         this.btnsProductosRamaPrincipales = this.querySelectorAll('#pmp-item-rama-principal');
         this.btnsProductosSubRama = this.querySelectorAll('#pmp-item-subRama');

         this.seccionModalExtrasPostres = this.querySelector('#phpp-modal-productos-postres');
         this.seccionModalExtrasGaseosasCerversas = this.querySelector('#phpp-modal-productos-gaseosasycervezas');

         this.cantidadProductoGeneralEtiqueta = this.querySelector('#phpd-cantidad-general');

         this.btnsContenedorCantidad = this.querySelectorAll('.pmph-cantidad-selector-button');
         this.btnsContenedorCantidad.forEach((btn) => {
            btn.addEventListener('click', this.actualizarEstadoBotonesInferiores.bind(this));
         });

         // INICIALIZAR EVENTOS
         this.btnsProductosRamaPrincipales.forEach((btn) => {
            btn.addEventListener('click', this.procesoItemRamaPrincipal.bind(this, btn));
         });
         this.btnsProductosSubRama.forEach((btn) => {
            btn.addEventListener('click', this.procesoItemSubRama.bind(this, btn));
         });
         this.estadoVacioContenedorPostres.addEventListener('click', this.abrirSeccionModalExtras.bind(this, 'postres'));
         this.estadoVacioContenedorGaseosasCerversas.addEventListener('click', this.abrirSeccionModalExtras.bind(this, 'gaseosasycervezas'));
         this.btnSeccionModalSalir.addEventListener('click', this.cerrarSeccionModalExtras.bind(this));
         this.btnSeccionModalGuardar.addEventListener('click', this.procesarSeccionModal.bind(this));
         this.anadirMasContenedorPostres.addEventListener('click', this.abrirSeccionModalExtras.bind(this, 'postres'));
         this.anadirMasContenedorGaseosasCerversas.addEventListener('click', this.abrirSeccionModalExtras.bind(this, 'gaseosasycervezas'));

         // INICIALIZAR ELEMENTOS Y PROCESOS CLAVES
         this.cantidadProductoGeneralEtiqueta.innerHTML = 1;
         await this.actualizarEstadoBotonesInferiores();

      }
   }

   async creacionHTMLGaseosasCervesas() {
      // Obtener coleccion de productos 
      const { informacionColeccion, productosColeccion } = await this.obtenerColeccionShopify('GASEOSAS');
      var contenidoHTML = `
        <div 
        style="display: none;"
        id="phpp-modal-productos-gaseosasycervezas" class="ppme-modal-informacion-extras-body">
          <small class="phpp-modal-extras-titulo">GASEOSAS Y CERVESAS</small>
          <div class="ppme-modal-items-extras">
      `;

      if (productosColeccion == null || productosColeccion == undefined) return;
      productosColeccion.forEach((producto) => {
         var stockTrabajo = this.obtenerStockGenericoTrabajo(producto);

         contenidoHTML += `
            <div 
            data-handle="${producto.handle}"
            data-idtrabajo="${producto.estructura.id}"
            data-idshopify="${producto.id}"
            class="ppme-modal-item-extra">
              <div class="ppme-modal-item-extra-imagen">
                <img src="${producto.imagen}" alt="${producto.titulo}" width="100%" height="100%">
              </div>
              <div class="ppme-modal-item-extra-info">
                <div class="ppme-modal-item-extra-info-detalle">
                  <p>${producto.titulo}</p>
                  <p>${producto.estructura.precio} Bs</p>
                </div>
                <cantidad-input>
                  <div
                    origen-trabajo="producto"
                    min="0"
                    max="${stockTrabajo}"
                    id="${producto.idTrabajo}"
                    handle="${producto.handle}"
                    class="ppme-modal-item-extra-cantidad"
                  >
                    <button
                      accion="decrementar"
                      class="pmph-cantidad-selector-button elemento-oculto icon-color-tertiary"
                    >
                      ${window.shopIcons.icon_basura}
                    </button>
                    <button
                      accion="decrementar"
                      class="ppme-modal-item-extra-cantidad-button icon-color-tertiary"
                    >
                      ${window.shopIcons.icon_menos}
                    </button>
                    <p id="phpd-cantidad-extras"">0</p>
                    <button
                      accion="incrementar"
                      class="ppme-modal-item-extra-cantidad-button icon-color-tertiary"
                    >
                      ${window.shopIcons.icon_mas}
                    </button>
                  </div>
                </cantidad-input>
              </div>
            </div>
      `;
      });

      contenidoHTML += `
          </div>
        </div>
      `;

      this.querySelector('.pmph-modal-informacion-extras').insertAdjacentHTML('afterbegin', contenidoHTML);
   }

   async creacionHTMLPostres() {
      // Obtener coleccion de productos 
      const { informacionColeccion, productosColeccion } = await this.obtenerColeccionShopify("POSTRES");
      console.log('productosColeccion POSTRES:', productosColeccion);

      var contenidoHTML = `
        <div 
        style="display: none;"
        id="phpp-modal-productos-postres" class="ppme-modal-informacion-extras-body">
          <small class="phpp-modal-extras-titulo">POSTRES</small>
          <div class="ppme-modal-items-extras">
      `;

      if (productosColeccion == null || productosColeccion == undefined) return;
      productosColeccion.forEach((producto) => {
         var stockTrabajo = this.obtenerStockGenericoTrabajo(producto);

         contenidoHTML += `
            <div 
            data-handle="${producto.handle}"
            data-idtrabajo="${producto.estructura.id}"
            data-idshopify="${producto.id}"
            class="ppme-modal-item-extra">
              <div class="ppme-modal-item-extra-imagen">
                <img src="${producto.imagen}" alt="${producto.titulo}" width="100%" height="100%">
              </div>
              <div class="ppme-modal-item-extra-info">
                <div class="ppme-modal-item-extra-info-detalle">
                  <p>${producto.titulo}</p>
                  <p>${producto.estructura.precio} Bs</p>
                </div>
                <cantidad-input>
                  <div
                    origen-trabajo="producto"
                    min="0"
                    max="${stockTrabajo}"
                    id="${producto.idTrabajo}"
                    handle="${producto.handle}"
                    class="ppme-modal-item-extra-cantidad"
                  >
                    <button
                      accion="decrementar"
                      class="pmph-cantidad-selector-button elemento-oculto icon-color-tertiary"
                    >
                      ${window.shopIcons.icon_basura}
                    </button>
                    <button
                      accion="decrementar"
                      class="ppme-modal-item-extra-cantidad-button icon-color-tertiary"
                    >
                      ${window.shopIcons.icon_menos}
                    </button>
                    <p id="phpd-cantidad-extras">0</p>
                    <button
                      accion="incrementar"
                      class="ppme-modal-item-extra-cantidad-button icon-color-tertiary"
                    >
                      ${window.shopIcons.icon_mas}
                    </button>
                  </div>
                </cantidad-input>
              </div>
            </div>
      `;
      });

      contenidoHTML += `
          </div>
        </div>
      `;

      this.querySelector('.pmph-modal-informacion-extras').insertAdjacentHTML('afterbegin', contenidoHTML);
   }

   async obtenerColeccionShopify(coleccion) {
      const graphQLQuery = `
        query GetCollectionByFlexibleTitle {
          collections(first: 1, query: "title:*${coleccion}*") {
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
         // Realiza la solicitud a la API de Shopifyy
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

            // Obtener el ID de la variante (extraer solo la parte numérica)
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
               stockTotal: stockGeneral,
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

   async procesoItemRamaPrincipal(btnElemento) {
      // SIEMPE LA LOGICA DE LOS PRINCIPALES ES QUE SELECCIONA UNO SOLO Y SUS SUB PRODUCTOS SE ACTUALIZAN

      // Ir a buscar al padre de esa seccion con id="pmph-seleccion-rama-principal"
      // Despues obtener 4 valores max - min - codigo - tipo boton
      const contenedorPadre = btnElemento.closest('#pmph-seleccion-rama-principal');
      const max = contenedorPadre.getAttribute('data-max');
      const min = contenedorPadre.getAttribute('data-min');
      const codigo = contenedorPadre.getAttribute('data-codigo');
      var cantidadSeleccionados = contenedorPadre.querySelectorAll('.seleccionado').length;

      // El btnElemento tiene un atributo data-idtrabajo y data-idshopify
      const idTrabajo = btnElemento.getAttribute('data-idtrabajo');
      const idShopify = btnElemento.getAttribute('data-idshopify');

      const estaSeleccionado = btnElemento.classList.contains('seleccionado');
      if (max == "1" && min == "1") {
         if (estaSeleccionado) {
            return;
         }
      } else {
         // Si la cantidad de seleccionados es mayor o igual al maximo permitido y se verifica si el elemento esta seleccionado
         // si este, lo esta se niega la seleccion y si no se lo selecciona
         if (cantidadSeleccionados >= max && !estaSeleccionado) return;
      }

      // item Rama Principal = {codigo, productos}
      // Aqui buscamos toda la informacion del elemento que fue seleccionado (item Rama Principal), donde buscamos la informacion
      // En el localStorage, se encuentra dentro de la propiedad productoParaEstructuraTrabajo, primero se localiza entre multiples
      // rama principal mediante el codigo, cuando se encuentra se busca entre sus productos, y se busca la coincidencia del idTrabajo o idShopify
      // Se va obtener 2 cosas, la informacion especifica del elemento seleccionado y sus hermanos de rama
      const dataLocalStorage = JSON.parse(localStorage.getItem('phpp-productoData'));
      let elementoTrabajo = null;
      let hermanosSeccion = null;

      dataLocalStorage.productoParaEstructuraTrabajo.some((objetoDetalle) => {
         if (objetoDetalle.codigo == codigo) {
            hermanosSeccion = objetoDetalle.productos;
            return objetoDetalle.productos.some((productoRamaPrincipal) => {
               if (productoRamaPrincipal.idTrabajo == idTrabajo || productoRamaPrincipal.idShopify == idShopify) {
                  elementoTrabajo = productoRamaPrincipal;
                  return true;
               }
               return false;
            });
         }
         return false;
      });

      // Aqui tenemos toda la informacion del elemento que se quiere seleccionar
      this.productoSeleccionadoRamaPrincipal = elementoTrabajo;

      if (estaSeleccionado) {
         // Si el elemento ya estaba seleccionado se lo deselecciona y se lo desactiva
         btnElemento.classList.remove('seleccionado');
         btnElemento.querySelector('.pmp-item-simple-escoger').innerHTML = this.iconos.iconEstadoOff;
         // {% comment %} cantidadSeleccionados--; {% endcomment %}
      } else {
         // Si el elemento no estaba seleccionado se lo selecciona y se lo activa
         btnElemento.classList.add('seleccionado');
         btnElemento.querySelector('.pmp-item-simple-escoger').innerHTML = this.iconos.iconEstadoOn;
         cantidadSeleccionados++;
      }

      // Detalle : los rama principal nunca tendra repetidos todos pertencen a una seccion unica 
      // NO SE UNIFICAN CON OTROS ELEMENTOS REPETIDOS
      // Primero se procede a actualizar su seccion de sitio donde esta con sus hermanos (rama principal)
      // Aqui se va a desactivar o deseleccionar deacuerdo a los max y min de la seccion
      contenedorPadre.querySelectorAll('#pmp-item-rama-principal').forEach((itemHTML) => {
         if (btnElemento == itemHTML) return;

         if (!(max == "1" && min == "1")) {
            if (itemHTML.classList.contains('seleccionado')) return;
         }

         if ((max == "1" && min == "1")) {
            itemHTML.classList.remove('seleccionado');
            itemHTML.querySelector('.pmp-item-simple-escoger').innerHTML = this.iconos.iconEstadoOff;
         } else {
            if (cantidadSeleccionados >= max) {
               itemHTML.classList.add('desactivado');
               itemHTML.querySelector('.pmp-item-simple-escoger').innerHTML = this.iconos.iconEstadoOff;
            } else {
               itemHTML.classList.remove('desactivado');
               itemHTML.classList.remove('seleccionado');
               itemHTML.querySelector('.pmp-item-simple-escoger').innerHTML = this.iconos.iconEstadoOff;
            }
         }
      });

      // Despues se procedera a buscar a la seccion que coincidan con el codigoPadre 
      // Cuando se encuentre con la seccion que corresponda se procede a buscar a sus hijos
      // Se va actualizar sus datos y desactivar a los elementos que no pertenezcan a la rama seleccionada
      this.seccionProductosSubRama.forEach((elementoSeccion) => {
         if (elementoSeccion.getAttribute('data-codigopadre') != codigo) return;

         let seleccionaPrimero = false;
         const codigoSeccion = elementoSeccion.getAttribute('data-codigo');
         const max = elementoSeccion.getAttribute('data-max');
         const min = elementoSeccion.getAttribute('data-min');
         const tipoBoton = elementoSeccion.getAttribute('tipo-boton');

         const productosSubRamaTrabajo = elementoTrabajo.ramas.find((rama) => rama.codigo == codigoSeccion);
         const hijosSeccion = elementoSeccion.querySelectorAll('#pmp-item-subRama');


         hijosSeccion.forEach((itemHTML) => {
            const idTrabajo = itemHTML.getAttribute('data-idtrabajo');
            const idShopify = itemHTML.getAttribute('data-idshopify');
            // El itemHTML tiene datos si esos datos se encuentran dentro de productosSubRamaTrabajo tons
            // Es un hijo de la rama seleccionada y se lo activa 
            const productoTrabajo = productosSubRamaTrabajo.productos.find((producto) => producto.idShopify == idShopify);

            if (!productoTrabajo) {
               // Si no se encontro el itemHTML dentro de productosSubRamaTrabajo se lo desactiva
               itemHTML.classList.remove('seleccionado');
               itemHTML.classList.add('desactivado');
               itemHTML.querySelector('.pmp-item-simple-escoger').innerHTML = tipoBoton == 'checkbox' ? this.iconos.iconCheckBoxOff : this.iconos.iconEstadoOff;
            } else {
               if (min == "1" && parseInt(productoTrabajo.precio) == 0 && seleccionaPrimero == false) {
                  // Si el min es 1 y el elemento productoTrabajo es 0 (se va preseleccionar) unicamente solo a este
                  itemHTML.classList.remove('desactivado');
                  itemHTML.classList.add('seleccionado');
                  itemHTML.querySelector('.pmp-item-simple-escoger').innerHTML = tipoBoton == 'checkbox' ? this.iconos.iconCheckBoxOn : this.iconos.iconEstadoOn;
                  seleccionaPrimero = true;
               } else {
                  itemHTML.classList.remove('desactivado');
                  itemHTML.classList.remove('seleccionado');
                  itemHTML.querySelector('.pmp-item-simple-escoger').innerHTML = tipoBoton == 'checkbox' ? this.iconos.iconCheckBoxOff : this.iconos.iconEstadoOff;
               }
               itemHTML.setAttribute('data-idShopify', productoTrabajo.idShopify);
               itemHTML.setAttribute('data-idtrabajo', productoTrabajo.idTrabajo);
               itemHTML.setAttribute('data-precio', productoTrabajo.precio);
               itemHTML.setAttribute('data-handle', productoTrabajo.handle);
               if (itemHTML.querySelectorAll('p').length == 2) {
                  itemHTML.querySelectorAll('p')[1].innerHTML = `+ ${productoTrabajo.precio} Bs`;
               }
            }
         });
      });

      // Hay que actualizar el valor de los botones inferiores
      await this.actualizarEstadoBotonesInferiores();
   }

   predefinirItemSeleccionado() {
   }

   async procesoItemSubRama(btnElemento) {
      // Busco al contenedor padre de la seccion con id="pmph-seleccion-subRama"
      // Obtengo su informacion max min codigo (tipo boton)
      const contenedorPadreSeccion = btnElemento.closest('#pmph-seleccion-subRama');
      const hermanosBtnElemento = contenedorPadreSeccion.querySelectorAll('#pmp-item-subRama');
      const max = contenedorPadreSeccion.getAttribute('data-max');
      const min = contenedorPadreSeccion.getAttribute('data-min');
      const codigo = contenedorPadreSeccion.getAttribute('data-codigo');
      const tipoBoton = contenedorPadreSeccion.getAttribute('tipo-boton');

      // El btnElemento tiene un atributo data-idtrabajo y data-idshopifyy
      const idTrabajo = btnElemento.getAttribute('data-idtrabajo');
      const idShopify = btnElemento.getAttribute('data-idshopify');

      var cantidadSeleccionados = contenedorPadreSeccion.querySelectorAll('.seleccionado').length;
      const estaSeleccionado = btnElemento.classList.contains('seleccionado');
      // Aqui la cantidad seleccionados es mayor o igual al maximo permitido y el elemento no esta seleccionado 
      // entonces no se puede seleccionar
      if (max == "1" && min == "1") {
         if (estaSeleccionado) {
            return;
         }
      } else {
         if (cantidadSeleccionados >= max && !estaSeleccionado) return;
      }

      if (estaSeleccionado) {
         // Se procede a seleccionar el elemento
         btnElemento.classList.remove('seleccionado');
         btnElemento.querySelector('.pmp-item-simple-escoger').innerHTML = tipoBoton == 'checkbox' ? this.iconos.iconCheckBoxOff : this.iconos.iconEstadoOff;
         // {% comment %} cantidadSeleccionados--; {% endcomment %}
      } else {
         // Se procede a seleccionar el elemento
         btnElemento.classList.add('seleccionado');
         btnElemento.querySelector('.pmp-item-simple-escoger').innerHTML = tipoBoton == 'checkbox' ? this.iconos.iconCheckBoxOn : this.iconos.iconEstadoOn;
         cantidadSeleccionados++;
      }


      // Son los elementos subRama sus productos del elemento seleccionado actual que es de una rama principal
      let elementosTrabajo = null;

      this.productoSeleccionadoRamaPrincipal.ramas.forEach((objetoDetalle) => {
         if (objetoDetalle.codigo == codigo) {
            elementosTrabajo = objetoDetalle.productos;
         }
      });

      // Se evalua a sus hermano
      hermanosBtnElemento.forEach((itemHTML) => {
         const idTrabajo = itemHTML.getAttribute('data-idtrabajo');
         const idShopify = itemHTML.getAttribute('data-idshopify');
         const estaSeleccionado = itemHTML.classList.contains('seleccionado');
         const estaDesactivado = itemHTML.classList.contains('desactivado');
         const itemHTMLPerteneceElementoTrabajo = elementosTrabajo.some((producto) => producto.idShopify == idShopify);

         if (!(max == "1" && min == "1")) {
            if (itemHTML.classList.contains('seleccionado')) return;
         }
         if (itemHTML == btnElemento) return;

         if ((max == "1" && min == "1")) {
            if (itemHTMLPerteneceElementoTrabajo) {
               itemHTML.classList.remove('seleccionado');
               itemHTML.querySelector('.pmp-item-simple-escoger').innerHTML = tipoBoton == 'checkbox' ? this.iconos.iconCheckBoxOff : this.iconos.iconEstadoOff;
            } else {
               itemHTML.classList.remove('seleccionado');
               itemHTML.classList.add('desactivado');
               itemHTML.querySelector('.pmp-item-simple-escoger').innerHTML = tipoBoton == 'checkbox' ? this.iconos.iconCheckBoxOff : this.iconos.iconEstadoOff;
            }
         } else {
            if (itemHTMLPerteneceElementoTrabajo) {
               if (cantidadSeleccionados >= max) {
                  itemHTML.classList.add('desactivado');
                  itemHTML.querySelector('.pmp-item-simple-escoger').innerHTML = tipoBoton == 'checkbox' ? this.iconos.iconCheckBoxOff : this.iconos.iconEstadoOff;
               } else {
                  itemHTML.classList.remove('desactivado');
                  itemHTML.classList.remove('seleccionado');
                  itemHTML.querySelector('.pmp-item-simple-escoger').innerHTML = tipoBoton == 'checkbox' ? this.iconos.iconCheckBoxOff : this.iconos.iconEstadoOff;
               }
            } else {
               itemHTML.classList.remove('seleccionado');
               itemHTML.classList.add('desactivado');
               itemHTML.querySelector('.pmp-item-simple-escoger').innerHTML = tipoBoton == 'checkbox' ? this.iconos.iconCheckBoxOff : this.iconos.iconEstadoOff;
            }
         }
      });

      // Hay que actualizar el valor de los botones inferiores
      await this.actualizarEstadoBotonesInferiores();
   }

   abrirSeccionModalExtras(tipoProductos) {
      if (tipoProductos == 'postres') {
         this.seccionModalExtrasPostres.style.display = 'flex';
         this.seccionModalExtrasGaseosasCerversas.style.display = 'none';
         this.modalProductoExtras.style.display = 'flex';
         this.cualSeccionExtrasEs = 'postres';
      }
      if (tipoProductos == 'gaseosasycervezas') {
         this.seccionModalExtrasPostres.style.display = 'none';
         this.seccionModalExtrasGaseosasCerversas.style.display = 'flex';
         this.modalProductoExtras.style.display = 'flex';
         this.cualSeccionExtrasEs = 'gaseosasycervezas';
      }
   }

   cerrarSeccionModalExtras() {
      this.seccionModalExtrasPostres.style.display = 'none';
      this.seccionModalExtrasGaseosasCerversas.style.display = 'none';
      this.modalProductoExtras.style.display = 'none';
   }

   async procesarSeccionModal() {
      this.cerrarSeccionModalExtras();
      var elClienteSiSelecciono = false;
      var itemsPedidos = [];

      if (this.cualSeccionExtrasEs == 'postres') {
         var contenedorItems = this.seccionModalExtrasPostres.querySelector('.ppme-modal-items-extras');
         var productosTrabajo = contenedorItems.querySelectorAll('.ppme-modal-item-extra');

         productosTrabajo.forEach((itemHTML) => {
            const idTrabajo = itemHTML.getAttribute('data-idtrabajo');
            const idShopify = itemHTML.getAttribute('data-idshopify');
            const cantidad = itemHTML.querySelector('#phpd-cantidad-extras').innerHTML;

            const imagen = itemHTML.querySelector('.ppme-modal-item-extra-imagen img').getAttribute('src');
            const [titulo, precio] = itemHTML.querySelectorAll('.ppme-modal-item-extra-info-detalle p');

            if (parseInt(cantidad) > 0) {
               elClienteSiSelecciono = true;
               itemsPedidos.push({
                  idTrabajo: idTrabajo,
                  idShopify: idShopify,
                  cantidad: cantidad,
                  titulo: titulo.innerHTML,
                  precio: precio.innerHTML,
                  imagen
               });
            }
         });

         this.itemsSeleccionadoPostres = itemsPedidos;
         if (elClienteSiSelecciono) {
            var contenidoHTML = ``;

            itemsPedidos.forEach((producto) => {
               contenidoHTML += `
            <div 
            data-handle="${producto.handle}"
            data-idtrabajo="${producto.idTrabajo}"
            data-idshopify="${producto.idShopify}"
            data-cantidad="${producto.cantidad}"
            data-titulo="${producto.titulo}"
            data-precio="${producto.precio}"
            id="pmp-item-extra" class="pmp-item-extra-seleccionado">
              <div class="pmp-item-extra-imagen">
                  ${producto.imagen == "" ?
                     `<img src="{{ 'imagen-pizza-1.png' | asset_url }}" alt="${producto.titulo}" width="100%" height="100%">` :
                     `<img src="${producto.imagen}" alt="${producto.titulo}" width="100%" height="100%">`}
              </div>
              <div class="pmp-item-extra-info">
                <div class="pmp-item-extra-detalle">
                  <p>x${producto.cantidad}</p>
                  <p>${producto.titulo}</p>
                  <p>${producto.precio}</p>
                </div>
                <button
                data-extras="postres"
                class="pmp-item-extra-delete icon-color-primary">
                  ${window.shopIcons.icon_basura}
                </button>
              </div>
            </div>
            `;
            });

            this.estadoItemsContenedorPostres.innerHTML = contenidoHTML;
            this.estadoItemsContenedorPostres.style.display = 'flex';
            this.anadirMasContenedorPostres.style.display = 'flex';
            this.estadoVacioContenedorPostres.style.display = 'none';
         }
         this.btnsEliminarExtrasPostres = this.estadoItemsContenedorPostres.querySelectorAll('.pmp-item-extra-delete');
         this.btnsEliminarExtrasPostres.forEach((btnEliminar) => {
            btnEliminar.addEventListener('click', this.eliminarItemExtras.bind(this, btnEliminar));
         });
      }

      if (this.cualSeccionExtrasEs == 'gaseosasycervezas') {
         var contenedorItems = this.seccionModalExtrasGaseosasCerversas.querySelector('.ppme-modal-items-extras');
         var productosTrabajo = contenedorItems.querySelectorAll('.ppme-modal-item-extra');

         productosTrabajo.forEach((itemHTML) => {
            const idTrabajo = itemHTML.getAttribute('data-idtrabajo');
            const idShopify = itemHTML.getAttribute('data-idshopify');
            const cantidad = itemHTML.querySelector('#phpd-cantidad-extras').innerHTML;

            const imagen = itemHTML.querySelector('.ppme-modal-item-extra-imagen img').getAttribute('src');
            const [titulo, precio] = itemHTML.querySelectorAll('.ppme-modal-item-extra-info-detalle p');
            // {% comment %} const [titulo, precio] = [informacionProducto[0], informacionProducto[1]]; {% endcomment %}

            if (parseInt(cantidad) > 0) {
               elClienteSiSelecciono = true;
               itemsPedidos.push({
                  idTrabajo: idTrabajo,
                  idShopify: idShopify,
                  cantidad: cantidad,
                  titulo: titulo.innerHTML,
                  precio: precio.innerHTML,
                  imagen
               });
            }
         });

         this.itemsSeleccionadoGaseosasCerversas = itemsPedidos;
         if (elClienteSiSelecciono) {
            var contenidoHTML = ``;

            itemsPedidos.forEach((producto) => {
               contenidoHTML += `
            <div 
            data-handle="${producto.handle}"
            data-idtrabajo="${producto.idTrabajo}"
            data-idshopify="${producto.idShopify}"
            data-cantidad="${producto.cantidad}"
            data-titulo="${producto.titulo}"
            data-precio="${producto.precio}"
            id="pmp-item-extra" class="pmp-item-extra-seleccionado">
              <div class="pmp-item-extra-imagen">
                  ${producto.imagen == "" ?
                     `<img src="{{ 'imagen-pizza-1.png' | asset_url }}" alt="${producto.titulo}" width="100%" height="100%">` :
                     `<img src="${producto.imagen}" alt="${producto.titulo}" width="100%" height="100%">`}
              </div>
              <div class="pmp-item-extra-info">
                <div class="pmp-item-extra-detalle">
                  <p>x${producto.cantidad}</p>
                  <p>${producto.titulo}</p>
                  <p>${producto.precio}</p>
                </div>
                <button
                data-extras="gaseosasycervezas"
                class="pmp-item-extra-delete icon-color-primary">
                  ${window.shopIcons.icon_basura}
                </button>
              </div>
            </div>
            `;
            });

            this.estadoItemsContenedorGaseosasCerversas.innerHTML = contenidoHTML;
            this.estadoItemsContenedorGaseosasCerversas.style.display = 'flex';
            this.anadirMasContenedorGaseosasCerversas.style.display = 'flex';
            this.estadoVacioContenedorGaseosasCerversas.style.display = 'none';
         }
         this.btnsEliminarExtrasGaseosasCerversas = this.estadoItemsContenedorGaseosasCerversas.querySelectorAll('.pmp-item-extra-delete');
         this.btnsEliminarExtrasGaseosasCerversas.forEach((btnEliminar) => {
            btnEliminar.addEventListener('click', this.eliminarItemExtras.bind(this, btnEliminar));
         });
      }

      await this.actualizarEstadoBotonesInferiores();
   }

   async eliminarItemExtras(btnElemento) {
      const tipoExtra = btnElemento.getAttribute('data-extras');

      if (tipoExtra == 'postres') {
         const contenedorPadre = btnElemento.closest('#pmp-item-extra');
         const idTrabajo = contenedorPadre.getAttribute('data-idtrabajo');
         const idShopify = contenedorPadre.getAttribute('data-idshopify');

         this.itemsSeleccionadoPostres = this.itemsSeleccionadoPostres.filter((item) => item.idTrabajo != idTrabajo && item.idShopify != idShopify);
         contenedorPadre.remove();

         // Buscar el elemento en id="phpp-modal-productos-postres" y Eliminarlo o limpiar la cantidad   
         // this.seccionModalExtrasPostres = this.querySelector('#phpp-modal-productos-postres');
         const productosModal = this.seccionModalExtrasPostres.querySelector('.ppme-modal-items-extras').querySelectorAll('.ppme-modal-item-extra');
         productosModal.forEach((itemHTML) => {
            const idTrabajoItem = itemHTML.getAttribute('data-idtrabajo');
            const idShopifyItem = itemHTML.getAttribute('data-idshopify');
            if (idShopifyItem == idShopify) {
               itemHTML.querySelector('#phpd-cantidad-extras').innerHTML = 0;
            }
         });

         // Proceder a contar la cantidad de elementos seleccionados en id="phpm-extras-especiales-postres"
         // this.estadoItemsContenedorPostres = this.querySelector('#phpm-extras-especiales-postres');
         const cantidadElementosSeleccionados = this.estadoItemsContenedorPostres.querySelectorAll('#pmp-item-extra').length;

         // Si la cantidad es 0 mostrar contenedor vacio y ocultar el btn anadir
         if (cantidadElementosSeleccionados == 0) {
            this.estadoItemsContenedorPostres.style.display = 'none';
            this.anadirMasContenedorPostres.style.display = 'none';
            this.estadoVacioContenedorPostres.style.display = 'flex';
         }
      }

      if (tipoExtra == 'gaseosasycervezas') {
         const contenedorPadre = btnElemento.closest('#pmp-item-extra');
         const idTrabajo = contenedorPadre.getAttribute('data-idtrabajo');
         const idShopify = contenedorPadre.getAttribute('data-idshopify');

         this.itemsSeleccionadoGaseosasCerversas = this.itemsSeleccionadoGaseosasCerversas.filter((item) => item.idTrabajo != idTrabajo && item.idShopify != idShopify);
         contenedorPadre.remove();

         // Buscar el elemento en id="phpp-modal-productos-gaseosas" y Eliminarlo o limpiar la cantidad
         // this.seccionModalExtrasGaseosasCerversas = this.querySelector('#phpp-modal-productos-gaseosas');
         const productosModal = this.seccionModalExtrasGaseosasCerversas.querySelector('.ppme-modal-items-extras').querySelectorAll('.ppme-modal-item-extra');
         productosModal.forEach((itemHTML) => {
            const idTrabajoItem = itemHTML.getAttribute('data-idtrabajo');
            const idShopifyItem = itemHTML.getAttribute('data-idshopify');
            if (idShopifyItem == idShopify) {
               itemHTML.querySelector('#phpd-cantidad-extras').innerHTML = 0;
            }
         });

         // Proceder a contar la cantidad de elementos seleccionados en id="phpm-extras-especiales-gaseosas"
         // this.estadoItemsContenedorGaseosasCerversas = this.querySelector('#phpm-extras-especiales-gaseosas');
         const cantidadElementosSeleccionados = this.estadoItemsContenedorGaseosasCerversas.querySelectorAll('#pmp-item-extra').length;

         // Si la cantidad es 0 mostrar contenedor vacio y ocultar el btn anadir
         if (cantidadElementosSeleccionados == 0) {
            this.estadoItemsContenedorGaseosasCerversas.style.display = 'none';
            this.anadirMasContenedorGaseosasCerversas.style.display = 'none';
            this.estadoVacioContenedorGaseosasCerversas.style.display = 'flex';
         }
      }

      await this.actualizarEstadoBotonesInferiores();
   }

   async actualizarEstadoBotonesInferiores() {
      var data = JSON.parse(localStorage.getItem('phpp-productoData'));
      const cantidadSolicitada = this.querySelector('#phpd-cantidad-general').innerHTML;

      var cumplenLasRamasPrincipales = false;
      var cumplenLasSubRamas = false;

      var cantidadPrecioHazUnPedido = parseInt(data.producto.precio);
      var cantidadPrecioTotalExtras = 0;

      this.seccionProductosRamaPrincipales.forEach((seccionHTML) => {
         const cantidadSeleccionados = seccionHTML.querySelectorAll('.seleccionado');
         const max = seccionHTML.getAttribute('data-max');
         const min = seccionHTML.getAttribute('data-min');

         cantidadSeleccionados.forEach((itemHTML) => {
            const precio = this.extraerPrecio(itemHTML);
            cantidadPrecioHazUnPedido += precio;
         });

         if (cantidadSeleccionados.length >= min && cantidadSeleccionados.length <= max) {
            cumplenLasRamasPrincipales = true;
         } else {
            cumplenLasRamasPrincipales = false;
         }
      });

      this.seccionProductosSubRama.forEach((seccionHTML) => {
         const cantidadSeleccionados = seccionHTML.querySelectorAll('.seleccionado');
         const max = seccionHTML.getAttribute('data-max');
         const min = seccionHTML.getAttribute('data-min');

         const cantidadItems = seccionHTML.querySelectorAll('#pmp-item-subRama').length;
         const cantidadDesactivados = seccionHTML.querySelectorAll('.desactivado').length;
         if (cantidadItems == cantidadDesactivados) {
            cumplenLasSubRamas = true;
            return;
         }

         cantidadSeleccionados.forEach((itemHTML) => {
            const precio = this.extraerPrecio(itemHTML);
            cantidadPrecioHazUnPedido += precio;
         });

         if (cantidadSeleccionados.length >= min && cantidadSeleccionados.length <= max) {
            cumplenLasSubRamas = true;
         } else {
            cumplenLasSubRamas = false;
         }
      });

      this.estadoItemsContenedorPostres.querySelectorAll('#pmp-item-extra').forEach((itemHTML) => {
         const precio = this.extraerPrecio(itemHTML);
         cantidadPrecioTotalExtras += precio;
      });

      this.estadoItemsContenedorGaseosasCerversas.querySelectorAll('#pmp-item-extra').forEach((itemHTML) => {
         const precio = this.extraerPrecio(itemHTML);
         cantidadPrecioTotalExtras += precio;
      });

      if (cumplenLasRamasPrincipales == false && cumplenLasSubRamas == false) {
         this.btnHazUnPedido.classList.add('desactivado');
         this.btnAgregarCarrito.classList.add('desactivado');
      } else {
         this.btnHazUnPedido.classList.remove('desactivado');
         this.btnAgregarCarrito.classList.remove('desactivado');
      }

      var precioTotalCarrito = 0;
      this.carritoShopify = await AuxiliaresGlobal.obtenerCarritoShopify();
      console.log('Testeo de ver si tengo todo el carrito: ', this.carritoShopify);
      this.carritoShopify.informacionCompleta.items.forEach((item) => {
         const dataProducto = JSON.parse(item.properties.estructura);
         precioTotalCarrito += parseInt(dataProducto.producto.precioTotalConjunto);
      });
      this.cantidadPrecioCarrito = precioTotalCarrito;

      this.cantidadPrecioHazUnPedido = cantidadPrecioHazUnPedido * parseInt(cantidadSolicitada) + cantidadPrecioTotalExtras;
      precioTotalCarrito = precioTotalCarrito + this.cantidadPrecioHazUnPedido;
      // console.log('Testeo de precio total carrito: ', {
      //   "testeo cantidadPrecioTotalExtras": cantidadPrecioTotalExtras,
      //   "testeo precioTotalCarrito": precioTotalCarrito,
      //   "testeo cantidadPrecioHazUnPedido": this.cantidadPrecioHazUnPedido,
      // });

      this.etiquetaHazUnPedido.innerHTML = `Bs ${this.cantidadPrecioHazUnPedido}`;
      this.etiquetaAgregarCarrito.innerHTML = `Bs ${precioTotalCarrito}`;
   }

   async procesoBotonesInferiores(tipoProceso) {
      MensajeCargaDatos.mostrar('Actualizando...');

      // Recorrer todo y generar un objeto para introducir al carrito
      const data = JSON.parse(localStorage.getItem('phpp-productoData'));
      const cantidadSolicitada = this.querySelector('#phpd-cantidad-general').innerHTML;
      var productosOpciones = [];
      var productosComple = [];

      this.seccionProductosRamaPrincipales.forEach((seccionHTML) => {
         const tituloSeccion = seccionHTML.querySelector(':scope > h3').innerHTML;
         const cantidadSeleccionados = seccionHTML.querySelectorAll('.seleccionado');
         cantidadSeleccionados.forEach((itemHTML) => {
            var idTrabajo = itemHTML.getAttribute('data-idtrabajo');
            var idShopify = itemHTML.getAttribute('data-idshopify');
            var precio = itemHTML.getAttribute('data-precio');
            var titulo = itemHTML.getAttribute('data-titulo');
            productosOpciones.push({
               tituloSeccion,
               idTrabajo: idTrabajo,
               idShopify: idShopify,
               cantidad: cantidadSolicitada,
               precio: precio,
               titulo
            });
         });
      });

      this.seccionProductosSubRama.forEach((seccionHTML) => {
         const tituloSeccion = seccionHTML.querySelector(':scope > h3').innerHTML;
         const cantidadSeleccionados = seccionHTML.querySelectorAll('.seleccionado');
         cantidadSeleccionados.forEach((itemHTML) => {
            var idTrabajo = itemHTML.getAttribute('data-idtrabajo');
            var idShopify = itemHTML.getAttribute('data-idshopify');
            var precio = itemHTML.getAttribute('data-precio');
            var titulo = itemHTML.getAttribute('data-titulo');
            productosOpciones.push({
               tituloSeccion,
               idTrabajo: idTrabajo,
               idShopify: idShopify,
               cantidad: cantidadSolicitada,
               titulo,
               precio: precio,
            });
         });
      });

      this.estadoItemsContenedorPostres.querySelectorAll('#pmp-item-extra').forEach((itemHTML) => {
         const contenedorPadre = itemHTML.closest('#pmph-seleccion-extras-postres');
         const tituloSeccion = contenedorPadre.querySelector('.pmph-extras-header').querySelector(':scope > h3').innerHTML;

         const idTrabajo = itemHTML.getAttribute('data-idtrabajo');
         const idShopify = itemHTML.getAttribute('data-idshopify');
         const cantidad = itemHTML.getAttribute('data-cantidad');
         const titulo = itemHTML.getAttribute('data-titulo');
         const precio = itemHTML.getAttribute('data-precio');
         productosComple.push({
            tituloSeccion,
            idTrabajo: idTrabajo,
            idShopify: idShopify,
            cantidad: cantidad,
            titulo: titulo,
            precio: precio
         });
      });

      this.estadoItemsContenedorGaseosasCerversas.querySelectorAll('#pmp-item-extra').forEach((itemHTML) => {
         const contenedorPadre = itemHTML.closest('#pmph-seleccion-extras-gaseosasycervezas');
         const tituloSeccion = contenedorPadre.querySelector('.pmph-extras-header').querySelector(':scope > h3').innerHTML;

         const idTrabajo = itemHTML.getAttribute('data-idtrabajo');
         const idShopify = itemHTML.getAttribute('data-idshopify');
         const cantidad = itemHTML.getAttribute('data-cantidad');
         const titulo = itemHTML.getAttribute('data-titulo');
         const precio = itemHTML.getAttribute('data-precio');
         productosComple.push({
            tituloSeccion,
            idTrabajo: idTrabajo,
            idShopify: idShopify,
            cantidad: cantidad,
            titulo: titulo,
            precio: precio
         });
      });

      // Agregar al carrito de Shopifyy
      const detalleProducto = {
         producto: {
            idShopify: data.producto.idShopify,
            idTrabajo: data.producto.idTrabajo,
            handle: data.producto.handle,
            titulo: data.producto.titulo,
            precioProducto: data.producto.precio,
            imagen: data.producto.imagen,
            cantidad: cantidadSolicitada,
            sucursales: data.producto.sucursales,
            stockTotal: data.producto.stockTotal,
            precioTotalConjunto: this.cantidadPrecioHazUnPedido * cantidadSolicitada,
         },
         opcionesPrincipales: {
            titulo: "Opciones Principales",
            productos: productosOpciones
         },
         complementos: {
            titulo: "Complementos",
            productos: productosComple
         }
      };

      console.log("Testeo al obtener carrito Shopify", this.carritoShopify);

      if (tipoProceso == 'hazunpedido') {
         MensajeCargaDatos.mostrar('Procesando pedido ...');
         await AuxiliaresGlobal.limpiarCarrito();
         await AuxiliaresGlobal.agregarCarrito(parseInt(cantidadSolicitada), parseInt(data.producto.idShopify), {
            properties: { "estructura": JSON.stringify(detalleProducto), }
         });
         MensajeCargaDatos.ocultar();
         window.location.href = '/pages/carrito';
      }

      if (tipoProceso == 'agregarcarrito') {
         await AuxiliaresGlobal.agregarCarrito(parseInt(cantidadSolicitada), parseInt(data.producto.idShopify), {
            properties: { "estructura": JSON.stringify(detalleProducto), }
         });

         if (this.cantidadClickCarrito == 0) {
            this.cantidadClickCarrito++;
            this.etiquetaHazUnPedido.innerHTML = `Bs ${(this.cantidadPrecioHazUnPedido * cantidadSolicitada)}`;
            var totalCarritoSiTodoSaleBien = this.cantidadPrecioCarrito + (this.cantidadPrecioHazUnPedido * parseInt(cantidadSolicitada));
            this.cantidadPrecioCarrito = totalCarritoSiTodoSaleBien + (this.cantidadPrecioHazUnPedido * parseInt(cantidadSolicitada));
            this.etiquetaAgregarCarrito.innerHTML = `Bs ${this.cantidadPrecioCarrito}`;
         } else {
            this.etiquetaHazUnPedido.innerHTML = `Bs ${this.cantidadPrecioHazUnPedido}`;
            var totalCarritoSiTodoSaleBien = this.cantidadPrecioCarrito + (this.cantidadPrecioHazUnPedido * parseInt(cantidadSolicitada));
            this.cantidadPrecioCarrito = totalCarritoSiTodoSaleBien;
            this.etiquetaAgregarCarrito.innerHTML = `Bs ${this.cantidadPrecioCarrito}`;
         }
         MensajeCargaDatos.ocultar();
         // Actualizar las etiquetas del HAAZ ME UN PEDIDO Y AGREGAR AL CARRITo  

      }
   }

   extraerPrecio(elementoHTML) {
      // Obtener el texto del párrafo que contiene el precio
      const elementoDetalle = elementoHTML.querySelector('.pmp-item-extra-detalle');
      const parrafoPrecio = elementoHTML.querySelector('.pmp-item-simple-info p') ||
         elementoHTML.querySelector('#pmp-item-info-precio') ||
         (elementoDetalle ? elementoDetalle.querySelectorAll('p')[2] : null);

      if (!parrafoPrecio) return 0;

      // Resto del código...
      // Expresión regular para coincidir con el patrón "+ X Bs"
      let regexPrecio = /\+ (\d+) Bs/;
      let coincidencia = parrafoPrecio.textContent.match(regexPrecio);

      // Si no encuentra ese patrón, probar con "X Bs"
      if (!coincidencia) {
         regexPrecio = /(\d+) Bs/;
         coincidencia = parrafoPrecio.textContent.match(regexPrecio);
      }

      // Si se encuentra una coincidencia, devolver el precio como número
      if (coincidencia && coincidencia[1]) {
         return parseInt(coincidencia[1], 10);
      }

      // Si no se encuentra coincidencia, devolver 0
      return 0;
   }

   dividirTitulo(titulo) {
      // Verificar si es el caso excepcional "Super Personal"
      if (titulo.includes("Super personal")) {
         return {
            importante: "Super personal",
            mensaje: titulo.replace("Super personal", "").trim()
         };
      }

      // Caso general: la primera palabra es la importante
      const palabras = titulo.split(" ");
      const importante = palabras[0];
      const mensaje = palabras.slice(1).join(" ");

      return {
         importante,
         mensaje
      };
   }

   obtenerStockGenericoTrabajo(productoTrabajo) {
      // Verificar si tenemos una sucursal seleccionada
      const dataSucursal = JSON.parse(localStorage.getItem('sucursal-informacion'));
      if (!dataSucursal || dataSucursal == "") return productoTrabajo.stockTotal;

      const sucursalEncontrada = productoTrabajo.sucursales.find(
         sucursal => sucursal.nombre == dataSucursal.name
      );

      return sucursalEncontrada
         ? parseInt(sucursalEncontrada.stock)
         : productoTrabajo.stockTotal;
   }

   optenerStockTrabajo() {
      // Verificar si tenemos una sucursal seleccionada
      const dataSucursal = JSON.parse(localStorage.getItem('sucursal-informacion'));
      // Información del producto
      const dataTrabajo = JSON.parse(localStorage.getItem('phpp-productoData'));

      if (!dataSucursal || dataSucursal == "") return dataTrabajo.producto.stockTotal;

      const sucursalEncontrada = dataTrabajo.producto.sucursales.find(
         sucursal => sucursal.nombre == dataSucursal.name
      );

      return sucursalEncontrada
         ? parseInt(sucursalEncontrada.stock)
         : dataTrabajo.producto.stockTotal;
   }

   contenidoSiTienePrecio(nombre, precio) {
      if (parseInt(precio) > 0) {
         return `
      <h3>${nombre}</h3>
      <p>+ ${precio} Bs</p>
      `;
      } else {
         return `
      <h3>${nombre}</h3>
      `;
      }
   }
}

customElements.define('ph-producto', PizzaHutProducto);