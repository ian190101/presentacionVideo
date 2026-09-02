import { responderError } from "./servicioRespuesta.js";

export async function dispararWorkflowRender({ entorno, datosRender, formato, calidad = "rapida" }) {
  const configuracion = obtenerConfiguracionGitHub(entorno);
  const fechaSolicitud = new Date(Date.now() - 15000).toISOString();
  const rutaWorkflow = `https://api.github.com/repos/${configuracion.repositorio}/actions/workflows/${configuracion.workflow}`;

  const respuesta = await fetch(
    `${rutaWorkflow}/dispatches`,
    {
      method: "POST",
      headers: crearCabecerasGitHub(configuracion.token),
      body: JSON.stringify({
        ref: configuracion.rama,
        inputs: {
          formato,
          calidad,
          datos_json_base64: convertirBase64(JSON.stringify(datosRender))
        }
      })
    }
  );

  if (!respuesta.ok) {
    throw await crearErrorGitHub(respuesta);
  }

  const datosRespuesta = await leerJsonOpcional(respuesta);
  const runReciente = datosRespuesta?.html_url
    ? datosRespuesta
    : await obtenerRunReciente({ configuracion, fechaSolicitud });

  return {
    workflow: configuracion.workflow,
    repositorio: configuracion.repositorio,
    rama: configuracion.rama,
    calidad,
    urlWorkflow: `https://github.com/${configuracion.repositorio}/actions/workflows/${configuracion.workflow}`,
    urlRun: runReciente?.html_url || null,
    idRun: runReciente?.id || datosRespuesta?.workflow_run_id || null,
    mensajeDescarga: "Cuando el run termine, entra a la URL del workflow/run y descarga los artefactos pagina-presentacion y videos-presentacion."
  };
}

export function estaConfiguradoGitHubActions(entorno) {
  return Boolean(limpiar(entorno.GITHUB_TOKEN) && limpiar(entorno.GITHUB_REPOSITORIO));
}

function obtenerConfiguracionGitHub(entorno) {
  const faltantes = ["GITHUB_TOKEN", "GITHUB_REPOSITORIO"].filter((clave) => !entorno[clave]);

  if (faltantes.length > 0) {
    throw responderError({
      codigo: "github_actions_configuracion_incompleta",
      mensaje: "Faltan secretos para disparar el workflow de render.",
      estadoHttp: 500,
      detalles: faltantes
    });
  }

  const token = limpiar(entorno.GITHUB_TOKEN);
  const repositorio = limpiar(entorno.GITHUB_REPOSITORIO);
  const workflow = limpiar(entorno.GITHUB_WORKFLOW_RENDER) || "renderizar-video.yml";
  const rama = limpiar(entorno.GITHUB_RAMA_RENDER) || "main";

  if (!token || !repositorio) {
    throw responderError({
      codigo: "github_actions_configuracion_incompleta",
      mensaje: "Faltan secretos para disparar el workflow de render.",
      estadoHttp: 500,
      detalles: ["GITHUB_TOKEN", "GITHUB_REPOSITORIO"].filter((clave) => !limpiar(entorno[clave]))
    });
  }

  return { token, repositorio, workflow, rama };
}

async function obtenerRunReciente({ configuracion, fechaSolicitud }) {
  await esperar(1200);

  const respuesta = await fetch(
    `https://api.github.com/repos/${configuracion.repositorio}/actions/workflows/${configuracion.workflow}/runs?branch=${encodeURIComponent(
      configuracion.rama
    )}&event=workflow_dispatch&per_page=5`,
    {
      headers: crearCabecerasGitHub(configuracion.token)
    }
  );

  if (!respuesta.ok) {
    return null;
  }

  const datos = await respuesta.json().catch(() => ({}));
  const runs = datos.workflow_runs || [];

  return runs.find((run) => run.created_at >= fechaSolicitud) || runs[0] || null;
}

function crearCabecerasGitHub(token) {
  return {
    "Authorization": `Bearer ${token}`,
    "Accept": "application/vnd.github+json",
    "Content-Type": "application/json",
    "User-Agent": "presentacion-mr-robot-api",
    "X-GitHub-Api-Version": "2022-11-28"
  };
}

async function crearErrorGitHub(respuesta) {
  const detalles = await leerTextoOpcional(respuesta);
  const permisosAceptados = respuesta.headers.get("X-Accepted-GitHub-Permissions");
  const configuracionErrores = {
    401: {
      codigo: "github_token_invalido",
      mensaje: "GitHub rechazo el token de render. El token no es valido o expiro."
    },
    403: {
      codigo: "github_token_sin_permiso_actions",
      mensaje: "GitHub rechazo el render porque el token no tiene permiso para disparar Actions."
    },
    404: {
      codigo: "github_workflow_no_encontrado",
      mensaje: "GitHub no encontro el repositorio o el workflow configurado para renderizar."
    },
    422: {
      codigo: "github_workflow_dispatch_invalido",
      mensaje: "GitHub rechazo los datos enviados al workflow de render."
    }
  };
  const error = configuracionErrores[respuesta.status] || {
    codigo: `github_actions_http_${respuesta.status}`,
    mensaje: "GitHub Actions rechazo la solicitud de render."
  };

  return responderError({
    ...error,
    estadoHttp: respuesta.status,
    detalles: {
      respuesta: detalles,
      permisosAceptados,
      solucion: "Usa un token fine-grained con acceso al repositorio ian190101/presentacionVideo y permiso Actions: Read and write."
    }
  });
}

async function leerJsonOpcional(respuesta) {
  const texto = await leerTextoOpcional(respuesta);

  if (!texto) {
    return null;
  }

  try {
    return JSON.parse(texto);
  } catch {
    return null;
  }
}

async function leerTextoOpcional(respuesta) {
  return respuesta.text().catch(() => "");
}

function esperar(ms) {
  return new Promise((resolver) => {
    setTimeout(resolver, ms);
  });
}

function limpiar(valor) {
  return String(valor || "").trim();
}

function convertirBase64(texto) {
  const bytes = new TextEncoder().encode(texto);
  let binario = "";

  for (const byte of bytes) {
    binario += String.fromCharCode(byte);
  }

  return btoa(binario);
}
