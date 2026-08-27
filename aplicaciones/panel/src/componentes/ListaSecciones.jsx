import { GripVertical, Play, Plus, Trash2 } from "lucide-react";
import { AyudaCampo } from "./AyudaCampo.jsx";
import { BotonIcono } from "./BotonIcono.jsx";
import { RelojTiempoSegmento } from "./RelojTiempoSegmento.jsx";
import { ToggleCampo } from "./ToggleCampo.jsx";

export function ListaSecciones({
  secciones,
  setSecciones,
  ayudas,
  colorPrimario = "#d40511",
  colorSecundario = "#22c7dd"
}) {
  function actualizarSeccion(id, campo, valor) {
    setSecciones((actuales) =>
      actuales.map((seccion) => (seccion.id === id ? { ...seccion, [campo]: valor } : seccion))
    );
  }

  function eliminarSeccion(id) {
    setSecciones((actuales) =>
      actuales
        .filter((seccion) => seccion.id !== id)
        .map((seccion, indice) => ({ ...seccion, orden: indice + 1 }))
    );
  }

  function agregarSeccion() {
    setSecciones((actuales) => [
      ...actuales,
      {
        id: `seccion-${Date.now()}`,
        orden: actuales.length + 1,
        tipo: "personalizada",
        titulo: "Nueva seccion",
        descripcion: "Describe el contenido de esta seccion.",
        activaEnVideo: true,
        visibleEnPreview: true,
        narracion: "",
        animacion: "Entrada simple",
        duracionSugeridaSegundos: 5
      }
    ]);
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-950">
            Secciones del video
            <AyudaCampo ayuda={ayudas.seccionActiva} />
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Agrega, edita, desactiva o elimina secciones segun la presentacion.
          </p>
        </div>
        <BotonIcono icono={Plus} onClick={agregarSeccion}>Agregar seccion</BotonIcono>
      </div>

      <div className="space-y-3">
        {secciones.map((seccion) => (
          <article
            key={seccion.id}
            className="grid gap-3 rounded-md border border-slate-200 bg-white p-3 transition hover:border-slate-300 md:grid-cols-[36px_minmax(0,1fr)]"
          >
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <GripVertical size={17} aria-hidden="true" />
              <span>{seccion.orden}</span>
            </div>
            <div>
              <input
                className="w-full rounded border border-transparent bg-transparent px-1 py-1 text-sm font-semibold text-slate-900 transition hover:border-slate-200 focus:border-robot-cian"
                value={seccion.titulo}
                onChange={(evento) => actualizarSeccion(seccion.id, "titulo", evento.target.value)}
                aria-label={`Titulo de ${seccion.titulo}`}
              />
              <textarea
                className="mt-1 w-full resize-none rounded border border-transparent bg-transparent px-1 py-1 text-xs leading-5 text-slate-500 transition hover:border-slate-200 focus:border-robot-cian"
                value={seccion.descripcion}
                rows={2}
                onChange={(evento) => actualizarSeccion(seccion.id, "descripcion", evento.target.value)}
                aria-label={`Descripcion de ${seccion.titulo}`}
              />
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
                <span className="rounded bg-slate-100 px-2 py-1">{seccion.tipo}</span>
                <span className="rounded bg-cyan-50 px-2 py-1 text-cyan-700">{seccion.animacion}</span>
              </div>
            </div>
            <div className="grid gap-3 md:col-start-2 md:grid-cols-2">
              <ToggleCampo
                etiqueta="Activa en video"
                ayuda={ayudas.seccionActiva}
                activo={seccion.activaEnVideo}
                onChange={(valor) => actualizarSeccion(seccion.id, "activaEnVideo", valor)}
                colorSecundario={colorSecundario}
              />
              <ToggleCampo
                etiqueta="Vista previa"
                ayuda={ayudas.vistaPrevia}
                activo={seccion.visibleEnPreview}
                onChange={(valor) => actualizarSeccion(seccion.id, "visibleEnPreview", valor)}
                colorSecundario={colorSecundario}
              />
            </div>
            <div className="md:col-start-2">
              <RelojTiempoSegmento
                valorSegundos={seccion.duracionSugeridaSegundos || 5}
                onChange={(valor) => actualizarSeccion(seccion.id, "duracionSugeridaSegundos", valor)}
                ayuda={ayudas.tiempoSegmento}
                colorPrimario={colorPrimario}
                colorSecundario={colorSecundario}
              />
            </div>
            <div className="flex items-center gap-2 md:col-start-2">
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                aria-label={`Previsualizar ${seccion.titulo}`}
              >
                <Play size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => eliminarSeccion(seccion.id)}
                className="grid h-10 w-10 place-items-center rounded-md border border-red-100 text-red-600 transition hover:bg-red-50"
                aria-label={`Eliminar ${seccion.titulo}`}
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
