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

    document.addEventListener('DOMContentLoaded', function () {
      // Función para configurar el desplazamiento por arrastre en un elemento
      function configurarDesplazamientoPorArrastre(elemento) {
        // Variables para controlar el estado del arrastre
        let estaPresionado = false;
        let posicionInicialX;
        let posicionScrollInicial;

        // 1. Cuando se presiona el botón del mouse
        elemento.addEventListener('mousedown', (evento) => {
          estaPresionado = true;
          elemento.style.cursor = 'grabbing'; // Cambia el cursor a "agarrando"
          // Guarda la posición inicial del mouse y del scroll
          posicionInicialX = evento.clientX;
          posicionScrollInicial = elemento.scrollLeft;
        });

        // 2. Cuando el mouse sale del elemento
        elemento.addEventListener('mouseleave', () => {
          estaPresionado = false;
          elemento.style.cursor = 'grab'; // Restaura el cursor
        });

        // 3. Cuando se suelta el botón del mouse
        elemento.addEventListener('mouseup', () => {
          estaPresionado = false;
          elemento.style.cursor = 'grab'; // Restaura el cursor
        });

        // 4. Cuando se mueve el mouse
        elemento.addEventListener('mousemove', (evento) => {
          // Solo hacer scroll si el botón está presionado
          if (!estaPresionado) return;

          evento.preventDefault(); // Evita comportamientos no deseados

          // Calcula cuánto se ha movido el mouse
          const posicionActualX = evento.clientX;
          const distanciaMovida = (posicionActualX - posicionInicialX) * 0.5; // Factor de movimiento

          // Actualiza la posición del scroll
          elemento.scrollLeft = posicionScrollInicial - distanciaMovida;
        });

        // Asegurarse de que el cursor cambie al pasar por encima
        elemento.style.cursor = 'grab';
      }

      // Buscar elementos con desplazamiento horizontal
      function buscarElementosDesplazables() {
        const todosLosElementos = document.querySelectorAll('*');

        todosLosElementos.forEach(elemento => {
          const estilo = window.getComputedStyle(elemento);

          // Verifica si el elemento tiene desbordamiento horizontal
          if (estilo.overflowX === 'auto' || estilo.overflowX === 'scroll') {
            // Verificar si el elemento es desplazable horizontalmente
            // o configurarlo por defecto si tiene esos estilos
            if (elemento.scrollWidth > elemento.clientWidth ||
                estilo.overflowX === 'auto' ||
                estilo.overflowX === 'scroll') {
              configurarDesplazamientoPorArrastre(elemento);
            }
          }
        });
      }

      // Ejecutar la búsqueda inicial
      buscarElementosDesplazables();

      // También podemos volver a verificar después de que se carguen las imágenes
      // ya que pueden cambiar el tamaño de los elementos
      window.addEventListener('load', buscarElementosDesplazables);

      // Opcional: comprobar periódicamente si hay nuevos elementos desplazables
      // (útil si tu sitio añade elementos dinámicamente)
      let timerID;
      window.addEventListener('resize', function() {
        clearTimeout(timerID);
        timerID = setTimeout(buscarElementosDesplazables, 300);
      });
    });

//   function isMouseOver(event, element) {
//       const rect = element.getBoundingClientRect();
//       return (
//         event.clientX >= rect.left &&
//         event.clientX <= rect.right &&
//         event.clientY >= rect.top &&
//         event.clientY <= rect.bottom
//       );
//     } 