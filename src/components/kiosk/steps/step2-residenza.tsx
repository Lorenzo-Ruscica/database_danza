"use client"

import { useEffect, useState } from "react"
import { useKioskStore } from "@/store/kiosk-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { calcolaCodiceFiscale } from "@/lib/codice-fiscale"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function Step2Residenza() {
    const { anagrafica, residenza, updateResidenza, nextStep, prevStep } = useKioskStore()
    const [errorCF, setErrorCF] = useState<string | null>(null)

    // Calcolo automatico CF al mount se i dati ci sono
    useEffect(() => {
        if (!residenza.codiceFiscale && anagrafica.nome) {
            try {
                const dNascita = new Date(anagrafica.dataNascita)
                const cfGenerato = calcolaCodiceFiscale({
                    name: anagrafica.nome,
                    surname: anagrafica.cognome,
                    gender: anagrafica.sesso,
                    day: dNascita.getDate(),
                    month: dNascita.getMonth() + 1,
                    year: dNascita.getFullYear(),
                    birthplace: anagrafica.luogoNascita,
                    prov: anagrafica.provinciaNascita
                })
                updateResidenza({ codiceFiscale: cfGenerato })
                setErrorCF(null)
            } catch (err) {
                setErrorCF("Non è stato possibile calcolare automaticamente il CF. Verifica i dati o inseriscilo manualmente.")
            }
        }
    }, [anagrafica, residenza.codiceFiscale, updateResidenza])

    const isFormValid =
        residenza.codiceFiscale.length === 16 &&
        residenza.indirizzo &&
        residenza.cap &&
        residenza.provincia

    return (
        <div className="flex flex-col gap-6 sm:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-1 sm:space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold">2. Codice Fiscale e Residenza</h2>
                <p className="text-muted-foreground text-sm sm:text-lg">Verifica il tuo Codice Fiscale e inserisci l'indirizzo di residenza</p>
            </div>

            <div className="space-y-4 sm:space-y-6">
                <div className="bg-muted/30 p-4 sm:p-6 rounded-xl border border-primary/20 space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center">
                        <Label className="text-base sm:text-xl font-semibold text-primary">Codice Fiscale Calcolato</Label>
                        {residenza.codiceFiscale.length === 16 ? (
                            <CheckCircle2 className="text-green-600 h-5 w-5 sm:h-6 sm:w-6" />
                        ) : (
                            <AlertCircle className="text-amber-500 h-5 w-5 sm:h-6 sm:w-6" />
                        )}
                    </div>

                    <Input
                        className="h-13 sm:h-16 text-base sm:text-xl md:text-2xl font-mono text-center tracking-wider sm:tracking-widest uppercase border-2 focus-visible:ring-primary"
                        placeholder="RSSMRA80A01H501T"
                        maxLength={16}
                        value={residenza.codiceFiscale}
                        onChange={e => updateResidenza({ codiceFiscale: e.target.value.toUpperCase() })}
                    />
                    {errorCF && <p className="text-xs sm:text-sm text-destructive font-medium text-center">{errorCF}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2 sm:pt-4">
                    <div className="space-y-2 sm:space-y-3 md:col-span-2">
                        <Label className="text-base sm:text-lg font-medium">Indirizzo di Residenza</Label>
                        <Input
                            className="h-12 sm:h-14 text-base sm:text-lg"
                            placeholder="Es. Via Roma 1"
                            value={residenza.indirizzo}
                            onChange={e => updateResidenza({ indirizzo: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                        <Label className="text-base sm:text-lg font-medium">CAP</Label>
                        <Input
                            className="h-12 sm:h-14 text-base sm:text-lg"
                            placeholder="00100"
                            maxLength={5}
                            type="tel"
                            value={residenza.cap}
                            onChange={e => updateResidenza({ cap: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                        <Label className="text-base sm:text-lg font-medium">Provincia di Residenza</Label>
                        <Input
                            className="h-12 sm:h-14 text-base sm:text-lg uppercase"
                            placeholder="RM"
                            maxLength={2}
                            value={residenza.provincia}
                            onChange={e => updateResidenza({ provincia: e.target.value.toUpperCase() })}
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-6 border-t">
                <Button
                    variant="outline"
                    size="lg"
                    className="h-13 sm:h-16 px-6 sm:px-8 text-base sm:text-xl w-full sm:w-auto"
                    onClick={prevStep}
                >
                    Indietro
                </Button>
                <Button
                    size="lg"
                    className="h-13 sm:h-16 px-8 sm:px-12 text-base sm:text-xl w-full sm:w-auto font-bold shadow-md"
                    onClick={nextStep}
                    disabled={!isFormValid}
                >
                    Prosegui
                </Button>
            </div>
        </div>
    )
}
