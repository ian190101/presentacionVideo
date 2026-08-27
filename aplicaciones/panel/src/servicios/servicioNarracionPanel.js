import { solicitarApi } from "./servicioApi.js";

export async function generarNarracionDemoOApi({ token, presentacionId, texto, voz, velocidad }) {
  if (token && token !== "token-demo") {
    const respuesta = await solicitarApi("/narracion/generar-audio", {
      metodo: "POST",
      token,
      cuerpo: { presentacionId, texto, voz, velocidad }
    });

    return respuesta.datos;
  }

  const hashDemo = await calcularHashDemo(`${texto}|${voz}|${velocidad}|kokoro-v1`);

  return {
    modo: "demo",
    hashNarracion: hashDemo,
    mensaje: "Modo demo: narracion preparada para cache cuando Kokoro TTS este configurado."
  };
}

async function calcularHashDemo(texto) {
  const bytes = new TextEncoder().encode(texto.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
