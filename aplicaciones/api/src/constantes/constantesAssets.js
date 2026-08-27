export const tiposAssetPermitidos = [
  "logo",
  "foto_equipo",
  "captura_proyecto",
  "fondo",
  "audio",
  "video",
  "placeholder",
  "otro"
];

export const proveedoresAssetPermitidos = [
  "cloudinary",
  "supabase_storage",
  "local",
  "placeholder"
];

export const limitesArchivoPorTipo = {
  imagen: {
    mimePermitidos: ["image/webp", "image/png", "image/jpeg"],
    formatosPermitidos: ["webp", "png", "jpg", "jpeg"],
    tamanoMaximoBytes: 5 * 1024 * 1024
  },
  audio: {
    mimePermitidos: ["audio/mpeg", "audio/wav", "audio/ogg"],
    formatosPermitidos: ["mp3", "wav", "ogg"],
    tamanoMaximoBytes: 20 * 1024 * 1024
  },
  video: {
    mimePermitidos: ["video/mp4"],
    formatosPermitidos: ["mp4"],
    tamanoMaximoBytes: 250 * 1024 * 1024
  }
};

export const tiposAssetImagen = ["logo", "foto_equipo", "captura_proyecto", "fondo", "placeholder"];
