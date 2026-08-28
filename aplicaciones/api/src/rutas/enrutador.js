import { manejarRutaAyuda } from "./rutaAyuda.js";
import { manejarRutaAsset } from "./rutaAsset.js";
import { manejarRutaAuditoria } from "./rutaAuditoria.js";
import { manejarRutaContenido } from "./rutaContenido.js";
import { manejarRutaIntegracion } from "./rutaIntegracion.js";
import { manejarRutaNarracion } from "./rutaNarracion.js";
import { manejarRutaPresentacion } from "./rutaPresentacion.js";
import { manejarRutaPublica } from "./rutaPublica.js";
import { manejarRutaRender } from "./rutaRender.js";
import { manejarRutaSalud } from "./rutaSalud.js";
import { responderError } from "../servicios/servicioRespuesta.js";

export async function enrutarSolicitud(solicitud, entorno, contexto) {
  const url = new URL(solicitud.url);
  const ruta = normalizarRuta(url.pathname);

  if (ruta === "/salud") {
    return manejarRutaSalud();
  }

  if (ruta.startsWith("/publico")) {
    return manejarRutaPublica(solicitud, entorno, contexto);
  }

  if (ruta.startsWith("/ayuda")) {
    return manejarRutaAyuda(solicitud, entorno);
  }

  if (ruta.startsWith("/asset")) {
    return manejarRutaAsset(solicitud, entorno, contexto);
  }

  if (ruta.startsWith("/auditoria")) {
    return manejarRutaAuditoria(solicitud, entorno, contexto);
  }

  if (ruta.startsWith("/integracion")) {
    return manejarRutaIntegracion(solicitud, entorno, contexto);
  }

  if (ruta.startsWith("/narracion")) {
    return manejarRutaNarracion(solicitud, entorno, contexto);
  }

  if (ruta.startsWith("/render")) {
    return manejarRutaRender(solicitud, entorno, contexto);
  }

  if (
    ruta.startsWith("/seccion")
    || ruta.startsWith("/cliente")
    || ruta.startsWith("/proyecto")
    || ruta.startsWith("/equipo")
    || ruta.startsWith("/habilidad")
    || ruta.startsWith("/habilidad_integrante")
  ) {
    return manejarRutaContenido(solicitud, entorno, contexto);
  }

  if (ruta.startsWith("/presentacion")) {
    return manejarRutaPresentacion(solicitud, entorno, contexto);
  }

  return responderError({
    codigo: "ruta_no_encontrada",
    mensaje: "La ruta solicitada no existe.",
    estadoHttp: 404
  });
}

function normalizarRuta(ruta) {
  if (ruta.length > 1 && ruta.endsWith("/")) {
    return ruta.slice(0, -1);
  }

  return ruta;
}
