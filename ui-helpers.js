/**
 * Módulo de helpers de UI
 * Contiene funciones para mostrar mensajes y alternar visibilidad de elementos
 */

export function createShowMessage(mensajeElement) {
  return (text, color = "black") => {
    if (!mensajeElement) return;
    mensajeElement.style.whiteSpace = "pre-wrap";
    mensajeElement.textContent = text;
    mensajeElement.style.color = color;
  };
}

export function toggleAdminFieldsFactory(adminFields) {
  return (userRole, modo) => {
    if (adminFields) {
      adminFields.style.display =
        modo === "register" ? "block" : "none";
    }
  };
}

export function toggleAdminControlsFactory({
  btnRegister,
  btnBorrar,
  btnLista,
  btnActivarMembresia,
  btnLogout,
  activarPanel,
  clientesListado
}) {
  return (userRole, modo) => {
    const isAdmin = userRole === "admin";
    if (btnRegister) btnRegister.style.display = isAdmin ? "inline-block" : "none";
    if (btnBorrar) btnBorrar.style.display = isAdmin ? "inline-block" : "none";
    if (btnLista) btnLista.style.display = isAdmin ? "inline-block" : "none";
    if (btnActivarMembresia) btnActivarMembresia.style.display = isAdmin ? "inline-block" : "none";
    if (activarPanel) activarPanel.style.display = "none";
    if (clientesListado && !isAdmin) {
      clientesListado.style.display = "none";
      clientesListado.innerHTML = "";
    }
    if (btnLogout) btnLogout.style.display = userRole ? "inline-block" : "none";
  };
}

export function toggleUserInfoFactory({
  userTitle,
  clientInfo,
  membershipLabel,
  tiempoLabel,
  statusMembershipLabel
}) {
  return (userRole, currentUser) => {
    if (userTitle) {
      if (userRole === "admin") {
        userTitle.textContent = "ADMINISTRADOR";
        userTitle.style.display = "block";
      } else if (userRole === "cliente") {
        userTitle.textContent = "USUARIO CLIENTE";
        userTitle.style.display = "block";
      } else {
        userTitle.style.display = "none";
      }
    }

    if (clientInfo) {
      if (userRole === "cliente" && currentUser) {
        const dias = Number(currentUser.tiempo_restante) || 0;
        membershipLabel.textContent = "Membresía:";
        tiempoLabel.textContent = `Días restantes: ${dias}`;
        if (statusMembershipLabel) {
          statusMembershipLabel.textContent = dias > 0 ? "Activa" : "Inactiva";
          statusMembershipLabel.style.color = dias > 0 ? "green" : "red";
        }
        clientInfo.style.display = "block";
      } else {
        clientInfo.style.display = "none";
      }
    }
  };
}
