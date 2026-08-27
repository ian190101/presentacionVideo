import { crearCabecerasCors } from "../middlewares/cors.js";

export function responderJson(datos, estadoHttp = 200, cabecerasExtra = {}) {
  return new Response(JSON.stringify(datos), {
    status: estadoHttp,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...cabecerasExtra
    }
  });
}

export function responderError({ codigo, mensaje, estadoHttp = 400, detalles = null }) {
  return responderJson(
    {
      error: {
        codigo,
        mensaje,
        detalles
      }
    },
    estadoHttp
  );
}

export function responderJsonConCors(datos, entorno, estadoHttp = 200) {
  return responderJson(datos, estadoHttp, crearCabecerasCors(entorno));
}
