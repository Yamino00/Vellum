-- Aggiorna il trigger per gestire anche gli utenti Google OAuth
-- Gli utenti Google potrebbero non avere tutti i campi compilati inizialmente
-- Usa valori temporanei che rispettano i constraints della tabella

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.utenti (id, email, nome, cognome, genere, eta, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'nome', ''), 'Da'),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'cognome', ''), 'Completare'),
    COALESCE(
      CASE 
        WHEN NEW.raw_user_meta_data->>'genere' IN ('M', 'F', 'Altro') 
        THEN NEW.raw_user_meta_data->>'genere'
        ELSE NULL
      END,
      'Altro'
    ),
    COALESCE(
      CASE 
        WHEN (NEW.raw_user_meta_data->>'eta')::int > 0 AND (NEW.raw_user_meta_data->>'eta')::int < 150
        THEN (NEW.raw_user_meta_data->>'eta')::int
        ELSE NULL
      END,
      18
    ),
    COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, FALSE)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
