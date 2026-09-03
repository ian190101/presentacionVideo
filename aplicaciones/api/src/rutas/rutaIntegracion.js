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

  const cuerpo = await solicitud.json().catch(() => ({}));

  if (servicio === "supabase") {
    return responderJson({ datos: await probarConexionSupabase(crearConfiguracionSupabase(entorno, cuerpo)) });
  }

  if (servicio === "cloudinary") {
    return responderJson({ datos: await probarConexionCloudinary(crearConfiguracionCloudinary(entorno, cuerpo)) });
  }

  if (servicio === "hugging-face") {
    return responderJson({ datos: await probarConexionHuggingFace(crearConfiguracionHuggingFace(entorno, cuerpo)) });
  }

  return responderError({
    codigo: "integracion_no_soportada",
    mensaje: "La integracion solicitada no esta soportada.",
    estadoHttp: 404
  });
}

function crearConfiguracionSupabase(entorno, cuerpo) {
  return {
    urlSupabase: cuerpo.urlSupabase || entorno.SUPABASE_URL,
    clavePublica: cuerpo.clavePublica || entorno.SUPABASE_ANON_KEY,
    claveSecreta: cuerpo.claveSecreta || entorno.SUPABASE_SERVICE_ROLE_KEY
  };
}

function crearConfiguracionCloudinary(entorno, cuerpo) {
  return {
    cloudName: cuerpo.cloudName || entorno.CLOUDINARY_CLOUD_NAME,
    clavePublica: cuerpo.clavePublica || entorno.CLOUDINARY_API_KEY,
    claveSecreta: cuerpo.claveSecreta || entorno.CLOUDINARY_API_SECRET
  };
}

function crearConfiguracionHuggingFace(entorno, cuerpo) {
  return {
    falKey: cuerpo.falKey || entorno.FAL_KEY || entorno.FAL_TOKEN,
    tokenHuggingFace: cuerpo.tokenHuggingFace || entorno.HF_TOKEN
  };
}
