import Link from "next/link";
import { Users, Monitor } from "lucide-react";

export default function AsignacionesPage() {
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Asignaciones</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/asignaciones/usuarios" className="group">
                    <div className="h-full p-8 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all">
                        <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                            <Users className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Por Usuario</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Gestionar equipos asignados a cada empleado. Generar resguardos.
                        </p>
                    </div>
                </Link>

                <div className="group opacity-50 pointer-events-none">
                    <div className="h-full p-8 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400">
                            <Monitor className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Por Equipo</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Ver historial de asignaciones de un equipo específico. (Próximamente)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
