import { responderJson } from "../servicios/servicioRespuesta.js";

export function manejarRutaSalud() {
  return responderJson({
    estado: "ok",
    servicio: "presentacion-mr-robot-api"
  });
}
