class InicioSesion extends HTMLElement {
  constructor() {
    super();
    this.estadoCliente = "";
    this.codigoEnviadoCliente = null;

    this.firebaseConfig = {
      apiKey: "AIzaSyCiu2KfBo01XSkN8LCjf-w689gdC3Mbx0k",
      authDomain: "fir-ed62b.firebaseapp.com",
      databaseURL: "https://fir-ed62b.firebaseio.com",
      projectId: "fir-ed62b",
      storageBucket: "fir-ed62b.firebasestorage.app",
      messagingSenderId: "284308699223",
      appId: "1:284308699223:web:0b82592b77b6577f9ecb12"
    };
    this.coordenadas = { lat: -17.783315017953004, lng: -63.18214577296119 };
    // Ubicacion de envio

    // Variable para almacenar el resultado de la confirmaciónn
    this.confirmationResult = null;
    this.urlConsulta = "https://pizza-hut-bo.myshopify.com/admin/api/2025-01/graphql.json";
    this.myTest = 'shpat_' + '45f4a7476152f4881d058f87ce063698';
    // Inicializar componente
    // this.initializeFirebase();
  }

  connectedCallback() {
    // CAPTURAR ELEMENTOS
    this.input = this.querySelector('#phpis-input');
    this.mensajeVerificarNumero = this.querySelector('#phpis-mensaje-verificar-numero');
    this.btnIniciarSesion = this.querySelector('#phpis-btn-iniciar-sesion');
    // this.btnGoogle = this.querySelector('#phpis-btn-google');
    // this.btnFacebook = this.querySelector('#phpis-btn-facebook'); 
    this.containerGeneral = this.querySelector('#phpis-container-modal');
    this.containerSnipper = this.querySelector('#phpis-snipper-modal');
    this.containerMensaje = this.querySelector('#phpis-mensaje-proceso');
    this.containerMensaje.addEventListener

    this.containerExito = this.querySelector('#phpis-mp-exito');
    this.containerVerificarNumero = this.querySelector('#phpis-mp-verificar-numero');
    this.input1Verificacion = this.querySelector('#single-digit1');
    this.input2Verificacion = this.querySelector('#single-digit2');
    this.input3Verificacion = this.querySelector('#single-digit3');
    this.input4Verificacion = this.querySelector('#single-digit4');
    this.input4Verificacion = this.querySelector('#single-digit5');
    this.input4Verificacion = this.querySelector('#single-digit6');


    // EVENTOS LISTENERS
    this.input.addEventListener('input', this.verificarInput.bind(this));
    this.input1Verificacion.addEventListener('input', this.verificarNumero.bind(this));
    this.input2Verificacion.addEventListener('input', this.verificarNumero.bind(this));
    this.input3Verificacion.addEventListener('input', this.verificarNumero.bind(this));
    this.input4Verificacion.addEventListener('input', this.verificarNumero.bind(this));
    this.btnIniciarSesion.addEventListener('click', this.iniciarSesion.bind(this));
    // this.btnGoogle.addEventListener('click', this.iniciarSesionGoogle.bind(this));
    // this.btnFacebook.addEventListener('click', this.iniciarSesionFacebook.bind(this));
    document.addEventListener('click', (event) => {
      // Verificar si ambos contenedores están visibles
      if (this.containerGeneral.style.display === 'flex' && this.containerVerificarNumero.style.display === 'flex') {
        // Si el clic fue dentro del containerGeneral pero NO dentro del containerVerificarNumero
        if (this.containerGeneral.contains(event.target) && !this.containerVerificarNumero.contains(event.target)) {
          this.containerGeneral.style.display = 'none';
        }
      }
    });

    // Agregar evento para la tecla Enter
    document.addEventListener('keydown', (event) => {
      // Verificar si la tecla presionada es Enter y si los contenedores están visibles
      if (event.key === 'Enter' && this.containerGeneral.style.display === 'flex' && this.containerVerificarNumero.style.display === 'flex') {
        this.containerGeneral.style.display = 'none';
      }
    });

    // INICIALIZAR ELEMENTOS
    this.reiniciarProceso();
    this.ocultarElementosBase();
    console.log('Componente InicioSesion inicializado');
  }

  disconnectedCallback() {
    // Eliminar todos los event listeners para evitar memory leaks
    this.input.removeEventListener('input', this.verificarInput);
    this.input1Verificacion.removeEventListener('input', this.verificarNumero);
    this.input2Verificacion.removeEventListener('input', this.verificarNumero);
    this.input3Verificacion.removeEventListener('input', this.verificarNumero);
    this.input4Verificacion.removeEventListener('input', this.verificarNumero);
    this.btnIniciarSesion.removeEventListener('click', this.iniciarSesion);
    // this.btnGoogle.removeEventListener('click', this.iniciarSesionGoogle);
    // this.btnFacebook.removeEventListener('click', this.iniciarSesionFacebook);

    // Si añadiste los botones de cancelar o volver
    if (this.btnVolver) {
      this.btnVolver.removeEventListener('click', this.reiniciarProceso);
    }

    if (this.btnCancelarVerificacion) {
      this.btnCancelarVerificacion.removeEventListener('click', this.reiniciarProceso);
    }

    // Eliminar listeners globales
    document.removeEventListener('keydown', this.handleKeyDown);
    this.containerGeneral.removeEventListener('click', this.cerrarModal);
    document.removeEventListener('click', this.detectarParaCerrarModal);

    // Limpiar cualquier timeout pendiente
    if (this.timeoutSesion) {
      clearTimeout(this.timeoutSesion);
    }

    // Limpiar recursos
    // if (this.recaptchaVerifier) {
    //   this.recaptchaVerifier.clear();
    // }

    // Limpiar otras referencias
    console.log('Componente InicioSesion desmontado y limpiado');
  }

  // Inicializar Firebase
  async initializeFirebase() {
    // Cargar Firebase dede CDN si no es disponible
    if (!window.firebase) {
      await this.loadScript('https://www.gstatic.com/firebasejs/9.19.1/firebase-app-compat.js');
      await this.loadScript('https://www.gstatic.com/firebasejs/9.19.1/firebase-auth-compat.js');
    }

    // Inicializar Firebase
    if (!firebase.apps.length) {
      firebase.initializeApp(this.firebaseConfig);
    }

    // Inicializar reCAPTCHA
    this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      'recaptcha-container',
      {
        'size': 'invisible',
        'callback': (response) => {
          // El reCAPTCHA se ha verificado correctamente
          console.log('reCAPTCHA verificado', response);
        }
      }
    )
  }

  // Cargar scripts externos
  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async sendVerificationCode() {
    const numeroTelefono = `+591${this.input.value}`;
    // const numeroTelefono = `+591${this.input.value}`;


    try {
      // Enviar SMS en el codigo
      const appVerifier = this.recaptchaVerifier;
      this.confirmationResult = await firebase.auth().signInWithPhoneNumber(numeroTelefono, appVerifier);

      // Mostrar seccion del codigo OTP

    } catch (error) {
      console.error('Error al enviar código:', error);

      // Manejo de errores comunes
      let errorMessage = 'Ocurrió un error al enviar el código. Intente nuevamente.';
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'El número de teléfono no es válido.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos fallidos. Intente más tarde.';
      }

      // Reiniciar el recaptcha
      this.recaptchaVerifier.render().then(function (widgetId) {
        grecaptcha.reset(widgetId);
      });

    }
  }

  verificarInput() {
    if (this.input.value.length == 8) {
      this.btnIniciarSesion.classList.remove('desactivado');
    } else {
      this.btnIniciarSesion.classList.add('desactivado');
    }
  }

  async iniciarSesion() {
    if (this.input.value.length !== 8) {
      return;
    }

    this.containerGeneral.style.display = 'flex';
    this.containerSnipper.style.display = 'flex';

    this.mensajeVerificarNumero.innerHTML = `
    Enviamos un código de verificación de 4 dígitos a tu  número de WhatsApp *****${this.input.value.slice(-3)}. Copia ese código y pégalo a continuación:`;
    this.codigoEnviadoCliente = this.generarCodigo6Digitos();
    localStorage.setItem('ph-codigo-verificacion', this.codigoEnviadoCliente);
    MensajeCargaDatos.ocultar();
    window.open(
      `https://wa.me/591${this.input.value}?text=Pizza Hut, tu código de verificación es ${this.codigoEnviadoCliente}. Gracias por su preferencia.`,
      '_blank'
    );

    setTimeout(() => {
      this.containerMensaje.style.display = 'flex';
      this.containerSnipper.style.display = 'none';
      this.containerVerificarNumero.style.display = 'flex';
      // document.addEventListener('click', (event) => {
      //   if (this.containerGeneral.style.display == 'flex' && this.containerVerificarNumero.style.display == 'flex') {
      //     if (!this.containerMensaje.contains(event.target)) {
      //       this.containerGeneral.style.display = 'none';
      //     }
      //   }
      // });
    }, 3000);





    // // Ingresar el valor dentro del this.mensajeVerificarNumeroo
    // this.mensajeVerificarNumero.innerHTML = `
    //   Enviamos un código de verificación de 4 dígitos a tu  número de WhatsApp *****${this.input.value.slice(
    //   -3
    // )}. Copia ese
    //   código y pégalo a continuación:`;



    // // await this.sendVerificationCode();
    // this.codigoEnviadoCliente = this.generarCodigo4Digitos();
    // localStorage.setItem('ph-codigo-verificacion', this.codigoEnviadoCliente);

    // window.open(
    //   `https://wa.me/591${this.input.value}?text=Pizza Hut, tu código de verificación es ${this.codigoEnviadoCliente}. Gracias por su preferencia.`,
    //   '_blank'
    // );
    // // Simular un proceso de carga
    // setTimeout(() => {
    //   this.containerMensaje.style.display = 'flex';
    //   this.containerSnipper.style.display = 'none';
    //   this.containerVerificarNumero.style.display = 'flex';
    // }, 3000);
  }

  async porNroTelefonoUsuarioVerificar(numeroTelefono) {
    const graphQLQuery = `
      query CustomerByIdentifier($identifier: CustomerIdentifierInput!) {
        customer: customerByIdentifier(identifier: $identifier) {
          id
        }
      }
    `;

    const variables = {
      "identifier": {
        "phoneNumber": numeroTelefono
      }
    };

    try {
      // Realizar la solicitud
      const respuesta = await fetch(window.urlConsulta, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': this.myTest,
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

  async traerTodaInfoUsuario(id) {
    // Convertir el ID numérico a formato GID si es necesario
    const idGID = id.includes('gid://') ? id : `gid://shopify/Customer/${id}`;

    const graphQLQuery = `
      query GetCustomerMetafield {
        customer(id: "${idGID}") {
          id
          firstName
          lastName
          email
          phone
          metafield(namespace: "informacion", key: "extra") {
            id
            namespace
            key
            value
          }
        }
      }
    `;

    try {
      // Realizar la solicitud
      const respuesta = await fetch(window.urlConsulta, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': window.keyBackendShopify,
        },
        body: JSON.stringify({ query: graphQLQuery }),
      });

      if (!respuesta.ok) {
        throw new Error(`Error de red: ${respuesta.status} ${respuesta.statusText}`);
      }

      const datos = await respuesta.json();

      // Verificar si hay datos del cliente
      if (datos.data?.customer) {
        const customer = datos.data.customer;

        // Parsear el valor del metafield si existe
        let metafieldData = {};
        if (customer.metafield?.value) {
          try {
            metafieldData = JSON.parse(customer.metafield.value);
          } catch (e) {
            console.error("Error al parsear metafield JSON:", e);
          }
        }

        // Construir y devolver el objeto con toda la información
        return {
          id: customer.id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
          metafield: customer.metafield,
          // Incluir los datos parseados del metafield directamente en el objeto
          nit: metafieldData.nit,
          razon_social: metafieldData.razon_social,
          ci: metafieldData.ci,
          fecha: metafieldData.fecha,
          permisosHutCoins: metafieldData.permisosHutCoins,
          direcciones: metafieldData.direcciones || []
        };
      } else {
        console.log('No se encontró información del usuario');
        return undefined;
      }

    } catch (error) {
      console.error("Error al obtener información del usuario:", error);
      return undefined;
    }
  }

  async crearUnNuevoUsuario() { }

  iniciarSesionGoogle() {
    // Lógica para iniciar sesión con Google
    console.log('Iniciar sesión con Google');
    this.containerGeneral.style.display = 'flex';
    this.containerSnipper.style.display = 'flex';

    setTimeout(() => {
      this.containerMensaje.style.display = 'none';
      this.containerSnipper.style.display = 'none';
      localStorage.setItem(
        'ph-datos-usuario',
        JSON.stringify({
          nombre: '----',
          celular: this.input.value,
          apellido: '----',
          email: '----',
          ci: '----',
        })
      );
      window.location.href = '/';
    }, 3000);
  }

  iniciarSesionFacebook() {
    // Lógica para iniciar sesión con Facebook
    console.log('Iniciar sesión con Facebook');
    this.containerGeneral.style.display = 'flex';
    this.containerSnipper.style.display = 'flex';

    setTimeout(() => {
      this.containerMensaje.style.display = 'none';
      this.containerSnipper.style.display = 'none';
      localStorage.setItem(
        'ph-datos-usuario',
        JSON.stringify({
          nombre: '----',
          celular: this.input.value || '----',
          apellido: '----',
          email: '----',
          ci: '----',
        })
      );
      window.location.href = '/pages/perfil';
    }, 3000);
  }

  async verificarNumero(event) {
    const inputs = [
      this.input1Verificacion,
      this.input2Verificacion,
      this.input3Verificacion,
      this.input4Verificacion,
      this.input5Verificacion,
      this.input6Verificacion,
    ];

    // Obtener el elemento de entrada actual que desencadenó el evento
    const inputActual = event.target;

    // Encontrar el índice del input actual en nuestro array
    const indiceActual = inputs.indexOf(inputActual);

    // Si el input actual tiene un valor y hay un siguiente input, enfócalo
    if (inputActual.value.length === 1 && indiceActual < inputs.length - 1) {
      inputs[indiceActual + 1].focus();
    }

    // Verificar si todos los inputs están llenos
    const todosLlenos = inputs.every((input) => input.value.length === 1);

    if (todosLlenos) {
      const optenerNumero = inputs.map((input) => input.value).join('');
      const codigoVerificacion = this.codigoEnviadoCliente || localStorage.getItem('ph-codigo-verificacion');
      // Verificar el codigo ingresado

      if (`${optenerNumero}` == `${codigoVerificacion}`) {
        // Si el codigo es correcto hacer
        const dataUsuario = await this.porNroTelefonoUsuarioVerificar(`+591${this.input.value}`);
        if (dataUsuario == undefined) {
          MensajeCargaDatos.mostrar('Enviando código de verificación...');
          this.estadoCliente = "no-existe";
        } else {
          MensajeCargaDatos.mostrar('Procesando datos ...');
          this.estadoCliente = "si-existe";
          const datosUsuario = await this.traerTodaInfoUsuario(dataUsuario);
          // const ordenesPagadas = await this.traerOrdenesCompletadas(dataUsuario);
          // const ordenesPendientes = await this.traerOrdenesPendientes(dataUsuario);
          MensajeCargaDatos.ocultar();
          this.containerGeneral.style.display = 'flex';
          this.containerMensaje.style.display = 'flex';
          this.containerExito.style.display = 'flex';

          localStorage.setItem(
            'ph-datos-usuario',
            JSON.stringify({
              nombre: dataUsuario.nombre,
              celular: dataUsuario.celular,
              apellido: dataUsuario.apellido,
              email: dataUsuario.email,
              ci: dataUsuario.ci,
              direcciones: dataUsuario.direcciones,
              razon_social: dataUsuario.razon_social,
              nit: dataUsuario.nit,
              fecha_nacimiento: dataUsuario.fecha_nacimiento,
              permisosHutCoins: dataUsuario.permisosHutCoins,
              ordenesPagadas: [],
              ordenesPendientes: []
            })
          );

          setTimeout(() => {
            this.containerGeneral.style.display = 'none';
            this.containerMensaje.style.display = 'none';
            this.containerExito.style.display = 'none';
            window.location.href = '/pages/perfil';
          }, 1000);
        }
      } else {
        // Si el codigo es incorrecto
        // Mostrar el error de incorrecto por 2 segundos
      }

      // const codigoVerificacion = this.codigoEnviadoCliente || localStorage.getItem('ph-codigo-verificacion');
      // console.log('Código ingresadoo:', {
      //   optenerNumero,
      //   codigoVerificacion
      // });

      // if (parseInt(optenerNumero) !== parseInt(codigoVerificacion)) {
      //   this.ocultarElementosBase();
      //   console.log('Código incorrecto');
      //   MensajeCargaDatos.mostrar('El código ingresado es incorrecto.\nPor favor intenta nuevamente.');
      //   // Esperar 3 segundos antes de permitir un nuevo intento
      //   setTimeout(() => {
      //     MensajeCargaDatos.ocultar();
      //   }, 3000);

      //   // Limpiar inputs
      //   inputs.forEach((input) => {
      //     input.value = '';
      //   });
      //   return;
    }

    // Usuario verificado
    // const user = result.user;
    // console.log('Usuario verificado:', user);

    console.log('Código de verificación enviado');
    this.containerVerificarNumero.style.display = 'none';
    this.containerMensaje.style.display = 'none';
    this.containerSnipper.style.display = 'flex';

    setTimeout(() => {
      this.ocultarElementosBase();
      window.location.href = '/';
      inputs.forEach((input) => {
        input.value = '';
      });
      localStorage.setItem(
        'ph-datos-usuario',
        JSON.stringify({
          nombre: `pizzaHut${optenerNumero}`,
          celular: this.input.value || '',
          apellido: `pizzaHut${optenerNumero}`,
          email: `pizzaHut${optenerNumero}@gmail.com`,
          ci: ''
        })
      );
    }, 3000);
  }

  ocultarElementosBase() {
    this.containerGeneral.style.display = 'none';
    this.containerSnipper.style.display = 'none';
    this.containerMensaje.style.display = 'none';
    this.containerExito.style.display = 'none';
    this.containerVerificarNumero.style.display = 'none';
  }

  reiniciarProceso() {
    // Ocultar todos los contenedores activos
    this.ocultarElementosBase();

    // Limpiar los campos de entrada
    this.input.value = '';
    this.input1Verificacion.value = '';
    this.input2Verificacion.value = '';
    this.input3Verificacion.value = '';
    this.input4Verificacion.value = '';
    this.input5Verificacion.value = '';
    this.input6Verificacion.value = '';

    // Desactivar el botón de inicio de sesión
    this.btnIniciarSesion.classList.add('desactivado');

    // Mostrar solo la interfaz inicial (ajustar según tu diseño)
    // Si tienes un contenedor principal que debe estar visible, actívalo aquí
    // Por ejemplo: this.containerPrincipal.style.display = 'block';

    console.log('Proceso reiniciado');
  }

  generarCodigo6Digitos() {
    // Genera un número aleatorio entre 100000 y 999999
    return Math.floor(100000 + Math.random() * 900000);
  }
}

customElements.define('inicio-sesion', InicioSesion);
