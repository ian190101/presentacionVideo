insert into public.ayuda_contextual (clave, titulo, descripcion, ejemplo, campo_relacionado, modulo)
values
  ('empresa_objetivo', 'Empresa objetivo', 'Define para que empresa se personalizara el cierre comercial del video.', 'Ejemplo: Sofia Embutidos', 'empresaObjetivo', 'presentacion'),
  ('activar_seccion_video', 'Activar seccion en video', 'Controla si esta seccion aparecera en el video final renderizado.', 'Ejemplo: desactiva proyectos si todavia no tienes capturas listas.', 'activaEnVideo', 'seccion'),
  ('mostrar_preview', 'Mostrar en preview', 'Controla si esta seccion aparece en la vista previa del panel.', 'Ejemplo: mantenla visible para revisar diseno aunque aun no vaya al video final.', 'visibleEnPreview', 'seccion'),
  ('texto_narracion', 'Texto de narracion', 'Texto que se convertira en voz automatica para esta parte del video.', 'Ejemplo: Mr Robot Bolivia desarrolla soluciones informaticas a medida.', 'textoNarracion', 'narracion'),
  ('voz_narracion', 'Voz de narracion', 'Selecciona el tipo de voz que usara Kokoro TTS para generar el audio.', 'Ejemplo: voz profesional, clara y pausada para reunion ejecutiva.', 'vozNarracion', 'narracion'),
  ('regenerar_audio', 'Regenerar audio', 'Vuelve a crear el audio cuando cambia el texto, la voz o la velocidad.', 'Ejemplo: activalo despues de corregir el cierre comercial.', 'regenerarAudio', 'narracion'),
  ('usar_placeholder', 'Usar placeholder', 'Permite usar una imagen temporal si todavia no subiste el asset real.', 'Ejemplo: usar avatar temporal mientras se cargan fotos del equipo.', 'usarPlaceholder', 'asset'),
  ('formato_horizontal', 'Formato horizontal', 'Genera video 16:9 ideal para reunion, proyector o pantalla grande.', 'Ejemplo: 1920 x 1080 para presentar en Santa Cruz.', 'formatoHorizontal', 'video'),
  ('formato_vertical', 'Formato vertical', 'Genera video 9:16 ideal para WhatsApp, reels o historias.', 'Ejemplo: 1080 x 1920 para envio desde celular.', 'formatoVertical', 'video'),
  ('animacion_personalizada', 'Animacion personalizada', 'Permite cambiar entrada, salida o velocidad visual de un elemento.', 'Ejemplo: barras de habilidad con crecimiento progresivo.', 'animacionPersonalizada', 'animacion'),
  ('cierre_comercial', 'Cierre comercial', 'Personaliza el mensaje final para la empresa objetivo.', 'Ejemplo: Sofia Embutidos puede fortalecer su operacion nacional con automatizacion.', 'cierreComercial', 'presentacion')
on conflict (clave) do update
set
  titulo = excluded.titulo,
  descripcion = excluded.descripcion,
  ejemplo = excluded.ejemplo,
  campo_relacionado = excluded.campo_relacionado,
  modulo = excluded.modulo,
  activa = true,
  fecha_actualizacion = now();
