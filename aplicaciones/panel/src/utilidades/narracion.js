const DURACION_MINIMA_SEGUNDOS = 4;
const COLCHON_SEGUNDOS = 1.5;
const PALABRAS_POR_MINUTO_DEFAULT = 125;

export function prepararTextoSeccionNarracion(seccion) {
  const partes = [
    seccion.narracion,
    seccion.descripcion,
    seccion.titulo
  ];

  return limpiarTextoNarracion(partes.find((parte) => limpiarTextoNarracion(parte)) || "");
}

export function prepararTextoNarracion(secciones) {
  return secciones
    .map(prepararTextoSeccionNarracion)
    .filter(Boolean)
    .join(" ");
}

export function calcularDuracionNarracionSegundos(texto, configuracion = {}) {
  const palabras = contarPalabras(texto);

  if (!palabras) {
    return DURACION_MINIMA_SEGUNDOS;
  }

  const velocidad = Number.parseFloat(configuracion.velocidadNarracion) || 1;
  const palabrasPorMinuto = Number(configuracion.palabrasPorMinutoNarracion) || PALABRAS_POR_MINUTO_DEFAULT;
  const segundosNarracion = (palabras / Math.max(60, palabrasPorMinuto * velocidad)) * 60;

  return Math.ceil(segundosNarracion + COLCHON_SEGUNDOS);
}

export function ajustarDuracionesSeccionesPorNarracion(secciones, presentacion = {}) {
  return secciones.map((seccion) => {
    if (seccion.activaEnVideo === false) {
      return seccion;
    }

    const texto = prepararTextoSeccionNarracion(seccion);
    const duracionNarracion = calcularDuracionNarracionSegundos(texto, presentacion);
    const duracionActual = Number(seccion.duracionSugeridaSegundos) || 0;

    return {
      ...seccion,
      duracionSugeridaSegundos: Math.max(DURACION_MINIMA_SEGUNDOS, duracionActual, duracionNarracion)
    };
  });
}

function contarPalabras(texto) {
  const coincidencias = limpiarTextoNarracion(texto).match(/[A-Za-zÀ-ÿ0-9]+(?:['-][A-Za-zÀ-ÿ0-9]+)?/g);
  return coincidencias?.length || 0;
}

function limpiarTextoNarracion(texto) {
  return String(texto || "").replace(/\s+/g, " ").trim();
}
