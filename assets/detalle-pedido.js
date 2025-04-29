class DetallePedido extends HTMLElement {
  constructor() {
    super();
    this.coordenadas = { lat: -17.510420897741643, lng: -63.16459000457593 };
    this.direccionSeleccionada = false;
    this.marcadorMovible = null;
    this.urlConsulta = "https://pizza-hut-bo.myshopify.com/admin/api/2025-01/graphql.json";
    this.estadoEtapaPagina = "";
  }

  connectedCallback() {
    // REFERENCIAS A ELEMENTOS
    this.btnVerMasDetalles = this.querySelector('#phpdp-btn-ver-mas-detalles');
    this.btnVolverInicio = this.querySelector('#phpdp-btn-volver-inicio');
    this.btnVolverAtras = this.querySelector('#phpdp-btn-volver-atras');

    this.seccionGeneralInfoBasica = this.querySelector('#phpdp-seccion-general-info-basica');
    this.seccionInfoBasica = this.querySelector('#phpdp-seccion-info-basica');
    this.infoBasicaDetalle = this.querySelector('#phpdp-info-basica-detalle');

    this.seccionInfoEntregaLocal = this.querySelector('#phpdp-detalle-pedido-local');
    this.seccionInfoEntregaDomicilio = this.querySelector('#phpdp-detalle-envio-domicilio');
    this.seccionNotaDeEnvio = this.querySelector('#phpdp-seccion-nota-envio');
    this.etiquetaNotaDeEnvio = this.querySelector('#phpdp-etiqueta-nota-envio');

    this.seccionSuperiorDetallePedido = this.querySelector('#phpdp-seccion-superior-detalle-pedido');
    this.etiquetaTotalPrecioSuperior = this.querySelector('#phpdp-etiqueta-totalPedido');
    this.infoSuperiorDetallePedido = this.querySelector('#phpdp-info-superior-detalle-pedido');
    this.etiquetaIdShopifyOrder = this.querySelector('#phpdp-etiqueta-idshopify-order');
    this.etiquetaSubTotal = this.querySelector('#phpdp-etiqueta-subtotal');
    this.etiquetaTotal = this.querySelector('#phpdp-etiqueta-total');

    this.seccionInferiorDetallePedido = this.querySelector('#phpdp-seccion-inferior-detalle-pedido');
    this.etiquetaTipoMetodoEntrega = this.querySelector('#phpdp-etiqueta-metodo-entrega');
    this.seccionDetalleLocal = this.querySelector('#pdpph-seccion-detalle-inferior-local');
    this.seccionDetalleDomicilio = this.querySelector('#pdpph-seccion-detalle-inferior-domicilio');
    this.seccionPedidoCliente = this.querySelector('#phpdp-empieza-seccion-pedido');

    this.seccionMetodoPago = this.querySelector('#phpdp-metodo-pago');
    this.btnAbirUbicacionMapa = this.querySelector('#phpdp-btn-abrir-mapa');

    // EVENTOS INICIALIZAR
    this.btnVerMasDetalles.addEventListener('click', this.btnVerMasDetallesClick.bind(this));
    this.btnVolverInicio.addEventListener('click', this.btnVolverInicioClick.bind(this));
    this.btnVolverAtras.addEventListener('click', this.btnVolverAtrasClick.bind(this));
    this.btnAbirUbicacionMapa.addEventListener('click', this.btnAbirUbicacionMapaClick.bind(this));
    this.inicializarDataLocalStorage();
  }

  async inicializarDataLocalStorage() {
    const infoEtapaPagina = localStorage.getItem('ph-estadoDP');
    const idOrdenTrabajo = localStorage.getItem('ph-id-orden');
    this.estadoEtapaPagina = infoEtapaPagina;

    if (infoEtapaPagina == null || infoEtapaPagina == undefined || idOrdenTrabajo == null || idOrdenTrabajo == undefined) {
      window.location.href = '/';
      return;
    };


    MensajeCargaDatos.mostrar('Cargando informacion ...');
    const infoCompletaOrden = await this.traerInformacionOrdenTrabajo(idOrdenTrabajo);
    console.log('infoCompletaOrden: ', infoCompletaOrden);
    const metodoEntrega = infoCompletaOrden.orden.notasPersonalizadas[0].value;
    const idShopifyOrder = infoCompletaOrden.orden.id.split('/').pop();

    if (this.estadoEtapaPagina == "etapa-1") {
      this.seccionGeneralInfoBasica.style.display = 'flex';
      this.btnVolverInicio.style.display = 'flex';
      this.btnVerMasDetalles.style.display = 'flex';

      const etiquetaInfoBasica = this.seccionInfoBasica.querySelector('#phpdp-etiqueta-tipo-pedido');
      etiquetaInfoBasica.textContent = metodoEntrega == "Domicilio" ? "Envío a Domicilio" : "En Local";
      const contenedorIcono = this.seccionInfoBasica.querySelector('.pdpph-mensaje-etapa1-icono');
      contenedorIcono.innerHTML = metodoEntrega == "Domicilio" ? `${window.shopIcons.icon_recogo_delivery}` : `${window.shopIcons.icon_recogo_local}`;

      // Solo necesito obtener los numeros
      const { fechaFormateada, horaCompletada } = this.formatearFechaInfoBasica(infoCompletaOrden.orden.fechaCompletado);

      this.infoBasicaDetalle.innerHTML = `
                <h3>Nº de pedido ${idShopifyOrder}</h3>
                <h3>ESTARA LISTO A las ${horaCompletada}</h3>
                <h3>fecha ${fechaFormateada}</h3>
            `;
    }

    if (this.estadoEtapaPagina == "etapa-2") {
      this.btnVolverAtras.style.display = 'flex';
      this.seccionSuperiorDetallePedido.style.display = 'flex';
      this.seccionInferiorDetallePedido.style.display = 'flex';
    }

    const textosCombos = this.formatoTextosCombos(infoCompletaOrden.orden.productos.length);
    this.etiquetaIdShopifyOrder.textContent = `#${idShopifyOrder}`;
    this.infoSuperiorDetallePedido.innerHTML = `
            <p>${textosCombos}</p>
            <p>•</p>
            <p>
              Pedido realizado: ${infoCompletaOrden.orden.fechaCompletado}
            </p>
        `;

    var totalPrecioConjunto = 0;
    infoCompletaOrden.orden.productos.forEach(item => {
      totalPrecioConjunto += item.precioUnitarioConDescuento * item.cantidad;
    });
    this.etiquetaTotalPrecioSuperior.textContent = `${totalPrecioConjunto} Bs`
    this.etiquetaTipoMetodoEntrega.textContent = metodoEntrega == "Domicilio" ? "Envío a Domicilio" : "Pedido en Local";
    metodoEntrega == "Domicilio" ? this.seccionInfoEntregaDomicilio.style.display = 'flex' : this.seccionInfoEntregaLocal.style.display = 'flex';
    const infoProcesoCheckout = JSON.parse(infoCompletaOrden.orden.notasPersonalizadas[1].value);
    const infoCarritoProceso = JSON.parse(infoCompletaOrden.orden.notasPersonalizadas[2].value);
    if (metodoEntrega == "Domicilio") {
      const dataInformacionMetodoEntrega = infoProcesoCheckout.metodo_envio_seleccionado.info_seleccionada;
      this.coordenadas = { lat: dataInformacionMetodoEntrega.lat, lng: dataInformacionMetodoEntrega.lng };
      this.seccionInfoEntregaDomicilio.insertAdjacentHTML('afterbegin', `
        <h3>${dataInformacionMetodoEntrega.alias}</h3>
        <h4>${dataInformacionMetodoEntrega.indicacione}</h4>
      `);

      this.seccionInfoEntregaDomicilio.style.display = 'flex';
    } else {
      const dataInformacionMetodoEntrega = infoProcesoCheckout.metodo_envio_seleccionado.local_seleccionado;
      this.coordenadas = { lat: dataInformacionMetodoEntrega.lat, lng: dataInformacionMetodoEntrega.lng };
      this.seccionInfoEntregaLocal.insertAdjacentHTML('afterbegin', `
        <h3 class="color-letras-primary">${dataInformacionMetodoEntrega.name}</h3>
        <div class="pdpph-etapa2-info-local">
        ${window.shopIcons.icon_location_on}
        <p>${dataInformacionMetodoEntrega.localizacion}, Santa Cruz de la Sierra</p>
        </div>
        <div class="pdpph-etapa2-info-local">
          ${window.shopIcons.icon_headser_mic}
          <p>+591 ${dataInformacionMetodoEntrega.telefono}</p>
          </div>
      `);
      this.seccionInfoEntregaLocal.style.display = 'flex';
    }

    console.log('Testeo de informacion : ', {
      infoProcesoCheckout,
      infoCarritoProceso
    });

    const metodoPago = infoProcesoCheckout.info_metodo_pago_seleccionado.metodo_pago
    if (metodoPago == "pago-codigo-qr") {
      this.seccionMetodoPago.innerHTML = `
      ${window.shopIcons.icon_qr}
      <p class="color-letras-extra">
        Pago mediante QR
      </p>
      `;
    }
    if (metodoPago == "pago-tarjeta-credito") {
      this.seccionMetodoPago.innerHTML = `
      ${window.shopIcons.icon_tarjeta_credito}
      <p class="color-letras-extra">
        Pago mediante tarjeta de credito
      </p>
      `;
    }

    if (metodoPago == "pago-efectivo") {
      this.seccionMetodoPago.innerHTML = `
      ${window.shopIcons.icon_efectivo}
      <p class="color-letras-extra">
        Pago en efectivo
      </p>
      `;
    }

    this.etiquetaSubTotal.textContent = `${infoCompletaOrden.orden.totales.subtotal} Bs`;
    this.etiquetaTotal.textContent = `${infoCompletaOrden.orden.totales.subtotal} Bs`;

    console.log('Testeo de nota del pedido : ', infoProcesoCheckout.nota_para_envio);
    if (infoProcesoCheckout.nota_para_envio == "") {
      this.seccionNotaDeEnvio.style.display = 'none';
    } else {
      this.seccionNotaDeEnvio.style.display = 'flex';
      this.etiquetaNotaDeEnvio.textContent = infoProcesoCheckout.nota_para_envio;
    }

    var contenidoHTMLPedido = '';
    infoCarritoProceso.forEach(item => {
      const dataEstructuraProducto = JSON.parse(item.properties.estructura);
      contenidoHTMLPedido += `
        <div class="container-sub-smecph">
          <div class="pdpph-etapa2-info-pedido">
            <p>${dataEstructuraProducto.producto.titulo}</p>
            <p class="color-letras-extra">Cantidad: ${dataEstructuraProducto.producto.cantidad}</p>
          </div>
          <p style="font-weight: 700;" class="color-letras-primary">${dataEstructuraProducto.producto.precioTotalConjunto} Bs</p>
        </div>
      `;
    });

    this.seccionPedidoCliente.insertAdjacentHTML('afterend', contenidoHTMLPedido)
    MensajeCargaDatos.ocultar();
  }

  async traerInformacionOrdenTrabajo(idOrdenTrabajo) {
    try {
      // Asegurarse de que el ID tenga el formato correcto para la consulta GraphQL
      const idFormateado = idOrdenTrabajo.includes('gid://')
        ? idOrdenTrabajo
        : `gid://shopify/DraftOrder/${idOrdenTrabajo}`;

      // Definir la consulta GraphQL
      const consultaOrden = `
        query GetDraftOrderDetails {
        draftOrder(id: "${idFormateado}") {
        id
        name
        status
        email
        createdAt
        updatedAt
        completedAt
        currencyCode
        taxesIncluded
        taxExempt
        lineItems(first: 10) {
        edges {
        node {
        id
        name
        quantity
        sku
        vendor
        requiresShipping
        taxable
        isGiftCard
        originalUnitPrice
        discountedUnitPrice
        taxLines {
        title
        rate
        price
        }
        }
        }
        }
        shippingAddress {
        firstName
        lastName
        address1
        city
        province
        country
        zip
        phone
        }
        customAttributes {
        key
        value
        }
        }
        }
        `;

      // Obtener token de acceso (similar al ejemplo proporcionado)
      const tokenAcceso = 'shpat_' + '45f4a7476152f4881d058f87ce063698';

      // Realizar la petición al API de Shopify
      const respuesta = await fetch(this.urlConsulta, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': tokenAcceso
        },
        body: JSON.stringify({
          query: consultaOrden
        })
      });

      const datos = await respuesta.json();
      console.log('Respuesta completa de Shopify:', datos);

      // Verificar si hay errores en la respuesta
      if (datos.errors) {
        console.error('Errores en la respuesta GraphQL:', datos.errors);
        return { exito: false, errores: datos.errors };
      }

      // Verificar si se obtuvo la orden correctamente
      if (!datos.data || !datos.data.draftOrder) {
        return {
          exito: false,
          mensaje: 'No se encontró la orden solicitada'
        };
      }

      // Mapear la información de la orden a español
      const ordenOriginal = datos.data.draftOrder;

      // Formatear productos (lineItems)
      const productosFormateados = ordenOriginal.lineItems.edges.map(edge => {
        const item = edge.node;

        // Obtener estructura del producto si existe
        let estructuraItem = null;
        try {
          // Buscar en datos de carrito que coincidan con este item por id o nombre
          const datosCarrito = this.buscarItemEnCarrito(ordenOriginal.customAttributes, item.id, item.name);
          if (datosCarrito && datosCarrito.properties && datosCarrito.properties.estructura) {
            estructuraItem = JSON.parse(datosCarrito.properties.estructura);
          }
        } catch (error) {
          console.error('Error al procesar estructura del item:', error);
        }

        return {
          id: item.id,
          nombre: item.name,
          cantidad: item.quantity,
          sku: item.sku || '',
          proveedor: item.vendor || '',
          requiereEnvio: item.requiresShipping,
          gravable: item.taxable,
          esTarjetaRegalo: item.isGiftCard,
          precioUnitarioOriginal: parseFloat(item.originalUnitPrice),
          precioUnitarioConDescuento: parseFloat(item.discountedUnitPrice),
          impuestos: item.taxLines ? item.taxLines.map(tax => ({
            titulo: tax.title,
            tasa: tax.rate,
            importe: parseFloat(tax.price)
          })) : [],
          // Información detallada si está disponible
          detalles: estructuraItem ? {
            productoBase: estructuraItem.producto || {},
            opcionesPrincipales: estructuraItem.opcionesPrincipales || {},
            complementos: estructuraItem.complementos || {}
          } : null
        };
      });

      // Procesar dirección de envío
      const direccionEnvio = ordenOriginal.shippingAddress ? {
        nombre: ordenOriginal.shippingAddress.firstName,
        apellido: ordenOriginal.shippingAddress.lastName,
        direccion: ordenOriginal.shippingAddress.address1,
        ciudad: ordenOriginal.shippingAddress.city,
        provincia: ordenOriginal.shippingAddress.province,
        pais: ordenOriginal.shippingAddress.country,
        codigoPostal: ordenOriginal.shippingAddress.zip,
        telefono: ordenOriginal.shippingAddress.phone
      } : null;

      // Procesar información de pago y entrega de los atributos personalizados
      // const atributosPersonalizados = this.procesarAtributosPersonalizados(ordenOriginal.customAttributes);

      // Calcular totales
      const subtotal = productosFormateados.reduce((sum, item) =>
        sum + (item.precioUnitarioOriginal * item.cantidad), 0);

      const impuestoTotal = productosFormateados.reduce((sum, item) => {
        const impuestoPorItem = item.impuestos ?
          item.impuestos.reduce((taxSum, tax) => taxSum + parseFloat(tax.importe), 0) : 0;
        return sum + impuestoPorItem;
      }, 0);

      // Crear objeto con la información en español
      const ordenFormateada = {
        exito: true,
        orden: {
          id: ordenOriginal.id,
          numero: ordenOriginal.name,
          estado: this.traducirEstado(ordenOriginal.status),
          email: ordenOriginal.email,
          fechaCreacion: this.formatearFecha(ordenOriginal.createdAt),
          fechaActualizacion: this.formatearFecha(ordenOriginal.updatedAt),
          fechaCompletado: this.formatearFecha(ordenOriginal.completedAt),
          moneda: ordenOriginal.currencyCode,
          impuestosIncluidos: ordenOriginal.taxesIncluded,
          exentoImpuestos: ordenOriginal.taxExempt,
          productos: productosFormateados,
          direccionEnvio: direccionEnvio,
          notasPersonalizadas: ordenOriginal.customAttributes,
          totales: {
            subtotal: subtotal.toFixed(2),
            impuestos: impuestoTotal.toFixed(2),
            total: (subtotal + impuestoTotal).toFixed(2)
          }
        }
      };

      return ordenFormateada;
    } catch (error) {
      console.error('Error al obtener información de la orden:', error);
      return {
        exito: false,
        error: error.message
      };
    }
  }

  // Método auxiliar para traducir el estado de la orden
  traducirEstado(estado) {
    const traducciones = {
      'OPEN': 'Abierta',
      'COMPLETED': 'Completada',
      'INVOICE_SENT': 'Factura Enviada',
      'PENDING': 'Pendiente'
    };

    return traducciones[estado] || estado;
  }

  formatearFechaInfoBasica(fechaCompletada) {
    const meses = [
      'ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.',
      'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'
    ];

    const [fecha, hora] = fechaCompletada.split(', ');
    const [dia, mes, anio] = fecha.split('/');

    const fechaFormateada = `${dia} de ${meses[parseInt(mes) - 1]} ${anio}`;

    return {
      fechaFormateada,
      horaCompletada: hora
    };
  }

  // Método para formatear fecha
  formatearFecha(fechaISO) {
    if (!fechaISO) return null;

    try {
      const fecha = new Date(fechaISO);
      return fecha.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return fechaISO; // Devolver original si hay error
    }
  }

  // Método para buscar item en datos de carrito
  buscarItemEnCarrito(customAttributes, itemId, itemName) {
    try {
      // Buscar el atributo de datos de carrito
      const atributoCarrito = customAttributes.find(attr => attr.key === 'Datos Carrito PRoceso');
      if (!atributoCarrito) return null;

      // Parsear los datos de carrito
      const datosCarrito = JSON.parse(atributoCarrito.value);
      if (!Array.isArray(datosCarrito)) return null;

      // Buscar por ID o nombre
      const idCorto = itemId.split('/').pop();

      // Primero intentar con ID exacto
      let itemEncontrado = datosCarrito.find(item =>
        item.id.toString() === idCorto ||
        item.variant_id.toString() === idCorto
      );

      // Si no encontramos por ID, buscar por nombre
      if (!itemEncontrado) {
        itemEncontrado = datosCarrito.find(item =>
          item.title.toLowerCase() === itemName.toLowerCase()
        );
      }

      return itemEncontrado;
    } catch (error) {
      console.error('Error al buscar item en carrito:', error);
      return null;
    }
  }

  // Método auxiliar para procesar atributos personalizados
  procesarAtributosPersonalizados(atributos) {
    const resultado = {};

    // Procesar todos los atributos
    atributos.forEach(attr => {
      // Procesar según el tipo de atributo
      if (attr.key === 'Metodo Entrega') {
        resultado.metodoEntrega = attr.value;
      }
      else if (attr.key === 'Datos Proceso Checkout') {
        try {
          resultado.datosCheckout = JSON.parse(attr.value);

          // Extraer información de pago
          if (resultado.datosCheckout.info_metodo_pago_seleccionado) {
            resultado.infoPago = resultado.datosCheckout.info_metodo_pago_seleccionado;
          }
        } catch (e) {
          console.error('Error al parsear datos de checkout:', e);
          resultado.datosCheckout = { error: 'Error al parsear datos de checkout' };
        }
      }
      else if (attr.key === 'Datos Carrito PRoceso') {
        try {
          resultado.datosCarrito = JSON.parse(attr.value);
        } catch (e) {
          console.error('Error al parsear datos de carrito:', e);
          resultado.datosCarrito = { error: 'Error al parsear datos de carrito' };
        }
      }
      else {
        // Para otros atributos, mantener el nombre original
        try {
          if (attr.value.startsWith('{') || attr.value.startsWith('[')) {
            resultado[attr.key] = JSON.parse(attr.value);
          } else {
            resultado[attr.key] = attr.value;
          }
        } catch (e) {
          resultado[attr.key] = attr.value;
        }
      }
    });

    return resultado;
  }

  formatoTextosCombos(cantidad) {
    // Verificar si es un número válido
    if (typeof cantidad !== 'number' || isNaN(cantidad) || cantidad < 0) {
      return "0 Combos";
    }
    // Singular si es 1, plural para el resto
    if (cantidad === 1) {
      return "1 Combo";
    } else {
      return `${cantidad} Combos`;
    }
  }

  btnVerMasDetallesClick() {
    this.seccionGeneralInfoBasica.style.display = 'none';
    this.seccionSuperiorDetallePedido.style.display = 'flex';
    this.seccionInferiorDetallePedido.style.display = 'flex';
    this.btnVerMasDetalles.style.display = 'none';
    this.btnVolverInicio.style.display = 'none';
    this.btnVolverAtras.style.display = 'flex';
  }

  btnVolverInicioClick() {
    window.history.back();
  }

  btnVolverAtrasClick() {
    if (this.estadoEtapaPagina == "etapa-2") {
      window.history.back();
    }
    // 
    this.seccionGeneralInfoBasica.style.display = 'flex';
    this.seccionSuperiorDetallePedido.style.display = 'none';
    this.seccionInferiorDetallePedido.style.display = 'none';
    this.btnVerMasDetalles.style.display = 'flex';
    this.btnVolverInicio.style.display = 'flex';
    this.btnVolverAtras.style.display = 'none';
  }

  btnAbirUbicacionMapaClick() {
    const url = `https://www.google.com/maps/search/?api=1&query=${this.coordenadas.lat},${this.coordenadas.lng}`;
    window.open(url, '_blank');
  }
}

customElements.define('detalle-pedido', DetallePedido);