-- Inserimento del nuovo bucket "certificati" nello storage
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'certificati',
  'certificati',
  true,
  false,
  10485760, -- 10MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Crea policy per permettere la selezione (lettura pubblica)
CREATE POLICY "Permetti a tutti di leggere e vedere i certificati" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'certificati');

-- Crea policy per permettere l'inserimento non autenticato dal Kiosk (Inserimento libero)
CREATE POLICY "Permetti a tutti di caricare certificati e firme dal totem" ON storage.objects
FOR INSERT TO public
WITH CHECK (bucket_id = 'certificati');

-- In modo simile permettiamo ai bucket upload in un ambiente anonimo in fase di sviluppo.
CREATE POLICY "Full access on buckets" ON storage.buckets
FOR ALL TO public
USING (true)
WITH CHECK (true);
