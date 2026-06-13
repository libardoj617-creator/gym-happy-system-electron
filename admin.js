/**
 * Módulo de administración
 * Contiene funciones administrativas como borrar clientes
 */

export function initBorrarCliente({ btnBorrar, showMessage }) {
  if (!btnBorrar) return;

  btnBorrar.addEventListener("click", async () => {
    const usuarioInput = document.getElementById("usuario");
    const usuario = usuarioInput ? usuarioInput.value.trim() : "";

    showMessage("", "black");

    if (!usuario) {
      showMessage("Ingrese el usuario a borrar", "red");
      return;
    }

    try {
      const response = await fetch(
        `/api/borrarcliente/${encodeURIComponent(usuario)}`,
        { method: "DELETE" }
      );

      let result;
      try {
        result = await response.json();
      } catch (e) {
        showMessage(
          `Error: respuesta inesperada del servidor (${response.status})`,
          "red"
        );
        return;
      }

      showMessage(
        result.ok ? result.mensaje : result.error,
        result.ok ? "green" : "red"
      );
    } catch (error) {
      showMessage("Error al comunicar con el servidor", "red");
    }
  });
}

export function initCerrarSesion({ btnLogout, onLogout }) {
  if (!btnLogout) return;

  btnLogout.addEventListener("click", () => {
    onLogout();
  });
}
