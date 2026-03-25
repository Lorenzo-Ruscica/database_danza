"use client"

import { useState } from "react"
import { useKioskStore } from "@/store/kiosk-store"
import { Button } from "@/components/ui/button"
import { FileWarning, Upload, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function Step6Certificato({ onComplete }: { onComplete?: (data: { id: string, tessera_numero: string }) => void }) {
    const { prevStep, anagrafica, residenza, contatti, corsi, totalePrezzo, firmaUrl } = useKioskStore()

    const supabase = createClient()
    const [isCapturing, setIsCapturing] = useState(false)

    const handleSubmitEnrollment = async () => {
        try {
            setIsCapturing(true)

            // Generazione numero tessera random per ora (es: TS-2024-1234)
            const generatedTessera = `TS-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`

            // Pre-generiamo l'ID univoco nel browser per evitare di dover fare una SELECT dopo l'INSERT (che verrebbe bloccata dal lucchetto RLS in lettura)
            const allievoId = crypto.randomUUID()

            // 1. Inserisci Anagrafica in Supabase
            const { error: allievoError } = await supabase.from('allievi').insert([{
                id: allievoId,
                nome: anagrafica.nome,
                cognome: anagrafica.cognome,
                data_nascita: anagrafica.dataNascita,
                luogo_nascita: anagrafica.luogoNascita,
                provincia_nascita: anagrafica.provinciaNascita,
                codice_fiscale: residenza.codiceFiscale,
                indirizzo_residenza: residenza.indirizzo,
                cap_residenza: residenza.cap,
                provincia_residenza: residenza.provincia,
                email: contatti.email || null,
                telefono: contatti.telefono,
                is_minore: anagrafica.isMinorenne,
                tessera_numero: generatedTessera,
                tutore_nome: anagrafica.isMinorenne ? anagrafica.tutoreNome : null,
                tutore_cognome: anagrafica.isMinorenne ? anagrafica.tutoreCognome : null,
                tutore_codice_fiscale: anagrafica.isMinorenne ? anagrafica.tutoreCodiceFiscale : null,
            }])

            if (allievoError) throw allievoError;

            // 2. Iscrivi ai corsi selezionati
            if (corsi && corsi.length > 0) {
                const iscrizioni = corsi.map(cId => ({
                    allievo_id: allievoId,
                    corso_id: cId
                }))
                const { error: corsiError } = await supabase.from('iscrizioni_corsi').insert(iscrizioni)
                if (corsiError) console.error("Errore iscrizione corsi:", corsiError)
            }

            // 3. Upload firma (in formato Png) in un bucket separato "firme"
            if (firmaUrl) {
                try {
                    // Costruisce il Blob a mano
                    const base64Data = firmaUrl.split(',')[1];
                    const byteCharacters = atob(base64Data);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const firmaBlob = new Blob([byteArray], { type: 'image/png' });

                    const firmaName = `firma-${allievoId}.png`;
                    const { error: signatureErr } = await supabase.storage
                        .from('firme')
                        .upload(firmaName, firmaBlob, {
                            contentType: 'image/png',
                            upsert: true
                        });
                        
                    if (signatureErr) {
                        console.error("Errore salvataggio firma:", signatureErr);
                    }
                } catch (e: any) {
                    console.error("Errore conversione firma:", e);
                }
            }

            // 4. Invia email con QR Code (se presente)
            if (contatti.email) {
                try {
                    const scanUrl = `${window.location.origin}/admin/scanner?id=${allievoId}`;
                    await fetch('/api/send-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: contatti.email,
                            tessera_numero: generatedTessera,
                            nome: `${anagrafica.nome} ${anagrafica.cognome}`,
                            allievoId: allievoId,
                            scanUrl: scanUrl,
                            anagrafica: anagrafica,
                            residenza: residenza,
                            contatti: contatti,
                            totale_prezzo: totalePrezzo,
                        })
                    })
                } catch (emailErr) {
                    console.error("Errore invio email:", emailErr)
                }
            }

            // 5. Fine & passaggio alla schermata di successo
            setIsCapturing(false)
            if (onComplete) {
                onComplete({ id: allievoId, tessera_numero: generatedTessera })
            } else {
                alert(`Iscrizione completata per ${anagrafica.nome}!`)
                window.location.reload()
            }
        } catch (error: any) {
            console.error("Detailed insert error:", error)
            const errorMsg = error?.message || JSON.stringify(error) || "Errore non noto";
            alert("Si è verificato un errore durante l'iscrizione sul server: " + errorMsg)
            setIsCapturing(false)
        }
    }

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold flex items-center justify-center gap-3">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                    6. Riepilogo Finale
                </h2>
                <p className="text-muted-foreground text-lg">
                    Conferma i tuoi dati per completare l'iscrizione.
                </p>
            </div>

            <div className="bg-background rounded-2xl border-2 border-dashed border-primary/30 p-8 min-h-[300px] flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
                <div className="text-center space-y-6 max-w-lg">
                    <div className="bg-amber-100 dark:bg-amber-950/40 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400 shadow-inner">
                        <FileWarning className="w-12 h-12" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold mb-3 text-foreground">Certificato Medico Richiesto</p>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Ricorda che per procedere col pagamento e validare l'iscrizione ai corsi, 
                            <span className="font-semibold text-foreground"> dovrai presentare il tuo Certificato Medico in segreteria.</span>
                            <br/><br/>
                            Sarà l'amministrazione, tramite scansione del tuo QR Code, 
                            a caricarlo nel nostro gestionale.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-8 border-t mt-4">
                <Button
                    variant="outline"
                    size="lg"
                    className="h-16 px-8 text-xl"
                    onClick={prevStep}
                    disabled={isCapturing}
                >
                    Indietro
                </Button>
                <Button
                    size="lg"
                    className="h-16 px-12 text-xl font-bold"
                    onClick={handleSubmitEnrollment}
                    disabled={isCapturing}
                >
                    {isCapturing ? "Elaborazione in corso..." : "Invia Iscrizione Definitiva"}
                    {!isCapturing && <Upload className="ml-2 h-6 w-6" />}
                </Button>
            </div>
        </div>
    )
}
