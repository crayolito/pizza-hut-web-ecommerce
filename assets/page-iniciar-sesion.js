class InicioSesion extends HTMLElement {
  constructor() {
    super();

    // Configuración de Firebase
    this.firebaseConfig = {
      apiKey: "AIzaSyBFBm87CEKsPhKNXLRt7QOAXL_67vbdAjI",
      authDomain: "hackathon-b16d3.firebaseapp.com",
      projectId: "hackathon-b16d3",
      storageBucket: "hackathon-b16d3.firebasestorage.app",
      messagingSenderId: "622628492965",
      appId: "1:622628492965:web:ccd1b01b6355b5c84f9f4c",
      measurementId: "G-PT6GFSWCLT"
    };

    // Variable para almacenar el resultado de la confirmación
    this.confirmationResult = null;

    // Inicializar componente
    this.initializeFirebase();
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
    this.containerExito = this.querySelector('#phpis-mp-exito');
    this.containerVerificarNumero = this.querySelector('#phpis-mp-verificar-numero');
    this.input1Verificacion = this.querySelector('#single-digit1');
    this.input2Verificacion = this.querySelector('#single-digit2');
    this.input3Verificacion = this.querySelector('#single-digit3');
    this.input4Verificacion = this.querySelector('#single-digit4');

    // EVENTOS LISTENERS
    this.input.addEventListener('input', this.verificarInput.bind(this));
    this.input1Verificacion.addEventListener('input', this.verificarNumero.bind(this));
    this.input2Verificacion.addEventListener('input', this.verificarNumero.bind(this));
    this.input3Verificacion.addEventListener('input', this.verificarNumero.bind(this));
    this.input4Verificacion.addEventListener('input', this.verificarNumero.bind(this));
    this.btnIniciarSesion.addEventListener('click', this.iniciarSesion.bind(this));
    // this.btnGoogle.addEventListener('click', this.iniciarSesionGoogle.bind(this));
    // this.btnFacebook.addEventListener('click', this.iniciarSesionFacebook.bind(this)); 

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
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
    }

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

    await this.sendVerificationCode();

    // Ingresar el valor dentro del this.mensajeVerificarNumero
    this.mensajeVerificarNumero.innerHTML = `
Enviamos un código de verificación de 4 dígitos al número *****${this.input.value.slice(
      -3
    )}, que expira en 5 minutos. Copia ese
código y pégalo a continuación:`;

    this.containerGeneral.style.display = 'flex';
    this.containerSnipper.style.display = 'flex';

    // Simular un proceso de carga
    setTimeout(() => {
      this.containerMensaje.style.display = 'flex';
      this.containerSnipper.style.display = 'none';
      this.containerVerificarNumero.style.display = 'flex';
    }, 3000);
  }

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
      // Aquí puedes agregar la lógica para enviar el código de verificación
      const result = await this.confirmationResult.confirm("123456");

      // Usuario verificado 
      const user = result.user;
      console.log('Usuario verificado:', user);



      console.log('Código de verificación enviado');
      this.containerVerificarNumero.style.display = 'none';
      this.containerMensaje.style.display = 'none';
      this.containerSnipper.style.display = 'flex';

      setTimeout(() => {
        this.ocultarElementosBase();
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
        window.location.href = '/';
      }, 3000);
    }
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

    // Desactivar el botón de inicio de sesión
    this.btnIniciarSesion.classList.add('desactivado');

    // Mostrar solo la interfaz inicial (ajustar según tu diseño)
    // Si tienes un contenedor principal que debe estar visible, actívalo aquí
    // Por ejemplo: this.containerPrincipal.style.display = 'block';

    console.log('Proceso reiniciado');
  }
}

customElements.define('inicio-sesion', InicioSesion);
