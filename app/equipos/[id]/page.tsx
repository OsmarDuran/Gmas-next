import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "lucide-react"; // Placeholder, we'll use simple divs or badges
import Link from "next/link";

async function getEquipo(id: number) {
    const equipo = await prisma.equipo.findUnique({
        where: { id },
        include: {
            tipo: true,
            modelo: {
                include: {
                    marcaTipo: {
                        include: {
                            marca: true,
                            tipo: true
                        }
                    }
                }
            },
            ubicacion: true,
            estatus: true,
            sim: true,
            consumible: {
                include: { color: true }
            },
            asignaciones: {
                include: {
                    usuario: true,
                    asignador: true
                },
                orderBy: {
                    asignadoEn: 'desc'
                }
            }
        }
    });

    if (!equipo) return null;
    return equipo;
}

export default async function EquipoDetallesPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    if (isNaN(id)) notFound();

    const equipo = await getEquipo(id);
    if (!equipo) notFound();

    const asignacionActiva = equipo.asignaciones.find(a => a.devueltoEn === null);
    const historialAsignaciones = equipo.asignaciones;

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                    Detalles del Equipo #{equipo.id}
                </h1>
                <Link
                    href={`/equipos/${equipo.id}/editar`}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                    Editar
                </Link>
            </div>

            {/* Información General */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white border-b pb-2 dark:border-zinc-800">
                    Información General
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tipo</p>
                        <p className="font-medium text-gray-900 dark:text-white">{equipo.tipo.nombre}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Marca</p>
                        <p className="font-medium text-gray-900 dark:text-white">{equipo.modelo?.marcaTipo.marca.nombre || "-"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Modelo</p>
                        <p className="font-medium text-gray-900 dark:text-white">{equipo.modelo?.nombre || "-"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Número de Serie / ID</p>
                        <p className="font-mono text-gray-900 dark:text-white">{equipo.numeroSerie || "-"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Ubicación</p>
                        <p className="font-medium text-gray-900 dark:text-white">{equipo.ubicacion?.nombre || "-"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Estatus</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${equipo.estatus.nombre === 'Disponible' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            equipo.estatus.nombre === 'Asignado' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                            }`}>
                            {equipo.estatus.nombre}
                        </span>
                    </div>
                    {equipo.ipFija && (
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">IP Fija</p>
                            <p className="font-mono text-gray-900 dark:text-white">{equipo.ipFija}</p>
                        </div>
                    )}
                    {equipo.puertoEthernet && (
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Puerto Ethernet</p>
                            <p className="font-mono text-gray-900 dark:text-white">{equipo.puertoEthernet}</p>
                        </div>
                    )}
                </div>
                {equipo.notas && (
                    <div className="mt-6">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Notas</p>
                        <p className="text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">{equipo.notas}</p>
                    </div>
                )}
            </div>

            {/* Detalles Específicos (SIM / Consumible) */}
            {equipo.sim && (
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white border-b pb-2 dark:border-zinc-800">
                        Detalles de SIM
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Número Asignado</p>
                            <p className="font-medium text-gray-900 dark:text-white">{equipo.sim.numeroAsignado}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">IMEI</p>
                            <p className="font-mono text-gray-900 dark:text-white">{equipo.sim.imei}</p>
                        </div>
                    </div>
                </div>
            )}

            {equipo.consumible && (
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white border-b pb-2 dark:border-zinc-800">
                        Detalles de Consumible
                    </h2>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Color</p>
                        <div className="flex items-center gap-2 mt-1">
                            <div
                                className="w-6 h-6 rounded-full border border-gray-300 shadow-sm"
                                style={{ backgroundColor: mapColor(equipo.consumible.color.nombre) }}
                            ></div>
                            <span className="font-medium text-gray-900 dark:text-white">{equipo.consumible.color.nombre}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Asignación Activa */}
            {asignacionActiva && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-300 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        Asignación Activa
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm text-blue-600 dark:text-blue-400">Usuario Asignado</p>
                            <p className="font-medium text-gray-900 dark:text-white text-lg">
                                {asignacionActiva.usuario.nombre} {asignacionActiva.usuario.apellidoPaterno}
                            </p>
                            <p className="text-sm text-gray-500">{asignacionActiva.usuario.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-blue-600 dark:text-blue-400">Fecha de Asignación</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                                {format(new Date(asignacionActiva.asignadoEn), "dd 'de' MMMM, yyyy", { locale: es })}
                            </p>
                            <p className="text-sm text-gray-500">
                                {format(new Date(asignacionActiva.asignadoEn), "HH:mm 'hrs'", { locale: es })}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-blue-600 dark:text-blue-400">Asignado Por</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                                {asignacionActiva.asignador.nombre} {asignacionActiva.asignador.apellidoPaterno}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Historial de Asignaciones */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white border-b pb-2 dark:border-zinc-800">
                    Historial de Asignaciones
                </h2>
                {historialAsignaciones.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-zinc-800 dark:text-gray-400">
                                <tr>
                                    <th className="px-4 py-3">Usuario</th>
                                    <th className="px-4 py-3">Fecha Inicio</th>
                                    <th className="px-4 py-3">Fecha Devolución</th>
                                    <th className="px-4 py-3">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historialAsignaciones.map((asignacion) => (
                                    <tr key={asignacion.id} className="border-b dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                            {asignacion.usuario.nombre} {asignacion.usuario.apellidoPaterno}
                                        </td>
                                        <td className="px-4 py-3">
                                            {format(new Date(asignacion.asignadoEn), "dd/MM/yyyy HH:mm", { locale: es })}
                                        </td>
                                        <td className="px-4 py-3">
                                            {asignacion.devueltoEn
                                                ? format(new Date(asignacion.devueltoEn), "dd/MM/yyyy HH:mm", { locale: es })
                                                : "-"
                                            }
                                        </td>
                                        <td className="px-4 py-3">
                                            {asignacion.devueltoEn ? (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Devuelto</span>
                                            ) : (
                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Activo</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">Este equipo no tiene historial de asignaciones.</p>
                )}
            </div>
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
