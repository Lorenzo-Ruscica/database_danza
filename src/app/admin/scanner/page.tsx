"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertCircle, Euro, User, Loader2, Download, Upload, Edit } from "lucide-react"

// FORZA IL RENDERING DINAMICO: Risolve l'errore "Command npm run build exited with 1" su Vercel
export const dynamic = 'force-dynamic';

function ScannerContent() {
    const searchParams = useSearchParams()
    const id = searchParams.get('id')
    const supabase = createClient()

    const [allievo, setAllievo] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [pagamentoFatto, setPagamentoFatto] = useState(false)
    const [firmaError, setFirmaError] = useState(false)
    const [isUploadingCertificato, setIsUploadingCertificato] = useState(false)
    const [scadenzaInput, setScadenzaInput] = useState("")

    const [isEditCorsiOpen, setIsEditCorsiOpen] = useState(false)
    const [allCorsi, setAllCorsi] = useState<any[]>([])
    const [selectedCorsiIds, setSelectedCorsiIds] = useState<string[]>([])
    const [isSavingCorsi, setIsSavingCorsi] = useState(false)

    // Fast Mode States
    const [showFullCard, setShowFullCard] = useState(false)
    const [presenzaRegistrata, setPresenzaRegistrata] = useState(false)

    useEffect(() => {
        const fetchStudente = async () => {
            if (!id) {
                setIsLoading(false)
                return
            }
            try {
                // Preleva l'allievo e i suoi corsi tramite la tabella ponte iscrizioni_corsi
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
                        email,
                        telefono,
                        is_minore,
                        tutore_nome,
                        tutore_cognome,
                        tutore_codice_fiscale,
                        iscrizioni_corsi (
                            corso_id,
                            corsi (
                                id,
                                nome,
                                prezzo_standard
                            )
                        ),
                        certificati (
                            url_foto,
                            data_scadenza
                        )
                    `)
                    .eq('id', id)
                    .single()

                if (error) throw error

                if (data) {
                    setAllievo(data)

                    // Controllo se ha già pagato per il mese corrente
                    const today = new Date()
                    const meseT = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

                    const { data: checkPagamento } = await supabase
                        .from('pagamenti')
                        .select('id')
                        .eq('allievo_id', id)
                        .eq('mese_riferimento', meseT)

                    if (checkPagamento && checkPagamento.length > 0) {
                        setPagamentoFatto(true)
                    }

                    // AUTO-REGISTRA PRESENZE
                    const todayDateString = today.toISOString().split('T')[0];
                    if (data.iscrizioni_corsi && data.iscrizioni_corsi.length > 0) {
                        // verify if already present
                        const { data: presenzeGiaEsistenti } = await supabase
                            .from('presenze')
                            .select('corso_id')
                            .eq('allievo_id', id)
                            .eq('data_presenza', todayDateString);
                            
                        const corsiIdsToInsert = data.iscrizioni_corsi
                            .map((iscr: any) => iscr.corso_id)
                            .filter((cId: string) => !presenzeGiaEsistenti?.find((p: any) => p.corso_id === cId));

                        if (corsiIdsToInsert.length > 0) {
                            const inserts = corsiIdsToInsert.map((cId: string) => ({
                                allievo_id: id,
                                corso_id: cId,
                                data_presenza: todayDateString
                            }));
                            await supabase.from('presenze').insert(inserts);
                            setPresenzaRegistrata(true);
                        } else {
                            // Erano già state registrate oggi
                            setPresenzaRegistrata(true);
                        }
                    }
                }
                
                const { data: corsiData } = await supabase.from('corsi').select('id, nome, prezzo_standard').order('nome')
                if (corsiData) setAllCorsi(corsiData)
                
            } catch (err) {
                console.error("Errore fetch scanner:", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchStudente()
    }, [id, supabase])

    const openEditCorsi = () => {
        const currentIds = allievo.iscrizioni_corsi?.map((iscr: any) => iscr.corso_id).filter(Boolean) || [];
        setSelectedCorsiIds(currentIds);
        setIsEditCorsiOpen(true);
    };

    const handleSaveCorsi = async () => {
        setIsSavingCorsi(true);
        try {
            // Elimina tutte le iscrizioni correnti per questo allievo
            await supabase.from('iscrizioni_corsi').delete().eq('allievo_id', id);
            
            // Inserisci le nuove iscrizioni
            if (selectedCorsiIds.length > 0) {
                const inserts = selectedCorsiIds.map(corsoId => ({
                    allievo_id: id,
                    corso_id: corsoId
                }));
                const { error } = await supabase.from('iscrizioni_corsi').insert(inserts);
                if (error) throw error;
            }
            
            alert("Corsi studente aggiornati con successo!");
            window.location.reload();
        } catch (err: any) {
            alert("Errore salva corsi: " + err.message);
        } finally {
            setIsSavingCorsi(false);
        }
    };

    const handleRegistraPagamento = async () => {
        if (!allievo) return

        // Pop-up di conferma pagamento
        const isConfirmed = window.confirm(`Confermi la ricezione del pagamento per ${allievo.nome} ${allievo.cognome}?`);
        if (!isConfirmed) return;

        try {
            const today = new Date()
            const meseT = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
            const importo = allievo.iscrizioni_corsi?.reduce((acc: number, iscr: any) => acc + (iscr.corsi?.prezzo_standard || 0), 0) || 0

            const { error } = await supabase.from('pagamenti').insert([{
                allievo_id: allievo.id,
                importo: importo,
                mese_riferimento: meseT
            }])

            if (error) throw error
            setPagamentoFatto(true)

            // Invia la Tessera Definitiva via email
            if (allievo.email) {
                try {
                    await fetch('/api/send-tessera-definitiva', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: allievo.email,
                            tessera_numero: allievo.tessera_numero,
                            nome: `${allievo.nome} ${allievo.cognome}`
                        })
                    });
                    // Feedback per l'amministratore
                    alert(`Pagamento registrato e Tessera d'accesso inviata via email a ${allievo.email}!`);
                } catch (emailErr) {
                    console.error("Errore invio tessera definitiva:", emailErr)
                    alert("Pagamento registrato correttamente, ma si è verificato un errore nell'invio della mail all'allievo.");
                }
            } else {
                alert("Pagamento registrato con successo! L'allievo tuttavia non ha una email associata a cui spedire la tessera.");
            }

        } catch (err: any) {
            console.error("Errore registrazione pagamento:", err)
            const errorMsg = err?.message || JSON.stringify(err) || "Errore sconosciuto";
            alert("Errore durante la registrazione del pagamento su Supabase: " + errorMsg)
        }
    }

    const handleUploadCertificato = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !allievo) return;

        if (!scadenzaInput) {
            alert("Attenzione: Devi inserire la data di scadenza prima di poter caricare la foto del certificato.");
            e.target.value = '';
            return;
        }

        setIsUploadingCertificato(true);
        try {
            const fileName = `${id}-${Date.now()}.jpg`
            const { data: uploadData, error: uploadErr } = await supabase.storage.from('certificati').upload(fileName, file)

            if (uploadErr) throw uploadErr;

            if (uploadData) {
                const { error: certErr } = await supabase.from('certificati').insert([{
                    allievo_id: id,
                    url_foto: uploadData.path,
                    data_scadenza: scadenzaInput
                }])

                if (certErr) throw certErr;

                alert("Certificato caricato e registrato con successo!");
                window.location.reload();
            }
        } catch (err: any) {
            console.error("Errore upload certificato", err);
            const msg = err?.message || "Errore sconosciuto";
            alert("Errore durante il caricamento del certificato: " + msg);
        } finally {
            setIsUploadingCertificato(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p>Ricerca allievo nel database...</p>
            </div>
        )
    }

    if (!id || !allievo) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center p-6">
                <AlertCircle className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold">Allievo Non Trovato</h1>
                <p className="text-muted-foreground">Il QR code scansionato non è valido o l'allievo è stato rimosso.</p>
            </div>
        )
    }

    const totaleDaPagare = allievo.iscrizioni_corsi?.reduce((acc: number, iscr: any) => acc + (iscr.corsi?.prezzo_standard || 0), 0) || 0
    const hasCertificato = allievo.certificati && allievo.certificati.length > 0 && allievo.certificati[0]?.url_foto;
    const hasCorsiInSegreteria = allievo.iscrizioni_corsi?.some((iscr: any) => iscr.corsi?.prezzo_standard === 0);
    const noCorsiAtAll = !allievo.iscrizioni_corsi || allievo.iscrizioni_corsi.length === 0;

    if (!showFullCard) {
        return (
            <div className="flex min-h-[90vh] flex-col items-center justify-center gap-6 p-6 animate-in fade-in zoom-in duration-500 overflow-hidden">
                {presenzaRegistrata ? (
                    <div className="bg-green-100 p-6 rounded-full shadow-inner border border-green-200">
                        <CheckCircle2 className="h-24 w-24 text-green-600" />
                    </div>
                ) : (
                    <div className="bg-primary/10 p-6 rounded-full shadow-inner border border-primary/20">
                        <User className="h-24 w-24 text-primary" />
                    </div>
                )}
                
                <div className="text-center space-y-2 mt-2">
                    <h1 className="text-4xl md:text-6xl font-black text-foreground break-words">{allievo.nome} <br/> {allievo.cognome}</h1>
                    <p className="text-xl md:text-2xl text-muted-foreground font-medium mt-2">Tessera: <strong className="text-foreground">{allievo.tessera_numero}</strong></p>
                </div>

                {presenzaRegistrata && (
                    <p className="text-xl md:text-2xl font-bold text-green-700 my-4 bg-green-50 px-8 py-3 rounded-full shadow-sm border border-green-300 flex items-center gap-3">
                        <CheckCircle2 className="h-6 w-6"/> Presenza Registrata Oggi
                    </p>
                )}

                <div className="w-full max-w-md bg-muted/40 p-6 rounded-3xl border shadow-sm mt-4">
                    <h3 className="font-bold text-lg mb-4 text-center text-muted-foreground uppercase opacity-80 border-b pb-3">Corsi Sottoscritti</h3>
                    {!noCorsiAtAll ? (
                        <ul className="space-y-4">
                            {allievo.iscrizioni_corsi.map((iscr: any, i: number) => (
                                <li key={i} className="font-bold text-xl md:text-2xl flex items-center gap-4">
                                    <div className="h-3 w-3 rounded-full bg-primary shrink-0" />
                                    {iscr.corsi?.nome}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center italic opacity-70">Nessun corso assegnato</p>
                    )}
                </div>

                <div className="mt-8 flex flex-col items-center gap-4 w-full max-w-md pb-12">
                    {/* Avvisi rapidi in rosso o giallo */}
                    {!pagamentoFatto && (
                        <div className="text-destructive text-sm md:text-base font-bold flex items-center gap-2 bg-destructive/10 px-5 py-2.5 rounded-full border border-destructive/20 w-full justify-center text-center">
                            <AlertCircle className="w-5 h-5 shrink-0" /> Pagamento Mese Attuale da Confermare in Segreteria
                        </div>
                    )}
                    {!hasCertificato && (
                        <div className="text-amber-700 text-sm md:text-base font-bold flex items-center gap-2 bg-amber-50 px-5 py-2.5 rounded-full border border-amber-200 w-full justify-center text-center">
                            <AlertCircle className="w-5 h-5 shrink-0" /> Certificato Medico Scaduto o Mancante
                        </div>
                    )}

                    <Button size="lg" className="h-20 w-full text-2xl mt-6 shadow-xl active:scale-95 transition-all rounded-2xl" onClick={() => setShowFullCard(true)}>
                        <User className="mr-3 h-8 w-8" />
                        Apri Scheda Completa
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 pt-6 pb-24 md:pt-10">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-center md:text-left">Esito Scansione</h1>

            {pagamentoFatto && (
                <div className="bg-green-100 dark:bg-green-900 border-l-4 border-green-500 p-4 rounded-xl flex items-start gap-3 shadow-sm">
                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold text-green-800 dark:text-green-200">Quota Mensile Saldata</p>
                        <p className="text-green-700 dark:text-green-300 text-sm mt-1">Lo studente risulta in regola con i pagamenti per il mese in corso.</p>
                    </div>
                </div>
            )}

            <Card className="shadow-lg border-primary/10 overflow-hidden">
                <CardHeader className="bg-muted/30 pb-4 border-b">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary p-3 md:p-4 rounded-full shadow-inner text-primary-foreground">
                            <User className="h-6 w-6 md:h-8 md:w-8" />
                        </div>
                        <div className="flex-1">
                            <CardTitle className="text-xl md:text-2xl font-black">{allievo.cognome} {allievo.nome}</CardTitle>
                            <CardDescription className="text-sm md:text-base mt-1 text-muted-foreground flex flex-col md:flex-row md:items-center gap-1">
                                <span>Tessera: <strong className="text-foreground">{allievo.tessera_numero}</strong></span>
                                <span className="hidden md:inline text-muted-foreground/40">•</span>
                                <span>CF: {allievo.codice_fiscale}</span>
                            </CardDescription>
                            {allievo.is_minore && (
                                <div className="mt-3 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200 p-2.5 rounded-md border-l-4 border-amber-500 text-sm shadow-sm flex items-start gap-2">
                                    <User className="h-4 w-4 mt-0.5 shrink-0 opacity-70" />
                                    <div>
                                        <span className="font-bold block uppercase text-[10px] tracking-wider opacity-80 mb-0.5">Studente Minorenne - Tutore Legale:</span>
                                        <span className="font-semibold text-base">{allievo.tutore_nome} {allievo.tutore_cognome}</span>
                                        <span className="block text-xs mt-0.5 opacity-90">CF: {allievo.tutore_codice_fiscale}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6 px-4 md:px-6">
                    <div>
                        <div className="flex items-center justify-between border-b pb-2 mb-3">
                            <h3 className="font-semibold text-base md:text-lg text-muted-foreground">Pacchetto Corsi Selezionati</h3>
                            <Button variant="outline" size="sm" onClick={openEditCorsi} className="h-8 shadow-sm">
                                <Edit className="w-3.5 h-3.5 mr-1.5" /> Modifica
                            </Button>
                        </div>
                        <ul className="space-y-2.5">
                            {allievo.iscrizioni_corsi?.map((iscr: any, i: number) => (
                                <li key={i} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg shadow-sm">
                                    <span className="font-medium text-sm md:text-base">{iscr.corsi.nome}</span>
                                    <span className="text-muted-foreground font-semibold">
                                        {iscr.corsi.prezzo_standard === 0 ? "In Segreteria" : `€ ${iscr.corsi.prezzo_standard.toFixed(2)}`}
                                    </span>
                                </li>
                            ))}
                            {(!allievo.iscrizioni_corsi || allievo.iscrizioni_corsi.length === 0) && (
                                <li className="text-muted-foreground bg-zinc-50 border p-3 rounded-lg text-sm text-center">Nessun corso attivo trovato</li>
                            )}
                        </ul>
                    </div>

                    <div className="bg-primary/5 rounded-2xl p-5 md:p-6 border-2 border-primary/20 shadow-inner">
                        <div className="flex justify-between items-end mb-6">
                            <span className="text-muted-foreground font-semibold text-sm md:text-base uppercase tracking-wider">Totale Mensile</span>
                            <div className="text-4xl md:text-5xl font-black text-primary flex flex-col items-end leading-none tracking-tighter">
                                {totaleDaPagare === 0 && hasCorsiInSegreteria ? (
                                    <span className="text-2xl font-semibold italic">In Segreteria</span>
                                ) : (
                                    <span className="flex items-center">
                                        <Euro className="h-7 w-7 md:h-10 md:w-10 mr-1 opacity-80" />
                                        {totaleDaPagare.toFixed(2)}
                                    </span>
                                )}
                                {hasCorsiInSegreteria && totaleDaPagare > 0 && (
                                    <span className="text-sm text-muted-foreground font-normal italic mt-2 whitespace-nowrap">
                                        + Corsi in segreteria
                                    </span>
                                )}
                            </div>
                        </div>

                        <Button
                            className={`w-full h-16 text-lg md:text-xl font-bold shadow-lg transition-transform ${(!pagamentoFatto && hasCertificato && !noCorsiAtAll) ? 'active:scale-95' : ''}`}
                            onClick={handleRegistraPagamento}
                            disabled={pagamentoFatto || noCorsiAtAll || !hasCertificato}
                            variant={pagamentoFatto ? "secondary" : "default"}
                        >
                            <CheckCircle2 className="mr-2 h-6 w-6 md:h-7 md:w-7" />
                            {pagamentoFatto
                                ? "Pagato per questo mese"
                                : !hasCertificato
                                    ? "Richiede Certificato Medico"
                                    : "Conferma Ricezione Soldi"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="py-4 border-b">
                    <CardTitle className="text-lg">Dati Anagrafici e Contatti</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                        <p className="text-sm font-semibold text-muted-foreground">Data e Luogo di Nascita</p>
                        <p className="font-medium">{new Date(allievo.data_nascita).toLocaleDateString()} a {allievo.luogo_nascita} ({allievo.provincia_nascita})</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-muted-foreground">Residenza</p>
                        <p className="font-medium">{allievo.indirizzo_residenza}, {allievo.cap_residenza} - {allievo.provincia_residenza}</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-muted-foreground">Email</p>
                        <p className="font-medium">{allievo.email || 'Non fornita'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-muted-foreground">Telefono</p>
                        <p className="font-medium">{allievo.telefono || 'Non fornito'}</p>
                    </div>
                    {allievo.is_minore && (
                        <div className="md:col-span-2 mt-2 bg-muted/50 p-3 rounded-md border">
                            <p className="text-sm font-semibold text-muted-foreground mb-1">Dati Tutore Legale</p>
                            <p className="font-medium">{allievo.tutore_nome} {allievo.tutore_cognome}</p>
                            <p className="text-sm">CF: {allievo.tutore_codice_fiscale}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="shadow-sm">
                    <CardHeader className="py-4 border-b flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Firma e Regolamento</CardTitle>
                        {!firmaError && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 align-middle"
                                onClick={async () => {
                                    const imgUrl = supabase.storage.from('firme').getPublicUrl(`firma-${id}.png`).data.publicUrl;
                                    try {
                                        const response = await fetch(imgUrl);
                                        const blob = await response.blob();
                                        const downloadUrl = window.URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = downloadUrl;
                                        link.download = `Firma_${allievo.nome}_${allievo.cognome}.png`;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        window.URL.revokeObjectURL(downloadUrl);
                                    } catch (e) {
                                        console.error("Download fallito, apro in nuova tab", e);
                                        window.open(imgUrl, '_blank');
                                    }
                                }}
                            >
                                <Download className="h-3.5 w-3.5" /> Scarica
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="pt-4 flex justify-center">
                        {!firmaError ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={supabase.storage.from('firme').getPublicUrl(`firma-${id}.png`).data.publicUrl}
                                alt="Firma Studente"
                                className="w-full max-w-sm h-40 object-contain bg-zinc-50 border rounded-lg"
                                onError={() => setFirmaError(true)}
                            />
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">Nessuna firma digitale trovata a sistema.</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader className="py-4 border-b">
                        <div className="flex justify-between items-center w-full">
                            <CardTitle className="text-lg flex flex-wrap sm:items-center gap-2">
                                <span>Certificato Medico</span>
                                {allievo.certificati && allievo.certificati[0]?.data_scadenza && (
                                    <span className={`text-sm font-normal ${new Date(allievo.certificati[0].data_scadenza) < new Date() ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                                        Scad. {new Date(allievo.certificati[0].data_scadenza).toLocaleDateString()}
                                    </span>
                                )}
                            </CardTitle>
                            {allievo.certificati && allievo.certificati[0]?.url_foto && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-1.5"
                                    onClick={async () => {
                                        const imgUrl = supabase.storage.from('certificati').getPublicUrl(allievo.certificati[0].url_foto).data.publicUrl;
                                        try {
                                            const response = await fetch(imgUrl);
                                            const blob = await response.blob();
                                            const downloadUrl = window.URL.createObjectURL(blob);
                                            const link = document.createElement('a');
                                            link.href = downloadUrl;
                                            link.download = `Certificato_${allievo.nome}_${allievo.cognome}.png`; // Try saving as image
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                            window.URL.revokeObjectURL(downloadUrl);
                                        } catch (e) {
                                            console.error("Download fallito, apro in nuova tab", e);
                                            window.open(imgUrl, '_blank');
                                        }
                                    }}
                                >
                                    <Download className="h-3.5 w-3.5" /> Scarica
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {allievo.certificati && allievo.certificati[0]?.url_foto ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={supabase.storage.from('certificati').getPublicUrl(allievo.certificati[0].url_foto).data.publicUrl}
                                alt="Certificato Medico"
                                className="w-full h-40 object-cover cursor-pointer hover:opacity-90 transition-opacity border rounded-lg"
                                onClick={() => window.open(supabase.storage.from('certificati').getPublicUrl(allievo.certificati[0].url_foto).data.publicUrl, '_blank')}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 w-full max-w-sm mx-auto">
                                <p className="text-sm text-destructive font-bold text-center mb-4">Manca il Certificato! Impossibile Saldare.</p>

                                <div className="w-full space-y-3 mb-5">
                                    <label className="text-sm font-semibold text-muted-foreground block text-left">1. Inserisci la Scadenza del Certificato:</label>
                                    <input
                                        type="date"
                                        value={scadenzaInput}
                                        onChange={(e) => setScadenzaInput(e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                        disabled={isUploadingCertificato}
                                    />
                                </div>

                                <label className={`cursor-pointer ${!scadenzaInput ? 'opacity-50 pointer-events-none' : 'hover:bg-primary/90'} bg-primary text-primary-foreground font-semibold px-4 py-3 rounded-md w-full flex justify-center items-center gap-2 transition-colors`}>
                                    {isUploadingCertificato ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                                    {isUploadingCertificato ? "Caricamento in corso..." : "2. Carica o Scatta Foto"}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        className="hidden"
                                        onChange={handleUploadCertificato}
                                        disabled={isUploadingCertificato || !scadenzaInput}
                                    />
                                </label>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Modalifica Corsi Allievo */}
            <Dialog open={isEditCorsiOpen} onOpenChange={setIsEditCorsiOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Modifica Corsi Allievo</DialogTitle>
                        <DialogDescription>
                            Seleziona o deseleziona i corsi a cui l'allievo parteciperà da qui in avanti.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-3 max-h-[50vh] overflow-y-auto">
                        {allCorsi.map(corso => {
                            const isChecked = selectedCorsiIds.includes(corso.id);
                            return (
                                <div 
                                    key={corso.id} 
                                    className={`flex items-center justify-between p-3 rounded-md border cursor-pointer select-none transition-colors ${isChecked ? 'bg-primary/10 border-primary' : 'bg-muted/30 border-border hover:bg-muted'}`}
                                    onClick={() => {
                                        if (isChecked) {
                                            setSelectedCorsiIds(selectedCorsiIds.filter(id => id !== corso.id));
                                        } else {
                                            setSelectedCorsiIds([...selectedCorsiIds, corso.id]);
                                        }
                                    }}
                                >
                                    <span className={`font-semibold ${isChecked ? 'text-primary' : 'text-foreground'}`}>
                                        {corso.nome}
                                    </span>
                                    <span className="text-sm font-medium text-muted-foreground">
                                        {corso.prezzo_standard === 0 ? "In Segreteria" : `€ ${corso.prezzo_standard.toFixed(2)}`}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditCorsiOpen(false)}>Annulla</Button>
                        <Button onClick={handleSaveCorsi} disabled={isSavingCorsi}>
                            {isSavingCorsi ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Salva e Aggiorna"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    )
}

export default function ScannerPage() {
    return (
        <Suspense fallback={
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        }>
            <ScannerContent />
        </Suspense>
    )
}