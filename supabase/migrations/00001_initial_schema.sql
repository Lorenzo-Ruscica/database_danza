-- Enable UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables to allow re-running the script
DROP TABLE IF EXISTS public.certificati CASCADE;
DROP TABLE IF EXISTS public.pagamenti CASCADE;
DROP TABLE IF EXISTS public.iscrizioni_corsi CASCADE;
DROP TABLE IF EXISTS public.corsi CASCADE;
DROP TABLE IF EXISTS public.allievi CASCADE;

-- 1. TABELLA: ALLIEVI (Anagrafica e Stato)
CREATE TABLE public.allievi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Dati Legali
    nome TEXT NOT NULL,
    cognome TEXT NOT NULL,
    data_nascita DATE NOT NULL,
    luogo_nascita TEXT NOT NULL,
    provincia_nascita VARCHAR(2) NOT NULL,
    codice_fiscale VARCHAR(16) UNIQUE NOT NULL,
    -- Contatti
    email TEXT,
    telefono TEXT,
    -- Residenza
    indirizzo_residenza TEXT NOT NULL,
    cap_residenza VARCHAR(5) NOT NULL,
    provincia_residenza VARCHAR(2) NOT NULL,
    regione_residenza TEXT,
    nazione_residenza TEXT DEFAULT 'Italia' NOT NULL,
    -- Parametri Scuola & Stato
    tessera_numero TEXT UNIQUE,
    is_minore BOOLEAN DEFAULT false NOT NULL,
    iscrizione_pagata BOOLEAN DEFAULT false NOT NULL,
    -- Relazione Coppia (Self-Reference)
    id_partner UUID REFERENCES public.allievi(id) ON DELETE SET NULL,
    
    -- Dati Tutore Legale (compilati solo se is_minore = true)
    tutore_nome TEXT,
    tutore_cognome TEXT,
    tutore_codice_fiscale VARCHAR(16),
    tutore_telefono TEXT,
    tutore_email TEXT
);

-- Note regarding couples: Se un allievo ha un id_partner, in teoria il partner dovrebbe avere l'id_partner puntato verso l'allievo.
-- L'integrità referenziale permette a id_partner di essere NULL se la coppia si "rompe", usando ON DELETE SET NULL.

-- 2. TABELLA: CORSI
CREATE TABLE public.corsi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    nome TEXT NOT NULL,
    descrizione TEXT,
    prezzo_standard DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    attivo BOOLEAN DEFAULT true NOT NULL
);

-- 3. TABELLA: ISCRIZIONI_CORSI (Relazione M:N tra Allievi e Corsi)
CREATE TABLE public.iscrizioni_corsi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    allievo_id UUID NOT NULL REFERENCES public.allievi(id) ON DELETE CASCADE,
    corso_id UUID NOT NULL REFERENCES public.corsi(id) ON DELETE CASCADE,
    -- Prezzo concordato: Se null usa il prezzo standard del corso, se popolato è un override manuale
    prezzo_concordato DECIMAL(10, 2),
    attivo BOOLEAN DEFAULT true NOT NULL,
    
    -- Un allievo non può iscriversi allo stesso corso due volte
    UNIQUE(allievo_id, corso_id)
);

-- 4. TABELLA: PAGAMENTI (Contabilità)
-- Genera lo storico per ricevute A4
CREATE TABLE public.pagamenti (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    allievo_id UUID NOT NULL REFERENCES public.allievi(id) ON DELETE CASCADE,
    
    importo DECIMAL(10, 2) NOT NULL,
    data_pagamento TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    mese_riferimento TEXT NOT NULL, -- Format expected "YYYY-MM" (e.g. "2024-03" per Marzo 2024)
    metodo_pagamento TEXT DEFAULT 'Contanti', -- Es. Bonifico, POS, Contanti
    
    -- ID progressivo generato (opzionale se gestito lato DB o code). Per ora usiamo l'UUID oppure un identificatore incrementale
    id_ricevuta SERIAL NOT NULL UNIQUE,
    note TEXT
);

-- 5. TABELLA: CERTIFICATI (Documentazione Medica)
CREATE TABLE public.certificati (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    allievo_id UUID NOT NULL REFERENCES public.allievi(id) ON DELETE CASCADE,
    
    url_foto TEXT NOT NULL, -- Riferimento al path nello Storage di Supabase
    data_scadenza DATE NOT NULL,
    is_agonistico BOOLEAN DEFAULT false,
    
    -- Flag per evitare di spammare email ogni notte per i certificati vicini alla scadenza
    remind_inviato BOOLEAN DEFAULT false NOT NULL 
);

-- Abilita RLS (Row Level Security) per tutte le tabelle (Best Practice per Supabase)
ALTER TABLE public.allievi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corsi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iscrizioni_corsi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamenti ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificati ENABLE ROW LEVEL SECURITY;

-- Esempio (Opzionale): Policy che permette accesso completo solo ad utenti loggati (Admin)
-- CREATE POLICY "Allow authenticated full access" ON public.allievi FOR ALL TO authenticated USING (true);
