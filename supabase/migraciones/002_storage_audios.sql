insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'audios',
  'audios',
  true,
  10485760,
  array[
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/x-wav',
    'audio/wave'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists audios_lectura_publica on storage.objects;
create policy audios_lectura_publica
on storage.objects
for select
to public
using (bucket_id = 'audios');

drop policy if exists audios_escritura_autenticada on storage.objects;
create policy audios_escritura_autenticada
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'audios'
  and (storage.foldername(name))[1] = 'presentaciones'
);

drop policy if exists audios_actualizacion_autenticada on storage.objects;
create policy audios_actualizacion_autenticada
on storage.objects
for update
to authenticated
using (
  bucket_id = 'audios'
  and (storage.foldername(name))[1] = 'presentaciones'
)
with check (
  bucket_id = 'audios'
  and (storage.foldername(name))[1] = 'presentaciones'
);
