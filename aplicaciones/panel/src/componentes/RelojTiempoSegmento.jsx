import { ChevronDown, ChevronUp, Clock3 } from "lucide-react";
import { AyudaCampo } from "./AyudaCampo.jsx";

const MINIMO_SEGUNDOS = 3;
const MAXIMO_SEGUNDOS = 60;

export function RelojTiempoSegmento({
  valorSegundos = 5,
  onChange,
  ayuda,
  colorPrimario = "#d40511",
  colorSecundario = "#22c7dd"
}) {
  const segundosNormalizados = limitarSegundos(valorSegundos);
  const minutos = Math.floor(segundosNormalizados / 60);
  const segundos = segundosNormalizados % 60;
  const colorTextoActivo = obtenerColorTextoActivo(colorPrimario, colorSecundario);

  function actualizarTiempo(nuevosMinutos, nuevosSegundos) {
    onChange(limitarSegundos(nuevosMinutos * 60 + nuevosSegundos));
  }

  function ajustar(delta) {
    onChange(limitarSegundos(segundosNormalizados + delta));
  }

  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Clock3 size={16} style={{ color: colorSecundario }} aria-hidden="true" />
          Tiempo
          <AyudaCampo ayuda={ayuda} />
        </span>
        <strong
          className="rounded-full px-2.5 py-1 text-xs"
          style={{ backgroundColor: colorPrimario, color: colorTextoActivo }}
        >
          {formatearTiempo(segundosNormalizados)}
        </strong>
      </div>

      <div
        className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-lg border bg-white p-2"
        style={{ borderColor: `${colorSecundario}55` }}
      >
        <RuedaNumero
          etiqueta="Minutos"
          valor={minutos}
          maximo={0}
          onSubir={() => actualizarTiempo(minutos + 1, segundos)}
          onBajar={() => actualizarTiempo(minutos - 1, segundos)}
          colorPrimario={colorPrimario}
          colorSecundario={colorSecundario}
          colorTextoActivo={colorTextoActivo}
        />
        <span className="pb-6 text-2xl font-black text-slate-400">:</span>
        <RuedaNumero
          etiqueta="Segundos"
          valor={segundos}
          maximo={59}
          onSubir={() => actualizarTiempo(minutos, segundos + 1)}
          onBajar={() => actualizarTiempo(minutos, segundos - 1)}
          colorPrimario={colorPrimario}
          colorSecundario={colorSecundario}
          colorTextoActivo={colorTextoActivo}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          className="min-h-9 rounded-md border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          onClick={() => ajustar(-1)}
        >
          -1 s
        </button>
        <button
          type="button"
          className="min-h-9 rounded-md border text-sm font-semibold transition"
          style={{ backgroundColor: colorPrimario, borderColor: colorPrimario, color: colorTextoActivo }}
          onClick={() => ajustar(1)}
        >
          +1 s
        </button>
      </div>
    </div>
  );
}

function RuedaNumero({ etiqueta, valor, onSubir, onBajar, colorPrimario, colorSecundario, colorTextoActivo }) {
  return (
    <div className="grid justify-items-center gap-1">
      <button
        type="button"
        className="grid h-7 w-9 place-items-center rounded-md transition hover:bg-slate-100"
        style={{ color: colorSecundario }}
        onClick={onSubir}
        aria-label={`Aumentar ${etiqueta.toLowerCase()}`}
      >
        <ChevronUp size={18} aria-hidden="true" />
      </button>
      <div
        className="relative grid h-14 w-full place-items-center overflow-hidden rounded-md"
        style={{ backgroundColor: colorPrimario }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-4" style={{ background: crearGradiente(colorPrimario, "abajo") }} />
        <span className="text-3xl font-black tabular-nums" style={{ color: colorTextoActivo }}>
          {String(valor).padStart(2, "0")}
        </span>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-4" style={{ background: crearGradiente(colorPrimario, "arriba") }} />
      </div>
      <button
        type="button"
        className="grid h-7 w-9 place-items-center rounded-md transition hover:bg-slate-100"
        style={{ color: colorSecundario }}
        onClick={onBajar}
        aria-label={`Disminuir ${etiqueta.toLowerCase()}`}
      >
        <ChevronDown size={18} aria-hidden="true" />
      </button>
      <span className="text-[11px] font-semibold text-slate-500">{etiqueta}</span>
    </div>
  );
}

function limitarSegundos(valor) {
  return Math.max(MINIMO_SEGUNDOS, Math.min(MAXIMO_SEGUNDOS, Number(valor) || 5));
}

function formatearTiempo(totalSegundos) {
  const minutos = Math.floor(totalSegundos / 60);
  const segundos = totalSegundos % 60;
  return `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
}

function obtenerColorTextoActivo(colorPrimario, colorSecundario) {
  if (!esHexValido(colorSecundario) || !esHexValido(colorPrimario)) {
    return "#ffffff";
  }

  const contrasteSecundario = calcularContraste(colorPrimario, colorSecundario);

  if (contrasteSecundario >= 4.5) {
    return colorSecundario;
  }

  return calcularContraste(colorPrimario, "#ffffff") >= calcularContraste(colorPrimario, "#0f172a")
    ? "#ffffff"
    : "#0f172a";
}

function calcularContraste(colorA, colorB) {
  const luminanciaA = calcularLuminancia(colorA);
  const luminanciaB = calcularLuminancia(colorB);
  const claro = Math.max(luminanciaA, luminanciaB);
  const oscuro = Math.min(luminanciaA, luminanciaB);

  return (claro + 0.05) / (oscuro + 0.05);
}

function calcularLuminancia(hex) {
  const valores = [1, 3, 5].map((inicio) => {
    const canal = parseInt(hex.slice(inicio, inicio + 2), 16) / 255;
    return canal <= 0.03928 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * valores[0] + 0.7152 * valores[1] + 0.0722 * valores[2];
}

function esHexValido(valor) {
  return /^#[0-9a-f]{6}$/i.test(valor || "");
}

function crearGradiente(color, direccion) {
  const sentido = direccion === "arriba" ? "to top" : "to bottom";
  return `linear-gradient(${sentido}, ${color}, transparent)`;
}
