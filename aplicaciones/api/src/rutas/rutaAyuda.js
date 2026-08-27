import { listarAyudasContextuales } from "../servicios/servicioAyuda.js";
import { exigirUsuarioAutenticado } from "../servicios/servicioAutenticacion.js";
import { responderJson } from "../servicios/servicioRespuesta.js";

export async function manejarRutaAyuda(solicitud, entorno) {
  if (solicitud.method !== "GET") {
    return responderJson(
      { error: { codigo: "metodo_no_permitido", mensaje: "Metodo no permitido para ayuda contextual." } },
      405
    );
  }

  const usuario = await exigirUsuarioAutenticado(solicitud, entorno);
  const ayudas = await listarAyudasContextuales({ entorno, token: usuario.token });

  return responderJson({ datos: ayudas });
}
