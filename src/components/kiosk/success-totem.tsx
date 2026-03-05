"use client"

import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Wallet, Download } from "lucide-react"

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

            <div className="bg-zinc-50 border-2 border-zinc-200 rounded-3xl p-8 flex flex-col items-center gap-6 shadow-sm w-full max-w-sm">
                <div className="space-y-1">
                    <p className="font-semibold text-zinc-500 uppercase tracking-widest text-sm">Numero Tessera</p>
                    <p className="text-3xl font-mono font-bold text-primary">{tesseraNumero}</p>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-zinc-100">
                    <QRCodeSVG
                        value={`sd-allievo:${allievoId}`}
                        size={200}
                        level="H"
                        includeMargin={true}
                    />
                </div>

                <p className="text-sm text-muted-foreground">
                    Mostra questo QR Code in segreteria per il pagamento o per smarcare la presenza veloce.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mt-4">
                <Button className="flex-1 h-14 text-lg bg-black hover:bg-zinc-800 text-white rounded-xl">
                    <Wallet className="mr-2 h-5 w-5" />
                    Aggiungi a Wallet
                </Button>
                <Button variant="outline" className="flex-1 h-14 text-lg border-2 rounded-xl">
                    <Download className="mr-2 h-5 w-5" />
                    Salva PDF
                </Button>
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
