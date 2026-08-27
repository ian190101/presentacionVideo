import { AbsoluteFill, interpolate, staticFile, Img } from "remotion";
import { ContenidoCentrado } from "../ui/ContenidoCentrado.jsx";

export function EscenaQuienesSomos({ datos, progreso, formato }) {
  const opacidad = interpolate(progreso, [0, 0.16, 0.88, 1], [0, 1, 1, 0]);
  const desplazamiento = interpolate(progreso, [0.16, 0.42], [60, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });

  return (
    <AbsoluteFill style={{ opacity: opacidad }}>
      <ContenidoCentrado formato={formato}>
        <Img
          src={staticFile(datos.assets.logo)}
          style={{
            width: formato === "vertical" ? 300 : 360,
            height: "auto",
            marginBottom: 38,
            transform: `translateY(${desplazamiento}px)`
          }}
        />
        <div style={{ color: datos.colorSecundario, fontSize: 28, fontWeight: 800, marginBottom: 20 }}>
          Quienes somos
        </div>
        <h2 style={{ fontSize: formato === "vertical" ? 54 : 72, lineHeight: 1.08, maxWidth: 1180 }}>
          Un equipo completo para disenar, construir y acompanar tecnologia real.
        </h2>
        <p style={{ color: "#cbd5e1", fontSize: formato === "vertical" ? 28 : 34, lineHeight: 1.38, maxWidth: 1040 }}>
          {datos.quienesSomos}
        </p>
      </ContenidoCentrado>
    </AbsoluteFill>
  );
}
