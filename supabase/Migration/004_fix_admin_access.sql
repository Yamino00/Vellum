-- Query per verificare e correggere l'accesso Admin

-- 1. Verifica che l'utente sia correttamente impostato come admin
SELECT 
  id, 
  nome, 
  cognome, 
  email, 
  is_admin,
  created_at
FROM utenti 
ORDER BY created_at DESC;

-- 2. Se vedi che is_admin è FALSE, aggiorna con la tua email
-- UPDATE utenti 
-- SET is_admin = TRUE 
-- WHERE email = 'TUA_EMAIL@example.com';

-- 3. Verifica che le RLS policies non stiano bloccando la lettura
-- Prova a leggere direttamente come il tuo utente
-- (sostituisci USER_ID con il tuo ID dalla query #1)
SELECT * FROM utenti WHERE id = 'USER_ID';

-- 4. Verifica le policy esistenti
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'utenti';

-- 5. IMPORTANTE: Ricrea le policy in modo più semplice per evitare problemi di ricorsione
-- Rimuovi le policy esistenti
DROP POLICY IF EXISTS "Gli utenti possono visualizzare il proprio profilo" ON utenti;
DROP POLICY IF EXISTS "Gli admin possono visualizzare tutti gli utenti" ON utenti;
DROP POLICY IF EXISTS "Gli utenti possono aggiornare il proprio profilo" ON utenti;
DROP POLICY IF EXISTS "Gli admin possono aggiornare tutti gli utenti" ON utenti;
DROP POLICY IF EXISTS "Gli utenti possono inserire il proprio profilo" ON utenti;

-- Ricrea policy semplificate
CREATE POLICY "Utenti possono leggere il proprio profilo"
  ON utenti FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Utenti possono aggiornare il proprio profilo"
  ON utenti FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Utenti possono inserire il proprio profilo"
  ON utenti FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 6. Verifica di nuovo dopo aver ricreato le policy
SELECT 
  id, 
  nome, 
  cognome, 
  email, 
  is_admin
FROM utenti 
WHERE email = 'TUA_EMAIL@example.com';

-- 7. Test finale: prova a fare login e verifica nella console del browser
-- che venga mostrato "Profilo utente caricato:" con is_admin: true
