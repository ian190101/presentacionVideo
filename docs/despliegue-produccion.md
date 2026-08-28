# Guia de despliegue a produccion

Esta guia deja el proyecto preparado para desplegar sin costo usando Cloudflare Pages, Cloudflare Workers, Supabase Free, Cloudinary Free, Hugging Face y GitHub Actions solo como CI.

## Componentes

- Panel: Cloudflare Pages.
- API: Cloudflare Workers.
- Base de datos y autenticacion: Supabase.
- Imagenes: Cloudinary.
- Audios cacheados: Supabase Storage como primera opcion.
- TTS: Hugging Face con Kokoro.
- CI: GitHub Actions solo valida calidad. El deploy y los secretos reales viven en Cloudflare.

## Variables publicas del panel

Configurar en Cloudflare Pages:

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

No guardar secretos reales en GitHub Actions.

GitHub Actions solo ejecuta CI con valores placeholder para compilar:

- `npm run verificar`
- `npm run auditar`
- `npm run probar`
- `npm run panel:build`
- `npm run pagina:exportar`

El deploy se hace desde Cloudflare conectado al repositorio o desde Wrangler local autenticado en tu maquina. Asi evitamos guardar `CLOUDFLARE_API_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`, `CLOUDINARY_API_SECRET` o `HF_TOKEN` en GitHub.

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

## CI en GitHub

El workflow `.github/workflows/desplegar-produccion.yml` ejecuta verificaciones en cada push a `main`, en pull requests y manualmente.

Ejecuta:

1. Instalacion limpia con `npm ci`.
2. Verificacion estructural.
3. Auditoria de produccion.
4. Build del panel.
5. Exportacion de pagina publica.

No despliega a Cloudflare y no lee secrets reales.

## Despliegue recomendado desde Cloudflare

### Panel administrativo en Cloudflare Pages

1. Ir a Cloudflare Dashboard.
2. Entrar a `Workers & Pages`.
3. Crear un proyecto Pages conectado al repo `ian190101/presentacionVideo`.
4. Build command:

```bash
npm run panel:build
```

5. Output directory:

```txt
dist/panel
```

6. Si Cloudflare lo despliega como Worker con Static Assets, usar el archivo raiz `wrangler.json`. Este archivo ya define:

```json
{
  "main": "./aplicaciones/panel/worker.js",
  "assets": {
    "binding": "ASSETS",
    "directory": "./dist/panel",
    "not_found_handling": "single-page-application"
  }
}
```

7. Variables de entorno en Cloudflare Pages o en el Worker estatico del panel:

```txt
VITE_API_URL
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

No agregar tokens secretos del backend al panel. El panel solo recibe variables publicas `VITE_*`.

### Panel como Workers Builds

Si en GitHub aparece `Workers Builds`, Cloudflare no esta usando Pages clasico. En ese caso configurar el proyecto asi:

```txt
Build command: npm run panel:build
Deploy command: npx wrangler deploy --config wrangler.json
Root directory: /
```

No usar un `wrangler.json` generado por Cloudflare que tenga `assets` sin `directory`. El archivo valido es el del repositorio y apunta a `./dist/panel`.

El archivo `./aplicaciones/panel/worker.js` solo sirve los assets estaticos desde el binding `ASSETS`; no contiene secretos ni logica de backend.

El panel no debe incluir `aplicaciones/panel/public/_redirects`. El fallback SPA ya
lo resuelve `assets.not_found_handling`; combinar ambas configuraciones hace que
Cloudflare rechace `/* /index.html 200` por bucle infinito con el codigo `100324`.

Ademas, `wrangler.json` ejecuta `npm run panel:build` mediante `build.command` antes
de validar y publicar los assets. Esto permite que el comando de despliegue funcione
en un contenedor limpio aunque Cloudflare omita su paso de compilacion independiente.

### Pagina publica en Cloudflare Pages

Crear otro proyecto Pages conectado al mismo repo.

Build command:

```bash
npm run pagina:exportar
```

Output directory:

```txt
dist/pagina
```

Variable opcional:

```txt
SUBDOMINIO_PAGINA
```

### Worker API

Desplegar el Worker desde Cloudflare o desde Wrangler local. Los secretos se agregan en Cloudflare Worker como variables tipo `Secret`, no en GitHub.

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
