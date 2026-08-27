import { responderError } from "./servicioRespuesta.js";

export async function dispararWorkflowRender({ entorno, datosRender, formato, calidad = "rapida" }) {
  validarConfiguracionGitHub(entorno);

  const respuesta = await fetch(
    `https://api.github.com/repos/${entorno.GITHUB_REPOSITORIO}/actions/workflows/${entorno.GITHUB_WORKFLOW_RENDER || "renderizar-video.yml"}/dispatches`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${entorno.GITHUB_TOKEN}`,
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "presentacion-mr-robot-api",
        "X-GitHub-Api-Version": "2022-11-28"
      },
      body: JSON.stringify({
        ref: entorno.GITHUB_RAMA_RENDER || "main",
        inputs: {
          formato,
          calidad,
          datos_json_base64: convertirBase64(JSON.stringify(datosRender))
        }
      })
    }
  );

  if (!respuesta.ok) {
    throw responderError({
      codigo: `github_actions_http_${respuesta.status}`,
      mensaje: "GitHub Actions rechazo la solicitud de render.",
      estadoHttp: respuesta.status,
      detalles: await respuesta.text()
    });
  }

  return {
    workflow: entorno.GITHUB_WORKFLOW_RENDER || "renderizar-video.yml",
    repositorio: entorno.GITHUB_REPOSITORIO,
    rama: entorno.GITHUB_RAMA_RENDER || "main",
    calidad
  };
}

export function estaConfiguradoGitHubActions(entorno) {
  return Boolean(entorno.GITHUB_TOKEN && entorno.GITHUB_REPOSITORIO);
}

function validarConfiguracionGitHub(entorno) {
  const faltantes = ["GITHUB_TOKEN", "GITHUB_REPOSITORIO"].filter((clave) => !entorno[clave]);

  if (faltantes.length > 0) {
    throw responderError({
      codigo: "github_actions_configuracion_incompleta",
      mensaje: "Faltan secretos para disparar el workflow de render.",
      estadoHttp: 500,
      detalles: faltantes
    });
  }
}

function convertirBase64(texto) {
  const bytes = new TextEncoder().encode(texto);
  let binario = "";

  for (const byte of bytes) {
    binario += String.fromCharCode(byte);
  }

  return btoa(binario);
}
