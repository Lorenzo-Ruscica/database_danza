"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminPage() {
    const router = useRouter()

    useEffect(() => {
        // Redirige automaticamente alla sezione "Allievi"
        router.push("/admin/allievi")
    }, [router])

    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <p className="text-muted-foreground animate-pulse">Caricamento Dashboard...</p>
        </div>
    )
}
