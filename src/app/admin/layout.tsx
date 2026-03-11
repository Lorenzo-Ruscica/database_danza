import { Sidebar } from "@/components/sidebar"
import { MobileHeader } from "@/components/admin/mobile-header"
import { MobileBottomNav } from "@/components/admin/mobile-bottom-nav"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col md:grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">

            {/* Navigazione Desktop */}
            <div className="hidden md:block">
                <Sidebar />
            </div>

            <div className="flex flex-col min-h-screen pb-16 md:pb-0 relative">

                {/* Header Desktop */}
                <header className="hidden md:flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                    <div className="w-full flex-1">
                        {/* Breadcrumbs or additional header items could go here */}
                    </div>
                </header>

                {/* Header Mobile Incollato in Alt */}
                <MobileHeader />

                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 mb-16 md:mb-0 max-w-[100vw] overflow-x-hidden">
                    {children}
                </main>

                {/* Navigazione Sticky in Basso Mobile */}
                <MobileBottomNav />
            </div>
        </div>
    )
}
