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
