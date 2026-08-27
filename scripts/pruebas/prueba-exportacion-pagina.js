import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { exportarPaginaPresentacion } from "../exportar-pagina/exportarPaginaPresentacion.js";

const carpetaTemporal = mkdtempSync(join(tmpdir(), "pagina-presentacion-"));

try {
  const datos = JSON.parse(readFileSync("scripts/renderizar-video/datos-presentacion-ejemplo.json", "utf8"));
  exportarPaginaPresentacion({
    datos,
    carpetaSalida: carpetaTemporal,
    subdominio: "propuesta.mrrobotbolivia.com"
  });

  const html = readFileSync(join(carpetaTemporal, "index.html"), "utf8");
  const cname = readFileSync(join(carpetaTemporal, "CNAME"), "utf8");

  assert.equal(existsSync(join(carpetaTemporal, "_headers")), true);
  assert.equal(existsSync(join(carpetaTemporal, "_redirects")), true);
  assert.equal(cname, "propuesta.mrrobotbolivia.com");
  assert.equal(html.includes("MR ROBOT BOLIVIA"), true);
  assert.equal(html.includes("CV completo"), true);
  assert.equal(html.includes(datos.empresaObjetivo), true);
} finally {
  rmSync(carpetaTemporal, { recursive: true, force: true });
}

console.log("Prueba de exportacion de pagina completada.");
