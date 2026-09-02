import { Plus, Trash2 } from "lucide-react";
import { BotonIcono } from "./BotonIcono.jsx";
import { CampoTexto } from "./CampoTexto.jsx";
import { extraerCvPanel } from "../servicios/servicioCvPanel.js";
import { mostrarErrorOperacion, mostrarOperacionExitosa } from "../servicios/servicioAlerta.js";

export function PanelContenidoEditable({
  clientes,
  setClientes,
  proyectos,
  setProyectos,
  integrantes,
  setIntegrantes,
  assets = [],
  sesion,
  presentacion,
  ayudas
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
      <div className="mb-5 border-b border-slate-200 pb-4">
        <h2 className="text-lg font-bold text-slate-950">Contenido editable del video</h2>
        <p className="mt-1 text-sm text-slate-500">
          Clientes, proyectos, capturas, CV y habilidades alimentan la pagina exportada y el render.
        </p>
      </div>

      <div className="grid gap-5">
        <EditorClientes clientes={clientes} setClientes={setClientes} ayudas={ayudas} />
        <EditorProyectos proyectos={proyectos} setProyectos={setProyectos} assets={assets} />
        <EditorIntegrantes integrantes={integrantes} setIntegrantes={setIntegrantes} assets={assets} sesion={sesion} presentacion={presentacion} />
      </div>
    </section>
  );
}

function EditorClientes({ clientes, setClientes, ayudas }) {
  function actualizar(id, campo, valor) {
    setClientes((actuales) => actuales.map((cliente) => (cliente.id === id ? { ...cliente, [campo]: valor } : cliente)));
  }

  function agregar() {
    setClientes((actuales) => [
      ...actuales,
      {
        id: `cliente-${Date.now()}`,
        nombre: "Nuevo cliente",
        tipoCliente: "nacional",
        descripcion: "",
        pais: "Bolivia",
        orden: actuales.length + 1,
        activo: true
      }
    ]);
  }

  return (
    <BloqueColeccion titulo="Clientes" onAgregar={agregar}>
      {clientes.map((cliente) => (
        <article key={cliente.id} className="grid gap-3 rounded-md border border-slate-200 p-3 md:grid-cols-2">
          <CampoTexto etiqueta="Nombre" ayuda={ayudas.empresaObjetivo} valor={cliente.nombre} onChange={(valor) => actualizar(cliente.id, "nombre", valor)} requerido />
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Tipo</span>
            <select className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={cliente.tipoCliente} onChange={(evento) => actualizar(cliente.id, "tipoCliente", evento.target.value)}>
              <option value="internacional">Internacional</option>
              <option value="nacional">Nacional</option>
              <option value="emprendimiento">Emprendimiento</option>
              <option value="empresa_nueva">Empresa nueva</option>
              <option value="otro">Otro</option>
            </select>
          </label>
          <CampoTexto etiqueta="Pais" valor={cliente.pais} onChange={(valor) => actualizar(cliente.id, "pais", valor)} />
          <CampoTexto etiqueta="Descripcion" valor={cliente.descripcion} onChange={(valor) => actualizar(cliente.id, "descripcion", valor)} />
          <BotonEliminar onClick={() => setClientes((actuales) => actuales.filter((item) => item.id !== cliente.id))} />
        </article>
      ))}
    </BloqueColeccion>
  );
}

function EditorProyectos({ proyectos, setProyectos, assets }) {
  const capturas = assets.filter((asset) => asset.tipo === "captura_proyecto");

  function actualizar(id, campo, valor) {
    setProyectos((actuales) => actuales.map((proyecto) => (proyecto.id === id ? { ...proyecto, [campo]: valor } : proyecto)));
  }

  function agregar() {
    setProyectos((actuales) => [
      ...actuales,
      {
        id: `proyecto-${Date.now()}`,
        nombre: "Nuevo proyecto",
        tipoSolucion: "web",
        descripcion: "",
        stackUsado: "",
        resultadoImpacto: "",
        assetCapturaPrincipalId: "",
        mostrarDescripcionCaptura: true,
        descripcionCaptura: "",
        orden: actuales.length + 1,
        activo: true
      }
    ]);
  }

  return (
    <BloqueColeccion titulo="Proyectos y capturas" onAgregar={agregar}>
      {proyectos.map((proyecto) => (
        <article key={proyecto.id} className="grid gap-3 rounded-md border border-slate-200 p-3 md:grid-cols-2">
          <CampoTexto etiqueta="Nombre" valor={proyecto.nombre} onChange={(valor) => actualizar(proyecto.id, "nombre", valor)} requerido />
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Tipo de solucion</span>
            <select className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={proyecto.tipoSolucion} onChange={(evento) => actualizar(proyecto.id, "tipoSolucion", evento.target.value)}>
              <option value="web">Web</option>
              <option value="movil">Movil</option>
              <option value="automatizacion">Automatizacion</option>
              <option value="sistema_interno">Sistema interno</option>
              <option value="ecommerce">Ecommerce</option>
              <option value="catalogo">Catalogo</option>
              <option value="otro">Otro</option>
            </select>
          </label>
          <CampoTexto etiqueta="Descripcion" valor={proyecto.descripcion} onChange={(valor) => actualizar(proyecto.id, "descripcion", valor)} multilinea maximo={500} />
          <CampoTexto etiqueta="Stack usado" valor={proyecto.stackUsado} onChange={(valor) => actualizar(proyecto.id, "stackUsado", valor)} />
          <CampoTexto etiqueta="Resultado/impacto" valor={proyecto.resultadoImpacto} onChange={(valor) => actualizar(proyecto.id, "resultadoImpacto", valor)} />
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Captura que se mostrara</span>
            <select className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={proyecto.assetCapturaPrincipalId || ""} onChange={(evento) => actualizar(proyecto.id, "assetCapturaPrincipalId", evento.target.value)}>
              <option value="">Usar placeholder</option>
              {capturas.map((asset) => (
                <option key={asset.id} value={asset.id}>{asset.rutaStorage || asset.urlPublica || asset.id}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-3 text-sm font-semibold text-slate-800">
            <input type="checkbox" checked={proyecto.mostrarDescripcionCaptura !== false} onChange={(evento) => actualizar(proyecto.id, "mostrarDescripcionCaptura", evento.target.checked)} className="h-4 w-4" />
            Mostrar descripcion de captura
          </label>
          <CampoTexto etiqueta="Descripcion de la captura" valor={proyecto.descripcionCaptura || ""} onChange={(valor) => actualizar(proyecto.id, "descripcionCaptura", valor)} multilinea maximo={360} />
          <BotonEliminar onClick={() => setProyectos((actuales) => actuales.filter((item) => item.id !== proyecto.id))} />
        </article>
      ))}
    </BloqueColeccion>
  );
}

function EditorIntegrantes({ integrantes, setIntegrantes, assets, sesion, presentacion }) {
  const fotos = assets.filter((asset) => asset.tipo === "foto_equipo");

  function actualizar(id, campo, valor) {
    setIntegrantes((actuales) => actuales.map((integrante) => (integrante.id === id ? { ...integrante, [campo]: valor } : integrante)));
  }

  function actualizarCv(id, campo, valor) {
    setIntegrantes((actuales) =>
      actuales.map((integrante) =>
        integrante.id === id
          ? { ...integrante, cvDetalle: { ...(integrante.cvDetalle || {}), [campo]: valor } }
          : integrante
      )
    );
  }

  function actualizarListaCv(id, campo, valor) {
    actualizarCv(id, campo, convertirLineasALista(valor));
  }

  function actualizarHabilidad(id, indice, campo, valor) {
    setIntegrantes((actuales) =>
      actuales.map((integrante) => {
        if (integrante.id !== id) return integrante;
        const habilidades = [...(integrante.habilidades || [])];
        const habilidadActual = normalizarHabilidad(habilidades[indice] || ["Habilidad", 80]);
        habilidades[indice] = campo === "nombre" ? [valor, habilidadActual[1]] : [habilidadActual[0], Number(valor)];
        return { ...integrante, habilidades };
      })
    );
  }

  function agregarHabilidad(id) {
    setIntegrantes((actuales) =>
      actuales.map((integrante) =>
        integrante.id === id
          ? { ...integrante, habilidades: [...(integrante.habilidades || []), ["Nueva habilidad", 80]] }
          : integrante
      )
    );
  }

  function eliminarHabilidad(id, indice) {
    setIntegrantes((actuales) =>
      actuales.map((integrante) =>
        integrante.id === id
          ? { ...integrante, habilidades: (integrante.habilidades || []).filter((_, actual) => actual !== indice) }
          : integrante
      )
    );
  }

  async function importarCv(id, archivo) {
    if (!archivo) return;

    try {
      const resultado = await extraerCvPanel({ sesion, integranteId: id, archivo });
      aplicarCamposCv(id, resultado.campos || {});

      await mostrarOperacionExitosa({
        titulo: "CV importado",
        mensaje: "El CV fue leido y distribuido en los campos editables.",
        detalles: `Archivo: ${resultado.nombreArchivo || archivo.name}\nCaracteres: ${resultado.texto?.length || 0}`,
        colores: obtenerColores(presentacion)
      });
    } catch (error) {
      await mostrarErrorOperacion({
        titulo: "No se pudo importar CV",
        error,
        colores: obtenerColores(presentacion)
      });
    }
  }

  function aplicarCamposCv(id, campos) {
    setIntegrantes((actuales) =>
      actuales.map((integrante) => {
        if (integrante.id !== id) return integrante;

        const cvDetalle = {
          ...(integrante.cvDetalle || {}),
          ...campos
        };

        return {
          ...integrante,
          resumenProfesional: campos.resumen || integrante.resumenProfesional,
          experiencia: campos.experiencia || integrante.experiencia,
          cvDetalle
        };
      })
    );
  }

  function agregar() {
    setIntegrantes((actuales) => [
      ...actuales,
      {
        id: `integrante-${Date.now()}`,
        nombre: "Nuevo integrante",
        cargo: "Cargo en la empresa",
        especialidad: "Especialidad principal",
        resumenProfesional: "",
        experiencia: "",
        assetFotoId: "",
        cvDetalle: { resumen: "", experiencia: "", cvCompleto: "", estudios: [], certificaciones: [], logros: [], stackPrincipal: "", enlaces: [] },
        habilidades: [["Habilidad", 80]]
      }
    ]);
  }

  return (
    <BloqueColeccion titulo="Equipo, CV y habilidades" onAgregar={agregar}>
      {integrantes.map((integrante) => (
        <article key={integrante.id} className="grid gap-3 rounded-md border border-slate-200 p-3 md:grid-cols-2">
          <CampoTexto etiqueta="Nombre" valor={integrante.nombre} onChange={(valor) => actualizar(integrante.id, "nombre", valor)} requerido />
          <CampoTexto etiqueta="Cargo/titulo" valor={integrante.cargo} onChange={(valor) => actualizar(integrante.id, "cargo", valor)} requerido />
          <CampoTexto etiqueta="Especialidad" valor={integrante.especialidad} onChange={(valor) => actualizar(integrante.id, "especialidad", valor)} requerido />
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Foto del integrante</span>
            <select className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={integrante.assetFotoId || ""} onChange={(evento) => actualizar(integrante.id, "assetFotoId", evento.target.value)}>
              <option value="">Usar placeholder</option>
              {fotos.map((asset) => (
                <option key={asset.id} value={asset.id}>{asset.rutaStorage || asset.urlPublica || asset.id}</option>
              ))}
            </select>
          </label>
          <CampoTexto etiqueta="Resumen profesional" valor={integrante.resumenProfesional || integrante.cvDetalle?.resumen || ""} onChange={(valor) => { actualizar(integrante.id, "resumenProfesional", valor); actualizarCv(integrante.id, "resumen", valor); }} multilinea maximo={420} />
          <CampoTexto etiqueta="Experiencia resumida" valor={integrante.experiencia || integrante.cvDetalle?.experiencia || ""} onChange={(valor) => { actualizar(integrante.id, "experiencia", valor); actualizarCv(integrante.id, "experiencia", valor); }} multilinea maximo={1200} />
          <CampoTexto etiqueta="CV completo pegado" valor={integrante.cvDetalle?.cvCompleto || ""} onChange={(valor) => actualizarCv(integrante.id, "cvCompleto", valor)} multilinea maximo={8000} />
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Importar CV como texto</span>
            <input type="file" accept=".txt,.md,.csv,.pdf,.docx,image/png,image/jpeg,image/webp" onChange={(evento) => importarCv(integrante.id, evento.target.files?.[0])} className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <CampoTexto etiqueta="Estudios, uno por linea" valor={convertirListaALineas(integrante.cvDetalle?.estudios)} onChange={(valor) => actualizarListaCv(integrante.id, "estudios", valor)} multilinea maximo={900} />
          <CampoTexto etiqueta="Certificaciones, una por linea" valor={convertirListaALineas(integrante.cvDetalle?.certificaciones)} onChange={(valor) => actualizarListaCv(integrante.id, "certificaciones", valor)} multilinea maximo={900} />
          <CampoTexto etiqueta="Logros, uno por linea" valor={convertirListaALineas(integrante.cvDetalle?.logros)} onChange={(valor) => actualizarListaCv(integrante.id, "logros", valor)} multilinea maximo={900} />
          <CampoTexto etiqueta="Stack principal" valor={integrante.cvDetalle?.stackPrincipal || ""} onChange={(valor) => actualizarCv(integrante.id, "stackPrincipal", valor)} multilinea maximo={500} />
          <div className="grid gap-3 rounded-md bg-slate-50 p-3 md:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-bold text-slate-900">Habilidades por porcentaje</h4>
              <button type="button" className="text-sm font-semibold text-slate-700" onClick={() => agregarHabilidad(integrante.id)}>Agregar habilidad</button>
            </div>
            {(integrante.habilidades || []).map((habilidad, indice) => {
              const [nombre, nivel] = normalizarHabilidad(habilidad);
              return (
                <div key={`${nombre}-${indice}`} className="grid gap-2 md:grid-cols-[minmax(0,1fr)_220px_40px]">
                  <input value={nombre} onChange={(evento) => actualizarHabilidad(integrante.id, indice, "nombre", evento.target.value)} className="rounded-md border border-slate-200 px-3 py-2 text-sm" aria-label="Nombre de habilidad" />
                  <label className="grid gap-1 text-xs font-semibold text-slate-700">
                    <span>{nivel}%</span>
                    <input type="range" min="0" max="100" value={nivel} onChange={(evento) => actualizarHabilidad(integrante.id, indice, "nivel", evento.target.value)} />
                  </label>
                  <button type="button" className="rounded-md border border-red-100 text-red-600" onClick={() => eliminarHabilidad(integrante.id, indice)} aria-label="Eliminar habilidad">
                    <Trash2 size={15} aria-hidden="true" className="mx-auto" />
                  </button>
                </div>
              );
            })}
          </div>
          <BotonEliminar onClick={() => setIntegrantes((actuales) => actuales.filter((item) => item.id !== integrante.id))} />
        </article>
      ))}
    </BloqueColeccion>
  );
}

function normalizarHabilidad(habilidad) {
  if (Array.isArray(habilidad)) {
    return [habilidad[0] || "Habilidad", Number(habilidad[1]) || 0];
  }

  return [habilidad?.nombre || "Habilidad", Number(habilidad?.nivelVisual) || 0];
}

function convertirLineasALista(valor) {
  return valor.split("\n").map((linea) => linea.trim()).filter(Boolean);
}

function convertirListaALineas(valor) {
  return Array.isArray(valor) ? valor.join("\n") : "";
}

function BloqueColeccion({ titulo, onAgregar, children }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-semibold text-slate-900">{titulo}</h3>
        <BotonIcono icono={Plus} variante="tenue" onClick={onAgregar}>Agregar</BotonIcono>
      </div>
      <div className="grid gap-3">{children}</div>
    </div>
  );
}

function BotonEliminar({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-red-100 px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 md:self-end">
      <Trash2 size={16} aria-hidden="true" />
      Eliminar
    </button>
  );
}

function obtenerColores(presentacion) {
  return {
    colorPrimario: presentacion?.colorPrimario || "#d40511",
    colorSecundario: presentacion?.colorSecundario || "#22c7dd"
  };
}
