# Guia de creacion de base de datos en Supabase

Estado: preparada para ejecutar manualmente en Supabase.

## Objetivo

Crear la base de datos inicial del proyecto, activar Supabase Auth, registrar el primer administrador, crear el bucket gratuito de audios y cargar datos placeholder para que el panel deje de trabajar en modo demo.

## Orden obligatorio

1. Crear proyecto en Supabase Free.
2. Crear el usuario administrador en Supabase Auth.
3. Ejecutar `supabase/migraciones/001_modelo_inicial.sql`.
4. Ejecutar `supabase/migraciones/002_storage_audios.sql`.
5. Ejecutar `supabase/semillas/001_ayudas_contextuales.sql`.
6. Copiar el UUID del usuario administrador creado en Auth.
7. Editar `supabase/semillas/002_presentacion_inicial.sql` y reemplazar `REEMPLAZAR_UUID_ADMIN` por ese UUID.
8. Ejecutar `supabase/semillas/002_presentacion_inicial.sql`.

## Datos que debes tomar de Supabase

En `Project Settings > API`:

- `Project URL`: se usa como `SUPABASE_URL` en Cloudflare Worker y como `VITE_SUPABASE_URL` en el panel.
- `anon public`: se usa como `SUPABASE_ANON_KEY` en Worker y `VITE_SUPABASE_ANON_KEY` en panel.
- `service_role`: se usa solo como secreto `SUPABASE_SERVICE_ROLE_KEY` en Cloudflare Worker. No debe ir a GitHub ni al frontend.

## Validacion rapida en SQL Editor

Despues de ejecutar todo, usa:

```sql
select count(*) as total_perfil from public.perfil_usuario;
select count(*) as total_presentacion from public.presentacion;
select count(*) as total_seccion from public.seccion_video;
select count(*) as total_cliente from public.cliente;
select count(*) as total_proyecto from public.proyecto;
select count(*) as total_integrante from public.integrante_equipo;
select count(*) as total_habilidad from public.habilidad;
select id, public, file_size_limit from storage.buckets where id = 'audios';
```

Resultado esperado:

- `total_perfil`: al menos 1.
- `total_presentacion`: al menos 1.
- `total_seccion`: 7.
- `total_cliente`: 4.
- `total_proyecto`: 4.
- `total_integrante`: 4.
- `total_habilidad`: 4.
- Bucket `audios`: existe y es publico para lectura.

## Variables que deben quedar en Cloudflare

Panel Worker estatico:

- `VITE_API_URL`: URL del Worker API.
- `VITE_SUPABASE_URL`: URL del proyecto Supabase.
- `VITE_SUPABASE_ANON_KEY`: clave anon publica.

API Worker:

- `SUPABASE_URL`: URL del proyecto Supabase.
- `SUPABASE_ANON_KEY`: clave anon publica.
- `SUPABASE_SERVICE_ROLE_KEY`: clave service role, solo backend.
- `SUPABASE_BUCKET_AUDIO`: `audios`.
- `CLOUDINARY_CLOUD_NAME`: nombre cloud.
- `CLOUDINARY_API_KEY`: clave publica de API.
- `CLOUDINARY_API_SECRET`: clave secreta, solo backend.
- `HF_TOKEN`: token de Hugging Face, solo backend.
- `GITHUB_TOKEN`: token para disparar render por GitHub Actions, solo backend.
- `GITHUB_REPOSITORIO`: `ian190101/presentacionVideo`.

## Comprobacion desde el panel

1. Inicia sesion con el usuario creado en Supabase Auth.
2. Entra al panel.
3. Debe cargar `Presentacion Sofia Embutidos` desde Supabase.
4. Prueba guardar un cambio menor.
5. Prueba generar una narracion corta.

Si el login funciona pero el panel no carga datos, revisa primero `perfil_usuario`: el `id` debe ser exactamente el UUID del usuario de Supabase Auth.
