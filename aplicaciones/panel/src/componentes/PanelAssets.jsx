import { ImageUp, Link } from "lucide-react";
import { useState } from "react";
import { AyudaCampo } from "./AyudaCampo.jsx";
import { BotonIcono } from "./BotonIcono.jsx";
import { CampoTexto } from "./CampoTexto.jsx";
import { registrarAssetDesdeUrl, subirImagenCloudinary } from "../servicios/servicioAssetsPanel.js";
import { mostrarErrorOperacion, mostrarOperacionExitosa } from "../servicios/servicioAlerta.js";

export function PanelAssets({ sesion, presentacion, ayudas, onAssetProcesado }) {
  const [tipo, setTipo] = useState("captura_proyecto");
  const [archivo, setArchivo] = useState(null);
  const [urlPublica, setUrlPublica] = useState("");

  async function manejarSubida() {
    try {
      const resultado = await subirImagenCloudinary({ sesion, presentacion, archivo, tipo });
      if (resultado.asset) {
        onAssetProcesado?.(resultado.asset);
      }
      await mostrarOperacionExitosa({
        titulo: "Asset procesado",
        mensaje: resultado.mensaje,
        detalles: `Modo: ${resultado.modo}`,
        colores: obtenerColores(presentacion)
      });
    } catch (error) {
      await mostrarErrorOperacion({
        titulo: "No se pudo subir asset",
        error,
        colores: obtenerColores(presentacion)
      });
    }
  }

  async function manejarRegistroUrl() {
    try {
      const resultado = await registrarAssetDesdeUrl({
        sesion,
        presentacion,
        datos: {
          tipo,
          proveedor: urlPublica.includes("cloudinary") ? "cloudinary" : "local",
          urlPublica,
          formato: obtenerFormato(urlPublica),
          mimeType: obtenerMime(urlPublica),
          tamanoBytes: 1,
          ancho: 1,
          alto: 1
        }
      });

      if (resultado.asset) {
        onAssetProcesado?.(resultado.asset);
      }

      await mostrarOperacionExitosa({
        titulo: "Asset registrado",
        mensaje: resultado.mensaje,
        detalles: `Modo: ${resultado.modo}`,
        colores: obtenerColores(presentacion)
      });
    } catch (error) {
      await mostrarErrorOperacion({
        titulo: "No se pudo registrar asset",
        error,
        colores: obtenerColores(presentacion)
      });
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
      <div className="mb-5 border-b border-slate-200 pb-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-950">
          Assets del video
          <AyudaCampo ayuda={ayudas.usarPlaceholder || ayudas.clavesApi} />
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Sube imagenes optimizadas o registra URLs para logos, fotos y capturas.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Tipo de asset</span>
          <select
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            value={tipo}
            onChange={(evento) => setTipo(evento.target.value)}
          >
            <option value="logo">Logo</option>
            <option value="foto_equipo">Foto equipo</option>
            <option value="captura_proyecto">Captura proyecto</option>
            <option value="fondo">Fondo</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Imagen WebP, PNG o JPG</span>
          <input
            type="file"
            accept="image/webp,image/png,image/jpeg"
            onChange={(evento) => setArchivo(evento.target.files?.[0] || null)}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
        </label>

        <div className="lg:col-span-2">
          <BotonIcono icono={ImageUp} onClick={manejarSubida} variante="primario" colorPrimario={presentacion.colorPrimario}>
            Subir a Cloudinary
          </BotonIcono>
        </div>

        <div className="lg:col-span-2">
          <CampoTexto
            etiqueta="Registrar URL existente"
            valor={urlPublica}
            onChange={setUrlPublica}
            placeholder="https://res.cloudinary.com/.../imagen.webp"
          />
          <div className="mt-3">
            <BotonIcono icono={Link} onClick={manejarRegistroUrl} variante="tenue">
              Registrar URL
            </BotonIcono>
          </div>
        </div>
      </div>
    </section>
  );
}

function obtenerColores(presentacion) {
  return {
    colorPrimario: presentacion.colorPrimario,
    colorSecundario: presentacion.colorSecundario
  };
}

function obtenerFormato(url) {
  const extension = url.split("?")[0].split(".").pop()?.toLowerCase();
  return ["webp", "png", "jpg", "jpeg"].includes(extension) ? extension : "webp";
}

function obtenerMime(url) {
  const formato = obtenerFormato(url);
  const mime = {
    webp: "image/webp",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg"
  };

  return mime[formato] || "image/webp";
}
