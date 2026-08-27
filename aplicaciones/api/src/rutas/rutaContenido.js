import { exigirUsuarioAutenticado } from "../servicios/servicioAutenticacion.js";
import {
  actualizarContenido,
  crearContenido,
  eliminarContenido,
  listarContenido,
  obtenerContenido
} from "../servicios/servicioContenido.js";
import { responderError, responderJson } from "../servicios/servicioRespuesta.js";
import { validarContenidoEntidad } from "../validaciones/validacionContenido.js";

const entidadPorRuta = {
  seccion: "seccion",
  cliente: "cliente",
  proyecto: "proyecto",
  equipo: "equipo",
  habilidad: "habilidad",
  habilidad_integrante: "habilidadIntegrante"
};

export async function manejarRutaContenido(solicitud, entorno) {
  const url = new URL(solicitud.url);
  const partes = url.pathname.split("/").filter(Boolean);
  const entidad = entidadPorRuta[partes[0]];
  const id = partes[1];
  const usuario = await exigirUsuarioAutenticado(solicitud, entorno);

  if (!entidad) {
    return responderError({
      codigo: "entidad_no_soportada",
      mensaje: "La entidad solicitada no esta soportada.",
      estadoHttp: 404
    });
  }

  if (solicitud.method === "GET" && !id) {
    const datos = await listarContenido({
      entorno,
      token: usuario.token,
      entidad,
      presentacionId: url.searchParams.get("presentacionId"),
      integranteId: url.searchParams.get("integranteId")
    });

    return responderJson({ datos });
  }

  if (solicitud.method === "GET" && id) {
    const datos = await obtenerContenido({ entorno, token: usuario.token, entidad, id });
    return responderJson({ datos });
  }

  if (solicitud.method === "POST" && !id) {
    const cuerpo = await solicitud.json();
    const validacion = validarContenidoEntidad(entidad, cuerpo, "crear");

    if (!validacion.valida) {
      return responderError({
        codigo: "contenido_invalido",
        mensaje: "Los datos enviados no cumplen las validaciones requeridas.",
        estadoHttp: 422,
        detalles: validacion.errores
      });
    }

    const datos = await crearContenido({ entorno, token: usuario.token, entidad, datos: validacion.datos });
    return responderJson({ datos }, 201);
  }

  if ((solicitud.method === "PUT" || solicitud.method === "PATCH") && id) {
    const cuerpo = await solicitud.json();
    const validacion = validarContenidoEntidad(entidad, cuerpo, "actualizar");

    if (!validacion.valida) {
      return responderError({
        codigo: "contenido_invalido",
        mensaje: "Los datos enviados no cumplen las validaciones requeridas.",
        estadoHttp: 422,
        detalles: validacion.errores
      });
    }

    const datos = await actualizarContenido({ entorno, token: usuario.token, entidad, id, datos: validacion.datos });
    return responderJson({ datos });
  }

  if (solicitud.method === "DELETE" && id) {
    const datos = await eliminarContenido({ entorno, token: usuario.token, entidad, id });
    return responderJson({ datos });
  }

  return responderError({
    codigo: "metodo_no_permitido",
    mensaje: "Metodo no permitido para contenido.",
    estadoHttp: 405
  });
}

