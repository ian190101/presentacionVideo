import { AbsoluteFill, Img, interpolate } from "remotion";
import { ContenidoCentrado } from "../ui/ContenidoCentrado.jsx";
import { resolverAssetVideo } from "../ui/assetVideo.js";

export function EscenaProyectos({ datos, progreso, formato }) {
  const opacidad = interpolate(progreso, [0, 0.16, 0.88, 1], [0, 1, 1, 0]);
  const esVertical = formato === "vertical";
  const proyectos = normalizarProyectos(datos.proyectos);

  return (
    <AbsoluteFill style={{ opacity: opacidad }}>
      <ContenidoCentrado formato={formato}>
        <div style={{ color: datos.colorSecundario, fontSize: 28, fontWeight: 800, marginBottom: 22 }}>
          Proyectos recientes
        </div>
        <h2 style={{ fontSize: esVertical ? 54 : 70, margin: 0 }}>Soluciones que ya estan operando</h2>
        <div style={{ display: "grid", gridTemplateColumns: esVertical ? "1fr" : "repeat(3, 1fr)", gap: esVertical ? 18 : 24, width: "100%", marginTop: esVertical ? 34 : 44 }}>
          {proyectos.slice(0, esVertical ? 3 : 6).map((proyecto, indice) => {
            const avance = interpolate(progreso, [0.18 + indice * 0.05, 0.5], [46, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp"
            });

            return (
              <div
                key={`${proyecto.nombre}-${indice}`}
                style={{
                  overflow: "hidden",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  transform: `translateY(${avance}px)`
                }}
              >
                <div style={{ aspectRatio: "16 / 9", background: "rgba(255,255,255,0.08)" }}>
                  {proyecto.capturaUrl || datos.assets?.capturaProyecto ? (
                    <Img src={resolverAssetVideo(proyecto.capturaUrl || datos.assets.capturaProyecto)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: datos.colorSecundario, fontSize: 24, fontWeight: 900 }}>
                      Captura pendiente
                    </div>
                  )}
                </div>
                <div style={{ padding: esVertical ? 16 : 20, textAlign: "left" }}>
                  <div style={{ color: datos.colorPrimario, fontSize: esVertical ? 22 : 26, fontWeight: 900 }}>{proyecto.nombre}</div>
                  {proyecto.mostrarDescripcionCaptura && (
                    <div style={{ marginTop: 8, color: "#dbeafe", fontSize: esVertical ? 16 : 18, lineHeight: 1.35 }}>
                      {proyecto.descripcionCaptura || proyecto.descripcion}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ContenidoCentrado>
    </AbsoluteFill>
  );
}

function normalizarProyectos(proyectos) {
  return (proyectos || []).map((proyecto) => {
    if (typeof proyecto === "string") {
      return {
        nombre: proyecto,
        descripcion: "",
        capturaUrl: "",
        mostrarDescripcionCaptura: false,
        descripcionCaptura: ""
      };
    }

    return proyecto;
  });
}
