import { solicitarApi } from "./servicioApi.js";

export async function listarEventosAuditoriaPanel({ sesion, limite = 30 }) {
  if (sesion.modoDemo) {
    return [];
  }

  const respuesta = await solicitarApi(`/auditoria?limite=${encodeURIComponent(limite)}`, {
    token: sesion.token
  });

  return respuesta.datos || [];
}
