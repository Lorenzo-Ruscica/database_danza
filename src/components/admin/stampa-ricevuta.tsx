"use client"

import { format } from "date-fns"
import { it } from "date-fns/locale"

// Definizione Tipi per il Pagamento
interface RawAllievo {
    nome?: string
    cognome?: string
    tessera_numero?: string
}

interface RawPagamento {
    id: string
    importo: number
    data_pagamento: string
    mese_riferimento: string
    allievo: RawAllievo
}

interface StampaRicevutaProps {
    pagamento: RawPagamento
}

/**
 * Questo componente è nascosto su schermo normale.
 * Diventa visibile occupando l'intera pagina (`fixed inset-0`) SOLO durante la stampa (`print:`).
 * Imposta un layout A4 divisibile in due metà identiche 
 * (Copia Associazione / Copia Allievo).
 */
export function StampaRicevuta({ pagamento }: StampaRicevutaProps) {

    const receiptHTML = (tipo: "Associazione" | "Allievo") => (
        <div className="h-[50%] p-8 border-b-2 border-dashed border-gray-400 flex flex-col justify-between">

            {/* Intestazione */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold uppercase mb-1">Associazione Sportiva ASD</h1>
                    <p className="text-sm text-gray-600">Via della Danza, 1 - 00100 Roma (RM)</p>
                    <p className="text-sm text-gray-600">C.F. / P.IVA: 12345678901</p>
                </div>
                <div className="text-right border-l-4 border-gray-900 pl-4">
                    <h2 className="text-xl font-bold">RICEVUTA</h2>
                    <p className="text-gray-600">N° {pagamento.id.replace('p', '2024/')}</p>
                    <p className="text-sm font-semibold mt-1">Copia {tipo}</p>
                </div>
            </div>

            {/* Corpo Ricevuta */}
            <div className="my-8">
                <p className="text-lg leading-relaxed">
                    Ricevuto da: <strong className="uppercase">{pagamento.allievo.nome} {pagamento.allievo.cognome}</strong>
                    <br />
                    Tessera Numero: <strong>{pagamento.allievo.tessera_numero}</strong>
                </p>
                <p className="text-lg leading-relaxed mt-4">
                    La somma di <strong className="text-2xl ml-2">€ {pagamento.importo.toFixed(2)}</strong>
                </p>
                <p className="text-lg leading-relaxed mt-4">
                    Causale: Pagamento quota per la mensilità di <strong className="capitalize">{format(new Date(`${pagamento.mese_riferimento}-01`), "MMMM yyyy", { locale: it })}</strong>.
                </p>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end mt-8">
                <div>
                    <p className="text-sm">Data emissione</p>
                    <p className="font-semibold">{format(new Date(pagamento.data_pagamento), "dd/MM/yyyy HH:mm")}</p>
                </div>
                <div className="w-64 text-center">
                    <div className="border-b border-black mb-2 h-10"></div>
                    <p className="text-sm text-gray-600">Timbro e Firma Associazione</p>
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
            {receiptHTML("Allievo")}
        </div>
    )
}
