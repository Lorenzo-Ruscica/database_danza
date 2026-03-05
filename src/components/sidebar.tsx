"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, BookOpen, Receipt, Settings, CheckSquare, QrCode } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
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
]

export function Sidebar() {
    const pathname = usePathname()
    const [scannerOpen, setScannerOpen] = useState(false)

    return (
        <div className="flex flex-col h-full border-r bg-muted/40 pb-4">
            <div className="flex h-14 items-center justify-between border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/admin" className="flex items-center gap-2 font-semibold">
                    <span className="text-xl text-primary font-bold tracking-tight">SD Admin</span>
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

            <AdminQrScanner open={scannerOpen} onOpenChange={setScannerOpen} />

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
                    <CardHeader className="p-4">
                        <CardTitle className="text-sm">Associazione Sportiva</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-xs text-muted-foreground text-balance">
                        Dashboard Gestionale ver 1.0
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
