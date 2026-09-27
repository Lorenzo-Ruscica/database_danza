"use client"

import { useKioskStore } from "@/store/kiosk-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, FileText, Info, ShieldCheck } from "lucide-react"

export default function Step4Corsi() {
    const { accettoCondizioni, setAccettoCondizioni, nextStep, prevStep } = useKioskStore()

    return (
        <div className="flex flex-col gap-5 sm:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Titolo e Sottotitolo */}
            <div className="text-center space-y-1 sm:space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold flex items-center justify-center gap-2 sm:gap-3">
                    <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
                    4. Condizioni di Iscrizione
                </h2>
                <p className="text-muted-foreground text-sm sm:text-lg">
                    Prendi visione delle condizioni e conferma per procedere con l'iscrizione.
                </p>
            </div>

            {/* Estratto del Regolamento */}
            <div className="bg-card/70 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border shadow-sm space-y-2 sm:space-y-3 text-left">
                <h3 className="font-semibold text-sm sm:text-lg text-foreground flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                    Regolamento Generale della Scuola
                </h3>
                <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-base text-muted-foreground leading-relaxed list-disc list-inside">
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
                <CardContent className="flex items-center justify-between p-4 sm:p-6">
                    <div className="space-y-1 text-left pr-3 sm:pr-4">
                        <h4 className={`font-bold text-base sm:text-xl ${accettoCondizioni ? 'text-primary' : 'text-foreground'}`}>
                            Accetto le condizioni di iscrizione
                        </h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Dichiaro di aver preso visione e di accettare integralmente le condizioni sopra riportate e il regolamento della scuola.
                        </p>
                    </div>

                    <div
                        className={`h-9 w-9 sm:h-12 sm:w-12 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all ${
                            accettoCondizioni
                                ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                                : 'border-muted-foreground/30 bg-background'
                        }`}
                    >
                        {accettoCondizioni && <Check className="h-5 w-5 sm:h-6 sm:w-6 stroke-[3px]" />}
                    </div>
                </CardContent>
            </Card>

            {/* Avviso Selezione Corsi in Segreteria */}
            <div className="bg-[#5bbfe0]/10 dark:bg-[#0d4d66]/40 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-[#5bbfe0]/30 flex items-start gap-3 sm:gap-4 text-left">
                <div className="bg-[#1a8fb5] text-white p-2.5 sm:p-3 rounded-xl shrink-0 mt-0.5 shadow-sm">
                    <Info className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="space-y-1">
                    <h4 className="font-bold text-sm sm:text-lg text-foreground">
                        La selezione del corso si fa in Segreteria
                    </h4>
                    <p className="text-xs sm:text-base text-muted-foreground leading-relaxed">
                        L'assegnazione, la scelta della disciplina e il piano orario del tuo corso (o dei tuoi corsi) verranno definiti e registrati direttamente dal personale in segreteria all'arrivo alla cassa, contestualmente alla presentazione del certificato medico.
                    </p>
                </div>
            </div>

            {/* Pulsanti di Navigazione */}
            <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-4 border-t mt-2">
                <Button
                    variant="outline"
                    size="lg"
                    className="h-13 sm:h-16 px-6 sm:px-8 text-base sm:text-xl w-full sm:w-auto"
                    onClick={prevStep}
                >
                    Indietro
                </Button>
                <Button
                    size="lg"
                    className="h-13 sm:h-16 px-8 sm:px-12 text-base sm:text-xl font-bold shadow-md w-full sm:w-auto"
                    onClick={nextStep}
                    disabled={!accettoCondizioni}
                >
                    Vai alla Firma
                </Button>
            </div>
        </div>
    )
}
