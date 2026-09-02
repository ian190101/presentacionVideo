import { consultarSupabase } from "./servicioSupabase.js";

export async function listarPresentaciones({ entorno, token }) {
  return consultarSupabase({
    entorno,
    token,
    ruta: "presentacion?select=*&fecha_eliminacion=is.null&order=fecha_actualizacion.desc"
  });
}

export async function obtenerPresentacion({ entorno, token, id }) {
  const datos = await consultarSupabase({
    entorno,
    token,
    ruta: `presentacion?id=eq.${encodeURIComponent(id)}&fecha_eliminacion=is.null&select=*`
  });

  return datos[0] || null;
}

export async function crearPresentacion({ entorno, token, usuario, datos }) {
  const cuerpo = {
    nombre: datos.nombre,
    descripcion: datos.descripcion || null,
    empresa_objetivo: datos.empresaObjetivo,
    industria_objetivo: datos.industriaObjetivo || null,
    formato_preferido: datos.formatoPreferido || "horizontal",
    color_principal: datos.colorPrimario || null,
    color_secundario: datos.colorSecundario || null,
    configuracion_tema: datos.configuracionTema || {},
    creado_por: usuario.id
  };

  const respuesta = await consultarSupabase({
    entorno,
    token,
    ruta: "presentacion",
    metodo: "POST",
    cuerpo
  });

  return respuesta[0];
}

export async function actualizarPresentacion({ entorno, token, id, datos }) {
  const cuerpo = {};

  if (datos.nombre !== undefined) cuerpo.nombre = datos.nombre;
  if (datos.descripcion !== undefined) cuerpo.descripcion = datos.descripcion || null;
  if (datos.empresaObjetivo !== undefined) cuerpo.empresa_objetivo = datos.empresaObjetivo;
  if (datos.industriaObjetivo !== undefined) cuerpo.industria_objetivo = datos.industriaObjetivo || null;
  if (datos.formatoPreferido !== undefined) cuerpo.formato_preferido = datos.formatoPreferido;
  if (datos.colorPrimario !== undefined) cuerpo.color_principal = datos.colorPrimario;
  if (datos.colorSecundario !== undefined) cuerpo.color_secundario = datos.colorSecundario;
  if (datos.configuracionTema !== undefined) cuerpo.configuracion_tema = datos.configuracionTema || {};

  const respuesta = await consultarSupabase({
    entorno,
    token,
    ruta: `presentacion?id=eq.${encodeURIComponent(id)}`,
    metodo: "PATCH",
    cuerpo
  });

  return respuesta[0];
}

export async function eliminarPresentacion({ entorno, token, id }) {
  const respuesta = await consultarSupabase({
    entorno,
    token,
    ruta: `presentacion?id=eq.${encodeURIComponent(id)}`,
    metodo: "PATCH",
    cuerpo: { fecha_eliminacion: new Date().toISOString() }
  });

  return respuesta[0];
}
