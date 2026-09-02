import { exigirUsuarioAutenticado } from "../servicios/servicioAutenticacion.js";
import { registrarEventoAuditoria } from "../servicios/servicioAuditoria.js";
import { extraerCvDesdeArchivo } from "../servicios/servicioCv.js";
import { responderError, responderJson } from "../servicios/servicioRespuesta.js";

export async function manejarRutaCv(solicitud, entorno) {
  const url = new URL(solicitud.url);
  const partes = url.pathname.split("/").filter(Boolean);
  const accion = partes[1];
  const usuario = await exigirUsuarioAutenticado(solicitud, entorno);

  if (solicitud.method === "POST" && accion === "extraer") {
    const formulario = await solicitud.formData();
    const archivo = formulario.get("archivo");
    const resultado = await extraerCvDesdeArchivo({ archivo });

    await registrarEventoAuditoria({
      entorno,
      token: usuario.token,
      usuario,
      solicitud,
      accion: "cv_extraido",
      entidadTipo: "integrante_equipo",
      entidadId: formulario.get("integranteId") || null,
      detalle: {
        nombreArchivo: resultado.nombreArchivo,
        mimeType: resultado.mimeType,
        caracteres: resultado.texto.length
      }
    });

    return responderJson({ datos: resultado });
  }

  return responderError({
    codigo: "metodo_no_permitido",
    mensaje: "Metodo no permitido para CV.",
    estadoHttp: 405
  });
}
