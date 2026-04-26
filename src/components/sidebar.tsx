"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { Users, BookOpen, Receipt, Settings, CheckSquare, QrCode, Mail } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AdminQrScanner } from "@/components/admin/qr-scanner"

const routes = [
    {
        label: "Allievi",
        icon: Users,
        href: "/admin/allievi",
    },
    {
        label: "Corsi",
        icon: BookOpen,
        href: "/admin/corsi",
    },
    {
        label: "Contabilità",
        icon: Receipt,
        href: "/admin/contabilita",
    },
    {
        label: "Presenze (iPad)",
        icon: CheckSquare,
        href: "/admin/presenze",
    },
    {
        label: "Comunicazioni",
        icon: Mail,
        href: "/admin/comunicazioni",
    },
]

export function Sidebar() {
    const pathname = usePathname()
    const [scannerOpen, setScannerOpen] = useState(false)

    return (
        <div className="flex flex-col h-full border-r bg-muted/40 pb-4">
            <div className="flex h-14 items-center justify-between border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/admin" className="flex items-center gap-2 font-semibold">
                    <Image src="/logo_Bigdance.png" alt="BigDance Logo" width={120} height={40} className="object-contain dark:brightness-200" priority />
                </Link>

                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-8 w-8 ml-auto"
                    onClick={() => setScannerOpen(true)}
                    title="Scannerizza Tessera Allievo"
                >
                    <QrCode className="h-4 w-4 text-primary" />
                </Button>
            </div>

            <AdminQrScanner open={scannerOpen} onOpenChange={setScannerOpen} mode="segreteria" />

            <div className="flex-1 overflow-auto py-2">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                pathname === route.href ? "bg-muted text-primary" : ""
                            )}
                        >
                            <route.icon className="h-4 w-4" />
                            {route.label}
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="mt-auto p-4">
                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm">BIGDANCESCHOOL</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 flex flex-col gap-2">
                        <p className="text-xs text-muted-foreground text-balance">
                            Dashboard Gestionale v0.20.0
                        </p>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="w-full text-xs h-7">Changelog Aggiornamenti</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Changelog Aggiornamenti</DialogTitle>
                                    <DialogDescription>Storico delle funzionalità introdotte nella piattaforma.</DialogDescription>
                                </DialogHeader>
                                <div className="max-h-[60vh] overflow-y-auto pr-4 text-sm space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-primary mb-1">v0.20.0 (Oggi)</h4>
                                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                            <li>Design PDF Tessera aggiornato a "Badge orizzontale" professionale.</li>
                                            <li>Applicati i colori del database aziendale al PDF e ai Template Email.</li>
                                            <li>Integrazione globale del logo ufficiale "BIGDANCESCHOOL".</li>
                                            <li>Implementata la logica di inattività intelligente per il Totem (non si riavvia a vuoto).</li>
                                            <li>Aggiunto il pannello Changelog per la tracciabilità delle versioni.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-primary mb-1">v0.19.0</h4>
                                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                            <li>Implementazione generazione lato server del PDF (Tessera) inviato via email.</li>
                                            <li>Integrazione architettura "pdf-lib" per creare attestati e file dinamici in tempo reale.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-primary mb-1">v0.18.5</h4>
                                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                            <li>Calcolo dell'età dinamico per i minorenni nel Totem.</li>
                                            <li>Sezione Tutore resa obbligatoria con blocco automatico per gli under-18.</li>
                                            <li>Restyling Registro Presenze Cartaceo: layout pulito con caselle di spunta manuali per l'insegnante.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-primary mb-1">v0.16.0</h4>
                                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                            <li>Pulsante "Nuovo Allievo" dalla dashboard segreteria collegato direttamente al Totem di registrazione.</li>
                                            <li>Correzione bug di refresh sull'eliminazione sicura degli allievi dal database.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-primary mb-1">v0.15.0</h4>
                                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                            <li>Modulo Scanner QR-Code per l'ingresso rapido in Segreteria.</li>
                                            <li>Acquisizione automatica dei dati dal QR Code e caricamento scheda rapido.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-primary mb-1">v0.10.0</h4>
                                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                            <li>Creazione del Totem Iscrizioni per Tablet/iPad.</li>
                                            <li>Acquisizione Firma Digitale direttamente da schermo touch.</li>
                                            <li>Integrazione Supabase per archiviazione sicura firme e documenti.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-primary mb-1">v0.5.0</h4>
                                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                            <li>Gestione completa anagrafica allievi (modifica corsi, pagamenti, stato quote).</li>
                                            <li>Invio email transazionali SMTP (Ricevute, Iscrizioni, QR provvisori).</li>
                                            <li>Registrazione presenze digitale.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-primary mb-1">v0.1.0</h4>
                                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                            <li>Lancio architettura base del gestionale BIGDANCESCHOOL.</li>
                                            <li>Configurazione Database Relazionale per Allievi, Corsi e Pagamenti.</li>
                                        </ul>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
