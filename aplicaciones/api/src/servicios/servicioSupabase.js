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
  const cabecerasServicio = crearCabecerasServicioSupabase(entorno.SUPABASE_SERVICE_ROLE_KEY);

  const respuesta = await fetch(`${entorno.SUPABASE_URL}/rest/v1/${ruta}`, {
    method: metodo,
    headers: {
      ...cabecerasServicio,
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

  validarClaveServicioSupabase(entorno.SUPABASE_SERVICE_ROLE_KEY);
}

export function crearCabecerasServicioSupabase(claveServicio) {
  const claveNormalizada = normalizarClaveSupabase(claveServicio);
  const cabeceras = {
    "apikey": claveNormalizada
  };

  if (esJwtSupabase(claveNormalizada)) {
    cabeceras.Authorization = `Bearer ${claveNormalizada}`;
  }

  return cabeceras;
}

export function validarClaveServicioSupabase(claveServicio) {
  const claveNormalizada = normalizarClaveSupabase(claveServicio);

  if (esJwtSupabase(claveNormalizada) || claveNormalizada.startsWith("sb_secret_")) {
    return;
  }

  throw responderError({
    codigo: "supabase_service_role_invalida",
    mensaje: "La clave de servicio de Supabase no tiene formato valido.",
    estadoHttp: 500,
    detalles: "Configura SUPABASE_SERVICE_ROLE_KEY con una secret key sb_secret_... o con la legacy service_role JWT. No uses la publishable/anon key en esta variable."
  });
}

function normalizarClaveSupabase(clave) {
  return String(clave || "").trim();
}

function esJwtSupabase(clave) {
  return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(clave);
}
