import { Monitor, Smartphone } from "lucide-react";
import { AyudaCampo } from "./AyudaCampo.jsx";

const formatos = [
  { valor: "horizontal", etiqueta: "Horizontal 16:9", detalle: "1920 x 1080", icono: Monitor },
  { valor: "vertical", etiqueta: "Vertical 9:16", detalle: "1080 x 1920", icono: Smartphone }
];

export function SelectorFormato({ valor, onChange, ayuda, colorSecundario = "#22c7dd" }) {
  return (
    <fieldset>
      <legend className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
        Formato
        <AyudaCampo ayuda={ayuda} />
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {formatos.map((formato) => {
          const Icono = formato.icono;
          const activo = valor === formato.valor;

          return (
            <button
              key={formato.valor}
              type="button"
              onClick={() => onChange(formato.valor)}
              className={`flex min-h-16 items-center justify-between rounded-md border px-4 py-3 text-left transition ${
                activo
                  ? "bg-cyan-50 text-slate-950"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
              style={activo ? { borderColor: colorSecundario } : undefined}
            >
              <span className="flex items-center gap-3">
                <Icono size={21} aria-hidden="true" />
                <span>
                  <span className="block text-sm font-semibold">{formato.etiqueta}</span>
                  <span className="block text-xs text-slate-500">{formato.detalle}</span>
                </span>
              </span>
              <span
                className={`h-4 w-4 rounded-full border ${
                  activo ? "shadow-[inset_0_0_0_4px_white]" : "border-slate-300"
                }`}
                style={activo ? { borderColor: colorSecundario, backgroundColor: colorSecundario } : undefined}
              />
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
