import { Sidebar } from "@/components/sidebar"
import { MobileHeader } from "@/components/admin/mobile-header"
import { MobileBottomNav } from "@/components/admin/mobile-bottom-nav"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col lg:grid min-h-screen w-full lg:grid-cols-[240px_1fr] xl:grid-cols-[280px_1fr]">

            {/* Navigazione Desktop */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            <div className="flex flex-col min-h-screen pb-16 lg:pb-0 relative">

                {/* Header Desktop */}
                <header className="hidden lg:flex h-14 items-center gap-4 border-b bg-muted/40 px-4 xl:h-[60px] xl:px-6">
                    <div className="w-full flex-1">
                        {/* Breadcrumbs or additional header items could go here */}
                    </div>
                </header>

                {/* Header Mobile Incollato in Alt */}
                <MobileHeader />

                <main className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:gap-6 lg:p-6 mb-16 lg:mb-0 max-w-[100vw] overflow-x-hidden">
                    {children}
                </main>

                {/* Navigazione Sticky in Basso Mobile */}
                <MobileBottomNav />
            </div>
        </div>
    )
}
