"use client"

import { useKioskStore } from "@/store/kiosk-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Phone } from "lucide-react"

export default function Step3Contatti() {
    const { contatti, updateContatti, nextStep, prevStep } = useKioskStore()

    const isFormValid =
        contatti.telefono.length > 5 &&
        contatti.email.includes("@") &&
        contatti.email.includes(".")

    return (
        <div className="flex flex-col gap-6 sm:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-1 sm:space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold">3. Requisiti di Contatto</h2>
                <p className="text-muted-foreground text-sm sm:text-lg">Inserisci i dati per ricevere le comunicazioni e la tessera digitale</p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:gap-8 py-3 sm:py-6 md:px-10">
                <div className="space-y-2 sm:space-y-3">
                    <Label className="text-base sm:text-xl flex items-center gap-2 font-semibold">
                        <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        Numero di Telefono
                    </Label>
                    <Input
                        type="tel"
                        className="h-13 sm:h-16 text-base sm:text-xl md:text-2xl"
                        placeholder="es. 333 1234567"
                        value={contatti.telefono}
                        onChange={e => updateContatti({ telefono: e.target.value })}
                    />
                </div>

                <div className="space-y-2 sm:space-y-3">
                    <Label className="text-base sm:text-xl flex items-center gap-2 font-semibold">
                        <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        Indirizzo Email
                    </Label>
                    <Input
                        type="email"
                        className="h-13 sm:h-16 text-base sm:text-xl md:text-2xl lowercase"
                        placeholder="es. nome@esempio.it"
                        value={contatti.email}
                        onChange={e => updateContatti({ email: e.target.value.toLowerCase() })}
                    />
                    <p className="text-xs sm:text-sm border-l-4 border-l-primary bg-muted/50 p-2.5 sm:p-3 rounded-r-md text-foreground leading-relaxed">
                        L'email verrà utilizzata per l'invio del <strong>QR Code di Iscrizione</strong>, le ricevute di pagamento e per gli avvisi di scadenza del certificato medico.
                    </p>
                </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-6 border-t mt-2 sm:mt-4">
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
