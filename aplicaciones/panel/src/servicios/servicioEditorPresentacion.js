import { solicitarApi } from "./servicioApi.js";
import {
  ajustarDuracionesSeccionesPorNarracion,
  prepararTextoSeccionNarracion
} from "../utilidades/narracion.js";

const CLAVE_BORRADOR_LOCAL = "presentacion_mr_robot_borrador";

export async function cargarBorrador({ sesion, datosIniciales }) {
  if (sesion.modoDemo) {
    return cargarBorradorLocal(datosIniciales);
  }

  const listado = await solicitarApi("/presentacion", { token: sesion.token });
  const primera = listado.datos?.[0];

  if (!primera) {
    return datosIniciales;
  }

  const secciones = await solicitarApi(`/seccion?presentacionId=${encodeURIComponent(primera.id)}`, {
    token: sesion.token
  });

  const equipo = await solicitarApi(`/equipo?presentacionId=${encodeURIComponent(primera.id)}`, {
    token: sesion.token
  });
  const habilidades = await solicitarApi(`/habilidad?presentacionId=${encodeURIComponent(primera.id)}`, {
    token: sesion.token
  });
  const clientes = await solicitarApi(`/cliente?presentacionId=${encodeURIComponent(primera.id)}`, {
    token: sesion.token
  });
  const proyectos = await solicitarApi(`/proyecto?presentacionId=${encodeURIComponent(primera.id)}`, {
    token: sesion.token
  });

  const integrantes = await cargarIntegrantesConHabilidades({
    sesion,
    integrantes: equipo.datos || [],
    habilidades: habilidades.datos || []
  });

  return {
    presentacion: convertirPresentacionDesdeApi(primera),
    secciones: (secciones.datos || []).map(convertirSeccionDesdeApi),
    integrantes,
    clientes: (clientes.datos || []).map(convertirClienteDesdeApi),
    proyectos: (proyectos.datos || []).map(convertirProyectoDesdeApi)
  };
}

export async function guardarBorrador({ sesion, presentacion, secciones, integrantes, clientes, proyectos }) {
  const seccionesAjustadas = ajustarDuracionesSeccionesPorNarracion(secciones, presentacion);

  if (sesion.modoDemo) {
    localStorage.setItem(CLAVE_BORRADOR_LOCAL, JSON.stringify({
      presentacion,
      secciones: seccionesAjustadas,
      integrantes,
      clientes,
      proyectos
    }));
    return {
      modo: "local",
      mensaje: "Presentacion guardada en este navegador.",
      secciones: seccionesAjustadas
    };
  }

  const presentacionGuardada = presentacion.id
    ? await actualizarPresentacion({ sesion, presentacion })
    : await crearPresentacion({ sesion, presentacion });

  const presentacionId = presentacionGuardada.id;

  for (const seccion of seccionesAjustadas) {
    await guardarSeccion({ sesion, presentacionId, seccion });
  }

  for (const cliente of clientes) {
    await guardarCliente({ sesion, presentacionId, cliente });
  }

  for (const proyecto of proyectos) {
    await guardarProyecto({ sesion, presentacionId, proyecto });
  }

  const habilidadesExistentes = await listarHabilidadesPresentacion({ sesion, presentacionId });

  for (const integrante of integrantes) {
    const integranteGuardado = await guardarIntegrante({ sesion, presentacionId, integrante });
    await guardarHabilidadesIntegrante({
      sesion,
      presentacionId,
      integrante: integranteGuardado,
      habilidadesPanel: integrante.habilidades || [],
      habilidadesExistentes
    });
  }

  return {
    modo: "api",
    mensaje: "Presentacion guardada en Supabase mediante la API.",
    presentacion: convertirPresentacionDesdeApi(presentacionGuardada),
    secciones: seccionesAjustadas
  };
}

export async function solicitarRenderPanel({ sesion, presentacion }) {
  if (sesion.modoDemo) {
    return {
      modo: "local",
      mensaje: "Modo demo: usa npm run video:render:datos para render local desde JSON."
    };
  }

  if (!presentacion.id) {
    throw new Error("Guarda la presentacion antes de solicitar render.");
  }

  const resultado = await solicitarApi("/render/solicitar", {
    token: sesion.token,
    metodo: "POST",
    cuerpo: {
      presentacionId: presentacion.id,
      formato: presentacion.formatoPreferido || "horizontal",
      calidad: presentacion.calidadRender || "rapida",
      origen: "github_actions",
      forzar: false
    }
  });

  return {
    modo: "api",
    mensaje: resultado.datos?.mensaje || "Solicitud de render registrada.",
    datos: resultado.datos
  };
}

function cargarBorradorLocal(datosIniciales) {
  const guardado = localStorage.getItem(CLAVE_BORRADOR_LOCAL);

  if (!guardado) {
    return datosIniciales;
  }

  try {
    return JSON.parse(guardado);
  } catch {
    return datosIniciales;
  }
}

async function crearPresentacion({ sesion, presentacion }) {
  const respuesta = await solicitarApi("/presentacion", {
    token: sesion.token,
    metodo: "POST",
    cuerpo: convertirPresentacionParaApi(presentacion)
  });

  return respuesta.datos;
}

async function actualizarPresentacion({ sesion, presentacion }) {
  const respuesta = await solicitarApi(`/presentacion/${encodeURIComponent(presentacion.id)}`, {
    token: sesion.token,
    metodo: "PATCH",
    cuerpo: convertirPresentacionParaApi(presentacion)
  });

  return respuesta.datos;
}

async function guardarSeccion({ sesion, presentacionId, seccion }) {
  const cuerpo = convertirSeccionParaApi({ ...seccion, presentacionId });
  const idPersistente = esUuid(seccion.id);
  const ruta = idPersistente ? `/seccion/${encodeURIComponent(seccion.id)}` : "/seccion";

  await solicitarApi(ruta, {
    token: sesion.token,
    metodo: idPersistente ? "PATCH" : "POST",
    cuerpo
  });
}

async function guardarIntegrante({ sesion, presentacionId, integrante }) {
  const cuerpo = convertirIntegranteParaApi({ ...integrante, presentacionId });
  const idPersistente = esUuid(integrante.id);
  const ruta = idPersistente ? `/equipo/${encodeURIComponent(integrante.id)}` : "/equipo";

  const respuesta = await solicitarApi(ruta, {
    token: sesion.token,
    metodo: idPersistente ? "PATCH" : "POST",
    cuerpo
  });

  return respuesta.datos;
}

async function guardarCliente({ sesion, presentacionId, cliente }) {
  const cuerpo = convertirClienteParaApi({ ...cliente, presentacionId });
  const idPersistente = esUuid(cliente.id);
  const ruta = idPersistente ? `/cliente/${encodeURIComponent(cliente.id)}` : "/cliente";

  await solicitarApi(ruta, {
    token: sesion.token,
    metodo: idPersistente ? "PATCH" : "POST",
    cuerpo
  });
}

async function guardarProyecto({ sesion, presentacionId, proyecto }) {
  const cuerpo = convertirProyectoParaApi({ ...proyecto, presentacionId });
  const idPersistente = esUuid(proyecto.id);
  const ruta = idPersistente ? `/proyecto/${encodeURIComponent(proyecto.id)}` : "/proyecto";

  await solicitarApi(ruta, {
    token: sesion.token,
    metodo: idPersistente ? "PATCH" : "POST",
    cuerpo
  });
}

async function cargarIntegrantesConHabilidades({ sesion, integrantes, habilidades }) {
  const habilidadesPorId = new Map(habilidades.map((habilidad) => [habilidad.id, habilidad]));

  return Promise.all(
    integrantes.map(async (integrante) => {
      const relaciones = await solicitarApi(`/habilidad_integrante?integranteId=${encodeURIComponent(integrante.id)}`, {
        token: sesion.token
      });

      return convertirIntegranteDesdeApi(integrante, relaciones.datos || [], habilidadesPorId);
    })
  );
}

async function listarHabilidadesPresentacion({ sesion, presentacionId }) {
  const respuesta = await solicitarApi(`/habilidad?presentacionId=${encodeURIComponent(presentacionId)}`, {
    token: sesion.token
  });

  return new Map((respuesta.datos || []).map((habilidad) => [normalizarNombreClave(habilidad.nombre), habilidad]));
}

async function guardarHabilidadesIntegrante({ sesion, presentacionId, integrante, habilidadesPanel, habilidadesExistentes }) {
  const relacionesActuales = await solicitarApi(`/habilidad_integrante?integranteId=${encodeURIComponent(integrante.id)}`, {
    token: sesion.token
  });
  const relacionesPorHabilidad = new Map((relacionesActuales.datos || []).map((relacion) => [relacion.habilidad_id, relacion]));
  const habilidadesUsadas = new Set();

  for (const [indice, habilidadPanel] of habilidadesPanel.entries()) {
    const nombre = Array.isArray(habilidadPanel) ? habilidadPanel[0] : habilidadPanel?.nombre;
    const nivel = Array.isArray(habilidadPanel) ? habilidadPanel[1] : habilidadPanel?.nivelVisual;
    const clave = normalizarNombreClave(nombre);

    if (!clave) {
      continue;
    }

    let habilidad = habilidadesExistentes.get(clave);

    if (!habilidad) {
      const creada = await solicitarApi("/habilidad", {
        token: sesion.token,
        metodo: "POST",
        cuerpo: {
          presentacionId,
          nombre,
          categoria: "otro",
          orden: indice + 1,
          activo: true
        }
      });

      habilidad = creada.datos;
      habilidadesExistentes.set(clave, habilidad);
    }

    habilidadesUsadas.add(habilidad.id);

    const relacionExistente = relacionesPorHabilidad.get(habilidad.id);
    const cuerpoRelacion = {
      integranteId: integrante.id,
      habilidadId: habilidad.id,
      nivelVisual: Number(nivel) || 80,
      tipoAnimacion: "barra_progreso",
      velocidadAnimacion: 1,
      orden: indice + 1,
      activo: true
    };

    await solicitarApi(relacionExistente ? `/habilidad_integrante/${encodeURIComponent(relacionExistente.id)}` : "/habilidad_integrante", {
      token: sesion.token,
      metodo: relacionExistente ? "PATCH" : "POST",
      cuerpo: cuerpoRelacion
    });
  }

  for (const relacion of relacionesActuales.datos || []) {
    if (!habilidadesUsadas.has(relacion.habilidad_id)) {
      await solicitarApi(`/habilidad_integrante/${encodeURIComponent(relacion.id)}`, {
        token: sesion.token,
        metodo: "PATCH",
        cuerpo: { activo: false }
      });
    }
  }
}

function convertirPresentacionParaApi(presentacion) {
  return {
    nombre: presentacion.nombre,
    empresaObjetivo: presentacion.empresaObjetivo,
    descripcion: presentacion.descripcion,
    formatoPreferido: presentacion.formatoPreferido,
    configuracionTema: {
      calidadRender: presentacion.calidadRender || "rapida",
      idiomaNarracion: presentacion.idiomaNarracion || "es",
      vozNarracion: presentacion.vozNarracion || "af_heart",
      velocidadNarracion: presentacion.velocidadNarracion || "1",
      palabrasPorMinutoNarracion: Number(presentacion.palabrasPorMinutoNarracion) || 125,
      mostrarLogoEnVideo: presentacion.mostrarLogoEnVideo !== false,
      logoRadioBorde: Number(presentacion.logoRadioBorde) || 0,
      logoTamano: Number(presentacion.logoTamano) || 100,
      logoOpacidad: Number(presentacion.logoOpacidad) || 100
    },
    colorPrimario: presentacion.colorPrimario,
    colorSecundario: presentacion.colorSecundario
  };
}

function convertirSeccionParaApi(seccion) {
  return {
    presentacionId: seccion.presentacionId,
    tipo: seccion.tipo,
    tituloInterno: seccion.titulo,
    orden: seccion.orden,
    activaEnVideo: seccion.activaEnVideo,
    visibleEnPreview: seccion.visibleEnPreview,
    duracionSugeridaSegundos: seccion.duracionSugeridaSegundos || 5,
    textoNarracion: prepararTextoSeccionNarracion(seccion),
    animacionEntrada: seccion.animacion,
    animacionSalida: "salida_suave",
    configuracion: {
      descripcion: seccion.descripcion
    }
  };
}

function convertirIntegranteParaApi(integrante) {
  return {
    presentacionId: integrante.presentacionId,
    nombreCompleto: integrante.nombre,
    cargoEmpresa: integrante.cargo,
    especialidad: integrante.especialidad,
    resumenProfesional: integrante.resumenProfesional || integrante.especialidad,
    experiencia: integrante.experiencia || "",
    cvDetalle: integrante.cvDetalle || crearCvDetalleDesdeIntegrante(integrante),
    assetFotoId: normalizarIdOpcional(integrante.assetFotoId),
    orden: integrante.orden || 0,
    activo: true
  };
}

function convertirClienteParaApi(cliente) {
  return {
    presentacionId: cliente.presentacionId,
    nombre: cliente.nombre,
    tipoCliente: cliente.tipoCliente,
    pais: cliente.pais,
    ciudad: cliente.ciudad || "",
    descripcion: cliente.descripcion,
    metricasDestacadas: cliente.metricasDestacadas || "",
    orden: cliente.orden || 0,
    activo: cliente.activo !== false
  };
}

function convertirProyectoParaApi(proyecto) {
  return {
    presentacionId: proyecto.presentacionId,
    nombre: proyecto.nombre,
    tipoSolucion: proyecto.tipoSolucion,
    descripcion: proyecto.descripcion,
    stackUsado: proyecto.stackUsado,
    resultadoImpacto: proyecto.resultadoImpacto,
    assetCapturaPrincipalId: normalizarIdOpcional(proyecto.assetCapturaPrincipalId),
    configuracion: {
      mostrarDescripcionCaptura: proyecto.mostrarDescripcionCaptura !== false,
      descripcionCaptura: proyecto.descripcionCaptura || ""
    },
    orden: proyecto.orden || 0,
    activo: proyecto.activo !== false
  };
}

function convertirPresentacionDesdeApi(datos) {
  return {
    id: datos.id,
    nombre: datos.nombre,
    empresaObjetivo: datos.empresa_objetivo,
    descripcion: datos.descripcion || "",
    formatoPreferido: datos.formato_preferido,
    calidadRender: datos.configuracion_tema?.calidadRender || "rapida",
    colorPrimario: datos.color_principal || "#d40511",
    colorSecundario: datos.color_secundario || "#22c7dd",
    idiomaNarracion: datos.configuracion_tema?.idiomaNarracion || "es",
    vozNarracion: datos.configuracion_tema?.vozNarracion || "af_heart",
    velocidadNarracion: datos.configuracion_tema?.velocidadNarracion || "1",
    palabrasPorMinutoNarracion: Number(datos.configuracion_tema?.palabrasPorMinutoNarracion) || 125,
    mostrarLogoEnVideo: datos.configuracion_tema?.mostrarLogoEnVideo !== false,
    logoRadioBorde: Number(datos.configuracion_tema?.logoRadioBorde) || 0,
    logoTamano: Number(datos.configuracion_tema?.logoTamano) || 100,
    logoOpacidad: Number(datos.configuracion_tema?.logoOpacidad) || 100,
    duracionEstimada: "03:40",
    estadoNarracion: "pendiente",
    estadoRender: "pendiente"
  };
}

function convertirSeccionDesdeApi(datos) {
  return {
    id: datos.id,
    orden: datos.orden,
    tipo: datos.tipo,
    titulo: datos.titulo_interno,
    descripcion: datos.configuracion?.descripcion || datos.texto_narracion || "",
    activaEnVideo: datos.activa_en_video,
    visibleEnPreview: datos.visible_en_preview,
    narracion: datos.texto_narracion || "",
    animacion: datos.animacion_entrada || "entrada_tecnica",
    duracionSugeridaSegundos: datos.duracion_sugerida_segundos || 5
  };
}

function convertirIntegranteDesdeApi(datos, relaciones = [], habilidadesPorId = new Map()) {
  return {
    id: datos.id,
    nombre: datos.nombre_completo,
    cargo: datos.cargo_empresa,
    especialidad: datos.especialidad,
    experiencia: datos.experiencia || "",
    resumenProfesional: datos.resumen_profesional || "",
    cvDetalle: datos.cv_detalle || {},
    assetFotoId: datos.asset_foto_id || "",
    habilidades: relaciones
      .filter((relacion) => relacion.activo !== false)
      .map((relacion) => {
        const habilidad = habilidadesPorId.get(relacion.habilidad_id);
        return [habilidad?.nombre || "Habilidad", relacion.nivel_visual || 80];
      })
  };
}

function convertirClienteDesdeApi(datos) {
  return {
    id: datos.id,
    nombre: datos.nombre,
    tipoCliente: datos.tipo_cliente,
    pais: datos.pais || "",
    ciudad: datos.ciudad || "",
    descripcion: datos.descripcion || "",
    metricasDestacadas: datos.metricas_destacadas || "",
    orden: datos.orden,
    activo: datos.activo
  };
}

function convertirProyectoDesdeApi(datos) {
  return {
    id: datos.id,
    nombre: datos.nombre,
    tipoSolucion: datos.tipo_solucion,
    descripcion: datos.descripcion || "",
    stackUsado: datos.stack_usado || "",
    resultadoImpacto: datos.resultado_impacto || "",
    assetCapturaPrincipalId: datos.asset_captura_principal_id || "",
    mostrarDescripcionCaptura: datos.configuracion?.mostrarDescripcionCaptura !== false,
    descripcionCaptura: datos.configuracion?.descripcionCaptura || "",
    orden: datos.orden,
    activo: datos.activo
  };
}

function esUuid(valor) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(valor || "");
}

function normalizarNombreClave(valor) {
  return String(valor || "").trim().toLowerCase();
}

function normalizarIdOpcional(valor) {
  const texto = String(valor || "").trim();
  return texto && texto !== "\"\"" && texto !== "null" && texto !== "undefined" ? texto : null;
}

function crearCvDetalleDesdeIntegrante(integrante) {
  return {
    resumen: integrante.resumenProfesional || integrante.especialidad || "",
    experiencia: integrante.experiencia || "",
    estudios: integrante.estudios || [],
    certificaciones: integrante.certificaciones || [],
    logros: integrante.logros || [],
    stackPrincipal: integrante.stackPrincipal || "",
    enlaces: integrante.enlaces || []
  };
}
