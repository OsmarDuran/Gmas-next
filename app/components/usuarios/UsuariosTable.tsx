import { Usuario, Rol, Puesto, Centro, Lider } from "@prisma/client";
import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";

type UsuarioWithRelations = Usuario & {
    rol: Rol;
    puesto: Puesto | null;
    centro: Centro | null;
    lider: Lider | null;
};

interface UsuariosTableProps {
    usuarios: UsuarioWithRelations[];
}

export function UsuariosTable({ usuarios }: UsuariosTableProps) {
    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-zinc-800">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-zinc-900 dark:text-gray-400">
                    <tr>
                        <th className="px-6 py-3">Nombre</th>
                        <th className="px-6 py-3">Email</th>
                        <th className="px-6 py-3">Puesto</th>
                        <th className="px-6 py-3">Centro</th>
                        <th className="px-6 py-3">Rol</th>
                        <th className="px-6 py-3">Estatus</th>
                        <th className="px-6 py-3">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map((usuario) => (
                        <tr key={usuario.id} className="bg-white border-b dark:bg-zinc-950 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-900">
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                {usuario.nombre} {usuario.apellidoPaterno} {usuario.apellidoMaterno}
                            </td>
                            <td className="px-6 py-4">{usuario.email}</td>
                            <td className="px-6 py-4">{usuario.puesto?.nombre || 'Sin Puesto'}</td>
                            <td className="px-6 py-4">{usuario.centro?.nombre || 'Sin Centro'}</td>
                            <td className="px-6 py-4">{usuario.rol.nombre}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${usuario.activo ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                    {usuario.activo ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                            <td className="px-6 py-4 flex gap-2">
                                <Link href={`/usuarios/${usuario.id}/editar`} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                    <Edit className="w-4 h-4" />
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
