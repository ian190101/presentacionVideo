import { staticFile } from "remotion";

export function resolverAssetVideo(ruta) {
  if (!ruta) {
    return "";
  }

  if (/^https?:\/\//i.test(ruta)) {
    return ruta;
  }

  return staticFile(ruta);
}
