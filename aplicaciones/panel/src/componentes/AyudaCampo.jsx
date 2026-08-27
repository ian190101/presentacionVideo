import { HelpCircle } from "lucide-react";

export function AyudaCampo({ ayuda }) {
  if (!ayuda) {
    return null;
  }

  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-cyan-50 hover:text-robot-cian"
        aria-label={`Ayuda: ${ayuda.titulo}`}
      >
        <HelpCircle size={14} aria-hidden="true" />
      </button>
      <span className="pointer-events-none absolute left-1/2 top-7 z-30 hidden w-72 -translate-x-1/2 rounded-md border border-slate-200 bg-white p-3 text-left shadow-panel group-hover:block group-focus-within:block">
        <strong className="block text-xs font-semibold text-slate-900">{ayuda.titulo}</strong>
        <span className="mt-1 block text-xs leading-5 text-slate-600">{ayuda.descripcion}</span>
        <span className="mt-2 block rounded bg-slate-50 px-2 py-1 text-[11px] leading-4 text-slate-500">
          {ayuda.ejemplo}
        </span>
      </span>
    </span>
  );
}
