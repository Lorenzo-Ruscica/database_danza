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

    // Edit & Enrolled State
    const [corsoToEdit, setCorsoToEdit] = useState<any | null>(null)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [corsoToViewAglievi, setCorsoToViewAglievi] = useState<any | null>(null)
    const [iscrittiList, setIscrittiList] = useState<any[]>([])
    const [isLoadingIscritti, setIsLoadingIscritti] = useState(false)

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
                setIsSaving(false)
        }
    }

    const handleEditCorso = async () => {
        if (!corsoToEdit || !corsoToEdit.nome || corsoToEdit.prezzo_mensile < 0) return;

        setIsSaving(true);
        try {
            const { error } = await supabase.from('corsi').update({
                nome: corsoToEdit.nome,
                descrizione: corsoToEdit.descrizione,
                prezzo_standard: corsoToEdit.prezzo_mensile
            }).eq('id', corsoToEdit.id);
            
            if (error) throw error;
            
            setCorsi(corsi.map(c => c.id === corsoToEdit.id ? { ...c, ...corsoToEdit } : c).sort((a, b) => a.nome.localeCompare(b.nome)))
            setIsEditOpen(false);
            setCorsoToEdit(null);
        } catch (err: any) {
            alert("Errore modifica: " + err.message);
        } finally {
            setIsSaving(false);
        }
    }

    const handleDeleteCorso = async (id: string, name: string) => {
        if (!window.confirm(`Sei sicuro di voler eliminare il corso "${name}"?\nATTENZIONE: Se ci sono allievi iscritti, l'operazione fallirà per motivi di sicurezza.`)) return;
        try {
            const { error } = await supabase.from('corsi').delete().eq('id', id);
            if (error) throw error;
            setCorsi(corsi.filter(c => c.id !== id));
            setIsEditOpen(false);
        } catch (err: any) {
            console.error("Errore cancellazione", err);
            alert("Impossibile eliminare il corso. Probabilmente ci sono allievi attualmente iscritti. Rimuovili prima di tentare l'eliminazione.");
        }
    }

    const handleViewIscritti = async (corso: any) => {
        setCorsoToViewAglievi(corso);
        setIsLoadingIscritti(true);
        try {
            const { data, error } = await supabase
                .from('iscrizioni_corsi')
                .select(`
                    allievi ( id, nome, cognome )
                `)
                .eq('corso_id', corso.id);
                
            if (error) throw error;
            // Estrai i dati degli allievi dall'interno dell'oggetto relazionale
            const list = data ? data.map((d: any) => d.allievi).filter(Boolean) : [];
            // Ordiniamo per cognome e poi nome
            setIscrittiList(list.sort((a, b) => a.cognome.localeCompare(b.cognome) || a.nome.localeCompare(b.nome)));
        } catch (err: any) {
            alert("Errore caricamento iscritti: " + err.message);
        } finally {
            setIsLoadingIscritti(false);
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
                                    Prezzo Mensile
                                </Label>
                                <div className="col-span-3">
                                    <Input
                                        id="prezzo"
                                        type="number"
                                        placeholder="0 per In Segreteria"
                                        value={newCorso.prezzo_standard || ''}
                                        onChange={(e) => setNewCorso({ ...newCorso, prezzo_standard: parseFloat(e.target.value) || 0 })}
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1 text-right">L'importo 0 figurerà come "In Segreteria"</p>
                                </div>
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
                                            {corso.prezzo_mensile === 0 ? (
                                                <span className="text-muted-foreground text-sm italic">In Segreteria</span>
                                            ) : (
                                                `€ ${corso.prezzo_mensile.toFixed(2)}`
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => handleViewIscritti(corso)}
                                            >
                                                Iscritti
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => {
                                                    setCorsoToEdit({ ...corso })
                                                    setIsEditOpen(true)
                                                }}
                                            >
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

            {/* View Iscritti Dialog */}
            <Dialog open={!!corsoToViewAglievi} onOpenChange={(open) => !open && setCorsoToViewAglievi(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Iscritti al corso: {corsoToViewAglievi?.nome}</DialogTitle>
                        <DialogDescription>Elenco degli allievi attualmente attivi e registrati a questo corso.</DialogDescription>
                    </DialogHeader>
                    <div className="py-2 max-h-[60vh] overflow-y-auto">
                        {isLoadingIscritti ? (
                            <div className="flex justify-center py-8"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>
                        ) : iscrittiList.length > 0 ? (
                            <ul className="space-y-2">
                                {iscrittiList.map((al: any) => (
                                    <li key={al.id} className="p-3 bg-muted rounded-md border flex items-center justify-between shadow-sm">
                                        <span className="font-semibold text-foreground">{al.cognome} {al.nome}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">Nessun iscritto attualmente a questo corso.</p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Corso Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Modifica Corso</DialogTitle>
                        <DialogDescription>
                            Aggiorna i dettagli del corso o eliminalo definitivamente.
                        </DialogDescription>
                    </DialogHeader>
                    {corsoToEdit && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-nome" className="text-right">Nome *</Label>
                                <Input
                                    id="edit-nome"
                                    className="col-span-3"
                                    value={corsoToEdit.nome}
                                    onChange={(e) => setCorsoToEdit({ ...corsoToEdit, nome: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-prezzo" className="text-right">Prezzo Mensile</Label>
                                <div className="col-span-3">
                                    <Input
                                        id="edit-prezzo"
                                        type="number"
                                        placeholder="0 per In Segreteria"
                                        value={corsoToEdit.prezzo_mensile}
                                        onChange={(e) => setCorsoToEdit({ ...corsoToEdit, prezzo_mensile: parseFloat(e.target.value) || 0 })}
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1 right-0">L'importo 0 figurerà come "In Segreteria"</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="edit-descrizione" className="text-right mt-2">Descrizione</Label>
                                <Textarea
                                    id="edit-descrizione"
                                    className="col-span-3"
                                    value={corsoToEdit.descrizione || ''}
                                    onChange={(e) => setCorsoToEdit({ ...corsoToEdit, descrizione: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter className="flex flex-col-reverse sm:flex-row justify-between w-full max-sm:gap-2">
                        <Button 
                            variant="destructive" 
                            type="button" 
                            onClick={() => handleDeleteCorso(corsoToEdit?.id, corsoToEdit?.nome)}
                            className="sm:mr-auto"
                        >
                            Elimina
                        </Button>
                        <div className="flex gap-2 justify-end w-full">
                            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Annulla</Button>
                            <Button type="submit" onClick={handleEditCorso} disabled={isSaving || !corsoToEdit?.nome}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Salva Modifiche"}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    )
}
