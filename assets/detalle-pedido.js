class DetallePedido extends HTMLElement {
    constructor() {
        super();
        this.coordenadas = { lat: -17.510420897741643, lng: -63.16459000457593 };
        this.direccionSeleccionada = false;
        this.marcadorMovible = null;
        this.urlConsulta = "https://pizza-hut-bo.myshopify.com/admin/api/2025-01/graphql.json";
    }

    connectedCallback() {
    // REFERENCIAS A ELEMENTOS
    this.btnVerMasDetalles = this.querySelector('#phpdp-btn-ver-mas-detalles');
    this.btnVolverInicio = this.querySelector('#phpdp-btn-volver-inicio');
    this.btnVolverAtras = this.querySelector('#phpdp-btn-volver-atras');

    this.etiquetaIdShopifyOrder = this.querySelector('#phpdp-etiqueta-idshopify-order');
    this.etiquetaSubTotal = this.querySelector('#phpdp-etiqueta-subtotal');
    this.etiquetaTotal = this.querySelector('#phpdp-etiqueta-total');
    this.infoBasicaDetallePedido = this.querySelector('#phpdp-info-basica-detalle-pedido');

    this.seccionInfoEntregaLocal = this.querySelector('#phpdp-detalle-pedido-local');
    this.seccionInfoEntregaDomicilio = this.querySelector('#phpdp-detalle-envio-domicilio');
    this.seccionNotaDeEnvio = this.querySelector('#phpdp-seccion-nota-envio');
    this.seccionMasDetallesSobrePedido = this.querySelector('#phpdp-seccion-mas-detalle-sobre-pedido');

    this.seccionMetodoPago = this.querySelector('#phpdp-metodo-pago');

    // EVENTOS INICIALIZAR

    this.inicializarDataLocalStorage();
    }

    async inicializarDataLocalStorage() {
        const infoEtapaPagina = localStorage.getItem('ph-estadoDP');
        const idOrdenTrabajo = localStorage.getItem('ph-id-orden');

        if(infoEtapaPagina == null || infoEtapaPagina == undefined || idOrdenTrabajo == null || idOrdenTrabajo == undefined){
            window.location.href = '/';
            return;
        };

        const infoCompletaOrden = await this.traerInformacionOrdenTrabajo(idOrdenTrabajo);
        console.log('infoCompletaOrden: ', infoCompletaOrden);

        this.btnVolverInicio.style.display = 'flex';

        // if (infoEtapaPagina == 'etapa-1') {
        // this.detallaPedidof1.style.display = 'flex';
        // this.btnVerMasDetalles.style.display = 'flex';
        // this.btnVolverInicio.style.display = 'flex';
        // this.detalleGeneralPedido.style.display = 'flex';
        // this.contenedorTrackingPedido.style.display = 'flex';
        // }

        // if (infoEtapaPagina == 'etapa-2') {
        // this.detallaPedidof2.style.display = 'flex';
        // this.infoCompraF2.style.display = 'flex';
        // this.btnVolverInicio.style.display = 'flex';
        // this.detalleGeneralPedido.style.display = 'flex';
        // this.contenedorTrackingPedido.style.display = 'flex';
        // }
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

        // inicializarMapaTest() {
        // // 1. Crear el mapa
        // if (!this.detalleGeneralPedido && !this.contenedorTrackingPedido) {
        // alert('Error: No se pudo cargar el mapa. Por favor recarga la página');
        // return;
        // }

        // const configuracionMapa = {
        // center: this.coordenadas,
        // zoom: 16,
        // mapTypeControl: false,
        // streetViewControl: false,
        // fullscreenControl: false,
        // zoomControl: true,
        // scaleControl: false,
        // rotateControl: false,
        // panControl: false,
        // disableDefaultUI: false,
        // };

        // const mapa = new google.maps.Map(this.contenedorTrackingPedido, configuracionMapa);

        // // 2. Crear el marcador movible
        // this.marcadorMovible = new google.maps.Marker({
        // position: this.coordenadas,
        // map: mapa,
        // draggable: true,
        // animation: google.maps.Animation.DROP,
        // });

        // // 3. Configurar el evento del marcador
        // this.marcadorMovible.addListener('dragend', (evento) => {
        // try {
        // const posicion = this.marcadorMovible.getPosition();
        // this.coordenadas = { lat: posicion.lat(), lng: posicion.lng() };

        // console.log('Coordenadas: ', this.coordenadas);
        // mapa.panTo(posicion);
        // } catch {
        // alert('Error al actualizar la posición');
        // console.error(error);
        // }
        // });

        // // 4. Pedir la ubicacion del usuario y actualizar el marcador a esa posicion
        // if (navigator.geolocation) {
        // navigator.geolocation.getCurrentPosition(
        // (position) => {
        // try {
        // const miUbicacion = {
        // lat: position.coords.latitude,
        // lng: position.coords.longitude,
        // };

        // this.marcadorMovible.setPosition(miUbicacion);
        // mapa.panTo(miUbicacion);
        // this.coordenadas = miUbicacion;
        // } catch (error) {
        // alert('Error al obtener la ubicación: Por favor, verifique la ubicación de su dispositivo');
        // console.log('Error al obtener la ubicación 1: ', error);
        // }
        // },
        // (error) => {
        // alert('Error al obtener la ubicación: Por favor, verifique la ubicación de su dispositivo');
        // console.log('Error al obtener la ubicación 2: ', error);
        // }
        // );
        // }
        // }

        // volverAtras(){
        // const vinoHistorial = localStorage.getItem('ph-origenHistorial');
        // if(vinoHistorial == 'true'){
        // localStorage.removeItem('ph-estadoDP');
        // localStorage.removeItem('ph-origenHistorial');
        // window.history.back();
        // }else {
        // localStorage.setItem('ph-estadoDP', 'etapa-1');
        // this.inicializarDataLocalStorage();
        // }
        // }

        // verMasDetalles(){
        // localStorage.setItem('ph-estadoDP', 'etapa-2');
        // this.inicializarDataLocalStorage();
        // }

        // abrirUbicacionLocal(){
        // window.open(`https://www.google.com/maps/search/?api=1&query=${this.coordenadas.lat},${this.coordenadas.lng}`, '_blank');
        // }
    }

customElements.define('detalle-pedido', DetallePedido);