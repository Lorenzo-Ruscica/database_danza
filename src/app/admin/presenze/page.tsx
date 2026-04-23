"use client"

import { useState, useEffect } from "react"
import { Check, User, CalendarDays, Loader2 } from "lucide-react"

import { createClient } from "@/lib/supabase/client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { StampaListaCorsi } from "@/components/admin/stampa-registro"
import { Printer } from "lucide-react"

export default function PresenzePage() {
    const [corsi, setCorsi] = useState<{ id: string, nome: string }[]>([])
    const [iscritti, setIscritti] = useState<{ id: string, nome: string, presente: boolean }[]>([])
    const [corsoSelezionato, setCorsoSelezionato] = useState<string>("")
    const [isPrinting, setIsPrinting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [dataSelezionata, setDataSelezionata] = useState<string>(new Date().toISOString().split('T')[0])
    const [isSavingPresenze, setIsSavingPresenze] = useState(false)

    const supabase = createClient()

    // 1. Fetch available courses on mount
    useEffect(() => {
        const fetchCorsi = async () => {
            const { data, error } = await supabase.from('corsi').select('id, nome').order('nome')
            if (data && data.length > 0) {
                setCorsi(data)
                setCorsoSelezionato(data[0].id)
            }
            setIsLoading(false)
        }
        fetchCorsi()
    }, [])

    // 2. Fetch students and attendances for the selected date
    useEffect(() => {
        const fetchIscritti = async () => {
            if (!corsoSelezionato || !dataSelezionata) return;

            setIsLoading(true)
            const { data, error } = await supabase
                .from('iscrizioni_corsi')
                .select(`
                    allievi (
                        id,
                        nome,
                        cognome
                    )
                `)
                .eq('corso_id', corsoSelezionato)

            const { data: presenzeData } = await supabase
                .from('presenze')
                .select('allievo_id')
                .eq('corso_id', corsoSelezionato)
                .eq('data_presenza', dataSelezionata)

            const presentIds = new Set(presenzeData?.map(p => p.allievo_id) || [])

            if (data) {
                const mappedIscritti = data
                    .filter((d: any) => d.allievi)
                    .map((d: any) => {
                        const allievoData = Array.isArray(d.allievi) ? d.allievi[0] : d.allievi;
                        return {
                            id: allievoData.id,
                            nome: `${allievoData.cognome} ${allievoData.nome}`,
                            presente: presentIds.has(allievoData.id)
                        }
                    })
                    .sort((a, b) => a.nome.localeCompare(b.nome))

                setIscritti(mappedIscritti)
            }
            setIsLoading(false)
        }
        fetchIscritti()
    }, [corsoSelezionato, dataSelezionata])

    const togglePresenza = (id: string) => {
        setIscritti(iscritti.map(i =>
            i.id === id ? { ...i, presente: !i.presente } : i
        ))
    }

    const handleSaveRegistro = async () => {
        setIsSavingPresenze(true)
        try {
            // Elimina tutte le presenze correnti per questo corso in questa data
            await supabase
                .from('presenze')
                .delete()
                .eq('corso_id', corsoSelezionato)
                .eq('data_presenza', dataSelezionata)

            // Re-inserisce solo quelli presenti
            const presenti = iscritti.filter(i => i.presente)
            if (presenti.length > 0) {
                const inserts = presenti.map(p => ({
                    corso_id: corsoSelezionato,
                    allievo_id: p.id,
                    data_presenza: dataSelezionata
                }))
                const { error } = await supabase.from('presenze').insert(inserts)
                if (error) throw error
            }
            alert("Registro presenze salvato correttamente!")
        } catch (err: any) {
            console.error(err)
            alert("Errore salvataggio presenze: verifica che la tabella 'presenze' esista sul database. " + err.message)
        } finally {
            setIsSavingPresenze(false)
        }
    }

    const handlePrintRegistro = () => {
        setIsPrinting(true)
        setTimeout(() => {
            window.print()
            setTimeout(() => setIsPrinting(false), 500)
        }, 100)
    }

    const currentContextCourse = corsi.find(c => c.id === corsoSelezionato)

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] gap-4 relative">
            {/* Modalità Stampa Registro Invisibile*/}
            {isPrinting && currentContextCourse && (
                <StampaListaCorsi corsoNome={currentContextCourse.nome} iscritti={iscritti} />
            )}
            {/* Header ottimizzato per Touch */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl border">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Registro Presenze</h1>
                    <div className="flex items-center text-muted-foreground mt-1">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {dataSelezionata ? format(new Date(dataSelezionata), "EEEE d MMMM yyyy", { locale: it }) : "Seleziona una data"}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <Input 
                        type="date"
                        value={dataSelezionata}
                        onChange={(e) => setDataSelezionata(e.target.value)}
                        className="h-14 text-lg w-full md:w-[200px]"
                    />
                    <div className="w-full md:w-[300px]">
                    <Select value={corsoSelezionato} onValueChange={setCorsoSelezionato}>
                        <SelectTrigger className="h-14 text-lg">
                            <SelectValue placeholder="Seleziona Corso" />
                        </SelectTrigger>
                        <SelectContent>
                            {corsi.map(corso => (
                                <SelectItem key={corso.id} value={corso.id} className="text-lg py-3">
                                    {corso.nome}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Griglia Allievi (ottimizzata per iPad/Tablet) */}
            <div className="flex-1 overflow-auto rounded-xl border p-4 bg-background">
                {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4">
                        <Loader2 className="h-10 w-10 animate-spin" />
                        <p className="text-xl">Sincronizzazione registro...</p>
                    </div>
                ) : iscritti.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-xl">
                        Nessun allievo iscritto a questo corso.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {iscritti.map((allievo) => (
                            <Card
                                key={allievo.id}
                                className={`cursor-pointer transition-all active:scale-95 border-2 ${allievo.presente
                                    ? 'bg-green-500/10 border-green-500'
                                    : 'bg-card border-border hover:border-primary/50'
                                    }`}
                                onClick={() => togglePresenza(allievo.id)}
                            >
                                <CardContent className="flex flex-col items-center justify-center p-6 min-h-[160px] text-center gap-4 relative">
                                    {allievo.presente && (
                                        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                                            <Check className="h-4 w-4" />
                                        </div>
                                    )}

                                    <div className={`rounded-full p-4 ${allievo.presente ? 'bg-green-500/20 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                                        <User className="h-8 w-8" />
                                    </div>

                                    <span className={`font-medium text-lg ${allievo.presente ? 'text-green-700 dark:text-green-400' : ''}`}>
                                        {allievo.nome}
                                    </span>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4 p-2">
                <Button
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 text-lg w-full sm:w-auto"
                    onClick={handlePrintRegistro}
                >
                    <Printer className="mr-2 h-5 w-5" />
                    Stampa Lista Vuota
                </Button>
                <Button 
                    size="lg" 
                    className="h-14 px-8 text-lg w-full sm:w-auto"
                    onClick={handleSaveRegistro}
                    disabled={isSavingPresenze || isLoading}
                >
                    {isSavingPresenze ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : "Salva Registro"} ({iscritti.filter(i => i.presente).length} presenti)
                </Button>
            </div>
        </div>
    )
}
