import { obtenerUrlApi } from "./servicioApi.js";

export async function obtenerLogoPublico() {
  const respuesta = await fetch(`${obtenerUrlApi()}/publico/logo`);
  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    return "";
  }

  return datos.datos?.logoUrl || "";
}
