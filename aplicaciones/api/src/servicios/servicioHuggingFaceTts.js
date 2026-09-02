import { InferenceClient } from "@huggingface/inference";

const modeloKokoro = "hexgrad/Kokoro-82M";
const proveedorKokoro = "fal-ai";
const rutaKokoro = "https://router.huggingface.co/fal-ai/fal-ai/kokoro/american-english";

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
  const cuerpo = { text: texto, voice: voz, speed: velocidad, language: idioma };
  const respuesta = await enviarSolicitudRouter({ token, cuerpo });

  if (respuesta.ok) {
    return respuesta;
  }

  const errorConIdioma = await respuesta.text();
  const respuestaSinIdioma = await enviarSolicitudRouter({
    token,
    cuerpo: { text: texto, voice: voz, speed: velocidad }
  });

  if (!respuestaSinIdioma.ok) {
    throw new Error(await respuestaSinIdioma.text() || errorConIdioma);
  }

  return respuestaSinIdioma;
}

async function enviarSolicitudRouter({ token, cuerpo }) {
  return fetch(rutaKokoro, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    method: "POST",
    body: JSON.stringify(cuerpo)
  });
}

export async function generarAudioKokoro({ entorno, texto, voz = "af_heart", velocidad = 1, idioma = "es" }) {
  const token = entorno.HF_TOKEN;

  if (!token) {
    return {
      modo: "pendiente_configuracion",
      mensaje: "Falta HF_TOKEN en el backend para generar audio real con Kokoro."
    };
  }

  try {
    const audio = await generarAudioConSdkHuggingFace({ token, texto, voz, velocidad, idioma });

    return {
      modo: "sdk_huggingface",
      audio,
      modelo: modeloKokoro,
      proveedor: proveedorKokoro
    };
  } catch (errorSdk) {
    const respuesta = await generarAudioConRouterHuggingFace({ token, texto, voz, velocidad, idioma });

    return {
      modo: "router_huggingface",
      audio: respuesta,
      modelo: modeloKokoro,
      proveedor: proveedorKokoro,
      fallbackPor: errorSdk.message
    };
  }
}
