import { AbsoluteFill, interpolate } from "remotion";
import { ContenidoCentrado } from "../ui/ContenidoCentrado.jsx";
import { ListaAnimada } from "../ui/ListaAnimada.jsx";

export function EscenaClientes({ datos, progreso, formato }) {
  const opacidad = interpolate(progreso, [0, 0.16, 0.88, 1], [0, 1, 1, 0]);

  return (
    <AbsoluteFill style={{ opacity: opacidad }}>
      <ContenidoCentrado formato={formato}>
        <Etiqueta color={datos.colorSecundario}>Clientes</Etiqueta>
        <h2 style={{ fontSize: formato === "vertical" ? 58 : 74, margin: 0 }}>Experiencia nacional e internacional</h2>
        <ListaAnimada items={datos.clientes} progreso={progreso} color={datos.colorSecundario} formato={formato} />
      </ContenidoCentrado>
    </AbsoluteFill>
  );
}

function Etiqueta({ children, color }) {
  return <div style={{ color, fontSize: 28, fontWeight: 800, marginBottom: 22 }}>{children}</div>;
}
