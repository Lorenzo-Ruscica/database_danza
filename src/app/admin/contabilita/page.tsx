"use client"

import { useState } from "react"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { Download, FileText, Search, PlusCircle, TrendingUp, CalendarDays } from "lucide-react"

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
import { StampaRicevuta } from "@/components/admin/stampa-ricevuta"
import type { Pagamento, Allievo } from "@/types/database"

// Mock data
const MOCK_PAGAMENTI: (Pagamento & { allievo: Partial<Allievo> })[] = [
    {
        id: "p1",
        allievo_id: "1",
        importo: 50.00,
        mese_riferimento: "2024-03",
        data_pagamento: "2024-03-01T10:00:00Z",
        allievo: { nome: "Mario", cognome: "Rossi", tessera_numero: "TS-2024-001" }
    },
    {
        id: "p2",
        allievo_id: "2",
        importo: 65.00,
        mese_riferimento: "2024-03",
        data_pagamento: "2024-03-02T15:30:00Z",
        allievo: { nome: "Giulia", cognome: "Bianchi", tessera_numero: "TS-2024-002" }
    },
    {
        id: "p3",
        allievo_id: "3",
        importo: 80.00,
        mese_riferimento: "2024-02",
        data_pagamento: "2024-02-05T09:15:00Z",
        allievo: { nome: "Luca", cognome: "Verdi", tessera_numero: "TS-2024-003" }
    }
]

export default function ContabilitaPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [stampaCorrente, setStampaCorrente] = useState<(Pagamento & { allievo: Partial<Allievo> }) | null>(null)

    // Esegue la stampa temporanea montando prima il DOM, poi chiamando print()
    const handlePrint = (pagamento: any) => {
        setStampaCorrente(pagamento)
        setTimeout(() => {
            window.print()
            // Reset state after print dialog is closed
            setTimeout(() => setStampaCorrente(null), 1000)
        }, 100)
    }

    const filteredPagamenti = MOCK_PAGAMENTI.filter(p =>
        `${p.allievo.nome} ${p.allievo.cognome}`.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const incassoOggi = 115.00 // Mock value
    const incassoMese = 2350.00 // Mock value

    return (
        <div className="flex flex-col gap-6 relative">
            {/* Modalità Stampa Madre/Figlia Invisibile che prende il sopravvento quando attivata */}
            {stampaCorrente && <StampaRicevuta pagamento={stampaCorrente as any} />}

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Contabilità</h1>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" /> Esporta
                    </Button>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" /> Registra Pagamento
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Incasso Odierno</CardTitle>
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">€ {incassoOggi.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            {format(new Date(), "dd MMMM yyyy", { locale: it })}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Incasso Mensile</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">€ {incassoMese.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            {format(new Date(), "MMMM yyyy", { locale: it })}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Storico Ricevute</CardTitle>
                    <CardDescription>
                        Gestisci i pagamenti mensili e stampa le ricevute in A4 (Madre/Figlia).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center py-4">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Cerca per allievo..."
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
                                    <TableHead>Data</TableHead>
                                    <TableHead>Allievo</TableHead>
                                    <TableHead>Mese Rif.</TableHead>
                                    <TableHead className="text-right">Importo</TableHead>
                                    <TableHead className="text-center">Ricevuta PDF</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPagamenti.map((pagamento) => (
                                    <TableRow key={pagamento.id}>
                                        <TableCell className="font-medium">
                                            {format(new Date(pagamento.data_pagamento), "dd/MM/yyyy")}
                                        </TableCell>
                                        <TableCell>
                                            {pagamento.allievo.cognome} {pagamento.allievo.nome}
                                            <div className="text-xs text-muted-foreground">{pagamento.allievo.tessera_numero}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {format(new Date(`${pagamento.mese_riferimento}-01`), "MMMM yyyy", { locale: it })}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            € {pagamento.importo.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                title="Stampa Ricevuta A4"
                                                onClick={() => handlePrint(pagamento)}
                                            >
                                                <FileText className="h-4 w-4 text-blue-600" />
                                                <span className="sr-only">Stampa</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredPagamenti.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            Nessun pagamento trovato.
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
