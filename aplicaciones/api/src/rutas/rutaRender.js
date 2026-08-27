import { exigirUsuarioAutenticado } from "../servicios/servicioAutenticacion.js";
import { exportarDatosRender, solicitarRender } from "../servicios/servicioRender.js";
import { responderError, responderJson } from "../servicios/servicioRespuesta.js";
import { validarSolicitudRender } from "../validaciones/validacionRender.js";

export async function manejarRutaRender(solicitud, entorno) {
  const url = new URL(solicitud.url);
  const partes = url.pathname.split("/").filter(Boolean);
  const accion = partes[1];
  const usuario = await exigirUsuarioAutenticado(solicitud, entorno);

  if (solicitud.method === "GET" && accion === "datos") {
    const presentacionId = url.searchParams.get("presentacionId");

    if (!presentacionId) {
      return responderError({
        codigo: "presentacion_requerida",
        mensaje: "Debes enviar presentacionId para exportar datos de render.",
        estadoHttp: 422
      });
    }

    const datos = await exportarDatosRender({
      entorno,
      token: usuario.token,
      presentacionId
    });

    return responderJson({ datos });
  }

  if (solicitud.method === "POST" && accion === "solicitar") {
    const cuerpo = await solicitud.json();
    const validacion = validarSolicitudRender(cuerpo);

    if (!validacion.valida) {
      return responderError({
        codigo: "solicitud_render_invalida",
        mensaje: "La solicitud de render no cumple las validaciones requeridas.",
        estadoHttp: 422,
        detalles: validacion.errores
      });
    }

    const resultado = await solicitarRender({
      entorno,
      token: usuario.token,
      usuario,
      datos: validacion.datos
    });

    return responderJson({ datos: resultado }, 201);
  }

  return responderError({
    codigo: "metodo_no_permitido",
    mensaje: "Metodo no permitido para render.",
    estadoHttp: 405
  });
}

