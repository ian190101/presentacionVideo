import { consultarSupabase } from "./servicioSupabase.js";

export async function listarAssets({ entorno, token, presentacionId }) {
  const filtroPresentacion = presentacionId
    ? `presentacion_id=eq.${encodeURIComponent(presentacionId)}&`
    : "";

  return consultarSupabase({
    entorno,
    token,
    ruta: `asset?${filtroPresentacion}fecha_eliminacion=is.null&select=*&order=fecha_actualizacion.desc`
  });
}

export async function registrarAsset({ entorno, token, usuario, datos }) {
  const cuerpo = {
    presentacion_id: datos.presentacionId || null,
    tipo: datos.tipo,
    proveedor: datos.proveedor,
    url_publica: datos.urlPublica || null,
    ruta_storage: datos.rutaStorage || null,
    formato: datos.formato || null,
    mime_type: datos.mimeType || null,
    tamano_bytes: datos.tamanoBytes || null,
    ancho: datos.ancho,
    alto: datos.alto,
    duracion_segundos: datos.duracionSegundos,
    hash_contenido: datos.hashContenido || null,
    creado_por: usuario.id
  };

  const respuesta = await consultarSupabase({
    entorno,
    token,
    ruta: "asset",
    metodo: "POST",
    cuerpo
  });

  return respuesta[0];
}

export async function crearFirmaSubidaImagen({ entorno, datos }) {
  if (!entorno.CLOUDINARY_CLOUD_NAME || !entorno.CLOUDINARY_API_KEY || !entorno.CLOUDINARY_API_SECRET) {
    return {
      modo: "pendiente_configuracion",
      mensaje: "Cloudinary todavia no esta configurado completamente en variables de entorno."
    };
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const carpeta = normalizarCarpeta(`presentaciones/${datos.presentacionId || "general"}`);
  const publicId = normalizarPublicId(datos.nombreArchivo || `asset-${timestamp}`);
  const parametros = {
    folder: carpeta,
    public_id: publicId,
    timestamp,
    transformation: "f_auto,q_auto"
  };
  const signature = await firmarCloudinary(parametros, entorno.CLOUDINARY_API_SECRET);

  return {
    modo: "firma_generada",
    cloudName: entorno.CLOUDINARY_CLOUD_NAME,
    apiKey: entorno.CLOUDINARY_API_KEY,
    timestamp,
    folder: carpeta,
    publicId,
    transformation: parametros.transformation,
    signature
  };
}

async function firmarCloudinary(parametros, apiSecret) {
  const cadena = Object.entries(parametros)
    .filter(([, valor]) => valor !== undefined && valor !== null && valor !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([clave, valor]) => `${clave}=${valor}`)
    .join("&");

  const bytes = new TextEncoder().encode(`${cadena}${apiSecret}`);
  const hash = await crypto.subtle.digest("SHA-1", bytes);

  return [...new Uint8Array(hash)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function normalizarCarpeta(valor) {
  return String(valor)
    .toLowerCase()
    .replace(/[^a-z0-9/_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^\/+|\/+$/g, "");
}

function normalizarPublicId(valor) {
  return String(valor)
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}
