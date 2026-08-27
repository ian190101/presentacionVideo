import {
  Archive,
  FileVideo,
  FolderKanban,
  HelpCircle,
  Home,
  Image,
  Mic,
  Settings,
  ShieldCheck,
  X,
  Users
} from "lucide-react";

const opciones = [
  ["Presentacion", Home],
  ["Secciones", FolderKanban],
  ["Biblioteca", Archive],
  ["Medios", Image],
  ["Narraciones", Mic],
  ["Videos", FileVideo],
  ["Usuarios", Users],
  ["Auditoria", ShieldCheck],
  ["Ajustes", Settings]
];

export function BarraLateral({ abierta = false, onCerrar, colorPrimario = "#d40511" }) {
  const contenido = (
    <>
      <div className="border-b border-white/10 px-5 py-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-md border border-white/20 bg-white/5 text-xl">
              MR
            </div>
            <div>
              <p className="text-lg font-black tracking-wide" style={{ color: colorPrimario }}>
                MR ROBOT
              </p>
              <p className="text-xs font-semibold tracking-[0.24em] text-slate-300">BOLIVIA</p>
            </div>
          </div>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-md border border-white/10 text-slate-200 lg:hidden"
            onClick={onCerrar}
            aria-label="Cerrar menu"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4">
        {opciones.map(([texto, Icono], indice) => (
          <button
            key={texto}
            type="button"
            onClick={onCerrar}
            className={`mb-1 flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm transition ${
              indice === 0 ? "text-white" : "text-slate-300 hover:bg-white/8 hover:text-white"
            }`}
            style={indice === 0 ? { backgroundColor: colorPrimario } : undefined}
          >
            <Icono size={18} aria-hidden="true" />
            {texto}
          </button>
        ))}
      </nav>
      <div className="m-3 rounded-md border border-white/10 bg-white/5 p-4 text-sm">
        <div className="mb-2 flex items-center gap-2 font-semibold">
          <HelpCircle size={17} />
          Necesitas ayuda?
        </div>
        <p className="text-xs leading-5 text-slate-300">
          Usa los botones ? junto a cada campo para ver ejemplos concretos.
        </p>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden min-h-screen w-64 shrink-0 bg-robot-tinta text-white lg:flex lg:flex-col">
        {contenido}
      </aside>
      {abierta && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/55"
            onClick={onCerrar}
            aria-label="Cerrar menu por fondo"
          />
          <aside className="relative flex h-full w-[min(20rem,86vw)] flex-col bg-robot-tinta text-white shadow-2xl">
            {contenido}
          </aside>
        </div>
      )}
    </>
  );
}
