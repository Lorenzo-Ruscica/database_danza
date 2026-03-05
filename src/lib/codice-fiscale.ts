import CodiceFiscale from 'codice-fiscale-js';

export interface AnagraficaInput {
    name: string;
    surname: string;
    gender: 'M' | 'F';
    day: number;
    month: number;
    year: number;
    birthplace: string;
    prov: string;
}

/**
 * Calcola il codice fiscale in base ai dati anagrafici forniti.
 * Usa la libreria 'codice-fiscale-js' che gestisce i codici belfiore.
 */
export function calcolaCodiceFiscale(dati: AnagraficaInput): string {
    try {
        const cf = new CodiceFiscale({
            name: dati.name,
            surname: dati.surname,
            gender: dati.gender,
            day: dati.day,
            month: dati.month,
            year: dati.year,
            birthplace: dati.birthplace,
            birthplaceProvincia: dati.prov,
        });
        return cf.toString();
    } catch (error) {
        console.error("Errore durante il calcolo del codice fiscale:", error);
        throw new Error("Dati anagrafici non validi o comune non trovato.");
    }
}

/**
 * Valida un codice fiscale esistente.
 */
export function validaCodiceFiscale(cf: string): boolean {
    try {
        return CodiceFiscale.check(cf);
    } catch {
        return false;
    }
}
