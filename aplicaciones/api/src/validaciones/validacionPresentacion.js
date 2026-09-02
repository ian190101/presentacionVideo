import { limpiarTexto, textoEntre, estaEnLista } from "./validacionComun.js";

const formatosPermitidos = ["horizontal", "vertical"];

export function validarNuevaPresentacion(entrada) {
  const errores = [];
  const datos = {
    nombre: limpiarTexto(entrada?.nombre),
    descripcion: limpiarTexto(entrada?.descripcion),
    empresaObjetivo: limpiarTexto(entrada?.empresaObjetivo),
    industriaObjetivo: limpiarTexto(entrada?.industriaObjetivo),
    formatoPreferido: limpiarTexto(entrada?.formatoPreferido || "horizontal"),
    colorPrimario: limpiarTexto(entrada?.colorPrimario),
    colorSecundario: limpiarTexto(entrada?.colorSecundario),
    configuracionTema: entrada?.configuracionTema || {}
  };

  if (!textoEntre(datos.nombre, 3, 120)) {
    errores.push({
      campo: "nombre",
      mensaje: "El nombre debe tener entre 3 y 120 caracteres."
    });
  }

  if (!textoEntre(datos.empresaObjetivo, 2, 160)) {
    errores.push({
      campo: "empresaObjetivo",
      mensaje: "La empresa objetivo debe tener entre 2 y 160 caracteres."
    });
  }

  if (!estaEnLista(datos.formatoPreferido, formatosPermitidos)) {
    errores.push({
      campo: "formatoPreferido",
      mensaje: "El formato preferido debe ser horizontal o vertical."
    });
  }

  return {
    valida: errores.length === 0,
    errores,
    datos
  };
}

export function validarActualizacionPresentacion(entrada) {
  const errores = [];
  const datos = {};

  if (entrada?.nombre !== undefined) {
    datos.nombre = limpiarTexto(entrada.nombre);

    if (!textoEntre(datos.nombre, 3, 120)) {
      errores.push({
        campo: "nombre",
        mensaje: "El nombre debe tener entre 3 y 120 caracteres."
      });
    }
  }

  if (entrada?.descripcion !== undefined) {
    datos.descripcion = limpiarTexto(entrada.descripcion);
  }

  if (entrada?.empresaObjetivo !== undefined) {
    datos.empresaObjetivo = limpiarTexto(entrada.empresaObjetivo);

    if (!textoEntre(datos.empresaObjetivo, 2, 160)) {
      errores.push({
        campo: "empresaObjetivo",
        mensaje: "La empresa objetivo debe tener entre 2 y 160 caracteres."
      });
    }
  }

  if (entrada?.industriaObjetivo !== undefined) {
    datos.industriaObjetivo = limpiarTexto(entrada.industriaObjetivo);
  }

  if (entrada?.formatoPreferido !== undefined) {
    datos.formatoPreferido = limpiarTexto(entrada.formatoPreferido);

    if (!estaEnLista(datos.formatoPreferido, formatosPermitidos)) {
      errores.push({
        campo: "formatoPreferido",
        mensaje: "El formato preferido debe ser horizontal o vertical."
      });
    }
  }

  if (entrada?.colorPrimario !== undefined) {
    datos.colorPrimario = limpiarTexto(entrada.colorPrimario);
  }

  if (entrada?.colorSecundario !== undefined) {
    datos.colorSecundario = limpiarTexto(entrada.colorSecundario);
  }

  if (entrada?.configuracionTema !== undefined) {
    datos.configuracionTema = entrada.configuracionTema || {};
  }

  return {
    valida: errores.length === 0,
    errores,
    datos
  };
}
