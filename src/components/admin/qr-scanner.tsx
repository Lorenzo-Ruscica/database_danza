"use client"

import { useEffect, useState } from "react"
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { QrCode, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AdminQrScannerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AdminQrScanner({ open, onOpenChange }: AdminQrScannerProps) {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!open) return

        // Setup Scanner UI when Dialog opens
        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
            },
            false
        )

        const onScanSuccess = (decodedText: string) => {
            // Formato atteso dal Totem Success: "sd-allievo:ID_ALLIEVO"
            if (decodedText.startsWith("sd-allievo:")) {
                const idAllievo = decodedText.split(":")[1]
                scanner.clear()
                onOpenChange(false)

                // Reindirizza alla scheda dell'allievo tab Pagamenti (mock path)
                router.push(`/admin/allievi?id=${idAllievo}&tab=pagamenti`)
            } else {
                setError("QR Code non valido. Assicurati che sia una tessera della scuola.")
            }
        }

        const onScanFailure = (err: any) => {
            // Silently fail most frames, log only real errors if needed
        }

        scanner.render(onScanSuccess, onScanFailure)

        // Cleanup on unmount or dialog close
        return () => {
            scanner.clear().catch(e => console.error("Failed to clear scanner", e))
        }
    }, [open, router, onOpenChange])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <QrCode className="h-5 w-5" />
                        Scansione Tessera Allievo
                    </DialogTitle>
                    <DialogDescription>
                        Inquadra il QR Code generato dal Totem o dall'app per aprire la scheda pagamenti.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center min-h-[300px] border rounded-lg bg-zinc-50 overflow-hidden relative">

                    <div id="reader" className="w-full" />

                    {/* Custom Error Overlay if invalid QR is scanned */}
                    {error && (
                        <div className="absolute inset-x-0 bottom-0 bg-destructive/90 text-destructive-foreground p-3 text-sm text-center flex items-center justify-between">
                            <span>{error}</span>
                            <Button variant="ghost" size="icon" onClick={() => setError(null)} className="h-6 w-6 rounded-full hover:bg-destructive">
                                <XCircle className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
