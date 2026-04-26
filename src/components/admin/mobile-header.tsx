"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { QrCode } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AdminQrScanner } from "@/components/admin/qr-scanner"

export function MobileHeader() {
    const [scannerOpen, setScannerOpen] = useState(false)

    return (
        <header className="md:hidden flex h-14 items-center justify-between border-b bg-background px-4 sticky top-0 z-30 w-full shadow-sm">
            <Link href="/admin" className="flex items-center gap-2 font-semibold">
                <Image src="/logo_Bigdance.png" alt="BigDance Logo" width={110} height={35} className="object-contain dark:brightness-200" priority />
            </Link>

            <Button
                variant="default"
                size="icon"
                className="rounded-full shadow-md h-9 w-9"
                onClick={() => setScannerOpen(true)}
                title="Scannerizza Tessera Allievo"
            >
                <QrCode className="h-5 w-5" />
            </Button>

            <AdminQrScanner open={scannerOpen} onOpenChange={setScannerOpen} mode="segreteria" />
        </header>
    )
}
