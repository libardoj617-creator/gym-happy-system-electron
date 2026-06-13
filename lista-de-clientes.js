export function initListaClientes({ btnLista, clientesListado, showMessage }) {
  if (!btnLista) return;

  btnLista.addEventListener("click", async () => {
    showMessage("Cargando lista...", "black");

    try {
      const response = await fetch("/api/listaclientes");
      let result;
      try {
        result = await response.json();
      } catch (e) {
        showMessage(`Error: respuesta inesperada del servidor (${response.status})`, "red");
        return;
      }

      if (!result || typeof result !== "object") {
        showMessage("Respuesta inválida del servidor", "red");
        return;
      }

      if (!result.ok && result.error) {
        showMessage(result.error, "red");
        return;
      }

      const clientes = result.data || result.clientes || [];
      if (!Array.isArray(clientes) || clientes.length === 0) {
        if (clientesListado) {
          clientesListado.style.display = "none";
          clientesListado.innerHTML = "";
        }
        showMessage("No hay clientes registrados", "black");
        return;
      }

      const listadoHtml = clientes
        .map((c, i) => {
          const nombre = c.usuario ?? c.nombre ?? JSON.stringify(c);
          const dias = Number(c.tiempo_restante) || 0;
          const estado = dias > 0 ? "Activo" : "Inactivo";
          const color = dias > 0 ? "green" : "red";
          return `<div style="margin-bottom: 6px;"><strong>${i + 1}. ${nombre}</strong> — <span style="color: ${color};">${estado} (${dias} días)</span></div>`;
        })
        .join("");

      if (clientesListado) {
        clientesListado.style.display = "block";
        clientesListado.innerHTML = listadoHtml;
      }
      showMessage(`Clientes Registrados`, "green");
    } catch (error) {
      showMessage("Error al obtener la lista", "red");
    }
  });
}
