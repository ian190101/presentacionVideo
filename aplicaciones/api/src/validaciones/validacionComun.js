export function limpiarTexto(valor) {
  if (typeof valor !== "string") {
    return "";
  }

  return valor.trim().replace(/\s+/g, " ");
}

export function textoEntre(valor, minimo, maximo) {
  const texto = limpiarTexto(valor);
  return texto.length >= minimo && texto.length <= maximo;
}

export function estaEnLista(valor, opciones) {
  return opciones.includes(valor);
}
