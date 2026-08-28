import { existsSync, readFileSync } from "node:fs";

const archivosRequeridos = [
  "docs/fase-0-alcance.md",
  "docs/fase-1-arquitectura.md",
  "docs/fase-2-modelo-datos.md",
  "docs/fase-3-backend-serverless.md",
  "docs/fase-8-despliegue-produccion.md",
  "docs/fase-9-auditoria-produccion.md",
  "docs/fase-10-render-bajo-demanda.md",
  "docs/fase-11-integracion-render-api.md",
  "docs/despliegue-produccion.md",
  "docs/release-rollback.md",
  "docs/auditoria-final.md",
  "wrangler.json",
  ".github/workflows/desplegar-produccion.yml",
  ".github/workflows/renderizar-video.yml",
  ".env.example",
  ".gitignore",
  "aplicaciones/api/.dev.vars.example",
  "aplicaciones/api/wrangler.toml",
  "aplicaciones/api/src/middlewares/controlSolicitud.js",
  "aplicaciones/panel/public/_headers",
  "aplicaciones/panel/public/_redirects",
  "aplicaciones/panel/worker.js",
  "aplicaciones/api/src/index.js",
  "aplicaciones/api/src/rutas/enrutador.js",
  "aplicaciones/api/src/rutas/rutaContenido.js",
  "aplicaciones/api/src/rutas/rutaRender.js",
  "aplicaciones/api/src/servicios/servicioAsset.js",
  "aplicaciones/api/src/servicios/servicioContenido.js",
  "aplicaciones/api/src/servicios/servicioRender.js",
  "aplicaciones/api/src/servicios/servicioStorageAudio.js",
  "aplicaciones/api/src/servicios/servicioGitHubActions.js",
  "aplicaciones/api/src/validaciones/validacionContenido.js",
  "aplicaciones/api/src/validaciones/validacionRender.js",
  "aplicaciones/panel/src/componentes/PanelAssets.jsx",
  "aplicaciones/panel/src/componentes/PanelContenidoEditable.jsx",
  "aplicaciones/panel/src/componentes/RelojTiempoSegmento.jsx",
  "aplicaciones/panel/src/servicios/servicioAssetsPanel.js",
  "aplicaciones/panel/src/servicios/servicioEditorPresentacion.js",
  "scripts/verificar-calidad/auditar-produccion.js",
  "scripts/pruebas/prueba-validaciones-api.js",
  "scripts/pruebas/prueba-contrato-render.js",
  "scripts/pruebas/prueba-exportacion-pagina.js",
  "scripts/exportar-pagina/exportarPaginaPresentacion.js",
  "scripts/renderizar-video/renderizarPresentacion.js",
  "scripts/renderizar-video/datos-presentacion-ejemplo.json",
  "supabase/migraciones/001_modelo_inicial.sql",
  "supabase/semillas/001_ayudas_contextuales.sql"
];

const nombresTablaProhibidos = [
  "presentaciones",
  "secciones_video",
  "clientes",
  "proyectos",
  "integrantes_equipo",
  "habilidades",
  "assets",
  "narraciones",
  "audios_generados",
  "solicitudes_render",
  "ayudas_contextuales",
  "eventos_auditoria"
];

const errores = [];

for (const archivo of archivosRequeridos) {
  if (!existsSync(archivo)) {
    errores.push(`Falta el archivo requerido: ${archivo}`);
  }
}

const migracion = readFileSync("supabase/migraciones/001_modelo_inicial.sql", "utf8");
const workflow = readFileSync(".github/workflows/desplegar-produccion.yml", "utf8");
const workflowRender = readFileSync(".github/workflows/renderizar-video.yml", "utf8");
const ignorados = readFileSync(".gitignore", "utf8");
const ejemploEntorno = readFileSync(".env.example", "utf8");
const configuracionPanel = readFileSync("wrangler.json", "utf8");
const configuracionWorker = readFileSync("aplicaciones/api/wrangler.toml", "utf8");

for (const nombre of nombresTablaProhibidos) {
  if (migracion.includes(`public.${nombre}`)) {
    errores.push(`La migracion usa una tabla en plural: ${nombre}`);
  }
}

for (const requerido of ["name: Validar produccion", "npm run verificar", "npm run auditar", "npm run probar", "npm run panel:build", "npm run pagina:exportar"]) {
  if (!workflow.includes(requerido)) {
    errores.push(`El workflow de produccion no contiene: ${requerido}`);
  }
}

for (const prohibido of ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID", "wrangler deploy", "wrangler pages deploy", "SUPABASE_SERVICE_ROLE_KEY", "CLOUDINARY_API_SECRET", "HF_TOKEN"]) {
  if (workflow.includes(prohibido)) {
    errores.push(`El workflow de produccion expone o usa un secreto/accion no permitida: ${prohibido}`);
  }
}

for (const requerido of ["workflow_dispatch", "npm run video:render:datos", "actions/upload-artifact", "datos_json_base64", "calidad", "pagina-presentacion"]) {
  if (!workflowRender.includes(requerido)) {
    errores.push(`El workflow de render no contiene: ${requerido}`);
  }
}

for (const requerido of [".env", ".dev.vars", "node_modules/", "dist/"]) {
  if (!ignorados.includes(requerido)) {
    errores.push(`.gitignore no protege: ${requerido}`);
  }
}

for (const requerido of ["VITE_API_URL", "VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"]) {
  if (!ejemploEntorno.includes(requerido)) {
    errores.push(`.env.example no documenta: ${requerido}`);
  }
}

for (const requerido of ["presentacion-mr-robot-panel", "\"main\": \"./aplicaciones/panel/worker.js\"", "\"assets\"", "\"binding\": \"ASSETS\"", "\"directory\": \"./dist/panel\"", "single-page-application"]) {
  if (!configuracionPanel.includes(requerido)) {
    errores.push(`wrangler.json no documenta configuracion estatica del panel: ${requerido}`);
  }
}

for (const prohibido of ["SUPABASE_SERVICE_ROLE_KEY", "CLOUDINARY_API_SECRET", "HF_TOKEN", "CLOUDFLARE_API_TOKEN"]) {
  if (configuracionPanel.includes(prohibido)) {
    errores.push(`wrangler.json del panel no debe contener secretos: ${prohibido}`);
  }
}

for (const requerido of ["[env.production]", "CORS_ORIGEN_PERMITIDO", "HF_TOKEN", "GITHUB_TOKEN", "GITHUB_REPOSITORIO", "RATE_LIMIT_MAXIMO", "LIMITE_CUERPO_BYTES"]) {
  if (!configuracionWorker.includes(requerido)) {
    errores.push(`wrangler.toml no documenta configuracion de produccion: ${requerido}`);
  }
}

if (errores.length > 0) {
  console.error(errores.join("\n"));
  process.exit(1);
}

console.log("Verificacion de estructura completada.");
