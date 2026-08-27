# Checklist de release y rollback

## Antes de publicar

- Ejecutar `npm ci`.
- Ejecutar `npm run verificar`.
- Ejecutar `npm run auditar`.
- Ejecutar `npm run probar`.
- Ejecutar `npm run panel:build`.
- Ejecutar `npx remotion compositions aplicaciones/video/src/index.jsx`.
- Renderizar una muestra con `npm run video:render:datos -- --formato vertical --datos scripts/renderizar-video/datos-presentacion-ejemplo.json --salida dist/videos/release`.
- Confirmar que no existen secretos reales en archivos del repositorio.
- Confirmar que Cloudflare Workers tiene secretos cargados.
- Confirmar que Cloudflare Pages tiene variables `VITE_*`.
- Confirmar que Supabase tiene migraciones y semillas aplicadas.
- Confirmar que el bucket `audios` existe si se usara cache de narracion.
- Confirmar que Cloudinary permite firmas del Worker.
- Confirmar que Hugging Face responde con el token real.

## Publicacion

1. Desplegar Worker.
2. Desplegar Pages.
3. Probar login con Supabase Auth.
4. Guardar una presentacion real desde el panel.
5. Subir un asset real.
6. Generar narracion real.
7. Solicitar render.
8. Descargar artefacto o video final.
9. Verificar horizontal y vertical.

## Rollback

Cloudflare Pages:

- Abrir el proyecto en Cloudflare Pages.
- Ir a Deployments.
- Seleccionar el despliegue estable anterior.
- Usar Rollback/Redeploy sobre ese despliegue.

Cloudflare Workers:

- Abrir Workers & Pages.
- Seleccionar `presentacion-mr-robot-api`.
- Revisar versiones/despliegues.
- Restaurar el despliegue anterior si el nuevo falla.

Base de datos:

- No ejecutar migraciones destructivas sin respaldo.
- Exportar datos antes de cambios de esquema.
- Mantener migraciones incrementales y reversibles cuando sea posible.

Assets:

- No eliminar assets antiguos hasta confirmar que el nuevo video renderizado funciona.
- Mantener ultimo audio y ultimo video valido para reproduccion.

## Criterio de release aprobado

El release solo queda aprobado cuando:

- El panel esta publicado.
- La API responde en produccion.
- Login real funciona.
- CRUD principal funciona.
- Assets reales se suben o registran.
- Narracion real se genera o conserva ultimo audio valido.
- Render real produce MP4.
- No hay errores criticos en auditoria.

