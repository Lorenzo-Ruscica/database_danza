"use client"

import { useRef, useState, useEffect } from "react"
import SignatureCanvas from "react-signature-canvas"
import { useKioskStore } from "@/store/kiosk-store"
import { Button } from "@/components/ui/button"
import { Eraser, PenTool } from "lucide-react"

export default function Step5Firma() {
    const { firmaUrl, setFirmaUrl, anagrafica, nextStep, prevStep } = useKioskStore()
    const sigCanvasRef = useRef<SignatureCanvas>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [canvasWidth, setCanvasWidth] = useState(600)

    // Per forzare re-render o mostrare errori
    const [hasDrawn, setHasDrawn] = useState(!!firmaUrl)

    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                const w = containerRef.current.clientWidth;
                if (w > 0) {
                    setCanvasWidth(w);
                }
            }
        };
        updateWidth();
        window.addEventListener("resize", updateWidth);
        return () => window.removeEventListener("resize", updateWidth);
    }, []);

    useEffect(() => {
        if (firmaUrl && sigCanvasRef.current) {
            try {
                sigCanvasRef.current.fromDataURL(firmaUrl);
            } catch (e) {
                // ignore
            }
        }
    }, [canvasWidth, firmaUrl]);

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
        <div className="flex flex-col gap-6 sm:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-1 sm:space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold flex items-center justify-center gap-2 sm:gap-3">
                    <PenTool className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
                    5. Firma della Domanda
                </h2>
                <p className="text-muted-foreground text-sm sm:text-lg">
                    Firma qui sotto per accettare il regolamento dell'Associazione e l'informativa Privacy.
                </p>
            </div>

            <div className="bg-muted/40 p-3.5 sm:p-4 rounded-xl border text-left">
                <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-1">Dichiarante:</h4>
                <p className="text-base sm:text-xl font-bold text-foreground">
                    {anagrafica.isMinorenne
                        ? `${anagrafica.tutoreNome} ${anagrafica.tutoreCognome} (Tutore Legale di ${anagrafica.nome} ${anagrafica.cognome})`
                        : `${anagrafica.nome} ${anagrafica.cognome}`
                    }
                </p>
            </div>

            <div 
                ref={containerRef}
                className="relative border-2 sm:border-4 border-dashed border-primary/40 bg-zinc-50 dark:bg-zinc-900 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 touch-none select-none h-[220px] sm:h-[280px]"
                style={{ touchAction: 'none' }}
            >
                {/* Placeholder text visible when empty */}
                {!hasDrawn && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
                        <span className="text-2xl sm:text-4xl font-mono text-zinc-900 dark:text-zinc-100 font-bold">Firma Qui</span>
                    </div>
                )}

                <SignatureCanvas
                    ref={sigCanvasRef}
                    onEnd={handleEndStroke}
                    penColor="blue"
                    canvasProps={{
                        className: "signature-canvas w-full h-full cursor-crosshair touch-none",
                        width: canvasWidth,
                        height: typeof window !== 'undefined' && window.innerWidth < 640 ? 220 : 280,
                        style: { touchAction: 'none' }
                    }}
                />

                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="rounded-full shadow-lg h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4"
                        onClick={clearSignature}
                    >
                        <Eraser className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                        Cancella
                    </Button>
                </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-4 sm:pt-6 border-t mt-2">
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
                    className="h-13 sm:h-16 px-8 sm:px-12 text-base sm:text-xl font-bold shadow-md w-full sm:w-auto"
                    onClick={saveSignature}
                    disabled={!isFormValid}
                >
                    Conferma Firma
                </Button>
            </div>
        </div>
    )
}
