    // document.addEventListener('DOMContentLoaded', function () {
    //   // Selecciona todos los elementos que tienen overflow-x scrollable
    //   const elementosScrollables = Array.from(document.querySelectorAll('*')).filter((elemento) => {
    //     const estilo = window.getComputedStyle(elemento);
    //     console.log('estilo', estilo);
    //     // Filtra elementos que tienen overflow-x auto o scroll y necesitan scroll horizontal
    //     return (estilo.overflowX === 'auto' || estilo.overflowX === 'scroll') && elemento.scrollWidth > elemento.clientWidth;

    //   });

    //   // Configura cada elemento scrollable
    //   elementosScrollables.forEach((elemento) => {
    //     // Mantenemos el código comentado como lo solicitaste
    //     {% comment %} element.addEventListener(
    //       'wheel',
    //       function (event) {
    //         if (isMouseOver(event, this)) {
    //           event.preventDefault();
    //           const scrollFactor = 1.5;
    //           this.scrollLeft += event.deltaY * scrollFactor;
    //         }
    //       }
    //       { passive: false }
    //     ); {% endcomment %}

    //     // Variables para controlar el estado del arrastre
    //     let estaPresionado = false;
    //     let posicionInicialX;
    //     let posicionScrollInicial;

    //     // 1. Cuando se presiona el botón del mouse
    //     elemento.addEventListener('mousedown', (evento) => {
    //       estaPresionado = true;
    //       elemento.style.cursor = 'grabbing'; // Cambia el cursor a "agarrando"
    //       // Guarda la posición inicial del mouse y del scroll
    //       posicionInicialX = evento.pageX - elemento.offsetLeft;
    //       posicionScrollInicial = elemento.scrollLeft;
    //     });

    //     // 2. Cuando el mouse sale del elemento
    //     elemento.addEventListener('mouseleave', () => {
    //       estaPresionado = false;
    //       elemento.style.cursor = 'auto'; // Restaura el cursor
    //     });

    //     // 3. Cuando se suelta el botón del mouse
    //     elemento.addEventListener('mouseup', () => {
    //       estaPresionado = false;
    //       elemento.style.cursor = 'auto'; // Restaura el cursor
    //     });

    //     // 4. Cuando se mueve el mouse
    //     elemento.addEventListener('mousemove', (evento) => {
    //       // Solo hacer scroll si el botón está presionado
    //       if (!estaPresionado) return;

    //       evento.preventDefault(); // Evita comportamientos no deseados

    //       // Calcula cuánto se ha movido el mouse
    //       const posicionActualX = evento.pageX - elemento.offsetLeft;
    //       const distanciaMovida = (posicionActualX - posicionInicialX) * 0.7; // Factor de suavizado

    //       // Actualiza la posición del scroll
    //       elemento.scrollLeft = posicionScrollInicial - distanciaMovida;
    //     });
    //   });
    // });

//   function isMouseOver(event, element) {
//       const rect = element.getBoundingClientRect();
//       return (
//         event.clientX >= rect.left &&
//         event.clientX <= rect.right &&
//         event.clientY >= rect.top &&
//         event.clientY <= rect.bottom
//       );
//     } 

document.addEventListener('DOMContentLoaded', function () {
  // Clase para manejar el desplazamiento suave por arrastre
  class DesplazamientoSuave {
    constructor(elemento, opciones = {}) {
      this.elemento = elemento;
      this.opciones = Object.assign({
        // sensibilidad: 1.5,       // Factor de sensibilidad del desplazamiento
        sensibilidad: 0.8,       // Factor de sensibilidad del desplazamiento
        amortiguacion: 0.92,     // Factor de amortiguación para la inercia (0-1)
        velocidadMaxima: 30,     // Velocidad máxima del desplazamiento
        umbraldeClic: 5,         // Distancia mínima para considerar arrastre vs clic
        habilitarInercia: true,  // Activar/desactivar efecto de inercia
        duracionAnimacion: 700   // Duración de la animación de inercia en ms
      }, opciones);

      // Estado del desplazamiento
      this.estado = {
        estaPresionado: false,
        posicionInicialX: 0,
        posicionInicialY: 0,
        posicionScrollInicial: 0,
        posicionActualX: 0,
        velocidad: 0,
        tiempoUltimoMovimiento: 0,
        animacionEnCurso: false,
        idAnimacion: null,
        estaDragging: false,
        distanciaMovida: 0,
        tiempoInicio: 0
      };

      // Inicializar
      this.inicializar();
    }

    inicializar() {
      // Aplicar estilo inicial
      this.elemento.style.cursor = 'grab';
      this.elemento.style.userSelect = 'none';
      this.elemento.style.webkitUserSelect = 'none';
      this.elemento.style.msUserSelect = 'none';
      
      // Evitar que la selección interrumpa el arrastre
      this.elemento.addEventListener('selectstart', (e) => {
        if (this.estado.estaPresionado) e.preventDefault();
      });

      // Eventos de mouse
      this.elemento.addEventListener('mousedown', this.manejarInicio.bind(this));
      document.addEventListener('mousemove', this.manejarMovimiento.bind(this));
      document.addEventListener('mouseup', this.manejarFin.bind(this));
      this.elemento.addEventListener('mouseleave', this.manejarSalida.bind(this));

      // Eventos táctiles
      this.elemento.addEventListener('touchstart', this.manejarInicioTactil.bind(this), { passive: false });
      document.addEventListener('touchmove', this.manejarMovimientoTactil.bind(this), { passive: false });
      document.addEventListener('touchend', this.manejarFinTactil.bind(this));
      document.addEventListener('touchcancel', this.manejarFinTactil.bind(this));

      // Eventos de rueda del mouse para combinar con el comportamiento nativo
      this.elemento.addEventListener('wheel', () => {
        this.detenerAnimacion();
      }, { passive: true });
    }

    manejarInicio(evento) {
      this.detenerAnimacion();
      this.estado.estaPresionado = true;
      this.elemento.style.cursor = 'grabbing';
      
      this.estado.posicionInicialX = evento.clientX;
      this.estado.posicionScrollInicial = this.elemento.scrollLeft;
      this.estado.tiempoUltimoMovimiento = Date.now();
      this.estado.tiempoInicio = Date.now();
      this.estado.distanciaMovida = 0;
      this.estado.estaDragging = false;
      
      evento.preventDefault();
    }

    manejarInicioTactil(evento) {
      if (evento.touches.length === 1) {
        this.detenerAnimacion();
        this.estado.estaPresionado = true;
        
        this.estado.posicionInicialX = evento.touches[0].clientX;
        this.estado.posicionScrollInicial = this.elemento.scrollLeft;
        this.estado.tiempoUltimoMovimiento = Date.now();
        this.estado.tiempoInicio = Date.now();
        this.estado.distanciaMovida = 0;
        this.estado.estaDragging = false;
      }
    }

    manejarMovimiento(evento) {
      if (!this.estado.estaPresionado) return;
      
      const ahora = Date.now();
      const delta = ahora - this.estado.tiempoUltimoMovimiento;
      this.estado.posicionActualX = evento.clientX;
      
      // Calcular la distancia movida desde el inicio
      this.estado.distanciaMovida = Math.abs(this.estado.posicionActualX - this.estado.posicionInicialX);
      
      // Determinar si es un arrastre (y no un clic)
      if (this.estado.distanciaMovida > this.opciones.umbraldeClic) {
        this.estado.estaDragging = true;
      }
      
      if (this.estado.estaDragging) {
        const distanciaX = this.estado.posicionInicialX - this.estado.posicionActualX;
        const nuevaPosicion = this.estado.posicionScrollInicial + distanciaX * this.opciones.sensibilidad;
        
        // Calcular velocidad para la inercia
        if (delta > 0) {
          this.estado.velocidad = distanciaX * this.opciones.sensibilidad / delta * 16.67; // Normalizar a 60fps
          this.estado.velocidad = Math.min(Math.max(this.estado.velocidad, -this.opciones.velocidadMaxima), this.opciones.velocidadMaxima);
        }
        
        this.elemento.scrollLeft = nuevaPosicion;
        this.estado.tiempoUltimoMovimiento = ahora;
        
        evento.preventDefault();
      }
    }

    manejarMovimientoTactil(evento) {
      if (!this.estado.estaPresionado || evento.touches.length !== 1) return;
      
      const ahora = Date.now();
      const delta = ahora - this.estado.tiempoUltimoMovimiento;
      this.estado.posicionActualX = evento.touches[0].clientX;
      
      // Calcular la distancia movida desde el inicio
      this.estado.distanciaMovida = Math.abs(this.estado.posicionActualX - this.estado.posicionInicialX);
      
      // Determinar si es un arrastre (y no un toque simple)
      if (this.estado.distanciaMovida > this.opciones.umbraldeClic) {
        this.estado.estaDragging = true;
      }
      
      if (this.estado.estaDragging) {
        const distanciaX = this.estado.posicionInicialX - this.estado.posicionActualX;
        const nuevaPosicion = this.estado.posicionScrollInicial + distanciaX * this.opciones.sensibilidad;
        
        // Calcular velocidad para la inercia
        if (delta > 0) {
          this.estado.velocidad = distanciaX * this.opciones.sensibilidad / delta * 16.67;
          this.estado.velocidad = Math.min(Math.max(this.estado.velocidad, -this.opciones.velocidadMaxima), this.opciones.velocidadMaxima);
        }
        
        this.elemento.scrollLeft = nuevaPosicion;
        this.estado.tiempoUltimoMovimiento = ahora;
        
        // Prevenir el desplazamiento de la página
        evento.preventDefault();
      }
    }

    manejarFin(evento) {
      if (!this.estado.estaPresionado) return;
      
      this.elemento.style.cursor = 'grab';
      
      // Si es solo un clic, no aplicar inercia
      if (!this.estado.estaDragging) {
        this.estado.estaPresionado = false;
        return;
      }
      
      // Iniciar animación de inercia si está habilitada
      if (this.opciones.habilitarInercia && Math.abs(this.estado.velocidad) > 0.5) {
        this.iniciarAnimacionInercia();
      }
      
      this.estado.estaPresionado = false;
      this.estado.estaDragging = false;
    }

    manejarFinTactil(evento) {
      this.manejarFin(evento);
    }

    manejarSalida() {
      if (this.estado.estaPresionado) {
        this.manejarFin();
      }
    }

    iniciarAnimacionInercia() {
      if (this.estado.animacionEnCurso) return;
      
      const tiempoInicio = Date.now();
      const velocidadInicial = this.estado.velocidad;
      const posicionInicial = this.elemento.scrollLeft;
      
      this.estado.animacionEnCurso = true;
      
      const animarInercia = () => {
        const tiempoActual = Date.now();
        const tiempoTranscurrido = tiempoActual - tiempoInicio;
        
        // Terminar la animación si ha pasado el tiempo límite
        if (tiempoTranscurrido >= this.opciones.duracionAnimacion || Math.abs(this.estado.velocidad) < 0.1) {
          this.detenerAnimacion();
          return;
        }
        
        // Calcular factor de progreso (0 a 1) con una curva de desaceleración
        const factorProgreso = 1 - Math.pow(1 - tiempoTranscurrido / this.opciones.duracionAnimacion, 2);
        
        // Calcular la nueva posición con efecto de desaceleración
        const distanciaTotal = velocidadInicial * this.opciones.duracionAnimacion / 30; // Estimación de la distancia total
        const nuevaPosicion = posicionInicial + distanciaTotal * factorProgreso;
        
        // Aplicar la nueva posición
        this.elemento.scrollLeft = nuevaPosicion;
        
        // Reducir la velocidad gradualmente
        this.estado.velocidad *= this.opciones.amortiguacion;
        
        // Continuar la animación
        this.estado.idAnimacion = requestAnimationFrame(animarInercia);
      };
      
      this.estado.idAnimacion = requestAnimationFrame(animarInercia);
    }

    detenerAnimacion() {
      if (this.estado.idAnimacion) {
        cancelAnimationFrame(this.estado.idAnimacion);
        this.estado.idAnimacion = null;
      }
      this.estado.animacionEnCurso = false;
    }
  }

  // Función para detectar elementos desplazables
  function buscarElementosDesplazables() {
    const todosLosElementos = document.querySelectorAll('*');
    
    todosLosElementos.forEach(elemento => {
      const estilo = window.getComputedStyle(elemento);
      
      // Verifica si el elemento tiene desbordamiento horizontal
      if ((estilo.overflowX === 'auto' || estilo.overflowX === 'scroll') && 
          !elemento.hasAttribute('data-desplazamiento-suave')) {
        
        // Verificar si el elemento es realmente desplazable horizontalmente
        if (elemento.scrollWidth > elemento.clientWidth) {
          // Marcar el elemento para no reinicializar
          elemento.setAttribute('data-desplazamiento-suave', 'true');
          
          // Crear instancia del desplazamiento suave
          new DesplazamientoSuave(elemento);
        }
      }
    });
  }

  // Observador de mutaciones para detectar elementos añadidos dinámicamente
  const observador = new MutationObserver(mutaciones => {
    let debeRecalcular = false;
    
    mutaciones.forEach(mutacion => {
      // Si se añadieron nodos o cambiaron atributos
      if (mutacion.type === 'childList' || mutacion.type === 'attributes') {
        debeRecalcular = true;
      }
    });
    
    if (debeRecalcular) {
      // Usar debounce para no ejecutar demasiadas veces
      clearTimeout(timerID);
      timerID = setTimeout(buscarElementosDesplazables, 300);
    }
  });

  // Iniciar el observador
  observador.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
  });

  // Ejecutar la búsqueda inicial
  buscarElementosDesplazables();

  // Volver a verificar después de que se carguen todas las imágenes
  window.addEventListener('load', buscarElementosDesplazables);
  console.log('HOla mundo');

  // Recalcular en eventos de redimensión
  let timerID;
  window.addEventListener('resize', function() {
    clearTimeout(timerID);
    timerID = setTimeout(buscarElementosDesplazables, 300);
  });
});