import { consultarSupabase } from "./servicioSupabase.js";
import { dispararWorkflowRender, estaConfiguradoGitHubActions } from "./servicioGitHubActions.js";

const PLACEHOLDERS = {
  logo: "placeholders/logo-mr-robot-placeholder.svg",
  capturaProyecto: "placeholders/captura-proyecto-placeholder.svg",
  fotoIntegrante: "placeholders/foto-integrante-placeholder.svg"
};

const TIPOS_SECCION = {
  eslogan: "intro",
  cliente: "clientes",
  proyecto: "proyectos",
  quienes_somos: "quienes_somos",
  equipo: "equipo",
  habilidad: "habilidades",
  cierre_comercial: "cierre",
  personalizada: "intro"
};

export async function exportarDatosRender({ entorno, token, presentacionId }) {
  const presentacion = await obtenerPresentacionBase({ entorno, token, presentacionId });
  const [
    seccion,
    cliente,
    proyecto,
    integrante,
    habilidad,
    habilidadIntegrante,
    asset
  ] = await Promise.all([
    listarPorPresentacion({ entorno, token, tabla: "seccion_video", presentacionId, orden: "orden.asc" }),
    listarPorPresentacion({ entorno, token, tabla: "cliente", presentacionId, orden: "orden.asc" }),
    listarPorPresentacion({ entorno, token, tabla: "proyecto", presentacionId, orden: "orden.asc" }),
    listarPorPresentacion({ entorno, token, tabla: "integrante_equipo", presentacionId, orden: "orden.asc" }),
    listarPorPresentacion({ entorno, token, tabla: "habilidad", presentacionId, orden: "orden.asc" }),
    listarHabilidadIntegrante({ entorno, token, presentacionId }),
    listarPorPresentacion({ entorno, token, tabla: "asset", presentacionId, orden: "fecha_creacion.asc" })
  ]);

  return {
    empresaObjetivo: presentacion.empresa_objetivo,
    colorPrimario: presentacion.color_principal || presentacion.configuracion_tema?.colorPrimario || "#d40511",
    colorSecundario: presentacion.color_secundario || presentacion.configuracion_tema?.colorSecundario || "#22c7dd",
    eslogan: obtenerTextoSeccion(seccion, "eslogan") || "Desarrollamos soluciones informaticas a medida, desde sistemas web hasta aplicaciones moviles.",
    subtitulo: presentacion.descripcion || "Automatizamos tus procesos para que tu te enfoques en crecer. Listo para ensamblar el engranaje que te falta?",
    clientes: cliente.map((item) => crearTextoCliente(item)),
    proyectos: crearProyectosRender({ proyectos: proyecto, assets: asset }),
    quienesSomos: obtenerTextoSeccion(seccion, "quienes_somos") || "Somos un equipo integral enfocado en convertir procesos complejos en sistemas claros y escalables.",
    equipo: crearEquipoRender({ integrante, habilidad, habilidadIntegrante, assets: asset }),
    cierre: obtenerTextoSeccion(seccion, "cierre_comercial") || `${presentacion.empresa_objetivo} puede fortalecer su operacion nacional con automatizacion y sistemas preparados para crecer.`,
    audioNarracionUrl: obtenerAudioActual(asset),
    secciones: crearSeccionesRender(seccion),
    assets: crearAssetsRender(asset),
    configuracionLogo: {
      mostrar: presentacion.configuracion_tema?.mostrarLogoEnVideo !== false,
      radioBorde: Number(presentacion.configuracion_tema?.logoRadioBorde) || 0,
      tamano: Number(presentacion.configuracion_tema?.logoTamano) || 100,
      opacidad: Number(presentacion.configuracion_tema?.logoOpacidad) || 100
    }
  };
}

export async function solicitarRender({ entorno, token, usuario, datos }) {
  const datosRender = await exportarDatosRender({
    entorno,
    token,
    presentacionId: datos.presentacionId
  });

  const solicitud = await crearSolicitudRender({
    entorno,
    token,
    usuario,
    datos,
    versionContenido: await obtenerVersionContenido({ entorno, token, presentacionId: datos.presentacionId })
  });

  if (datos.origen === "github_actions" && estaConfiguradoGitHubActions(entorno)) {
    const workflow = await dispararWorkflowRender({
      entorno,
      datosRender,
      formato: datos.formato,
      calidad: datos.calidad
    });

    return {
      solicitud,
      datosRender,
      workflow,
      mensaje: "Solicitud registrada y workflow de render disparado."
    };
  }

  return {
    solicitud,
    datosRender,
    workflow: null,
    mensaje: datos.origen === "github_actions"
      ? "Solicitud registrada. GitHub Actions no se disparo porque faltan secretos de produccion."
      : "Solicitud registrada para render local."
  };
}

async function obtenerPresentacionBase({ entorno, token, presentacionId }) {
  const datos = await consultarSupabase({
    entorno,
    token,
    ruta: `presentacion?id=eq.${encodeURIComponent(presentacionId)}&fecha_eliminacion=is.null&select=*`
  });

  if (!datos[0]) {
    throw new Response(JSON.stringify({
      error: {
        codigo: "presentacion_no_encontrada",
        mensaje: "No se encontro la presentacion solicitada."
      }
    }), {
      status: 404,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }

  return datos[0];
}

async function obtenerVersionContenido({ entorno, token, presentacionId }) {
  const presentacion = await obtenerPresentacionBase({ entorno, token, presentacionId });
  return presentacion.version_contenido || 1;
}

async function listarPorPresentacion({ entorno, token, tabla, presentacionId, orden }) {
  return consultarSupabase({
    entorno,
    token,
    ruta: `${tabla}?presentacion_id=eq.${encodeURIComponent(presentacionId)}&fecha_eliminacion=is.null&select=*&order=${orden}`
  }).catch(() => []);
}

async function listarHabilidadIntegrante({ entorno, token, presentacionId }) {
  const integrantes = await listarPorPresentacion({
    entorno,
    token,
    tabla: "integrante_equipo",
    presentacionId,
    orden: "orden.asc"
  });

  if (integrantes.length === 0) {
    return [];
  }

  const ids = integrantes.map((item) => item.id).join(",");

  return consultarSupabase({
    entorno,
    token,
    ruta: `habilidad_integrante?integrante_id=in.(${ids})&activo=eq.true&select=*&order=orden.asc`
  }).catch(() => []);
}

async function crearSolicitudRender({ entorno, token, usuario, datos, versionContenido }) {
  const formatos = datos.formato === "ambos" ? ["horizontal", "vertical"] : [datos.formato];
  const cuerpo = formatos.map((formato) => ({
    presentacion_id: datos.presentacionId,
    formato,
    origen: datos.origen,
    version_contenido: versionContenido,
    solicitado_por: usuario.id,
    estado: datos.origen === "github_actions" ? "preparando" : "pendiente"
  }));

  const respuesta = await consultarSupabase({
    entorno,
    token,
    ruta: "solicitud_render",
    metodo: "POST",
    cuerpo
  });

  return respuesta;
}

function obtenerTextoSeccion(secciones, tipo) {
  const seccion = secciones.find((item) => item.tipo === tipo && item.activa_en_video !== false);
  return seccion?.texto_narracion || seccion?.configuracion?.textoPrincipal || "";
}

function crearTextoCliente(cliente) {
  const partes = [cliente.nombre];

  if (cliente.descripcion) {
    partes.push(cliente.descripcion);
  } else if (cliente.pais) {
    partes.push(cliente.pais);
  }

  return partes.join(" - ");
}

function crearProyectosRender({ proyectos, assets }) {
  const assetsPorId = new Map(assets.map((asset) => [asset.id, asset]));

  return proyectos.slice(0, 8).map((proyecto) => {
    const captura = assetsPorId.get(proyecto.asset_captura_principal_id);

    return {
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion || "",
      stack: proyecto.stack_usado || "",
      resultado: proyecto.resultado_impacto || "",
      capturaUrl: captura?.url_publica || "",
      mostrarDescripcionCaptura: proyecto.configuracion?.mostrarDescripcionCaptura !== false,
      descripcionCaptura: proyecto.configuracion?.descripcionCaptura || proyecto.descripcion || ""
    };
  });
}

function crearEquipoRender({ integrante, habilidad, habilidadIntegrante, assets }) {
  const assetsPorId = new Map(assets.map((asset) => [asset.id, asset]));

  return integrante.slice(0, 8).map((persona) => ({
    nombre: persona.nombre_completo,
    cargo: persona.cargo_empresa,
    especialidad: persona.especialidad,
    resumenProfesional: persona.resumen_profesional,
    experiencia: persona.experiencia,
    cv: persona.cv_detalle || {},
    fotoUrl: assetsPorId.get(persona.asset_foto_id)?.url_publica || "",
    habilidades: crearHabilidadesPersona({ persona, habilidad, habilidadIntegrante })
  }));
}

function crearHabilidadesPersona({ persona, habilidad, habilidadIntegrante }) {
  const habilidadesPorId = new Map(habilidad.map((item) => [item.id, item]));

  return habilidadIntegrante
    .filter((item) => item.integrante_id === persona.id)
    .slice(0, 8)
    .map((item) => [
      habilidadesPorId.get(item.habilidad_id)?.nombre || "Habilidad",
      item.nivel_visual
    ]);
}

function crearSeccionesRender(secciones) {
  const activas = secciones
    .filter((item) => item.activa_en_video !== false)
    .sort((a, b) => a.orden - b.orden)
    .map((item) => ({
      tipo: TIPOS_SECCION[item.tipo] || "intro",
      activa: true,
      orden: item.orden,
      animacion: item.animacion_entrada || "entrada_tecnica",
      duracionFrames: Math.max(90, Number(item.duracion_sugerida_segundos || 5) * 30)
    }));

  return activas.length > 0 ? activas : [
    { tipo: "intro", activa: true, orden: 1, duracionFrames: 150 },
    { tipo: "clientes", activa: true, orden: 2, duracionFrames: 120 },
    { tipo: "proyectos", activa: true, orden: 3, duracionFrames: 120 },
    { tipo: "quienes_somos", activa: true, orden: 4, duracionFrames: 120 },
    { tipo: "equipo", activa: true, orden: 5, duracionFrames: 150 },
    { tipo: "habilidades", activa: true, orden: 6, duracionFrames: 150 },
    { tipo: "cierre", activa: true, orden: 7, duracionFrames: 150 }
  ];
}

function crearAssetsRender(assets) {
  return {
    logo: buscarAsset(assets, "logo") || PLACEHOLDERS.logo,
    capturaProyecto: buscarAsset(assets, "captura_proyecto") || PLACEHOLDERS.capturaProyecto,
    fotoIntegrante: buscarAsset(assets, "foto_equipo") || PLACEHOLDERS.fotoIntegrante
  };
}

function buscarAsset(assets, tipo) {
  return assets.find((asset) => asset.tipo === tipo && asset.estado === "disponible")?.url_publica || "";
}

function obtenerAudioActual(assets) {
  return buscarAsset(assets, "audio") || "audio/narracion-demo.wav";
}
