import { createClient } from "@supabase/supabase-js";
import { solicitarApi } from "./servicioApi.js";
import { obtenerVariableEntorno } from "./servicioEntorno.js";

const urlSupabase = obtenerVariableEntorno("VITE_SUPABASE_URL");
const claveSupabase = obtenerVariableEntorno("VITE_SUPABASE_ANON_KEY");

export const supabase = urlSupabase && claveSupabase
  ? createClient(urlSupabase, claveSupabase)
  : null;

export async function iniciarSesion({ correo, contrasena }) {
  if (!supabase) {
    return {
      usuario: { email: correo, id: "usuario-demo" },
      token: "token-demo",
      modoDemo: true
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: correo,
    password: contrasena
  });

  if (error) {
    throw new Error(error.message);
  }

  const perfil = await sincronizarPerfilBackend(data.session.access_token);

  return {
    usuario: data.user,
    token: data.session.access_token,
    perfil,
    modoDemo: false
  };
}

export async function cerrarSesion() {
  if (supabase) {
    await supabase.auth.signOut();
  }
}

async function sincronizarPerfilBackend(token) {
  const respuesta = await solicitarApi("/autenticacion/perfil", {
    metodo: "POST",
    token
  });

  return respuesta?.datos?.perfil || null;
}
