import { AbsoluteFill, interpolate } from "remotion";
import { ContenidoCentrado } from "../ui/ContenidoCentrado.jsx";

export function EscenaCierre({ datos, progreso, formato }) {
  const opacidad = interpolate(progreso, [0, 0.18, 0.88, 1], [0, 1, 1, 0]);

  return (
    <AbsoluteFill style={{ opacity: opacidad }}>
      <ContenidoCentrado formato={formato}>
        <div style={{ color: datos.colorSecundario, fontSize: 30, fontWeight: 800, marginBottom: 24 }}>
          {datos.empresaObjetivo}
        </div>
        <h2 style={{ fontSize: formato === "vertical" ? 58 : 78, lineHeight: 1.08, maxWidth: 1120 }}>
          {datos.cierre}
        </h2>
        <div style={{ marginTop: 56, color: datos.colorPrimario, fontSize: 40, fontWeight: 900 }}>
          Ensamblemos el engranaje que falta.
        </div>
      </ContenidoCentrado>
    </AbsoluteFill>
  );
}
