-- Schema SQL per il Database MyLibrary su Supabase

-- Tabella Utenti
CREATE TABLE utenti (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  cognome VARCHAR(100) NOT NULL,
  genere VARCHAR(10) CHECK (genere IN ('M', 'F', 'Altro')),
  eta INTEGER CHECK (eta > 0 AND eta < 150),
  email VARCHAR(255) UNIQUE NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabella Libri
CREATE TABLE libri (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titolo VARCHAR(255) NOT NULL,
  autore VARCHAR(255) NOT NULL,
  anno INTEGER CHECK (anno > 1000 AND anno <= EXTRACT(YEAR FROM NOW())),
  genere VARCHAR(100) NOT NULL,
  isbn VARCHAR(20) UNIQUE NOT NULL,
  disponibile BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabella Prestiti
CREATE TABLE prestiti (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  utente_id UUID NOT NULL REFERENCES utenti(id) ON DELETE CASCADE,
  libro_id UUID NOT NULL REFERENCES libri(id) ON DELETE CASCADE,
  data_prestito DATE NOT NULL DEFAULT CURRENT_DATE,
  data_restituzione DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (data_restituzione IS NULL OR data_restituzione >= data_prestito)
);

-- Indici per migliorare le performance
CREATE INDEX idx_prestiti_utente ON prestiti(utente_id);
CREATE INDEX idx_prestiti_libro ON prestiti(libro_id);
CREATE INDEX idx_prestiti_data_prestito ON prestiti(data_prestito);
CREATE INDEX idx_libri_genere ON libri(genere);
CREATE INDEX idx_libri_disponibile ON libri(disponibile);

-- Row Level Security (RLS) Policies

-- Politiche per la tabella utenti
ALTER TABLE utenti ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gli utenti possono visualizzare il proprio profilo"
  ON utenti FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Gli admin possono visualizzare tutti gli utenti"
  ON utenti FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM utenti
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Gli utenti possono aggiornare il proprio profilo"
  ON utenti FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Gli admin possono aggiornare tutti gli utenti"
  ON utenti FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM utenti
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Gli utenti possono inserire il proprio profilo"
  ON utenti FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Politiche per la tabella libri
ALTER TABLE libri ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutti possono visualizzare i libri"
  ON libri FOR SELECT
  USING (TRUE);

CREATE POLICY "Solo gli admin possono inserire libri"
  ON libri FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM utenti
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Solo gli admin possono aggiornare libri"
  ON libri FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM utenti
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Solo gli admin possono eliminare libri"
  ON libri FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM utenti
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Politiche per la tabella prestiti
ALTER TABLE prestiti ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gli utenti possono visualizzare i propri prestiti"
  ON prestiti FOR SELECT
  USING (auth.uid() = utente_id);

CREATE POLICY "Gli admin possono visualizzare tutti i prestiti"
  ON prestiti FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM utenti
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Gli utenti possono creare prestiti per se stessi"
  ON prestiti FOR INSERT
  WITH CHECK (auth.uid() = utente_id);

CREATE POLICY "Gli admin possono creare prestiti per chiunque"
  ON prestiti FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM utenti
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Gli admin possono aggiornare i prestiti"
  ON prestiti FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM utenti
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Gli admin possono eliminare i prestiti"
  ON prestiti FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM utenti
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Funzione per aggiornare automaticamente la disponibilità dei libri
CREATE OR REPLACE FUNCTION update_book_availability()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.data_restituzione IS NULL THEN
    UPDATE libri SET disponibile = FALSE WHERE id = NEW.libro_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.data_restituzione IS NOT NULL AND OLD.data_restituzione IS NULL THEN
    UPDATE libri SET disponibile = TRUE WHERE id = NEW.libro_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per aggiornare la disponibilità dei libri
CREATE TRIGGER trigger_update_book_availability
AFTER INSERT OR UPDATE ON prestiti
FOR EACH ROW
EXECUTE FUNCTION update_book_availability();

-- Dati di esempio (opzionali)

-- Inserire un utente admin di test (dovrai sostituire l'UUID con un ID reale dopo aver creato l'utente via Auth)
-- INSERT INTO utenti (id, nome, cognome, genere, eta, email, is_admin)
-- VALUES ('YOUR-USER-UUID-HERE', 'Admin', 'Principale', 'M', 30, 'admin@example.com', TRUE);

-- Inserire alcuni libri di esempio
INSERT INTO libri (titolo, autore, anno, genere, isbn) VALUES
('Il Signore degli Anelli', 'J.R.R. Tolkien', 1954, 'Fantasy', '9780618002238'),
('1984', 'George Orwell', 1949, 'Distopia', '9780451524935'),
('Il Nome della Rosa', 'Umberto Eco', 1980, 'Romanzo Storico', '9788845292613'),
('Cent''anni di solitudine', 'Gabriel García Márquez', 1967, 'Realismo Magico', '9780060883287'),
('Orgoglio e Pregiudizio', 'Jane Austen', 1813, 'Romanzo', '9780141439518'),
('Il Piccolo Principe', 'Antoine de Saint-Exupéry', 1943, 'Favola', '9788845292517'),
('Harry Potter e la Pietra Filosofale', 'J.K. Rowling', 1997, 'Fantasy', '9788831003384'),
('Il Codice da Vinci', 'Dan Brown', 2003, 'Thriller', '9780385504201'),
('La Divina Commedia', 'Dante Alighieri', 1321, 'Poema', '9788804668169'),
('I Promessi Sposi', 'Alessandro Manzoni', 1827, 'Romanzo Storico', '9788807901836');
