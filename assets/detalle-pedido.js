class DetallePedido extends HTMLElement {
    constructor() {
      super();
      this.coordenadas = { lat: -17.510420897741643, lng: -63.16459000457593 };
      this.direccionSeleccionada = false;
      this.marcadorMovible = null;
    }

    connectedCallback() {
      // REFERENCIAS A ELEMENTOS
      this.modalSnipper = this.querySelector('#phpdp-modal-snipper');
      this.detalleGeneralPedido = this.querySelector('#detalle-general-pedido');
      this.contenedorTrackingPedido = this.querySelector('#pdpph-tracking-pedido');
      this.detallaPedidof1 = this.querySelector('#etapa-1-detalle-pedido');
      this.detallaPedidof2 = this.querySelector('#etapa-2-detalle-pedido');
      this.infoCompraF2 = this.querySelector('#etapa-2-info-compra');
      this.btnVerMasDetalles = this.querySelector('#phpdp-btn-ver-mas-detalles');
      this.btnVolverInicio = this.querySelector('#phpdp-btn-volver-inicio');
      this.btnAbrirUbicacionLocal = this.querySelector('#phpdp-btn-abrir-mapa');

      // EVENTOS INICIALIZAR
      this.btnVolverInicio.addEventListener('click', this.volverAtras.bind(this));
      this.btnVerMasDetalles.addEventListener('click', this.verMasDetalles.bind(this));
      this.btnAbrirUbicacionLocal.addEventListener('click', this.abrirUbicacionLocal.bind(this));

      // INICIALIZA ELEMENTO Y PROCESOS (CLAVEES)
      this.modalSnipper.style.display = 'none';
      this.detalleGeneralPedido.style.display = 'none';
      this.contenedorTrackingPedido.style.display = 'none';
      this.detallaPedidof1.style.display = 'none';
      this.detallaPedidof2.style.display = 'none';
      this.infoCompraF2.style.display = 'none';
      this.btnVolverInicio.style.display = 'none';
      this.btnVerMasDetalles.style.display = 'none';

      this.inicializarDataLocalStorage();
    }

    inicializarDataLocalStorage() {
      const estadoDetallePedido = localStorage.getItem('ph-estadoDP');
      const origenHistorial = localStorage.getItem('ph-origenHistorial');

      if (estadoDetallePedido == 'etapa-1') {
        this.detallaPedidof1.style.display = 'flex';
        this.btnVerMasDetalles.style.display = 'flex';
        this.btnVolverInicio.style.display = 'flex';
        this.btnVolverInicio.style.display = 'flex';
        this.detalleGeneralPedido.style.display = 'flex';
        this.contenedorTrackingPedido.style.display = 'flex';
      }

      if (estadoDetallePedido == 'etapa-2') {
        this.detallaPedidof2.style.display = 'flex';
        this.infoCompraF2.style.display = 'flex';
        this.btnVolverInicio.style.display = 'flex';
        this.detalleGeneralPedido.style.display = 'flex';
        this.contenedorTrackingPedido.style.display = 'flex';
      }
    }

    inicializarMapaTest() {
      // 1. Crear el mapa
      if (!this.detalleGeneralPedido && !this.contenedorTrackingPedido) {
        alert('Error: No se pudo cargar el mapa. Por favor recarga la página');
        return;
      }

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

      const mapa = new google.maps.Map(this.contenedorTrackingPedido, configuracionMapa);

      // 2. Crear el marcador movible
      this.marcadorMovible = new google.maps.Marker({
        position: this.coordenadas,
        map: mapa,
        draggable: true,
        animation: google.maps.Animation.DROP,
      });

       // 3. Configurar el evento del marcador
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

    volverAtras(){
      const vinoHistorial = localStorage.getItem('ph-origenHistorial');
      if(vinoHistorial == 'true'){
        localStorage.removeItem('ph-estadoDP');
        localStorage.removeItem('ph-origenHistorial');
        window.history.back();
      }else {
        localStorage.setItem('ph-estadoDP', 'etapa-1');
        this.inicializarDataLocalStorage();
      }
    }

    verMasDetalles(){
      localStorage.setItem('ph-estadoDP', 'etapa-2');
      this.inicializarDataLocalStorage();
    }

    abrirUbicacionLocal(){
      window.open(`https://www.google.com/maps/search/?api=1&query=${this.coordenadas.lat},${this.coordenadas.lng}`, '_blank');
    }
}
  
customElements.define('detalle-pedido', DetallePedido);