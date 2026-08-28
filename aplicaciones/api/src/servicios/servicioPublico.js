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

export async function obtenerTemaPublico({ entorno }) {
  const presentaciones = await consultarSupabaseConServicio({
    entorno,
    ruta: "presentacion?fecha_eliminacion=is.null&select=id,nombre,empresa_objetivo,color_principal,color_secundario,fecha_actualizacion&order=fecha_actualizacion.desc&limit=1"
  });

  const presentacion = presentaciones?.[0];

  return {
    presentacionId: presentacion?.id || null,
    nombre: presentacion?.nombre || "",
    empresaObjetivo: presentacion?.empresa_objetivo || "",
    colorPrimario: validarHex(presentacion?.color_principal, "#d40511"),
    colorSecundario: validarHex(presentacion?.color_secundario, "#22c7dd"),
    fechaActualizacion: presentacion?.fecha_actualizacion || null
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

function validarHex(valor, respaldo) {
  return /^#[0-9a-f]{6}$/i.test(valor || "") ? valor : respaldo;
}
