export function crearTemaVideo(datos) {
  const colorPrimario = validarHex(datos.colorPrimario, "#d40511");
  const colorSecundario = validarHex(datos.colorSecundario, "#22c7dd");

  return {
    colorPrimario,
    colorSecundario,
    fondoPrincipal: ajustarLuminosidad(colorPrimario, 0.24),
    fondoSecundario: ajustarLuminosidad(colorSecundario, 0.2),
    fondoAcento: ajustarLuminosidad(colorPrimario, 0.38)
  };
}

function validarHex(valor, respaldo) {
  return /^#[0-9a-f]{6}$/i.test(valor || "") ? valor : respaldo;
}

function ajustarLuminosidad(hex, factor) {
  const rojo = Math.max(0, Math.min(255, Math.round(parseInt(hex.slice(1, 3), 16) * factor)));
  const verde = Math.max(0, Math.min(255, Math.round(parseInt(hex.slice(3, 5), 16) * factor)));
  const azul = Math.max(0, Math.min(255, Math.round(parseInt(hex.slice(5, 7), 16) * factor)));

  return `rgb(${rojo}, ${verde}, ${azul})`;
}
