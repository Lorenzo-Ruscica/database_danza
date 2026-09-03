"use client"

import { useKioskStore } from "@/store/kiosk-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, FileText, Info, ShieldCheck } from "lucide-react"

export default function Step4Corsi() {
    const { accettoCondizioni, setAccettoCondizioni, nextStep, prevStep } = useKioskStore()

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Titolo e Sottotitolo */}
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold flex items-center justify-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    4. Condizioni di Iscrizione
                </h2>
                <p className="text-muted-foreground text-lg">
                    Prendi visione delle condizioni e conferma per procedere con l'iscrizione.
                </p>
            </div>

            {/* Estratto del Regolamento */}
            <div className="bg-card/70 backdrop-blur-md rounded-2xl p-6 border shadow-sm space-y-3 text-left">
                <h3 className="font-semibold text-base md:text-lg text-foreground flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Regolamento Generale della Scuola
                </h3>
                <ul className="space-y-2 text-sm md:text-base text-muted-foreground leading-relaxed list-disc list-inside">
                    <li>La frequenza alle lezioni è subordinata al regolare versamento della quota di iscrizione e dei corsi assegnati.</li>
                    <li>È obbligatorio presentare un <strong>Certificato Medico di idoneità sportiva</strong> in corso di validità.</li>
                    <li>Tutti gli allievi sono tenuti al rispetto degli orari, dei locali e del regolamento interno della scuola.</li>
                    <li>L'iscrizione ha validità per la stagione sportiva e accademica in corso.</li>
                </ul>
            </div>

            {/* Spunta di Accettazione Condizioni */}
            <Card
                className={`cursor-pointer transition-all active:scale-[0.99] border-2 select-none ${
                    accettoCondizioni
                        ? 'bg-primary/5 border-primary shadow-md active-gold-border'
                        : 'bg-card border-border hover:border-primary/50'
                }`}
                onClick={() => setAccettoCondizioni(!accettoCondizioni)}
            >
                <CardContent className="flex items-center justify-between p-6">
                    <div className="space-y-1 text-left pr-4">
                        <h4 className={`font-bold text-lg md:text-xl ${accettoCondizioni ? 'text-primary' : 'text-foreground'}`}>
                            Accetto le condizioni di iscrizione
                        </h4>
                        <p className="text-sm text-muted-foreground">
                            Dichiaro di aver preso visione e di accettare integralmente le condizioni sopra riportate e il regolamento della scuola.
                        </p>
                    </div>

                    <div
                        className={`h-11 w-11 md:h-12 md:w-12 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all ${
                            accettoCondizioni
                                ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                                : 'border-muted-foreground/30 bg-background'
                        }`}
                    >
                        {accettoCondizioni && <Check className="h-6 w-6 stroke-[3px]" />}
                    </div>
                </CardContent>
            </Card>

            {/* Avviso Selezione Corsi in Segreteria */}
            <div className="bg-[#5bbfe0]/10 dark:bg-[#0d4d66]/40 rounded-2xl p-5 md:p-6 border-2 border-[#5bbfe0]/30 flex items-start gap-4 text-left">
                <div className="bg-[#1a8fb5] text-white p-3 rounded-xl shrink-0 mt-0.5 shadow-sm">
                    <Info className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                    <h4 className="font-bold text-base md:text-lg text-foreground">
                        La selezione del corso si fa in Segreteria
                    </h4>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        L'assegnazione, la scelta della disciplina e il piano orario del tuo corso (o dei tuoi corsi) verranno definiti e registrati direttamente dal personale in segreteria all'arrivo alla cassa, contestualmente alla presentazione del certificato medico.
                    </p>
                </div>
            </div>

            {/* Pulsanti di Navigazione */}
            <div className="flex justify-between pt-4 border-t mt-2">
                <Button
                    variant="outline"
                    size="lg"
                    className="h-16 px-8 text-xl"
                    onClick={prevStep}
                >
                    Indietro
                </Button>
                <Button
                    size="lg"
                    className="h-16 px-12 text-xl font-bold shadow-md"
                    onClick={nextStep}
                    disabled={!accettoCondizioni}
                >
                    Vai alla Firma
                </Button>
            </div>
        </div>
    )
}
