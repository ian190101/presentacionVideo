import { exigirUsuarioAutenticado } from "../servicios/servicioAutenticacion.js";
import { sincronizarPerfilUsuario } from "../servicios/servicioPerfilUsuario.js";
import { responderError, responderJson } from "../servicios/servicioRespuesta.js";

export async function manejarRutaAutenticacion(solicitud, entorno) {
  const url = new URL(solicitud.url);
  const ruta = url.pathname.replace(/\/+$/, "");

  if (solicitud.method === "POST" && ruta === "/autenticacion/perfil") {
    const usuario = await exigirUsuarioAutenticado(solicitud, entorno);
    const perfil = await sincronizarPerfilUsuario({ entorno, usuario });

    return responderJson({
      datos: {
        usuario: {
          id: usuario.id,
          email: usuario.email
        },
        perfil
      }
    });
  }

  return responderError({
    codigo: "metodo_no_permitido",
    mensaje: "Metodo no permitido para autenticacion.",
    estadoHttp: 405
  });
}
