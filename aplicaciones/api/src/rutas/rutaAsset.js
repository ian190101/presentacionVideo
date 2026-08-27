import { exigirUsuarioAutenticado } from "../servicios/servicioAutenticacion.js";
import { crearFirmaSubidaImagen, listarAssets, registrarAsset } from "../servicios/servicioAsset.js";
import { responderError, responderJson } from "../servicios/servicioRespuesta.js";
import { validarRegistroAsset } from "../validaciones/validacionAsset.js";

export async function manejarRutaAsset(solicitud, entorno) {
  const url = new URL(solicitud.url);
  const partes = url.pathname.split("/").filter(Boolean);
  const accion = partes[1];
  const usuario = await exigirUsuarioAutenticado(solicitud, entorno);

  if (solicitud.method === "GET" && !accion) {
    const assets = await listarAssets({
      entorno,
      token: usuario.token,
      presentacionId: url.searchParams.get("presentacionId")
    });

    return responderJson({ datos: assets });
  }

  if (solicitud.method === "POST" && accion === "registrar") {
    const cuerpo = await solicitud.json();
    const validacion = validarRegistroAsset(cuerpo);

    if (!validacion.valida) {
      return responderError({
        codigo: "asset_invalido",
        mensaje: "El asset no cumple las validaciones requeridas.",
        estadoHttp: 422,
        detalles: validacion.errores
      });
    }

    const asset = await registrarAsset({
      entorno,
      token: usuario.token,
      usuario,
      datos: validacion.datos
    });

    return responderJson({ datos: asset }, 201);
  }

  if (solicitud.method === "POST" && accion === "firma-subida-imagen") {
    const cuerpo = await solicitud.json();
    const firma = await crearFirmaSubidaImagen({ entorno, datos: cuerpo });
    return responderJson({ datos: firma });
  }

  return responderError({
    codigo: "metodo_no_permitido",
    mensaje: "Metodo no permitido para assets.",
    estadoHttp: 405
  });
}
