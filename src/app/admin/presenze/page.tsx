"use client"

import { useState, useEffect } from "react"
import { Check, User, CalendarDays, Loader2, Printer, LayoutGrid, CalendarRange, QrCode } from "lucide-react"

import { createClient } from "@/lib/supabase/client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { format, endOfMonth, eachDayOfInterval } from "date-fns"
import { it } from "date-fns/locale"
import { StampaListaCorsi } from "@/components/admin/stampa-registro"
import { AdminQrScanner } from "@/components/admin/qr-scanner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"

export default function PresenzePage() {
    const [viewMode, setViewMode] = useState<"daily" | "monthly">("daily")
    const [scannerOpen, setScannerOpen] = useState(false)
    
    // Stato condiviso
    const [corsi, setCorsi] = useState<{ id: string, nome: string }[]>([])
    const [corsoSelezionato, setCorsoSelezionato] = useState<string>("")
    const [isLoading, setIsLoading] = useState(true)

    // Stato Giornaliero
    const [iscritti, setIscritti] = useState<{ id: string, nome: string, presente: boolean }[]>([])
    const [dataSelezionata, setDataSelezionata] = useState<string>(new Date().toISOString().split('T')[0])
    const [isSavingPresenze, setIsSavingPresenze] = useState(false)
    const [isPrinting, setIsPrinting] = useState(false)

    // Stato Mensile
    const [meseSelezionato, setMeseSelezionato] = useState<string>(new Date().toISOString().substring(0, 7)) // YYYY-MM
    const [iscrittiMensili, setIscrittiMensili] = useState<{ id: string, nome: string }[]>([])
    const [presenzeMensili, setPresenzeMensili] = useState<Record<string, Record<string, boolean>>>({})

    const supabase = createClient()

    // 1. Fetch available courses on mount
    useEffect(() => {
        const fetchCorsi = async () => {
            const { data, error } = await supabase.from('corsi').select('id, nome').order('nome')
            if (data && data.length > 0) {
                setCorsi(data)
                setCorsoSelezionato(data[0].id)
            }
            setIsLoading(false)
        }
        fetchCorsi()
    }, [])

    // 2. Fetch Daily
    useEffect(() => {
        const fetchIscritti = async () => {
            if (viewMode !== 'daily' || !corsoSelezionato || !dataSelezionata) return;

            setIsLoading(true)
            const { data, error } = await supabase
                .from('iscrizioni_corsi')
                .select(`
                    allievi!inner (
                        id,
                        nome,
                        cognome,
                        iscrizione_pagata
                    )
                `)
                .eq('corso_id', corsoSelezionato)
                .eq('allievi.iscrizione_pagata', true)

            const { data: presenzeData } = await supabase
                .from('presenze')
                .select('allievo_id')
                .eq('corso_id', corsoSelezionato)
                .eq('data_presenza', dataSelezionata)

            const presentIds = new Set(presenzeData?.map(p => p.allievo_id) || [])

            if (data) {
                const mappedIscritti = data
                    .filter((d: any) => d.allievi)
                    .map((d: any) => {
                        const allievoData = Array.isArray(d.allievi) ? d.allievi[0] : d.allievi;
                        return {
                            id: allievoData.id,
                            nome: `${allievoData.cognome} ${allievoData.nome}`,
                            presente: presentIds.has(allievoData.id)
                        }
                    })
                    .sort((a, b) => a.nome.localeCompare(b.nome))

                setIscritti(mappedIscritti)
            }
            setIsLoading(false)
        }
        fetchIscritti()
    }, [viewMode, corsoSelezionato, dataSelezionata])

    // 3. Fetch Monthly
    useEffect(() => {
        const fetchMonthly = async () => {
            if (viewMode !== 'monthly' || !corsoSelezionato || !meseSelezionato) return;
            setIsLoading(true)

            try {
                // Fetch iscritti
                const { data: iscrittiData } = await supabase
                    .from('iscrizioni_corsi')
                    .select(`allievi!inner ( id, nome, cognome, iscrizione_pagata )`)
                    .eq('corso_id', corsoSelezionato)
                    .eq('allievi.iscrizione_pagata', true)

                let mappedIscritti: {id: string, nome: string}[] = []
                if (iscrittiData) {
                    mappedIscritti = iscrittiData
                        .filter((d: any) => d.allievi)
                        .map((d: any) => {
                            const allievoData = Array.isArray(d.allievi) ? d.allievi[0] : d.allievi;
                            return {
                                id: allievoData.id,
                                nome: `${allievoData.cognome} ${allievoData.nome}`,
                            }
                        })
                        .sort((a, b) => a.nome.localeCompare(b.nome))
                    setIscrittiMensili(mappedIscritti)
                }

                // Fetch presenze del mese
                const [year, month] = meseSelezionato.split('-').map(Number);
                const startOfSelectedMonth = new Date(year, month - 1, 1);
                const endOfSelectedMonth = endOfMonth(startOfSelectedMonth);
                
                const { data: presenzeData, error: presenzeError } = await supabase
                    .from('presenze')
                    .select('allievo_id, data_presenza')
                    .eq('corso_id', corsoSelezionato)
                    .gte('data_presenza', format(startOfSelectedMonth, 'yyyy-MM-dd'))
                    .lte('data_presenza', format(endOfSelectedMonth, 'yyyy-MM-dd'))

                if (presenzeError) throw presenzeError;

                const newPresenzeMensili: Record<string, Record<string, boolean>> = {}
                if (presenzeData) {
                    presenzeData.forEach(p => {
                        if (!newPresenzeMensili[p.allievo_id]) newPresenzeMensili[p.allievo_id] = {}
                        newPresenzeMensili[p.allievo_id][p.data_presenza] = true
                    })
                }
                setPresenzeMensili(newPresenzeMensili)
            } catch (err) {
                console.error("Errore caricamento dati mensili:", err)
                toast.error("Errore nel caricamento dei dati mensili")
            } finally {
                setIsLoading(false)
            }
        }
        fetchMonthly()
    }, [viewMode, corsoSelezionato, meseSelezionato])

    const isOggiGiorno = dataSelezionata === format(new Date(), 'yyyy-MM-dd')

    const togglePresenzaDaily = (id: string) => {
        if (!isOggiGiorno) {
            toast.info("Non è possibile modificare le presenze per giorni passati o futuri.")
            return;
        }
        setIscritti(iscritti.map(i =>
            i.id === id ? { ...i, presente: !i.presente } : i
        ))
    }

    const handleFastScan = async (idAllievo: string) => {
        if (!isOggiGiorno) {
            toast.error("Attenzione: La data selezionata non è oggi. Scansione bloccata.");
            return;
        }

        const allievoIndex = iscritti.findIndex(i => i.id === idAllievo);
        
        if (allievoIndex === -1) {
            // L'allievo non è in questa lista, forse non è iscritto a questo corso
            toast.error("Scansione Rifiutata: Questo allievo non risulta iscritto al corso selezionato.", { duration: 4000 });
            return;
        }

        const allievo = iscritti[allievoIndex];

        if (allievo.presente) {
            toast.info(`${allievo.nome} ${allievo.cognome} è già registrato come presente.`);
            return;
        }

        // 1. Aggiorna stato locale immediatamente per feedback visivo
        setIscritti(prev => prev.map(i => i.id === idAllievo ? { ...i, presente: true } : i));

        // 2. Salva immediatamente sul DB
        try {
            const { error } = await supabase.from('presenze').insert({
                corso_id: corsoSelezionato,
                allievo_id: idAllievo,
                data_presenza: dataSelezionata
            });
            if (error) throw error;
            toast.success(`✅ Presenza registrata: ${allievo.nome} ${allievo.cognome}`);
        } catch (err) {
            console.error("Errore salvataggio presenza rapida:", err);
            toast.error(`Errore nel salvare la presenza di ${allievo.nome}`);
            // Rollback in caso di errore
            setIscritti(prev => prev.map(i => i.id === idAllievo ? { ...i, presente: false } : i));
        }
    }

    const handleSaveRegistro = async () => {
        if (!isOggiGiorno) return;
        
        setIsSavingPresenze(true)
        try {
            // Elimina tutte le presenze correnti per questo corso in questa data
            await supabase
                .from('presenze')
                .delete()
                .eq('corso_id', corsoSelezionato)
                .eq('data_presenza', dataSelezionata)

            // Re-inserisce solo quelli presenti
            const presenti = iscritti.filter(i => i.presente)
            if (presenti.length > 0) {
                const inserts = presenti.map(p => ({
                    corso_id: corsoSelezionato,
                    allievo_id: p.id,
                    data_presenza: dataSelezionata
                }))
                const { error } = await supabase.from('presenze').insert(inserts)
                if (error) throw error
            }
            toast.success("Registro presenze salvato correttamente!")
        } catch (err: any) {
            console.error(err)
            toast.error("Errore salvataggio presenze: " + err.message)
        } finally {
            setIsSavingPresenze(false)
        }
    }

    const handlePrintRegistro = () => {
        setIsPrinting(true)
        setTimeout(() => {
            window.print()
            setTimeout(() => setIsPrinting(false), 500)
        }, 100)
    }

    const currentContextCourse = corsi.find(c => c.id === corsoSelezionato)

    const renderMonthlyTable = () => {
        if (!meseSelezionato) return null;
        const [year, month] = meseSelezionato.split('-').map(Number);
        const startOfSelectedMonth = new Date(year, month - 1, 1);
        const endOfSelectedMonth = endOfMonth(startOfSelectedMonth);
        const giorniDelMese = eachDayOfInterval({ start: startOfSelectedMonth, end: endOfSelectedMonth });

        if (iscrittiMensili.length === 0) {
            return (
                <div className="h-full flex items-center justify-center text-muted-foreground text-xl">
                    Nessun allievo iscritto a questo corso.
                </div>
            )
        }

        return (
            <div className="border rounded-xl overflow-auto h-full relative bg-background flex-1">
                <Table className="relative">
                    <TableHeader className="sticky top-0 z-20 bg-background/95 backdrop-blur shadow-sm">
                        <TableRow>
                            <TableHead className="w-[200px] sticky left-0 bg-background/95 backdrop-blur z-30 border-r min-w-[200px] font-bold text-foreground">
                                Allievo
                            </TableHead>
                            {giorniDelMese.map(giorno => {
                                const dateStr = format(giorno, 'yyyy-MM-dd')
                                const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr
                                return (
                                    <TableHead key={dateStr} className={`text-center min-w-[44px] px-1 border-r ${isToday ? 'bg-primary/10 text-primary font-bold' : ''}`}>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] uppercase font-medium text-muted-foreground">{format(giorno, 'EE', { locale: it })}</span>
                                            <span className="text-sm">{format(giorno, 'd')}</span>
                                        </div>
                                    </TableHead>
                                )
                            })}
                            <TableHead className="text-center font-bold sticky right-0 bg-background/95 backdrop-blur z-30 border-l min-w-[60px] text-primary">Tot.</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {iscrittiMensili.map((allievo) => {
                            let totalPresenze = 0;
                            giorniDelMese.forEach(giorno => {
                                if (presenzeMensili[allievo.id]?.[format(giorno, 'yyyy-MM-dd')]) {
                                    totalPresenze++;
                                }
                            })

                            return (
                                <TableRow key={allievo.id} className="hover:bg-muted/30">
                                    <TableCell className="font-medium sticky left-0 bg-background z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] truncate max-w-[200px]" title={allievo.nome}>
                                        {allievo.nome}
                                    </TableCell>
                                    {giorniDelMese.map(giorno => {
                                        const dateStr = format(giorno, 'yyyy-MM-dd')
                                        const isPresent = presenzeMensili[allievo.id]?.[dateStr] || false
                                        const isOggi = format(new Date(), 'yyyy-MM-dd') === dateStr

                                        return (
                                            <TableCell 
                                                key={dateStr} 
                                                className={`text-center p-0 border-r ${isOggi ? 'bg-primary/5' : ''}`}
                                            >
                                                <div className="w-full h-full min-h-[44px] flex items-center justify-center">
                                                    {isPresent ? (
                                                        <Check className="h-5 w-5 text-green-500 drop-shadow-sm" />
                                                    ) : (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />
                                                    )}
                                                </div>
                                            </TableCell>
                                        )
                                    })}
                                    <TableCell className="text-center font-bold sticky right-0 bg-background z-10 border-l shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)] text-primary">
                                        {totalPresenze}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        )
    }

    return (
        <div className="flex flex-col flex-1 h-full min-h-[calc(100vh-6rem)] gap-4 relative">
            {/* Modalità Stampa Registro Invisibile*/}
            {isPrinting && currentContextCourse && viewMode === 'daily' && (
                <StampaListaCorsi corsoNome={currentContextCourse.nome} iscritti={iscritti} dataCorrente={dataSelezionata} />
            )}
            
            <AdminQrScanner open={scannerOpen} onOpenChange={setScannerOpen} mode="presenze" onScanSuccess={handleFastScan} />

            {/* Header */}
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl border">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Registro Presenze</h1>
                    <div className="flex items-center text-muted-foreground mt-1">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {viewMode === 'daily' 
                            ? (dataSelezionata ? format(new Date(dataSelezionata), "EEEE d MMMM yyyy", { locale: it }) : "Seleziona una data")
                            : (meseSelezionato ? format(new Date(Number(meseSelezionato.split('-')[0]), Number(meseSelezionato.split('-')[1])-1, 1), "MMMM yyyy", { locale: it }) : "Seleziona un mese")
                        }
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
                    <div className="flex bg-muted p-1 rounded-lg w-full md:w-auto h-12">
                        <Button 
                            variant={viewMode === 'daily' ? 'default' : 'ghost'} 
                            onClick={() => setViewMode('daily')}
                            className="flex-1 h-full text-sm md:text-base px-6 shadow-sm"
                        >
                            <LayoutGrid className="w-4 h-4 md:w-5 md:h-5 mr-2"/>
                            Giornaliero
                        </Button>
                        <Button 
                            variant={viewMode === 'monthly' ? 'default' : 'ghost'} 
                            onClick={() => setViewMode('monthly')}
                            className="flex-1 h-full text-sm md:text-base px-6 shadow-sm"
                        >
                            <CalendarRange className="w-4 h-4 md:w-5 md:h-5 mr-2"/>
                            Mensile
                        </Button>
                    </div>

                    <Button
                        variant="default"
                        onClick={() => setScannerOpen(true)}
                        className="h-12 px-4 shadow-sm"
                        title="Scannerizza Tessera Allievo"
                    >
                        <QrCode className="w-5 h-5 md:mr-2" />
                        <span className="hidden md:inline">Scanner Rapido Multiplo</span>
                    </Button>

                    {viewMode === 'daily' ? (
                        <Input 
                            type="date"
                            value={dataSelezionata}
                            onChange={(e) => setDataSelezionata(e.target.value)}
                            className="h-12 text-base w-full md:w-[200px]"
                        />
                    ) : (
                        <Input 
                            type="month"
                            value={meseSelezionato}
                            onChange={(e) => setMeseSelezionato(e.target.value)}
                            className="h-12 text-base w-full md:w-[200px]"
                        />
                    )}
                    
                    <div className="w-full md:w-[250px]">
                        <Select value={corsoSelezionato} onValueChange={setCorsoSelezionato}>
                            <SelectTrigger className="h-12 text-base bg-background">
                                <SelectValue placeholder="Seleziona Corso" />
                            </SelectTrigger>
                            <SelectContent>
                                {corsi.map(corso => (
                                    <SelectItem key={corso.id} value={corso.id} className="text-base py-3">
                                        {corso.nome}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Contenuto Principale */}
            {isLoading ? (
                <div className="flex-1 rounded-xl border p-4 bg-background flex flex-col items-center justify-center text-muted-foreground gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-xl">Sincronizzazione registro...</p>
                </div>
            ) : viewMode === 'daily' ? (
                <>
                    {!isOggiGiorno && iscritti.length > 0 && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 p-4 rounded-xl text-center mb-0 text-sm font-medium">
                            Stai visualizzando il registro di un giorno diverso da oggi. Le presenze sono bloccate e non possono essere modificate.
                        </div>
                    )}
                    
                    <div className="flex-1 overflow-auto rounded-xl border p-4 bg-background">
                    {iscritti.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-xl">
                            Nessun allievo iscritto a questo corso.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                            {iscritti.map((allievo) => (
                                <Card
                                    key={allievo.id}
                                    className={`cursor-pointer transition-all active:scale-95 border-2 ${allievo.presente
                                        ? 'bg-green-500/10 border-green-500 shadow-sm'
                                        : 'bg-card border-border hover:border-primary/50'
                                        }`}
                                    onClick={() => togglePresenzaDaily(allievo.id)}
                                >
                                    <CardContent className="flex flex-col items-center justify-center p-4 md:p-6 min-h-[140px] md:min-h-[160px] text-center gap-3 md:gap-4 relative">
                                        {allievo.presente && (
                                            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 shadow-sm">
                                                <Check className="h-3 w-3 md:h-4 md:w-4" />
                                            </div>
                                        )}

                                        <div className={`rounded-full p-3 md:p-4 ${allievo.presente ? 'bg-green-500/20 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                                            <User className="h-6 w-6 md:h-8 md:w-8" />
                                        </div>

                                        <span className={`font-medium text-sm md:text-base leading-tight ${allievo.presente ? 'text-green-700 dark:text-green-400 font-semibold' : ''}`}>
                                            {allievo.nome}
                                        </span>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
                </>
            ) : (
                /* Vista Mensile */
                renderMonthlyTable()
            )}

            {/* Footer */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 py-2">
                {viewMode === 'daily' ? (
                    <>
                        <Button
                            variant="outline"
                            size="lg"
                            className="h-14 px-8 text-lg w-full sm:w-auto"
                            onClick={handlePrintRegistro}
                        >
                            <Printer className="mr-2 h-5 w-5" />
                            Stampa Lista Vuota
                        </Button>
                        <Button 
                            size="lg" 
                            className="h-14 px-8 text-lg w-full sm:w-auto shadow-md"
                            onClick={handleSaveRegistro}
                            disabled={isSavingPresenze || isLoading || !isOggiGiorno}
                        >
                            {isSavingPresenze ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : "Salva Registro"} ({iscritti.filter(i => i.presente).length} presenti)
                        </Button>
                    </>
                ) : (
                    <div className="text-muted-foreground text-sm w-full text-center flex items-center justify-center bg-muted/50 p-4 rounded-lg border">
                        Questo tabellone mostra unicamente la cronologia mensile delle presenze.
                    </div>
                )}
            </div>
        </div>
    )
}
