import { AbsoluteFill, interpolate } from "remotion";
import { ContenidoCentrado } from "../ui/ContenidoCentrado.jsx";

export function EscenaHabilidades({ datos, progreso, formato }) {
  const opacidad = interpolate(progreso, [0, 0.16, 0.9, 1], [0, 1, 1, 0]);
  const esVertical = formato === "vertical";
  const columnas = esVertical ? "repeat(2, minmax(0, 1fr))" : "repeat(2, 1fr)";

  return (
    <AbsoluteFill style={{ opacity: opacidad }}>
      <ContenidoCentrado formato={formato}>
        <div style={{ color: datos.colorSecundario, fontSize: esVertical ? 28 : 28, fontWeight: 800, marginBottom: esVertical ? 16 : 20 }}>
          Stack y habilidades
        </div>
        <h2 style={{ fontSize: esVertical ? 46 : 70, margin: 0 }}>Capacidades listas para ejecucion</h2>
        <div style={{ display: "grid", gridTemplateColumns: columnas, gap: esVertical ? 16 : 24, width: "100%", marginTop: esVertical ? 34 : 44 }}>
          {datos.equipo.slice(0, 4).map((integrante, indice) => (
            <div
              key={integrante.nombre}
              style={{
                border: "1px solid rgba(255,255,255,0.16)",
                background: "rgba(255,255,255,0.07)",
                borderRadius: 8,
                padding: esVertical ? 16 : 28
              }}
            >
              <div style={{ fontSize: esVertical ? 22 : 30, fontWeight: 900, marginBottom: esVertical ? 12 : 18 }}>
                {integrante.nombre}
              </div>
              <div style={{ display: "grid", gap: esVertical ? 10 : 14 }}>
                {integrante.habilidades.map(([nombre, nivel], habilidadIndice) => {
                  const avance = interpolate(
                    progreso,
                    [0.18 + indice * 0.04 + habilidadIndice * 0.04, 0.58],
                    [0, nivel],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                  );

                  return (
                    <div key={nombre}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: esVertical ? 15 : 18, color: "#cbd5e1" }}>
                        <span>{nombre}</span>
                        <span>{Math.round(avance)}%</span>
                      </div>
                      <div style={{ height: esVertical ? 9 : 12, borderRadius: 999, background: "rgba(255,255,255,0.14)", marginTop: esVertical ? 6 : 8 }}>
                        <div
                          style={{
                            height: esVertical ? 9 : 12,
                            width: `${avance}%`,
                            borderRadius: 999,
                            background: datos.colorSecundario
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ContenidoCentrado>
    </AbsoluteFill>
  );
}
