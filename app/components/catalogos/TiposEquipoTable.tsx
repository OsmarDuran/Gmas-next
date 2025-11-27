"use client";

import { TipoEquipo } from "@prisma/client";
import { Edit, Trash2 } from "lucide-react";

interface TiposEquipoTableProps {
    tipos: TipoEquipo[];
    onEdit: (tipo: TipoEquipo) => void;
    onDelete: (tipo: TipoEquipo) => void;
}

export function TiposEquipoTable({ tipos, onEdit, onDelete }: TiposEquipoTableProps) {
    if (tipos.length === 0) {
        return (
            <div className="text-center py-10 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                <p className="text-gray-500 dark:text-gray-400">No hay tipos de equipo registrados</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-zinc-800 dark:text-gray-300">
                    <tr>
                        <th className="px-6 py-3">Nombre</th>
                        <th className="px-6 py-3 w-32 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {tipos.map((tipo) => (
                        <tr key={tipo.id} className="border-b dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                            <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">
                                {tipo.nombre}
                            </td>
                            <td className="px-6 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => onEdit(tipo)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
                                        title="Editar"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(tipo)}
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
