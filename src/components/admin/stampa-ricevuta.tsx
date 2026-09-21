"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { Printer, X } from "lucide-react"

// Definizione Tipi per il Pagamento
interface RawAllievo {
    nome?: string
    cognome?: string
    tessera_numero?: string
    codice_fiscale?: string
}

interface RawPagamento {
    id: string
    importo: number
    data_pagamento: string
    mese_riferimento: string
    causale?: string
    allievo: RawAllievo
}

interface StampaRicevutaProps {
    pagamento: RawPagamento
    onClose?: () => void
    autoPrint?: boolean
}

export function StampaRicevuta({ pagamento, onClose, autoPrint = true }: StampaRicevutaProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        if (autoPrint) {
            const timer = setTimeout(() => {
                window.print()
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [autoPrint])

    if (!mounted || typeof document === "undefined") {
        return null
    }

    const causaleTesto = pagamento.causale || `Quota tesseramento e iscrizione per la Stagione 2026/2027 (${format(new Date(`${pagamento.mese_riferimento}-01`), "MMMM yyyy", { locale: it })})`

    const receiptHTML = (tipo: "Associazione" | "Socio") => (
        <div className="ricevuta-half border-2 border-zinc-300 rounded-xl p-6 md:p-8 flex flex-col justify-between bg-white text-black box-border">
            {/* Intestazione */}
            <div className="flex justify-between items-start border-b border-zinc-200 pb-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight text-black mb-0.5">ASD BIGDANCE SCHOOL</h1>
                    <p className="text-xs text-zinc-700 font-bold uppercase tracking-wider">Associazione Sportiva Dilettantistica</p>
                    <p className="text-[11px] text-zinc-600 mt-0.5">Attività di Danza Sportiva e Promozione Sociale</p>
                    <p className="text-[11px] text-zinc-600">Sede Sociale &bull; C.F. / P.IVA Associazione</p>
                </div>
                <div className="text-right border-l-4 border-black pl-4">
                    <h2 className="text-lg md:text-xl font-black tracking-wider text-black">RICEVUTA</h2>
                    <p className="text-zinc-700 text-xs font-semibold">N° {pagamento.id.length > 10 ? pagamento.id.slice(0, 8).toUpperCase() : pagamento.id.replace('p', '2026/')}</p>
                    <p className="text-[11px] font-bold uppercase tracking-wider mt-1 px-2 py-0.5 bg-zinc-100 border border-zinc-300 rounded inline-block text-black">Copia {tipo}</p>
                </div>
            </div>

            {/* Corpo Ricevuta */}
            <div className="my-4 space-y-3">
                <div className="text-sm md:text-base leading-relaxed text-black">
                    Ricevuto dal Socio: <strong className="uppercase text-base md:text-lg text-black">{pagamento.allievo.nome} {pagamento.allievo.cognome}</strong>
                    {pagamento.allievo.codice_fiscale && (
                        <span> &mdash; C.F.: <strong className="uppercase text-black">{pagamento.allievo.codice_fiscale}</strong></span>
                    )}
                    <br />
                    Tessera Socio Numero: <strong className="text-black text-base md:text-lg">{pagamento.allievo.tessera_numero || "N/A"}</strong>
                </div>

                <div className="py-2.5 px-4 bg-zinc-50 border border-zinc-300 rounded-lg inline-flex items-center">
                    <span className="text-xs uppercase tracking-wider text-zinc-600 font-semibold">Somma versata:</span>
                    <strong className="text-xl md:text-2xl ml-3 font-black text-black">€ {Number(pagamento.importo).toFixed(2)}</strong>
                </div>

                <p className="text-sm md:text-base leading-relaxed text-black">
                    Causale: <strong className="text-black">{causaleTesto}</strong>
                </p>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end pt-3 border-t border-zinc-200">
                <div>
                    <p className="text-[11px] text-zinc-500 uppercase font-semibold">Data Emissione</p>
                    <p className="font-bold text-xs md:text-sm text-black">{format(new Date(pagamento.data_pagamento || new Date()), "dd/MM/yyyy HH:mm")}</p>
                </div>
                <div className="w-56 md:w-64 text-center">
                    <div className="border-b border-black mb-1.5 h-8"></div>
                    <p className="text-[10px] md:text-[11px] text-zinc-700 font-semibold uppercase">Timbro e Firma per ASD BigDance School</p>
                </div>
            </div>
        </div>
    )

    return createPortal(
        <div id="ricevuta-print-portal" className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-sm flex flex-col items-center justify-start overflow-y-auto p-4 md:p-8 print:p-0 print:bg-white print:static print:inset-auto print:overflow-visible">
            {/* Stili di Stampa Dedicati per A4 Portrait */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 0mm;
                    }
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #ffffff !important;
                        color: #000000 !important;
                        height: 100% !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    /* Nascondi tutti i fratelli del portale */
                    body > *:not(#ricevuta-print-portal) {
                        display: none !important;
                    }
                    #ricevuta-print-portal {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        background: #ffffff !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        display: block !important;
                        overflow: visible !important;
                        z-index: 99999999 !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .ricevuta-a4-sheet {
                        box-shadow: none !important;
                        border: none !important;
                        margin: 0 !important;
                        width: 100% !important;
                        height: 297mm !important;
                        max-height: 297mm !important;
                        padding: 8mm 12mm !important;
                        page-break-inside: avoid !important;
                        page-break-after: avoid !important;
                        box-sizing: border-box !important;
                        display: flex !important;
                        flex-direction: column !important;
                        justify-content: space-between !important;
                    }
                    .ricevuta-half {
                        height: 136mm !important;
                        max-height: 136mm !important;
                        padding: 6mm 10mm !important;
                        box-sizing: border-box !important;
                        border: 1.5px solid #000000 !important;
                    }
                }
                `
            }} />

            {/* Barra di controllo a schermo (Nascosta in stampa) */}
            <div className="no-print w-full max-w-[210mm] flex items-center justify-between bg-zinc-900 text-white p-3 md:p-4 rounded-xl mb-4 shadow-2xl border border-zinc-700">
                <div className="flex items-center gap-2">
                    <Printer className="h-5 w-5 text-amber-400" />
                    <div>
                        <span className="font-bold text-sm md:text-base block">Ricevuta Ufficiale Doppia Copia</span>
                        <span className="text-xs text-zinc-400 block">Stagione Sportiva 2026/2027 &bull; ASD BigDance School</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                    >
                        <Printer className="h-4 w-4" /> Stampa / Salva in PDF
                    </button>
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-semibold p-2 rounded-lg text-sm flex items-center justify-center transition-colors"
                            title="Chiudi"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Foglio Formato A4 (210mm x 297mm) */}
            <div className="ricevuta-a4-sheet bg-white text-black w-full max-w-[210mm] min-h-[297mm] shadow-2xl rounded-sm p-6 md:p-8 flex flex-col justify-between box-border border border-zinc-200 my-auto">
                {/* Copia Associazione (Metà Superiore) */}
                {receiptHTML("Associazione")}

                {/* Linea di ritaglio tra le due copie */}
                <div className="relative my-3 py-2 flex items-center justify-center">
                    <div className="border-b-2 border-dashed border-zinc-400 w-full absolute"></div>
                    <span className="bg-white px-3 text-[11px] font-bold text-zinc-500 uppercase tracking-widest relative z-10 flex items-center gap-1">
                        ✂ Tagliare lungo la linea tratteggiata (Copia Associazione in alto / Copia Socio in basso)
                    </span>
                </div>

                {/* Copia Socio (Metà Inferiore) */}
                {receiptHTML("Socio")}
            </div>
        </div>,
        document.body
    )
}
