import { consultarSupabase } from "./servicioSupabase.js";

const entidades = {
  seccion: {
    tabla: "seccion_video",
    orden: "orden.asc",
    tieneEliminacion: true,
    mapa: {
      presentacionId: "presentacion_id",
      tituloInterno: "titulo_interno",
      activaEnVideo: "activa_en_video",
      visibleEnPreview: "visible_en_preview",
      duracionSugeridaSegundos: "duracion_sugerida_segundos",
      textoNarracion: "texto_narracion",
      vozNarracion: "voz_narracion",
      animacionEntrada: "animacion_entrada",
      animacionSalida: "animacion_salida"
    }
  },
  cliente: {
    tabla: "cliente",
    orden: "orden.asc",
    tieneEliminacion: true,
    mapa: {
      presentacionId: "presentacion_id",
      tipoCliente: "tipo_cliente",
      metricasDestacadas: "metricas_destacadas",
      assetLogoId: "asset_logo_id"
    }
  },
  proyecto: {
    tabla: "proyecto",
    orden: "orden.asc",
    tieneEliminacion: true,
    mapa: {
      presentacionId: "presentacion_id",
      clienteId: "cliente_id",
      tipoSolucion: "tipo_solucion",
      stackUsado: "stack_usado",
      resultadoImpacto: "resultado_impacto",
      assetCapturaPrincipalId: "asset_captura_principal_id"
    }
  },
  equipo: {
    tabla: "integrante_equipo",
    orden: "orden.asc",
    tieneEliminacion: true,
    mapa: {
      presentacionId: "presentacion_id",
      nombreCompleto: "nombre_completo",
      cargoEmpresa: "cargo_empresa",
      resumenProfesional: "resumen_profesional",
      cvDetalle: "cv_detalle",
      assetFotoId: "asset_foto_id"
    }
  },
  habilidad: {
    tabla: "habilidad",
    orden: "orden.asc",
    tieneEliminacion: true,
    mapa: {
      presentacionId: "presentacion_id"
    }
  },
  habilidadIntegrante: {
    tabla: "habilidad_integrante",
    orden: "orden.asc",
    tieneEliminacion: false,
    mapa: {
      integranteId: "integrante_id",
      habilidadId: "habilidad_id",
      nivelVisual: "nivel_visual",
      tipoAnimacion: "tipo_animacion",
      velocidadAnimacion: "velocidad_animacion"
    }
  }
};

export async function listarContenido({ entorno, token, entidad, presentacionId, integranteId }) {
  const configuracion = obtenerConfiguracion(entidad);
  const filtros = [];

  if (presentacionId && entidad !== "habilidadIntegrante") {
    filtros.push(`presentacion_id=eq.${encodeURIComponent(presentacionId)}`);
  }

  if (integranteId && entidad === "habilidadIntegrante") {
    filtros.push(`integrante_id=eq.${encodeURIComponent(integranteId)}`);
  }

  if (configuracion.tieneEliminacion) {
    filtros.push("fecha_eliminacion=is.null");
  }

  const consulta = filtros.length ? `${filtros.join("&")}&` : "";

  return consultarSupabase({
    entorno,
    token,
    ruta: `${configuracion.tabla}?${consulta}select=*&order=${configuracion.orden}`
  });
}

export async function obtenerContenido({ entorno, token, entidad, id }) {
  const configuracion = obtenerConfiguracion(entidad);
  const filtros = [`id=eq.${encodeURIComponent(id)}`];

  if (configuracion.tieneEliminacion) {
    filtros.push("fecha_eliminacion=is.null");
  }

  const datos = await consultarSupabase({
    entorno,
    token,
    ruta: `${configuracion.tabla}?${filtros.join("&")}&select=*`
  });

  return datos[0] || null;
}

export async function crearContenido({ entorno, token, entidad, datos }) {
  const configuracion = obtenerConfiguracion(entidad);
  const cuerpo = convertirASupabase(configuracion, datos);
  const respuesta = await consultarConCompatibilidadProyecto({
    entorno,
    token,
    entidad,
    ruta: configuracion.tabla,
    metodo: "POST",
    cuerpo
  });

  return respuesta[0];
}

export async function actualizarContenido({ entorno, token, entidad, id, datos }) {
  const configuracion = obtenerConfiguracion(entidad);
  const cuerpo = convertirASupabase(configuracion, datos);
  const respuesta = await consultarConCompatibilidadProyecto({
    entorno,
    token,
    entidad,
    ruta: `${configuracion.tabla}?id=eq.${encodeURIComponent(id)}`,
    metodo: "PATCH",
    cuerpo
  });

  return respuesta[0];
}

export async function eliminarContenido({ entorno, token, entidad, id }) {
  const configuracion = obtenerConfiguracion(entidad);
  const cuerpo = configuracion.tieneEliminacion
    ? { fecha_eliminacion: new Date().toISOString() }
    : { activo: false };

  const respuesta = await consultarSupabase({
    entorno,
    token,
    ruta: `${configuracion.tabla}?id=eq.${encodeURIComponent(id)}`,
    metodo: "PATCH",
    cuerpo
  });

  return respuesta[0];
}

function obtenerConfiguracion(entidad) {
  const configuracion = entidades[entidad];

  if (!configuracion) {
    throw new Error(`Entidad no soportada: ${entidad}`);
  }

  return configuracion;
}

function convertirASupabase(configuracion, datos) {
  const salida = {};

  for (const [campo, valor] of Object.entries(datos)) {
    const campoSupabase = configuracion.mapa[campo] || convertirSnakeCase(campo);
    salida[campoSupabase] = valor;
  }

  return salida;
}

function convertirSnakeCase(campo) {
  return campo.replace(/[A-Z]/g, (letra) => `_${letra.toLowerCase()}`);
}

async function consultarConCompatibilidadProyecto({ entorno, token, entidad, ruta, metodo, cuerpo }) {
  try {
    return await consultarSupabase({ entorno, token, ruta, metodo, cuerpo });
  } catch (error) {
    if (!(await requiereCompatibilidadConfiguracionProyecto({ entidad, cuerpo, error }))) {
      throw error;
    }

    const cuerpoCompatible = { ...cuerpo };
    delete cuerpoCompatible.configuracion;

    return consultarSupabase({ entorno, token, ruta, metodo, cuerpo: cuerpoCompatible });
  }
}

async function requiereCompatibilidadConfiguracionProyecto({ entidad, cuerpo, error }) {
  if (entidad !== "proyecto" || !Object.prototype.hasOwnProperty.call(cuerpo, "configuracion")) {
    return false;
  }

  if (!(error instanceof Response)) {
    return false;
  }

  const datos = await error.clone().json().catch(() => null);
  const detalles = datos?.error?.detalles;

  return detalles?.code === "PGRST204" && String(detalles?.message || "").includes("'configuracion'");
}
