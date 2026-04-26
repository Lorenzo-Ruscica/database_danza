"use client"

import { format } from "date-fns"
import { it } from "date-fns/locale"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

interface RawAllievo {
    id: string
    nome: string
    presente: boolean
}

interface StampaListaCorsiProps {
    corsoNome: string
    iscritti: RawAllievo[]
    dataCorrente?: string
}

/**
 * Componente per stampare il registro presenze cartaceo.
 * Prende il controllo solo durante `window.print()`.
 */
export function StampaListaCorsi({ corsoNome, iscritti, dataCorrente }: StampaListaCorsiProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const formattedDate = dataCorrente 
        ? format(new Date(dataCorrente), "EEEE d MMMM yyyy", { locale: it })
        : format(new Date(), "EEEE d MMMM yyyy", { locale: it })

    const printContent = (
        <div className="print-section hidden print:block w-full bg-white text-black p-8 font-sans">
            <style dangerouslySetInnerHTML={{
                __html: `
        @media print {
          @page { margin: 1cm; size: A4 portrait; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; background: white; }
          
          /* Nascondi tutto il contenuto del body */
          body > * {
            display: none !important;
          }
          
          /* Mostra solo il blocco stampabile */
          body > .print-section {
            display: block !important;
          }
        }
      `}} />

            {/* Intestazione Foglio */}
            <div className="text-center border-b-2 border-black pb-4 mb-6">
                <h1 className="text-2xl font-bold uppercase">Registro Presenze Cartaceo</h1>
                <h2 className="text-xl mt-2">Corso: <span className="font-bold">{corsoNome}</span></h2>
                <p className="text-gray-600 mt-1 capitalize">Data: {formattedDate}</p>
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
                                {/* Spazio per la spunta a penna */}
                                <div className="w-6 h-6 border-2 border-gray-400 rounded-sm mx-auto"></div>
                            </td>
                            <td className="border border-gray-300 p-3">
                                {/* Spazio vuoto per note */}
                            </td>
                        </tr>
                    ))}

                    {/* Aggiungi righe vuote per eventuali allievi recupero o prove */}
                    {[1, 2, 3].map(i => (
                        <tr key={`empty-${i}`}>
                            <td className="border border-gray-300 p-3 text-center text-gray-400">Prova</td>
                            <td className="border border-gray-300 p-3">
                                <div className="w-full h-6 border-b border-dotted border-gray-300"></div>
                            </td>
                            <td className="border border-gray-300 p-3 text-center">
                                <div className="w-6 h-6 border-2 border-gray-400 rounded-sm mx-auto"></div>
                            </td>
                            <td className="border border-gray-300 p-3"></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Footer Tabella */}
            <div className="mt-12 px-8 text-right text-sm text-gray-500">
                Generato automaticamente da SD-Admin
            </div>
        </div>
    )

    if (!mounted) return null;
    return createPortal(printContent, document.body);
}
