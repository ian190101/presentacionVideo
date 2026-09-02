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

export function mostrarRenderSolicitado({ mensaje, resultado, colores }) {
  const datos = resultado?.datos || {};
  const workflow = datos.workflow || {};

  return Swal.fire({
    icon: "success",
    title: "Render solicitado",
    html: crearHtmlRender({ mensaje, modo: resultado?.modo, workflow }),
    confirmButtonText: "Entendido",
    confirmButtonColor: colores.colorPrimario,
    iconColor: colores.colorSecundario,
    background: "#ffffff",
    color: "#111827",
    width: 760,
    didOpen: () => {
      const botonCopiar = document.querySelector("[data-copiar-render-url]");

      if (!botonCopiar || !workflow.urlRun) {
        return;
      }

      botonCopiar.addEventListener("click", async () => {
        await navigator.clipboard.writeText(workflow.urlRun);
        botonCopiar.textContent = "Link copiado";
      });
    }
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
      errorTecnico: crearDetalleTecnico(error),
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

function crearHtmlRender({ mensaje, modo, workflow }) {
  const urlRun = workflow?.urlRun || "";
  const urlWorkflow = workflow?.urlWorkflow || "";
  const idRun = workflow?.idRun || "";

  return `
    <div style="text-align:left">
      <p>${escaparHtml(mensaje)}</p>
      <div style="background:#f1f5f9;padding:12px;border-radius:6px;font-size:13px;margin-top:12px">
        <p style="margin:0 0 6px"><strong>Modo:</strong> ${escaparHtml(modo || "api")}</p>
        ${idRun ? `<p style="margin:0 0 6px"><strong>ID del run:</strong> ${escaparHtml(idRun)}</p>` : ""}
        ${
          urlRun
            ? `<p style="margin:0 0 10px;word-break:break-all"><strong>Run:</strong> ${crearLinkSeguro(urlRun)}</p>`
            : `<p style="margin:0 0 10px"><strong>Run:</strong> GitHub todavia no devolvio el enlace del run. Entra al workflow para verlo.</p>`
        }
        ${urlWorkflow ? `<p style="margin:0 0 10px;word-break:break-all"><strong>Workflow:</strong> ${crearLinkSeguro(urlWorkflow)}</p>` : ""}
        <p style="margin:0">${escaparHtml(
          workflow?.mensajeDescarga || "Cuando termine el workflow, descarga los artefactos pagina-presentacion y videos-presentacion."
        )}</p>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:14px">
        ${
          urlRun
            ? `<a href="${escaparAtributo(urlRun)}" target="_blank" rel="noopener noreferrer" style="${estiloBotonLink()}">Abrir run</a>
               <button type="button" data-copiar-render-url style="${estiloBotonSecundario()}">Copiar link completo</button>`
            : ""
        }
        ${urlWorkflow ? `<a href="${escaparAtributo(urlWorkflow)}" target="_blank" rel="noopener noreferrer" style="${estiloBotonSecundario()}">Abrir workflow</a>` : ""}
      </div>
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

function crearLinkSeguro(url) {
  return `<a href="${escaparAtributo(url)}" target="_blank" rel="noopener noreferrer">${escaparHtml(url)}</a>`;
}

function estiloBotonLink() {
  return "display:inline-flex;align-items:center;justify-content:center;border-radius:6px;background:#111827;color:#fff;text-decoration:none;padding:10px 14px;font-weight:700";
}

function estiloBotonSecundario() {
  return "display:inline-flex;align-items:center;justify-content:center;border-radius:6px;border:1px solid #cbd5e1;background:#fff;color:#111827;text-decoration:none;padding:10px 14px;font-weight:700;cursor:pointer";
}

function escaparAtributo(valor) {
  return escaparHtml(valor).replaceAll("`", "&#096;");
}

function escaparHtml(valor) {
  return String(valor || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function crearDetalleTecnico(error) {
  if (!error) {
    return "Sin detalle tecnico.";
  }

  const detalles = error.detalles
    ? `\n\nDetalles del servidor:\n${typeof error.detalles === "string" ? error.detalles : JSON.stringify(error.detalles, null, 2)}`
    : "";

  return `${error.stack || error.message || "Sin detalle tecnico."}${detalles}`;
}
