import assert from "node:assert/strict";
import { validarContenidoEntidad } from "../../aplicaciones/api/src/validaciones/validacionContenido.js";
import { validarSolicitudRender } from "../../aplicaciones/api/src/validaciones/validacionRender.js";
import { validarActualizacionPresentacion, validarNuevaPresentacion } from "../../aplicaciones/api/src/validaciones/validacionPresentacion.js";

const presentacionValida = validarNuevaPresentacion({
  nombre: "Presentacion Sofia",
  empresaObjetivo: "Sofia Embutidos",
  formatoPreferido: "horizontal"
});

assert.equal(presentacionValida.valida, true);

const presentacionInvalida = validarNuevaPresentacion({
  nombre: "No",
  empresaObjetivo: "",
  formatoPreferido: "cuadrado"
});

assert.equal(presentacionInvalida.valida, false);
assert.equal(presentacionInvalida.errores.length, 3);

const actualizacionValida = validarActualizacionPresentacion({
  colorPrimario: "#d40511",
  colorSecundario: "#22c7dd"
});

assert.equal(actualizacionValida.valida, true);

const clienteValido = validarContenidoEntidad("cliente", {
  presentacionId: "presentacion-demo",
  nombre: "FIEA",
  tipoCliente: "internacional"
});

assert.equal(clienteValido.valida, true);

const clienteInvalido = validarContenidoEntidad("cliente", {
  presentacionId: "presentacion-demo",
  nombre: "F",
  tipoCliente: "desconocido"
});

assert.equal(clienteInvalido.valida, false);

const habilidadValida = validarContenidoEntidad("habilidad", {
  presentacionId: "presentacion-demo",
  nombre: "React",
  categoria: "frontend",
  orden: 1,
  activo: true
});

assert.equal(habilidadValida.valida, true);

const habilidadIntegranteValida = validarContenidoEntidad("habilidadIntegrante", {
  integranteId: "integrante-demo",
  habilidadId: "habilidad-demo",
  nivelVisual: 85,
  tipoAnimacion: "barra_progreso",
  velocidadAnimacion: 1,
  orden: 1,
  activo: true
});

assert.equal(habilidadIntegranteValida.valida, true);

const habilidadIntegranteInvalida = validarContenidoEntidad("habilidadIntegrante", {
  integranteId: "integrante-demo",
  habilidadId: "habilidad-demo",
  nivelVisual: 140
});

assert.equal(habilidadIntegranteInvalida.valida, false);

const renderValido = validarSolicitudRender({
  presentacionId: "presentacion-demo",
  formato: "ambos",
  origen: "github_actions",
  calidad: "rapida"
});

assert.equal(renderValido.valida, true);

const renderInvalido = validarSolicitudRender({
  presentacionId: "",
  formato: "cuadrado",
  origen: "servidor_pagado",
  calidad: "pesada"
});

assert.equal(renderInvalido.valida, false);
assert.equal(renderInvalido.errores.length, 4);

console.log("Pruebas de validaciones completadas.");
