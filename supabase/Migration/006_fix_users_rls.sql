-- Fix RLS policies per la tabella utenti
-- Problema: gli admin non riescono a vedere tutti gli utenti
-- Causa: riferimento circolare nella policy (la subquery sulla stessa tabella utenti viene bloccata da RLS)

-- Rimuovi le vecchie policy SELECT
DROP POLICY IF EXISTS "Gli utenti possono visualizzare il proprio profilo" ON utenti;
DROP POLICY IF EXISTS "Gli admin possono visualizzare tutti gli utenti" ON utenti;
DROP POLICY IF EXISTS "Utenti possono vedere se stessi, admin possono vedere tutti" ON utenti;

-- Crea una funzione SECURITY DEFINER che bypassa RLS per controllare se l'utente è admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.utenti
    WHERE id = auth.uid() AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crea la nuova policy SELECT usando la funzione
CREATE POLICY "Utenti possono vedere se stessi, admin possono vedere tutti"
  ON utenti FOR SELECT
  USING (
    auth.uid() = id 
    OR 
    public.is_admin()
  );
