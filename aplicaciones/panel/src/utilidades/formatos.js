export function obtenerResolucionFormato(formato) {
  if (formato === "vertical") {
    return "1080 x 1920";
  }

  return "1920 x 1080";
}

export function obtenerEtiquetaFormato(formato) {
  return formato === "vertical" ? "Vertical 9:16" : "Horizontal 16:9";
}
