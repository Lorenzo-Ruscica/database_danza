"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { Download, FileText, Search, PlusCircle, TrendingUp, CalendarDays, Loader2 } from "lucide-react"

import { createClient } from "@/lib/supabase/client"

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

export default function ContabilitaPage() {
    const [pagamenti, setPagamenti] = useState<(Pagamento & { allievo: Partial<Allievo> })[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [stampaCorrente, setStampaCorrente] = useState<(Pagamento & { allievo: Partial<Allievo> }) | null>(null)

    const supabase = createClient()

    useEffect(() => {
        const fetchPagamenti = async () => {
            try {
                const { data, error } = await supabase
                    .from('pagamenti')
                    .select(`
                        id,
                        allievo_id,
                        importo,
                        mese_riferimento,
                        data_pagamento,
                        allievi (
                            nome,
                            cognome,
                            tessera_numero
                        )
                    `)
                    .order('data_pagamento', { ascending: false })

                if (error) throw error;

                if (data) {
                    const mappedPagamenti = data.map((d: any) => ({
                        id: d.id,
                        allievo_id: d.allievo_id,
                        importo: d.importo,
                        mese_riferimento: d.mese_riferimento,
                        data_pagamento: d.data_pagamento,
                        allievo: {
                            nome: d.allievi?.nome || "Sconosciuto",
                            cognome: d.allievi?.cognome || "",
                            tessera_numero: d.allievi?.tessera_numero || "N/A"
                        }
                    }))
                    setPagamenti(mappedPagamenti)
                }
            } catch (err) {
                console.error("Errore recupero pagamenti:", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchPagamenti()
    }, [])

    // Esegue la stampa temporanea montando prima il DOM, poi chiamando print()
    const handlePrint = (pagamento: any) => {
        setStampaCorrente(pagamento)
        setTimeout(() => {
            window.print()
            // Reset state after print dialog is closed
            setTimeout(() => setStampaCorrente(null), 1000)
        }, 100)
    }

    const filteredPagamenti = pagamenti.filter(p =>
        `${p.allievo.nome} ${p.allievo.cognome} ${p.allievo.tessera_numero}`.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Compute totals dynamically
    const today = new Date().toISOString().split('T')[0]
    const currentMonth = today.substring(0, 7) // YYYY-MM

    const incassoOggi = pagamenti
        .filter(p => p.data_pagamento.startsWith(today))
        .reduce((sum, p) => sum + Number(p.importo), 0)

    const incassoMese = pagamenti
        .filter(p => p.data_pagamento.startsWith(currentMonth))
        .reduce((sum, p) => sum + Number(p.importo), 0)

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
                                {isLoading && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <div className="flex items-center justify-center text-muted-foreground gap-2">
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Caricamento ricevute in corso...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!isLoading && filteredPagamenti.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
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
