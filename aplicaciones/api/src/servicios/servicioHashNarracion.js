export async function calcularHashNarracion({ texto, voz, velocidad, idioma = "es", versionTts = "kokoro-v1" }) {
  const contenido = normalizarContenido(`${texto}|${voz}|${velocidad}|${idioma}|${versionTts}`);
  const bytes = new TextEncoder().encode(contenido);
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function normalizarContenido(valor) {
  return String(valor || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}
