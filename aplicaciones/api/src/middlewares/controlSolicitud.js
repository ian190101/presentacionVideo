import { responderError } from "../servicios/servicioRespuesta.js";

const intentosPorCliente = new Map();
const METODOS_CON_CUERPO = new Set(["POST", "PUT", "PATCH"]);
const LIMITE_CUERPO_BYTES = 1024 * 1024;
const VENTANA_RATE_LIMIT_MS = 60 * 1000;
const MAXIMO_SOLICITUDES_POR_VENTANA = 120;

export function validarSolicitudEntrante(solicitud, entorno) {
  const errorTamano = validarTamanoCuerpo(solicitud, entorno);

  if (errorTamano) {
    return errorTamano;
  }

  const errorRateLimit = validarRateLimit(solicitud, entorno);

  if (errorRateLimit) {
    return errorRateLimit;
  }

  return null;
}

function validarTamanoCuerpo(solicitud, entorno) {
  if (!METODOS_CON_CUERPO.has(solicitud.method)) {
    return null;
  }

  const limite = Number(entorno.LIMITE_CUERPO_BYTES || LIMITE_CUERPO_BYTES);
  const tamano = Number(solicitud.headers.get("content-length") || 0);

  if (tamano > limite) {
    return responderError({
      codigo: "cuerpo_demasiado_grande",
      mensaje: "La solicitud supera el tamano maximo permitido.",
      estadoHttp: 413,
      detalles: {
        limiteBytes: limite,
        tamanoBytes: tamano
      }
    });
  }

  return null;
}

function validarRateLimit(solicitud, entorno) {
  const ruta = new URL(solicitud.url).pathname;

  if (ruta === "/salud") {
    return null;
  }

  const maximo = Number(entorno.RATE_LIMIT_MAXIMO || MAXIMO_SOLICITUDES_POR_VENTANA);
  const ventanaMs = Number(entorno.RATE_LIMIT_VENTANA_MS || VENTANA_RATE_LIMIT_MS);
  const cliente = obtenerCliente(solicitud);
  const ahora = Date.now();
  const registro = intentosPorCliente.get(cliente);

  limpiarRegistrosExpirados(ahora, ventanaMs);

  if (!registro || ahora - registro.inicioVentana > ventanaMs) {
    intentosPorCliente.set(cliente, { conteo: 1, inicioVentana: ahora, ultimoUso: ahora });
    return null;
  }

  registro.conteo += 1;
  registro.ultimoUso = ahora;

  if (registro.conteo > maximo) {
    return responderError({
      codigo: "demasiadas_solicitudes",
      mensaje: "Se supero el limite temporal de solicitudes. Espera unos segundos antes de intentar nuevamente.",
      estadoHttp: 429,
      detalles: {
        limite: maximo,
        ventanaSegundos: Math.round(ventanaMs / 1000)
      }
    });
  }

  return null;
}

function obtenerCliente(solicitud) {
  return solicitud.headers.get("CF-Connecting-IP")
    || solicitud.headers.get("X-Forwarded-For")
    || "cliente_desconocido";
}

function limpiarRegistrosExpirados(ahora, ventanaMs) {
  if (intentosPorCliente.size < 1000) {
    return;
  }

  for (const [cliente, registro] of intentosPorCliente.entries()) {
    if (ahora - registro.ultimoUso > ventanaMs * 2) {
      intentosPorCliente.delete(cliente);
    }
  }
}

