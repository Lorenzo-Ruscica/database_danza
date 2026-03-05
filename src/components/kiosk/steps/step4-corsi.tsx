"use client"

import { useKioskStore } from "@/store/kiosk-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Euro } from "lucide-react"

// Hardcoded for kiosk frontend mock - real data will be fetched from Supabase
const CORSI_DISPONIBILI = [
    { id: "1", nome: "Danza Classica - Principianti (6-8 anni)", prezzo: 50.00 },
    { id: "2", nome: "Hip Hop - Principianti", prezzo: 60.00 },
    { id: "3", nome: "Hip Hop - Avanzato", prezzo: 65.00 },
    { id: "4", nome: "Ballo da Sala - Base", prezzo: 80.00 },
    { id: "5", nome: "Ginnastica Dolce", prezzo: 40.00 }
]

export default function Step4Corsi() {
    const { corsi, totalePrezzo, toggleCorso, nextStep, prevStep } = useKioskStore()

    const isFormValid = corsi.length > 0

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">4. Scelta dei Corsi</h2>
                <p className="text-muted-foreground text-lg">Seleziona i corsi a cui vuoi partecipare quest'anno</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2 pb-2">
                {CORSI_DISPONIBILI.map((corso) => {
                    const isSelected = corsi.includes(corso.id)

                    return (
                        <Card
                            key={corso.id}
                            className={`cursor-pointer transition-all active:scale-95 border-2 ${isSelected
                                    ? 'bg-primary/5 border-primary shadow-md'
                                    : 'bg-card border-border hover:border-primary/50'
                                }`}
                            onClick={() => toggleCorso(corso.id, corso.prezzo)}
                        >
                            <CardContent className="flex items-center justify-between p-6">
                                <div className="space-y-1">
                                    <h3 className={`font-semibold text-xl ${isSelected ? 'text-primary' : ''}`}>
                                        {corso.nome}
                                    </h3>
                                    <div className="flex items-center text-muted-foreground font-medium text-lg">
                                        <Euro className="h-4 w-4 mr-1" />
                                        {corso.prezzo.toFixed(2)}/mese
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
