import { InferenceClient } from "@huggingface/inference";

const modeloKokoro = "hexgrad/Kokoro-82M";
const proveedorKokoro = "fal-ai";
const configuracionKokoroPorIdioma = {
  es: {
    ruta: "https://router.huggingface.co/fal-ai/fal-ai/kokoro/spanish",
    vozPredeterminada: "ef_dora",
    voces: new Set(["ef_dora", "em_alex", "em_santa"])
  },
  en: {
    ruta: "https://router.huggingface.co/fal-ai/fal-ai/kokoro/american-english",
    vozPredeterminada: "af_heart",
    voces: new Set(["af_heart", "af_alloy", "af_aoede", "af_bella", "af_jessica", "af_kore", "af_nicole", "af_nova", "af_river", "af_sarah", "af_sky", "am_adam", "am_echo", "am_eric", "am_fenrir", "am_liam", "am_michael", "am_onyx", "am_puck", "am_santa"])
  },
  pt: {
    ruta: "https://router.huggingface.co/fal-ai/fal-ai/kokoro/brazilian-portuguese",
    vozPredeterminada: "pf_dora",
    voces: new Set(["pf_dora", "pm_alex", "pm_santa"])
  }
};

export async function generarAudioConSdkHuggingFace({ token, texto, voz, velocidad, idioma }) {
  const client = new InferenceClient(token);

  return client.textToSpeech({
    provider: proveedorKokoro,
    model: modeloKokoro,
    inputs: texto,
    parameters: {
      voice: voz,
      speed: velocidad,
      language: idioma
    }
  });
}

export async function generarAudioConRouterHuggingFace({ token, texto, voz, velocidad, idioma }) {
  const configuracion = obtenerConfiguracionKokoro(idioma);
  const vozNormalizada = normalizarVozKokoro({ voz, configuracion });
  const cuerpo = { prompt: texto, voice: vozNormalizada, speed: velocidad };
  const respuesta = await enviarSolicitudRouter({ token, ruta: configuracion.ruta, cuerpo });

  if (respuesta.ok) {
    return obtenerAudioDesdeRespuesta(respuesta);
  }

  const errorConPrompt = await respuesta.text();
  const respuestaSinIdioma = await enviarSolicitudRouter({
    token,
    ruta: configuracion.ruta,
    cuerpo: { text: texto, voice: vozNormalizada, speed: velocidad }
  });

  if (!respuestaSinIdioma.ok) {
    throw new Error(await respuestaSinIdioma.text() || errorConPrompt);
  }

  return obtenerAudioDesdeRespuesta(respuestaSinIdioma);
}

async function enviarSolicitudRouter({ token, ruta, cuerpo }) {
  return fetch(ruta, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    method: "POST",
    body: JSON.stringify(cuerpo)
  });
}

export async function generarAudioKokoro({ entorno, texto, voz = "ef_dora", velocidad = 1, idioma = "es" }) {
  const token = entorno.HF_TOKEN;
  const idiomaNormalizado = normalizarIdiomaKokoro(idioma);
  const configuracion = obtenerConfiguracionKokoro(idiomaNormalizado);
  const vozNormalizada = normalizarVozKokoro({ voz, configuracion });

  if (!token) {
    return {
      modo: "pendiente_configuracion",
      mensaje: "Falta HF_TOKEN en el backend para generar audio real con Kokoro."
    };
  }

  try {
    if (idiomaNormalizado !== "en") {
      throw new Error("El SDK generico no selecciona endpoint por idioma; se usa el router especifico.");
    }

    const audioSdk = await generarAudioConSdkHuggingFace({
      token,
      texto,
      voz: vozNormalizada,
      velocidad,
      idioma: idiomaNormalizado
    });

    return {
      modo: "sdk_huggingface",
      audio: audioSdk,
      mimeType: audioSdk?.type || "audio/mpeg",
      modelo: modeloKokoro,
      proveedor: proveedorKokoro,
      idioma: idiomaNormalizado,
      voz: vozNormalizada
    };
  } catch (errorSdk) {
    const respuesta = await generarAudioConRouterHuggingFace({
      token,
      texto,
      voz: vozNormalizada,
      velocidad,
      idioma: idiomaNormalizado
    });

    return {
      modo: "router_huggingface",
      audio: respuesta.audio,
      mimeType: respuesta.mimeType,
      modelo: modeloKokoro,
      proveedor: proveedorKokoro,
      idioma: idiomaNormalizado,
      voz: vozNormalizada,
      fallbackPor: errorSdk.message
    };
  }
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

async function obtenerAudioDesdeRespuesta(respuesta) {
  const tipoContenido = respuesta.headers.get("content-type") || "audio/mpeg";

  if (!tipoContenido.includes("application/json")) {
    return {
      audio: respuesta,
      mimeType: tipoContenido
    };
  }

  const datos = await respuesta.json();
  const urlAudio = datos?.audio?.url || datos?.url;

  if (!urlAudio) {
    throw new Error(`El proveedor TTS no devolvio una URL de audio valida: ${JSON.stringify(datos)}`);
  }

  const respuestaAudio = await fetch(urlAudio);

  if (!respuestaAudio.ok) {
    throw new Error(`No se pudo descargar el audio generado: ${respuestaAudio.status}`);
  }

  return {
    audio: respuestaAudio,
    mimeType: respuestaAudio.headers.get("content-type") || datos?.audio?.content_type || "audio/mpeg"
  };
}
