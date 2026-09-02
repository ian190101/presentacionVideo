import { AbsoluteFill, Audio, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { EscenaClientes } from "../escenas/EscenaClientes.jsx";
import { EscenaCierre } from "../escenas/EscenaCierre.jsx";
import { EscenaEquipo } from "../escenas/EscenaEquipo.jsx";
import { EscenaHabilidades } from "../escenas/EscenaHabilidades.jsx";
import { EscenaIntro } from "../escenas/EscenaIntro.jsx";
import { EscenaProyectos } from "../escenas/EscenaProyectos.jsx";
import { EscenaQuienesSomos } from "../escenas/EscenaQuienesSomos.jsx";
import { crearTemaVideo } from "../utilidades/colorVideo.js";
import { resolverAssetVideo } from "../ui/assetVideo.js";
import { LogoVideo } from "../ui/LogoVideo.jsx";

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
      {datos.audioNarracionUrl && <Audio src={resolverAssetVideo(datos.audioNarracionUrl)} volume={0.82} />}
      <FondoTecnico colorPrimario={tema.colorPrimario} colorSecundario={tema.colorSecundario} />
      <div style={{ position: "absolute", top: formato === "vertical" ? 54 : 58, left: formato === "vertical" ? 54 : 68, zIndex: 8 }}>
        <LogoVideo datos={datos} formato={formato} />
      </div>
      {escenas.map((escena) => {
        const Componente = escena.componente;
        const progreso = calcularProgreso(frame, escena.inicio, escena.duracion);

        if (progreso <= 0 || progreso >= 1.12) {
          return null;
        }

        return (
          <AbsoluteFill key={escena.inicio} style={crearEstiloAnimacion(escena.animacion, progreso)}>
            <Componente
              datos={datos}
              formato={formato}
              progreso={progreso}
              ancho={config.width}
              alto={config.height}
            />
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
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
        tipo: seccion.tipo,
        animacion: seccion.animacion || "entrada_tecnica"
      };
      inicio += seccion.duracionFrames;
      return escena;
    })
    .filter((escena) => escena.componente);
}

function crearEstiloAnimacion(animacion, progreso) {
  const opacidad = interpolate(progreso, [0, 0.14, 0.9, 1], [0, 1, 1, 0]);

  if (animacion === "paneles_deslizantes") {
    return { opacity: opacidad, transform: `translateX(${interpolate(progreso, [0, 0.28], [90, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)` };
  }

  if (animacion === "zoom_ejecutivo") {
    return { opacity: opacidad, transform: `scale(${interpolate(progreso, [0, 0.26], [0.92, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})` };
  }

  if (animacion === "tarjetas_escalonadas") {
    return { opacity: opacidad, transform: `translateY(${interpolate(progreso, [0, 0.26], [70, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)` };
  }

  if (animacion === "lineas_conectadas") {
    return { opacity: opacidad, filter: `brightness(${interpolate(progreso, [0, 0.25], [0.72, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})` };
  }

  return { opacity: opacidad };
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
