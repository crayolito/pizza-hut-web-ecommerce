// manejador-google-maps.js
// Este archivo debe ser incluido en el head, antes de cualquier componente que use Google Maps

// Crear un objeto global para manejar la inicialización de Google Maps
window.ManejadorMaps = {
    // Bandera para rastrear si Google Maps está cargado
    estaCargado: false,
    
    // Cola de callbacks para ejecutar cuando Maps esté listo
    callbacks: [],
    
    // Elemento del indicador de carga
    elementoCarga: null,
    
    // Inicializar el manejador
    inicializar: function() {
      // Si ya está inicializado, no hacer nada
      if (this.estaCargado) return;
      
      // Configurar un observador DOM para encontrar el elemento de carga cuando esté disponible
      this.configurarObservadorDOM();
      
      // Configurar un intervalo para verificar periódicamente si Google Maps está cargado
      const intervaloVerificacion = setInterval(() => {
        if (typeof google !== 'undefined' && google.maps) {
          clearInterval(intervaloVerificacion);
          this.estaCargado = true;
          console.log("Google Maps cargado correctamente");
          
          // Ocultar el indicador de carga si existe
          this.ocultarIndicadorCarga();
          
          // Ejecutar todos los callbacks en cola
          this.callbacks.forEach(callback => {
            try {
              callback();
            } catch (error) {
              console.error("Error al ejecutar callback de Google Maps:", error);
            }
          });
          this.callbacks = [];
        } else {
          // Si Google Maps aún no está cargado, mostrar el indicador de carga
          this.mostrarIndicadorCarga();
        }
      }, 100);
    },
    
    // Configurar un observador DOM para encontrar el elemento de carga cuando esté disponible
    configurarObservadorDOM: function() {
      // Intentar encontrar el elemento de carga directamente primero
      this.elementoCarga = document.querySelector('#ph-general-modal-carga');
      
      if (!this.elementoCarga) {
        // Si no existe todavía, configurar un observador para encontrarlo cuando esté disponible
        const observador = new MutationObserver((mutaciones) => {
          // Buscar el elemento de carga en cada mutación
          for (const mutacion of mutaciones) {
            if (mutacion.addedNodes.length) {
              const elementoCarga = document.querySelector('#ph-general-modal-carga');
              if (elementoCarga) {
                this.elementoCarga = elementoCarga;
                observador.disconnect();
                // Si Google Maps aún no está cargado, mostrar el indicador de carga
                if (!this.estaCargado) {
                  this.mostrarIndicadorCarga();
                }
                break;
              }
            }
          }
        });
        
        // Comenzar a observar el documento para cambios en el DOM
        observador.observe(document.body, { childList: true, subtree: true });
      }
    },
    
    // Mostrar el indicador de carga
    mostrarIndicadorCarga: function() {
      if (this.elementoCarga) {
        this.elementoCarga.style.display = 'flex';
      }
    },
    
    // Ocultar el indicador de carga
    ocultarIndicadorCarga: function() {
      if (this.elementoCarga) {
        this.elementoCarga.style.display = 'none';
      }
    },
    
    // Método para llamar cuando un componente necesita usar Google Maps
    cuandoEsteListoEjecutar: function(callback) {
      if (this.estaCargado) {
        // Si ya está cargado, ejecutar inmediatamente
        callback();
      } else {
        // De lo contrario, poner el callback en cola
        this.callbacks.push(callback);
        // Mostrar el indicador de carga mientras esperamos
        this.mostrarIndicadorCarga();
      }
    }
  };
  
  // Inicializar el manejador cuando se carga el script
window.ManejadorMaps.inicializar();