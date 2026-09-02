import { exigirUsuarioAutenticado } from "../servicios/servicioAutenticacion.js";
import { registrarEventoAuditoria } from "../servicios/servicioAuditoria.js";
import { generarAudioNarracion } from "../servicios/servicioNarracion.js";
import { responderError, responderJson } from "../servicios/servicioRespuesta.js";
import { limpiarTexto } from "../validaciones/validacionComun.js";

export async function manejarRutaNarracion(solicitud, entorno) {
  const url = new URL(solicitud.url);
  const partes = url.pathname.split("/").filter(Boolean);
  const accion = partes[1];
  const usuario = await exigirUsuarioAutenticado(solicitud, entorno);

  if (solicitud.method === "POST" && accion === "generar-audio") {
    const cuerpo = await solicitud.json();
    const datos = {
      presentacionId: limpiarTexto(cuerpo.presentacionId),
      texto: limpiarTexto(cuerpo.texto),
      voz: limpiarTexto(cuerpo.voz || "voz_predeterminada"),
      velocidad: Number(cuerpo.velocidad || 1),
      idioma: limpiarTexto(cuerpo.idioma || "es")
    };

    if (!datos.texto) {
      return responderError({
        codigo: "narracion_texto_requerido",
        mensaje: "El texto de narracion es obligatorio para generar audio.",
        estadoHttp: 422
      });
    }

    const resultado = await generarAudioNarracion({
      entorno,
      token: usuario.token,
      datos
    });

    await registrarEventoAuditoria({
      entorno,
      token: usuario.token,
      usuario,
      solicitud,
      accion: "narracion_audio_generado",
      entidadTipo: "narracion",
      entidadId: null,
      detalle: {
        presentacionId: datos.presentacionId || null,
        voz: datos.voz,
        velocidad: datos.velocidad,
        idioma: datos.idioma,
        modo: resultado.modo,
        cacheado: resultado.modo === "cache"
      }
    });

    return responderJson({ datos: resultado });
  }

  return responderError({
    codigo: "metodo_no_permitido",
    mensaje: "Metodo no permitido para narracion.",
    estadoHttp: 405
  });
}
