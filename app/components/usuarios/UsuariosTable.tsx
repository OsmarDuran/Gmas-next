import { Usuario, Rol, Puesto, Centro, Lider } from "@prisma/client";
import Link from "next/link";
import { Edit2, User, Mail, Briefcase, Building2, Shield, Circle } from "lucide-react";

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
    if (usuarios.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-dashed border-gray-300 dark:border-zinc-700">
                <div className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-full mb-4">
                    <User className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No se encontraron usuarios</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
                    Intenta ajustar los filtros de búsqueda o agrega un nuevo usuario.
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
                            <th className="px-6 py-4">Usuario</th>
                            <th className="px-6 py-4">Puesto / Centro</th>
                            <th className="px-6 py-4">Rol</th>
                            <th className="px-6 py-4">Estatus</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {usuarios.map((usuario) => (
                            <tr key={usuario.id} className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors duration-200">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {usuario.nombre} {usuario.apellidoPaterno} {usuario.apellidoMaterno}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                {usuario.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                                            <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                                            {usuario.puesto?.nombre || 'Sin Puesto'}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                            <Building2 className="w-3.5 h-3.5 text-gray-400" />
                                            {usuario.centro?.nombre || 'Sin Centro'}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded w-fit text-xs font-medium">
                                        <Shield className="w-3 h-3 text-gray-400" />
                                        {usuario.rol.nombre}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge active={usuario.activo} />
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link
                                            href={`/usuarios/${usuario.id}/editar`}
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
                {usuarios.map((usuario) => (
                    <div key={usuario.id} className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        {usuario.nombre} {usuario.apellidoPaterno}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {usuario.email}
                                    </div>
                                </div>
                            </div>
                            <StatusBadge active={usuario.activo} />
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-gray-50 dark:bg-zinc-800/50 p-2 rounded-lg">
                                <span className="text-xs text-gray-400 block mb-1">Puesto</span>
                                <span className="text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                    <Briefcase className="w-3 h-3" />
                                    {usuario.puesto?.nombre || "-"}
                                </span>
                            </div>
                            <div className="bg-gray-50 dark:bg-zinc-800/50 p-2 rounded-lg">
                                <span className="text-xs text-gray-400 block mb-1">Centro</span>
                                <span className="text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                    <Building2 className="w-3 h-3" />
                                    {usuario.centro?.nombre || "-"}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-zinc-800">
                            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded w-fit text-xs font-medium">
                                <Shield className="w-3 h-3 text-gray-400" />
                                {usuario.rol.nombre}
                            </div>
                            <Link
                                href={`/usuarios/${usuario.id}/editar`}
                                className="w-10 h-10 flex items-center justify-center text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 rounded-lg"
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

function StatusBadge({ active }: { active: boolean }) {
    const style = active
        ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
        : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20';

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
            <Circle className="w-1.5 h-1.5 mr-1.5 fill-current" />
            {active ? 'Activo' : 'Inactivo'}
        </span>
    );
}
