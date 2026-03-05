import { create } from 'zustand'

export interface KioskState {
    // Navigation
    step: number
    setStep: (step: number) => void
    nextStep: () => void
    prevStep: () => void

    // Step 1: Anagrafica (incl. Minori)
    anagrafica: {
        nome: string
        cognome: string
        dataNascita: string
        luogoNascita: string
        provinciaNascita: string
        sesso: 'M' | 'F'
        isMinorenne: boolean
        tutoreNome: string
        tutoreCognome: string
        tutoreCodiceFiscale: string
    }
    updateAnagrafica: (data: Partial<KioskState['anagrafica']>) => void

    // Step 2: Residenza e CF
    residenza: {
        codiceFiscale: string
        indirizzo: string
        cap: string
        provincia: string
    }
    updateResidenza: (data: Partial<KioskState['residenza']>) => void

    // Step 3: Contatti
    contatti: {
        telefono: string
        email: string
    }
    updateContatti: (data: Partial<KioskState['contatti']>) => void

    // Step 4: Corsi Scelti
    corsi: string[] // Array of course IDs
    totalePrezzo: number
    toggleCorso: (corsoId: string, prezzo: number) => void

    // Step 5: Firma Digitale
    firmaUrl: string | null
    setFirmaUrl: (url: string | null) => void

    // Step 6: Certificato Medico
    certificatoBlob: Blob | null
    setCertificatoBlob: (blob: Blob | null) => void

    // Reset
    resetForm: () => void
}

const initialState = {
    step: 1,
    anagrafica: {
        nome: '',
        cognome: '',
        dataNascita: '',
        luogoNascita: '',
        provinciaNascita: '',
        sesso: 'M' as const,
        isMinorenne: false,
        tutoreNome: '',
        tutoreCognome: '',
        tutoreCodiceFiscale: ''
    },
    residenza: {
        codiceFiscale: '',
        indirizzo: '',
        cap: '',
        provincia: ''
    },
    contatti: {
        telefono: '',
        email: ''
    },
    corsi: [],
    totalePrezzo: 0,
    firmaUrl: null,
    certificatoBlob: null
}

export const useKioskStore = create<KioskState>((set) => ({
    ...initialState,

    setStep: (step) => set({ step }),
    nextStep: () => set((state) => ({ step: Math.min(state.step + 1, 6) })),
    prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),

    updateAnagrafica: (data) => set((state) => ({
        anagrafica: { ...state.anagrafica, ...data }
    })),

    updateResidenza: (data) => set((state) => ({
        residenza: { ...state.residenza, ...data }
    })),

    updateContatti: (data) => set((state) => ({
        contatti: { ...state.contatti, ...data }
    })),

    toggleCorso: (corsoId, prezzo) => set((state) => {
        const isSelected = state.corsi.includes(corsoId)
        if (isSelected) {
            return {
                corsi: state.corsi.filter(id => id !== corsoId),
                totalePrezzo: state.totalePrezzo - prezzo
            }
        } else {
            return {
                corsi: [...state.corsi, corsoId],
                totalePrezzo: state.totalePrezzo + prezzo
            }
        }
    }),

    setFirmaUrl: (url) => set({ firmaUrl: url }),
    setCertificatoBlob: (blob) => set({ certificatoBlob: blob }),

    resetForm: () => set(initialState)
}))
