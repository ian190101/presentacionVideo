const urlApi = import.meta.env.VITE_API_URL || "http://127.0.0.1:8787";

export async function solicitarApi(ruta, opciones = {}) {
  const token = opciones.token;
  const cabeceras = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const respuesta = await fetch(`${urlApi}${ruta}`, {
    method: opciones.metodo || "GET",
    headers: cabeceras,
    body: opciones.cuerpo ? JSON.stringify(opciones.cuerpo) : undefined
  });

  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    const error = new Error(datos?.error?.mensaje || "No se pudo completar la solicitud.");
    error.detalles = datos?.error?.detalles;
    error.codigo = datos?.error?.codigo;
    throw error;
  }

  return datos;
}
