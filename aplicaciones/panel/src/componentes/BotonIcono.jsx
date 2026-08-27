export function BotonIcono({
  icono: Icono,
  children,
  variante = "secundario",
  colorPrimario = "#d40511",
  ...props
}) {
  const estilos = {
    primario: "text-white border-transparent",
    secundario: "bg-white text-slate-700 hover:bg-slate-50 border-slate-200",
    tenue: "bg-slate-100 text-slate-700 hover:bg-slate-200 border-transparent"
  };

  return (
    <button
      type="button"
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold transition ${estilos[variante]}`}
      style={variante === "primario" ? { backgroundColor: colorPrimario } : undefined}
      {...props}
    >
      {Icono && <Icono size={17} aria-hidden="true" />}
      {children}
    </button>
  );
}
