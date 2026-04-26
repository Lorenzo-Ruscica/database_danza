"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Mail, Send } from "lucide-react"

type Allievo = {
    id: string
    nome: string
    cognome: string
    email: string
}

export default function ComunicazioniPage() {
    const supabase = createClient()
    const [allievi, setAllievi] = useState<Allievo[]>([])
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isLoading, setIsLoading] = useState(true)
    const [isSending, setIsSending] = useState(false)

    const [oggetto, setOggetto] = useState("")
    const [messaggio, setMessaggio] = useState("")

    useEffect(() => {
        const fetchAllievi = async () => {
            setIsLoading(true)
            const { data, error } = await supabase
                .from('allievi')
                .select('id, nome, cognome, email')
                .not('email', 'is', null)
                .neq('email', '')
                .order('nome', { ascending: true })

            if (data && !error) {
                setAllievi(data)
            }
            setIsLoading(false)
        }

        fetchAllievi()
    }, [])

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(allievi.map(a => a.id)))
        } else {
            setSelectedIds(new Set())
        }
    }

    const handleSelectToggle = (id: string, checked: boolean) => {
        const newSet = new Set(selectedIds)
        if (checked) {
            newSet.add(id)
        } else {
            newSet.delete(id)
        }
        setSelectedIds(newSet)
    }

    const handleSend = async () => {
        if (selectedIds.size === 0) {
            alert("Seleziona almeno un allievo.")
            return
        }
        if (!oggetto.trim() || !messaggio.trim()) {
            alert("Compila oggetto e messaggio.")
            return
        }

        setIsSending(true)

        const selectedEmails = allievi
            .filter(a => selectedIds.has(a.id))
            .map(a => a.email)

        try {
            const response = await fetch('/api/send-comunicazione', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    emails: selectedEmails,
                    subject: oggetto,
                    message: messaggio
                })
            })

            if (!response.ok) throw new Error("Errore nell'invio")

            alert("Comunicazioni inviate con successo!")
            setOggetto("")
            setMessaggio("")
            setSelectedIds(new Set())
        } catch (error) {
            console.error("Errore invio comunicazioni:", error)
            alert("Si è verificato un errore durante l'invio delle email.")
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Comunicazioni</h1>
                <p className="text-muted-foreground">Invia email singole o massive a tutti gli iscritti.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_350px] gap-6">
                
                {/* Form Messaggio */}
                <Card className="order-2 md:order-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5 text-primary" />
                            Componi Messaggio
                        </CardTitle>
                        <CardDescription>Il messaggio verrà inviato agli allievi selezionati.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Oggetto</label>
                            <Input 
                                placeholder="Oggetto della mail..." 
                                value={oggetto} 
                                onChange={(e) => setOggetto(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Messaggio</label>
                            <Textarea 
                                placeholder="Scrivi qui il corpo del messaggio..." 
                                className="min-h-[250px] resize-y"
                                value={messaggio}
                                onChange={(e) => setMessaggio(e.target.value)}
                            />
                        </div>

                        <Button 
                            className="w-full mt-4" 
                            size="lg"
                            disabled={isSending || selectedIds.size === 0}
                            onClick={handleSend}
                        >
                            {isSending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Invio in corso...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Invia a {selectedIds.size} {selectedIds.size === 1 ? 'allievo' : 'allievi'}
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Lista Allievi (Rubrica) */}
                <Card className="order-1 md:order-2">
                    <CardHeader className="pb-3 border-b">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Rubrica</CardTitle>
                            <span className="text-sm text-muted-foreground">{selectedIds.size} Selezionati</span>
                        </div>
                        {allievi.length > 0 && (
                            <div className="flex items-center gap-2 mt-4">
                                <Checkbox 
                                    id="selectAll" 
                                    checked={selectedIds.size === allievi.length && allievi.length > 0}
                                    onCheckedChange={handleSelectAll}
                                />
                                <label htmlFor="selectAll" className="text-sm font-medium cursor-pointer">
                                    Seleziona Tutti
                                </label>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : allievi.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-sm">
                                Nessun allievo trovato con un'email valida.
                            </div>
                        ) : (
                            <div className="max-h-[500px] overflow-y-auto p-4 space-y-3">
                                {allievi.map((allievo) => (
                                    <div key={allievo.id} className="flex items-center space-x-3 bg-muted/30 p-2 rounded-md hover:bg-muted/50 transition-colors">
                                        <Checkbox 
                                            id={allievo.id} 
                                            checked={selectedIds.has(allievo.id)}
                                            onCheckedChange={(checked) => handleSelectToggle(allievo.id, checked as boolean)}
                                        />
                                        <label htmlFor={allievo.id} className="flex flex-col cursor-pointer flex-1">
                                            <span className="text-sm font-medium leading-none">{allievo.nome} {allievo.cognome}</span>
                                            <span className="text-xs text-muted-foreground mt-1">{allievo.email}</span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}
