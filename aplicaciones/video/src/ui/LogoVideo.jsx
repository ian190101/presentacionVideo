import { Img } from "remotion";
import { resolverAssetVideo } from "./assetVideo.js";

export function LogoVideo({ datos, formato, grande = false }) {
  const configuracion = datos.configuracionLogo || {};
  const urlLogo = datos.assets?.logo;

  if (!urlLogo || configuracion.mostrar === false) {
    return null;
  }

  const tamanoBase = grande ? (formato === "vertical" ? 260 : 300) : (formato === "vertical" ? 92 : 118);
  const tamano = tamanoBase * ((Number(configuracion.tamano) || 100) / 100);
  const radioBorde = `${Number(configuracion.radioBorde) || 0}%`;
  const opacidad = Math.max(0.2, Math.min(1, (Number(configuracion.opacidad) || 100) / 100));

  return (
    <Img
      src={resolverAssetVideo(urlLogo)}
      style={{
        width: tamano,
        height: tamano,
        objectFit: "contain",
        borderRadius: radioBorde,
        opacity: opacidad,
        display: "block"
      }}
    />
  );
}
