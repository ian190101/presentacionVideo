import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { obtenerVozPiper, crearUrlsVozPiper } from "./vocesPiper.js";

const FPS_RENDER = 30;
const VERSION_PIPER = "2023.11.14-2";
const URL_BINARIO_PIPER = `https://github.com/rhasspy/piper/releases/download/${VERSION_PIPER}/piper_linux_x86_64.tar.gz`;
const HASH_BINARIO_PIPER = "";
const TEXTO_MAXIMO_CARACTERES = 12000;
const PAUSA_ENTRE_SECCIONES_SEGUNDOS = 1.15;
const PAUSA_ENTRE_FRASES_SEGUNDOS = 0.28;
const LENGTH_SCALE_NORMAL = 1.18;

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argumentos = leerArgumentos(process.argv.slice(2));
  const rutaDatos = resolve(argumentos.datos || "tmp/render/datos-presentacion.json");
  const carpetaPublica = resolve(argumentos.publico || "public");
  const carpetaCache = resolve(argumentos.cache || process.env.PIPER_CACHE_DIR || ".cache/piper");
  const rutaAudioRelativa = argumentos.audio || "audio/narracion-piper.wav";
  const rutaAudio = resolve(carpetaPublica, rutaAudioRelativa);

  await prepararAudioPiper({
    rutaDatos,
    carpetaCache,
    rutaAudio,
    rutaAudioRelativa
  });
}

export async function prepararAudioPiper({ rutaDatos, carpetaCache, rutaAudio, rutaAudioRelativa }) {
  const datos = leerJson(rutaDatos);
  const bloquesNarracion = prepararBloquesNarracion(datos);

  if (bloquesNarracion.length === 0) {
    console.log("No hay texto de narracion. Se conserva el audio configurado.");
    return datos;
  }

  const voz = obtenerVozPiper(datos.vozNarracion);
  const binario = await prepararBinarioPiper(carpetaCache);
  const modelo = await prepararModeloPiper({ carpetaCache, voz });

  mkdirSync(dirname(rutaAudio), { recursive: true });

  const carpetaSegmentos = resolve(dirname(rutaAudio), ".segmentos-piper");
  mkdirSync(carpetaSegmentos, { recursive: true });

  const segmentos = [];

  for (const [indice, bloque] of bloquesNarracion.entries()) {
    const salidaSegmento = resolve(carpetaSegmentos, `seccion-${String(indice + 1).padStart(2, "0")}.wav`);

    await ejecutarPiper({
      binario,
      modelo,
      texto: bloque.texto,
      velocidad: Number.parseFloat(datos.velocidadNarracion) || 1,
      salida: salidaSegmento
    });

    segmentos.push({
      ...bloque,
      ruta: salidaSegmento,
      duracionSegundos: leerDuracionWavSegundos(salidaSegmento)
    });
  }

  combinarWavs({
    segmentos,
    salida: rutaAudio,
    pausaEntreSeccionesSegundos: PAUSA_ENTRE_SECCIONES_SEGUNDOS
  });

  const duracionAudioSegundos = leerDuracionWavSegundos(rutaAudio);
  const datosActualizados = ajustarDatosConAudio({
    datos,
    rutaAudioRelativa: normalizarRuta(rutaAudioRelativa),
    voz,
    duracionAudioSegundos,
    segmentos
  });

  writeFileSync(rutaDatos, `${JSON.stringify(datosActualizados, null, 2)}\n`);
  console.log(`Audio Piper generado: ${normalizarRuta(rutaAudio)}`);
  console.log(`Duracion de audio: ${duracionAudioSegundos.toFixed(2)}s`);

  return datosActualizados;
}

async function prepararBinarioPiper(carpetaCache) {
  const binario = resolve(carpetaCache, "piper", "piper");

  if (existsSync(binario)) {
    return binario;
  }

  mkdirSync(carpetaCache, { recursive: true });
  const paquete = resolve(carpetaCache, "piper_linux_x86_64.tar.gz");
  await descargarArchivoSeguro({
    url: URL_BINARIO_PIPER,
    destino: paquete,
    sha256Esperado: HASH_BINARIO_PIPER
  });

  ejecutarComando("tar", ["-xzf", paquete, "-C", carpetaCache]);
  ejecutarComando("chmod", ["+x", binario]);

  return binario;
}

async function prepararModeloPiper({ carpetaCache, voz }) {
  const carpetaVoz = resolve(carpetaCache, "voces", voz.id);
  const rutaModelo = resolve(carpetaVoz, `${voz.archivo}.onnx`);
  const rutaConfiguracion = resolve(carpetaVoz, `${voz.archivo}.onnx.json`);

  if (existsSync(rutaModelo) && existsSync(rutaConfiguracion)) {
    return rutaModelo;
  }

  mkdirSync(carpetaVoz, { recursive: true });
  const urls = crearUrlsVozPiper(voz);

  await descargarArchivoSeguro({
    url: urls.modelo,
    destino: rutaModelo,
    sha256Esperado: voz.sha256Modelo || ""
  });
  await descargarArchivoSeguro({
    url: urls.configuracion,
    destino: rutaConfiguracion,
    sha256Esperado: ""
  });

  return rutaModelo;
}

async function descargarArchivoSeguro({ url, destino, sha256Esperado }) {
  if (existsSync(destino) && (!sha256Esperado || calcularSha256(destino) === sha256Esperado)) {
    return;
  }

  const respuesta = await fetch(url, {
    headers: {
      "User-Agent": "presentacion-mr-robot-render"
    }
  });

  if (!respuesta.ok) {
    throw new Error(`No se pudo descargar ${url}: HTTP ${respuesta.status}`);
  }

  const bytes = Buffer.from(await respuesta.arrayBuffer());
  writeFileSync(destino, bytes);

  if (sha256Esperado) {
    const recibido = calcularSha256(destino);
    if (recibido !== sha256Esperado) {
      throw new Error(`Hash invalido para ${destino}. Esperado ${sha256Esperado}, recibido ${recibido}.`);
    }
  }
}

function ejecutarPiper({ binario, modelo, texto, velocidad, salida }) {
  const lengthScale = Math.max(0.85, Math.min(1.65, LENGTH_SCALE_NORMAL / Math.max(0.7, Math.min(1.3, velocidad))));

  return new Promise((resolver, rechazar) => {
    const proceso = spawn(binario, [
      "--model",
      modelo,
      "--output_file",
      salida,
      "--length_scale",
      String(lengthScale),
      "--sentence_silence",
      String(PAUSA_ENTRE_FRASES_SEGUNDOS)
    ], {
      stdio: ["pipe", "pipe", "pipe"]
    });

    let salidaError = "";
    proceso.stderr.on("data", (chunk) => {
      salidaError += chunk.toString();
    });
    proceso.on("error", rechazar);
    proceso.on("close", (codigo) => {
      if (codigo !== 0) {
        rechazar(new Error(`Piper fallo con codigo ${codigo}: ${salidaError.trim()}`));
        return;
      }
      resolver();
    });

    proceso.stdin.end(texto);
  });
}

function ajustarDatosConAudio({ datos, rutaAudioRelativa, voz, duracionAudioSegundos, segmentos }) {
  const secciones = Array.isArray(datos.secciones) ? datos.secciones : [];
  const duracionesPorOrden = new Map(segmentos.map((segmento) => [
    segmento.orden,
    segmento.duracionSegundos + PAUSA_ENTRE_SECCIONES_SEGUNDOS
  ]));
  const duracionVideoSegundos = secciones.reduce((total, seccion) => {
    return total + (Number(seccion.duracionFrames) || 0) / FPS_RENDER;
  }, 0);
  const factor = duracionAudioSegundos > duracionVideoSegundos
    ? (duracionAudioSegundos + 1) / Math.max(1, duracionVideoSegundos)
    : 1;

  return {
    ...datos,
    audioNarracionUrl: rutaAudioRelativa,
    proveedorTts: "piper",
    vozNarracion: voz.id,
    audioNarracion: {
      proveedor: "piper",
      voz: voz.id,
      idioma: voz.idioma,
      region: voz.region,
      duracionSegundos: Number(duracionAudioSegundos.toFixed(2)),
      ruta: rutaAudioRelativa,
      pausasEntreSeccionesSegundos: PAUSA_ENTRE_SECCIONES_SEGUNDOS
    },
    secciones: ajustarDuracionesSecciones({ secciones, duracionesPorOrden, factor })
  };
}

export function prepararBloquesNarracion(datos) {
  const bloquesSecciones = Array.isArray(datos.narracionSecciones)
    ? datos.narracionSecciones
      .map((seccion, indice) => ({
        orden: Number(seccion.orden) || indice + 1,
        tipo: seccion.tipo || "seccion",
        texto: prepararTextoParaVoz(seccion.texto)
      }))
      .filter((bloque) => bloque.texto)
    : [];

  if (bloquesSecciones.length > 0) {
    return limitarBloquesPorCaracteres(bloquesSecciones);
  }

  const textoPrincipal = prepararTextoParaVoz(datos.textoNarracion);

  return textoPrincipal
    ? limitarBloquesPorCaracteres([{ orden: 1, tipo: "narracion", texto: textoPrincipal }])
    : [];
}

function ajustarDuracionesSecciones({ secciones, duracionesPorOrden, factor }) {
  return secciones.map((seccion) => {
    const duracionActualFrames = Number(seccion.duracionFrames) || 0;
    const duracionAudioFrames = Math.ceil((duracionesPorOrden.get(Number(seccion.orden)) || 0) * FPS_RENDER);
    const duracionConFactor = factor > 1 ? Math.ceil(duracionActualFrames * factor) : duracionActualFrames;

    return {
      ...seccion,
      duracionFrames: Math.max(duracionActualFrames, duracionAudioFrames, duracionConFactor)
    };
  });
}

function combinarWavs({ segmentos, salida, pausaEntreSeccionesSegundos }) {
  const audios = segmentos.map((segmento) => leerWavPcm(segmento.ruta));
  const base = audios[0];
  const silencio = crearSilencioPcm({
    wav: base,
    duracionSegundos: pausaEntreSeccionesSegundos
  });
  const datos = [];

  audios.forEach((audio, indice) => {
    validarFormatoWavCompatible(base, audio);
    datos.push(audio.data);

    if (indice < audios.length - 1) {
      datos.push(silencio);
    }
  });

  escribirWavPcm({
    salida,
    sampleRate: base.sampleRate,
    bitsPerSample: base.bitsPerSample,
    channels: base.channels,
    data: Buffer.concat(datos)
  });
}

function leerWavPcm(ruta) {
  const archivo = readFileSync(ruta);
  const sampleRate = archivo.readUInt32LE(24);
  const bitsPerSample = archivo.readUInt16LE(34);
  const channels = archivo.readUInt16LE(22);
  const indiceData = archivo.indexOf(Buffer.from("data"));

  if (indiceData < 0 || !sampleRate || !bitsPerSample || !channels) {
    throw new Error(`Archivo WAV invalido: ${ruta}`);
  }

  const dataSize = archivo.readUInt32LE(indiceData + 4);
  const inicioData = indiceData + 8;

  return {
    sampleRate,
    bitsPerSample,
    channels,
    data: archivo.subarray(inicioData, inicioData + dataSize)
  };
}

function escribirWavPcm({ salida, sampleRate, bitsPerSample, channels, data }) {
  const byteRate = sampleRate * channels * (bitsPerSample / 8);
  const blockAlign = channels * (bitsPerSample / 8);
  const cabecera = Buffer.alloc(44);

  cabecera.write("RIFF", 0);
  cabecera.writeUInt32LE(36 + data.length, 4);
  cabecera.write("WAVE", 8);
  cabecera.write("fmt ", 12);
  cabecera.writeUInt32LE(16, 16);
  cabecera.writeUInt16LE(1, 20);
  cabecera.writeUInt16LE(channels, 22);
  cabecera.writeUInt32LE(sampleRate, 24);
  cabecera.writeUInt32LE(byteRate, 28);
  cabecera.writeUInt16LE(blockAlign, 32);
  cabecera.writeUInt16LE(bitsPerSample, 34);
  cabecera.write("data", 36);
  cabecera.writeUInt32LE(data.length, 40);

  writeFileSync(salida, Buffer.concat([cabecera, data]));
}

function crearSilencioPcm({ wav, duracionSegundos }) {
  const bytesPorMuestra = wav.bitsPerSample / 8;
  const totalBytes = Math.round(wav.sampleRate * wav.channels * bytesPorMuestra * duracionSegundos);
  const bytesAlineados = totalBytes - (totalBytes % (wav.channels * bytesPorMuestra));

  return Buffer.alloc(Math.max(0, bytesAlineados));
}

function validarFormatoWavCompatible(base, audio) {
  if (
    base.sampleRate !== audio.sampleRate
    || base.bitsPerSample !== audio.bitsPerSample
    || base.channels !== audio.channels
  ) {
    throw new Error("Los segmentos WAV de Piper tienen formatos incompatibles.");
  }
}

function prepararTextoParaVoz(texto) {
  const limpio = limpiarTexto(texto);

  if (!limpio) {
    return "";
  }

  const normalizado = limpio
    .replace(/\s*([,;:])\s*/g, "$1 ")
    .replace(/\s*([.!?])\s*/g, "$1 ")
    .trim();

  return /[.!?]$/.test(normalizado) ? normalizado : `${normalizado}.`;
}

function limitarBloquesPorCaracteres(bloques) {
  const resultado = [];
  let usados = 0;

  for (const bloque of bloques) {
    const restantes = TEXTO_MAXIMO_CARACTERES - usados;

    if (restantes <= 0) {
      break;
    }

    const texto = limitarTexto(bloque.texto, restantes);
    usados += texto.length;
    resultado.push({ ...bloque, texto });
  }

  return resultado;
}

function leerDuracionWavSegundos(ruta) {
  const archivo = readFileSync(ruta);
  const sampleRate = archivo.readUInt32LE(24);
  const bitsPerSample = archivo.readUInt16LE(34);
  const channels = archivo.readUInt16LE(22);
  const indiceData = archivo.indexOf(Buffer.from("data"));

  if (indiceData < 0 || !sampleRate || !bitsPerSample || !channels) {
    return 0;
  }

  const dataSize = archivo.readUInt32LE(indiceData + 4);
  return dataSize / (sampleRate * channels * (bitsPerSample / 8));
}

function ejecutarComando(comando, argumentosComando) {
  const resultado = spawnSync(comando, argumentosComando, { stdio: "inherit" });

  if (resultado.status !== 0) {
    throw new Error(`Fallo el comando ${comando} ${argumentosComando.join(" ")}`);
  }
}

function leerJson(ruta) {
  return JSON.parse(readFileSync(ruta, "utf8"));
}

function calcularSha256(ruta) {
  return createHash("sha256").update(readFileSync(ruta)).digest("hex");
}

function limitarTexto(texto, maximo = TEXTO_MAXIMO_CARACTERES) {
  return texto.slice(0, maximo);
}

function limpiarTexto(texto) {
  return String(texto || "").replace(/\s+/g, " ").trim();
}

function normalizarRuta(ruta) {
  return String(ruta || "").replaceAll("\\", "/");
}

function leerArgumentos(argumentosCrudos) {
  const argumentos = {};

  for (let indice = 0; indice < argumentosCrudos.length; indice += 1) {
    const actual = argumentosCrudos[indice];

    if (!actual.startsWith("--")) {
      continue;
    }

    const clave = actual.slice(2);
    const siguiente = argumentosCrudos[indice + 1];

    if (!siguiente || siguiente.startsWith("--")) {
      argumentos[clave] = true;
      continue;
    }

    argumentos[clave] = siguiente;
    indice += 1;
  }

  return argumentos;
}
