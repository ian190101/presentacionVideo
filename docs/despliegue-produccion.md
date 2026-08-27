# Guia de despliegue a produccion

Esta guia deja el proyecto preparado para desplegar sin costo usando Cloudflare Pages, Cloudflare Workers, Supabase Free, Cloudinary Free, Hugging Face y GitHub Actions.

## Componentes

- Panel: Cloudflare Pages.
- API: Cloudflare Workers.
- Base de datos y autenticacion: Supabase.
- Imagenes: Cloudinary.
- Audios cacheados: Supabase Storage como primera opcion.
- TTS: Hugging Face con Kokoro.
- CI/CD: GitHub Actions.

## Variables publicas del panel

Configurar en Cloudflare Pages y en GitHub Actions:

- `VITE_API_URL`: URL publica del Worker.
- `VITE_SUPABASE_URL`: URL del proyecto Supabase.
- `VITE_SUPABASE_ANON_KEY`: clave `anon public` de Supabase.

Estas variables pueden estar en el frontend porque son publicas. La seguridad real depende de Supabase Auth, RLS y validacion backend.

## Secretos del Worker

Configurar en Cloudflare Workers:

```bash
wrangler secret put SUPABASE_URL --env production
wrangler secret put SUPABASE_ANON_KEY --env production
wrangler secret put SUPABASE_SERVICE_ROLE_KEY --env production
wrangler secret put CLOUDINARY_CLOUD_NAME --env production
wrangler secret put CLOUDINARY_API_KEY --env production
wrangler secret put CLOUDINARY_API_SECRET --env production
wrangler secret put HF_TOKEN --env production
wrangler secret put GITHUB_TOKEN --env production
wrangler secret put GITHUB_REPOSITORIO --env production
```

Regla: ninguna clave secreta se guarda en archivos del repositorio.

## Secretos de GitHub Actions

Configurar en el repositorio:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `VITE_API_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

El token de Cloudflare debe tener permisos para desplegar Workers y Pages del proyecto.

## Despliegue manual local

1. Instalar dependencias:

```bash
npm ci
```

2. Verificar estructura:

```bash
npm run verificar
```

3. Auditar configuracion de produccion:

```bash
npm run auditar
```

4. Construir panel:

```bash
npm run panel:build
```

5. Desplegar API:

```bash
npm run api:deploy:produccion
```

6. Desplegar panel:

```bash
npm run panel:deploy:produccion
```

## Despliegue automatico

El workflow `.github/workflows/desplegar-produccion.yml` ejecuta:

1. Instalacion limpia con `npm ci`.
2. Verificacion estructural.
3. Auditoria de produccion.
4. Build del panel.
5. Deploy del Worker.
6. Deploy de Cloudflare Pages.

Se ejecuta al hacer push a `main` o manualmente desde GitHub Actions.

## Render bajo demanda

El workflow `.github/workflows/renderizar-video.yml` genera MP4 sin desplegar nada.

Entradas:

- `formato`: `ambos`, `horizontal` o `vertical`.
- `datos_json_base64`: JSON de presentacion codificado en base64. Si queda vacio usa `scripts/renderizar-video/datos-presentacion-ejemplo.json`.

Salida:

- Artefacto `videos-presentacion` con los MP4 generados.
- Retencion de 7 dias para cuidar almacenamiento gratuito.

Render local equivalente:

```bash
npm run video:render:datos -- --formato ambos --datos scripts/renderizar-video/datos-presentacion-ejemplo.json --salida dist/videos
```

## Solicitud de render desde API

La API expone:

- `GET /render/datos?presentacionId=...`
- `POST /render/solicitar`

`POST /render/solicitar` registra la solicitud y puede disparar GitHub Actions si el Worker tiene `GITHUB_TOKEN` y `GITHUB_REPOSITORIO` configurados.

Ejemplo de cuerpo:

```json
{
  "presentacionId": "uuid",
  "formato": "ambos",
  "origen": "github_actions",
  "forzar": false
}
```

## Criterios previos a produccion

- `npm run verificar` debe pasar.
- `npm run auditar` debe pasar.
- `npm run probar` debe pasar.
- `npm run panel:build` debe pasar.
- El Worker debe tener todos los secretos cargados.
- Supabase debe tener migraciones y semillas aplicadas.
- La URL de Pages debe estar permitida en `CORS_ORIGEN_PERMITIDO`.
- Las claves secretas no deben aparecer en codigo, documentacion ni builds.
- Los limites `LIMITE_CUERPO_BYTES`, `RATE_LIMIT_MAXIMO` y `RATE_LIMIT_VENTANA_MS` deben estar configurados segun el uso real esperado.
- Revisar `docs/release-rollback.md` antes de publicar.

## Riesgos y controles

- Render de video: no se ejecuta dentro de Cloudflare Workers; sigue local o por workflow especifico posterior.
- TTS dormido: el sistema debe conservar audio cacheado y ultimo audio valido.
- Limites gratis: controlar cantidad de renders, audios y subidas.
- CORS: mantener restringido a la URL real del panel.
- RLS: probar roles antes de operar datos reales.
