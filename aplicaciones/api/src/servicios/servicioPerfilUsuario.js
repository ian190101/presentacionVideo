import { responderError } from "./servicioRespuesta.js";
import { consultarSupabaseConServicio } from "./servicioSupabase.js";

const ROLES_VALIDOS = ["administrador", "editor", "visualizador"];

export async function sincronizarPerfilUsuario({ entorno, usuario }) {
  const perfilExistente = await obtenerPerfilUsuario({ entorno, usuarioId: usuario.id });
  const rolEsperado = await resolverRolParaUsuario({ entorno, correo: usuario.email });

  if (perfilExistente) {
    if (perfilExistente.estado !== "activo") {
      throw responderError({
        codigo: "usuario_inactivo",
        mensaje: "El usuario existe, pero esta inactivo en el panel.",
        estadoHttp: 403
      });
    }

    if (rolEsperado === "administrador" && perfilExistente.rol !== "administrador") {
      return actualizarPerfilUsuario({
        entorno,
        usuarioId: usuario.id,
        datos: { rol: "administrador" }
      });
    }

    return perfilExistente;
  }

  const perfilCreado = await consultarSupabaseConServicio({
    entorno,
    ruta: "perfil_usuario",
    metodo: "POST",
    cuerpo: {
      id: usuario.id,
      nombre: obtenerNombreDesdeCorreo(usuario.email),
      rol: rolEsperado,
      estado: "activo"
    }
  });

  return perfilCreado?.[0] || null;
}

async function obtenerPerfilUsuario({ entorno, usuarioId }) {
  const perfiles = await consultarSupabaseConServicio({
    entorno,
    ruta: `perfil_usuario?id=eq.${encodeURIComponent(usuarioId)}&select=*&limit=1`
  });

  return perfiles?.[0] || null;
}

async function actualizarPerfilUsuario({ entorno, usuarioId, datos }) {
  const perfiles = await consultarSupabaseConServicio({
    entorno,
    ruta: `perfil_usuario?id=eq.${encodeURIComponent(usuarioId)}`,
    metodo: "PATCH",
    cuerpo: datos
  });

  return perfiles?.[0] || null;
}

async function resolverRolParaUsuario({ entorno, correo }) {
  if (correoEstaEnListaAdmin(entorno, correo)) {
    return "administrador";
  }

  const administradores = await consultarSupabaseConServicio({
    entorno,
    ruta: "perfil_usuario?rol=eq.administrador&estado=eq.activo&select=id&limit=1"
  });

  if (!administradores?.length) {
    return "administrador";
  }

  const rolPredeterminado = String(entorno.PERFIL_NUEVO_ROL_PREDETERMINADO || "visualizador").trim();
  return ROLES_VALIDOS.includes(rolPredeterminado) ? rolPredeterminado : "visualizador";
}

function correoEstaEnListaAdmin(entorno, correo) {
  const correosPermitidos = String(entorno.CORREOS_ADMIN_PERMITIDOS || "")
    .split(",")
    .map((valor) => valor.trim().toLowerCase())
    .filter(Boolean);

  return correosPermitidos.includes(String(correo || "").trim().toLowerCase());
}

function obtenerNombreDesdeCorreo(correo) {
  const nombre = String(correo || "").split("@")[0] || "Administrador";
  return nombre
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80) || "Administrador";
}
