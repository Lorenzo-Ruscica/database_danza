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
        <div className="flex flex-col items-center text-center gap-8 py-12 animate-in zoom-in-95 duration-700">
            <div className="bg-green-100 text-green-600p-6 rounded-full inline-flex mb-2">
                <CheckCircle2 className="w-24 h-24 text-green-500" />
            </div>

            <div className="space-y-4 max-w-lg">
                <h2 className="text-4xl font-black text-zinc-900 tracking-tight">Iscrizione Completata!</h2>
                <p className="text-xl text-muted-foreground">
                    Benvenuto {nome}. La tua richiesta è stata inviata in segreteria.
                </p>
            </div>

            <div className="bg-zinc-50 border-2 border-zinc-200 rounded-3xl p-8 flex flex-col items-center gap-6 shadow-sm w-full max-w-sm mt-4">
                <MailCheck className="w-16 h-16 text-primary opacity-80" />
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-zinc-900">Email Inviata!</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        Ti abbiamo appena inviato un'email all'indirizzo fornito.
                    </p>
                    <p className="text-sm font-semibold text-primary mt-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
                        📱 Controlla la tua casella di posta per visualizzare subito il tuo <span className="font-bold uppercase tracking-wider">QR Code Provvisorio</span> da mostrare in Segreteria!
                    </p>
                </div>
            </div>

            <Button
                variant="ghost"
                className="mt-8 text-muted-foreground"
                onClick={onReset}
            >
                Torna alla schermata iniziale
            </Button>
        </div>
    )
}
