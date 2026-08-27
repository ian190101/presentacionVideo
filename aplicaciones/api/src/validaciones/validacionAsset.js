import {
  limitesArchivoPorTipo,
  proveedoresAssetPermitidos,
  tiposAssetImagen,
  tiposAssetPermitidos
} from "../constantes/constantesAssets.js";
import { estaEnLista, limpiarTexto } from "./validacionComun.js";

export function validarRegistroAsset(entrada) {
  const errores = [];
  const datos = {
    presentacionId: limpiarTexto(entrada?.presentacionId),
    tipo: limpiarTexto(entrada?.tipo),
    proveedor: limpiarTexto(entrada?.proveedor),
    urlPublica: limpiarTexto(entrada?.urlPublica),
    rutaStorage: limpiarTexto(entrada?.rutaStorage),
    formato: limpiarTexto(entrada?.formato).toLowerCase(),
    mimeType: limpiarTexto(entrada?.mimeType).toLowerCase(),
    tamanoBytes: Number(entrada?.tamanoBytes || 0),
    ancho: entrada?.ancho ? Number(entrada.ancho) : null,
    alto: entrada?.alto ? Number(entrada.alto) : null,
    duracionSegundos: entrada?.duracionSegundos ? Number(entrada.duracionSegundos) : null,
    hashContenido: limpiarTexto(entrada?.hashContenido)
  };

  if (!estaEnLista(datos.tipo, tiposAssetPermitidos)) {
    errores.push({ campo: "tipo", mensaje: "El tipo de asset no esta permitido." });
  }

  if (!estaEnLista(datos.proveedor, proveedoresAssetPermitidos)) {
    errores.push({ campo: "proveedor", mensaje: "El proveedor de asset no esta permitido." });
  }

  validarArchivoPorTipo(datos, errores);

  if (!datos.urlPublica && !datos.rutaStorage) {
    errores.push({
      campo: "archivo",
      mensaje: "Debes registrar una URL publica o una ruta de storage."
    });
  }

  return {
    valida: errores.length === 0,
    errores,
    datos
  };
}

function validarArchivoPorTipo(datos, errores) {
  const grupo = obtenerGrupoArchivo(datos.tipo);
  const limites = limitesArchivoPorTipo[grupo];

  if (!limites) {
    return;
  }

  if (!limites.mimePermitidos.includes(datos.mimeType)) {
    errores.push({
      campo: "mimeType",
      mensaje: `El MIME ${datos.mimeType || "vacio"} no esta permitido para ${grupo}.`
    });
  }

  if (!limites.formatosPermitidos.includes(datos.formato)) {
    errores.push({
      campo: "formato",
      mensaje: `El formato ${datos.formato || "vacio"} no esta permitido para ${grupo}.`
    });
  }

  if (datos.tamanoBytes <= 0 || datos.tamanoBytes > limites.tamanoMaximoBytes) {
    errores.push({
      campo: "tamanoBytes",
      mensaje: `El archivo supera el limite permitido para ${grupo}.`
    });
  }
}

function obtenerGrupoArchivo(tipo) {
  if (tiposAssetImagen.includes(tipo)) {
    return "imagen";
  }

  if (tipo === "audio") {
    return "audio";
  }

  if (tipo === "video") {
    return "video";
  }

  return null;
}
