import { initListaClientes } from "./lista-de-clientes.js";
import { initActivarMembresia } from "./activar-membresia.js";
import {
  createShowMessage,
  toggleAdminFieldsFactory,
  toggleAdminControlsFactory,
  toggleUserInfoFactory
} from "./ui-helpers.js";
import { initAuthEvents } from "./auth.js";
import { initBorrarCliente, initCerrarSesion } from "./admin.js";

document.addEventListener("DOMContentLoaded", () => {
  // Elementos
  const btnLogin = document.getElementById("btnLogin");
  const btnRegister = document.getElementById("btnRegister");
  const btnEnviar = document.getElementById("btnEnviar");
  const btnLogout = document.getElementById("btnLogout");
  const btnBorrar = document.getElementById("btnBorrar");
  const btnLista = document.getElementById("btnLista");
  const btnActivarMembresia = document.getElementById("btnActivarMembresia");
  const btnConfirmarActivar = document.getElementById("btnConfirmarActivar");
  const activarPanel = document.getElementById("activar-membresia-panel");
  const activarUsuario = document.getElementById("activar-usuario");
  const activarDias = document.getElementById("activar-dias");
  const btnPago = document.getElementById("btnPago");
  const mensaje = document.getElementById("mensaje");
  const clientesListado = document.getElementById("clientes-listado");
  const userTitle = document.getElementById("user-title");
  const clientInfo = document.getElementById("client-info");
  const membershipLabel = document.getElementById("membership-label");
  const tiempoLabel = document.getElementById("tiempo-label");
  const statusMembershipLabel = document.getElementById("status-membership-label");
  const adminFields = document.getElementById("admin-fields");
  const membresiaSelect = document.getElementById("membresia");
  const status = document.getElementById("status");
  const mainAuthContent = document.getElementById("main-auth-content");
  const contactForm = document.getElementById("contact-form");
  const pageTitle = document.getElementById("page-title");
  const btnContactSend = document.getElementById("btnContactSend");

  let modo = "login";
  let userRole = null;
  let currentUser = null;

  // Crear funciones de UI
  const showMessage = createShowMessage(mensaje);
  const toggleAdminFields = toggleAdminFieldsFactory(adminFields);
  const toggleAdminControls = toggleAdminControlsFactory({
    btnRegister,
    btnBorrar,
    btnLista,
    btnActivarMembresia,
    btnLogout,
    activarPanel,
    clientesListado
  });
  const toggleUserInfo = toggleUserInfoFactory({
    userTitle,
    clientInfo,
    membershipLabel,
    tiempoLabel,
    statusMembershipLabel
  });

  const showContactMode = () => {
    if (pageTitle) pageTitle.textContent = "Contáctanos";
    if (mainAuthContent) mainAuthContent.style.display = "none";
    if (contactForm) contactForm.style.display = "flex";
    if (userTitle) userTitle.style.display = "none";
    if (status) status.style.display = "none";
    // Scroll to top so contact form is visible
    window.scrollTo(0, 0);
  };

  const contactParams = new URLSearchParams(window.location.search);
  const shouldShowContact = contactParams.get("contacto") === "1";
  
  if (shouldShowContact) {
    showContactMode();
  }

  // Agregar evento click al botón de contacto en el header
  setTimeout(() => {
    const navContact = document.getElementById("nav-contact");
    if (navContact) {
      navContact.addEventListener("click", (e) => {
        e.preventDefault();
        showContactMode();
      });
    }
  }, 100);

  if (btnContactSend) {
    btnContactSend.addEventListener("click", (event) => {
      event.preventDefault();
      showMessage("Mensaje enviado. Gracias por contactarnos.", "green");
    });
  }

  const resetToLogin = () => {
    modo = "login";
    userRole = null;
    currentUser = null;
    if (btnLogin) {
      btnLogin.classList.add("active-btn");
      btnLogin.classList.remove("inactive-btn");
    }
    if (btnRegister) {
      btnRegister.classList.add("inactive-btn");
      btnRegister.classList.remove("active-btn");
    }
    if (btnEnviar) {
      btnEnviar.textContent = "Ingresar";
      btnEnviar.style.background = '#ff8c00'; // Reset to orange
    }
    if (clientesListado) {
      clientesListado.style.display = "none";
      clientesListado.innerHTML = "";
    }
    if (activarPanel) {
      activarPanel.style.display = "none";
    }
    toggleAdminControls(userRole, modo);
    toggleAdminFields(userRole, modo);
    toggleUserInfo(userRole, currentUser);
  };

  // Inicializar visibilidad
  toggleAdminControls(userRole, modo);
  toggleAdminFields(userRole, modo);
  toggleUserInfo(userRole, currentUser);

  // Inicializar autenticación
  const authHandler = initAuthEvents({
    btnLogin,
    btnRegister,
    btnEnviar,
    membresiaSelect,
    showMessage,
    onModoChange: (newModo) => {
      modo = newModo;
      toggleAdminControls(userRole, modo);
      toggleAdminFields(userRole, modo);
      toggleUserInfo(userRole, currentUser);
    },
    getUserRole: () => userRole,
    onAuthSuccess: (usuario) => {
      currentUser = usuario;
      userRole = usuario.rol;
      // Cambiar color del botón Ingresar según el rol
      if (userRole === 'admin') {
        btnEnviar.style.background = '#ff8c00'; // Verde manzana
      } else {
        btnEnviar.style.background = '#ff8c00'; // Naranja
      }
      toggleAdminControls(userRole, modo);
      toggleAdminFields(userRole, modo);
      toggleUserInfo(userRole, currentUser);
    },
    onAuthFailure: () => {
      userRole = null;
      currentUser = null;
      toggleAdminControls(userRole, modo);
      toggleAdminFields(userRole, modo);
      toggleUserInfo(userRole, currentUser);
    }
  });

  // Inicializar administración
  initBorrarCliente({ btnBorrar, showMessage });
  initCerrarSesion({ btnLogout, onLogout: resetToLogin });

  // Inicializar membresía y lista de clientes
  initActivarMembresia({
    btnActivarMembresia,
    btnConfirmarActivar,
    activarPanel,
    activarUsuario,
    activarDias,
    showMessage
  });

  initListaClientes({ btnLista, clientesListado, showMessage });
});
