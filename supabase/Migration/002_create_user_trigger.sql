-- Funzione per creare automaticamente il profilo utente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.utenti (id, nome, cognome, genere, eta, email, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Nome'),
    COALESCE(NEW.raw_user_meta_data->>'cognome', 'Cognome'),
    COALESCE(NEW.raw_user_meta_data->>'genere', 'Altro'),
    COALESCE((NEW.raw_user_meta_data->>'eta')::INTEGER, 18),
    NEW.email,
    FALSE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger che si attiva quando un nuovo utente viene creato in auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();