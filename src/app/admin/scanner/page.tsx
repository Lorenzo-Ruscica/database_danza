"use client"

import { useEffect, useState, Suspense } from "react" // Aggiunto Suspense
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertCircle, Euro, User, Loader2 } from "lucide-react"

// Spostiamo la logica in un componente interno
function ScannerContent() {
    const searchParams = useSearchParams()
    const id = searchParams.get('id')
    const supabase = createClient()

    const [allievo, setAllievo] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [pagamentoFatto, setPagamentoFatto] = useState(false)

    useEffect(() => {
        const fetchStudente = async () => {
            if (!id) {
                setIsLoading(false)
                return
            }
            try {
                const { data, error } = await supabase
                    .from('allievi')
                    .select(`
                        id,
                        nome,
                        cognome,
                        tessera_numero,
                        codice_fiscale,
                        iscrizioni_corsi (
                            corsi (
                                nome,
                                prezzo_standard
                            )
                        )
                    `)
                    .eq('id', id)
                    .single()

                if (error) throw error

                if (data) {
                    setAllievo(data)
                }
            } catch (err) {
                console.error("Errore fetch scanner:", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchStudente()
    }, [id, supabase]) // Aggiunto supabase alle dipendenze per best practice

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
        <div className="max-w-xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-bold tracking-tight">Dati Scansione</h1>

            {pagamentoFatto && (
                <div className="bg-green-100 dark:bg-green-900 border-l-4 border-green-500 p-4 rounded-md flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                    <div>
                        <p className="font-bold text-green-800 dark:text-green-200">Pagamento Registrato!</p>
                        <p className="text-green-700 dark:text-green-300 text-sm">L'operazione è stata salvata in contabilità.</p>
                    </div>
                </div>
            )}

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-4 rounded-full">
                            <User className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">{allievo.cognome} {allievo.nome}</CardTitle>
                            <CardDescription className="text-base mt-1 text-muted-foreground">Tessera: <strong className="text-foreground">{allievo.tessera_numero}</strong></CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-lg border-b pb-2 mb-3">Corsi Frequentati</h3>
                        <ul className="space-y-3">
                            {allievo.iscrizioni_corsi?.map((iscr: any, i: number) => (
                                <li key={i} className="flex justify-between items-center bg-muted/50 p-3 rounded-lg border">
                                    <span className="font-medium">{iscr.corsi.nome}</span>
                                    <span className="text-muted-foreground">€ {iscr.corsi.prezzo_standard.toFixed(2)}</span>
                                </li>
                            ))}
                            {(!allievo.iscrizioni_corsi || allievo.iscrizioni_corsi.length === 0) && (
                                <li className="text-muted-foreground">Nessun corso attivo</li>
                            )}
                        </ul>
                    </div>

                    <div className="bg-primary/5 rounded-xl p-6 border-2 border-primary/20">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-muted-foreground font-medium">Totale da Pagare:</span>
                            <span className="text-4xl font-black text-primary flex items-center">
                                <Euro className="h-8 w-8 mr-1" />
                                {totaleDaPagare.toFixed(2)}
                            </span>
                        </div>

                        <Button
                            className="w-full h-14 text-lg"
                            onClick={handleRegistraPagamento}
                            disabled={pagamentoFatto || totaleDaPagare === 0}
                        >
                            <CheckCircle2 className="mr-2 h-5 w-5" />
                            {pagamentoFatto ? "Già Pagato" : "Registra Incasso Manualmente"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// Il default export avvolge tutto in Suspense per Vercel
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