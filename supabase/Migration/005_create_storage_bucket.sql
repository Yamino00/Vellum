-- Crea il bucket per le copertine dei libri
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'covers',
  'covers',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Policy per permettere a tutti di leggere le immagini
CREATE POLICY "Le copertine sono pubbliche"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'covers');

-- Policy per permettere agli admin di caricare immagini
CREATE POLICY "Gli admin possono caricare copertine"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'covers' AND
    auth.uid() IN (
      SELECT id FROM utenti WHERE is_admin = TRUE
    )
  );

-- Policy per permettere agli admin di aggiornare immagini
CREATE POLICY "Gli admin possono aggiornare copertine"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'covers' AND
    auth.uid() IN (
      SELECT id FROM utenti WHERE is_admin = TRUE
    )
  );

-- Policy per permettere agli admin di eliminare immagini
CREATE POLICY "Gli admin possono eliminare copertine"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'covers' AND
    auth.uid() IN (
      SELECT id FROM utenti WHERE is_admin = TRUE
    )
  );
