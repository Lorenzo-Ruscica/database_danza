"use client"

import { useEffect, useState } from "react"
import { useKioskStore } from "@/store/kiosk-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Euro, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function Step4Corsi() {
    const { corsi, totalePrezzo, toggleCorso, nextStep, prevStep } = useKioskStore()
    const [corsiDisponibili, setCorsiDisponibili] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchCorsi = async () => {
            const { data, error } = await supabase.from('corsi').select('*').order('nome')
            if (data) setCorsiDisponibili(data)
            setIsLoading(false)
        }
        fetchCorsi()
    }, [supabase])

    const isFormValid = corsi.length > 0

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">4. Scelta dei Corsi</h2>
                <p className="text-muted-foreground text-lg">Seleziona i corsi a cui vuoi partecipare quest'anno</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2 pb-2">
                {isLoading ? (
                    <div className="col-span-full flex flex-col items-center justify-center p-8 gap-4 text-muted-foreground">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p>Caricamento corsi disponibili...</p>
                    </div>
                ) : corsiDisponibili.map((corso) => {
                    const isSelected = corsi.includes(corso.id)

                    return (
                        <Card
                            key={corso.id}
                            className={`cursor-pointer transition-all active:scale-95 border-2 ${isSelected
                                ? 'bg-primary/5 border-primary shadow-md'
                                : 'bg-card border-border hover:border-primary/50'
                                }`}
                            onClick={() => toggleCorso(corso.id, corso.prezzo_standard)}
                        >
                            <CardContent className="flex items-center justify-between p-6">
                                <div className="space-y-1">
                                    <h3 className={`font-semibold text-xl ${isSelected ? 'text-primary' : ''}`}>
                                        {corso.nome}
                                    </h3>
                                    <div className="flex items-center text-muted-foreground font-medium text-lg">
                                        <Euro className="h-4 w-4 mr-1" />
                                        {corso.prezzo_standard.toFixed(2)}/mese
                                    </div>
                                </div>

                                <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center shrink-0 ml-4 ${isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30'
                                    }`}>
                                    {isSelected && <Check className="h-6 w-6" />}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Box Riepilogo Costi */}
            <div className="bg-primary/10 rounded-2xl p-6 border-2 border-primary/20 flex items-center justify-between mt-4">
                <div>
                    <h4 className="font-semibold text-xl text-primary">Riepilogo Costi Mensili</h4>
                    <p className="text-muted-foreground">{corsi.length} corsi selezionati</p>
                </div>
                <div className="text-4xl font-bold text-primary flex items-end">
                    € {totalePrezzo.toFixed(2)}
                </div>
            </div>

            <div className="flex justify-between pt-4 border-t mt-4">
                <Button
                    variant="outline"
                    size="lg"
                    className="h-16 px-8 text-xl"
                    onClick={prevStep}
                >
                    Indietro
                </Button>
                <Button
                    size="lg"
                    className="h-16 px-12 text-xl"
                    onClick={nextStep}
                    disabled={!isFormValid}
                >
                    Vai alla Firma
                </Button>
            </div>
        </div>
    )
}
