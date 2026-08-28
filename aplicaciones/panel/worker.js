export default {
  async fetch(solicitud, entorno) {
    const url = new URL(solicitud.url);

    if (url.pathname === "/configuracion-entorno.js") {
      return new Response(crearScriptConfiguracion(entorno), {
        headers: {
          "Content-Type": "application/javascript; charset=utf-8",
          "Cache-Control": "no-store"
        }
      });
    }

    return entorno.ASSETS.fetch(solicitud);
  }
};

function crearScriptConfiguracion(entorno) {
  const configuracion = {
    VITE_API_URL: entorno.VITE_API_URL || "",
    VITE_SUPABASE_URL: entorno.VITE_SUPABASE_URL || "",
    VITE_SUPABASE_ANON_KEY: entorno.VITE_SUPABASE_ANON_KEY || ""
  };

  return `window.__CONFIGURACION_ENTORNO__ = ${JSON.stringify(configuracion)};`;
}
