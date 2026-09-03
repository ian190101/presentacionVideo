import { PlugZap } from "lucide-react";
import { useState } from "react";
import { AyudaCampo } from "./AyudaCampo.jsx";
import { BotonIcono } from "./BotonIcono.jsx";
import { CampoTexto } from "./CampoTexto.jsx";
import { mostrarConexionExitosa, mostrarErrorConexion } from "../servicios/servicioAlerta.js";
import {
  probarCloudinary,
  probarHuggingFace,
  probarSupabase
} from "../servicios/servicioIntegracionPanel.js";

export function PanelConexiones({ sesion, presentacion, ayudas }) {
  const [supabase, setSupabase] = useState({
    urlSupabase: "",
    clavePublica: "",
    claveSecreta: ""
  });
  const [cloudinary, setCloudinary] = useState({
    cloudName: "",
    clavePublica: "",
    claveSecreta: ""
  });
  const [huggingFace, setHuggingFace] = useState({
    falKey: "",
    tokenHuggingFace: ""
  });
  const [estadoSupabase, setEstadoSupabase] = useState(null);
  const [estadoCloudinary, setEstadoCloudinary] = useState(null);
  const [estadoHuggingFace, setEstadoHuggingFace] = useState(null);

  const colores = {
    colorPrimario: presentacion.colorPrimario,
    colorSecundario: presentacion.colorSecundario
  };

  async function probar(servicio) {
    const resultado = await obtenerResultadoPrueba(servicio);

    if (resultado.exitosa) {
      if (servicio === "supabase") setEstadoSupabase(resultado);
      if (servicio === "cloudinary") setEstadoCloudinary(resultado);
      if (servicio === "hugging-face") setEstadoHuggingFace(resultado);
      await mostrarConexionExitosa({ servicio: resultado.servicio, cuenta: resultado.cuenta, colores });
      return;
    }

    if (servicio === "supabase") setEstadoSupabase(resultado);
    if (servicio === "cloudinary") setEstadoCloudinary(resultado);
    if (servicio === "hugging-face") setEstadoHuggingFace(resultado);
    await mostrarErrorConexion({ error: resultado.error, colores });
  }

  function obtenerResultadoPrueba(servicio) {
    if (servicio === "supabase") {
      return probarSupabase({ token: sesion.token, configuracion: supabase });
    }

    if (servicio === "cloudinary") {
      return probarCloudinary({ token: sesion.token, configuracion: cloudinary });
    }

    return probarHuggingFace({ token: sesion.token, configuracion: huggingFace });
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
      <div className="mb-5 border-b border-slate-200 pb-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-950">
          Conexiones API
          <AyudaCampo ayuda={ayudas.clavesApi} />
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Si los campos quedan vacios, la prueba usa las variables configuradas en Cloudflare para este Worker.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ServicioConexion
          titulo="Supabase"
          ayuda={ayudas.supabaseApi}
          estado={estadoSupabase}
          onProbar={() => probar("supabase")}
        >
          <CampoTexto
            etiqueta="URL del proyecto"
            valor={supabase.urlSupabase}
            onChange={(valor) => setSupabase((actual) => ({ ...actual, urlSupabase: valor }))}
            placeholder="https://xxxx.supabase.co"
          />
          <CampoTexto
            etiqueta="Clave publica anon"
            ayuda={ayudas.clavePublica}
            valor={supabase.clavePublica}
            onChange={(valor) => setSupabase((actual) => ({ ...actual, clavePublica: valor }))}
            placeholder="anon public key"
          />
          <CampoTexto
            etiqueta="Clave secreta service_role"
            ayuda={ayudas.claveSecreta}
            valor={supabase.claveSecreta}
            onChange={(valor) => setSupabase((actual) => ({ ...actual, claveSecreta: valor }))}
            placeholder="service_role solo backend"
          />
        </ServicioConexion>

        <ServicioConexion
          titulo="Cloudinary"
          ayuda={ayudas.cloudinaryApi}
          estado={estadoCloudinary}
          onProbar={() => probar("cloudinary")}
        >
          <CampoTexto
            etiqueta="Cloud name"
            valor={cloudinary.cloudName}
            onChange={(valor) => setCloudinary((actual) => ({ ...actual, cloudName: valor }))}
            placeholder="mi-cloud"
          />
          <CampoTexto
            etiqueta="API Key publica"
            ayuda={ayudas.clavePublica}
            valor={cloudinary.clavePublica}
            onChange={(valor) => setCloudinary((actual) => ({ ...actual, clavePublica: valor }))}
            placeholder="123456789"
          />
          <CampoTexto
            etiqueta="API Secret"
            ayuda={ayudas.claveSecreta}
            valor={cloudinary.claveSecreta}
            onChange={(valor) => setCloudinary((actual) => ({ ...actual, claveSecreta: valor }))}
            placeholder="solo backend"
          />
        </ServicioConexion>

        <ServicioConexion
          titulo="Piper TTS"
          ayuda={ayudas.huggingFaceApi}
          estado={estadoHuggingFace}
          onProbar={() => probar("hugging-face")}
        >
          <CampoTexto
            etiqueta="FAL Key opcional"
            ayuda={ayudas.claveSecreta}
            valor={huggingFace.falKey}
            onChange={(valor) => setHuggingFace((actual) => ({ ...actual, falKey: valor }))}
            placeholder="opcional, no requerido para Piper"
          />
          <CampoTexto
            etiqueta="HF Token opcional"
            ayuda={ayudas.tokenHuggingFace}
            valor={huggingFace.tokenHuggingFace}
            onChange={(valor) => setHuggingFace((actual) => ({ ...actual, tokenHuggingFace: valor }))}
            placeholder="hf_..."
          />
          <div className="rounded-md bg-slate-50 p-3 text-xs leading-5 text-slate-600">
            Piper genera el audio en GitHub Actions con modelos abiertos. No necesitas token TTS en Cloudflare para la voz gratuita.
          </div>
        </ServicioConexion>
      </div>
    </section>
  );
}

function ServicioConexion({ titulo, ayuda, estado, onProbar, children }) {
  return (
    <article className="rounded-md border border-slate-200 p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-bold text-slate-950">
            {titulo}
            <AyudaCampo ayuda={ayuda} />
          </h3>
          <p className="mt-1 text-xs text-slate-500">Publica para identificar, secreta para operaciones backend.</p>
        </div>
        <BotonIcono icono={PlugZap} onClick={onProbar}>Probar conexion</BotonIcono>
      </div>
      <div className="grid gap-4">{children}</div>
      {estado && (
        <div className={`mt-4 rounded-md p-3 text-sm ${estado.exitosa ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
          {estado.exitosa ? (
            <div>
              <strong>Cuenta conectada:</strong>
              <pre className="mt-2 whitespace-pre-wrap text-xs">{JSON.stringify(estado.cuenta, null, 2)}</pre>
            </div>
          ) : (
            <div>
              <strong>{estado.error.codigo}</strong>
              <p className="mt-1">{estado.error.mensaje}</p>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
