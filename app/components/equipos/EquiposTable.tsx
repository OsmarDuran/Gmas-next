import { Equipo, TipoEquipo, Modelo, Ubicacion, Estatus, EquipoSim, EquipoConsumible, Color, Marca, MarcaTipo } from "@prisma/client";
import Link from "next/link";
import { Eye } from "lucide-react";

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
    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-zinc-800">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-zinc-900 dark:text-gray-400">
                    <tr>
                        <th className="px-6 py-3">ID</th>
                        <th className="px-6 py-3">Tipo</th>
                        <th className="px-6 py-3">Modelo / Marca</th>
                        <th className="px-6 py-3">Serie / Identificador</th>
                        <th className="px-6 py-3">Ubicación</th>
                        <th className="px-6 py-3">Estatus</th>
                        <th className="px-6 py-3">Detalles</th>
                        <th className="px-6 py-3">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {equipos.map((equipo) => (
                        <tr key={equipo.id} className="bg-white border-b dark:bg-zinc-950 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-900">
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">#{equipo.id}</td>
                            <td className="px-6 py-4">{equipo.tipo.nombre}</td>
                            <td className="px-6 py-4">
                                {equipo.modelo ? (
                                    <div className="flex flex-col">
                                        <span className="font-medium">{equipo.modelo.nombre}</span>
                                        <span className="text-xs text-gray-400">{equipo.modelo.marcaTipo.marca.nombre}</span>
                                    </div>
                                ) : "-"}
                            </td>
                            <td className="px-6 py-4 font-mono text-xs">
                                {equipo.numeroSerie || "-"}
                            </td>
                            <td className="px-6 py-4">{equipo.ubicacion?.nombre || "-"}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${equipo.estatus.nombre === 'Disponible' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                        equipo.estatus.nombre === 'Asignado' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                    }`}>
                                    {equipo.estatus.nombre}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-xs">
                                {equipo.sim && (
                                    <div>
                                        <div className="font-semibold">Tel: {equipo.sim.numeroAsignado}</div>
                                        <div className="text-gray-400">IMEI: {equipo.sim.imei}</div>
                                    </div>
                                )}
                                {equipo.consumible && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: mapColor(equipo.consumible.color.nombre) }}></div>
                                        {equipo.consumible.color.nombre}
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4 flex gap-2">
                                <Link href={`/equipos/${equipo.id}`} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                    <Eye className="w-4 h-4" />
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
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
