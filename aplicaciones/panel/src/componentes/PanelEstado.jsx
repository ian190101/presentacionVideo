import { Mic, RefreshCw, Video } from "lucide-react";
import { AyudaCampo } from "./AyudaCampo.jsx";
import { BotonIcono } from "./BotonIcono.jsx";
import { mostrarOperacionExitosa } from "../servicios/servicioAlerta.js";
import { generarNarracionDemoOApi } from "../servicios/servicioNarracionPanel.js";
import { prepararTextoNarracion } from "../utilidades/narracion.js";

export function PanelEstado({ sesion, presentacion, seccionesActivas = [], ayudas, onGenerarVideo }) {
  const duracionEstimada = calcularDuracionEstimada(seccionesActivas, presentacion.duracionEstimada);
  const textoNarracion = prepararTextoNarracion(seccionesActivas);
  const totalPalabras = contarPalabras(textoNarracion);

  async function generarNarracion() {
    const resultado = await generarNarracionDemoOApi({
      token: sesion.token,
      presentacionId: presentacion.id,
      texto: textoNarracion,
      voz: presentacion.vozNarracion,
      velocidad: Number.parseFloat(presentacion.velocidadNarracion) || 1,
      idioma: presentacion.idiomaNarracion || "es"
    });

    await mostrarOperacionExitosa({
      titulo: "Narracion preparada",
      mensaje: resultado.mensaje || "La narracion fue procesada correctamente.",
      detalles: `Modo: ${resultado.modo}\nHash: ${resultado.hashNarracion}`,
      colores: {
        colorPrimario: presentacion.colorPrimario,
        colorSecundario: presentacion.colorSecundario
      }
    });
  }

  return (
    <div className="grid gap-4">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-950">
            Narracion TTS
            <AyudaCampo ayuda={ayudas.narracion} />
          </h2>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            Pendiente
          </span>
        </div>
        <div className="mb-4 flex h-16 items-center gap-1 overflow-hidden rounded-md bg-cyan-50 px-3">
          {Array.from({ length: 42 }).map((_, indice) => (
            <span
              key={indice}
              className="w-1 rounded-full"
              style={{
                height: `${18 + ((indice * 11) % 38)}px`,
                backgroundColor: presentacion.colorSecundario
              }}
            />
          ))}
        </div>
        <p className="mb-3 text-sm text-slate-600">
          Idioma: {presentacion.idiomaNarracion || "es"} · Voz: {presentacion.vozNarracion} · Velocidad: {presentacion.velocidadNarracion}
        </p>
        <div className="mb-3 rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold text-slate-500">
            <span>Texto preparado</span>
            <span>{totalPalabras} palabras</span>
          </div>
          <p className="max-h-24 overflow-auto text-sm leading-6 text-slate-700">
            {textoNarracion || "Sin texto de narracion disponible."}
          </p>
        </div>
        <BotonIcono icono={Mic} onClick={generarNarracion}>Generar narracion</BotonIcono>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-950">
            Estado de render
            <AyudaCampo ayuda={ayudas.formato} />
          </h2>
          <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
            En espera
          </span>
        </div>
        <ul className="mb-4 space-y-3 text-sm text-slate-600">
          <li className="flex justify-between">
            <span>Formato</span>
            <strong className="text-slate-900">{presentacion.formatoPreferido}</strong>
          </li>
          <li className="flex justify-between">
            <span>Duracion estimada</span>
            <strong className="text-slate-900">{duracionEstimada}</strong>
          </li>
          <li className="flex justify-between">
            <span>Calidad</span>
            <strong className="text-slate-900">{presentacion.calidadRender || "rapida"}</strong>
          </li>
          <li className="flex justify-between">
            <span>Render final</span>
            <strong className="text-slate-900">Local o GitHub Actions</strong>
          </li>
        </ul>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <BotonIcono icono={RefreshCw}>Validar cambios</BotonIcono>
          <BotonIcono icono={Video} variante="primario" colorPrimario={presentacion.colorPrimario} onClick={onGenerarVideo}>
            Generar video
          </BotonIcono>
        </div>
      </section>
    </div>
  );
}

function contarPalabras(texto) {
  const coincidencias = String(texto || "").match(/[A-Za-zÀ-ÿ0-9]+(?:['-][A-Za-zÀ-ÿ0-9]+)?/g);
  return coincidencias?.length || 0;
}

function calcularDuracionEstimada(secciones, respaldo) {
  const totalSegundos = secciones.reduce((total, seccion) => total + Number(seccion.duracionSugeridaSegundos || 5), 0);

  if (!totalSegundos) {
    return respaldo;
  }

  const minutos = Math.floor(totalSegundos / 60);
  const segundos = totalSegundos % 60;

  return `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
}
