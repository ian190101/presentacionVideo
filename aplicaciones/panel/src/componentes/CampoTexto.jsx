import { AyudaCampo } from "./AyudaCampo.jsx";

export function CampoTexto({
  etiqueta,
  ayuda,
  valor,
  onChange,
  placeholder,
  multilinea = false,
  maximo,
  requerido = false
}) {
  const id = etiqueta.toLowerCase().replace(/\s+/g, "-");
  const clases =
    "w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 hover:border-slate-300 focus:border-robot-cian";

  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
        {etiqueta}
        {requerido && <span className="text-robot-rojo">*</span>}
        <AyudaCampo ayuda={ayuda} />
      </span>
      {multilinea ? (
        <textarea
          id={id}
          className={`${clases} min-h-24 resize-y`}
          value={valor}
          onChange={(evento) => onChange(evento.target.value)}
          placeholder={placeholder}
          maxLength={maximo}
        />
      ) : (
        <input
          id={id}
          className={clases}
          value={valor}
          onChange={(evento) => onChange(evento.target.value)}
          placeholder={placeholder}
          maxLength={maximo}
        />
      )}
      {maximo && (
        <span className="mt-1 block text-right text-xs text-slate-400">
          {valor.length}/{maximo}
        </span>
      )}
    </label>
  );
}
