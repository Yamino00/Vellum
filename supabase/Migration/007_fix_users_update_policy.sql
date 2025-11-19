-- Fix RLS UPDATE policy per la tabella utenti
-- Problema: gli admin non riescono ad aggiornare gli altri utenti
-- Causa: riferimento circolare nella policy UPDATE (la subquery sulla stessa tabella utenti viene bloccata da RLS)

-- Rimuovi le vecchie policy UPDATE
DROP POLICY IF EXISTS "Gli utenti possono aggiornare il proprio profilo" ON utenti;
DROP POLICY IF EXISTS "Gli admin possono aggiornare tutti gli utenti" ON utenti;
DROP POLICY IF EXISTS "Utenti possono aggiornare se stessi, admin possono aggiornare tutti" ON utenti;

-- Crea la nuova policy UPDATE usando la funzione is_admin() (già creata nella migration 006)
CREATE POLICY "Utenti possono aggiornare se stessi, admin possono aggiornare tutti"
  ON utenti FOR UPDATE
  USING (
    auth.uid() = id 
    OR 
    public.is_admin()
  );
