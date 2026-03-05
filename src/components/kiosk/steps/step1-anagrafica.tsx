"use client"

import { useKioskStore } from "@/store/kiosk-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export default function Step1Anagrafica() {
    const { anagrafica, updateAnagrafica, nextStep } = useKioskStore()

    const isFormValid =
        anagrafica.nome &&
        anagrafica.cognome &&
        anagrafica.dataNascita &&
        anagrafica.luogoNascita &&
        anagrafica.provinciaNascita &&
        (!anagrafica.isMinorenne || (
            anagrafica.tutoreNome &&
            anagrafica.tutoreCognome &&
            anagrafica.tutoreCodiceFiscale
        ))

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">1. Dati Anagrafici</h2>
                <p className="text-muted-foreground text-lg">Inserisci i dati legali per l'iscrizione all'Associazione</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <Label className="text-lg">Nome</Label>
                    <Input
                        className="h-14 text-lg"
                        placeholder="Nome"
                        value={anagrafica.nome}
                        onChange={e => updateAnagrafica({ nome: e.target.value })}
                    />
                </div>

                <div className="space-y-3">
                    <Label className="text-lg">Cognome</Label>
                    <Input
                        className="h-14 text-lg"
                        placeholder="Cognome"
                        value={anagrafica.cognome}
                        onChange={e => updateAnagrafica({ cognome: e.target.value })}
                    />
                </div>

                <div className="space-y-3">
                    <Label className="text-lg">Data di Nascita</Label>
                    <Input
                        type="date"
                        className="h-14 text-lg"
                        value={anagrafica.dataNascita}
                        onChange={e => updateAnagrafica({ dataNascita: e.target.value })}
                    />
                </div>

                <div className="space-y-3">
                    <Label className="text-lg">Sesso</Label>
                    <Select
                        value={anagrafica.sesso}
                        onValueChange={(val: 'M' | 'F') => updateAnagrafica({ sesso: val })}
                    >
                        <SelectTrigger className="h-14 text-lg">
                            <SelectValue placeholder="Seleziona..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="M" className="text-lg py-3">Maschio (M)</SelectItem>
                            <SelectItem value="F" className="text-lg py-3">Femmina (F)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-3">
                    <Label className="text-lg">Comune di Nascita</Label>
                    <Input
                        className="h-14 text-lg"
                        placeholder="Es. Roma"
                        value={anagrafica.luogoNascita}
                        onChange={e => updateAnagrafica({ luogoNascita: e.target.value })}
                    />
                </div>

                <div className="space-y-3">
                    <Label className="text-lg">Provincia (Sigla)</Label>
                    <Input
                        className="h-14 text-lg"
                        placeholder="Es. RM"
                        maxLength={2}
                        value={anagrafica.provinciaNascita}
                        onChange={e => updateAnagrafica({ provinciaNascita: e.target.value.toUpperCase() })}
                    />
                </div>
            </div>

            <div className="border-t pt-6 bg-muted/20 -mx-6 md:-mx-10 px-6 md:px-10 pb-4">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Label className="text-xl font-semibold">Allievo Minorenne?</Label>
                        <p className="text-muted-foreground">Richiede i dati del genitore/tutore legale</p>
                    </div>
                    <Switch
                        checked={anagrafica.isMinorenne}
                        onCheckedChange={v => updateAnagrafica({ isMinorenne: v })}
                        className="scale-125 translate-x-[-10px]"
                    />
                </div>

                {anagrafica.isMinorenne && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2">
                        <div className="space-y-3">
                            <Label className="text-lg">Nome Tutore</Label>
                            <Input
                                className="h-14 text-lg"
                                value={anagrafica.tutoreNome}
                                onChange={e => updateAnagrafica({ tutoreNome: e.target.value })}
                            />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-lg">Cognome Tutore</Label>
                            <Input
                                className="h-14 text-lg"
                                value={anagrafica.tutoreCognome}
                                onChange={e => updateAnagrafica({ tutoreCognome: e.target.value })}
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2 space-y-3">
                            <Label className="text-lg">Codice Fiscale Tutore</Label>
                            <Input
                                autoCapitalize="characters"
                                className="h-14 text-lg uppercase"
                                value={anagrafica.tutoreCodiceFiscale}
                                onChange={e => updateAnagrafica({ tutoreCodiceFiscale: e.target.value.toUpperCase() })}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end pt-4">
                <Button
                    size="lg"
                    className="h-16 px-12 text-xl w-full md:w-auto"
                    onClick={nextStep}
                    disabled={!isFormValid}
                >
                    Prosegui
                </Button>
            </div>
        </div>
    )
}
