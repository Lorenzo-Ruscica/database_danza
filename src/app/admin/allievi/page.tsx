"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { Plus, Search, CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

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
import type { Allievo } from "@/types/database"

export default function AllieviPage() {
    const router = useRouter()
    const [allievi, setAllievi] = useState<Allievo[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const supabase = createClient()

    useEffect(() => {
        const fetchAllievi = async () => {
            try {
                const { data, error } = await supabase
                    .from('allievi')
                    .select(`
                        id,
                        nome,
                        cognome,
                        tessera_numero,
                        codice_fiscale,
                        data_nascita,
                        luogo_nascita,
                        provincia_nascita,
                        indirizzo_residenza,
                        cap_residenza,
                        provincia_residenza,
                        telefono,
                        email,
                        iscrizione_pagata,
                        certificati (
                            data_scadenza
                        )
                    `)
                    .order('created_at', { ascending: false })

                if (error) throw error;

                if (data) {
                    const formattedAllievi: Allievo[] = data.map((d: any) => {
                        // Get the most recent certificate expiration date if multiple exist
                        let scadenza = null;
                        if (d.certificati && d.certificati.length > 0) {
                            const scadenze = d.certificati.map((c: any) => new Date(c.data_scadenza).getTime());
                            scadenza = new Date(Math.max(...scadenze)).toISOString().split('T')[0];
                        }

                        return {
                            id: d.id,
                            nome: d.nome,
                            cognome: d.cognome,
                            tessera_numero: d.tessera_numero || "Da Assegnare",
                            codice_fiscale: d.codice_fiscale,
                            data_nascita: d.data_nascita,
                            luogo_nascita: d.luogo_nascita,
                            provincia_nascita: d.provincia_nascita,
                            indirizzo: d.indirizzo_residenza,
                            cap: d.cap_residenza,
                            provincia_residenza: d.provincia_residenza,
                            telefono: d.telefono || "N/A",
                            email: d.email || "N/A",
                            pagamento_iscrizione: d.iscrizione_pagata,
                            scadenza_certificato_medico: scadenza
                        }
                    });
                    setAllievi(formattedAllievi);
                }
            } catch (error) {
                console.error("Errore recupero allievi:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllievi();
    }, []);

    const filteredAllievi = allievi.filter(a =>
        `${a.nome} ${a.cognome} ${a.tessera_numero} ${a.codice_fiscale}`.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const isCertificatoScaduto = (dataScadenza: string | null) => {
        if (!dataScadenza) return false;
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
                                            {!allievo.scadenza_certificato_medico ? (
                                                <div className="flex items-center justify-center text-destructive gap-1">
                                                    <XCircle className="h-4 w-4" />
                                                    <span className="text-sm font-bold">Mancante</span>
                                                </div>
                                            ) : isCertificatoScaduto(allievo.scadenza_certificato_medico) ? (
                                                <div className="flex flex-col items-center justify-center text-red-600 gap-0.5">
                                                    <div className="flex items-center gap-1">
                                                        <XCircle className="h-4 w-4" />
                                                        <span className="text-sm font-bold">Scaduto</span>
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground font-medium">
                                                        (Scaduto il {format(new Date(allievo.scadenza_certificato_medico!), "dd/MM/yy")})
                                                    </span>
                                                </div>
                                            ) : isCertificatoInScadenza(allievo.scadenza_certificato_medico) ? (
                                                <div className="flex flex-col items-center justify-center text-amber-500 gap-0.5">
                                                    <div className="flex items-center gap-1">
                                                        <AlertTriangle className="h-4 w-4" />
                                                        <span className="text-sm font-bold">Inserito</span>
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground font-medium">
                                                        (Scade il {format(new Date(allievo.scadenza_certificato_medico!), "dd/MM/yy")})
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center text-green-600 dark:text-green-500 gap-0.5">
                                                    <div className="flex items-center gap-1">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        <span className="text-sm font-bold">Inserito</span>
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground font-medium">
                                                        (Scade {format(new Date(allievo.scadenza_certificato_medico!), "dd/MM/yy", { locale: it })})
                                                    </span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => router.push(`/admin/scanner?id=${allievo.id}`)}
                                            >
                                                Apri Scheda
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {isLoading && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            <div className="flex items-center justify-center text-muted-foreground gap-2">
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Caricamento anagrafiche in corso...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!isLoading && filteredAllievi.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            Nessun allievo trovato. {searchTerm ? "Prova a cambiare i parametri di ricerca." : "Aggiungi un allievo o usa il Kiosk per iscrivere qualcuno."}
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
