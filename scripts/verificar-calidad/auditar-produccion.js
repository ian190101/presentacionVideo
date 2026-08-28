import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const raiz = process.cwd();
const errores = [];
const advertencias = [];

const carpetasIgnoradas = new Set(["node_modules", "dist", ".git", ".wrangler"]);
const archivosIgnorados = new Set(["package-lock.json"]);
const extensionesAuditadas = new Set([".js", ".jsx", ".sql", ".md", ".toml", ".yml", ".yaml", ".example", ".gitignore"]);

const archivosRequeridos = [
  ".gitignore",
  ".env.example",
  "aplicaciones/api/.dev.vars.example",
  "aplicaciones/api/src/middlewares/controlSolicitud.js",
  "aplicaciones/api/src/middlewares/seguridad.js",
  "aplicaciones/api/src/middlewares/cors.js",
  "aplicaciones/panel/public/_headers",
  ".github/workflows/desplegar-produccion.yml",
  "docs/despliegue-produccion.md"
];

for (const archivo of archivosRequeridos) {
  if (!existsSync(join(raiz, archivo))) {
    errores.push(`Falta archivo requerido para produccion: ${archivo}`);
  }
}

validarArchivosLocalesPeligrosos();
validarContenidoSeguridad();
validarSecretosAccidentales();

if (advertencias.length > 0) {
  console.warn(advertencias.join("\n"));
}

if (errores.length > 0) {
  console.error(errores.join("\n"));
  process.exit(1);
}

console.log("Auditoria de produccion completada.");

function validarArchivosLocalesPeligrosos() {
  for (const archivo of [".env", ".env.local", "aplicaciones/api/.dev.vars"]) {
    if (existsSync(join(raiz, archivo))) {
      advertencias.push(`Advertencia: existe ${archivo}. Verifica que no se suba al repositorio.`);
    }
  }
}

function validarContenidoSeguridad() {
  const cabecerasPages = leer("aplicaciones/panel/public/_headers");
  const seguridadWorker = leer("aplicaciones/api/src/middlewares/seguridad.js");
  const controlSolicitud = leer("aplicaciones/api/src/middlewares/controlSolicitud.js");
  const cors = leer("aplicaciones/api/src/middlewares/cors.js");
  const wrangler = leer("aplicaciones/api/wrangler.toml");
  const workflow = leer(".github/workflows/desplegar-produccion.yml");

  for (const cabecera of ["X-Frame-Options", "X-Content-Type-Options", "Referrer-Policy", "Permissions-Policy", "Strict-Transport-Security", "Content-Security-Policy"]) {
    if (!cabecerasPages.includes(cabecera)) {
      errores.push(`Cloudflare Pages no configura cabecera: ${cabecera}`);
    }

    if (!seguridadWorker.includes(cabecera)) {
      errores.push(`Worker no configura cabecera: ${cabecera}`);
    }
  }

  for (const control of ["LIMITE_CUERPO_BYTES", "RATE_LIMIT_MAXIMO", "RATE_LIMIT_VENTANA_MS"]) {
    if (!controlSolicitud.includes(control)) {
      errores.push(`Middleware de solicitud no contiene control: ${control}`);
    }

    if (!wrangler.includes(control)) {
      errores.push(`wrangler.toml no configura: ${control}`);
    }
  }

  if (cors.includes("Access-Control-Allow-Origin\": \"*")) {
    errores.push("CORS no debe permitir cualquier origen en produccion.");
  }

  for (const paso of ["npm run verificar", "npm run auditar", "npm run panel:build"]) {
    if (!workflow.includes(paso)) {
      errores.push(`Workflow de produccion no ejecuta: ${paso}`);
    }
  }
}

function validarSecretosAccidentales() {
  const patrones = [
    { nombre: "token_hugging_face", expresion: /hf_[A-Za-z0-9]{20,}/g },
    { nombre: "jwt_largo", expresion: /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g },
    { nombre: "clave_service_role_supabase", expresion: /service_role[\s\S]{0,80}eyJ[A-Za-z0-9_-]{20,}/g },
    { nombre: "cloudinary_url_secreta", expresion: /cloudinary:\/\/[0-9]+:[^@\s]+@[A-Za-z0-9_-]+/g }
  ];

  for (const archivo of listarArchivosAuditables(raiz)) {
    const relativo = normalizarRuta(relative(raiz, archivo));
    const contenido = readFileSync(archivo, "utf8");

    for (const patron of patrones) {
      const hallazgos = contenido.match(patron.expresion);

      if (hallazgos?.length) {
        errores.push(`Posible secreto real detectado (${patron.nombre}) en ${relativo}`);
      }
    }
  }
}

function listarArchivosAuditables(carpeta) {
  const archivos = [];

  for (const entrada of readdirSync(carpeta)) {
    if (carpetasIgnoradas.has(entrada)) {
      continue;
    }

    const ruta = join(carpeta, entrada);
    const estado = statSync(ruta);

    if (estado.isDirectory()) {
      archivos.push(...listarArchivosAuditables(ruta));
      continue;
    }

    if (archivosIgnorados.has(entrada)) {
      continue;
    }

    if (extensionesAuditadas.has(obtenerExtensionAuditable(entrada))) {
      archivos.push(ruta);
    }
  }

  return archivos;
}

function obtenerExtensionAuditable(archivo) {
  if (archivo.endsWith(".example")) {
    return ".example";
  }

  if (archivo === ".gitignore") {
    return ".gitignore";
  }

  const indice = archivo.lastIndexOf(".");
  return indice >= 0 ? archivo.slice(indice) : "";
}

function leer(archivo) {
  const ruta = join(raiz, archivo);
  return existsSync(ruta) ? readFileSync(ruta, "utf8") : "";
}

function normalizarRuta(ruta) {
  return ruta.replaceAll("\\", "/");
}
