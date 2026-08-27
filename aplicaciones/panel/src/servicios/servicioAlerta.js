import Swal from "sweetalert2";

export function mostrarConexionExitosa({ servicio, cuenta, colores }) {
  return Swal.fire({
    icon: "success",
    title: "Conexion exitosa",
    html: crearHtmlCuenta(servicio, cuenta),
    confirmButtonText: "Entendido",
    confirmButtonColor: colores.colorPrimario,
    iconColor: colores.colorSecundario,
    background: "#ffffff",
    color: "#111827"
  });
}

export function mostrarOperacionExitosa({ titulo, mensaje, detalles, colores }) {
  return Swal.fire({
    icon: "success",
    title: titulo,
    html: `
      <div style="text-align:left">
        <p>${escaparHtml(mensaje)}</p>
        ${
          detalles
            ? `<pre style="white-space:pre-wrap;background:#f1f5f9;padding:10px;border-radius:6px;font-size:12px;margin-top:12px">${escaparHtml(
                detalles
              )}</pre>`
            : ""
        }
      </div>
    `,
    confirmButtonText: "Entendido",
    confirmButtonColor: colores.colorPrimario,
    iconColor: colores.colorSecundario,
    background: "#ffffff",
    color: "#111827"
  });
}

export function mostrarErrorConexion({ error, colores }) {
  return Swal.fire({
    icon: "error",
    title: "No se pudo conectar",
    html: crearHtmlError(error),
    confirmButtonText: "Revisar configuracion",
    confirmButtonColor: colores.colorPrimario,
    iconColor: colores.colorPrimario,
    background: "#ffffff",
    color: "#111827",
    width: 720
  });
}

export function mostrarErrorOperacion({ titulo = "No se pudo completar", error, colores }) {
  return Swal.fire({
    icon: "error",
    title: titulo,
    html: crearHtmlError({
      codigo: error?.codigo || "error_operacion",
      errorTecnico: error?.stack || error?.message || "Sin detalle tecnico.",
      mensaje: error?.message || "La operacion fallo.",
      soluciones: [
        "Verifica los datos obligatorios.",
        "Confirma que la sesion siga activa.",
        "Revisa la configuracion de API y servicios externos."
      ]
    }),
    confirmButtonText: "Entendido",
    confirmButtonColor: colores.colorPrimario,
    iconColor: colores.colorPrimario,
    background: "#ffffff",
    color: "#111827",
    width: 720
  });
}

function crearHtmlCuenta(servicio, cuenta) {
  const filas = Object.entries(cuenta || {})
    .filter(([, valor]) => valor !== null && valor !== undefined && valor !== "")
    .map(([clave, valor]) => `<li><strong>${escaparHtml(clave)}:</strong> ${escaparHtml(String(valor))}</li>`)
    .join("");

  return `
    <div style="text-align:left">
      <p>El servicio <strong>${escaparHtml(servicio)}</strong> respondio correctamente.</p>
      <ul style="margin-top:12px; padding-left:18px">${filas}</ul>
    </div>
  `;
}

function crearHtmlError(error) {
  const soluciones = (error?.soluciones || [])
    .map((solucion) => `<li>${escaparHtml(solucion)}</li>`)
    .join("");

  return `
    <div style="text-align:left">
      <p><strong>Codigo:</strong> ${escaparHtml(error?.codigo || "error_desconocido")}</p>
      <p><strong>Error tecnico:</strong></p>
      <pre style="white-space:pre-wrap;background:#f1f5f9;padding:10px;border-radius:6px;font-size:12px">${escaparHtml(
        error?.errorTecnico || "Sin detalle tecnico."
      )}</pre>
      <p><strong>En palabras entendibles:</strong> ${escaparHtml(error?.mensaje || "La conexion fallo.")}</p>
      <p><strong>Posibles soluciones:</strong></p>
      <ul style="padding-left:18px">${soluciones}</ul>
    </div>
  `;
}

function escaparHtml(valor) {
  return valor
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
