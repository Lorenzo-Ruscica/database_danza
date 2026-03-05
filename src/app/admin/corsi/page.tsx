"use client"

import { useState } from "react"
import { Plus, Search, Users, Euro } from "lucide-react"

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import type { Corso } from "@/types/database"

// Mock data
const MOCK_CORSI: (Corso & { iscritti_count: number })[] = [
    {
        id: "1",
        nome: "Danza Classica - Principianti",
        prezzo_mensile: 50.00,
        descrizione: "Corso base per bambini dai 6 agli 8 anni",
        iscritti_count: 12
    },
    {
        id: "2",
        nome: "Hip Hop - Avanzato",
        prezzo_mensile: 65.00,
        descrizione: "Corso avanzato per ragazzi over 14",
        iscritti_count: 8
    },
    {
        id: "3",
        nome: "Ballo da Sala - Coppie",
        prezzo_mensile: 80.00,
        descrizione: "Liscio, Standard e Latino Americano per coppie",
        iscritti_count: 5 // 5 coppie
    }
]

export default function CorsiPage() {
    const [searchTerm, setSearchTerm] = useState("")

    const filteredCorsi = MOCK_CORSI.filter(c =>
        c.nome.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Gestione Corsi</h1>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Nuovo Corso
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {/* Quick Stats overview */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Corsi Attivi</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{MOCK_CORSI.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Totale Iscritti</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {MOCK_CORSI.reduce((acc, curr) => acc + curr.iscritti_count, 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">Allievi frequentanti</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ricavo Mensile Stimato</CardTitle>
                        <Euro className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            € {MOCK_CORSI.reduce((acc, curr) => acc + (curr.iscritti_count * curr.prezzo_mensile), 0).toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">Esclusi sconti / override</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Elenco Corsi</CardTitle>
                    <CardDescription>
                        Gestisci le classi, le quote di partecipazione e visualizza gli iscritti.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center py-4">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Cerca per nome corso..."
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
                                    <TableHead>Corso</TableHead>
                                    <TableHead>Descrizione</TableHead>
                                    <TableHead className="text-center">Iscritti</TableHead>
                                    <TableHead className="text-right">Prezzo Mensile</TableHead>
                                    <TableHead className="text-right">Azioni</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCorsi.map((corso) => (
                                    <TableRow key={corso.id}>
                                        <TableCell className="font-medium">{corso.nome}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{corso.descrizione}</TableCell>
                                        <TableCell className="text-center">
                                            <div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                                {corso.iscritti_count}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            € {corso.prezzo_mensile.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="outline" size="sm">
                                                Iscritti
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                Modifica
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredCorsi.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            Nessun corso trovato.
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
