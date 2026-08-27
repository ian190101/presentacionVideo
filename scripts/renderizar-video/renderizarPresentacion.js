import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { availableParallelism } from "node:os";
import { dirname, resolve } from "node:path";
import { exportarPaginaPresentacion } from "../exportar-pagina/exportarPaginaPresentacion.js";

const PERFILES_RENDER = {
  rapida: {
    composiciones: {
      horizontal: "PresentacionHorizontal",
      vertical: "PresentacionVertical"
    },
    crf: 30,
    jpegQuality: 68,
    scale: 0.35,
    everyNthFrame: 2,
    x264Preset: "ultrafast",
    concurrency: calcularConcurrencia(4)
  },
  equilibrada: {
    composiciones: {
      horizontal: "PresentacionHorizontal",
      vertical: "PresentacionVertical"
    },
    crf: 26,
    jpegQuality: 78,
    scale: 0.55,
    everyNthFrame: 1,
    x264Preset: "superfast",
    concurrency: calcularConcurrencia(3)
  },
  alta: {
    composiciones: {
      horizontal: "PresentacionHorizontal",
      vertical: "PresentacionVertical"
    },
    crf: 20,
    jpegQuality: 90,
    scale: 1,
    everyNthFrame: 1,
    x264Preset: "fast",
    concurrency: null
  }
};

const argumentos = leerArgumentos(process.argv.slice(2));
const formatoSolicitado = argumentos.formato || "ambos";
const calidad = argumentos.calidad || "rapida";
const rutaDatos = resolve(argumentos.datos || "scripts/renderizar-video/datos-presentacion-ejemplo.json");
const carpetaSalida = resolve(argumentos.salida || "dist/videos");
const carpetaPagina = resolve(argumentos.pagina || "dist/pagina");
const formatos = formatoSolicitado === "ambos" ? ["horizontal", "vertical"] : [formatoSolicitado];

validarRender({ formatos, calidad });

const datos = leerDatos(rutaDatos);
const datosVideo = prepararDatosParaRender(datos, calidad);
const puntoEntrada = resolve("aplicaciones/video/src/index.jsx");
const carpetaPublica = resolve("public");

mkdirSync(carpetaSalida, { recursive: true });

console.log(`Renderizando presentacion desde ${rutaDatos}`);
exportarPaginaPresentacion({
  datos,
  carpetaSalida: carpetaPagina,
  subdominio: argumentos.subdominio || process.env.SUBDOMINIO_PAGINA || ""
});

const serveUrl = await bundle({
  entryPoint: puntoEntrada,
  publicDir: carpetaPublica
});

for (const formato of formatos) {
  await renderizarFormato({ serveUrl, formato, datos: datosVideo, carpetaSalida, calidad });
}

console.log("Render de presentacion completado.");

async function renderizarFormato({ serveUrl, formato, datos, carpetaSalida, calidad }) {
  const perfil = PERFILES_RENDER[calidad];
  const id = perfil.composiciones[formato];
  const salida = resolve(carpetaSalida, `presentacion-${formato}.mp4`);
  const inputProps = { datos, formato };

  mkdirSync(dirname(salida), { recursive: true });

  const composicion = await selectComposition({
    serveUrl,
    id,
    inputProps
  });

  console.log(`Renderizando ${id} en ${salida}`);

  await renderMedia({
    composition: composicion,
    serveUrl,
    codec: "h264",
    crf: perfil.crf,
    jpegQuality: perfil.jpegQuality,
    scale: perfil.scale,
    everyNthFrame: perfil.everyNthFrame,
    x264Preset: perfil.x264Preset,
    concurrency: perfil.concurrency,
    chromiumOptions: {
      gl: "angle"
    },
    outputLocation: salida,
    inputProps
  });
}

function calcularConcurrencia(maximo) {
  return Math.max(1, Math.min(maximo, availableParallelism()));
}

function leerDatos(ruta) {
  if (!existsSync(ruta)) {
    throw new Error(`No existe el archivo de datos para render: ${ruta}`);
  }

  const contenido = readFileSync(ruta, "utf8");
  return JSON.parse(contenido);
}

function prepararDatosParaRender(datos, calidad) {
  if (calidad !== "rapida") {
    return datos;
  }

  return {
    ...datos,
    audioNarracionUrl: "",
    secciones: (datos.secciones || []).map((seccion) => ({
      ...seccion,
      duracionFrames: Math.max(36, Math.min(60, Math.round(Number(seccion.duracionFrames || 90) * 0.4)))
    }))
  };
}

function validarRender({ formatos, calidad }) {
  if (!PERFILES_RENDER[calidad]) {
    throw new Error(`Calidad de render no soportada: ${calidad}`);
  }

  for (const formato of formatos) {
    if (!PERFILES_RENDER[calidad].composiciones[formato]) {
      throw new Error(`Formato de render no soportado: ${formato}`);
    }
  }
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
