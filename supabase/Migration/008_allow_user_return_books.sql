-- Permetti agli utenti di restituire i propri libri (aggiornare data_restituzione)
CREATE POLICY "Gli utenti possono restituire i propri libri"
  ON prestiti FOR UPDATE
  USING (auth.uid() = utente_id)
  WITH CHECK (auth.uid() = utente_id);
