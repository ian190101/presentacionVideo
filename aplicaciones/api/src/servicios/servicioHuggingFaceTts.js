import { responderError } from "./servicioRespuesta.js";

const modeloKokoro = "hexgrad/Kokoro-82M";
const proveedorKokoro = "fal-ai-direct";
const TIEMPO_ESPERA_COLA_MS = 1500;
const INTENTOS_COLA = 30;

const configuracionKokoroPorIdioma = {
  es: {
    endpoint: "fal-ai/kokoro/spanish",
    vozPredeterminada: "ef_dora",
    voces: new Set(["ef_dora", "em_alex", "em_santa"])
  },
  en: {
    endpoint: "fal-ai/kokoro/american-english",
    vozPredeterminada: "af_heart",
    voces: new Set(["af_heart", "af_alloy", "af_aoede", "af_bella", "af_jessica", "af_kore", "af_nicole", "af_nova", "af_river", "af_sarah", "af_sky", "am_adam", "am_echo", "am_eric", "am_fenrir", "am_liam", "am_michael", "am_onyx", "am_puck", "am_santa"])
  },
  pt: {
    endpoint: "fal-ai/kokoro/brazilian-portuguese",
    vozPredeterminada: "pf_dora",
    voces: new Set(["pf_dora", "pm_alex", "pm_santa"])
  }
};

export async function generarAudioConFal({ token, texto, voz, velocidad, idioma }) {
  const configuracion = obtenerConfiguracionKokoro(idioma);
  const vozNormalizada = normalizarVozKokoro({ voz, configuracion });
  const cuerpo = { prompt: texto, voice: vozNormalizada, speed: velocidad };
  const respuesta = await enviarSolicitudFal({
    token,
    ruta: `https://fal.run/${configuracion.endpoint}`,
    cuerpo
  });

  if (respuesta.ok) {
    return obtenerAudioDesdeRespuesta({ respuesta, token });
  }

  throw new Error(await respuesta.text());
}

async function enviarSolicitudFal({ token, ruta, cuerpo }) {
  return fetch(ruta, {
    headers: {
      Authorization: `Key ${token}`,
      "Content-Type": "application/json"
    },
    method: "POST",
    body: JSON.stringify(cuerpo)
  });
}

export async function generarAudioKokoro({ entorno, texto, voz = "ef_dora", velocidad = 1, idioma = "es" }) {
  const token = obtenerFalKey(entorno);
  const idiomaNormalizado = normalizarIdiomaKokoro(idioma);
  const configuracion = obtenerConfiguracionKokoro(idiomaNormalizado);
  const vozNormalizada = normalizarVozKokoro({ voz, configuracion });

  const respuesta = await generarAudioConFal({
    token,
    texto,
    voz: vozNormalizada,
    velocidad,
    idioma: idiomaNormalizado
  });

  return {
    modo: "fal_directo",
    audio: respuesta.audio,
    mimeType: respuesta.mimeType,
    modelo: modeloKokoro,
    proveedor: proveedorKokoro,
    idioma: idiomaNormalizado,
    voz: vozNormalizada
  };
}

function obtenerConfiguracionKokoro(idioma) {
  return configuracionKokoroPorIdioma[normalizarIdiomaKokoro(idioma)] || configuracionKokoroPorIdioma.es;
}

function normalizarIdiomaKokoro(idioma) {
  const texto = String(idioma || "es").trim().toLowerCase();
  return configuracionKokoroPorIdioma[texto] ? texto : "es";
}

function normalizarVozKokoro({ voz, configuracion }) {
  const texto = String(voz || "").trim();
  return configuracion.voces.has(texto) ? texto : configuracion.vozPredeterminada;
}

async function obtenerAudioDesdeRespuesta({ respuesta, token }) {
  const tipoContenido = respuesta.headers.get("content-type") || "audio/mpeg";

  if (!tipoContenido.includes("application/json")) {
    return {
      audio: respuesta,
      mimeType: tipoContenido
    };
  }

  const datos = await respuesta.json();
  const datosFinales = await resolverResultadoEnCola({ datos, token });
  const urlAudio = datosFinales?.audio?.url || datosFinales?.audio_url || datosFinales?.url;

  if (!urlAudio) {
    throw new Error(`El proveedor TTS no devolvio una URL de audio valida: ${JSON.stringify(datosFinales)}`);
  }

  const respuestaAudio = await fetch(urlAudio);

  if (!respuestaAudio.ok) {
    throw new Error(`No se pudo descargar el audio generado: ${respuestaAudio.status}`);
  }

  return {
    audio: respuestaAudio,
    mimeType: respuestaAudio.headers.get("content-type") || datosFinales?.audio?.content_type || "audio/mpeg"
  };
}

function obtenerFalKey(entorno) {
  const falKey = String(entorno.FAL_KEY || entorno.FAL_TOKEN || "").trim();

  if (falKey) {
    return falKey;
  }

  if (String(entorno.HF_TOKEN || "").trim().startsWith("hf_")) {
    throw responderError({
      codigo: "tts_fal_key_requerida",
      mensaje: "Kokoro TTS en espanol requiere FAL_KEY en el Worker de API.",
      estadoHttp: 500,
      detalles: "HF_TOKEN solo valida la cuenta de Hugging Face; el endpoint fal-ai/kokoro/spanish se autentica con FAL_KEY."
    });
  }

  throw responderError({
    codigo: "tts_configuracion_incompleta",
    mensaje: "Falta FAL_KEY para generar narracion real con Kokoro.",
    estadoHttp: 500,
    detalles: "Agrega FAL_KEY como secreto en el Worker de API."
  });
}

async function resolverResultadoEnCola({ datos, token }) {
  if (!datos?.response_url || !datos?.status_url) {
    return datos;
  }

  for (let intento = 0; intento < INTENTOS_COLA; intento += 1) {
    await esperar(TIEMPO_ESPERA_COLA_MS);

    const estado = await fetch(datos.status_url, {
      headers: { Authorization: `Key ${token}` }
    });
    const datosEstado = await estado.json().catch(() => null);

    if (datosEstado?.status !== "COMPLETED") {
      continue;
    }

    const respuesta = await fetch(datos.response_url, {
      headers: { Authorization: `Key ${token}` }
    });

    if (!respuesta.ok) {
      throw new Error(await respuesta.text());
    }

    return respuesta.json();
  }

  throw new Error("Fal no completo la generacion de audio dentro del tiempo permitido.");
}

function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
