import { agregarCabecerasCors, manejarCors } from "./middlewares/cors.js";
import { validarSolicitudEntrante } from "./middlewares/controlSolicitud.js";
import { aplicarCabecerasSeguridad } from "./middlewares/seguridad.js";
import { enrutarSolicitud } from "./rutas/enrutador.js";
import { responderError } from "./servicios/servicioRespuesta.js";

export default {
  async fetch(solicitud, entorno, contexto) {
    const respuestaCors = manejarCors(solicitud, entorno);

    if (respuestaCors) {
      return agregarCabecerasCors(aplicarCabecerasSeguridad(respuestaCors), entorno);
    }

    try {
      const respuestaControl = validarSolicitudEntrante(solicitud, entorno);

      if (respuestaControl) {
        return agregarCabecerasCors(aplicarCabecerasSeguridad(respuestaControl), entorno);
      }

      const respuesta = await enrutarSolicitud(solicitud, entorno, contexto);
      return agregarCabecerasCors(aplicarCabecerasSeguridad(respuesta), entorno);
    } catch (error) {
      if (error instanceof Response) {
        return agregarCabecerasCors(aplicarCabecerasSeguridad(error), entorno);
      }

      console.error("Error no controlado en Worker", error);

      return agregarCabecerasCors(aplicarCabecerasSeguridad(
        responderError({
          codigo: "error_interno",
          mensaje: "Ocurrio un error inesperado procesando la solicitud.",
          estadoHttp: 500
        })
      ), entorno);
    }
  }
};
