-- Query per correggere i dati dell'utente esistente e migliorare il trigger

-- 1. Aggiorna il trigger per evitare conflitti (con ON CONFLICT DO NOTHING)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.utenti (id, nome, cognome, genere, eta, email, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Utente'),
    COALESCE(NEW.raw_user_meta_data->>'cognome', 'Nuovo'),
    COALESCE(NEW.raw_user_meta_data->>'genere', 'Altro'),
    COALESCE((NEW.raw_user_meta_data->>'eta')::INTEGER, 18),
    NEW.email,
    FALSE
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Verifica il tuo User ID e i metadati attuali
-- Esegui questa query e copia l'ID risultante
SELECT 
  id, 
  email, 
  raw_user_meta_data,
  created_at
FROM auth.users 
ORDER BY created_at DESC;

-- 3. IMPORTANTE: Sostituisci 'TUA_EMAIL@example.com' con la tua email reale
-- e modifica i dati (nome, cognome, genere, eta) con i tuoi dati corretti
UPDATE utenti 
SET 
  nome = 'Il_Tuo_Nome',           -- MODIFICA QUI
  cognome = 'Il_Tuo_Cognome',     -- MODIFICA QUI
  genere = 'M',                    -- MODIFICA QUI ('M', 'F', o 'Altro')
  eta = 25,                        -- MODIFICA QUI
  is_admin = TRUE                  -- TRUE per essere admin, FALSE per cliente
WHERE email = 'TUA_EMAIL@example.com';  -- MODIFICA QUI

-- 4. Verifica che sia stato aggiornato correttamente
SELECT 
  u.id, 
  u.nome, 
  u.cognome, 
  u.genere, 
  u.eta, 
  u.email, 
  u.is_admin,
  au.email as auth_email,
  au.raw_user_meta_data
FROM utenti u
INNER JOIN auth.users au ON u.id = au.id
ORDER BY u.created_at DESC;

-- 5. (OPZIONALE) Se vuoi aggiornare anche i metadati in auth.users
-- Questo assicura che i dati siano sincronizzati anche lato autenticazione
-- SOSTITUISCI 'USER_ID_UUID_QUI' con il tuo ID utente dalla query #2
-- UPDATE auth.users
-- SET raw_user_meta_data = jsonb_set(
--   jsonb_set(
--     jsonb_set(
--       jsonb_set(
--         COALESCE(raw_user_meta_data, '{}'::jsonb),
--         '{nome}', '"Il_Tuo_Nome"'::jsonb
--       ),
--       '{cognome}', '"Il_Tuo_Cognome"'::jsonb
--     ),
--     '{genere}', '"M"'::jsonb
--   ),
--   '{eta}', '25'::jsonb
-- )
-- WHERE id = 'USER_ID_UUID_QUI';
