# 📚 MyLibrary - Sistema di Gestione Libreria

> Applicazione web completa per la gestione di una libreria con portale admin e portale clienti.

![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)

## 🚀 Quick Start

```bash
# Installa dipendenze
npm install

# Configura le variabili d'ambiente
# Copia .env.example in .env e inserisci le credenziali Supabase

# Avvia il server di sviluppo
npm run dev
```

Poi visita http://localhost:5173

## 📋 Prerequisiti

Prima di iniziare, leggi questi file nell'ordine:

1. **[LEGGI_PRIMA.md](LEGGI_PRIMA.md)** - Panoramica e stato del progetto
2. **[CHECKLIST.md](CHECKLIST.md)** - Guida passo-passo per il completamento
3. **[GUIDA_SETUP.md](GUIDA_SETUP.md)** - Istruzioni dettagliate per Supabase e deploy
4. **[IMPLEMENTAZIONE_COMPLETATA.md](IMPLEMENTAZIONE_COMPLETATA.md)** - Riepilogo tecnico completo

## ✨ Funzionalità Principali

### 🔐 Autenticazione
- Registrazione utenti con form completo
- Login sicuro con Supabase Auth
- Gestione sessione persistente
- Protezione route per admin e clienti

### 👨‍💼 Portale Admin
- **Dashboard** con statistiche in tempo reale
- **Gestione Libri** - CRUD completo (crea, leggi, modifica, elimina)
- **Gestione Utenti** - Visualizzazione e gestione ruoli
- **Gestione Prestiti** - Creazione e tracking prestiti
- **Statistiche Avanzate** - Grafici interattivi con Recharts

### 👤 Portale Clienti
- Catalogo libri con design moderno
- Ricerca per titolo e autore
- Filtro per genere letterario
- Richiesta prestiti con un click
- Indicatori di disponibilità in tempo reale

## 🛠️ Tecnologie Utilizzate

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Routing**: React Router v6
- **Grafici**: Recharts
- **Icone**: React Icons
- **Hosting**: Vercel (consigliato)

## 📁 Struttura del Progetto

```
src/
├── components/        # Componenti riutilizzabili
│   ├── Navbar.tsx
│   └── ProtectedRoute.tsx
├── contexts/         # Context providers
│   └── AuthContext.tsx
├── hooks/            # Custom hooks
│   └── useAuth.ts
├── lib/              # Configurazioni
│   └── supabase.ts
├── pages/            # Pagine dell'applicazione
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── ClientHome.tsx
│   ├── AdminDashboard.tsx
│   ├── AdminBooks.tsx
│   ├── AdminUsers.tsx
│   ├── AdminLoans.tsx
│   └── AdminStats.tsx
├── types/            # TypeScript types
│   └── index.ts
├── App.tsx           # Router principale
└── main.tsx          # Entry point
```

## 🗄️ Database

Lo schema completo del database si trova in `supabase-schema.sql` e include:

- **Tabella `utenti`**: Gestione utenti con ruoli (admin/cliente)
- **Tabella `libri`**: Catalogo libri con gestione disponibilità
- **Tabella `prestiti`**: Tracking prestiti con relazioni
- **RLS Policies**: Sicurezza a livello di riga
- **Trigger**: Aggiornamento automatico disponibilità libri
- **Dati di esempio**: 10 libri pre-caricati

## ⚙️ Configurazione

### 1. Configurare Supabase

1. Crea un progetto su [supabase.com](https://supabase.com)
2. Esegui il contenuto di `supabase-schema.sql` nel SQL Editor
3. Copia URL e API Key

### 2. Configurare Variabili d'Ambiente

Crea un file `.env` nella root:

```env
VITE_SUPABASE_URL=https://tuo-progetto.supabase.co
VITE_SUPABASE_ANON_KEY=tua-chiave-anon-qui
```

### 3. Creare il Primo Admin

Dopo la registrazione, nel pannello Supabase:

```sql
UPDATE utenti SET is_admin = TRUE WHERE email = 'tuaemail@example.com';
```

## 🧪 Testing

Segui la [CHECKLIST.md](CHECKLIST.md) per testare tutte le funzionalità:

- ✅ Registrazione e login
- ✅ CRUD libri, utenti e prestiti
- ✅ Richiesta prestiti da portale clienti
- ✅ Dashboard statistiche
- ✅ Protezione route

## 🚀 Deployment

### Vercel (Consigliato)

1. Push del codice su GitHub
2. Collega il repository a [Vercel](https://vercel.com)
3. Configura le variabili d'ambiente
4. Deploy automatico!

```bash
# Build locale per test
npm run build
npm run preview
```

## 📊 Funzionalità Implementate

| Categoria | Stato |
|-----------|-------|
| Setup Progetto | ✅ 100% |
| Database Schema | ✅ 100% |
| Autenticazione | ✅ 100% |
| CRUD Libri | ✅ 100% |
| CRUD Utenti | ✅ 100% |
| CRUD Prestiti | ✅ 100% |
| Portale Clienti | ✅ 100% |
| Dashboard Statistiche | ✅ 100% |
| UI/UX Design | ✅ 100% |

## 🎯 Requisiti Soddisfatti

### Requisiti Base
- ✅ Database con entità Utenti, Libri, Prestiti
- ✅ Relazioni e vincoli di integrità
- ✅ GUI per CRUD completo
- ✅ Webapp React con Tailwind CSS

### Funzionalità Avanzate
- ✅ **FA1**: Separazione portale admin/clienti
- ✅ **FA2**: Dati di esempio pre-caricati
- ✅ **FA4**: Statistiche e grafici avanzati
- ✅ **FA6**: Gestione eccezioni e feedback utente

### Opzionali (Da Implementare)
- 🔜 **FA3**: Supporto multi-lingua (i18next)
- 🔜 **FA5**: Chatbot AI con accesso statistiche

## 🤝 Contributi

Questo progetto è stato sviluppato come progetto didattico.

## 📝 Licenza

MIT

## 📞 Supporto

Per problemi o domande:
1. Consulta [GUIDA_SETUP.md](GUIDA_SETUP.md)
2. Controlla [CHECKLIST.md](CHECKLIST.md)
3. Leggi [IMPLEMENTAZIONE_COMPLETATA.md](IMPLEMENTAZIONE_COMPLETATA.md)

## 🎉 Crediti

Sviluppato con ❤️ usando:
- [React](https://react.dev/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)

---

**Ready to use!** 🚀 Segui la [CHECKLIST.md](CHECKLIST.md) per completare il setup!
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
