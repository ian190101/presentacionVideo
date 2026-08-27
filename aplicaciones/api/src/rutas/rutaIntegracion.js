import { exigirUsuarioAutenticado } from "../servicios/servicioAutenticacion.js";
import {
  probarConexionCloudinary,
  probarConexionHuggingFace,
  probarConexionSupabase
} from "../servicios/servicioIntegracion.js";
import { responderError, responderJson } from "../servicios/servicioRespuesta.js";

export async function manejarRutaIntegracion(solicitud, entorno) {
  const url = new URL(solicitud.url);
  const partes = url.pathname.split("/").filter(Boolean);
  const servicio = partes[1];

  await exigirUsuarioAutenticado(solicitud, entorno);

  if (solicitud.method !== "POST") {
    return responderError({
      codigo: "metodo_no_permitido",
      mensaje: "Metodo no permitido para integraciones.",
      estadoHttp: 405
    });
  }

  const cuerpo = await solicitud.json();

  if (servicio === "supabase") {
    return responderJson({ datos: await probarConexionSupabase(cuerpo) });
  }

  if (servicio === "cloudinary") {
    return responderJson({ datos: await probarConexionCloudinary(cuerpo) });
  }

  if (servicio === "hugging-face") {
    return responderJson({ datos: await probarConexionHuggingFace(cuerpo) });
  }

  return responderError({
    codigo: "integracion_no_soportada",
    mensaje: "La integracion solicitada no esta soportada.",
    estadoHttp: 404
  });
}
