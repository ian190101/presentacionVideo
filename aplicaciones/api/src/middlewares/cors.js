export function manejarCors(solicitud, entorno) {
  if (solicitud.method !== "OPTIONS") {
    return null;
  }

  return new Response(null, {
    status: 204,
    headers: crearCabecerasCors(entorno)
  });
}

export function crearCabecerasCors(entorno) {
  return {
    "Access-Control-Allow-Origin": entorno.CORS_ORIGEN_PERMITIDO || "http://localhost:5173",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Authorization,Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

export function agregarCabecerasCors(respuesta, entorno) {
  const cabeceras = new Headers(respuesta.headers);
  const cabecerasCors = crearCabecerasCors(entorno);

  for (const [clave, valor] of Object.entries(cabecerasCors)) {
    cabeceras.set(clave, valor);
  }

  return new Response(respuesta.body, {
    status: respuesta.status,
    statusText: respuesta.statusText,
    headers: cabeceras
  });
}
