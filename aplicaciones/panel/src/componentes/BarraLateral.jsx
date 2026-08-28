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
  ["presentacion", "Presentacion", Home],
  ["secciones", "Secciones", FolderKanban],
  ["biblioteca", "Biblioteca", Archive],
  ["medios", "Medios", Image],
  ["narraciones", "Narraciones", Mic],
  ["videos", "Videos", FileVideo],
  ["usuarios", "Usuarios", Users],
  ["auditoria", "Auditoria", ShieldCheck],
  ["ajustes", "Ajustes", Settings]
];

export function BarraLateral({
  abierta = false,
  onCerrar,
  onNavegar,
  seccionActiva = "presentacion",
  colorPrimario = "#d40511",
  colorSecundario = "#22c7dd",
  logoUrl = ""
}) {
  function manejarNavegacion(id) {
    onNavegar?.(id);
    onCerrar?.();
  }

  const contenido = (
    <>
      <div className="border-b border-white/10 px-5 py-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo de Mr Robot Bolivia"
                className="h-11 w-11 object-contain"
              />
            ) : (
              <div className="grid h-11 w-11 place-items-center rounded-md border border-white/20 bg-white/5 text-xl">
                MR
              </div>
            )}
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
      <nav className="px-3 py-4">
        {opciones.map(([id, texto, Icono]) => {
          const activa = seccionActiva === id;
          const estiloActivo = activa
            ? {
                backgroundColor: colorPrimario,
                color: obtenerColorTextoActivo(colorPrimario, colorSecundario)
              }
            : undefined;

          return (
          <button
            key={texto}
            type="button"
            onClick={() => manejarNavegacion(id)}
            className={`mb-1 flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm transition ${
              activa ? "font-semibold" : "text-slate-300 hover:bg-white/8 hover:text-white"
            }`}
            style={estiloActivo}
          >
            <Icono size={18} aria-hidden="true" />
            {texto}
          </button>
          );
        })}
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
      <aside className="hidden w-64 shrink-0 self-start bg-robot-tinta text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
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
