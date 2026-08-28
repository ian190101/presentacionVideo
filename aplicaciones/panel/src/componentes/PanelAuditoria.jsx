import { RefreshCw, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { listarEventosAuditoriaPanel } from "../servicios/servicioAuditoriaPanel.js";

export function PanelAuditoria({ sesion, colorPrimario = "#d40511", colorSecundario = "#22c7dd" }) {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function cargarEventos() {
    setCargando(true);
    setError("");

    try {
      const datos = await listarEventosAuditoriaPanel({ sesion, limite: 30 });
      setEventos(datos);
    } catch (errorActual) {
      setError(errorActual.message || "No se pudieron cargar los eventos.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarEventos();
  }, [sesion?.token]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
      <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} style={{ color: colorSecundario }} aria-hidden="true" />
            <h2 className="text-lg font-bold text-slate-950">Auditoria</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">Eventos recientes registrados por el Worker.</p>
        </div>
        <button
          type="button"
          onClick={cargarEventos}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <RefreshCw size={16} className={cargando ? "animate-spin" : ""} aria-hidden="true" />
          Actualizar
        </button>
      </div>

      {error && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {sesion.modoDemo ? (
        <EstadoVacio texto="En modo demo no se consultan eventos de Supabase." />
      ) : eventos.length === 0 ? (
        <EstadoVacio texto={cargando ? "Cargando eventos..." : "Aun no hay eventos registrados."} />
      ) : (
        <div className="grid gap-2">
          {eventos.map((evento) => (
            <article key={evento.id} className="rounded-md border border-slate-200 p-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">{formatearAccion(evento.accion)}</p>
                  <p className="text-xs text-slate-500">{evento.entidad_tipo} {evento.entidad_id ? `- ${evento.entidad_id}` : ""}</p>
                </div>
                <time className="text-xs font-semibold text-slate-500">{formatearFecha(evento.fecha_creacion)}</time>
              </div>
              <pre
                className="mt-2 max-h-28 overflow-auto rounded-md bg-slate-50 p-2 text-xs text-slate-600"
                style={{ borderLeft: `3px solid ${colorPrimario}` }}
              >
                {JSON.stringify(evento.detalle || {}, null, 2)}
              </pre>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function EstadoVacio({ texto }) {
  return (
    <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
      {texto}
    </div>
  );
}

function formatearAccion(valor) {
  return String(valor || "")
    .replace(/_/g, " ")
    .replace(/^\w/, (letra) => letra.toUpperCase());
}

function formatearFecha(valor) {
  if (!valor) {
    return "";
  }

  return new Intl.DateTimeFormat("es-BO", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(valor));
}
