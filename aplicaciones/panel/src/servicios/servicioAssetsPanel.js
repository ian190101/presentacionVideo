import { solicitarApi } from "./servicioApi.js";

export async function subirImagenCloudinary({ sesion, presentacion, archivo, tipo }) {
  if (sesion.modoDemo) {
    return {
      modo: "demo",
      mensaje: "Modo demo: la imagen no se subio, pero el flujo esta preparado.",
      asset: null
    };
  }

  validarImagenLocal(archivo);

  const firma = await solicitarApi("/asset/firma-subida-imagen", {
    token: sesion.token,
    metodo: "POST",
    cuerpo: {
      presentacionId: presentacion.id,
      nombreArchivo: archivo.name
    }
  });

  if (firma.datos?.modo !== "firma_generada") {
    return {
      modo: firma.datos?.modo || "pendiente_configuracion",
      mensaje: firma.datos?.mensaje || "No se pudo generar firma Cloudinary.",
      asset: null
    };
  }

  const datosSubida = new FormData();
  datosSubida.append("file", archivo);
  datosSubida.append("api_key", firma.datos.apiKey);
  datosSubida.append("timestamp", firma.datos.timestamp);
  datosSubida.append("signature", firma.datos.signature);
  datosSubida.append("folder", firma.datos.folder);
  datosSubida.append("public_id", firma.datos.publicId);

  const respuestaCloudinary = await fetch(`https://api.cloudinary.com/v1_1/${firma.datos.cloudName}/image/upload`, {
    method: "POST",
    body: datosSubida
  });

  const subida = await respuestaCloudinary.json();

  if (!respuestaCloudinary.ok) {
    const error = new Error(subida.error?.message || "Cloudinary rechazo la subida.");
    error.codigo = `cloudinary_http_${respuestaCloudinary.status}`;
    throw error;
  }

  const registro = await registrarAssetSubido({
    sesion,
    presentacion,
    tipo,
    subida,
    archivo
  });

  return {
    modo: "cloudinary",
    mensaje: "Imagen subida y registrada correctamente.",
    asset: registro.datos
  };
}

export async function registrarAssetDesdeUrl({ sesion, presentacion, datos }) {
  if (sesion.modoDemo) {
    return {
      modo: "demo",
      mensaje: "Modo demo: asset guardado solo como referencia local.",
      asset: {
        ...datos,
        id: `asset-${Date.now()}`
      }
    };
  }

  const registro = await solicitarApi("/asset/registrar", {
    token: sesion.token,
    metodo: "POST",
    cuerpo: {
      presentacionId: presentacion.id,
      tipo: datos.tipo,
      proveedor: datos.proveedor,
      urlPublica: datos.urlPublica,
      formato: datos.formato,
      mimeType: datos.mimeType,
      tamanoBytes: datos.tamanoBytes,
      ancho: datos.ancho,
      alto: datos.alto
    }
  });

  return {
    modo: "api",
    mensaje: "Asset registrado correctamente.",
    asset: registro.datos
  };
}

function validarImagenLocal(archivo) {
  const permitidos = ["image/webp", "image/png", "image/jpeg"];

  if (!archivo) {
    throw new Error("Selecciona un archivo de imagen.");
  }

  if (!permitidos.includes(archivo.type)) {
    throw new Error("Solo se permiten imagenes WebP, PNG o JPG.");
  }

  if (archivo.size > 5 * 1024 * 1024) {
    throw new Error("La imagen no debe superar 5 MB.");
  }
}

async function registrarAssetSubido({ sesion, presentacion, tipo, subida, archivo }) {
  return solicitarApi("/asset/registrar", {
    token: sesion.token,
    metodo: "POST",
    cuerpo: {
      presentacionId: presentacion.id,
      tipo,
      proveedor: "cloudinary",
      urlPublica: crearUrlOptimizadaCloudinary(subida.secure_url),
      rutaStorage: subida.public_id,
      formato: subida.format,
      mimeType: archivo.type,
      tamanoBytes: subida.bytes,
      ancho: subida.width,
      alto: subida.height,
      hashContenido: subida.etag
    }
  });
}

function crearUrlOptimizadaCloudinary(url) {
  if (!url || !url.includes("/upload/")) {
    return url;
  }

  return url.replace("/upload/", "/upload/f_auto,q_auto/");
}
