import { responderError } from "./servicioRespuesta.js";

export async function consultarSupabase({ entorno, token, ruta, metodo = "GET", cuerpo }) {
  validarConfiguracionSupabase(entorno);

  const respuesta = await fetch(`${entorno.SUPABASE_URL}/rest/v1/${ruta}`, {
    method: metodo,
    headers: {
      "apikey": entorno.SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined
  });

  const texto = await respuesta.text();
  const datos = texto ? JSON.parse(texto) : null;

  if (!respuesta.ok) {
    throw responderError({
      codigo: "error_supabase",
      mensaje: "Supabase rechazo la operacion solicitada.",
      estadoHttp: respuesta.status,
      detalles: datos
    });
  }

  return datos;
}

export async function consultarSupabaseConServicio({ entorno, ruta, metodo = "GET", cuerpo }) {
  validarConfiguracionSupabaseServicio(entorno);

  const respuesta = await fetch(`${entorno.SUPABASE_URL}/rest/v1/${ruta}`, {
    method: metodo,
    headers: {
      "apikey": entorno.SUPABASE_SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${entorno.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined
  });

  const texto = await respuesta.text();
  const datos = texto ? JSON.parse(texto) : null;

  if (!respuesta.ok) {
    throw responderError({
      codigo: "error_supabase_servicio",
      mensaje: "Supabase rechazo la consulta segura de servicio.",
      estadoHttp: respuesta.status,
      detalles: datos
    });
  }

  return datos;
}

export function validarConfiguracionSupabase(entorno) {
  const faltantes = ["SUPABASE_URL", "SUPABASE_ANON_KEY"].filter((clave) => !entorno[clave]);

  if (faltantes.length > 0) {
    throw responderError({
      codigo: "configuracion_incompleta",
      mensaje: "Faltan variables de entorno necesarias para conectar con Supabase.",
      estadoHttp: 500,
      detalles: faltantes
    });
  }
}

function validarConfiguracionSupabaseServicio(entorno) {
  const faltantes = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"].filter((clave) => !entorno[clave]);

  if (faltantes.length > 0) {
    throw responderError({
      codigo: "configuracion_servicio_incompleta",
      mensaje: "Faltan variables de entorno de servicio para consultar Supabase.",
      estadoHttp: 500,
      detalles: faltantes
    });
  }
}
