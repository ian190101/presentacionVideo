create extension if not exists pgcrypto;

create or replace function public.actualizar_fecha_actualizacion()
returns trigger
language plpgsql
as $$
begin
  new.fecha_actualizacion = now();
  return new;
end;
$$;

create table public.perfil_usuario (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  rol text not null check (rol in ('administrador', 'editor', 'visualizador')),
  estado text not null default 'activo' check (estado in ('activo', 'inactivo')),
  fecha_creacion timestamptz not null default now(),
  fecha_actualizacion timestamptz not null default now()
);

create table public.presentacion (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (length(nombre) between 3 and 120),
  descripcion text,
  empresa_objetivo text not null check (length(empresa_objetivo) between 2 and 160),
  industria_objetivo text,
  estado text not null default 'borrador' check (estado in ('borrador', 'lista', 'archivada')),
  formato_preferido text not null default 'horizontal' check (formato_preferido in ('horizontal', 'vertical')),
  color_principal text,
  color_secundario text,
  configuracion_tema jsonb not null default '{}'::jsonb,
  version_contenido integer not null default 1 check (version_contenido > 0),
  creado_por uuid not null references public.perfil_usuario(id),
  fecha_creacion timestamptz not null default now(),
  fecha_actualizacion timestamptz not null default now(),
  fecha_eliminacion timestamptz
);

create table public.asset (
  id uuid primary key default gen_random_uuid(),
  presentacion_id uuid references public.presentacion(id) on delete cascade,
  tipo text not null check (tipo in ('logo', 'foto_equipo', 'captura_proyecto', 'fondo', 'audio', 'video', 'placeholder', 'otro')),
  proveedor text not null check (proveedor in ('cloudinary', 'supabase_storage', 'local', 'placeholder')),
  url_publica text,
  ruta_storage text,
  formato text,
  mime_type text,
  tamano_bytes bigint check (tamano_bytes is null or tamano_bytes >= 0),
  ancho integer check (ancho is null or ancho > 0),
  alto integer check (alto is null or alto > 0),
  duracion_segundos numeric(8,2) check (duracion_segundos is null or duracion_segundos >= 0),
  hash_contenido text,
  estado text not null default 'disponible' check (estado in ('pendiente', 'disponible', 'error', 'eliminado')),
  metadata jsonb not null default '{}'::jsonb,
  creado_por uuid references public.perfil_usuario(id) on delete set null,
  fecha_creacion timestamptz not null default now(),
  fecha_actualizacion timestamptz not null default now(),
  fecha_eliminacion timestamptz
);

create table public.configuracion_formato (
  id uuid primary key default gen_random_uuid(),
  presentacion_id uuid not null references public.presentacion(id) on delete cascade,
  formato text not null check (formato in ('horizontal', 'vertical')),
  activa boolean not null default true,
  ancho integer not null check (ancho > 0),
  alto integer not null check (alto > 0),
  duracion_maxima_segundos integer not null default 240 check (duracion_maxima_segundos between 15 and 240),
  configuracion_layout jsonb not null default '{}'::jsonb,
  fecha_creacion timestamptz not null default now(),
  fecha_actualizacion timestamptz not null default now(),
  unique (presentacion_id, formato)
);

create table public.seccion_video (
  id uuid primary key default gen_random_uuid(),
  presentacion_id uuid not null references public.presentacion(id) on delete cascade,
  tipo text not null check (tipo in ('eslogan', 'cliente', 'proyecto', 'quienes_somos', 'equipo', 'habilidad', 'cierre_comercial', 'personalizada')),
  titulo_interno text not null check (length(titulo_interno) between 2 and 120),
  orden integer not null check (orden >= 0),
  activa_en_video boolean not null default true,
  visible_en_preview boolean not null default true,
  duracion_sugerida_segundos integer check (duracion_sugerida_segundos is null or duracion_sugerida_segundos between 3 and 60),
  texto_narracion text,
  voz_narracion text,
  animacion_entrada text,
  animacion_salida text,
  configuracion jsonb not null default '{}'::jsonb,
  fecha_creacion timestamptz not null default now(),
  fecha_actualizacion timestamptz not null default now(),
  fecha_eliminacion timestamptz,
  unique (presentacion_id, orden) deferrable initially deferred
);

create table public.cliente (
  id uuid primary key default gen_random_uuid(),
  presentacion_id uuid not null references public.presentacion(id) on delete cascade,
  nombre text not null check (length(nombre) between 2 and 160),
  tipo_cliente text not null check (tipo_cliente in ('internacional', 'nacional', 'emprendimiento', 'empresa_nueva', 'otro')),
  pais text,
  ciudad text,
  descripcion text,
  metricas_destacadas text,
  asset_logo_id uuid references public.asset(id) on delete set null,
  orden integer not null default 0 check (orden >= 0),
  activo boolean not null default true,
  fecha_creacion timestamptz not null default now(),
  fecha_actualizacion timestamptz not null default now(),
  fecha_eliminacion timestamptz
);

create table public.proyecto (
  id uuid primary key default gen_random_uuid(),
  presentacion_id uuid not null references public.presentacion(id) on delete cascade,
  cliente_id uuid references public.cliente(id) on delete set null,
  nombre text not null check (length(nombre) between 2 and 160),
  descripcion text,
  tipo_solucion text not null check (tipo_solucion in ('web', 'movil', 'automatizacion', 'sistema_interno', 'ecommerce', 'catalogo', 'otro')),
  stack_usado text,
  resultado_impacto text,
  asset_captura_principal_id uuid references public.asset(id) on delete set null,
  orden integer not null default 0 check (orden >= 0),
  activo boolean not null default true,
  fecha_creacion timestamptz not null default now(),
  fecha_actualizacion timestamptz not null default now(),
  fecha_eliminacion timestamptz
);

create table public.proyecto_asset (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid not null references public.proyecto(id) on delete cascade,
  asset_id uuid not null references public.asset(id) on delete cascade,
  orden integer not null default 0 check (orden >= 0),
  fecha_creacion timestamptz not null default now(),
  unique (proyecto_id, asset_id)
);

create table public.integrante_equipo (
  id uuid primary key default gen_random_uuid(),
  presentacion_id uuid not null references public.presentacion(id) on delete cascade,
  nombre_completo text not null check (length(nombre_completo) between 2 and 160),
  cargo_empresa text not null check (length(cargo_empresa) between 2 and 160),
  especialidad text not null check (length(especialidad) between 2 and 160),
  resumen_profesional text,
  experiencia text,
  cv_detalle jsonb not null default '{}'::jsonb,
  asset_foto_id uuid references public.asset(id) on delete set null,
  enlaces jsonb not null default '[]'::jsonb,
  orden integer not null default 0 check (orden >= 0),
  activo boolean not null default true,
  fecha_creacion timestamptz not null default now(),
  fecha_actualizacion timestamptz not null default now(),
  fecha_eliminacion timestamptz
);

create table public.habilidad (
  id uuid primary key default gen_random_uuid(),
  presentacion_id uuid not null references public.presentacion(id) on delete cascade,
  nombre text not null check (length(nombre) between 2 and 120),
  categoria text not null check (categoria in ('frontend', 'backend', 'bases_datos', 'automatizacion', 'devops', 'diseno_sistemas', 'seguridad', 'integraciones', 'gestion', 'otro')),
  icono text,
  color text,
  activo boolean not null default true,
  orden integer not null default 0 check (orden >= 0),
  fecha_creacion timestamptz not null default now(),
  fecha_actualizacion timestamptz not null default now(),
  fecha_eliminacion timestamptz
);

create table public.habilidad_integrante (
  id uuid primary key default gen_random_uuid(),
  integrante_id uuid not null references public.integrante_equipo(id) on delete cascade,
  habilidad_id uuid not null references public.habilidad(id) on delete cascade,
  nivel_visual integer not null check (nivel_visual between 0 and 100),
  tipo_animacion text,
  velocidad_animacion numeric(4,2) check (velocidad_animacion is null or velocidad_animacion between 0.25 and 3),
  orden integer not null default 0 check (orden >= 0),
  activo boolean not null default true,
  fecha_creacion timestamptz not null default now(),
  fecha_actualizacion timestamptz not null default now(),
  unique (integrante_id, habilidad_id)
);

create table public.narracion (
  id uuid primary key default gen_random_uuid(),
  presentacion_id uuid not null references public.presentacion(id) on delete cascade,
  seccion_id uuid references public.seccion_video(id) on delete cascade,
  entidad_tipo text check (entidad_tipo is null or entidad_tipo in ('seccion', 'cliente', 'proyecto', 'integrante', 'habilidad', 'cierre')),
  entidad_id uuid,
  texto text not null check (length(texto) between 1 and 3000),
  voz text not null,
  velocidad numeric(4,2) not null default 1 check (velocidad between 0.5 and 2),
  hash_narracion text not null,
  audio_actual_id uuid references public.asset(id) on delete set null,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'generando', 'generada', 'error')),
  fecha_creacion timestamptz not null default now(),
  fecha_actualizacion timestamptz not null default now()
);

create table public.audio_generado (
  id uuid primary key default gen_random_uuid(),
  narracion_id uuid not null references public.narracion(id) on delete cascade,
  asset_audio_id uuid not null references public.asset(id) on delete cascade,
  proveedor_tts text not null default 'kokoro' check (proveedor_tts in ('kokoro')),
  voz text not null,
  velocidad numeric(4,2) not null default 1 check (velocidad between 0.5 and 2),
  hash_narracion text not null,
  estado text not null default 'disponible' check (estado in ('disponible', 'error', 'reemplazado')),
  error text,
  fecha_creacion timestamptz not null default now(),
  unique (hash_narracion, voz, velocidad, proveedor_tts)
);

create table public.solicitud_render (
  id uuid primary key default gen_random_uuid(),
  presentacion_id uuid not null references public.presentacion(id) on delete cascade,
  formato text not null check (formato in ('horizontal', 'vertical')),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'preparando', 'renderizando', 'subiendo', 'terminado', 'error', 'cancelado')),
  origen text not null default 'local' check (origen in ('local', 'github_actions')),
  version_contenido integer not null check (version_contenido > 0),
  asset_video_id uuid references public.asset(id) on delete set null,
  error text,
  solicitado_por uuid references public.perfil_usuario(id) on delete set null,
  fecha_solicitud timestamptz not null default now(),
  fecha_inicio timestamptz,
  fecha_finalizacion timestamptz
);

create table public.ayuda_contextual (
  id uuid primary key default gen_random_uuid(),
  clave text not null unique check (length(clave) between 2 and 120),
  titulo text not null check (length(titulo) between 2 and 160),
  descripcion text not null,
  ejemplo text,
  campo_relacionado text not null,
  modulo text not null,
  activa boolean not null default true,
  fecha_creacion timestamptz not null default now(),
  fecha_actualizacion timestamptz not null default now()
);

create table public.evento_auditoria (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references public.perfil_usuario(id) on delete set null,
  accion text not null check (length(accion) between 2 and 160),
  entidad_tipo text not null check (length(entidad_tipo) between 2 and 120),
  entidad_id uuid,
  detalle jsonb not null default '{}'::jsonb,
  ip text,
  user_agent text,
  fecha_creacion timestamptz not null default now()
);

create index perfil_usuario_rol_idx on public.perfil_usuario (rol);
create index perfil_usuario_estado_idx on public.perfil_usuario (estado);
create index presentacion_creado_por_idx on public.presentacion (creado_por);
create index presentacion_estado_idx on public.presentacion (estado);
create index presentacion_activa_idx on public.presentacion (fecha_actualizacion desc) where fecha_eliminacion is null;
create index asset_presentacion_id_idx on public.asset (presentacion_id);
create index asset_creado_por_idx on public.asset (creado_por);
create index asset_hash_contenido_idx on public.asset (hash_contenido) where hash_contenido is not null;
create index asset_disponible_idx on public.asset (presentacion_id, tipo) where fecha_eliminacion is null and estado = 'disponible';
create index configuracion_formato_presentacion_id_idx on public.configuracion_formato (presentacion_id);
create index seccion_video_presentacion_id_idx on public.seccion_video (presentacion_id);
create index seccion_video_orden_idx on public.seccion_video (presentacion_id, orden) where fecha_eliminacion is null;
create index seccion_video_activa_idx on public.seccion_video (presentacion_id, orden) where fecha_eliminacion is null and activa_en_video = true;
create index cliente_presentacion_id_idx on public.cliente (presentacion_id);
create index cliente_asset_logo_id_idx on public.cliente (asset_logo_id);
create index cliente_activo_idx on public.cliente (presentacion_id, orden) where fecha_eliminacion is null and activo = true;
create index proyecto_presentacion_id_idx on public.proyecto (presentacion_id);
create index proyecto_cliente_id_idx on public.proyecto (cliente_id);
create index proyecto_asset_captura_principal_id_idx on public.proyecto (asset_captura_principal_id);
create index proyecto_activo_idx on public.proyecto (presentacion_id, orden) where fecha_eliminacion is null and activo = true;
create index proyecto_asset_proyecto_id_idx on public.proyecto_asset (proyecto_id);
create index proyecto_asset_asset_id_idx on public.proyecto_asset (asset_id);
create index proyecto_asset_orden_idx on public.proyecto_asset (proyecto_id, orden);
create index integrante_equipo_presentacion_id_idx on public.integrante_equipo (presentacion_id);
create index integrante_equipo_asset_foto_id_idx on public.integrante_equipo (asset_foto_id);
create index integrante_equipo_activo_idx on public.integrante_equipo (presentacion_id, orden) where fecha_eliminacion is null and activo = true;
create index habilidad_presentacion_id_idx on public.habilidad (presentacion_id);
create index habilidad_categoria_idx on public.habilidad (presentacion_id, categoria);
create index habilidad_activa_idx on public.habilidad (presentacion_id, orden) where fecha_eliminacion is null and activo = true;
create index habilidad_integrante_integrante_id_idx on public.habilidad_integrante (integrante_id);
create index habilidad_integrante_habilidad_id_idx on public.habilidad_integrante (habilidad_id);
create index habilidad_integrante_activa_idx on public.habilidad_integrante (integrante_id, orden) where activo = true;
create index narracion_presentacion_id_idx on public.narracion (presentacion_id);
create index narracion_seccion_id_idx on public.narracion (seccion_id);
create index narracion_audio_actual_id_idx on public.narracion (audio_actual_id);
create index narracion_hash_idx on public.narracion (hash_narracion);
create index narracion_pendiente_idx on public.narracion (fecha_actualizacion) where estado in ('pendiente', 'generando');
create index audio_generado_narracion_id_idx on public.audio_generado (narracion_id);
create index audio_generado_asset_audio_id_idx on public.audio_generado (asset_audio_id);
create index audio_generado_cache_idx on public.audio_generado (hash_narracion, voz, velocidad, proveedor_tts) where estado = 'disponible';
create index solicitud_render_presentacion_id_idx on public.solicitud_render (presentacion_id);
create index solicitud_render_solicitado_por_idx on public.solicitud_render (solicitado_por);
create index solicitud_render_asset_video_id_idx on public.solicitud_render (asset_video_id);
create index solicitud_render_estado_idx on public.solicitud_render (estado, fecha_solicitud desc);
create index solicitud_render_ultimo_exitoso_idx on public.solicitud_render (presentacion_id, formato, fecha_finalizacion desc) where estado = 'terminado';
create index ayuda_contextual_modulo_idx on public.ayuda_contextual (modulo);
create index ayuda_contextual_activa_idx on public.ayuda_contextual (modulo, campo_relacionado) where activa = true;
create index evento_auditoria_usuario_id_idx on public.evento_auditoria (usuario_id);
create index evento_auditoria_entidad_idx on public.evento_auditoria (entidad_tipo, entidad_id);
create index evento_auditoria_fecha_idx on public.evento_auditoria (fecha_creacion desc);

create trigger perfil_usuario_actualizar_fecha before update on public.perfil_usuario for each row execute function public.actualizar_fecha_actualizacion();
create trigger presentacion_actualizar_fecha before update on public.presentacion for each row execute function public.actualizar_fecha_actualizacion();
create trigger asset_actualizar_fecha before update on public.asset for each row execute function public.actualizar_fecha_actualizacion();
create trigger configuracion_formato_actualizar_fecha before update on public.configuracion_formato for each row execute function public.actualizar_fecha_actualizacion();
create trigger seccion_video_actualizar_fecha before update on public.seccion_video for each row execute function public.actualizar_fecha_actualizacion();
create trigger cliente_actualizar_fecha before update on public.cliente for each row execute function public.actualizar_fecha_actualizacion();
create trigger proyecto_actualizar_fecha before update on public.proyecto for each row execute function public.actualizar_fecha_actualizacion();
create trigger integrante_equipo_actualizar_fecha before update on public.integrante_equipo for each row execute function public.actualizar_fecha_actualizacion();
create trigger habilidad_actualizar_fecha before update on public.habilidad for each row execute function public.actualizar_fecha_actualizacion();
create trigger habilidad_integrante_actualizar_fecha before update on public.habilidad_integrante for each row execute function public.actualizar_fecha_actualizacion();
create trigger narracion_actualizar_fecha before update on public.narracion for each row execute function public.actualizar_fecha_actualizacion();
create trigger ayuda_contextual_actualizar_fecha before update on public.ayuda_contextual for each row execute function public.actualizar_fecha_actualizacion();

create or replace function public.obtener_rol_usuario()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select rol
  from public.perfil_usuario
  where id = (select auth.uid())
    and estado = 'activo'
  limit 1;
$$;

create or replace function public.usuario_puede_editar()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select public.obtener_rol_usuario()) in ('administrador', 'editor'), false);
$$;

alter table public.perfil_usuario enable row level security;
alter table public.presentacion enable row level security;
alter table public.asset enable row level security;
alter table public.configuracion_formato enable row level security;
alter table public.seccion_video enable row level security;
alter table public.cliente enable row level security;
alter table public.proyecto enable row level security;
alter table public.proyecto_asset enable row level security;
alter table public.integrante_equipo enable row level security;
alter table public.habilidad enable row level security;
alter table public.habilidad_integrante enable row level security;
alter table public.narracion enable row level security;
alter table public.audio_generado enable row level security;
alter table public.solicitud_render enable row level security;
alter table public.ayuda_contextual enable row level security;
alter table public.evento_auditoria enable row level security;

create policy perfil_usuario_ver_propio on public.perfil_usuario for select to authenticated using (id = (select auth.uid()) or (select public.obtener_rol_usuario()) = 'administrador');
create policy perfil_usuario_admin_total on public.perfil_usuario for all to authenticated using ((select public.obtener_rol_usuario()) = 'administrador') with check ((select public.obtener_rol_usuario()) = 'administrador');

create policy presentacion_lectura_roles on public.presentacion for select to authenticated using ((select public.obtener_rol_usuario()) in ('administrador', 'editor', 'visualizador'));
create policy presentacion_escritura_editores on public.presentacion for insert to authenticated with check ((select public.usuario_puede_editar()) and creado_por = (select auth.uid()));
create policy presentacion_actualizacion_editores on public.presentacion for update to authenticated using ((select public.usuario_puede_editar())) with check ((select public.usuario_puede_editar()));

create policy ayuda_contextual_lectura on public.ayuda_contextual for select to authenticated using (activa = true or (select public.obtener_rol_usuario()) = 'administrador');
create policy ayuda_contextual_admin on public.ayuda_contextual for all to authenticated using ((select public.obtener_rol_usuario()) = 'administrador') with check ((select public.obtener_rol_usuario()) = 'administrador');

create policy evento_auditoria_admin_lectura on public.evento_auditoria for select to authenticated using ((select public.obtener_rol_usuario()) = 'administrador');
create policy evento_auditoria_insert_sistema on public.evento_auditoria for insert to authenticated with check ((select public.obtener_rol_usuario()) in ('administrador', 'editor'));

create policy contenido_lectura_roles on public.asset for select to authenticated using ((select public.obtener_rol_usuario()) in ('administrador', 'editor', 'visualizador'));
create policy contenido_escritura_editores on public.asset for all to authenticated using ((select public.usuario_puede_editar())) with check ((select public.usuario_puede_editar()));

create policy configuracion_formato_lectura_roles on public.configuracion_formato for select to authenticated using ((select public.obtener_rol_usuario()) in ('administrador', 'editor', 'visualizador'));
create policy configuracion_formato_escritura_editores on public.configuracion_formato for all to authenticated using ((select public.usuario_puede_editar())) with check ((select public.usuario_puede_editar()));

create policy seccion_video_lectura_roles on public.seccion_video for select to authenticated using ((select public.obtener_rol_usuario()) in ('administrador', 'editor', 'visualizador'));
create policy seccion_video_escritura_editores on public.seccion_video for all to authenticated using ((select public.usuario_puede_editar())) with check ((select public.usuario_puede_editar()));

create policy cliente_lectura_roles on public.cliente for select to authenticated using ((select public.obtener_rol_usuario()) in ('administrador', 'editor', 'visualizador'));
create policy cliente_escritura_editores on public.cliente for all to authenticated using ((select public.usuario_puede_editar())) with check ((select public.usuario_puede_editar()));

create policy proyecto_lectura_roles on public.proyecto for select to authenticated using ((select public.obtener_rol_usuario()) in ('administrador', 'editor', 'visualizador'));
create policy proyecto_escritura_editores on public.proyecto for all to authenticated using ((select public.usuario_puede_editar())) with check ((select public.usuario_puede_editar()));

create policy proyecto_asset_lectura_roles on public.proyecto_asset for select to authenticated using ((select public.obtener_rol_usuario()) in ('administrador', 'editor', 'visualizador'));
create policy proyecto_asset_escritura_editores on public.proyecto_asset for all to authenticated using ((select public.usuario_puede_editar())) with check ((select public.usuario_puede_editar()));

create policy integrante_equipo_lectura_roles on public.integrante_equipo for select to authenticated using ((select public.obtener_rol_usuario()) in ('administrador', 'editor', 'visualizador'));
create policy integrante_equipo_escritura_editores on public.integrante_equipo for all to authenticated using ((select public.usuario_puede_editar())) with check ((select public.usuario_puede_editar()));

create policy habilidad_lectura_roles on public.habilidad for select to authenticated using ((select public.obtener_rol_usuario()) in ('administrador', 'editor', 'visualizador'));
create policy habilidad_escritura_editores on public.habilidad for all to authenticated using ((select public.usuario_puede_editar())) with check ((select public.usuario_puede_editar()));

create policy habilidad_integrante_lectura_roles on public.habilidad_integrante for select to authenticated using ((select public.obtener_rol_usuario()) in ('administrador', 'editor', 'visualizador'));
create policy habilidad_integrante_escritura_editores on public.habilidad_integrante for all to authenticated using ((select public.usuario_puede_editar())) with check ((select public.usuario_puede_editar()));

create policy narracion_lectura_roles on public.narracion for select to authenticated using ((select public.obtener_rol_usuario()) in ('administrador', 'editor', 'visualizador'));
create policy narracion_escritura_editores on public.narracion for all to authenticated using ((select public.usuario_puede_editar())) with check ((select public.usuario_puede_editar()));

create policy audio_generado_lectura_roles on public.audio_generado for select to authenticated using ((select public.obtener_rol_usuario()) in ('administrador', 'editor', 'visualizador'));
create policy audio_generado_escritura_editores on public.audio_generado for all to authenticated using ((select public.usuario_puede_editar())) with check ((select public.usuario_puede_editar()));

create policy solicitud_render_lectura_roles on public.solicitud_render for select to authenticated using ((select public.obtener_rol_usuario()) in ('administrador', 'editor', 'visualizador'));
create policy solicitud_render_insert_editores on public.solicitud_render for insert to authenticated with check ((select public.usuario_puede_editar()));
create policy solicitud_render_update_editores on public.solicitud_render for update to authenticated using ((select public.usuario_puede_editar())) with check ((select public.usuario_puede_editar()));
