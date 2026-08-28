do $$
declare
  usuario_admin_texto text := 'REEMPLAZAR_UUID_ADMIN';
  usuario_admin uuid;
  id_presentacion uuid;
  id_integrante_ian uuid;
  id_integrante_omar uuid;
  id_integrante_oscar uuid;
  id_integrante_santiago uuid;
  id_habilidad_react uuid;
  id_habilidad_node uuid;
  id_habilidad_supabase uuid;
  id_habilidad_cloudflare uuid;
begin
  if usuario_admin_texto = 'REEMPLAZAR_UUID_ADMIN' then
    raise exception 'Reemplaza REEMPLAZAR_UUID_ADMIN por el UUID del usuario creado en Supabase Auth antes de ejecutar esta semilla.';
  end if;

  usuario_admin := usuario_admin_texto::uuid;

  if not exists (select 1 from auth.users where id = usuario_admin) then
    raise exception 'No existe un usuario en Supabase Auth con id %.', usuario_admin;
  end if;

  insert into public.perfil_usuario (id, nombre, rol, estado)
  values (usuario_admin, 'Ian Vers', 'administrador', 'activo')
  on conflict (id) do update
  set
    nombre = excluded.nombre,
    rol = excluded.rol,
    estado = excluded.estado,
    fecha_actualizacion = now();

  select id
  into id_presentacion
  from public.presentacion
  where creado_por = usuario_admin
    and nombre = 'Presentacion Sofia Embutidos'
    and fecha_eliminacion is null
  limit 1;

  if id_presentacion is null then
    insert into public.presentacion (
      nombre,
      descripcion,
      empresa_objetivo,
      industria_objetivo,
      estado,
      formato_preferido,
      color_principal,
      color_secundario,
      configuracion_tema,
      creado_por
    )
    values (
      'Presentacion Sofia Embutidos',
      'Desarrollamos soluciones informaticas a medida, desde sistemas web hasta aplicaciones moviles. Automatizamos tus procesos para que tu te enfoques en crecer.',
      'Sofia Embutidos',
      'Alimentos y distribucion nacional',
      'borrador',
      'horizontal',
      '#d40511',
      '#22c7dd',
      '{"calidadRender":"rapida","fondoVideo":"#f8fafc","tiempoSegmentoPredeterminado":6}'::jsonb,
      usuario_admin
    )
    returning id into id_presentacion;
  else
    update public.presentacion
    set
      empresa_objetivo = 'Sofia Embutidos',
      industria_objetivo = 'Alimentos y distribucion nacional',
      color_principal = coalesce(color_principal, '#d40511'),
      color_secundario = coalesce(color_secundario, '#22c7dd'),
      fecha_actualizacion = now()
    where id = id_presentacion;
  end if;

  insert into public.configuracion_formato (presentacion_id, formato, activa, ancho, alto, duracion_maxima_segundos, configuracion_layout)
  values
    (id_presentacion, 'horizontal', true, 1920, 1080, 240, '{"relacion":"16:9"}'::jsonb),
    (id_presentacion, 'vertical', true, 1080, 1920, 240, '{"relacion":"9:16"}'::jsonb)
  on conflict (presentacion_id, formato) do update
  set
    activa = excluded.activa,
    ancho = excluded.ancho,
    alto = excluded.alto,
    duracion_maxima_segundos = excluded.duracion_maxima_segundos,
    configuracion_layout = excluded.configuracion_layout,
    fecha_actualizacion = now();

  update public.seccion_video
  set
    tipo = 'eslogan',
    titulo_interno = 'Eslogan inicial',
    activa_en_video = true,
    visible_en_preview = true,
    duracion_sugerida_segundos = 7,
    texto_narracion = 'Desarrollamos soluciones informaticas a medida, desde sistemas web hasta aplicaciones moviles. Automatizamos tus procesos para que tu te enfoques en crecer. Listo para ensamblar el engranaje que te falta?',
    voz_narracion = 'af_heart',
    animacion_entrada = 'entrada_tecnologica',
    animacion_salida = 'salida_suave',
    configuracion = '{"descripcion":"Mensaje inicial de Mr Robot Bolivia"}'::jsonb,
    fecha_eliminacion = null,
    fecha_actualizacion = now()
  where presentacion_id = id_presentacion and orden = 1;
  if not found then
    insert into public.seccion_video (presentacion_id, tipo, titulo_interno, orden, activa_en_video, visible_en_preview, duracion_sugerida_segundos, texto_narracion, voz_narracion, animacion_entrada, animacion_salida, configuracion)
    values (id_presentacion, 'eslogan', 'Eslogan inicial', 1, true, true, 7, 'Desarrollamos soluciones informaticas a medida, desde sistemas web hasta aplicaciones moviles. Automatizamos tus procesos para que tu te enfoques en crecer. Listo para ensamblar el engranaje que te falta?', 'af_heart', 'entrada_tecnologica', 'salida_suave', '{"descripcion":"Mensaje inicial de Mr Robot Bolivia"}'::jsonb);
  end if;

  update public.seccion_video
  set
    tipo = 'cliente',
    titulo_interno = 'Clientes internacionales y nacionales',
    activa_en_video = true,
    visible_en_preview = true,
    duracion_sugerida_segundos = 7,
    texto_narracion = 'Trabajamos con clientes internacionales como FIEA, una ONG en Ecuador, y con clientes nacionales como Calaminas Aroma, con cinco sucursales a nivel nacional.',
    voz_narracion = 'af_heart',
    animacion_entrada = 'tarjetas_deslizantes',
    animacion_salida = 'salida_suave',
    configuracion = '{"descripcion":"Prueba social nacional e internacional"}'::jsonb,
    fecha_eliminacion = null,
    fecha_actualizacion = now()
  where presentacion_id = id_presentacion and orden = 2;
  if not found then
    insert into public.seccion_video (presentacion_id, tipo, titulo_interno, orden, activa_en_video, visible_en_preview, duracion_sugerida_segundos, texto_narracion, voz_narracion, animacion_entrada, animacion_salida, configuracion)
    values (id_presentacion, 'cliente', 'Clientes internacionales y nacionales', 2, true, true, 7, 'Trabajamos con clientes internacionales como FIEA, una ONG en Ecuador, y con clientes nacionales como Calaminas Aroma, con cinco sucursales a nivel nacional.', 'af_heart', 'tarjetas_deslizantes', 'salida_suave', '{"descripcion":"Prueba social nacional e internacional"}'::jsonb);
  end if;

  update public.seccion_video
  set
    tipo = 'proyecto',
    titulo_interno = 'Proyectos recientes',
    activa_en_video = true,
    visible_en_preview = true,
    duracion_sugerida_segundos = 8,
    texto_narracion = 'Mostramos proyectos recientes como FIEA, soluciones para ferreteria y espacios preparados para nuevas capturas reales.',
    voz_narracion = 'af_heart',
    animacion_entrada = 'galeria_animada',
    animacion_salida = 'salida_suave',
    configuracion = '{"descripcion":"Capturas y casos recientes"}'::jsonb,
    fecha_eliminacion = null,
    fecha_actualizacion = now()
  where presentacion_id = id_presentacion and orden = 3;
  if not found then
    insert into public.seccion_video (presentacion_id, tipo, titulo_interno, orden, activa_en_video, visible_en_preview, duracion_sugerida_segundos, texto_narracion, voz_narracion, animacion_entrada, animacion_salida, configuracion)
    values (id_presentacion, 'proyecto', 'Proyectos recientes', 3, true, true, 8, 'Mostramos proyectos recientes como FIEA, soluciones para ferreteria y espacios preparados para nuevas capturas reales.', 'af_heart', 'galeria_animada', 'salida_suave', '{"descripcion":"Capturas y casos recientes"}'::jsonb);
  end if;

  update public.seccion_video
  set
    tipo = 'quienes_somos',
    titulo_interno = 'Quienes somos',
    activa_en_video = true,
    visible_en_preview = true,
    duracion_sugerida_segundos = 6,
    texto_narracion = 'Somos un equipo completo orientado a construir sistemas utiles, escalables y alineados al crecimiento operativo de cada empresa.',
    voz_narracion = 'af_heart',
    animacion_entrada = 'bloques_modulares',
    animacion_salida = 'salida_suave',
    configuracion = '{"descripcion":"Presentacion institucional"}'::jsonb,
    fecha_eliminacion = null,
    fecha_actualizacion = now()
  where presentacion_id = id_presentacion and orden = 4;
  if not found then
    insert into public.seccion_video (presentacion_id, tipo, titulo_interno, orden, activa_en_video, visible_en_preview, duracion_sugerida_segundos, texto_narracion, voz_narracion, animacion_entrada, animacion_salida, configuracion)
    values (id_presentacion, 'quienes_somos', 'Quienes somos', 4, true, true, 6, 'Somos un equipo completo orientado a construir sistemas utiles, escalables y alineados al crecimiento operativo de cada empresa.', 'af_heart', 'bloques_modulares', 'salida_suave', '{"descripcion":"Presentacion institucional"}'::jsonb);
  end if;

  update public.seccion_video
  set
    tipo = 'equipo',
    titulo_interno = 'Perfiles del equipo',
    activa_en_video = true,
    visible_en_preview = true,
    duracion_sugerida_segundos = 10,
    texto_narracion = 'Nuestro equipo combina direccion, arquitectura, desarrollo, soporte comercial y gestion de proyectos.',
    voz_narracion = 'af_heart',
    animacion_entrada = 'cards_equipo',
    animacion_salida = 'salida_suave',
    configuracion = '{"descripcion":"Cards con CV, experiencia y estudios"}'::jsonb,
    fecha_eliminacion = null,
    fecha_actualizacion = now()
  where presentacion_id = id_presentacion and orden = 5;
  if not found then
    insert into public.seccion_video (presentacion_id, tipo, titulo_interno, orden, activa_en_video, visible_en_preview, duracion_sugerida_segundos, texto_narracion, voz_narracion, animacion_entrada, animacion_salida, configuracion)
    values (id_presentacion, 'equipo', 'Perfiles del equipo', 5, true, true, 10, 'Nuestro equipo combina direccion, arquitectura, desarrollo, soporte comercial y gestion de proyectos.', 'af_heart', 'cards_equipo', 'salida_suave', '{"descripcion":"Cards con CV, experiencia y estudios"}'::jsonb);
  end if;

  update public.seccion_video
  set
    tipo = 'habilidad',
    titulo_interno = 'Stack y habilidades animadas',
    activa_en_video = true,
    visible_en_preview = true,
    duracion_sugerida_segundos = 7,
    texto_narracion = 'Trabajamos con tecnologias modernas para frontend, backend, bases de datos, automatizacion, integraciones y despliegue serverless.',
    voz_narracion = 'af_heart',
    animacion_entrada = 'barras_animadas',
    animacion_salida = 'salida_suave',
    configuracion = '{"descripcion":"Barras de stack configurables"}'::jsonb,
    fecha_eliminacion = null,
    fecha_actualizacion = now()
  where presentacion_id = id_presentacion and orden = 6;
  if not found then
    insert into public.seccion_video (presentacion_id, tipo, titulo_interno, orden, activa_en_video, visible_en_preview, duracion_sugerida_segundos, texto_narracion, voz_narracion, animacion_entrada, animacion_salida, configuracion)
    values (id_presentacion, 'habilidad', 'Stack y habilidades animadas', 6, true, true, 7, 'Trabajamos con tecnologias modernas para frontend, backend, bases de datos, automatizacion, integraciones y despliegue serverless.', 'af_heart', 'barras_animadas', 'salida_suave', '{"descripcion":"Barras de stack configurables"}'::jsonb);
  end if;

  update public.seccion_video
  set
    tipo = 'cierre_comercial',
    titulo_interno = 'Cierre comercial Sofia Embutidos',
    activa_en_video = true,
    visible_en_preview = true,
    duracion_sugerida_segundos = 6,
    texto_narracion = 'Sofia Embutidos puede fortalecer su operacion nacional con automatizacion, datos centralizados y sistemas preparados para crecer.',
    voz_narracion = 'af_heart',
    animacion_entrada = 'cierre_ejecutivo',
    animacion_salida = 'salida_suave',
    configuracion = '{"descripcion":"Cierre configurable por empresa objetivo"}'::jsonb,
    fecha_eliminacion = null,
    fecha_actualizacion = now()
  where presentacion_id = id_presentacion and orden = 7;
  if not found then
    insert into public.seccion_video (presentacion_id, tipo, titulo_interno, orden, activa_en_video, visible_en_preview, duracion_sugerida_segundos, texto_narracion, voz_narracion, animacion_entrada, animacion_salida, configuracion)
    values (id_presentacion, 'cierre_comercial', 'Cierre comercial Sofia Embutidos', 7, true, true, 6, 'Sofia Embutidos puede fortalecer su operacion nacional con automatizacion, datos centralizados y sistemas preparados para crecer.', 'af_heart', 'cierre_ejecutivo', 'salida_suave', '{"descripcion":"Cierre configurable por empresa objetivo"}'::jsonb);
  end if;

  insert into public.cliente (presentacion_id, nombre, tipo_cliente, pais, ciudad, descripcion, metricas_destacadas, orden, activo)
  select id_presentacion, datos.nombre, datos.tipo_cliente, datos.pais, datos.ciudad, datos.descripcion, datos.metricas_destacadas, datos.orden, true
  from (
    values
      ('FIEA', 'internacional', 'Ecuador', '', 'ONG en Ecuador con presencia institucional internacional.', 'Cliente internacional destacado', 1),
      ('Calaminas Aroma', 'nacional', 'Bolivia', '', 'Empresa nacional con cinco sucursales.', '5 sucursales a nivel nacional', 2),
      ('Emprendedor nacional placeholder', 'emprendimiento', 'Bolivia', '', 'Espacio reservado para un emprendimiento nacional.', 'Placeholder editable', 3),
      ('Empresa nueva placeholder', 'empresa_nueva', 'Bolivia', '', 'Espacio reservado para una empresa nueva.', 'Placeholder editable', 4)
  ) as datos(nombre, tipo_cliente, pais, ciudad, descripcion, metricas_destacadas, orden)
  where not exists (
    select 1
    from public.cliente existente
    where existente.presentacion_id = id_presentacion
      and existente.nombre = datos.nombre
      and existente.fecha_eliminacion is null
  );

  insert into public.proyecto (presentacion_id, nombre, descripcion, tipo_solucion, stack_usado, resultado_impacto, orden, activo)
  select id_presentacion, datos.nombre, datos.descripcion, datos.tipo_solucion, datos.stack_usado, datos.resultado_impacto, datos.orden, true
  from (
    values
      ('Proyecto FIEA', 'Sistema web institucional con administracion de contenido y enfoque informativo.', 'web', 'React, API serverless, PostgreSQL', 'Mayor control del contenido institucional.', 1),
      ('Proyecto Ferreteria', 'Sistema de gestion para catalogo, ventas y procesos operativos.', 'sistema_interno', 'React, Node, PostgreSQL', 'Operacion mas ordenada y trazable.', 2),
      ('Proyecto placeholder 1', 'Espacio para agregar una captura real desde el panel.', 'automatizacion', 'Stack editable', 'Resultado editable', 3),
      ('Proyecto placeholder 2', 'Espacio para agregar una captura real desde el panel.', 'web', 'Stack editable', 'Resultado editable', 4)
  ) as datos(nombre, descripcion, tipo_solucion, stack_usado, resultado_impacto, orden)
  where not exists (
    select 1
    from public.proyecto existente
    where existente.presentacion_id = id_presentacion
      and existente.nombre = datos.nombre
      and existente.fecha_eliminacion is null
  );

  insert into public.integrante_equipo (presentacion_id, nombre_completo, cargo_empresa, especialidad, resumen_profesional, experiencia, cv_detalle, orden, activo)
  select id_presentacion, datos.nombre_completo, datos.cargo_empresa, datos.especialidad, datos.resumen_profesional, datos.experiencia, datos.cv_detalle::jsonb, datos.orden, true
  from (
    values
      ('Ian Vers', 'Fundador y arquitecto full stack', 'Arquitectura de software, frontend, backend y automatizacion', 'Responsable de direccion tecnica, arquitectura y desarrollo de soluciones a medida.', 'Experiencia en sistemas web, APIs, automatizacion de procesos y despliegues serverless.', '{"estudios":[],"certificaciones":[],"logros":["Direccion tecnica del proyecto"],"stackPrincipal":"React, Node, Supabase, Cloudflare Workers, Remotion"}', 1),
      ('Omar Barea', 'Gestion comercial y operaciones', 'Relacion comercial, coordinacion y seguimiento operativo', 'Perfil orientado a coordinacion comercial y acompaniamiento de clientes.', 'Experiencia en seguimiento de oportunidades, comunicacion y gestion operativa.', '{"estudios":[],"certificaciones":[],"logros":[],"stackPrincipal":"Gestion, comunicacion, operaciones"}', 2),
      ('Oscar Anave', 'Desarrollo y soporte tecnico', 'Implementacion tecnica y soporte de soluciones', 'Perfil orientado a ejecucion tecnica, soporte y mejora continua.', 'Experiencia en soporte, pruebas y acompanamiento tecnico.', '{"estudios":[],"certificaciones":[],"logros":[],"stackPrincipal":"Soporte, pruebas, implementacion"}', 3),
      ('Santiago', 'Apoyo tecnico y documentacion', 'Documentacion, pruebas y control de calidad', 'Perfil orientado a documentacion, revision y control de calidad.', 'Experiencia en revision funcional y organizacion de entregables.', '{"estudios":[],"certificaciones":[],"logros":[],"stackPrincipal":"QA, documentacion, control"}', 4)
  ) as datos(nombre_completo, cargo_empresa, especialidad, resumen_profesional, experiencia, cv_detalle, orden)
  where not exists (
    select 1
    from public.integrante_equipo existente
    where existente.presentacion_id = id_presentacion
      and existente.nombre_completo = datos.nombre_completo
      and existente.fecha_eliminacion is null
  );

  select id into id_integrante_ian from public.integrante_equipo where presentacion_id = id_presentacion and nombre_completo = 'Ian Vers' and fecha_eliminacion is null limit 1;
  select id into id_integrante_omar from public.integrante_equipo where presentacion_id = id_presentacion and nombre_completo = 'Omar Barea' and fecha_eliminacion is null limit 1;
  select id into id_integrante_oscar from public.integrante_equipo where presentacion_id = id_presentacion and nombre_completo = 'Oscar Anave' and fecha_eliminacion is null limit 1;
  select id into id_integrante_santiago from public.integrante_equipo where presentacion_id = id_presentacion and nombre_completo = 'Santiago' and fecha_eliminacion is null limit 1;

  insert into public.habilidad (presentacion_id, nombre, categoria, icono, color, activo, orden)
  select id_presentacion, datos.nombre, datos.categoria, datos.icono, datos.color, true, datos.orden
  from (
    values
      ('React', 'frontend', 'componentes', '#61dafb', 1),
      ('Node.js', 'backend', 'servidor', '#3c873a', 2),
      ('Supabase PostgreSQL', 'bases_datos', 'base_datos', '#3ecf8e', 3),
      ('Cloudflare Workers', 'devops', 'nube', '#f38020', 4)
  ) as datos(nombre, categoria, icono, color, orden)
  where not exists (
    select 1
    from public.habilidad existente
    where existente.presentacion_id = id_presentacion
      and existente.nombre = datos.nombre
      and existente.fecha_eliminacion is null
  );

  select id into id_habilidad_react from public.habilidad where presentacion_id = id_presentacion and nombre = 'React' and fecha_eliminacion is null limit 1;
  select id into id_habilidad_node from public.habilidad where presentacion_id = id_presentacion and nombre = 'Node.js' and fecha_eliminacion is null limit 1;
  select id into id_habilidad_supabase from public.habilidad where presentacion_id = id_presentacion and nombre = 'Supabase PostgreSQL' and fecha_eliminacion is null limit 1;
  select id into id_habilidad_cloudflare from public.habilidad where presentacion_id = id_presentacion and nombre = 'Cloudflare Workers' and fecha_eliminacion is null limit 1;

  insert into public.habilidad_integrante (integrante_id, habilidad_id, nivel_visual, tipo_animacion, velocidad_animacion, orden, activo)
  values
    (id_integrante_ian, id_habilidad_react, 92, 'barra_progreso', 1, 1, true),
    (id_integrante_ian, id_habilidad_node, 90, 'barra_progreso', 1, 2, true),
    (id_integrante_ian, id_habilidad_supabase, 86, 'barra_progreso', 1, 3, true),
    (id_integrante_ian, id_habilidad_cloudflare, 84, 'barra_progreso', 1, 4, true),
    (id_integrante_omar, id_habilidad_node, 70, 'barra_progreso', 1, 1, true),
    (id_integrante_oscar, id_habilidad_react, 74, 'barra_progreso', 1, 1, true),
    (id_integrante_santiago, id_habilidad_supabase, 68, 'barra_progreso', 1, 1, true)
  on conflict (integrante_id, habilidad_id) do update
  set
    nivel_visual = excluded.nivel_visual,
    tipo_animacion = excluded.tipo_animacion,
    velocidad_animacion = excluded.velocidad_animacion,
    orden = excluded.orden,
    activo = excluded.activo,
    fecha_actualizacion = now();
end $$;
