import assert from "node:assert/strict";
import { extraerCvDesdeArchivo } from "../../aplicaciones/api/src/servicios/servicioCv.js";

const contenido = `
Perfil
Arquitecto full stack con experiencia en productos web.

Experiencia
Desarrollo de APIs, automatizacion y paneles administrativos.

Estudios
Ingenieria de sistemas

Certificaciones
Cloudflare Workers

Logros
Implementacion de plataforma comercial

Habilidades
React, Node, PostgreSQL, Cloudflare
`;

const archivo = new File([contenido], "cv-ian.txt", { type: "text/plain" });
const resultado = await extraerCvDesdeArchivo({ archivo });

assert.equal(resultado.nombreArchivo, "cv-ian.txt");
assert.equal(resultado.campos.resumen.includes("Arquitecto full stack"), true);
assert.equal(resultado.campos.experiencia.includes("Desarrollo de APIs"), true);
assert.equal(resultado.campos.estudios.includes("Ingenieria de sistemas"), true);
assert.equal(resultado.campos.certificaciones.includes("Cloudflare Workers"), true);
assert.equal(resultado.campos.logros.includes("Implementacion de plataforma comercial"), true);
assert.equal(resultado.campos.stackPrincipal.includes("React"), true);

console.log("Prueba de extractor de CV completada.");
