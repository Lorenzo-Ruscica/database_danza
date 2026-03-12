"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertCircle, Euro, User, Loader2 } from "lucide-react"

// FORZA IL RENDERING DINAMICO: Risolve l'errore "Command npm run build exited with 1" su Vercel
export const dynamic = 'force-dynamic';

function ScannerContent() {
    const searchParams = useSearchParams()
    const id = searchParams.get('id')
    const supabase = createClient()

    const [allievo, setAllievo] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [pagamentoFatto, setPagamentoFatto] = useState(false)
    const [firmaError, setFirmaError] = useState(false)

    useEffect(() => {
        const fetchStudente = async () => {
            if (!id) {
                setIsLoading(false)
                return
            }
            try {
                // Preleva l'allievo e i suoi corsi tramite la tabella ponte iscrizioni_corsi
                const { data, error } = await supabase
                    .from('allievi')
                    .select(`
                        id,
                        nome,
                        cognome,
                        tessera_numero,
                        codice_fiscale,
                        data_nascita,
                        luogo_nascita,
                        provincia_nascita,
                        indirizzo_residenza,
                        cap_residenza,
                        provincia_residenza,
                        email,
                        telefono,
                        is_minore,
                        tutore_nome,
                        tutore_cognome,
                        tutore_codice_fiscale,
                        iscrizioni_corsi (
                            corsi (
                                nome,
                                prezzo_standard
                            )
                        ),
                        certificati (
                            url_foto,
                            data_scadenza
                        )
                    `)
                    .eq('id', id)
                    .single()

                if (error) throw error

                if (data) {
                    setAllievo(data)

                    // Controllo se ha già pagato per il mese corrente
                    const today = new Date()
                    const meseT = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

                    const { data: checkPagamento } = await supabase
                        .from('pagamenti')
                        .select('id')
                        .eq('allievo_id', id)
                        .eq('mese_riferimento', meseT)

                    if (checkPagamento && checkPagamento.length > 0) {
                        setPagamentoFatto(true)
                    }
                }
            } catch (err) {
                console.error("Errore fetch scanner:", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchStudente()
    }, [id, supabase])

    const handleRegistraPagamento = async () => {
        if (!allievo) return

        try {
            const today = new Date()
            const meseT = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
            const importo = allievo.iscrizioni_corsi?.reduce((acc: number, iscr: any) => acc + (iscr.corsi?.prezzo_standard || 0), 0) || 0

            const { error } = await supabase.from('pagamenti').insert([{
                allievo_id: allievo.id,
                importo: importo,
                mese_riferimento: meseT
            }])

            if (error) throw error
            setPagamentoFatto(true)
        } catch (err) {
            console.error("Errore registrazione pagamento:", err)
            alert("Errore durante la registrazione del pagamento.")
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p>Ricerca allievo nel database...</p>
            </div>
        )
    }

    if (!id || !allievo) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center p-6">
                <AlertCircle className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold">Allievo Non Trovato</h1>
                <p className="text-muted-foreground">Il QR code scansionato non è valido o l'allievo è stato rimosso.</p>
            </div>
        )
    }

    const totaleDaPagare = allievo.iscrizioni_corsi?.reduce((acc: number, iscr: any) => acc + (iscr.corsi?.prezzo_standard || 0), 0) || 0

    return (
        <div className="w-full max-w-xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 pt-6 pb-24 md:pt-10">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-center md:text-left">Esito Scansione</h1>

            {pagamentoFatto && (
                <div className="bg-green-100 dark:bg-green-900 border-l-4 border-green-500 p-4 rounded-xl flex items-start gap-3 shadow-sm">
                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold text-green-800 dark:text-green-200">Quota Mensile Saldata</p>
                        <p className="text-green-700 dark:text-green-300 text-sm mt-1">Lo studente risulta in regola con i pagamenti per il mese in corso.</p>
                    </div>
                </div>
            )}

            <Card className="shadow-lg border-primary/10 overflow-hidden">
                <CardHeader className="bg-muted/30 pb-4 border-b">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary p-3 md:p-4 rounded-full shadow-inner text-primary-foreground">
                            <User className="h-6 w-6 md:h-8 md:w-8" />
                        </div>
                        <div className="flex-1">
                            <CardTitle className="text-xl md:text-2xl font-black">{allievo.cognome} {allievo.nome}</CardTitle>
                            <CardDescription className="text-sm md:text-base mt-1 text-muted-foreground flex flex-col md:flex-row md:items-center gap-1">
                                <span>Tessera: <strong className="text-foreground">{allievo.tessera_numero}</strong></span>
                                <span className="hidden md:inline text-muted-foreground/40">•</span>
                                <span>CF: {allievo.codice_fiscale}</span>
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6 px-4 md:px-6">
                    <div>
                        <h3 className="font-semibold text-base md:text-lg border-b pb-2 mb-3 text-muted-foreground">Pacchetto Corsi Selezionati</h3>
                        <ul className="space-y-2.5">
                            {allievo.iscrizioni_corsi?.map((iscr: any, i: number) => (
                                <li key={i} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg shadow-sm">
                                    <span className="font-medium text-sm md:text-base">{iscr.corsi.nome}</span>
                                    <span className="text-muted-foreground font-semibold">€ {iscr.corsi.prezzo_standard.toFixed(2)}</span>
                                </li>
                            ))}
                            {(!allievo.iscrizioni_corsi || allievo.iscrizioni_corsi.length === 0) && (
                                <li className="text-muted-foreground bg-zinc-50 border p-3 rounded-lg text-sm text-center">Nessun corso attivo trovato</li>
                            )}
                        </ul>
                    </div>

                    <div className="bg-primary/5 rounded-2xl p-5 md:p-6 border-2 border-primary/20 shadow-inner">
                        <div className="flex justify-between items-end mb-6">
                            <span className="text-muted-foreground font-semibold text-sm md:text-base uppercase tracking-wider">Totale Mensile</span>
                            <span className="text-4xl md:text-5xl font-black text-primary flex items-center leading-none tracking-tighter">
                                <Euro className="h-7 w-7 md:h-10 md:w-10 mr-1 opacity-80" />
                                {totaleDaPagare.toFixed(2)}
                            </span>
                        </div>

                        <Button
                            className="w-full h-16 text-lg md:text-xl font-bold shadow-lg transition-transform active:scale-95"
                            onClick={handleRegistraPagamento}
                            disabled={pagamentoFatto || totaleDaPagare === 0}
                            variant={pagamentoFatto ? "secondary" : "default"}
                        >
                            <CheckCircle2 className="mr-2 h-6 w-6 md:h-7 md:w-7" />
                            {pagamentoFatto ? "Pagato per questo mese" : "Conferma Ricezione Soldi"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="py-4 border-b">
                    <CardTitle className="text-lg">Dati Anagrafici e Contatti</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                        <p className="text-sm font-semibold text-muted-foreground">Data e Luogo di Nascita</p>
                        <p className="font-medium">{new Date(allievo.data_nascita).toLocaleDateString()} a {allievo.luogo_nascita} ({allievo.provincia_nascita})</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-muted-foreground">Residenza</p>
                        <p className="font-medium">{allievo.indirizzo_residenza}, {allievo.cap_residenza} - {allievo.provincia_residenza}</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-muted-foreground">Email</p>
                        <p className="font-medium">{allievo.email || 'Non fornita'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-muted-foreground">Telefono</p>
                        <p className="font-medium">{allievo.telefono || 'Non fornito'}</p>
                    </div>
                    {allievo.is_minore && (
                        <div className="md:col-span-2 mt-2 bg-muted/50 p-3 rounded-md border">
                            <p className="text-sm font-semibold text-muted-foreground mb-1">Dati Tutore Legale</p>
                            <p className="font-medium">{allievo.tutore_nome} {allievo.tutore_cognome}</p>
                            <p className="text-sm">CF: {allievo.tutore_codice_fiscale}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="shadow-sm">
                    <CardHeader className="py-4 border-b">
                        <CardTitle className="text-lg">Firma e Regolamento</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 flex justify-center">
                        {!firmaError ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img 
                                src={supabase.storage.from('certificati').getPublicUrl(`firma-${id}.png`).data.publicUrl} 
                                alt="Firma Studente" 
                                className="w-full max-w-sm h-40 object-contain bg-zinc-50 border rounded-lg"
                                onError={() => setFirmaError(true)}
                            />
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">Nessuna firma digitale trovata a sistema.</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader className="py-4 border-b">
                        <CardTitle className="text-lg flex justify-between items-center">
                            <span>Certificato Medico</span>
                            {allievo.certificati && allievo.certificati[0]?.data_scadenza && (
                                <span className={`text-sm font-normal ${new Date(allievo.certificati[0].data_scadenza) < new Date() ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                                    Scad. {new Date(allievo.certificati[0].data_scadenza).toLocaleDateString()}
                                </span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {allievo.certificati && allievo.certificati[0]?.url_foto ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img 
                                src={supabase.storage.from('certificati').getPublicUrl(allievo.certificati[0].url_foto).data.publicUrl} 
                                alt="Certificato Medico" 
                                className="w-full h-40 object-cover cursor-pointer hover:opacity-90 transition-opacity border rounded-lg"
                                onClick={() => window.open(supabase.storage.from('certificati').getPublicUrl(allievo.certificati[0].url_foto).data.publicUrl, '_blank')}
                            />
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">Nessun certificato medico caricato.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function ScannerPage() {
    return (
        <Suspense fallback={
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        }>
            <ScannerContent />
        </Suspense>
    )
}