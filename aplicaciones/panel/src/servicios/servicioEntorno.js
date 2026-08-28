export function obtenerVariableEntorno(nombre, respaldo = "") {
  const configuracionRuntime = window.__CONFIGURACION_ENTORNO__ || {};

  return configuracionRuntime[nombre] || import.meta.env[nombre] || respaldo;
}
