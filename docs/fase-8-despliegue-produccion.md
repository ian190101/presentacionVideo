# Fase 8: Preproduccion y despliegue gratuito

Estado: terminado y revisado.

## Objetivo de la fase

Dejar el proyecto preparado para desplegar en produccion usando servicios gratuitos, sin exponer secretos y manteniendo separada la API serverless, el panel estatico y el render pesado de Remotion.

La fase no incluye desplegar con credenciales reales porque esas claves viven fuera del repositorio y deben configurarse en las cuentas de Cloudflare, GitHub, Supabase, Cloudinary y Hugging Face.

## Alcance aplicado

- Cloudflare Pages para el panel.
- Cloudflare Workers para la API.
- GitHub Actions como CI/CD.
- Variables publicas separadas de secretos.
- Headers de seguridad para Pages.
- Fallback SPA para React/Vite configurado en Workers Static Assets.
- Scripts de despliegue local.
- Guia operativa de produccion.
- Verificacion automatizada extendida.

## Archivos creados o actualizados

- `.github/workflows/desplegar-produccion.yml`
- `.gitignore`
- `.env.example`
- `aplicaciones/api/.dev.vars.example`
- `aplicaciones/api/wrangler.toml`
- `aplicaciones/panel/public/_headers`
- `wrangler.json`
- `package.json`
- `scripts/verificar-calidad/verificar-estructura.js`
- `docs/despliegue-produccion.md`

## Decisiones tecnicas

### CI/CD

Se usa GitHub Actions con tres jobs:

- `verificar`: instala dependencias, ejecuta verificacion y build del panel.
- `desplegar_api`: despliega Cloudflare Worker.
- `desplegar_panel`: despliega Cloudflare Pages.

Motivo:

- Mantiene despliegue reproducible.
- Evita pasos manuales repetitivos.
- Respeta plan gratuito.

### Secretos

Los secretos reales no se guardan en el codigo.

Se separan en:

- Variables publicas `VITE_*` para el panel.
- Secretos de Cloudflare Workers para backend.
- Secretos de GitHub Actions para CI/CD.

### Seguridad de Pages

Se agregan headers:

- `X-Frame-Options`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- `Cross-Origin-Opener-Policy`

Tambien se agregan reglas de cache para assets y placeholders.

### SPA

El panel usa `assets.not_found_handling = "single-page-application"` en `wrangler.json`.
No se incluye `_redirects` en sus assets porque Workers Static Assets rechaza la
regla `/* /index.html 200` como un bucle de redireccion. La pagina publica exportada
para Pages conserva su propio `_redirects` independiente.

## Verificacion realizada

- Se agregaron scripts de despliegue:
  - `npm run api:deploy:produccion`
  - `npm run panel:deploy:produccion`
- Se agrego workflow de GitHub Actions.
- Se agregaron plantillas de variables sin secretos reales.
- Se agregaron headers y fallback SPA del panel.
- Se documento la guia de despliegue.
- Se extendio la verificacion estructural para cubrir archivos de Fase 8.
- `npm run verificar` ejecutado correctamente.
- `npm run panel:build` ejecutado correctamente.
- `npx wrangler deploy --config aplicaciones/api/wrangler.toml --env production --dry-run` ejecutado correctamente.
- `node --check scripts/verificar-calidad/verificar-estructura.js` ejecutado correctamente.

Notas de entorno:

- `npm run panel:build` y el dry-run de Wrangler requirieron ejecutarse fuera del sandbox por restricciones locales de lectura/escritura, no por errores del proyecto.
- No se ejecuto despliegue real porque faltan credenciales reales de Cloudflare y secretos de produccion.

## Pendientes para fases posteriores

- Cargar secretos reales en Cloudflare y GitHub.
- Crear proyecto real de Cloudflare Pages si aun no existe.
- Ejecutar primer deploy real con cuenta conectada.
- Aplicar migraciones y semillas en Supabase real.
- Agregar workflow especifico para render bajo demanda con Remotion si se decide usar GitHub Actions para generar MP4 en la nube.
- Auditoria final de seguridad, rendimiento, resiliencia y datos con servicios reales conectados.

## Criterios reales de terminado

- Existe configuracion de CI/CD. Cumplido.
- Existe configuracion de Cloudflare Workers para produccion. Cumplido.
- Existe configuracion de Cloudflare Pages para SPA y headers. Cumplido.
- Existen plantillas de variables sin secretos reales. Cumplido.
- Existe guia de despliegue. Cumplido.
- El build del panel pasa. Cumplido.
- La verificacion estructural pasa. Cumplido.
- El Worker empaqueta en dry-run de produccion. Cumplido.

## Resultado

Fase 8 terminada a nivel de preproduccion. El proyecto queda listo para conectar credenciales reales y ejecutar despliegue gratuito en Cloudflare Pages + Workers con CI/CD desde GitHub Actions.
