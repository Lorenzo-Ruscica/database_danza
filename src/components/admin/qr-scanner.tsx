"use client"

import { useEffect, useState, useRef } from "react"
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
    const [manualId, setManualId] = useState("")

    const scannerRef = useRef<Html5QrcodeScanner | null>(null)

    useEffect(() => {
        if (!open) {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(e => console.error("Failed to clear scanner", e))
                scannerRef.current = null
            }
            return
        }

        // Delay to ensure the DOM element exists inside the Dialog
        const timer = setTimeout(() => {
            if (!document.getElementById("reader")) return;

            const scanner = new Html5QrcodeScanner(
                "reader",
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
                },
                false
            )

            scannerRef.current = scanner

            scanner.render(
                (decodedText) => {
                    // Cerca di estrarre l'ID, sia se è un URL (nuovo formato) o altro
                    let idAllievo = null;
                    try {
                        if (decodedText.includes('id=')) {
                            const url = new URL(decodedText);
                            idAllievo = url.searchParams.get('id');
                        } else if (decodedText.startsWith("sd-allievo:")) {
                            idAllievo = decodedText.split(":")[1];
                        }
                    } catch (e) {
                        // Fallback try regex if not a valid url format but contains id=
                        const match = decodedText.match(/id=([^&]+)/);
                        if (match) idAllievo = match[1];
                    }

                    if (idAllievo) {
                        scanner.clear()
                        onOpenChange(false)
                        router.push(`/admin/scanner?id=${idAllievo}`)
                    } else {
                        setError("QR Code non valido. Assicurati che sia una tessera della scuola.")
                    }
                },
                (err) => {
                    // Silently fail most frames
                }
            )
        }, 100)

        // Cleanup on unmount
        return () => {
            clearTimeout(timer)
            if (scannerRef.current) {
                scannerRef.current.clear().catch(e => console.error("Failed to clear scanner", e))
                scannerRef.current = null
            }
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

                <div className="flex flex-col gap-2 mt-2 border-t pt-4">
                    <p className="text-sm font-medium text-center mb-1">Oppure ricerca manuale</p>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Incolla l'ID o Codice Tessera..." 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={manualId}
                            onChange={(e) => setManualId(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && manualId.trim()) {
                                    onOpenChange(false);
                                    router.push(`/admin/scanner?id=${manualId.trim()}`);
                                }
                            }}
                        />
                        <Button 
                            onClick={() => {
                                if (manualId.trim()) {
                                    onOpenChange(false);
                                    router.push(`/admin/scanner?id=${manualId.trim()}`);
                                }
                            }}
                        >
                            Cerca
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
