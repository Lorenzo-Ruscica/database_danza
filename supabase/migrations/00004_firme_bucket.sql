-- Crea il nuovo bucket dedicato "firme"
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'firme',
  'firme',
  true,
  false,
  10485760, -- 10MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg']::text[]
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy per leggere le firme (Scanner)
CREATE POLICY "Permetti a tutti di leggere e vedere le firme" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'firme');

-- Policy per inserire le firme (Totem)
CREATE POLICY "Permetti al totem di inserire le firme" ON storage.objects
FOR INSERT TO public
WITH CHECK (bucket_id = 'firme');

-- Policy per aggiornare le firme
CREATE POLICY "Permetti update delle firme" ON storage.objects
FOR UPDATE TO public
USING (bucket_id = 'firme');
