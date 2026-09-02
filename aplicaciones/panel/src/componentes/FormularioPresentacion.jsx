import { Save, Video } from "lucide-react";
import { AyudaCampo } from "./AyudaCampo.jsx";
import { BotonIcono } from "./BotonIcono.jsx";
import { CampoTexto } from "./CampoTexto.jsx";
import { SelectorFormato } from "./SelectorFormato.jsx";
import { idiomasNarracion, vocesKokoro } from "../datos/opcionesConfiguracion.js";

export function FormularioPresentacion({ presentacion, setPresentacion, ayudas, onGuardar, onGenerarVideo }) {
  function actualizar(campo, valor) {
    setPresentacion((actual) => ({ ...actual, [campo]: valor }));
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-950">Configuracion de la presentacion</h1>
          <p className="mt-1 text-sm text-slate-500">
            Edita contenido, narracion y formato sin tocar codigo.
          </p>
        </div>
        <div className="flex gap-2">
          <BotonIcono icono={Save} onClick={onGuardar}>Guardar presentacion</BotonIcono>
          <BotonIcono icono={Video} variante="primario" colorPrimario={presentacion.colorPrimario} onClick={onGenerarVideo}>
            Generar video
          </BotonIcono>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <CampoTexto
          etiqueta="Nombre de la presentacion"
          ayuda={ayudas.empresaObjetivo}
          valor={presentacion.nombre}
          onChange={(valor) => actualizar("nombre", valor)}
          maximo={120}
          requerido
        />
        <CampoTexto
          etiqueta="Empresa objetivo"
          ayuda={ayudas.empresaObjetivo}
          valor={presentacion.empresaObjetivo}
          onChange={(valor) => actualizar("empresaObjetivo", valor)}
          maximo={160}
          requerido
        />
        <div className="lg:col-span-2">
          <CampoTexto
            etiqueta="Descripcion"
            valor={presentacion.descripcion}
            onChange={(valor) => actualizar("descripcion", valor)}
            placeholder="Describe el enfoque comercial de esta presentacion."
            multilinea
            maximo={260}
          />
        </div>
        <SelectorFormato
          valor={presentacion.formatoPreferido}
          onChange={(valor) => actualizar("formatoPreferido", valor)}
          ayuda={ayudas.formato}
          colorSecundario={presentacion.colorSecundario}
        />
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
            Calidad de render
            <AyudaCampo ayuda={ayudas.calidadRender} />
          </span>
          <select
            value={presentacion.calidadRender || "rapida"}
            onChange={(evento) => actualizar("calidadRender", evento.target.value)}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition hover:border-slate-300 focus:border-robot-cian"
          >
            <option value="rapida">Rapida - pruebas y revisiones</option>
            <option value="equilibrada">Equilibrada - buena calidad con menor espera</option>
            <option value="alta">Alta - render final pesado</option>
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              Color primario
              <AyudaCampo ayuda={ayudas.colorPrimario} />
            </span>
            <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2">
              <input
                type="color"
                value={presentacion.colorPrimario}
                onChange={(evento) => actualizar("colorPrimario", evento.target.value)}
                className="h-9 w-12 cursor-pointer rounded border border-slate-200 bg-white"
                aria-label="Color primario"
              />
              <input
                value={presentacion.colorPrimario}
                onChange={(evento) => actualizar("colorPrimario", evento.target.value)}
                className="min-w-0 flex-1 text-sm text-slate-700 outline-none"
                aria-label="Codigo hexadecimal del color primario"
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              Color secundario
              <AyudaCampo ayuda={ayudas.colorSecundario} />
            </span>
            <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2">
              <input
                type="color"
                value={presentacion.colorSecundario}
                onChange={(evento) => actualizar("colorSecundario", evento.target.value)}
                className="h-9 w-12 cursor-pointer rounded border border-slate-200 bg-white"
                aria-label="Color secundario"
              />
              <input
                value={presentacion.colorSecundario}
                onChange={(evento) => actualizar("colorSecundario", evento.target.value)}
                className="min-w-0 flex-1 text-sm text-slate-700 outline-none"
                aria-label="Codigo hexadecimal del color secundario"
              />
            </div>
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              Idioma de narracion
              <AyudaCampo ayuda={ayudas.narracion} />
            </span>
            <select
              value={presentacion.idiomaNarracion || "es"}
              onChange={(evento) => {
                const idioma = idiomasNarracion.find((item) => item.valor === evento.target.value);
                setPresentacion((actual) => ({
                  ...actual,
                  idiomaNarracion: evento.target.value,
                  palabrasPorMinutoNarracion: actual.palabrasPorMinutoNarracion || idioma?.ritmoBasePpm || 125
                }));
              }}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition hover:border-slate-300 focus:border-robot-cian"
            >
              {idiomasNarracion.map((idioma) => (
                <option key={idioma.valor} value={idioma.valor}>{idioma.etiqueta}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              Voz del video
              <AyudaCampo ayuda={ayudas.narracion} />
            </span>
            <select
              value={presentacion.vozNarracion || "af_heart"}
              onChange={(evento) => actualizar("vozNarracion", evento.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition hover:border-slate-300 focus:border-robot-cian"
            >
              {vocesKokoro.map((voz) => (
                <option key={voz.valor} value={voz.valor}>{voz.etiqueta}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              Velocidad de voz
              <AyudaCampo ayuda={ayudas.narracion} />
            </span>
            <input
              type="range"
              min="0.7"
              max="1.3"
              step="0.05"
              value={Number.parseFloat(presentacion.velocidadNarracion) || 1}
              onChange={(evento) => actualizar("velocidadNarracion", String(evento.target.value))}
              className="w-full accent-[var(--color-secundario)]"
              style={{ "--color-secundario": presentacion.colorSecundario }}
            />
            <span className="mt-1 block text-sm font-semibold text-slate-800">
              {Number.parseFloat(presentacion.velocidadNarracion) || 1}x
            </span>
          </label>
          <ControlRango
            etiqueta="Ritmo para tiempos automaticos"
            valor={presentacion.palabrasPorMinutoNarracion || 125}
            minimo={90}
            maximo={165}
            sufijo=" ppm"
            color={presentacion.colorSecundario}
            onChange={(valor) => actualizar("palabrasPorMinutoNarracion", valor)}
          />
        </div>

        <div className="grid gap-4 rounded-md border border-slate-200 p-4 sm:grid-cols-2 lg:col-span-2">
          <label className="flex items-center gap-3 text-sm font-semibold text-slate-800 sm:col-span-2">
            <input
              type="checkbox"
              checked={presentacion.mostrarLogoEnVideo !== false}
              onChange={(evento) => actualizar("mostrarLogoEnVideo", evento.target.checked)}
              className="h-4 w-4"
              style={{ accentColor: presentacion.colorSecundario }}
            />
            Mostrar logo en el video
          </label>
          <ControlRango
            etiqueta="Tamano del logo"
            valor={presentacion.logoTamano || 100}
            minimo={40}
            maximo={180}
            sufijo="%"
            color={presentacion.colorSecundario}
            onChange={(valor) => actualizar("logoTamano", valor)}
          />
          <ControlRango
            etiqueta="Redondeo del logo"
            valor={presentacion.logoRadioBorde || 0}
            minimo={0}
            maximo={50}
            sufijo="%"
            color={presentacion.colorSecundario}
            onChange={(valor) => actualizar("logoRadioBorde", valor)}
          />
          <ControlRango
            etiqueta="Opacidad del logo"
            valor={presentacion.logoOpacidad || 100}
            minimo={20}
            maximo={100}
            sufijo="%"
            color={presentacion.colorSecundario}
            onChange={(valor) => actualizar("logoOpacidad", valor)}
          />
        </div>
      </div>
    </section>
  );
}

function ControlRango({ etiqueta, valor, minimo, maximo, sufijo, color, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{etiqueta}</span>
      <input
        type="range"
        min={minimo}
        max={maximo}
        value={valor}
        onChange={(evento) => onChange(Number(evento.target.value))}
        className="w-full"
        style={{ accentColor: color }}
      />
      <span className="mt-1 block text-sm font-semibold text-slate-800">{valor}{sufijo}</span>
    </label>
  );
}
