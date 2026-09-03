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
  const texto = prepararTextoNarracion(datos);

  if (!texto) {
    console.log("No hay texto de narracion. Se conserva el audio configurado.");
    return datos;
  }

  const voz = obtenerVozPiper(datos.vozNarracion);
  const binario = await prepararBinarioPiper(carpetaCache);
  const modelo = await prepararModeloPiper({ carpetaCache, voz });

  mkdirSync(dirname(rutaAudio), { recursive: true });

  await ejecutarPiper({
    binario,
    modelo,
    texto,
    velocidad: Number.parseFloat(datos.velocidadNarracion) || 1,
    salida: rutaAudio
  });

  const duracionAudioSegundos = leerDuracionWavSegundos(rutaAudio);
  const datosActualizados = ajustarDatosConAudio({
    datos,
    rutaAudioRelativa: normalizarRuta(rutaAudioRelativa),
    voz,
    duracionAudioSegundos
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
  const lengthScale = Math.max(0.65, Math.min(1.45, 1 / Math.max(0.7, Math.min(1.3, velocidad))));

  return new Promise((resolver, rechazar) => {
    const proceso = spawn(binario, [
      "--model",
      modelo,
      "--output_file",
      salida,
      "--length_scale",
      String(lengthScale)
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

function ajustarDatosConAudio({ datos, rutaAudioRelativa, voz, duracionAudioSegundos }) {
  const secciones = Array.isArray(datos.secciones) ? datos.secciones : [];
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
      ruta: rutaAudioRelativa
    },
    secciones: factor > 1
      ? secciones.map((seccion) => ({
        ...seccion,
        duracionFrames: Math.ceil((Number(seccion.duracionFrames) || 0) * factor)
      }))
      : secciones
  };
}

function prepararTextoNarracion(datos) {
  const textoPrincipal = limpiarTexto(datos.textoNarracion);

  if (textoPrincipal) {
    return limitarTexto(textoPrincipal);
  }

  const textoSecciones = Array.isArray(datos.narracionSecciones)
    ? datos.narracionSecciones.map((seccion) => seccion.texto).filter(Boolean).join(" ")
    : "";

  return limitarTexto(limpiarTexto(textoSecciones));
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

function limitarTexto(texto) {
  return texto.slice(0, TEXTO_MAXIMO_CARACTERES);
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
