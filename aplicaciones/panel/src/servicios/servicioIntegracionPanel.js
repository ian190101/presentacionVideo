import { solicitarApi } from "./servicioApi.js";

export async function probarSupabase({ token, configuracion }) {
  return probarConApiOFallback({
    token,
    ruta: "/integracion/supabase",
    configuracion,
    servicio: "Supabase"
  });
}

export async function probarCloudinary({ token, configuracion }) {
  return probarConApiOFallback({
    token,
    ruta: "/integracion/cloudinary",
    configuracion,
    servicio: "Cloudinary"
  });
}

export async function probarHuggingFace({ token, configuracion }) {
  return probarConApiOFallback({
    token,
    ruta: "/integracion/hugging-face",
    configuracion,
    servicio: "Hugging Face"
  });
}

async function probarConApiOFallback({ token, ruta, configuracion, servicio }) {
  if (token && token !== "token-demo") {
    const respuesta = await solicitarApi(ruta, {
      metodo: "POST",
      token,
      cuerpo: configuracion
    });

    return respuesta.datos;
  }

  return probarModoDemo({ configuracion, servicio });
}

function probarModoDemo({ configuracion, servicio }) {
  const tieneBasico = Object.values(configuracion).some((valor) => String(valor || "").trim().length > 0);

  if (!tieneBasico) {
    return {
      exitosa: false,
      error: {
        codigo: `${servicio.toLowerCase()}_demo_sin_datos`,
        errorTecnico: "No se ingresaron credenciales en modo demo.",
        mensaje: `Faltan datos para simular la conexion con ${servicio}.`,
        soluciones: [
          "Ingresa las claves correspondientes.",
          "Configura Supabase Auth real para probar contra el Worker.",
          "No guardes claves secretas en el navegador en produccion."
        ]
      }
    };
  }

  return {
    exitosa: true,
    servicio,
    cuenta: crearCuentaDemo({ configuracion, servicio })
  };
}

function crearCuentaDemo({ configuracion, servicio }) {
  if (servicio === "Supabase") {
    return {
      proyecto: "modo-demo",
      url: configuracion.urlSupabase || "sin URL real",
      tipoClave: configuracion.claveSecreta ? "secreta_backend" : "publica_anon"
    };
  }

  if (servicio === "Hugging Face") {
    return {
      usuario: "modo-demo",
      proveedorTts: "fal-ai",
      modelo: "hexgrad/Kokoro-82M",
      token: configuracion.tokenHuggingFace ? "token recibido" : "sin token"
    };
  }

  return {
    cloudName: configuracion.cloudName || "modo-demo",
    plan: "demo",
    objetos: "no consultado"
  };
}
