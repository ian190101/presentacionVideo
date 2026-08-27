import { Plus, Trash2 } from "lucide-react";
import { BotonIcono } from "./BotonIcono.jsx";
import { CampoTexto } from "./CampoTexto.jsx";

export function PanelContenidoEditable({
  clientes,
  setClientes,
  proyectos,
  setProyectos,
  integrantes,
  setIntegrantes,
  ayudas
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
      <div className="mb-5 border-b border-slate-200 pb-4">
        <h2 className="text-lg font-bold text-slate-950">Contenido editable del video</h2>
        <p className="mt-1 text-sm text-slate-500">
          Clientes, proyectos y perfiles se guardan sin tocar codigo y alimentan la exportacion para Remotion.
        </p>
      </div>

      <div className="grid gap-5">
        <EditorClientes clientes={clientes} setClientes={setClientes} ayudas={ayudas} />
        <EditorProyectos proyectos={proyectos} setProyectos={setProyectos} />
        <EditorIntegrantes integrantes={integrantes} setIntegrantes={setIntegrantes} />
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
            <select
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={cliente.tipoCliente}
              onChange={(evento) => actualizar(cliente.id, "tipoCliente", evento.target.value)}
            >
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

function EditorProyectos({ proyectos, setProyectos }) {
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
        orden: actuales.length + 1,
        activo: true
      }
    ]);
  }

  return (
    <BloqueColeccion titulo="Proyectos" onAgregar={agregar}>
      {proyectos.map((proyecto) => (
        <article key={proyecto.id} className="grid gap-3 rounded-md border border-slate-200 p-3 md:grid-cols-2">
          <CampoTexto etiqueta="Nombre" valor={proyecto.nombre} onChange={(valor) => actualizar(proyecto.id, "nombre", valor)} requerido />
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Tipo de solucion</span>
            <select
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={proyecto.tipoSolucion}
              onChange={(evento) => actualizar(proyecto.id, "tipoSolucion", evento.target.value)}
            >
              <option value="web">Web</option>
              <option value="movil">Movil</option>
              <option value="automatizacion">Automatizacion</option>
              <option value="sistema_interno">Sistema interno</option>
              <option value="ecommerce">Ecommerce</option>
              <option value="catalogo">Catalogo</option>
              <option value="otro">Otro</option>
            </select>
          </label>
          <CampoTexto etiqueta="Descripcion" valor={proyecto.descripcion} onChange={(valor) => actualizar(proyecto.id, "descripcion", valor)} />
          <CampoTexto etiqueta="Stack usado" valor={proyecto.stackUsado} onChange={(valor) => actualizar(proyecto.id, "stackUsado", valor)} />
          <CampoTexto etiqueta="Resultado/impacto" valor={proyecto.resultadoImpacto} onChange={(valor) => actualizar(proyecto.id, "resultadoImpacto", valor)} />
          <BotonEliminar onClick={() => setProyectos((actuales) => actuales.filter((item) => item.id !== proyecto.id))} />
        </article>
      ))}
    </BloqueColeccion>
  );
}

function EditorIntegrantes({ integrantes, setIntegrantes }) {
  function actualizar(id, campo, valor) {
    setIntegrantes((actuales) => actuales.map((integrante) => (integrante.id === id ? { ...integrante, [campo]: valor } : integrante)));
  }

  function actualizarCv(id, campo, valor) {
    setIntegrantes((actuales) =>
      actuales.map((integrante) =>
        integrante.id === id
          ? {
              ...integrante,
              cvDetalle: {
                ...(integrante.cvDetalle || {}),
                [campo]: valor
              }
            }
          : integrante
      )
    );
  }

  function actualizarListaCv(id, campo, valor) {
    actualizarCv(id, campo, convertirLineasALista(valor));
  }

  function actualizarHabilidades(id, valor) {
    const habilidades = valor
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((nombre) => [nombre, 80]);

    actualizar(id, "habilidades", habilidades);
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
        cvDetalle: {
          resumen: "",
          experiencia: "",
          estudios: [],
          certificaciones: [],
          logros: [],
          stackPrincipal: "",
          enlaces: []
        },
        habilidades: [["Habilidad", 80]]
      }
    ]);
  }

  return (
    <BloqueColeccion titulo="Equipo y habilidades" onAgregar={agregar}>
      {integrantes.map((integrante) => (
        <article key={integrante.id} className="grid gap-3 rounded-md border border-slate-200 p-3 md:grid-cols-2">
          <CampoTexto etiqueta="Nombre" valor={integrante.nombre} onChange={(valor) => actualizar(integrante.id, "nombre", valor)} requerido />
          <CampoTexto etiqueta="Cargo/titulo" valor={integrante.cargo} onChange={(valor) => actualizar(integrante.id, "cargo", valor)} requerido />
          <CampoTexto etiqueta="Especialidad" valor={integrante.especialidad} onChange={(valor) => actualizar(integrante.id, "especialidad", valor)} requerido />
          <CampoTexto
            etiqueta="Resumen profesional"
            valor={integrante.resumenProfesional || integrante.cvDetalle?.resumen || ""}
            onChange={(valor) => {
              actualizar(integrante.id, "resumenProfesional", valor);
              actualizarCv(integrante.id, "resumen", valor);
            }}
            multilinea
            maximo={420}
          />
          <CampoTexto
            etiqueta="Experiencia completa"
            valor={integrante.experiencia || integrante.cvDetalle?.experiencia || ""}
            onChange={(valor) => {
              actualizar(integrante.id, "experiencia", valor);
              actualizarCv(integrante.id, "experiencia", valor);
            }}
            multilinea
            maximo={1200}
          />
          <CampoTexto
            etiqueta="Estudios, uno por linea"
            valor={convertirListaALineas(integrante.cvDetalle?.estudios)}
            onChange={(valor) => actualizarListaCv(integrante.id, "estudios", valor)}
            multilinea
            maximo={900}
          />
          <CampoTexto
            etiqueta="Certificaciones, una por linea"
            valor={convertirListaALineas(integrante.cvDetalle?.certificaciones)}
            onChange={(valor) => actualizarListaCv(integrante.id, "certificaciones", valor)}
            multilinea
            maximo={900}
          />
          <CampoTexto
            etiqueta="Logros, uno por linea"
            valor={convertirListaALineas(integrante.cvDetalle?.logros)}
            onChange={(valor) => actualizarListaCv(integrante.id, "logros", valor)}
            multilinea
            maximo={900}
          />
          <CampoTexto
            etiqueta="Stack principal"
            valor={integrante.cvDetalle?.stackPrincipal || ""}
            onChange={(valor) => actualizarCv(integrante.id, "stackPrincipal", valor)}
            multilinea
            maximo={500}
          />
          <CampoTexto
            etiqueta="Enlaces, uno por linea"
            valor={convertirListaALineas(integrante.cvDetalle?.enlaces)}
            onChange={(valor) => actualizarListaCv(integrante.id, "enlaces", valor)}
            multilinea
            maximo={900}
          />
          <CampoTexto
            etiqueta="Habilidades separadas por coma"
            valor={(integrante.habilidades || []).map(([nombre]) => nombre).join(", ")}
            onChange={(valor) => actualizarHabilidades(integrante.id, valor)}
          />
          <BotonEliminar onClick={() => setIntegrantes((actuales) => actuales.filter((item) => item.id !== integrante.id))} />
        </article>
      ))}
    </BloqueColeccion>
  );
}

function convertirLineasALista(valor) {
  return valor
    .split("\n")
    .map((linea) => linea.trim())
    .filter(Boolean);
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
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-red-100 px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 md:self-end"
    >
      <Trash2 size={16} aria-hidden="true" />
      Eliminar
    </button>
  );
}
