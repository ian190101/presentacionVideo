export function aplicarCabecerasSeguridad(respuesta) {
  const cabeceras = new Headers(respuesta.headers);

  cabeceras.set("X-Content-Type-Options", "nosniff");
  cabeceras.set("Referrer-Policy", "strict-origin-when-cross-origin");
  cabeceras.set("X-Frame-Options", "DENY");
  cabeceras.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  cabeceras.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  cabeceras.set("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");

  return new Response(respuesta.body, {
    status: respuesta.status,
    statusText: respuesta.statusText,
    headers: cabeceras
  });
}
