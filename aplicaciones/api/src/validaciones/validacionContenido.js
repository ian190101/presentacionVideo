import { estaEnLista, limpiarTexto, textoEntre } from "./validacionComun.js";

const camposUuidOpcionales = new Set(["clienteId", "assetLogoId", "assetCapturaPrincipalId", "assetFotoId"]);

const configuracionEntidad = {
  seccion: {
    camposPermitidos: ["presentacionId", "tipo", "tituloInterno", "orden", "activaEnVideo", "visibleEnPreview", "duracionSugeridaSegundos", "textoNarracion", "vozNarracion", "animacionEntrada", "animacionSalida", "configuracion"],
    requeridosCrear: ["presentacionId", "tipo", "tituloInterno", "orden"],
    tiposPermitidos: ["eslogan", "cliente", "proyecto", "quienes_somos", "equipo", "habilidad", "cierre_comercial", "personalizada"]
  },
  cliente: {
    camposPermitidos: ["presentacionId", "nombre", "tipoCliente", "pais", "ciudad", "descripcion", "metricasDestacadas", "assetLogoId", "orden", "activo"],
    requeridosCrear: ["presentacionId", "nombre", "tipoCliente"],
    tiposPermitidos: ["internacional", "nacional", "emprendimiento", "empresa_nueva", "otro"]
  },
  proyecto: {
    camposPermitidos: ["presentacionId", "clienteId", "nombre", "descripcion", "tipoSolucion", "stackUsado", "resultadoImpacto", "assetCapturaPrincipalId", "configuracion", "orden", "activo"],
    requeridosCrear: ["presentacionId", "nombre", "tipoSolucion"],
    tiposPermitidos: ["web", "movil", "automatizacion", "sistema_interno", "ecommerce", "catalogo", "otro"]
  },
  equipo: {
    camposPermitidos: ["presentacionId", "nombreCompleto", "cargoEmpresa", "especialidad", "resumenProfesional", "experiencia", "cvDetalle", "assetFotoId", "enlaces", "orden", "activo"],
    requeridosCrear: ["presentacionId", "nombreCompleto", "cargoEmpresa", "especialidad"]
  },
  habilidad: {
    camposPermitidos: ["presentacionId", "nombre", "categoria", "icono", "color", "activo", "orden"],
    requeridosCrear: ["presentacionId", "nombre", "categoria"],
    tiposPermitidos: ["frontend", "backend", "bases_datos", "automatizacion", "devops", "diseno_sistemas", "seguridad", "integraciones", "gestion", "otro"]
  },
  habilidadIntegrante: {
    camposPermitidos: ["integranteId", "habilidadId", "nivelVisual", "tipoAnimacion", "velocidadAnimacion", "orden", "activo"],
    requeridosCrear: ["integranteId", "habilidadId", "nivelVisual"]
  }
};

export function validarContenidoEntidad(entidad, entrada, modo = "crear") {
  const configuracion = configuracionEntidad[entidad];
  const errores = [];

  if (!configuracion) {
    return {
      valida: false,
      errores: [{ campo: "entidad", mensaje: "La entidad solicitada no esta soportada." }],
      datos: {}
    };
  }

  const datos = {};

  for (const campo of configuracion.camposPermitidos) {
    if (Object.prototype.hasOwnProperty.call(entrada || {}, campo)) {
      datos[campo] = normalizarCampo(campo, entrada[campo]);
    }
  }

  if (modo === "crear") {
    for (const campo of configuracion.requeridosCrear) {
      if (datos[campo] === undefined || datos[campo] === "") {
        errores.push({ campo, mensaje: "Este campo es obligatorio." });
      }
    }
  }

  validarReglasEntidad({ entidad, datos, errores, configuracion });

  return {
    valida: errores.length === 0,
    errores,
    datos
  };
}

function validarReglasEntidad({ entidad, datos, errores, configuracion }) {
  if (datos.nombre !== undefined && !textoEntre(datos.nombre, 2, 160)) {
    errores.push({ campo: "nombre", mensaje: "El nombre debe tener entre 2 y 160 caracteres." });
  }

  if (datos.tituloInterno !== undefined && !textoEntre(datos.tituloInterno, 2, 120)) {
    errores.push({ campo: "tituloInterno", mensaje: "El titulo interno debe tener entre 2 y 120 caracteres." });
  }

  if (datos.presentacionId !== undefined && !datos.presentacionId) {
    errores.push({ campo: "presentacionId", mensaje: "La presentacion es obligatoria." });
  }

  if (datos.tipo !== undefined && configuracion.tiposPermitidos && !estaEnLista(datos.tipo, configuracion.tiposPermitidos)) {
    errores.push({ campo: "tipo", mensaje: "El tipo no esta permitido." });
  }

  if (datos.tipoCliente !== undefined && !estaEnLista(datos.tipoCliente, configuracion.tiposPermitidos)) {
    errores.push({ campo: "tipoCliente", mensaje: "El tipo de cliente no esta permitido." });
  }

  if (datos.tipoSolucion !== undefined && !estaEnLista(datos.tipoSolucion, configuracion.tiposPermitidos)) {
    errores.push({ campo: "tipoSolucion", mensaje: "El tipo de solucion no esta permitido." });
  }

  if (datos.categoria !== undefined && !estaEnLista(datos.categoria, configuracion.tiposPermitidos)) {
    errores.push({ campo: "categoria", mensaje: "La categoria no esta permitida." });
  }

  if (entidad === "habilidadIntegrante" && datos.nivelVisual !== undefined && (datos.nivelVisual < 0 || datos.nivelVisual > 100)) {
    errores.push({ campo: "nivelVisual", mensaje: "El nivel visual debe estar entre 0 y 100." });
  }
}

function normalizarCampo(campo, valor) {
  if (camposUuidOpcionales.has(campo)) {
    return normalizarUuidOpcional(valor);
  }

  if (["orden", "duracionSugeridaSegundos", "nivelVisual"].includes(campo)) {
    return Number(valor);
  }

  if (["velocidadAnimacion"].includes(campo)) {
    return valor === null || valor === "" ? null : Number(valor);
  }

  if (["activaEnVideo", "visibleEnPreview", "activo"].includes(campo)) {
    return Boolean(valor);
  }

  if (["configuracion", "enlaces", "cvDetalle"].includes(campo)) {
    return valor ?? (campo === "enlaces" ? [] : {});
  }

  return limpiarTexto(valor);
}

function normalizarUuidOpcional(valor) {
  const texto = limpiarTexto(typeof valor === "string" ? valor : "");

  if (!texto || texto === "\"\"" || texto === "null" || texto === "undefined") {
    return null;
  }

  return texto;
}
