"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, BookOpen, Receipt, CheckSquare, Mail } from "lucide-react"
import { cn } from "@/lib/utils"

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
        label: "Presenze",
        icon: CheckSquare,
        href: "/admin/presenze",
    },
    {
        label: "Messaggi",
        icon: Mail,
        href: "/admin/comunicazioni",
    },
]

export function MobileBottomNav() {
    const pathname = usePathname()

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border shadow-[0_-5px_20px_-15px_rgba(0,0,0,0.3)] pb-2 pt-1">
            <div className="flex items-center justify-around h-16 w-full">
                {routes.map((route) => {
                    const isActive = pathname === route.href
                    return (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all",
                                isActive
                                    ? "text-primary scale-105"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <route.icon
                                className={cn(
                                    "h-6 w-6 transition-all",
                                    isActive ? "stroke-[2.5px]" : "stroke-2"
                                )}
                            />
                            <span className={cn(
                                "text-[10px] font-medium leading-none",
                                isActive ? "font-bold" : ""
                            )}>
                                {route.label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
