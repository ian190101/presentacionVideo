import { obtenerLogoPublico } from "../servicios/servicioPublico.js";
import { responderError, responderJson } from "../servicios/servicioRespuesta.js";

export async function manejarRutaPublica(solicitud, entorno) {
  const url = new URL(solicitud.url);
  const partes = url.pathname.split("/").filter(Boolean);
  const recurso = partes[1];

  if (solicitud.method === "GET" && recurso === "logo") {
    return responderJson({ datos: await obtenerLogoPublico({ entorno }) });
  }

  return responderError({
    codigo: "recurso_publico_no_encontrado",
    mensaje: "El recurso publico solicitado no existe.",
    estadoHttp: 404
  });
}
