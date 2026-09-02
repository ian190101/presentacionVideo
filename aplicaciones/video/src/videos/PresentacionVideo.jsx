import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { EscenaClientes } from "../escenas/EscenaClientes.jsx";
import { EscenaCierre } from "../escenas/EscenaCierre.jsx";
import { EscenaEquipo } from "../escenas/EscenaEquipo.jsx";
import { EscenaHabilidades } from "../escenas/EscenaHabilidades.jsx";
import { EscenaIntro } from "../escenas/EscenaIntro.jsx";
import { EscenaProyectos } from "../escenas/EscenaProyectos.jsx";
import { EscenaQuienesSomos } from "../escenas/EscenaQuienesSomos.jsx";
import { crearTemaVideo } from "../utilidades/colorVideo.js";

const componentesPorTipo = {
  intro: EscenaIntro,
  clientes: EscenaClientes,
  proyectos: EscenaProyectos,
  quienes_somos: EscenaQuienesSomos,
  equipo: EscenaEquipo,
  habilidades: EscenaHabilidades,
  cierre: EscenaCierre
};

export function PresentacionVideo({ datos, formato }) {
  const frame = useCurrentFrame();
  const config = useVideoConfig();
  const escenas = crearEscenasActivas(datos);
  const tema = crearTemaVideo(datos);

  return (
    <AbsoluteFill
      style={{
        background:
          `radial-gradient(circle at 50% 18%, ${tema.colorPrimario}55, transparent 34%), linear-gradient(145deg, ${tema.fondoPrincipal}, ${tema.fondoSecundario} 58%, ${tema.fondoAcento})`,
        color: "white",
        fontFamily: "Inter, Arial, sans-serif",
        overflow: "hidden"
      }}
    >
      {datos.audioNarracionUrl && <Audio src={resolverFuenteAudio(datos.audioNarracionUrl)} volume={0.82} />}
      <FondoTecnico colorPrimario={tema.colorPrimario} colorSecundario={tema.colorSecundario} />
      {escenas.map((escena) => {
        const Componente = escena.componente;
        const progreso = calcularProgreso(frame, escena.inicio, escena.duracion);

        if (progreso <= 0 || progreso >= 1.12) {
          return null;
        }

        return (
          <Componente
            key={escena.inicio}
            datos={datos}
            formato={formato}
            progreso={progreso}
            ancho={config.width}
            alto={config.height}
          />
        );
      })}
    </AbsoluteFill>
  );
}

function resolverFuenteAudio(rutaAudio) {
  if (/^https?:\/\//i.test(rutaAudio)) {
    return rutaAudio;
  }

  return staticFile(rutaAudio);
}

function crearEscenasActivas(datos) {
  let inicio = 0;

  return [...(datos.secciones || [])]
    .filter((seccion) => seccion.activa)
    .sort((a, b) => a.orden - b.orden)
    .map((seccion) => {
      const escena = {
        inicio,
        duracion: seccion.duracionFrames,
        componente: componentesPorTipo[seccion.tipo],
        tipo: seccion.tipo
      };
      inicio += seccion.duracionFrames;
      return escena;
    })
    .filter((escena) => escena.componente);
}

function calcularProgreso(frame, inicio, duracion) {
  return (frame - inicio) / duracion;
}

function FondoTecnico({ colorPrimario, colorSecundario }) {
  const frame = useCurrentFrame();
  const desplazamiento = frame % 44;

  return (
    <AbsoluteFill
      style={{
        opacity: 0.28,
        backgroundImage: `linear-gradient(${colorPrimario}44 1px, transparent 1px), linear-gradient(90deg, ${colorSecundario}33 1px, transparent 1px)`,
        backgroundPosition: `${desplazamiento}px ${desplazamiento}px`,
        backgroundSize: "44px 44px"
      }}
    />
  );
}
