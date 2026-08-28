import { exigirUsuarioAutenticado } from "../servicios/servicioAutenticacion.js";
import { listarEventosAuditoria } from "../servicios/servicioAuditoria.js";
import { responderError, responderJson } from "../servicios/servicioRespuesta.js";

export async function manejarRutaAuditoria(solicitud, entorno) {
  const url = new URL(solicitud.url);
  const usuario = await exigirUsuarioAutenticado(solicitud, entorno);

  if (solicitud.method === "GET") {
    const eventos = await listarEventosAuditoria({
      entorno,
      token: usuario.token,
      limite: url.searchParams.get("limite")
    });

    return responderJson({ datos: eventos });
  }

  return responderError({
    codigo: "metodo_no_permitido",
    mensaje: "Metodo no permitido para auditoria.",
    estadoHttp: 405
  });
}
