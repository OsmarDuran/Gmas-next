import { useAuth } from "@/app/context/AuthProvider";
import { usePathname } from "next/navigation";
import { NotificationsMenu } from "./NotificationsMenu";

export function Navbar() {
    const { user } = useAuth();
    const pathname = usePathname();

    const getTitle = () => {
        if (pathname.startsWith("/mis-equipos")) return "Mis Equipos";
        if (pathname.startsWith("/usuarios")) return "Gestión de Usuarios";
        if (pathname.startsWith("/equipos")) return "Inventario de Equipos";
        if (pathname.startsWith("/asignaciones")) return "Asignaciones";
        if (pathname.startsWith("/catalogos")) return "Catálogos";
        if (pathname === "/dashboard") return "Dashboard";
        return "GMAS 2.0";
    };

    return (
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:bg-zinc-900 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{getTitle()}</h2>
            <div className="flex items-center gap-4">
                <NotificationsMenu />
                {user ? (
                    <>
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                            {user.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.nombre}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.rol}</span>
                        </div>
                    </>
                ) : (
                    <span className="text-sm text-gray-500">No conectado</span>
                )}
            </div>
        </header>
    );
}
