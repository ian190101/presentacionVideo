import { exigirUsuarioAutenticado } from "../servicios/servicioAutenticacion.js";
import {
  actualizarPresentacion,
  crearPresentacion,
  eliminarPresentacion,
  obtenerPresentacion,
  listarPresentaciones
} from "../servicios/servicioPresentacion.js";
import { responderError, responderJson } from "../servicios/servicioRespuesta.js";
import { validarActualizacionPresentacion, validarNuevaPresentacion } from "../validaciones/validacionPresentacion.js";

export async function manejarRutaPresentacion(solicitud, entorno) {
  const url = new URL(solicitud.url);
  const partes = url.pathname.split("/").filter(Boolean);
  const id = partes[1];

  const usuario = await exigirUsuarioAutenticado(solicitud, entorno);

  if (solicitud.method === "GET" && !id) {
    const presentaciones = await listarPresentaciones({ entorno, token: usuario.token });
    return responderJson({ datos: presentaciones });
  }

  if (solicitud.method === "GET" && id) {
    const presentacion = await obtenerPresentacion({ entorno, token: usuario.token, id });
    return responderJson({ datos: presentacion });
  }

  if (solicitud.method === "POST" && !id) {
    const cuerpo = await solicitud.json();
    const validacion = validarNuevaPresentacion(cuerpo);

    if (!validacion.valida) {
      return responderError({
        codigo: "datos_invalidos",
        mensaje: "La presentacion no cumple las validaciones requeridas.",
        estadoHttp: 422,
        detalles: validacion.errores
      });
    }

    const presentacion = await crearPresentacion({
      entorno,
      token: usuario.token,
      usuario,
      datos: validacion.datos
    });

    return responderJson({ datos: presentacion }, 201);
  }

  if ((solicitud.method === "PUT" || solicitud.method === "PATCH") && id) {
    const cuerpo = await solicitud.json();
    const validacion = validarActualizacionPresentacion(cuerpo);

    if (!validacion.valida) {
      return responderError({
        codigo: "datos_invalidos",
        mensaje: "La presentacion no cumple las validaciones requeridas.",
        estadoHttp: 422,
        detalles: validacion.errores
      });
    }

    const presentacion = await actualizarPresentacion({
      entorno,
      token: usuario.token,
      id,
      datos: validacion.datos
    });

    return responderJson({ datos: presentacion });
  }

  if (solicitud.method === "DELETE" && id) {
    const presentacion = await eliminarPresentacion({
      entorno,
      token: usuario.token,
      id
    });

    return responderJson({ datos: presentacion });
  }

  return responderError({
    codigo: "metodo_no_permitido",
    mensaje: "Metodo no permitido para presentacion.",
    estadoHttp: 405
  });
}
