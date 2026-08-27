import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const datos = JSON.parse(readFileSync("scripts/renderizar-video/datos-presentacion-ejemplo.json", "utf8"));

assert.equal(typeof datos.empresaObjetivo, "string");
assert.equal(typeof datos.colorPrimario, "string");
assert.equal(typeof datos.colorSecundario, "string");
assert.equal(Array.isArray(datos.secciones), true);
assert.equal(datos.secciones.length > 0, true);
assert.equal(datos.secciones.every((seccion) => typeof seccion.duracionFrames === "number"), true);
assert.equal(Array.isArray(datos.equipo), true);
assert.equal(datos.equipo.length >= 4, true);
assert.equal(Boolean(datos.assets.logo), true);

const duracionTotal = datos.secciones
  .filter((seccion) => seccion.activa)
  .reduce((total, seccion) => total + seccion.duracionFrames, 0);

assert.equal(duracionTotal, 960);

console.log("Prueba de contrato de render completada.");

