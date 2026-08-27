import { Bell, Menu, Save, UserCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BarraLateral } from "../componentes/BarraLateral.jsx";
import { BotonIcono } from "../componentes/BotonIcono.jsx";
import { EquipoResumen } from "../componentes/EquipoResumen.jsx";
import { FormularioPresentacion } from "../componentes/FormularioPresentacion.jsx";
import { ListaSecciones } from "../componentes/ListaSecciones.jsx";
import { PanelEstado } from "../componentes/PanelEstado.jsx";
import { PanelConexiones } from "../componentes/PanelConexiones.jsx";
import { PanelContenidoEditable } from "../componentes/PanelContenidoEditable.jsx";
import { PanelAssets } from "../componentes/PanelAssets.jsx";
import { VistaPreviaVideo } from "../componentes/VistaPreviaVideo.jsx";
import {
  ayudasIniciales,
  clientesIniciales,
  integrantesIniciales,
  presentacionInicial,
  proyectosIniciales,
  seccionesIniciales
} from "../datos/datosIniciales.js";
import { iniciarSesion } from "../servicios/servicioAutenticacion.js";
import { cargarBorrador, guardarBorrador, solicitarRenderPanel } from "../servicios/servicioEditorPresentacion.js";
import { mostrarErrorOperacion, mostrarOperacionExitosa } from "../servicios/servicioAlerta.js";
import { LoginPanel } from "./LoginPanel.jsx";

export function AplicacionPanel() {
  const [sesion, setSesion] = useState(null);
  const [mensajeSesion, setMensajeSesion] = useState("");
  const [presentacion, setPresentacion] = useState(presentacionInicial);
  const [secciones, setSecciones] = useState(seccionesIniciales);
  const [integrantes, setIntegrantes] = useState(integrantesIniciales);
  const [clientes, setClientes] = useState(clientesIniciales);
  const [proyectos, setProyectos] = useState(proyectosIniciales);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(false);

  const seccionesActivas = useMemo(
    () => secciones.filter((seccion) => seccion.activaEnVideo && seccion.visibleEnPreview),
    [secciones]
  );

  async function manejarIngreso(credenciales) {
    try {
      const resultado = await iniciarSesion(credenciales);
      setSesion(resultado);
      setMensajeSesion(resultado.modoDemo ? "Modo demo local activo" : "Sesion iniciada con Supabase Auth");
    } catch (error) {
      setMensajeSesion(error.message);
    }
  }

  useEffect(() => {
    if (!sesion) {
      return;
    }

    let cancelado = false;

    async function cargarDatosIniciales() {
      setCargandoDatos(true);

      try {
        const datos = await cargarBorrador({
          sesion,
          datosIniciales: {
            presentacion: presentacionInicial,
            secciones: seccionesIniciales,
            integrantes: integrantesIniciales,
            clientes: clientesIniciales,
            proyectos: proyectosIniciales
          }
        });

        if (!cancelado) {
          setPresentacion(datos.presentacion || presentacionInicial);
          setSecciones(datos.secciones?.length ? datos.secciones : seccionesIniciales);
          setIntegrantes(datos.integrantes?.length ? datos.integrantes : integrantesIniciales);
          setClientes(datos.clientes?.length ? datos.clientes : clientesIniciales);
          setProyectos(datos.proyectos?.length ? datos.proyectos : proyectosIniciales);
        }
      } catch (error) {
        if (!cancelado) {
          await mostrarErrorOperacion({
            titulo: "No se pudieron cargar los datos",
            error,
            colores: {
              colorPrimario: presentacionInicial.colorPrimario,
              colorSecundario: presentacionInicial.colorSecundario
            }
          });
        }
      } finally {
        if (!cancelado) {
          setCargandoDatos(false);
        }
      }
    }

    cargarDatosIniciales();

    return () => {
      cancelado = true;
    };
  }, [sesion]);

  async function manejarGuardar() {
    try {
      const resultado = await guardarBorrador({ sesion, presentacion, secciones, integrantes, clientes, proyectos });

      if (resultado.presentacion) {
        setPresentacion((actual) => ({ ...actual, ...resultado.presentacion }));
      }

      await mostrarOperacionExitosa({
        titulo: "Borrador guardado",
        mensaje: resultado.mensaje,
        detalles: `Modo: ${resultado.modo}`,
        colores: {
          colorPrimario: presentacion.colorPrimario,
          colorSecundario: presentacion.colorSecundario
        }
      });
    } catch (error) {
      await mostrarErrorOperacion({
        titulo: "No se pudo guardar",
        error,
        colores: {
          colorPrimario: presentacion.colorPrimario,
          colorSecundario: presentacion.colorSecundario
        }
      });
    }
  }

  async function manejarGenerarVideo() {
    try {
      const resultado = await solicitarRenderPanel({ sesion, presentacion });

      await mostrarOperacionExitosa({
        titulo: "Render solicitado",
        mensaje: resultado.mensaje,
        detalles: `Modo: ${resultado.modo}`,
        colores: {
          colorPrimario: presentacion.colorPrimario,
          colorSecundario: presentacion.colorSecundario
        }
      });
    } catch (error) {
      await mostrarErrorOperacion({
        titulo: "No se pudo solicitar render",
        error,
        colores: {
          colorPrimario: presentacion.colorPrimario,
          colorSecundario: presentacion.colorSecundario
        }
      });
    }
  }

  if (!sesion) {
    return (
      <>
        <LoginPanel onIngresar={manejarIngreso} />
        {mensajeSesion && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-md bg-slate-950 px-4 py-2 text-sm text-white shadow-panel">
            {mensajeSesion}
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen lg:flex">
      <BarraLateral
        abierta={menuAbierto}
        onCerrar={() => setMenuAbierto(false)}
        colorPrimario={presentacion.colorPrimario}
      />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 lg:hidden"
                aria-label="Abrir menu"
                onClick={() => setMenuAbierto(true)}
              >
                <Menu size={20} aria-hidden="true" />
              </button>
              <div>
                <p className="text-base font-bold text-slate-950">Panel de presentacion</p>
                <p className="text-xs text-slate-500">{cargandoDatos ? "Cargando datos..." : mensajeSesion}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:inline-flex">
                TTS preparado
              </span>
              <span className="hidden rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 sm:inline-flex">
                Render en espera
              </span>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 text-slate-600"
                aria-label="Notificaciones"
              >
                <Bell size={18} aria-hidden="true" />
              </button>
              <div className="hidden items-center gap-2 rounded-md border border-slate-200 px-3 py-2 sm:flex">
                <UserCircle size={20} className="text-slate-500" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold text-slate-800">Administrador</p>
                  <p className="text-[11px] text-slate-500">{sesion.usuario.email}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="grid gap-5 p-4 xl:grid-cols-[minmax(0,1fr)_410px]">
          <div className="grid min-w-0 gap-5">
            <FormularioPresentacion
              presentacion={presentacion}
              setPresentacion={setPresentacion}
              ayudas={ayudasIniciales}
              onGuardar={manejarGuardar}
              onGenerarVideo={manejarGenerarVideo}
            />
            <PanelConexiones sesion={sesion} presentacion={presentacion} ayudas={ayudasIniciales} />
            <PanelAssets sesion={sesion} presentacion={presentacion} ayudas={ayudasIniciales} />
            <PanelContenidoEditable
              clientes={clientes}
              setClientes={setClientes}
              proyectos={proyectos}
              setProyectos={setProyectos}
              integrantes={integrantes}
              setIntegrantes={setIntegrantes}
              ayudas={ayudasIniciales}
            />
            <ListaSecciones
              secciones={secciones}
              setSecciones={setSecciones}
              ayudas={ayudasIniciales}
              colorPrimario={presentacion.colorPrimario}
              colorSecundario={presentacion.colorSecundario}
            />
            <EquipoResumen integrantes={integrantes} colorSecundario={presentacion.colorSecundario} />
          </div>
          <aside className="grid h-fit gap-4 xl:sticky xl:top-20">
            <VistaPreviaVideo
              presentacion={presentacion}
              seccionesActivas={seccionesActivas}
              ayudas={ayudasIniciales}
            />
            <PanelEstado
              sesion={sesion}
              presentacion={presentacion}
              seccionesActivas={seccionesActivas}
              ayudas={ayudasIniciales}
              onGenerarVideo={manejarGenerarVideo}
            />
            <BotonIcono icono={Save} variante="tenue" onClick={manejarGuardar}>Guardar borrador</BotonIcono>
          </aside>
        </main>
      </div>
    </div>
  );
}
