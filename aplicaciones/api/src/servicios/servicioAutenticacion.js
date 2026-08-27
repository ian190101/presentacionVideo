import { responderError } from "./servicioRespuesta.js";
import { validarConfiguracionSupabase } from "./servicioSupabase.js";

export async function exigirUsuarioAutenticado(solicitud, entorno) {
  validarConfiguracionSupabase(entorno);

  const token = obtenerTokenBearer(solicitud);

  if (!token) {
    throw responderError({
      codigo: "sin_autenticacion",
      mensaje: "Debes iniciar sesion para acceder a este recurso.",
      estadoHttp: 401
    });
  }

  const respuesta = await fetch(`${entorno.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      "apikey": entorno.SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${token}`
    }
  });

  if (!respuesta.ok) {
    throw responderError({
      codigo: "sesion_invalida",
      mensaje: "La sesion no es valida o ya expiro.",
      estadoHttp: 401
    });
  }

  const usuario = await respuesta.json();

  return {
    id: usuario.id,
    email: usuario.email,
    token
  };
}

function obtenerTokenBearer(solicitud) {
  const cabecera = solicitud.headers.get("Authorization") || "";

  if (!cabecera.startsWith("Bearer ")) {
    return null;
  }

  return cabecera.slice("Bearer ".length).trim();
}
