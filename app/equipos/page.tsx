import Link from "next/link";
import { Monitor, Smartphone, Printer, Plus, Search, ArrowRight, Box, Activity } from "lucide-react";
import { prisma } from "@/lib/prisma";

async function getStats() {
    const [total, sims, consumibles, disponibles] = await Promise.all([
        prisma.equipo.count(),
        prisma.equipoSim.count(),
        prisma.equipoConsumible.count(),
        prisma.equipo.count({
            where: {
                estatus: {
                    nombre: "Disponible"
                }
            }
        })
    ]);

    return { total, sims, consumibles, disponibles };
}

export default async function EquiposPage() {
    const stats = await getStats();

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Inventario de Equipos</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Gestión general del parque informático</p>
                </div>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Hero Card - Total & Search */}
                <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl transition-transform group-hover:scale-110 duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>

                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-blue-100 font-medium mb-1">Total de Activos</p>
                                <h2 className="text-5xl font-bold tracking-tight">{stats.total}</h2>
                            </div>
                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                                <Monitor className="w-8 h-8 text-white" />
                            </div>
                        </div>

                        <div className="mt-8">
                            <form action="/equipos/todos" className="relative max-w-md">
                                <input
                                    type="text"
                                    name="search"
                                    placeholder="Buscar por serie, modelo, asignado..."
                                    className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:bg-white/20 transition-all"
                                />
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-200" />
                            </form>
                            <div className="mt-4 flex gap-4 text-sm font-medium text-blue-100">
                                <Link href="/equipos/todos" className="flex items-center gap-1 hover:text-white transition-colors">
                                    Ver listado completo <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Action - Add New */}
                <Link href="/equipos/nuevo" className="group relative bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-gray-200 dark:border-zinc-800 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-center items-center text-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Plus className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Registrar Equipo</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Dar de alta un nuevo activo en el inventario</p>
                </Link>
            </div>

            {/* Secondary Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* SIMs Card */}
                <Link href="/equipos/sims" className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                            <Smartphone className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="flex items-center text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                            Activos
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.sims}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Tarjetas SIM</p>
                </Link>

                {/* Consumibles Card */}
                <Link href="/equipos/consumibles" className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 transition-colors">
                            <Printer className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.consumibles}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Consumibles</p>
                </Link>

                {/* Disponibles Card */}
                <Link href="/equipos/todos?estatusId=1" className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                            <Box className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.disponibles}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Equipos Disponibles</p>
                </Link>

                {/* Activity Card (Placeholder for future) */}
                <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 border-dashed flex flex-col justify-center items-center text-center">
                    <Activity className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Más estadísticas pronto</p>
                </div>
            </div>
        </div>
    );
}
