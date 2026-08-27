import { estaEnLista, limpiarTexto } from "./validacionComun.js";

const FORMATOS_VALIDOS = ["horizontal", "vertical", "ambos"];
const ORIGENES_VALIDOS = ["local", "github_actions"];
const CALIDADES_VALIDAS = ["rapida", "equilibrada", "alta"];

export function validarSolicitudRender(datos) {
  const presentacionId = limpiarTexto(datos?.presentacionId);
  const formato = limpiarTexto(datos?.formato || "ambos");
  const origen = limpiarTexto(datos?.origen || "local");
  const calidad = limpiarTexto(datos?.calidad || "rapida");
  const forzar = Boolean(datos?.forzar);
  const errores = [];

  if (!presentacionId) {
    errores.push("La presentacion es obligatoria para solicitar render.");
  }

  if (!estaEnLista(formato, FORMATOS_VALIDOS)) {
    errores.push("El formato de render debe ser horizontal, vertical o ambos.");
  }

  if (!estaEnLista(origen, ORIGENES_VALIDOS)) {
    errores.push("El origen de render debe ser local o github_actions.");
  }

  if (!estaEnLista(calidad, CALIDADES_VALIDAS)) {
    errores.push("La calidad de render debe ser rapida, equilibrada o alta.");
  }

  return {
    valida: errores.length === 0,
    errores,
    datos: {
      presentacionId,
      formato,
      origen,
      calidad,
      forzar
    }
  };
}
