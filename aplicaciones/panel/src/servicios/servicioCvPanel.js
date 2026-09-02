import { obtenerUrlApi } from "./servicioApi.js";

export async function extraerCvPanel({ sesion, integranteId, archivo }) {
  if (!archivo) {
    throw new Error("Selecciona un archivo de CV.");
  }

  if (sesion.modoDemo || sesion.token === "token-demo") {
    const texto = await archivo.text();
    return {
      texto,
      campos: crearCamposBasicos(texto)
    };
  }

  const formulario = new FormData();
  formulario.append("integranteId", integranteId);
  formulario.append("archivo", archivo);

  const respuesta = await fetch(`${obtenerUrlApi()}/cv/extraer`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sesion.token}`
    },
    body: formulario
  });

  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    const error = new Error(datos?.error?.mensaje || "No se pudo extraer el CV.");
    error.codigo = datos?.error?.codigo;
    error.detalles = datos?.error?.detalles;
    throw error;
  }

  return datos.datos;
}

function crearCamposBasicos(texto) {
  return {
    resumen: texto.slice(0, 420),
    experiencia: texto.slice(0, 1200),
    estudios: [],
    certificaciones: [],
    logros: [],
    stackPrincipal: "",
    enlaces: [...texto.matchAll(/https?:\/\/[^\s),;]+/g)].map((coincidencia) => coincidencia[0]),
    cvCompleto: texto
  };
}
