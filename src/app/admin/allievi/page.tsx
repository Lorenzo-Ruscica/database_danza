"use client"

import { useState } from "react"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { Plus, Search, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Allievo } from "@/types/database"

// Mock data for development before Supabase connection
const MOCK_ALLIEVI: Allievo[] = [
    {
        id: "1",
        nome: "Mario",
        cognome: "Rossi",
        tessera_numero: "TS-2024-001",
        codice_fiscale: "MRORSS80A01H501T",
        data_nascita: "1980-01-01",
        luogo_nascita: "Roma",
        provincia_nascita: "RM",
        indirizzo: "Via Roma 1",
        cap: "00100",
        provincia_residenza: "RM",
        telefono: "3331234567",
        email: "mario@example.com",
        pagamento_iscrizione: true,
        scadenza_certificato_medico: "2024-12-31"
    },
    {
        id: "2",
        nome: "Giulia",
        cognome: "Bianchi",
        tessera_numero: "TS-2024-002",
        codice_fiscale: "GLABNC95M41F205W",
        data_nascita: "1995-08-01",
        luogo_nascita: "Milano",
        provincia_nascita: "MI",
        indirizzo: "Via Milano 2",
        cap: "20100",
        provincia_residenza: "MI",
        telefono: "3337654321",
        email: "giulia@example.com",
        pagamento_iscrizione: false,
        scadenza_certificato_medico: "2024-03-15" // Scaduto
    }
]

export default function AllieviPage() {
    const [searchTerm, setSearchTerm] = useState("")

    const filteredAllievi = MOCK_ALLIEVI.filter(a =>
        `${a.nome} ${a.cognome} ${a.tessera_numero}`.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const isCertificatoScaduto = (dataScadenza: string | null) => {
        if (!dataScadenza) return true;
        return new Date(dataScadenza) < new Date();
    }

    const isCertificatoInScadenza = (dataScadenza: string | null) => {
        if (!dataScadenza) return false;
        const scadenza = new Date(dataScadenza);
        const traUnMese = new Date();
        traUnMese.setMonth(traUnMese.getMonth() + 1);
        return scadenza < traUnMese && scadenza >= new Date();
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Gestione Allievi</h1>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Nuovo Allievo
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Elenco iscritti</CardTitle>
                    <CardDescription>
                        Gestisci le anagrafiche, lo stato dei pagamenti di iscrizione e i certificati medici.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center py-4">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Cerca per nome o tessera..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nominativo</TableHead>
                                    <TableHead>Tessera</TableHead>
                                    <TableHead>Contatti</TableHead>
                                    <TableHead className="text-center">Iscrizione</TableHead>
                                    <TableHead className="text-center">Certificato Medico</TableHead>
                                    <TableHead className="text-right">Azioni</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAllievi.map((allievo) => (
                                    <TableRow key={allievo.id}>
                                        <TableCell className="font-medium">
                                            {allievo.cognome} {allievo.nome}
                                            <div className="text-xs text-muted-foreground">{allievo.codice_fiscale}</div>
                                        </TableCell>
                                        <TableCell>{allievo.tessera_numero}</TableCell>
                                        <TableCell>
                                            <div className="text-sm">{allievo.telefono}</div>
                                            <div className="text-xs text-muted-foreground">{allievo.email}</div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {allievo.pagamento_iscrizione ? (
                                                <Badge variant="default" className="bg-green-600 hover:bg-green-700">Pagato</Badge>
                                            ) : (
                                                <Badge variant="destructive">Da Pagare</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {isCertificatoScaduto(allievo.scadenza_certificato_medico) ? (
                                                <div className="flex items-center justify-center text-red-600 gap-1">
                                                    <XCircle className="h-4 w-4" />
                                                    <span className="text-sm font-medium">Scaduto</span>
                                                </div>
                                            ) : isCertificatoInScadenza(allievo.scadenza_certificato_medico) ? (
                                                <div className="flex items-center justify-center text-amber-500 gap-1">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    <span className="text-sm font-medium">
                                                        {format(new Date(allievo.scadenza_certificato_medico!), "dd MMM yyyy", { locale: it })}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center text-green-600 gap-1">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    <span className="text-sm font-medium">
                                                        {format(new Date(allievo.scadenza_certificato_medico!), "dd MMM yyyy", { locale: it })}
                                                    </span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm">
                                                Dettagli
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredAllievi.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            Nessun allievo trovato.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
