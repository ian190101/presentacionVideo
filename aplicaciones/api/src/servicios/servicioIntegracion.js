export async function probarConexionSupabase(datos) {
  const urlSupabase = normalizarUrl(datos.urlSupabase);
  const clave = datos.claveSecreta || datos.clavePublica;

  if (!urlSupabase || !clave) {
    return crearResultadoError({
      codigo: "supabase_configuracion_incompleta",
      errorTecnico: "Falta URL de Supabase o API key.",
      mensaje: "Debes ingresar la URL del proyecto y al menos una clave para probar la conexion.",
      soluciones: [
        "Copia la URL desde Project Settings > API en Supabase.",
        "Usa anon public para operaciones del frontend.",
        "Usa service_role solo en backend seguro, nunca en codigo publico."
      ]
    });
  }

  try {
    const respuesta = await fetch(`${urlSupabase}/rest/v1/`, {
      headers: {
        apikey: clave,
        Authorization: `Bearer ${clave}`
      }
    });

    if (!respuesta.ok) {
      return crearResultadoError({
        codigo: `supabase_http_${respuesta.status}`,
        errorTecnico: await respuesta.text(),
        mensaje: "Supabase respondio, pero rechazo la clave o la URL.",
        soluciones: [
          "Verifica que la URL pertenezca al proyecto correcto.",
          "Confirma que la API key no tenga espacios al inicio o al final.",
          "Si usas service_role, prueba desde backend y no desde frontend publico."
        ]
      });
    }

    return {
      exitosa: true,
      servicio: "Supabase",
      cuenta: {
        proyecto: obtenerProyectoSupabase(urlSupabase),
        url: urlSupabase,
        tipoClave: datos.claveSecreta ? "secreta_backend" : "publica_anon"
      }
    };
  } catch (error) {
    return crearResultadoError({
      codigo: "supabase_error_red",
      errorTecnico: error.message,
      mensaje: "No se pudo conectar con Supabase desde el backend.",
      soluciones: [
        "Revisa que la URL use HTTPS.",
        "Verifica que el proyecto Supabase este activo.",
        "Confirma que Cloudflare Workers tenga salida a internet en produccion."
      ]
    });
  }
}

export async function probarConexionCloudinary(datos) {
  const cloudName = (datos.cloudName || "").trim();
  const apiKey = (datos.clavePublica || "").trim();
  const apiSecret = (datos.claveSecreta || "").trim();

  if (!cloudName || !apiKey || !apiSecret) {
    return crearResultadoError({
      codigo: "cloudinary_configuracion_incompleta",
      errorTecnico: "Falta cloud name, API key o API secret.",
      mensaje: "Para probar Cloudinary se necesita cloud name, clave publica y clave secreta.",
      soluciones: [
        "Copia cloud name desde el dashboard de Cloudinary.",
        "Usa API Key como clave publica identificadora.",
        "Usa API Secret solo para firmar desde backend seguro."
      ]
    });
  }

  try {
    const credencial = btoa(`${apiKey}:${apiSecret}`);
    const respuesta = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/usage`, {
      headers: {
        Authorization: `Basic ${credencial}`
      }
    });

    const texto = await respuesta.text();

    if (!respuesta.ok) {
      return crearResultadoError({
        codigo: `cloudinary_http_${respuesta.status}`,
        errorTecnico: texto,
        mensaje: "Cloudinary respondio, pero rechazo las credenciales.",
        soluciones: [
          "Verifica que cloud name, API key y API secret pertenezcan a la misma cuenta.",
          "Confirma que no copiaste espacios extra.",
          "Regenera la API Secret si sospechas que fue cambiada."
        ]
      });
    }

    const datosUso = JSON.parse(texto);

    return {
      exitosa: true,
      servicio: "Cloudinary",
      cuenta: {
        cloudName,
        plan: datosUso.plan || "plan no informado",
        objetos: datosUso.objects?.usage ?? null,
        anchoBanda: datosUso.bandwidth?.usage ?? null
      }
    };
  } catch (error) {
    return crearResultadoError({
      codigo: "cloudinary_error_red",
      errorTecnico: error.message,
      mensaje: "No se pudo conectar con Cloudinary desde el backend.",
      soluciones: [
        "Revisa que las credenciales esten activas.",
        "Verifica que Cloudinary no este bloqueando la solicitud.",
        "Confirma conectividad saliente desde el entorno donde corre la API."
      ]
    });
  }
}

export async function probarConexionHuggingFace(datos) {
  return {
    exitosa: true,
    servicio: "Piper TTS",
    cuenta: {
      proveedorTts: "piper",
      ejecucion: "github_actions",
      tokenCloudflare: "no requerido",
      voces: ["es_MX-ald-medium", "es_MX-claude-high"]
    }
  };
}

function crearResultadoError({ codigo, errorTecnico, mensaje, soluciones }) {
  return {
    exitosa: false,
    error: {
      codigo,
      errorTecnico,
      mensaje,
      soluciones
    }
  };
}

function normalizarUrl(url) {
  const texto = (url || "").trim();

  if (!texto) {
    return "";
  }

  return texto.endsWith("/") ? texto.slice(0, -1) : texto;
}

function obtenerProyectoSupabase(urlSupabase) {
  try {
    return new URL(urlSupabase).hostname.split(".")[0];
  } catch {
    return "proyecto no identificado";
  }
}
