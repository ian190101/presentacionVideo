import { AbsoluteFill, interpolate } from "remotion";
import { ContenidoCentrado } from "../ui/ContenidoCentrado.jsx";

export function EscenaEquipo({ datos, progreso, formato }) {
  const opacidad = interpolate(progreso, [0, 0.16, 0.88, 1], [0, 1, 1, 0]);

  return (
    <AbsoluteFill style={{ opacity: opacidad }}>
      <ContenidoCentrado formato={formato}>
        <h2 style={{ fontSize: formato === "vertical" ? 58 : 74, margin: 0 }}>Equipo de trabajo completo</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: formato === "vertical" ? "1fr" : "repeat(4, 1fr)",
            gap: 24,
            width: "100%",
            marginTop: 54
          }}
        >
          {datos.equipo.map((integrante, indice) => (
            <div
              key={integrante.nombre}
              style={{
                padding: 28,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.07)",
                transform: `translateY(${interpolate(progreso, [0.18, 0.42], [40 + indice * 10, 0], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp"
                })}px)`,
                borderRadius: 8
              }}
            >
              <div style={{ color: datos.colorSecundario, fontSize: 22, fontWeight: 800 }}>0{indice + 1}</div>
              <div style={{ fontSize: 32, fontWeight: 900, marginTop: 12 }}>{integrante.nombre}</div>
              <div style={{ color: "#cbd5e1", fontSize: 18, marginTop: 8 }}>{integrante.cargo}</div>
            </div>
          ))}
        </div>
      </ContenidoCentrado>
    </AbsoluteFill>
  );
}
