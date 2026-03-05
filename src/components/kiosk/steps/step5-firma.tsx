"use client"

import { useRef, useState } from "react"
import SignatureCanvas from "react-signature-canvas"
import { useKioskStore } from "@/store/kiosk-store"
import { Button } from "@/components/ui/button"
import { Eraser, PenTool } from "lucide-react"

export default function Step5Firma() {
    const { firmaUrl, setFirmaUrl, anagrafica, nextStep, prevStep } = useKioskStore()
    const sigCanvasRef = useRef<SignatureCanvas>(null)

    // Per forzare re-render o mostrare errori
    const [hasDrawn, setHasDrawn] = useState(!!firmaUrl)

    const clearSignature = () => {
        sigCanvasRef.current?.clear()
        setFirmaUrl(null)
        setHasDrawn(false)
    }

    const saveSignature = () => {
        if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
            const dataUrl = sigCanvasRef.current.getTrimmedCanvas().toDataURL('image/png')
            setFirmaUrl(dataUrl)
            nextStep()
        }
    }

    const handleEndStroke = () => {
        setHasDrawn(true)
        if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
            setFirmaUrl(sigCanvasRef.current.getTrimmedCanvas().toDataURL('image/png'))
        }
    }

    const isFormValid = hasDrawn && firmaUrl !== null

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold flex items-center justify-center gap-3">
                    <PenTool className="h-8 w-8 text-primary" />
                    5. Firma della Domanda
                </h2>
                <p className="text-muted-foreground text-lg">
                    Firma qui sotto per accettare il regolamento dell'Associazione e l'informativa Privacy.
                </p>
            </div>

            <div className="bg-muted p-4 rounded-xl border">
                <h4 className="font-semibold mb-2">Dichiarante:</h4>
                <p className="text-xl">
                    {anagrafica.isMinorenne
                        ? `${anagrafica.tutoreNome} ${anagrafica.tutoreCognome} (Tutore Legale di ${anagrafica.nome} ${anagrafica.cognome})`
                        : `${anagrafica.nome} ${anagrafica.cognome}`
                    }
                </p>
            </div>

            <div className="relative border-4 border-dashed border-primary/40 bg-zinc-50 rounded-2xl overflow-hidden shrink-0">
                {/* Placeholder text visible when empty */}
                {!hasDrawn && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                        <span className="text-4xl font-mono text-zinc-900">Firma Qui</span>
                    </div>
                )}

                <SignatureCanvas
                    ref={sigCanvasRef}
                    onEnd={handleEndStroke}
                    penColor="blue"
                    canvasProps={{
                        className: "signature-canvas w-full h-[300px] cursor-crosshair",
                        // Imposta dimensione fissa per evitare distorsion
                        width: 800,
                        height: 300
                    }}
                />

                <div className="absolute top-4 right-4 z-10">
                    <Button
                        variant="destructive"
                        size="sm"
                        className="rounded-full shadow-lg"
                        onClick={clearSignature}
                    >
                        <Eraser className="h-4 w-4 mr-2" />
                        Cancella
                    </Button>
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
                    onClick={saveSignature}
                    disabled={!isFormValid}
                >
                    Conferma Firma
                </Button>
            </div>
        </div>
    )
}
