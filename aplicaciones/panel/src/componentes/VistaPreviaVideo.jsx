import { Maximize2, Play, Volume2 } from "lucide-react";
import { obtenerEtiquetaFormato, obtenerResolucionFormato } from "../utilidades/formatos.js";
import { AyudaCampo } from "./AyudaCampo.jsx";

export function VistaPreviaVideo({ presentacion, seccionesActivas, ayudas, assets = [] }) {
  const fondoA = oscurecer(presentacion.colorPrimario, 0.24);
  const fondoB = oscurecer(presentacion.colorSecundario, 0.2);
  const duracionEstimada = calcularDuracionEstimada(seccionesActivas, presentacion.duracionEstimada);
  const logo = obtenerAssetPrincipal(assets, "logo");

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-950">
        Vista previa del video
        <AyudaCampo ayuda={ayudas.formato} />
      </h2>
      <div className="overflow-hidden rounded-md border border-slate-900" style={{ background: fondoA }}>
        <div
          className={`relative mx-auto grid place-items-center ${
            presentacion.formatoPreferido === "vertical" ? "aspect-[9/16] max-h-[520px]" : "aspect-video"
          }`}
          style={{
            background: `radial-gradient(circle at center, ${presentacion.colorPrimario}44, transparent 38%), linear-gradient(145deg, ${fondoA}, ${fondoB})`
          }}
        >
          <div
            className="absolute inset-0 opacity-40 [background-size:24px_24px]"
            style={{
              backgroundImage: `linear-gradient(${presentacion.colorPrimario}38 1px, transparent 1px), linear-gradient(90deg, ${presentacion.colorSecundario}33 1px, transparent 1px)`
            }}
          />
          <div className="relative text-center">
            {presentacion.mostrarLogoEnVideo !== false && (
              logo ? (
                <img
                  src={logo.urlPublica}
                  alt="Logo principal"
                  className="mx-auto mb-5 object-contain"
                  style={{
                    width: `${Math.max(48, Math.min(180, Number(presentacion.logoTamano || 100)))}px`,
                    height: `${Math.max(48, Math.min(180, Number(presentacion.logoTamano || 100)))}px`,
                    borderRadius: `${Number(presentacion.logoRadioBorde) || 0}%`,
                    opacity: Math.max(0.2, Math.min(1, (Number(presentacion.logoOpacidad) || 100) / 100))
                  }}
                />
              ) : (
                <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-md border border-white/30 text-3xl text-white">
                  MR
                </div>
              )
            )}
            <p className="text-3xl font-black tracking-wide" style={{ color: presentacion.colorPrimario }}>
              MR ROBOT
            </p>
            <p className="mt-1 text-sm font-bold tracking-[0.38em] text-white">BOLIVIA</p>
            <p className="mt-5 max-w-xs text-sm leading-6 text-slate-300">{presentacion.empresaObjetivo}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 border-t border-white/10 px-4 py-3 text-white" style={{ background: fondoA }}>
          <Play size={18} aria-hidden="true" />
          <div className="h-1 flex-1 rounded-full bg-white/20">
            <div className="h-1 w-1/3 rounded-full" style={{ backgroundColor: presentacion.colorPrimario }} />
          </div>
          <span className="text-xs">00:00 / {duracionEstimada}</span>
          <Volume2 size={17} aria-hidden="true" />
          <Maximize2 size={17} aria-hidden="true" />
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-md bg-slate-50 p-3">
          <dt className="text-xs text-slate-500">Formato</dt>
          <dd className="font-semibold text-slate-900">{obtenerEtiquetaFormato(presentacion.formatoPreferido)}</dd>
        </div>
        <div className="rounded-md bg-slate-50 p-3">
          <dt className="text-xs text-slate-500">Resolucion</dt>
          <dd className="font-semibold text-slate-900">{obtenerResolucionFormato(presentacion.formatoPreferido)}</dd>
        </div>
        <div className="rounded-md bg-slate-50 p-3">
          <dt className="text-xs text-slate-500">Secciones activas</dt>
          <dd className="font-semibold text-slate-900">{seccionesActivas.length}</dd>
        </div>
        <div className="rounded-md bg-slate-50 p-3">
          <dt className="text-xs text-slate-500">Estado</dt>
          <dd className="font-semibold" style={{ color: presentacion.colorSecundario }}>
            Listo para preview
          </dd>
        </div>
      </dl>
    </section>
  );
}

function obtenerAssetPrincipal(assets, tipo) {
  return assets
    .filter((asset) => asset.tipo === tipo && asset.urlPublica)
    .sort((a, b) => String(b.fechaActualizacion || "").localeCompare(String(a.fechaActualizacion || "")))[0];
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

function oscurecer(hex, factor) {
  if (!/^#[0-9a-f]{6}$/i.test(hex || "")) {
    return "rgb(34, 41, 59)";
  }

  const rojo = Math.round(parseInt(hex.slice(1, 3), 16) * factor);
  const verde = Math.round(parseInt(hex.slice(3, 5), 16) * factor);
  const azul = Math.round(parseInt(hex.slice(5, 7), 16) * factor);

  return `rgb(${rojo}, ${verde}, ${azul})`;
}
