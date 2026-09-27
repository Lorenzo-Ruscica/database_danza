"use client"

import { useKioskStore } from "@/store/kiosk-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export default function Step1Anagrafica() {
    const { anagrafica, updateAnagrafica, nextStep } = useKioskStore()

    const calculatedIsMinor = (() => {
        if (!anagrafica.dataNascita) return false;
        const dob = new Date(anagrafica.dataNascita);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        return age < 18;
    })();

    const isFormValid =
        anagrafica.nome &&
        anagrafica.cognome &&
        anagrafica.dataNascita &&
        anagrafica.luogoNascita &&
        anagrafica.provinciaNascita &&
        (!(anagrafica.isMinorenne || calculatedIsMinor) || (
            anagrafica.tutoreNome &&
            anagrafica.tutoreCognome &&
            anagrafica.tutoreCodiceFiscale
        ))

    return (
        <div className="flex flex-col gap-6 sm:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-1 sm:space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold">1. Dati Anagrafici</h2>
                <p className="text-muted-foreground text-sm sm:text-lg">Inserisci i dati legali per l'iscrizione all'Associazione</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2 sm:space-y-3">
                    <Label className="text-base sm:text-lg font-medium">Nome</Label>
                    <Input
                        className="h-12 sm:h-14 text-base sm:text-lg"
                        placeholder="Nome"
                        value={anagrafica.nome}
                        onChange={e => updateAnagrafica({ nome: e.target.value })}
                    />
                </div>

                <div className="space-y-2 sm:space-y-3">
                    <Label className="text-base sm:text-lg font-medium">Cognome</Label>
                    <Input
                        className="h-12 sm:h-14 text-base sm:text-lg"
                        placeholder="Cognome"
                        value={anagrafica.cognome}
                        onChange={e => updateAnagrafica({ cognome: e.target.value })}
                    />
                </div>

                <div className="space-y-2 sm:space-y-3">
                    <Label className="text-base sm:text-lg font-medium">Data di Nascita</Label>
                    <Input
                        type="date"
                        className="h-12 sm:h-14 text-base sm:text-lg"
                        value={anagrafica.dataNascita}
                        onChange={e => {
                            const newDate = e.target.value;
                            updateAnagrafica({ dataNascita: newDate });
                            if (newDate) {
                                const dob = new Date(newDate);
                                const today = new Date();
                                let age = today.getFullYear() - dob.getFullYear();
                                const m = today.getMonth() - dob.getMonth();
                                if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                                    age--;
                                }
                                if (age < 18) {
                                    updateAnagrafica({ isMinorenne: true });
                                }
                            }
                        }}
                    />
                </div>

                <div className="space-y-2 sm:space-y-3">
                    <Label className="text-base sm:text-lg font-medium">Sesso</Label>
                    <Select
                        value={anagrafica.sesso}
                        onValueChange={(val: 'M' | 'F') => updateAnagrafica({ sesso: val })}
                    >
                        <SelectTrigger className="h-12 sm:h-14 text-base sm:text-lg">
                            <SelectValue placeholder="Seleziona..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="M" className="text-base sm:text-lg py-2.5 sm:py-3">Maschio (M)</SelectItem>
                            <SelectItem value="F" className="text-base sm:text-lg py-2.5 sm:py-3">Femmina (F)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2 sm:space-y-3">
                    <Label className="text-base sm:text-lg font-medium">Comune di Nascita</Label>
                    <Input
                        className="h-12 sm:h-14 text-base sm:text-lg"
                        placeholder="Es. Roma"
                        value={anagrafica.luogoNascita}
                        onChange={e => updateAnagrafica({ luogoNascita: e.target.value })}
                    />
                </div>

                <div className="space-y-2 sm:space-y-3">
                    <Label className="text-base sm:text-lg font-medium">Provincia (Sigla)</Label>
                    <Input
                        className="h-12 sm:h-14 text-base sm:text-lg uppercase"
                        placeholder="Es. RM"
                        maxLength={2}
                        value={anagrafica.provinciaNascita}
                        onChange={e => updateAnagrafica({ provinciaNascita: e.target.value.toUpperCase() })}
                    />
                </div>
            </div>

            <div className="border-t pt-5 bg-muted/20 -mx-4 sm:-mx-7 md:-mx-12 px-4 sm:px-7 md:px-12 pb-4 rounded-xl">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div>
                        <Label className="text-base sm:text-xl font-semibold">Allievo Minorenne?</Label>
                        <p className="text-xs sm:text-sm text-muted-foreground">Richiede i dati del genitore/tutore legale</p>
                    </div>
                    <Switch
                        checked={anagrafica.isMinorenne || calculatedIsMinor}
                        onCheckedChange={v => {
                            if (!calculatedIsMinor) {
                                updateAnagrafica({ isMinorenne: v })
                            }
                        }}
                        disabled={calculatedIsMinor}
                        className="scale-110 sm:scale-125"
                    />
                </div>

                {(anagrafica.isMinorenne || calculatedIsMinor) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 animate-in slide-in-from-top-2">
                        <div className="space-y-2 sm:space-y-3">
                            <Label className="text-base sm:text-lg font-medium">Nome Tutore</Label>
                            <Input
                                className="h-12 sm:h-14 text-base sm:text-lg"
                                value={anagrafica.tutoreNome}
                                onChange={e => updateAnagrafica({ tutoreNome: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                            <Label className="text-base sm:text-lg font-medium">Cognome Tutore</Label>
                            <Input
                                className="h-12 sm:h-14 text-base sm:text-lg"
                                value={anagrafica.tutoreCognome}
                                onChange={e => updateAnagrafica({ tutoreCognome: e.target.value })}
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2 space-y-2 sm:space-y-3">
                            <Label className="text-base sm:text-lg font-medium">Codice Fiscale Tutore</Label>
                            <Input
                                autoCapitalize="characters"
                                className="h-12 sm:h-14 text-base sm:text-lg uppercase"
                                value={anagrafica.tutoreCodiceFiscale}
                                onChange={e => updateAnagrafica({ tutoreCodiceFiscale: e.target.value.toUpperCase() })}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end pt-3 sm:pt-4">
                <Button
                    size="lg"
                    className="h-13 sm:h-16 px-8 sm:px-12 text-lg sm:text-xl w-full sm:w-auto font-bold shadow-md"
                    onClick={nextStep}
                    disabled={!isFormValid}
                >
                    Prosegui
                </Button>
            </div>
        </div>
    )
}
