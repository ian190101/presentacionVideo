import { InferenceClient } from "@huggingface/inference";

const modeloKokoro = "hexgrad/Kokoro-82M";
const proveedorKokoro = "fal-ai";
const rutaKokoro = "https://router.huggingface.co/fal-ai/fal-ai/kokoro/american-english";

export async function generarAudioConSdkHuggingFace({ token, texto }) {
  const client = new InferenceClient(token);

  return client.textToSpeech({
    provider: proveedorKokoro,
    model: modeloKokoro,
    inputs: texto
  });
}

export async function generarAudioConRouterHuggingFace({ token, texto }) {
  const respuesta = await fetch(rutaKokoro, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    method: "POST",
    body: JSON.stringify({ text: texto })
  });

  if (!respuesta.ok) {
    throw new Error(await respuesta.text());
  }

  return respuesta;
}

export async function generarAudioKokoro({ entorno, texto }) {
  const token = entorno.HF_TOKEN;

  if (!token) {
    return {
      modo: "pendiente_configuracion",
      mensaje: "Falta HF_TOKEN en el backend para generar audio real con Kokoro."
    };
  }

  try {
    const audio = await generarAudioConSdkHuggingFace({ token, texto });

    return {
      modo: "sdk_huggingface",
      audio,
      modelo: modeloKokoro,
      proveedor: proveedorKokoro
    };
  } catch (errorSdk) {
    const respuesta = await generarAudioConRouterHuggingFace({ token, texto });

    return {
      modo: "router_huggingface",
      respuesta,
      modelo: modeloKokoro,
      proveedor: proveedorKokoro,
      fallbackPor: errorSdk.message
    };
  }
}
