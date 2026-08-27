import { Composition } from "remotion";
import { PresentacionVideo } from "../videos/PresentacionVideo.jsx";
import { datosPresentacionDemo } from "../datos/datosPresentacionDemo.js";

export function RaizVideo() {
  const duracion = calcularDuracion(datosPresentacionDemo);

  return (
    <>
      <Composition
        id="PresentacionHorizontal"
        component={PresentacionVideo}
        durationInFrames={duracion}
        fps={30}
        width={1920}
        height={1080}
        calculateMetadata={({ props }) => ({
          durationInFrames: calcularDuracion(props.datos || datosPresentacionDemo)
        })}
        defaultProps={{
          datos: datosPresentacionDemo,
          formato: "horizontal"
        }}
      />
      <Composition
        id="PresentacionHorizontalRapida"
        component={PresentacionVideo}
        durationInFrames={duracion}
        fps={30}
        width={960}
        height={540}
        calculateMetadata={({ props }) => ({
          durationInFrames: calcularDuracion(props.datos || datosPresentacionDemo)
        })}
        defaultProps={{
          datos: datosPresentacionDemo,
          formato: "horizontal"
        }}
      />
      <Composition
        id="PresentacionVertical"
        component={PresentacionVideo}
        durationInFrames={duracion}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={({ props }) => ({
          durationInFrames: calcularDuracion(props.datos || datosPresentacionDemo)
        })}
        defaultProps={{
          datos: datosPresentacionDemo,
          formato: "vertical"
        }}
      />
      <Composition
        id="PresentacionVerticalRapida"
        component={PresentacionVideo}
        durationInFrames={duracion}
        fps={30}
        width={540}
        height={960}
        calculateMetadata={({ props }) => ({
          durationInFrames: calcularDuracion(props.datos || datosPresentacionDemo)
        })}
        defaultProps={{
          datos: datosPresentacionDemo,
          formato: "vertical"
        }}
      />
    </>
  );
}

function calcularDuracion(datos) {
  return (datos.secciones || [])
    .filter((seccion) => seccion.activa)
    .reduce((total, seccion) => total + Number(seccion.duracionFrames || 0), 0);
}
