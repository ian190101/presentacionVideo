import { Mic, RefreshCw, Video } from "lucide-react";
import { AyudaCampo } from "./AyudaCampo.jsx";
import { BotonIcono } from "./BotonIcono.jsx";
import { mostrarOperacionExitosa } from "../servicios/servicioAlerta.js";
import { generarNarracionDemoOApi } from "../servicios/servicioNarracionPanel.js";

export function PanelEstado({ sesion, presentacion, seccionesActivas = [], ayudas, onGenerarVideo }) {
  const duracionEstimada = calcularDuracionEstimada(seccionesActivas, presentacion.duracionEstimada);

  async function generarNarracion() {
    const texto = seccionesActivas.map((seccion) => seccion.narracion || seccion.descripcion).join(" ");
    const resultado = await generarNarracionDemoOApi({
      token: sesion.token,
      presentacionId: presentacion.id,
      texto,
      voz: presentacion.vozNarracion,
      velocidad: Number.parseFloat(presentacion.velocidadNarracion) || 1
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
          Voz: {presentacion.vozNarracion} · Velocidad: {presentacion.velocidadNarracion}
        </p>
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

function calcularDuracionEstimada(secciones, respaldo) {
  const totalSegundos = secciones.reduce((total, seccion) => total + Number(seccion.duracionSugeridaSegundos || 5), 0);

  if (!totalSegundos) {
    return respaldo;
  }

  const minutos = Math.floor(totalSegundos / 60);
  const segundos = totalSegundos % 60;

  return `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
}
