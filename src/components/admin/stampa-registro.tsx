"use client"

import { format } from "date-fns"
import { it } from "date-fns/locale"

interface RawAllievo {
    id: string
    nome: string
    presente: boolean
}

interface StampaListaCorsiProps {
    corsoNome: string
    iscritti: RawAllievo[]
}

/**
 * Componente per stampare il registro presenze cartaceo.
 * Invisibile a schermo, prende il controllo solo durante `window.print()`.
 */
export function StampaListaCorsi({ corsoNome, iscritti }: StampaListaCorsiProps) {
    const currentDate = format(new Date(), "EEEE d MMMM yyyy", { locale: it })

    return (
        <div className="hidden print:block print:fixed print:inset-0 print:bg-white print:z-50 w-full bg-white text-black p-8 font-sans">
            <style dangerouslySetInnerHTML={{
                __html: `
        @media print {
          @page { margin: 1cm; size: A4 portrait; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          /* Nascondi l'interfaccia dell'app, mostra solo il foglio stampabile */
          body > *:not(.print\\:block) {
            display: none !important;
          }
        }
      `}} />

            {/* Intestazione Foglio */}
            <div className="text-center border-b-2 border-black pb-4 mb-6">
                <h1 className="text-2xl font-bold uppercase">Registro Presenze Cartaceo</h1>
                <h2 className="text-xl mt-2">Corso: <span className="font-bold">{corsoNome}</span></h2>
                <p className="text-gray-600 mt-1 capitalize">Data: {currentDate}</p>
            </div>

            {/* Tabella Iscritti */}
            <table className="w-full text-left border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-3 w-16 text-center">N°</th>
                        <th className="border border-gray-300 p-3">Cognome e Nome Allievo</th>
                        <th className="border border-gray-300 p-3 w-32 text-center">Firma Presenza</th>
                        <th className="border border-gray-300 p-3 w-48">Note Insegnante</th>
                    </tr>
                </thead>
                <tbody>
                    {iscritti.map((allievo, index) => (
                        <tr key={allievo.id}>
                            <td className="border border-gray-300 p-3 text-center">{index + 1}</td>
                            <td className="border border-gray-300 p-3 font-medium text-lg">{allievo.nome}</td>
                            <td className="border border-gray-300 p-3 text-center">
                                {/* Spazio bianco per la firma a penna */}
                                <div className="w-full h-8 border-b border-dotted border-gray-400"></div>
                            </td>
                            <td className="border border-gray-300 p-3">
                                {/* Spazio vuoto per note */}
                            </td>
                        </tr>
                    ))}

                    {/* Aggiungi righe vuote per eventuali allievi recupero o prove */}
                    {[1, 2, 3].map(i => (
                        <tr key={`empty-${i}`}>
                            <td className="border border-gray-300 p-3 text-center text-gray-400">Provetta</td>
                            <td className="border border-gray-300 p-3"></td>
                            <td className="border border-gray-300 p-3">
                                <div className="w-full h-8 border-b border-dotted border-gray-400"></div>
                            </td>
                            <td className="border border-gray-300 p-3"></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Footer Tabella */}
            <div className="mt-12 flex justify-between px-8">
                <div className="text-center">
                    <p className="mb-8">Firma Insegnante</p>
                    <div className="w-64 border-b border-black"></div>
                </div>
                <div className="text-right text-sm text-gray-500">
                    Generato automaticamente da SD-Admin
                </div>
            </div>
        </div>
    )
}
