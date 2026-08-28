export default {
  async fetch(solicitud, entorno) {
    return entorno.ASSETS.fetch(solicitud);
  }
};
