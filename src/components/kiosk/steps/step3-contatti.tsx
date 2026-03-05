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
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">3. Requisiti di Contatto</h2>
                <p className="text-muted-foreground text-lg">Inserisci i dati per ricevere le comunicazioni e la tessera digitale</p>
            </div>

            <div className="grid grid-cols-1 gap-8 py-8 md:px-12">
                <div className="space-y-4">
                    <Label className="text-xl flex items-center gap-2">
                        <Phone className="h-6 w-6 text-primary" />
                        Numero di Telefono
                    </Label>
                    <Input
                        type="tel"
                        className="h-16 text-2xl"
                        placeholder="es. 333 1234567"
                        value={contatti.telefono}
                        onChange={e => updateContatti({ telefono: e.target.value })}
                    />
                </div>

                <div className="space-y-4">
                    <Label className="text-xl flex items-center gap-2">
                        <Mail className="h-6 w-6 text-primary" />
                        Indirizzo Email
                    </Label>
                    <Input
                        type="email"
                        className="h-16 text-2xl lowercase"
                        placeholder="es. nome@esempio.it"
                        value={contatti.email}
                        onChange={e => updateContatti({ email: e.target.value.toLowerCase() })}
                    />
                    <p className="text-sm border-l-4 border-l-primary bg-muted/50 p-3 rounded-r-md text-foreground">
                        L'email verrà utilizzata per l'invio della <strong>Tessera Digitale Apple/Google Wallet</strong>, le ricevute di pagamento e per gli avvisi di scadenza del certificato medico.
                    </p>
                </div>
            </div>

            <div className="flex justify-between pt-8 border-t mt-4">
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
                    Prosegui
                </Button>
            </div>
        </div>
    )
}
