import { Usuario, Rol, Puesto, Centro, Lider } from "@prisma/client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type UsuarioWithCount = Usuario & {
    rol: Rol;
    puesto: Puesto | null;
    centro: Centro | null;
    lider: Lider | null;
    _count: {
        asignaciones: number;
    };
};

interface UsuariosAsignacionTableProps {
    usuarios: UsuarioWithCount[];
}

export function UsuariosAsignacionTable({ usuarios }: UsuariosAsignacionTableProps) {
    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-zinc-800">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-zinc-900 dark:text-gray-400">
                    <tr>
                        <th className="px-6 py-3">Nombre</th>
                        <th className="px-6 py-3">Puesto</th>
                        <th className="px-6 py-3">Centro</th>
                        <th className="px-6 py-3 text-center">Equipos Asignados</th>
                        <th className="px-6 py-3 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map((usuario) => (
                        <tr key={usuario.id} className="bg-white border-b dark:bg-zinc-950 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-900">
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                {usuario.nombre} {usuario.apellidoPaterno} {usuario.apellidoMaterno}
                            </td>
                            <td className="px-6 py-4">{usuario.puesto?.nombre || 'Sin Puesto'}</td>
                            <td className="px-6 py-4">{usuario.centro?.nombre || 'Sin Centro'}</td>
                            <td className="px-6 py-4 text-center">
                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${usuario._count.asignaciones > 0
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                    }`}>
                                    {usuario._count.asignaciones}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <Link
                                    href={`/asignaciones/usuarios/${usuario.id}`}
                                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                >
                                    Gestionar
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
