import { AbsoluteFill, interpolate } from "remotion";
import { ContenidoCentrado } from "../ui/ContenidoCentrado.jsx";
import { ListaAnimada } from "../ui/ListaAnimada.jsx";

export function EscenaProyectos({ datos, progreso, formato }) {
  const opacidad = interpolate(progreso, [0, 0.16, 0.88, 1], [0, 1, 1, 0]);

  return (
    <AbsoluteFill style={{ opacity: opacidad }}>
      <ContenidoCentrado formato={formato}>
        <div style={{ color: datos.colorSecundario, fontSize: 28, fontWeight: 800, marginBottom: 22 }}>
          Proyectos recientes
        </div>
        <h2 style={{ fontSize: formato === "vertical" ? 58 : 74, margin: 0 }}>Soluciones que ya estan operando</h2>
        <ListaAnimada items={datos.proyectos} progreso={progreso} color={datos.colorPrimario} formato={formato} />
      </ContenidoCentrado>
    </AbsoluteFill>
  );
}
