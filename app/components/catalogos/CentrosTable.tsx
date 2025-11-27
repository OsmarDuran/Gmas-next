"use client";

import { Centro, Ubicacion } from "@prisma/client";
import { Edit, Trash2 } from "lucide-react";

type CentroCompleto = Centro & {
    ubicacion: Ubicacion;
};

interface CentrosTableProps {
    centros: CentroCompleto[];
    onEdit: (centro: CentroCompleto) => void;
    onDelete: (centro: CentroCompleto) => void;
}

export function CentrosTable({ centros, onEdit, onDelete }: CentrosTableProps) {
    if (centros.length === 0) {
        return (
            <div className="text-center py-10 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                <p className="text-gray-500 dark:text-gray-400">No hay centros de costo registrados</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-zinc-800 dark:text-gray-300">
                    <tr>
                        <th className="px-6 py-3">Nombre</th>
                        <th className="px-6 py-3">Ubicación</th>
                        <th className="px-6 py-3">Notas</th>
                        <th className="px-6 py-3 w-32 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {centros.map((centro) => (
                        <tr key={centro.id} className="border-b dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                            <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">
                                {centro.nombre}
                            </td>
                            <td className="px-6 py-3 text-gray-700 dark:text-gray-300">
                                {centro.ubicacion.nombre}
                            </td>
                            <td className="px-6 py-3 text-gray-500 dark:text-gray-400">
                                {centro.notas || "-"}
                            </td>
                            <td className="px-6 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => onEdit(centro)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
                                        title="Editar"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(centro)}
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
