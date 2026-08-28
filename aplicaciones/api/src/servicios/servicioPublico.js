import { consultarSupabaseConServicio } from "./servicioSupabase.js";

export async function obtenerLogoPublico({ entorno }) {
  const assets = await consultarSupabaseConServicio({
    entorno,
    ruta: "asset?tipo=eq.logo&estado=eq.disponible&fecha_eliminacion=is.null&url_publica=not.is.null&select=id,url_publica,fecha_actualizacion&order=fecha_actualizacion.desc&limit=1"
  });

  const logo = assets?.[0];

  return {
    logoUrl: optimizarUrlCloudinaryAvif(logo?.url_publica || ""),
    fechaActualizacion: logo?.fecha_actualizacion || null
  };
}

export function optimizarUrlCloudinaryAvif(url) {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url || "";
  }

  const transformacion = "f_avif,q_auto:best";

  if (url.includes(`/upload/${transformacion}/`)) {
    return url;
  }

  return url.replace("/upload/", `/upload/${transformacion}/`);
}
