"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // Rutas donde no queremos mostrar la estructura de dashboard
    const hideLayoutRoutes = ["/login", "/register", "/"];

    const shouldHideLayout = hideLayoutRoutes.includes(pathname);

    if (shouldHideLayout) {
        return <div className="h-screen w-full overflow-auto">{children}</div>;
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
