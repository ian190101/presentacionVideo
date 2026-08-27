import { AbsoluteFill, interpolate } from "remotion";
import { ContenidoCentrado } from "../ui/ContenidoCentrado.jsx";

export function EscenaIntro({ datos, progreso, formato }) {
  const escala = interpolate(progreso, [0, 0.24, 1], [0.92, 1, 1]);
  const opacidad = interpolate(progreso, [0, 0.18, 0.88, 1], [0, 1, 1, 0]);

  return (
    <AbsoluteFill style={{ opacity: opacidad, transform: `scale(${escala})` }}>
      <ContenidoCentrado formato={formato}>
        <div style={{ color: datos.colorPrimario, fontWeight: 900, fontSize: formato === "vertical" ? 76 : 92 }}>
          MR ROBOT
        </div>
        <div style={{ letterSpacing: 14, fontWeight: 800, marginBottom: 46 }}>BOLIVIA</div>
        <h1 style={{ fontSize: formato === "vertical" ? 48 : 64, lineHeight: 1.08, maxWidth: 1100 }}>
          {datos.eslogan}
        </h1>
        <p style={{ color: "#cbd5e1", fontSize: formato === "vertical" ? 28 : 34, lineHeight: 1.35, maxWidth: 980 }}>
          {datos.subtitulo}
        </p>
      </ContenidoCentrado>
    </AbsoluteFill>
  );
}
