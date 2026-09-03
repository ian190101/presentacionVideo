import { calcularHashNarracion } from "./servicioHashNarracion.js";
import { generarAudioKokoro } from "./servicioHuggingFaceTts.js";
import { consultarSupabase } from "./servicioSupabase.js";
import { estaConfiguradoStorageAudio, subirAudioSupabase } from "./servicioStorageAudio.js";

export async function generarAudioNarracion({ entorno, token, datos }) {
  const hashNarracion = await calcularHashNarracion({
    texto: datos.texto,
    voz: datos.voz,
    velocidad: datos.velocidad,
    idioma: datos.idioma || "es"
  });

  const audioCacheado = await buscarAudioCacheado({ entorno, token, hashNarracion, datos });

  if (audioCacheado) {
    return {
      modo: "cache",
      hashNarracion,
      audio: audioCacheado
    };
  }

  const resultadoKokoro = await generarAudioKokoro({
    entorno,
    texto: datos.texto,
    voz: datos.voz,
    velocidad: datos.velocidad,
    idioma: datos.idioma || "es"
  });

  if (!resultadoKokoro.audio || !estaConfiguradoStorageAudio(entorno) || !datos.presentacionId) {
    return {
      ...resultadoKokoro,
      hashNarracion,
      cacheado: false,
      mensaje: resultadoKokoro.mensaje || "Audio generado sin cache persistente porque falta storage o presentacion guardada."
    };
  }

  const audioGuardado = await guardarAudioGenerado({
    entorno,
    token,
    hashNarracion,
    datos,
    audio: resultadoKokoro.audio,
    mimeType: resultadoKokoro.mimeType || "audio/mpeg"
  });

  return {
    ...resultadoKokoro,
    hashNarracion,
    cacheado: true,
    audio: audioGuardado
  };
}

async function buscarAudioCacheado({ entorno, token, hashNarracion, datos }) {
  const respuesta = await consultarSupabase({
    entorno,
    token,
    ruta: `audio_generado?hash_narracion=eq.${hashNarracion}&voz=eq.${encodeURIComponent(
      datos.voz
    )}&velocidad=eq.${encodeURIComponent(datos.velocidad)}&estado=eq.disponible&select=*,asset_audio_id(*)&limit=1`
  });

  return respuesta[0] || null;
}

async function guardarAudioGenerado({ entorno, token, hashNarracion, datos, audio, mimeType }) {
  const formato = obtenerFormatoAudio(mimeType);
  const ruta = `narraciones/${hashNarracion}.${formato}`;
  const storage = await subirAudioSupabase({
    entorno,
    ruta,
    audio,
    contentType: mimeType
  });

  const asset = await consultarSupabase({
    entorno,
    token,
    ruta: "asset",
    metodo: "POST",
    cuerpo: {
      presentacion_id: datos.presentacionId,
      tipo: "audio",
      proveedor: "supabase_storage",
      url_publica: storage.urlPublica,
      ruta_storage: storage.rutaStorage,
      formato,
      mime_type: storage.mimeType,
      tamano_bytes: storage.tamanoBytes,
      hash_contenido: hashNarracion,
      metadata: {
        idioma: datos.idioma || "es"
      },
      estado: "disponible"
    }
  });

  const narracion = await consultarSupabase({
    entorno,
    token,
    ruta: "narracion",
    metodo: "POST",
    cuerpo: {
      presentacion_id: datos.presentacionId,
      texto: datos.texto,
      voz: datos.voz,
      velocidad: datos.velocidad,
      hash_narracion: hashNarracion,
      audio_actual_id: asset[0].id,
      estado: "generada"
    }
  });

  await consultarSupabase({
    entorno,
    token,
    ruta: "audio_generado",
    metodo: "POST",
    cuerpo: {
      narracion_id: narracion[0].id,
      asset_audio_id: asset[0].id,
      proveedor_tts: "kokoro",
      voz: datos.voz,
      velocidad: datos.velocidad,
      hash_narracion: hashNarracion,
      estado: "disponible"
    }
  });

  return asset[0];
}

function obtenerFormatoAudio(mimeType) {
  if (String(mimeType || "").includes("wav")) {
    return "wav";
  }

  if (String(mimeType || "").includes("ogg")) {
    return "ogg";
  }

  return "mp3";
}
