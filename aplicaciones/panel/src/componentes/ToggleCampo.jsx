import { AyudaCampo } from "./AyudaCampo.jsx";

export function ToggleCampo({ etiqueta, ayuda, activo, onChange, colorSecundario = "#22c7dd" }) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-sm text-slate-600">
        {etiqueta}
        <AyudaCampo ayuda={ayuda} />
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={activo}
        onClick={() => onChange(!activo)}
        className="relative h-6 w-11 rounded-full transition"
        style={{ backgroundColor: activo ? colorSecundario : "#cbd5e1" }}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
            activo ? "left-6" : "left-1"
          }`}
        />
      </button>
    </label>
  );
}
