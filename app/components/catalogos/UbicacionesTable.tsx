"use client";

import { Ubicacion, Estatus } from "@prisma/client";
import { Edit, Trash2 } from "lucide-react";

type UbicacionCompleta = Ubicacion & {
    estatus: Estatus;
};

interface UbicacionesTableProps {
    ubicaciones: UbicacionCompleta[];
    onEdit: (ubicacion: UbicacionCompleta) => void;
    onDelete: (ubicacion: UbicacionCompleta) => void;
}

export function UbicacionesTable({ ubicaciones, onEdit, onDelete }: UbicacionesTableProps) {
    if (ubicaciones.length === 0) {
        return (
            <div className="text-center py-10 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                <p className="text-gray-500 dark:text-gray-400">No hay ubicaciones registradas</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-zinc-800 dark:text-gray-300">
                    <tr>
                        <th className="px-6 py-3">Nombre</th>
                        <th className="px-6 py-3">Notas</th>
                        <th className="px-6 py-3 w-32 text-center">Estatus</th>
                        <th className="px-6 py-3 w-32 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {ubicaciones.map((ubicacion) => (
                        <tr key={ubicacion.id} className="border-b dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                            <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">
                                {ubicacion.nombre}
                            </td>
                            <td className="px-6 py-3 text-gray-500 dark:text-gray-400">
                                {ubicacion.notas || "-"}
                            </td>
                            <td className="px-6 py-3 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${ubicacion.estatus.nombre === "Activo"
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                    }`}>
                                    {ubicacion.estatus.nombre}
                                </span>
                            </td>
                            <td className="px-6 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => onEdit(ubicacion)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
                                        title="Editar"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(ubicacion)}
                                        className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
