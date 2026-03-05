"use client"

import { useState } from "react"
import { Check, User, CalendarDays } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { StampaListaCorsi } from "@/components/admin/stampa-registro"
import { Printer } from "lucide-react"

// Mock data
const MOCK_CORSI = [
    { id: "1", nome: "Danza Classica - Principianti" },
    { id: "2", nome: "Hip Hop - Avanzato" },
]

const MOCK_ISCRITTI = [
    { id: "1", nome: "Mario Rossi", presente: false },
    { id: "2", nome: "Giulia Bianchi", presente: true },
    { id: "3", nome: "Luca Verdi", presente: false },
    { id: "4", nome: "Anna Neri", presente: false },
    { id: "5", nome: "Marco Gialli", presente: true },
]

export default function PresenzePage() {
    const [corsoSelezionato, setCorsoSelezionato] = useState<string>("1")
    const [iscritti, setIscritti] = useState(MOCK_ISCRITTI)
    const [isPrinting, setIsPrinting] = useState(false)

    const togglePresenza = (id: string) => {
        setIscritti(iscritti.map(i =>
            i.id === id ? { ...i, presente: !i.presente } : i
        ))
    }

    const handlePrintRegistro = () => {
        setIsPrinting(true)
        setTimeout(() => {
            window.print()
            setTimeout(() => setIsPrinting(false), 500)
        }, 100)
    }

    const currentContextCourse = MOCK_CORSI.find(c => c.id === corsoSelezionato)

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
                        {format(new Date(), "EEEE d MMMM yyyy", { locale: it })}
                    </div>
                </div>

                <div className="w-full md:w-[300px]">
                    <Select value={corsoSelezionato} onValueChange={setCorsoSelezionato}>
                        <SelectTrigger className="h-14 text-lg">
                            <SelectValue placeholder="Seleziona Corso" />
                        </SelectTrigger>
                        <SelectContent>
                            {MOCK_CORSI.map(corso => (
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
                <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto">
                    Salva Registro ({iscritti.filter(i => i.presente).length} presenti)
                </Button>
            </div>
        </div>
    )
}
