"use client"

import { format } from "date-fns"
import { it } from "date-fns/locale"

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
}

/**
 * Questo componente è nascosto su schermo normale.
 * Diventa visibile occupando l'intera pagina (`fixed inset-0`) SOLO durante la stampa (`print:`).
 * Imposta un layout A4 divisibile in due metà identiche 
 * (Copia Associazione / Copia Socio).
 */
export function StampaRicevuta({ pagamento }: StampaRicevutaProps) {

    const causaleTesto = pagamento.causale || `Quota tesseramento e iscrizione per la Stagione 2026/2027 (${format(new Date(`${pagamento.mese_riferimento}-01`), "MMMM yyyy", { locale: it })})`

    const receiptHTML = (tipo: "Associazione" | "Socio") => (
        <div className="h-[50%] p-8 border-b-2 border-dashed border-gray-400 flex flex-col justify-between">

            {/* Intestazione */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-black mb-0.5">ASD BIGDANCE SCHOOL</h1>
                    <p className="text-xs text-gray-700 font-semibold uppercase tracking-wider">Associazione Sportiva Dilettantistica</p>
                    <p className="text-xs text-gray-600 mt-0.5">Attività di Danza Sportiva e Promozione Sociale</p>
                    <p className="text-xs text-gray-600">Sede Sociale &bull; C.F. / P.IVA Associazione</p>
                </div>
                <div className="text-right border-l-4 border-black pl-4">
                    <h2 className="text-xl font-black tracking-wider">RICEVUTA</h2>
                    <p className="text-gray-700 text-xs font-semibold">N° {pagamento.id.length > 12 ? pagamento.id.slice(0, 8).toUpperCase() : pagamento.id.replace('p', '2026/')}</p>
                    <p className="text-xs font-bold uppercase tracking-wider mt-1 px-2 py-0.5 bg-gray-100 border border-gray-300 rounded inline-block">Copia {tipo}</p>
                </div>
            </div>

            {/* Corpo Ricevuta */}
            <div className="my-5 space-y-3">
                <div className="text-base leading-relaxed">
                    Ricevuto dal Socio: <strong className="uppercase text-lg text-black">{pagamento.allievo.nome} {pagamento.allievo.cognome}</strong>
                    {pagamento.allievo.codice_fiscale && (
                        <span> &mdash; C.F.: <strong className="uppercase">{pagamento.allievo.codice_fiscale}</strong></span>
                    )}
                    <br />
                    Tessera Socio Numero: <strong className="text-black text-lg">{pagamento.allievo.tessera_numero || "N/A"}</strong>
                </div>

                <div className="py-2.5 px-4 bg-gray-50 border border-gray-300 rounded-lg inline-flex items-center">
                    <span className="text-xs uppercase tracking-wider text-gray-600 font-semibold">Somma versata:</span>
                    <strong className="text-2xl ml-3 font-black text-black">€ {Number(pagamento.importo).toFixed(2)}</strong>
                </div>

                <p className="text-base leading-relaxed">
                    Causale: <strong className="text-black">{causaleTesto}</strong>
                </p>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end mt-4 pt-3 border-t border-gray-300">
                <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Data Emissione</p>
                    <p className="font-bold text-sm text-black">{format(new Date(pagamento.data_pagamento || new Date()), "dd/MM/yyyy HH:mm")}</p>
                </div>
                <div className="w-64 text-center">
                    <div className="border-b border-black mb-1.5 h-8"></div>
                    <p className="text-[11px] text-gray-700 font-semibold uppercase">Timbro e Firma per ASD BigDance School</p>
                </div>
            </div>
        </div>
    )

    return (
        <div className="hidden print:flex print:fixed print:inset-0 print:bg-white print:z-50 flex-col h-screen w-full bg-white text-black font-sans">
            {/* Print stylesheet override inline */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @media print {
          @page { margin: 0; size: A4 portrait; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          /* Nascondi tutto il resto dell'app */
          body > *:not(.print\\:flex) {
            display: none !important;
          }
        }
      `}} />

            {/* Top Half: Madre */}
            {receiptHTML("Associazione")}

            {/* Bottom Half: Figlia */}
            {receiptHTML("Socio")}
        </div>
    )
}
