"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, ArrowRight, Loader2 } from "lucide-react"

export default function LoginPage() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })

            if (res.ok) {
                router.push("/admin")
                router.refresh()
            } else {
                const data = await res.json()
                setError(data.error || "Credenziali errate")
            }
        } catch (err) {
            setError("Errore di connessione")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-primary/10 p-4 rounded-full mb-5 shadow-inner">
                        <Lock className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-center">Area Riservata</h1>
                    <p className="text-sm text-muted-foreground mt-2 text-center text-balance">
                        Inserisci le tue credenziali di amministrazione per accedere al gestionale.
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Nome utente (es. admin)"
                            className="w-full px-5 py-4 rounded-xl border focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:bg-zinc-950 dark:border-zinc-800 font-medium"
                            autoFocus
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Inserisci password..."
                            className="w-full px-5 py-4 rounded-xl border focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:bg-zinc-950 dark:border-zinc-800 font-medium"
                        />
                    </div>
                    {error && (
                        <div className="bg-destructive/10 text-destructive text-sm font-semibold text-center p-3 rounded-lg border border-destructive/20">
                            {error}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={isLoading || !password}
                        className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-md"
                    >
                        {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                            <>Entra <ArrowRight className="h-5 w-5" /></>
                        )}
                    </button>

                    <div className="text-center mt-6">
                        <button
                            type="button"
                            onClick={() => router.push('/')}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                        >
                            Torna al Totem Iscrizioni
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
