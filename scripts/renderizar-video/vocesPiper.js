const VERSION_VOCES_PIPER = "v1.0.0";
const BASE_VOCES_PIPER = `https://huggingface.co/rhasspy/piper-voices/resolve/${VERSION_VOCES_PIPER}`;

export const VOCES_PIPER = {
  "es_MX-ald-medium": {
    id: "es_MX-ald-medium",
    etiqueta: "Ald - espanol mexicano medio",
    idioma: "es",
    region: "MX",
    calidad: "medium",
    archivo: "es_MX-ald-medium",
    ruta: "es/es_MX/ald/medium",
    sha256Modelo: "019b3803293c93e34a206dd2e53a3889209a514e786fd7144f7b70196c579b63"
  },
  "es_MX-claude-high": {
    id: "es_MX-claude-high",
    etiqueta: "Claude - espanol mexicano alta calidad",
    idioma: "es",
    region: "MX",
    calidad: "high",
    archivo: "es_MX-claude-high",
    ruta: "es/es_MX/claude/high"
  }
};

export function obtenerVozPiper(idVoz) {
  const id = String(idVoz || "").trim();
  return VOCES_PIPER[id] || VOCES_PIPER["es_MX-ald-medium"];
}

export function crearUrlsVozPiper(voz) {
  const base = `${BASE_VOCES_PIPER}/${voz.ruta}/${voz.archivo}`;

  return {
    modelo: `${base}.onnx?download=true`,
    configuracion: `${base}.onnx.json?download=true`
  };
}
