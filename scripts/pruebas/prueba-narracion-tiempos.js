import assert from "node:assert/strict";
import {
  ajustarDuracionesSeccionesPorNarracion,
  prepararTextoNarracion
} from "../../aplicaciones/panel/src/utilidades/narracion.js";
import { prepararBloquesNarracion } from "../renderizar-video/generarAudioPiper.js";
import { obtenerVozPiper } from "../renderizar-video/vocesPiper.js";

const secciones = [
  {
    titulo: "Introduccion",
    descripcion: "Texto visible cuando no hay narracion explicita.",
    narracion: "",
    activaEnVideo: true,
    duracionSugeridaSegundos: 4
  },
  {
    titulo: "Detalle",
    descripcion: "Descripcion corta.",
    narracion: "Esta narracion tiene muchas palabras para comprobar que el segmento crece y no comprime el audio al renderizar el video final.",
    activaEnVideo: true,
    duracionSugeridaSegundos: 4
  }
];

const texto = prepararTextoNarracion(secciones);
const ajustadas = ajustarDuracionesSeccionesPorNarracion(secciones, {
  velocidadNarracion: "1",
  palabrasPorMinutoNarracion: 90
});

assert.match(texto, /Texto visible cuando no hay narracion explicita/);
assert.equal(ajustadas.length, 2);
assert.equal(ajustadas[0].duracionSugeridaSegundos >= secciones[0].duracionSugeridaSegundos, true);
assert.equal(ajustadas[1].duracionSugeridaSegundos > secciones[1].duracionSugeridaSegundos, true);
assert.equal(obtenerVozPiper("es_MX-ald-medium").region, "MX");
assert.equal(obtenerVozPiper("voz-inexistente").id, "es_MX-ald-medium");

const bloques = prepararBloquesNarracion({
  textoNarracion: "Texto completo que no debe tener prioridad.",
  narracionSecciones: [
    { orden: 1, tipo: "intro", texto: "Primera seccion" },
    { orden: 2, tipo: "cierre", texto: "Segunda seccion" }
  ]
});

assert.equal(bloques.length, 2);
assert.equal(bloques[0].texto, "Primera seccion.");

console.log("Prueba de narracion y tiempos completada.");
