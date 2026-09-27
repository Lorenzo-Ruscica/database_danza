"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle2, MailCheck } from "lucide-react"

interface SuccessTotemProps {
    allievoId: string
    nome: string
    tesseraNumero: string
    onReset: () => void
}

export function SuccessTotem({ allievoId, nome, tesseraNumero, onReset }: SuccessTotemProps) {
    return (
        <div className="flex flex-col items-center text-center gap-5 sm:gap-8 py-6 sm:py-10 animate-in zoom-in-95 duration-700">
            <div className="bg-green-100 dark:bg-green-950/40 p-4 sm:p-6 rounded-full inline-flex mb-1 sm:mb-2 shadow-inner">
                <CheckCircle2 className="w-14 h-14 sm:w-20 sm:h-20 text-green-500" />
            </div>

            <div className="space-y-2 sm:space-y-4 max-w-lg px-2">
                <h2 className="text-2xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Iscrizione Completata!</h2>
                <p className="text-base sm:text-xl text-muted-foreground">
                    Benvenuto <strong className="text-foreground">{nome}</strong>. La tua richiesta è stata inviata in segreteria.
                </p>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900/60 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 flex flex-col items-center gap-4 sm:gap-6 shadow-sm w-full max-w-sm mt-2 sm:mt-4">
                <MailCheck className="w-12 h-12 sm:w-16 sm:h-16 text-primary opacity-80" />
                <div className="space-y-3 sm:space-y-4 text-center">
                    <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">Email Inviata!</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        Ti abbiamo appena inviato un'email all'indirizzo fornito con il riepilogo.
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-primary mt-3 sm:mt-4 p-3 sm:p-4 bg-primary/5 rounded-xl border border-primary/20 text-left">
                        📱 Mostra il tuo <strong className="font-bold uppercase tracking-wider text-primary">QR Code</strong> al personale della segreteria per completare la scelta corsi e il pagamento!
                    </p>
                </div>
            </div>

            <Button
                variant="outline"
                className="mt-4 sm:mt-6 text-foreground font-semibold h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base rounded-xl"
                onClick={onReset}
            >
                Torna alla schermata iniziale
            </Button>
        </div>
    )
}
