export function initActivarMembresia({
  btnActivarMembresia,
  btnConfirmarActivar,
  activarPanel,
  activarUsuario,
  activarDias,
  showMessage
}) {
  if (btnActivarMembresia) {
    btnActivarMembresia.addEventListener("click", () => {
      if (activarPanel) {
        activarPanel.style.display = activarPanel.style.display === "block" ? "none" : "block";
      }
    });
  }

  if (btnConfirmarActivar) {
    btnConfirmarActivar.addEventListener("click", async () => {
      const usuario = activarUsuario ? activarUsuario.value.trim() : "";
      const diasSeleccionados = activarDias ? parseInt(activarDias.value, 10) : 0;

      showMessage("", "black");

      if (!usuario) {
        showMessage("Ingrese el nombre del cliente", "red");
        return;
      }

      if (![0, 30, 60, 90].includes(diasSeleccionados)) {
        showMessage("Seleccione 0, 30, 60 o 90 días", "red");
        return;
      }

      try {
        const response = await fetch("/api/activarmembresia", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usuario, tiempo_restante: diasSeleccionados })
        });

        let result;
        try {
          result = await response.json();
        } catch (e) {
          const text = await response.text();
          showMessage(`Error: respuesta inesperada del servidor (${response.status}) ${text}`, "red");
          return;
        }

        if (result && typeof result === "object") {
          showMessage(result.ok ? result.mensaje : result.error, result.ok ? "green" : "red");
          if (result.ok) {
            if (activarPanel) {
              activarPanel.style.display = "none";
            }
            if (activarUsuario) {
              activarUsuario.value = "";
            }
            if (activarDias) {
              activarDias.value = "0";
            }
          }
        } else {
          showMessage("Respuesta inválida del servidor", "red");
        }
      } catch (error) {
        showMessage("Error al actualizar la membresía", "red");
      }
    });
  }
}
