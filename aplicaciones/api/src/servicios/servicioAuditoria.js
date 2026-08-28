import { consultarSupabase } from "./servicioSupabase.js";

const LIMITE_DETALLE = 4000;

export async function listarEventosAuditoria({ entorno, token, limite = 30 }) {
  const limiteSeguro = Math.max(1, Math.min(Number(limite) || 30, 100));

  return consultarSupabase({
    entorno,
    token,
    ruta: `evento_auditoria?select=*&order=fecha_creacion.desc&limit=${limiteSeguro}`
  });
}

export async function registrarEventoAuditoria({ entorno, token, usuario, solicitud, accion, entidadTipo, entidadId = null, detalle = {} }) {
  if (!token || !usuario?.id) {
    return;
  }

  try {
    await consultarSupabase({
      entorno,
      token,
      ruta: "evento_auditoria",
      metodo: "POST",
      cuerpo: {
        usuario_id: usuario.id,
        accion,
        entidad_tipo: entidadTipo,
        entidad_id: entidadId,
        detalle: recortarDetalle(detalle),
        ip: obtenerIpCliente(solicitud),
        user_agent: solicitud.headers.get("User-Agent") || null
      }
    });
  } catch (error) {
    console.error("No se pudo registrar evento de auditoria", {
      accion,
      entidadTipo,
      entidadId,
      codigo: error?.codigo || "auditoria_error_desconocido"
    });
  }
}

function obtenerIpCliente(solicitud) {
  return solicitud.headers.get("CF-Connecting-IP")
    || solicitud.headers.get("X-Forwarded-For")?.split(",")[0]?.trim()
    || null;
}

function recortarDetalle(detalle) {
  const texto = JSON.stringify(detalle || {});

  if (texto.length <= LIMITE_DETALLE) {
    return detalle || {};
  }

  return {
    resumen: texto.slice(0, LIMITE_DETALLE),
    truncado: true
  };
}
