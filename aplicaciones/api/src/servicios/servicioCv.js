import { responderError } from "./servicioRespuesta.js";

const MIME_DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const MIME_PDF = "application/pdf";
const MIME_TEXTO = new Set(["text/plain", "text/markdown", "text/csv", "application/json"]);

export async function extraerCvDesdeArchivo({ archivo }) {
  validarArchivoCv(archivo);

  const nombre = archivo.name || "cv";
  const mime = archivo.type || detectarMimePorNombre(nombre);
  const bytes = new Uint8Array(await archivo.arrayBuffer());
  const texto = await extraerTextoPorTipo({ bytes, mime, nombre });
  const textoLimpio = normalizarEspacios(texto);

  if (!textoLimpio) {
    throw responderError({
      codigo: "cv_sin_texto_extraible",
      mensaje: "No se pudo extraer texto util del CV.",
      estadoHttp: 422,
      detalles: "Si el CV es una imagen escaneada, se necesita activar OCR deterministico."
    });
  }

  return {
    nombreArchivo: nombre,
    mimeType: mime,
    texto: textoLimpio,
    campos: estructurarCv(textoLimpio)
  };
}

function validarArchivoCv(archivo) {
  if (!archivo) {
    throw responderError({
      codigo: "cv_archivo_requerido",
      mensaje: "Debes enviar un archivo de CV.",
      estadoHttp: 422
    });
  }

  if (archivo.size > 4 * 1024 * 1024) {
    throw responderError({
      codigo: "cv_archivo_demasiado_grande",
      mensaje: "El CV supera el tamano maximo permitido.",
      estadoHttp: 413,
      detalles: "Limite actual: 4 MB."
    });
  }
}

async function extraerTextoPorTipo({ bytes, mime, nombre }) {
  if (mime === MIME_DOCX || nombre.toLowerCase().endsWith(".docx")) {
    return extraerTextoDocx(bytes);
  }

  if (mime === MIME_PDF || nombre.toLowerCase().endsWith(".pdf")) {
    return extraerTextoPdf(bytes);
  }

  if (MIME_TEXTO.has(mime) || /\.(txt|md|csv)$/i.test(nombre)) {
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  }

  if (mime.startsWith("image/")) {
    throw responderError({
      codigo: "cv_ocr_no_configurado",
      mensaje: "El archivo parece ser una imagen y requiere OCR deterministico.",
      estadoHttp: 422,
      detalles: "Para imagenes se debe conectar un motor OCR como Tesseract en un proceso separado; no se usa IA generativa."
    });
  }

  throw responderError({
    codigo: "cv_tipo_no_soportado",
    mensaje: "El tipo de archivo del CV no esta soportado.",
    estadoHttp: 422,
    detalles: { mime, nombre }
  });
}

async function extraerTextoDocx(bytes) {
  const entradas = await leerEntradasZip(bytes);
  const nombresXml = [
    "word/document.xml",
    ...[...entradas.keys()].filter((nombre) => /^word\/(header|footer)\d+\.xml$/i.test(nombre))
  ];
  const partes = [];

  for (const nombre of nombresXml) {
    const contenido = entradas.get(nombre);

    if (contenido) {
      partes.push(extraerTextoXmlWord(contenido));
    }
  }

  return partes.join("\n");
}

async function leerEntradasZip(bytes) {
  const entradas = new Map();
  let offset = 0;

  while (offset < bytes.length - 30) {
    if (leerUint32(bytes, offset) !== 0x04034b50) {
      offset += 1;
      continue;
    }

    const metodo = leerUint16(bytes, offset + 8);
    const tamanoComprimido = leerUint32(bytes, offset + 18);
    const tamanoNombre = leerUint16(bytes, offset + 26);
    const tamanoExtra = leerUint16(bytes, offset + 28);
    const inicioNombre = offset + 30;
    const finNombre = inicioNombre + tamanoNombre;
    const nombre = new TextDecoder().decode(bytes.slice(inicioNombre, finNombre));
    const inicioDatos = finNombre + tamanoExtra;
    const finDatos = inicioDatos + tamanoComprimido;
    const datos = bytes.slice(inicioDatos, finDatos);

    if (nombre.endsWith(".xml")) {
      entradas.set(nombre, await descomprimirZipEntrada(datos, metodo));
    }

    offset = finDatos;
  }

  return entradas;
}

async function descomprimirZipEntrada(datos, metodo) {
  if (metodo === 0) {
    return new TextDecoder("utf-8", { fatal: false }).decode(datos);
  }

  if (metodo !== 8) {
    return "";
  }

  const flujo = new Blob([datos]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Response(flujo).text();
}

function extraerTextoXmlWord(xml) {
  return xml
    .replace(/<w:tab\/>/g, "\t")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

async function extraerTextoPdf(bytes) {
  const contenido = new TextDecoder("latin1", { fatal: false }).decode(bytes);
  const partes = [extraerTextoPdfPlano(contenido)];
  const streams = contenido.matchAll(/<<(?:.|\n|\r)*?FlateDecode(?:.|\n|\r)*?>>\s*stream\r?\n([\s\S]*?)\r?\nendstream/g);

  for (const stream of streams) {
    const binario = Uint8Array.from(stream[1], (caracter) => caracter.charCodeAt(0) & 0xff);

    try {
      const textoInflado = await new Response(new Blob([binario]).stream().pipeThrough(new DecompressionStream("deflate"))).text();
      partes.push(extraerTextoPdfPlano(textoInflado));
    } catch {
      // Algunos PDFs usan filtros adicionales; se ignoran sin romper el resto del CV.
    }
  }

  return partes.join("\n");
}

function extraerTextoPdfPlano(contenido) {
  const textos = [];
  const patrones = [/\(([^()]*)\)\s*Tj/g, /\(([^()]*)\)\s*'/g, /\(([^()]*)\)\s*"/g, /\[(.*?)\]\s*TJ/gs];

  for (const patron of patrones) {
    for (const coincidencia of contenido.matchAll(patron)) {
      textos.push(limpiarTextoPdf(coincidencia[1]));
    }
  }

  return textos.join(" ");
}

function limpiarTextoPdf(texto) {
  return String(texto || "")
    .replace(/\\([nrtbf()\\])/g, (_, caracter) => {
      const mapa = { n: "\n", r: "\r", t: "\t", b: "", f: "", "(": "(", ")": ")", "\\": "\\" };
      return mapa[caracter] ?? caracter;
    })
    .replace(/\\[0-7]{1,3}/g, " ")
    .replace(/<[^>]+>/g, " ");
}

function estructurarCv(texto) {
  const secciones = partirPorEncabezados(texto);
  const experiencia = unirSecciones(secciones, ["experiencia", "experience", "laboral", "work"]);
  const estudios = listarSeccion(secciones, ["educacion", "educación", "estudios", "formacion", "formación", "education"]);
  const certificaciones = listarSeccion(secciones, ["certificaciones", "certificacion", "certificación", "certificates"]);
  const logros = listarSeccion(secciones, ["logros", "achievements", "premios", "reconocimientos"]);
  const stackPrincipal = extraerStack(texto, secciones);
  const enlaces = [...texto.matchAll(/https?:\/\/[^\s),;]+/g)].map((coincidencia) => coincidencia[0]);

  return {
    resumen: unirSecciones(secciones, ["perfil", "resumen", "summary", "objetivo"]) || texto.slice(0, 420),
    experiencia: experiencia || texto.slice(0, 1200),
    estudios,
    certificaciones,
    logros,
    stackPrincipal,
    enlaces,
    cvCompleto: texto
  };
}

function partirPorEncabezados(texto) {
  const lineas = texto.split(/\r?\n/).map((linea) => linea.trim()).filter(Boolean);
  const secciones = new Map();
  let actual = "general";

  for (const linea of lineas) {
    if (esEncabezadoCv(linea)) {
      actual = normalizarClave(linea);
      if (!secciones.has(actual)) secciones.set(actual, []);
      continue;
    }

    if (!secciones.has(actual)) secciones.set(actual, []);
    secciones.get(actual).push(linea);
  }

  return secciones;
}

function esEncabezadoCv(linea) {
  const texto = normalizarClave(linea);
  const encabezados = ["experiencia", "experience", "educacion", "estudios", "formacion", "certificaciones", "logros", "perfil", "resumen", "summary", "habilidades", "skills", "stack"];
  return linea.length <= 48 && encabezados.some((encabezado) => texto.includes(encabezado));
}

function unirSecciones(secciones, claves) {
  return claves
    .flatMap((clave) => buscarSecciones(secciones, clave))
    .flat()
    .join("\n")
    .slice(0, 2000);
}

function listarSeccion(secciones, claves) {
  return claves
    .flatMap((clave) => buscarSecciones(secciones, clave))
    .flatMap((lineas) => lineas.flatMap((linea) => linea.split(/[•\u2022|-]\s+/)))
    .map((linea) => linea.trim())
    .filter((linea) => linea.length > 3)
    .slice(0, 20);
}

function buscarSecciones(secciones, clave) {
  return [...secciones.entries()]
    .filter(([nombre]) => nombre.includes(normalizarClave(clave)))
    .map(([, lineas]) => lineas);
}

function extraerStack(texto, secciones) {
  const desdeSeccion = unirSecciones(secciones, ["habilidades", "skills", "stack", "tecnologias", "tecnologías"]);

  if (desdeSeccion) {
    return desdeSeccion.slice(0, 500);
  }

  const tecnologias = ["React", "Vue", "Angular", "Node", "Python", "FastAPI", "Django", "Laravel", "PostgreSQL", "Supabase", "Cloudflare", "Docker", "AWS", "Azure", "TypeScript", "JavaScript"];
  return tecnologias.filter((tecnologia) => new RegExp(`\\b${tecnologia}\\b`, "i").test(texto)).join(", ");
}

function normalizarEspacios(texto) {
  return String(texto || "")
    .replace(/\u0000/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizarClave(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function detectarMimePorNombre(nombre) {
  if (/\.pdf$/i.test(nombre)) return MIME_PDF;
  if (/\.docx$/i.test(nombre)) return MIME_DOCX;
  return "text/plain";
}

function leerUint16(bytes, offset) {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function leerUint32(bytes, offset) {
  return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0;
}
