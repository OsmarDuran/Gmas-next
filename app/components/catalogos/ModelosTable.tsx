"use client";

import { Modelo, Marca, TipoEquipo } from "@prisma/client";
import { Edit, Trash2 } from "lucide-react";

type ModeloCompleto = Modelo & {
    marcaTipo: {
        marca: Marca;
        tipo: TipoEquipo;
    };
};

interface ModelosTableProps {
    modelos: ModeloCompleto[];
    onEdit: (modelo: Modelo) => void;
    onDelete: (modelo: Modelo) => void;
}

export function ModelosTable({ modelos, onEdit, onDelete }: ModelosTableProps) {
    if (modelos.length === 0) {
        return (
            <div className="text-center py-10 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                <p className="text-gray-500 dark:text-gray-400">No hay modelos registrados</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-zinc-800 dark:text-gray-300">
                    <tr>
                        <th className="px-6 py-3">Nombre</th>
                        <th className="px-6 py-3">Marca</th>
                        <th className="px-6 py-3">Tipo de Equipo</th>
                        <th className="px-6 py-3">Notas</th>
                        <th className="px-6 py-3 w-24 text-center">Estado</th>
                        <th className="px-6 py-3 w-32 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {modelos.map((modelo) => (
                        <tr key={modelo.id} className="border-b dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                            <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">
                                {modelo.nombre}
                            </td>
                            <td className="px-6 py-3 text-gray-700 dark:text-gray-300">
                                {modelo.marcaTipo.marca.nombre}
                            </td>
                            <td className="px-6 py-3 text-gray-700 dark:text-gray-300">
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-md text-xs font-medium">
                                    {modelo.marcaTipo.tipo.nombre}
                                </span>
                            </td>
                            <td className="px-6 py-3 text-gray-500 dark:text-gray-400">
                                {modelo.notas || "-"}
                            </td>
                            <td className="px-6 py-3 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${modelo.activo
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                    }`}>
                                    {modelo.activo ? "Activo" : "Inactivo"}
                                </span>
                            </td>
                            <td className="px-6 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => onEdit(modelo)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
                                        title="Editar"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(modelo)}
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
