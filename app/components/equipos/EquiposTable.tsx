import { Equipo, TipoEquipo, Modelo, Ubicacion, Estatus, EquipoSim, EquipoConsumible, Color, Marca, MarcaTipo } from "@prisma/client";
import Link from "next/link";
import { Eye, Edit2, Smartphone, Printer, Laptop, Box, MapPin, Hash, Circle } from "lucide-react";

// Tipos extendidos con includes
type EquipoWithRelations = Equipo & {
    tipo: TipoEquipo;
    modelo: (Modelo & {
        marcaTipo: {
            marca: Marca;
            tipo: TipoEquipo;
        }
    }) | null;
    ubicacion: Ubicacion | null;
    estatus: Estatus;
    sim: EquipoSim | null;
    consumible: (EquipoConsumible & { color: Color }) | null;
};

interface EquiposTableProps {
    equipos: EquipoWithRelations[];
}

export function EquiposTable({ equipos }: EquiposTableProps) {
    if (equipos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-dashed border-gray-300 dark:border-zinc-700">
                <div className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-full mb-4">
                    <Box className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No se encontraron equipos</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
                    Intenta ajustar los filtros de búsqueda o agrega un nuevo equipo al inventario.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-hidden rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl shadow-xl">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-zinc-800">
                        <tr>
                            <th className="px-6 py-4">Equipo</th>
                            <th className="px-6 py-4">Serie / ID</th>
                            <th className="px-6 py-4">Ubicación</th>
                            <th className="px-6 py-4">Estatus</th>
                            <th className="px-6 py-4">Detalles</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {equipos.map((equipo) => (
                            <tr
                                key={equipo.id}
                                className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors duration-200"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${getIconBgColor(equipo.tipo.nombre)}`}>
                                            {getIcon(equipo.tipo.nombre)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {equipo.modelo?.nombre || equipo.tipo.nombre}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {equipo.modelo?.marcaTipo.marca.nombre || "Sin marca"}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 font-mono text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded w-fit">
                                        <Hash className="w-3 h-3 text-gray-400" />
                                        {equipo.numeroSerie || "N/A"}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                        {equipo.ubicacion?.nombre || "Sin ubicación"}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={equipo.estatus.nombre} />
                                </td>
                                <td className="px-6 py-4">
                                    {equipo.sim && (
                                        <div className="text-xs space-y-0.5">
                                            <div className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                                <Smartphone className="w-3 h-3" />
                                                {equipo.sim.numeroAsignado}
                                            </div>
                                            <div className="text-gray-400 pl-4">IMEI: {equipo.sim.imei}</div>
                                        </div>
                                    )}
                                    {equipo.consumible && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <div
                                                className="w-3 h-3 rounded-full border border-gray-200 dark:border-zinc-700 shadow-sm"
                                                style={{ backgroundColor: mapColor(equipo.consumible.color.nombre) }}
                                            />
                                            <span className="text-gray-600 dark:text-gray-300">{equipo.consumible.color.nombre}</span>
                                        </div>
                                    )}
                                    {!equipo.sim && !equipo.consumible && (
                                        <span className="text-xs text-gray-400 italic">--</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link
                                            href={`/equipos/${equipo.id}`}
                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            title="Ver detalles"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                        <Link
                                            href={`/equipos/${equipo.id}/editar`}
                                            className="p-2 text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {equipos.map((equipo) => (
                    <div key={equipo.id} className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${getIconBgColor(equipo.tipo.nombre)}`}>
                                    {getIcon(equipo.tipo.nombre)}
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        {equipo.modelo?.nombre || equipo.tipo.nombre}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {equipo.modelo?.marcaTipo.marca.nombre || "Sin marca"}
                                    </div>
                                </div>
                            </div>
                            <StatusBadge status={equipo.estatus.nombre} />
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-gray-50 dark:bg-zinc-800/50 p-2 rounded-lg">
                                <span className="text-xs text-gray-400 block mb-1">Serie</span>
                                <span className="font-mono text-gray-700 dark:text-gray-300">{equipo.numeroSerie || "N/A"}</span>
                            </div>
                            <div className="bg-gray-50 dark:bg-zinc-800/50 p-2 rounded-lg">
                                <span className="text-xs text-gray-400 block mb-1">Ubicación</span>
                                <span className="text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {equipo.ubicacion?.nombre || "-"}
                                </span>
                            </div>
                        </div>

                        {(equipo.sim || equipo.consumible) && (
                            <div className="pt-3 border-t border-gray-100 dark:border-zinc-800">
                                {equipo.sim && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Línea:</span>
                                        <span className="font-medium">{equipo.sim.numeroAsignado}</span>
                                    </div>
                                )}
                                {equipo.consumible && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Color:</span>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full border border-gray-200"
                                                style={{ backgroundColor: mapColor(equipo.consumible.color.nombre) }}
                                            />
                                            <span>{equipo.consumible.color.nombre}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                            <Link
                                href={`/equipos/${equipo.id}`}
                                className="flex-1 py-2 text-center text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg"
                            >
                                Ver Detalles
                            </Link>
                            <Link
                                href={`/equipos/${equipo.id}/editar`}
                                className="w-10 flex items-center justify-center text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 rounded-lg"
                            >
                                <Edit2 className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        'Disponible': 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
        'Asignado': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
        'En Reparación': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
        'Baja': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
        'default': 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
    };

    const style = styles[status as keyof typeof styles] || styles.default;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
            <Circle className="w-1.5 h-1.5 mr-1.5 fill-current" />
            {status}
        </span>
    );
}

function getIcon(tipo: string) {
    const t = tipo.toLowerCase();
    if (t.includes('sim')) return <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
    if (t.includes('laptop') || t.includes('pc')) return <Laptop className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    if (t.includes('impresora') || t.includes('consumible') || t.includes('toner')) return <Printer className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
    return <Box className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
}

function getIconBgColor(tipo: string) {
    const t = tipo.toLowerCase();
    if (t.includes('sim')) return 'bg-purple-100 dark:bg-purple-900/30';
    if (t.includes('laptop') || t.includes('pc')) return 'bg-blue-100 dark:bg-blue-900/30';
    if (t.includes('impresora') || t.includes('consumible') || t.includes('toner')) return 'bg-amber-100 dark:bg-amber-900/30';
    return 'bg-gray-100 dark:bg-gray-800';
}

function mapColor(nombre: string) {
    const map: Record<string, string> = {
        'Negro': '#000000',
        'Cian': '#00FFFF',
        'Magenta': '#FF00FF',
        'Amarillo': '#FFFF00'
    };
    return map[nombre] || '#CCCCCC';
}
