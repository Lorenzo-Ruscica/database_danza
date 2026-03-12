"use client"

import { useRef, useState, useCallback } from "react"
import { useKioskStore } from "@/store/kiosk-store"
import { Button } from "@/components/ui/button"
import { Camera, RefreshCw, Upload, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function Step6Certificato({ onComplete }: { onComplete?: (data: { id: string, tessera_numero: string }) => void }) {
    const { certificatoBlob, setCertificatoBlob, prevStep, anagrafica, residenza, contatti, corsi, totalePrezzo, firmaUrl } = useKioskStore()

    const supabase = createClient()

    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const [isCameraOpen, setIsCameraOpen] = useState(false)
    const [isCapturing, setIsCapturing] = useState(false)
    const [photoPreview, setPhotoPreview] = useState<string | null>(null)

    // Inizia streaming fotocamera
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" } // Preferisci fotocamera posteriore tablet
            })
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                setIsCameraOpen(true)
            }
        } catch (err) {
            console.error("Errore accesso fotocamera:", err)
            alert("Impossibile accedere alla fotocamera. Assicurati di aver fornito i permessi.")
        }
    }

    // Ferma streaming fotocamera
    const stopCamera = useCallback(() => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream
            stream.getTracks().forEach(track => track.stop())
            videoRef.current.srcObject = null
            setIsCameraOpen(false)
        }
    }, [])

    // Scatta Foto
    const takePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current
            const canvas = canvasRef.current

            canvas.width = video.videoWidth
            canvas.height = video.videoHeight

            const context = canvas.getContext('2d')
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height)

                // Converti a Blob per il caricamento su Supabase
                canvas.toBlob((blob) => {
                    if (blob) {
                        setCertificatoBlob(blob)
                        setPhotoPreview(URL.createObjectURL(blob))
                        stopCamera()
                    }
                }, 'image/jpeg', 0.8)
            }
        }
    }

    // Riprova Scatto
    const retakePhoto = () => {
        setCertificatoBlob(null)
        setPhotoPreview(null)
        startCamera()
    }

    const handleSubmitEnrollment = async () => {
        try {
            setIsCapturing(true)

            // Generazione numero tessera random per ora (es: TS-2024-1234)
            const generatedTessera = `TS-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`

            // Pre-generiamo l'ID univoco nel browser per evitare di dover fare una SELECT dopo l'INSERT (che verrebbe bloccata dal lucchetto RLS in lettura)
            const allievoId = crypto.randomUUID()

            // 1. Inserisci Anagrafica in Supabase (SENZA .select() alla fine)
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

            // 3. Upload certificato medico (se scattato)
            if (certificatoBlob) {
                const fileName = `${allievoId}-${Date.now()}.jpg`
                // Tentiamo l'upload nel bucket 'certificati'
                const { data: uploadData, error: uploadErr } = await supabase.storage.from('certificati').upload(fileName, certificatoBlob)

                if (!uploadErr && uploadData) {
                    const dataScadenza = new Date()
                    dataScadenza.setFullYear(dataScadenza.getFullYear() + 1) // Scadenza tra un anno esatto

                    const { error: certErr } = await supabase.from('certificati').insert([{
                        allievo_id: allievoId,
                        url_foto: uploadData.path,
                        data_scadenza: dataScadenza.toISOString().split('T')[0]
                    }])
                    if (certErr) console.error("Errore salvataggio record certificato:", certErr)
                } else {
                    console.error("Errore caricamento Storage:", uploadErr)
                }
            }

            // Upload firma (in formato Png) in un bucket separato "firme"
            if (firmaUrl) {
                try {
                    // Costruisce il Blob a mano (più sicuro rispetto a fetch() che su alcuni browser blocca le stringhe base64)
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
                        .from('firme') // <--- Usa il bucket 'firme'
                        .upload(firmaName, firmaBlob, {
                            contentType: 'image/png',
                            upsert: true
                        });
                        
                    if (signatureErr) {
                        console.error("Errore salvataggio firma:", signatureErr);
                        alert("Attenzione: La firma digitale non è stata salvata correttamente. Errore: " + signatureErr.message);
                    }
                } catch (e: any) {
                    console.error("Errore conversione firma:", e);
                    alert("Attenzione: Impossibile convertire la firma digitale per il salvataggio.");
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
            alert("Si è verificato un errore durante l'iscrizione sul server Supabase: " + errorMsg)
            setIsCapturing(false)
        }
    }

    // Cleanup alla distruzione del componente
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useCallback(() => stopCamera(), [stopCamera])

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold flex items-center justify-center gap-3">
                    <Camera className="h-8 w-8 text-primary" />
                    6. Certificato Medico
                </h2>
                <p className="text-muted-foreground text-lg">
                    Fotografa il tuo certificato medico per completare l'iscrizione.
                </p>
            </div>

            <div className="bg-zinc-100 rounded-2xl border-2 border-dashed border-zinc-300 p-4 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden">

                {/* State 1: Nessuna foto, Camera Chiusa */}
                {!isCameraOpen && !photoPreview && (
                    <div className="text-center space-y-6">
                        <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-primary">
                            <Camera className="w-12 h-12" />
                        </div>
                        <div>
                            <p className="text-xl font-medium mb-4">Usa la fotocamera del totem</p>
                            <Button size="lg" className="h-14 text-lg px-8" onClick={startCamera}>
                                Avvia Fotocamera
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-4">
                            Oppure puoi consegnarlo in segreteria successivamente.
                        </p>
                    </div>
                )}

                {/* State 2: Fotocamera Attiva */}
                <div className={`w-full max-w-2xl mx-auto rounded-xl overflow-hidden shadow-2xl bg-black ${isCameraOpen ? 'block' : 'hidden'}`}>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-auto object-cover aspect-[4/3]"
                    />
                    <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex justify-center">
                        <Button size="lg" className="rounded-full w-20 h-20 shadow-xl border-4 border-zinc-300 relative group" onClick={takePhoto}>
                            <span className="absolute bg-destructive rounded-full w-14 h-14 group-active:scale-95 transition-transform" />
                        </Button>
                    </div>
                </div>

                {/* State 3: Foto Scattata (Preview) */}
                {photoPreview && (
                    <div className="w-full max-w-2xl mx-auto rounded-xl overflow-hidden shadow-xl border-4 border-green-500 bg-white">
                        <div className="bg-green-500 text-white p-3 flex justify-center items-center gap-2 font-medium">
                            <CheckCircle2 className="h-5 w-5" /> Acquisito con successo
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photoPreview} alt="Preview Certificato" className="w-full h-auto object-cover aspect-[4/3]" />
                        <div className="p-4 flex justify-center">
                            <Button variant="outline" size="lg" onClick={retakePhoto}>
                                <RefreshCw className="mr-2 h-5 w-5" /> Scatta di nuovo
                            </Button>
                        </div>
                    </div>
                )}

                {/* Canvas nascosto per i dati */}
                <canvas ref={canvasRef} className="hidden" />
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
                    className="h-16 px-12 text-xl"
                    onClick={handleSubmitEnrollment}
                    disabled={isCapturing}
                >
                    {isCapturing ? "Invio in corso..." : "Invia Iscrizione"}
                    {!isCapturing && <Upload className="ml-2 h-5 w-5" />}
                </Button>
            </div>
        </div>
    )
}
