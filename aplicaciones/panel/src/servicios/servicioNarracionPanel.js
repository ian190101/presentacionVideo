export async function generarNarracionDemoOApi({ token, presentacionId, texto, voz, velocidad, idioma }) {
  const hashDemo = await calcularHashDemo(`${texto}|${voz}|${velocidad}|${idioma || "es"}|piper-v1`);

  return {
    modo: token && token !== "token-demo" && presentacionId ? "piper_render" : "demo",
    hashNarracion: hashDemo,
    mensaje: "Narracion preparada. Piper generara el audio real dentro del render de GitHub Actions."
  };
}

async function calcularHashDemo(texto) {
  const bytes = new TextEncoder().encode(texto.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
