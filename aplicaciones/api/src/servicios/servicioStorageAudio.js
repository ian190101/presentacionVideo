import { responderError } from "./servicioRespuesta.js";

const BUCKET_AUDIO_PREDETERMINADO = "audios";

export async function subirAudioSupabase({ entorno, ruta, audio, contentType = "audio/mpeg" }) {
  validarConfiguracionStorage(entorno);

  const cuerpo = await obtenerArrayBuffer(audio);
  const bucket = entorno.SUPABASE_BUCKET_AUDIO || BUCKET_AUDIO_PREDETERMINADO;
  const respuesta = await fetch(`${entorno.SUPABASE_URL}/storage/v1/object/${bucket}/${ruta}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${entorno.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": contentType,
      "x-upsert": "true"
    },
    body: cuerpo
  });

  if (!respuesta.ok) {
    throw responderError({
      codigo: `supabase_storage_http_${respuesta.status}`,
      mensaje: "Supabase Storage rechazo la subida de audio.",
      estadoHttp: respuesta.status,
      detalles: await respuesta.text()
    });
  }

  return {
    bucket,
    rutaStorage: ruta,
    urlPublica: `${entorno.SUPABASE_URL}/storage/v1/object/public/${bucket}/${ruta}`,
    tamanoBytes: cuerpo.byteLength,
    mimeType: contentType
  };
}

export function estaConfiguradoStorageAudio(entorno) {
  return Boolean(entorno.SUPABASE_URL && entorno.SUPABASE_SERVICE_ROLE_KEY);
}

function validarConfiguracionStorage(entorno) {
  const faltantes = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"].filter((clave) => !entorno[clave]);

  if (faltantes.length > 0) {
    throw responderError({
      codigo: "storage_audio_configuracion_incompleta",
      mensaje: "Faltan variables para guardar audio en Supabase Storage.",
      estadoHttp: 500,
      detalles: faltantes
    });
  }
}

async function obtenerArrayBuffer(audio) {
  if (audio instanceof ArrayBuffer) {
    return audio;
  }

  if (audio?.arrayBuffer) {
    return audio.arrayBuffer();
  }

  if (audio?.blob?.arrayBuffer) {
    return audio.blob.arrayBuffer();
  }

  throw responderError({
    codigo: "audio_formato_no_soportado",
    mensaje: "El audio generado no tiene un formato compatible para storage.",
    estadoHttp: 500
  });
}

