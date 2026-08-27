import { consultarSupabase } from "./servicioSupabase.js";

export async function listarAyudasContextuales({ entorno, token }) {
  return consultarSupabase({
    entorno,
    token,
    ruta: "ayuda_contextual?select=clave,titulo,descripcion,ejemplo,campo_relacionado,modulo&activa=eq.true&order=modulo.asc"
  });
}
