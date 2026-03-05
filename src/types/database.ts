// Shared Types extracted from Supabase tables conceptual schema

export interface Allievo {
    id: string
    nome: string
    cognome: string
    tessera_numero: string
    codice_fiscale: string
    data_nascita: string
    luogo_nascita: string
    provincia_nascita: string
    indirizzo: string
    cap: string
    provincia_residenza: string
    telefono: string
    email: string
    pagamento_iscrizione: boolean
    scadenza_certificato_medico: string | null
    coppia_id?: string | null
}

export interface Corso {
    id: string
    nome: string
    prezzo_mensile: number
    descrizione?: string
}

export interface Pagamento {
    id: string
    allievo_id: string
    importo: number
    mese_riferimento: string // YYYY-MM
    data_pagamento: string // ISO string
    note?: string
}
