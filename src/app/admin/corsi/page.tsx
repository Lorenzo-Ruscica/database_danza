"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Users, Euro, Loader2 } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Corso } from "@/types/database"

export default function CorsiPage() {
    const [corsi, setCorsi] = useState<(Corso & { iscritti_count: number })[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    // Add Course Form State
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [newCorso, setNewCorso] = useState({ nome: '', descrizione: '', prezzo_standard: 0 })
    const [isSaving, setIsSaving] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        const fetchCorsi = async () => {
            try {
                // Fetch corsi and their count from iscrizioni_corsi
                const { data, error } = await supabase
                    .from('corsi')
                    .select(`
                        id,
                        nome,
                        prezzo_standard,
                        descrizione,
                        iscrizioni_corsi ( count )
                    `)
                    .order('nome', { ascending: true })

                if (error) throw error;

                if (data) {
                    const mappedCorsi = data.map((d) => ({
                        id: d.id,
                        nome: d.nome,
                        prezzo_mensile: d.prezzo_standard || 0,
                        descrizione: d.descrizione,
                        iscritti_count: d.iscrizioni_corsi[0]?.count || 0
                    }))
                    setCorsi(mappedCorsi)
                }
            } catch (err) {
                console.error("Errore recupero corsi:", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchCorsi()
    }, [supabase])

    const handleAddCorso = async () => {
        if (!newCorso.nome || newCorso.prezzo_standard < 0) return;

        setIsSaving(true)
        try {
            const { data, error } = await supabase.from('corsi').insert([{
                nome: newCorso.nome,
                descrizione: newCorso.descrizione,
                prezzo_standard: newCorso.prezzo_standard
            }]).select()

            if (error) throw error

            if (data && data.length > 0) {
                // Add to local state
                const addedCorso = {
                    id: data[0].id,
                    nome: data[0].nome,
                    prezzo_mensile: data[0].prezzo_standard,
                    descrizione: data[0].descrizione,
                    iscritti_count: 0
                };
                setCorsi([...corsi, addedCorso].sort((a, b) => a.nome.localeCompare(b.nome)))
                setIsAddOpen(false)
                setNewCorso({ nome: '', descrizione: '', prezzo_standard: 0 })
            }
        } catch (err) {
            console.error("Errore salvataggio corso:", err)
            alert("Errore durante il salvataggio del corso: " + (err instanceof Error ? err.message : JSON.stringify(err)))
        } finally {
            setIsSaving(false)
        }
    }

    const filteredCorsi = corsi.filter(c =>
        c.nome.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Gestione Corsi</h1>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" /> Nuovo Corso
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Aggiungi Nuovo Corso</DialogTitle>
                            <DialogDescription>
                                Inserisci i dettagli del nuovo corso. Clicca salva quando hai finito. Questo corso apparirà nei moduli iscrizione.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="nome" className="text-right">
                                    Nome *
                                </Label>
                                <Input
                                    id="nome"
                                    placeholder="Es. Hip Hop Avanzato"
                                    className="col-span-3"
                                    value={newCorso.nome}
                                    onChange={(e) => setNewCorso({ ...newCorso, nome: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="prezzo" className="text-right">
                                    PrezzoMensile
                                </Label>
                                <Input
                                    id="prezzo"
                                    type="number"
                                    placeholder="50.00"
                                    className="col-span-3"
                                    value={newCorso.prezzo_standard || ''}
                                    onChange={(e) => setNewCorso({ ...newCorso, prezzo_standard: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="descrizione" className="text-right mt-2">
                                    Descrizione
                                </Label>
                                <Textarea
                                    id="descrizione"
                                    placeholder="Opzionale"
                                    className="col-span-3"
                                    value={newCorso.descrizione}
                                    onChange={(e) => setNewCorso({ ...newCorso, descrizione: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="submit"
                                onClick={handleAddCorso}
                                disabled={isSaving || !newCorso.nome}
                            >
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Salva Corso"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {/* Quick Stats overview */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Corsi Attivi</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{corsi.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Totale Iscritti</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {corsi.reduce((acc, curr) => acc + curr.iscritti_count, 0)}
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
                            € {corsi.reduce((acc, curr) => acc + (curr.iscritti_count * curr.prezzo_mensile), 0).toFixed(2)}
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
                                {isLoading && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <div className="flex items-center justify-center text-muted-foreground gap-2">
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Caricamento corsi in corso...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!isLoading && filteredCorsi.length === 0 && (
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
